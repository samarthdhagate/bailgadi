/**
 * Payment service — Razorpay order creation, verification, and webhook handling.
 */

const crypto = require('crypto');
const Razorpay = require('razorpay');
const { query } = require('../config/db');
const { env } = require('../config/env');
const { redisDel } = require('../config/redis');
const { AppError } = require('../middleware/error.middleware');

// Initialize Razorpay instance (only if configured)
let razorpay = null;
if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Create a Razorpay order for a booking.
 */
const createOrder = async (user_id, booking_id, amount) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new AppError('Amount must be a positive integer in INR.', 400, 'INVALID_AMOUNT');
  }

  if (!razorpay) {
    throw new AppError('Payment gateway is not configured.', 503, 'PAYMENT_NOT_CONFIGURED');
  }

  // Verify booking exists and belongs to user
  const bookingResult = await query(
    `SELECT b.id, b.user_id, b.status, b.provider_id, b.start_time,
            s.name AS service_name
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.id = $1`,
    [booking_id]
  );

  if (bookingResult.rows.length === 0) {
    throw new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND');
  }

  const booking = bookingResult.rows[0];

  if (booking.user_id !== user_id) {
    throw new AppError('You do not own this booking.', 403, 'FORBIDDEN');
  }

  if (booking.status !== 'pending') {
    throw new AppError('Booking must be in pending status to create a payment order.', 400, 'INVALID_BOOKING_STATUS');
  }

  // Idempotency key prevents duplicate orders
  const idempotency_key = `${booking_id}_${Date.now()}`;

  // Check for existing pending payment
  const existingPayment = await query(
    `SELECT id, razorpay_order_id FROM payments
     WHERE booking_id = $1 AND status = 'pending'
     LIMIT 1`,
    [booking_id]
  );

  if (existingPayment.rows.length > 0) {
    // Return existing order
    return {
      order_id: existingPayment.rows[0].razorpay_order_id,
      amount: existingPayment.rows[0].amount,
      currency: 'INR',
      key_id: env.RAZORPAY_KEY_ID,
    };
  }

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: amount * 100, // Razorpay uses paise (1 INR = 100 paise)
    currency: 'INR',
    receipt: `booking_${booking_id}`,
    notes: {
      booking_id,
      service_name: booking.service_name,
    },
  });

  // Insert payment record
  await query(
    `INSERT INTO payments (booking_id, razorpay_order_id, amount, currency, status, idempotency_key)
     VALUES ($1, $2, $3, $4, 'pending', $5)`,
    [booking_id, order.id, amount, 'INR', idempotency_key]
  );

  return {
    order_id: order.id,
    amount,
    currency: 'INR',
    key_id: env.RAZORPAY_KEY_ID,
  };
};

/**
 * Verify Razorpay payment signature.
 */
const verifyPayment = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  // Verify HMAC signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(razorpay_signature, 'hex');
  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new AppError('Invalid payment signature.', 400, 'INVALID_SIGNATURE');
  }

  // Update payment record
  const paymentResult = await query(
    `UPDATE payments
     SET razorpay_payment_id = $1, status = 'success'
     WHERE razorpay_order_id = $2
     RETURNING *`,
    [razorpay_payment_id, razorpay_order_id]
  );

  if (paymentResult.rows.length === 0) {
    throw new AppError('Payment record not found.', 404, 'PAYMENT_NOT_FOUND');
  }

  const payment = paymentResult.rows[0];

  // Update booking status to 'booked'
  await query(
    `UPDATE bookings SET status = 'booked' WHERE id = $1`,
    [payment.booking_id]
  );

  return { message: 'Payment verified successfully.', payment };
};

/**
 * Handle Razorpay webhook events.
 */
const handleWebhook = async (rawBody, signature) => {
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');
  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new AppError('Invalid webhook signature.', 400, 'INVALID_WEBHOOK_SIGNATURE');
  }

  const event = JSON.parse(rawBody);
  const eventType = event.event;

  if (eventType === 'payment.captured') {
    const paymentEntity = event.payload.payment.entity;
    const razorpay_order_id = paymentEntity.order_id;
    const razorpay_payment_id = paymentEntity.id;

    // Update payment
    const paymentResult = await query(
      `UPDATE payments
       SET razorpay_payment_id = $1, status = 'success'
       WHERE razorpay_order_id = $2 AND status = 'pending'
       RETURNING *`,
      [razorpay_payment_id, razorpay_order_id]
    );

    if (paymentResult.rows.length > 0) {
      // Update booking status
      await query(
        `UPDATE bookings SET status = 'booked' WHERE id = $1`,
        [paymentResult.rows[0].booking_id]
      );
    }
  } else if (eventType === 'payment.failed') {
    const paymentEntity = event.payload.payment.entity;
    const razorpay_order_id = paymentEntity.order_id;

    // Update payment status
    const paymentResult = await query(
      `UPDATE payments SET status = 'failed'
       WHERE razorpay_order_id = $1
       RETURNING *`,
      [razorpay_order_id]
    );

    if (paymentResult.rows.length > 0) {
      const payment = paymentResult.rows[0];

      // Get booking to release Redis lock
      const bookingResult = await query(
        'SELECT provider_id, start_time FROM bookings WHERE id = $1',
        [payment.booking_id]
      );

      if (bookingResult.rows.length > 0) {
        const { provider_id, start_time } = bookingResult.rows[0];
        const lockKey = `slot:${provider_id}:${new Date(start_time).toISOString()}`;
        await redisDel(lockKey);
      }
    }
  }

  return { received: true };
};

module.exports = { createOrder, verifyPayment, handleWebhook };
