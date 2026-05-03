const bookingService = require('../services/booking.service');
const paymentService = require('../services/payment.service');
const { query } = require('../config/db');
const { AppError } = require('../middleware/error.middleware');
const { env } = require('../config/env');

/**
 * Create a Razorpay order for a pending reservation
 * POST /api/payments/create-order
 * Body: { reservation_id }
 */
const createOrder = async (req, res, next) => {
  try {
    const { reservation_id } = req.body;
    const userId = req.user.user_id;

    if (!reservation_id) {
      throw new AppError('Reservation ID is required', 400);
    }

    // Get reservation details
    const reservationResult = await query(
      'SELECT id, customer_id, slot_id, facility_id, frozen_price FROM reservations WHERE id = $1',
      [reservation_id]
    );

    if (reservationResult.rows.length === 0) {
      throw new AppError('Reservation not found', 404);
    }

    const reservation = reservationResult.rows[0];

    const facilityResult = await query(
      'SELECT base_price, advance_payment FROM facilities WHERE id = $1',
      [reservation.facility_id]
    );
    const facility = facilityResult.rows[0];

    // Resolve amount from reservation first, then fallback to facility base price.
    let effectiveAmount = Number(reservation.frozen_price || 0);
    if (effectiveAmount <= 0) {
      effectiveAmount = Number(facility?.base_price || 0);
    }

    if (effectiveAmount <= 0) {
      throw new AppError('This reservation does not require payment', 400);
    }

    // Verify user owns this reservation
    if (reservation.customer_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Check if payment already exists
    const existingPayment = await query(
      'SELECT id, order_id, status FROM payments WHERE reservation_id = $1',
      [reservation_id]
    );

    let payment = null;
    let order = null;

    if (existingPayment.rows.length > 0) {
      payment = existingPayment.rows[0];
      // If payment already has a Razorpay order, just return it
      if (payment.order_id && payment.status === 'pending') {
        return res.status(200).json({
          success: true,
          data: {
            order_id: payment.order_id,
            amount: Math.round(effectiveAmount * 100),
            currency: 'INR',
            key_id: env.RAZORPAY_KEY_ID,
            demo: paymentService.isDemoMode(),
          },
        });
      }
    }

    // Create Razorpay order
    const amountInPaise = Math.round(effectiveAmount * 100);
    order = await paymentService.createRazorpayOrder(amountInPaise, `res_${reservation_id}`);

    // Save or update payment record
    if (payment) {
      await query(
        'UPDATE payments SET order_id = $1, status = $2 WHERE id = $3',
        [order.id, 'pending', payment.id]
      );
    } else {
      await query(
        `INSERT INTO payments (reservation_id, amount, currency, status, order_id, gateway)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [reservation_id, effectiveAmount, 'INR', 'pending', order.id, 'razorpay']
      );
    }

    res.status(200).json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: env.RAZORPAY_KEY_ID,
        demo: paymentService.isDemoMode(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify Razorpay payment signature and confirm booking
 * POST /api/payments/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
const verifyPaymentAndConfirm = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError('Missing payment parameters', 400);
    }

    // Verify signature
    const isValid = paymentService.verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      throw new AppError('Payment signature verification failed', 400);
    }

    // Confirm booking
    const result = await bookingService.verifyAndConfirmBooking(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const cancelPendingPayment = async (req, res, next) => {
  try {
    const result = await bookingService.releasePendingPaymentReservation({
      user_id: req.user.user_id,
      razorpay_order_id: req.body.razorpay_order_id,
      reservation_id: req.body.reservation_id,
      reason: req.body.reason || 'cancelled',
    });

    res.status(200).json({
      success: true,
      message: 'Payment cancelled and booking hold released.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Razorpay Webhook Handler
 * POST /api/payments/webhook
 */
const handleWebhook = async (req, res, next) => {
  try {
    const rawBody = req.rawBody;
    const signature = req.headers['x-razorpay-signature'];

    if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
      throw new AppError('Webhook signature verification failed', 401);
    }

    const event = req.body;

    if (event.event === 'payment.authorized' || event.event === 'payment.captured') {
      const { order_id, id: payment_id } = event.payload.payment.entity;

      // Confirm booking via order ID
      await bookingService.confirmBookingByOrderId(order_id, payment_id);

      // Update payment status in DB
      await query(
        `UPDATE payments SET gateway_txn_id = $1, status = 'success', paid_at = NOW()
         WHERE order_id = $2`,
        [payment_id, order_id]
      );
    }

    if (event.event === 'payment.failed') {
      const { order_id, id: payment_id } = event.payload.payment.entity;

      await query(
        `UPDATE payments SET gateway_txn_id = $1, status = 'failed'
         WHERE order_id = $2`,
        [payment_id, order_id]
      );
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    // Return 200 so Razorpay doesn't retry
    res.status(200).json({ received: true });
  }
};

/**
 * Get payment status for a reservation
 * GET /api/payments/status/:reservation_id
 */
const getPaymentStatus = async (req, res, next) => {
  try {
    const { reservation_id } = req.params;
    const userId = req.user.user_id;

    // Verify user owns this reservation
    const reservationResult = await query(
      'SELECT customer_id FROM reservations WHERE id = $1',
      [reservation_id]
    );

    if (reservationResult.rows.length === 0) {
      throw new AppError('Reservation not found', 404);
    }

    if (reservationResult.rows[0].customer_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const paymentResult = await query(
      'SELECT id, status, order_id, gateway_txn_id, paid_at FROM payments WHERE reservation_id = $1',
      [reservation_id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: { status: 'no_payment' },
      });
    }

    res.status(200).json({
      success: true,
      data: paymentResult.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  verifyPaymentAndConfirm,
  cancelPendingPayment,
  handleWebhook,
  getPaymentStatus,
};
