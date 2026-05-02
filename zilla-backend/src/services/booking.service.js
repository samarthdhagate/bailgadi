const crypto = require('crypto');
const { query, pool } = require('../config/db');
const { redisSetNX, redisGet, redisDel, isRedisAvailable, redisEnabled } = require('../config/redis');
const { env } = require('../config/env');
const { countOverlapping } = require('../utils/overlap');
const { AppError } = require('../middleware/error.middleware');
const notificationService = require('./notification.service');
const { createRazorpayOrder, verifyRazorpaySignature } = require('./payment.service');

const LOCK_TTL_SECONDS = 600; // 10 minutes

/**
 * Generate 8-character alphanumeric confirmation code.
 */
const generateConfirmationCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};


/**
 * Lock a slot via Redis.
 * Key pattern: slot:{provider_id}:{start_time_iso}
 *
 * @param {string} user_id
 * @param {string} service_id
 * @param {string} start_time - ISO string
 * @returns {{ locked: boolean, expires_in: number, payment_order?: object }}
 */
const lockSlot = async (user_id, service_id, start_time) => {
  // Log if Redis is expected but unavailable, but don't block the user.
  if (redisEnabled && !isRedisAvailable()) {
    console.warn('⚠️  Redis lock skipped: Connection unavailable. Falling back to DB-only check.');
  }

  // Fetch service to get provider_id and price
  const serviceResult = await query(
    'SELECT provider_id, duration_min, capacity, price, name, advance_payment FROM services WHERE id = $1',
    [service_id]
  );

  if (serviceResult.rows.length === 0) {
    throw new AppError('Service not found.', 404, 'SERVICE_NOT_FOUND');
  }

  const { provider_id, duration_min, capacity, price, name, advance_payment } = serviceResult.rows[0];

  // Validate slot is in the future
  const slotStart = new Date(start_time);
  if (slotStart <= new Date()) {
    throw new AppError('Cannot lock a slot in the past.', 400, 'SLOT_IN_PAST');
  }

  const slotStartIso = slotStart.toISOString();
  const slotEnd = new Date(slotStart.getTime() + duration_min * 60 * 1000);

  // Quick DB check: fetch all bookings for the day and check overlaps
  const dayStart = new Date(slotStart);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const bookingsResult = await query(
    `SELECT start_time, end_time FROM bookings
     WHERE provider_id = $1 AND status IN ('booked', 'confirmed')
       AND start_time >= $2 AND start_time < $3`,
    [provider_id, dayStart.toISOString(), dayEnd.toISOString()]
  );

  const overlapCount = countOverlapping(slotStart.toISOString(), slotEnd.toISOString(), bookingsResult.rows);

  if (overlapCount >= capacity) {
    throw new AppError('This slot is fully booked.', 409, 'SLOT_FULL');
  }

  // Attempt Redis lock only if available
  if (isRedisAvailable()) {
    const lockKey = `slot:${provider_id}:${slotStartIso}`;
    const result = await redisSetNX(lockKey, user_id, LOCK_TTL_SECONDS);

    if (result === null || result === 0) {
      const currentHolder = await redisGet(lockKey);
      if (currentHolder !== user_id) {
        throw new AppError('This slot is currently held by another user.', 409, 'SLOT_LOCKED');
      }
    }
  }

  let response = { locked: true, expires_in: LOCK_TTL_SECONDS };

  // If service requires payment, create Razorpay order
  if (advance_payment && price > 0) {
    const amountInPaise = Math.round(price * 100);
    const order = await createRazorpayOrder(amountInPaise, `receipt_${Date.now()}`);
    
    // Store pending payment in DB
    await query(
      `INSERT INTO payments (razorpay_order_id, amount, currency, status)
       VALUES ($1, $2, $3, $4)`,
      [order.id, price, 'INR', 'pending']
    );

    response.payment_order = {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: env.RAZORPAY_KEY_ID
    };
  }

  return response;
};

/**
 * Verify payment and confirm booking atomically.
 */
const verifyAndConfirmBooking = async (user_id, paymentData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_details } = paymentData;
  const { service_id, start_time } = booking_details;

  // 1. Verify Signature
  const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    throw new AppError('Payment verification failed. Invalid signature.', 400, 'PAYMENT_VERIFICATION_FAILED');
  }

  // 2. Start Transaction
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // 3. Double check Redis Lock (only if Redis is available)
    const serviceRes = await dbClient.query('SELECT provider_id, duration_min, capacity, name FROM services WHERE id = $1', [service_id]);
    const { provider_id, duration_min, capacity } = serviceRes.rows[0];
    const lockKey = `slot:${provider_id}:${new Date(start_time).toISOString()}`;
    
    if (isRedisAvailable()) {
      const holder = await redisGet(lockKey);
      if (holder && holder !== user_id) {
        throw new AppError('Booking session expired or slot taken. Please try again.', 409, 'SESSION_EXPIRED');
      }
    }

    // 4. Final capacity check inside transaction
    const slotStart = new Date(start_time);
    const slotEnd = new Date(slotStart.getTime() + duration_min * 60 * 1000);
    
    const bookingsResult = await dbClient.query(
      `SELECT start_time, end_time FROM bookings
       WHERE provider_id = $1 AND status IN ('booked', 'confirmed')
         AND start_time >= $2 AND start_time < $3
       FOR UPDATE`, // Lock rows for consistency
      [provider_id, slotStart.toISOString(), slotEnd.toISOString()]
    );

    const overlapCount = countOverlapping(slotStart.toISOString(), slotEnd.toISOString(), bookingsResult.rows);
    if (overlapCount >= capacity) {
      throw new AppError('Capacity reached while processing payment.', 409, 'SLOT_FULL');
    }

    // 5. Create Booking
    const confirmationCode = generateConfirmationCode();
    const bookingRes = await dbClient.query(
      `INSERT INTO bookings (user_id, provider_id, service_id, start_time, end_time, status, confirmation_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [user_id, provider_id, service_id, slotStart.toISOString(), slotEnd.toISOString(), 'confirmed', confirmationCode]
    );

    const bookingId = bookingRes.rows[0].id;

    // 6. Update Payment Record
    await dbClient.query(
      `UPDATE payments 
       SET booking_id = $1, razorpay_payment_id = $2, razorpay_signature = $3, status = $4
       WHERE razorpay_order_id = $5`,
      [bookingId, razorpay_payment_id, razorpay_signature, 'success', razorpay_order_id]
    );

    await dbClient.query('COMMIT');

    // 7. Release Redis Lock
    await redisDel(lockKey);

    return { success: true, booking_id: bookingId, confirmation_code: confirmationCode };
  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  } finally {
    dbClient.release();
  }
};

/**
 * Create a booking with full atomic transaction.
 * Steps:
 *  1. Parse start_time, compute end_time
 *  2. Verify Redis lock (owned by this user)
 *  3. BEGIN transaction
 *  4. SELECT FOR UPDATE conflicting rows
 *  5. Re-run overlap check inside transaction
 *  6. Re-run capacity check inside transaction
 *  7. Generate confirmation_code
 *  8. INSERT INTO bookings
 *  9. COMMIT
 * 10. Release Redis lock
 * 11. Send confirmation email (non-blocking)
 * 12. Return booking record
 */
const createBooking = async (user_id, service_id, start_time, notes) => {
  // 1. Fetch service details
  const serviceResult = await query(
    `SELECT s.provider_id, s.duration_min, s.capacity, s.name AS service_name,
            s.manual_confirmation, s.advance_payment
     FROM services s WHERE s.id = $1`,
    [service_id]
  );

  if (serviceResult.rows.length === 0) {
    throw new AppError('Service not found.', 404, 'SERVICE_NOT_FOUND');
  }

  const service = serviceResult.rows[0];
  const { provider_id, duration_min, capacity, manual_confirmation, advance_payment } = service;

  const slotStart = new Date(start_time);
  const slotStartIso = slotStart.toISOString();
  const slotEnd = new Date(slotStart.getTime() + duration_min * 60 * 1000);

  // Validate future time
  if (slotStart <= new Date()) {
    throw new AppError('Cannot book a slot in the past.', 400, 'SLOT_IN_PAST');
  }

  // 2. Verify Redis lock (only if available).
  const lockKey = `slot:${provider_id}:${slotStartIso}`;
  if (isRedisAvailable()) {
    const lockHolder = await redisGet(lockKey);

    if (!lockHolder) {
      throw new AppError(
        'No active lock found. Your session may have expired. Please re-select the slot.',
        410,
        'LOCK_EXPIRED'
      );
    }

    if (lockHolder !== user_id) {
      throw new AppError('This slot is locked by another user.', 409, 'SLOT_LOCKED');
    }
  }

  // 3-9. Atomic transaction
  const client = await pool.connect();

  let committed = false;
  let booking = null;
  let initialStatus = 'pending';
  try {
    await client.query('BEGIN');

    // 4. SELECT FOR UPDATE — lock rows for the day
    const dayStart = new Date(slotStart);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const conflictResult = await client.query(
      `SELECT id, status, start_time, end_time FROM bookings
       WHERE provider_id = $1
         AND status IN ('booked', 'pending')
         AND start_time >= $2 AND start_time < $3
       FOR UPDATE`,
      [provider_id, dayStart.toISOString(), dayEnd.toISOString()]
    );

    // 5. Re-run overlap check.
    // Treat pending bookings as capacity-consuming so we can’t overbook during payment/manual confirmation.
    const capacityConsuming = conflictResult.rows.filter((r) => r.status === 'booked' || r.status === 'pending');
    const overlapCount = countOverlapping(slotStartIso, slotEnd.toISOString(), capacityConsuming);

    // 6. Capacity check
    if (overlapCount >= capacity) {
      throw new AppError(
        'This slot was booked by someone else while you had it locked. Please choose another slot.',
        409,
        'SLOT_TAKEN'
      );
    }

    // 7. Generate confirmation code
    const confirmation_code = generateConfirmationCode();

    // Determine initial status
    const paymentGatewayConfigured = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
    initialStatus = advance_payment && paymentGatewayConfigured
      ? 'pending'   // Needs payment first
      : manual_confirmation
        ? 'pending'  // Needs organiser confirmation
        : 'booked';  // Auto-confirmed

    // 8. INSERT booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, provider_id, service_id, start_time, end_time, status, confirmation_code, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, provider_id, service_id, slotStartIso, slotEnd.toISOString(), initialStatus, confirmation_code, notes]
    );

    // 9. COMMIT
    await client.query('COMMIT');
    committed = true;

    booking = bookingResult.rows[0];
  } catch (err) {
    if (!committed) {
      await client.query('ROLLBACK');
    }
    await redisDel(lockKey);
    throw err;
  } finally {
    client.release();
  }

  // 10. Release Redis lock
  await redisDel(lockKey);

  // 11. Send confirmation email (non-blocking, fire-and-forget)
  if (initialStatus === 'booked') {
    const userResult = await query('SELECT email FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length > 0) {
      notificationService.sendBookingConfirmation(userResult.rows[0].email, {
        ...booking,
        service_name: service.service_name,
      });
    }
  }

  // 12. Return booking
  return booking;
};

/**
 * Get customer's own bookings.
 */
const getMyBookings = async (user_id) => {
  const result = await query(
    `SELECT b.*, s.name AS service_name, u2.full_name AS provider_name
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN providers p ON b.provider_id = p.id
     JOIN users u2 ON p.user_id = u2.id
     WHERE b.user_id = $1
     ORDER BY b.start_time DESC`,
    [user_id]
  );
  return result.rows;
};

/**
 * Get provider's bookings (organiser view).
 */
const getProviderBookings = async (user_id) => {
  const providerResult = await query(
    'SELECT id FROM providers WHERE user_id = $1',
    [user_id]
  );

  if (providerResult.rows.length === 0) {
    throw new AppError('Provider profile not found.', 404, 'PROVIDER_NOT_FOUND');
  }

  const provider_id = providerResult.rows[0].id;

  const result = await query(
    `SELECT b.*, s.name AS service_name, u.full_name AS customer_name, u.email AS customer_email
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN users u ON b.user_id = u.id
     WHERE b.provider_id = $1
     ORDER BY b.start_time DESC`,
    [provider_id]
  );
  return result.rows;
};

/**
 * Get all bookings (admin view).
 */
const getAllBookings = async () => {
  const result = await query(
    `SELECT b.*, s.name AS service_name, u1.full_name AS customer_name,
            u2.full_name AS provider_name
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN users u1 ON b.user_id = u1.id
     JOIN providers p ON b.provider_id = p.id
     JOIN users u2 ON p.user_id = u2.id
     ORDER BY b.created_at DESC`
  );
  return result.rows;
};

/**
 * Cancel a booking.
 */
const cancelBooking = async (booking_id, user_id, user_role) => {
  // Fetch booking
  const bookingResult = await query(
    `SELECT b.*, u.email AS customer_email
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     WHERE b.id = $1`,
    [booking_id]
  );

  if (bookingResult.rows.length === 0) {
    throw new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND');
  }

  const booking = bookingResult.rows[0];

  // Authorization: customer can cancel their own, organiser can cancel provider's bookings
  if (user_role === 'customer' && booking.user_id !== user_id) {
    throw new AppError('You can only cancel your own bookings.', 403, 'FORBIDDEN');
  }

  if (user_role === 'organiser') {
    const providerResult = await query(
      'SELECT id FROM providers WHERE user_id = $1',
      [user_id]
    );
    if (providerResult.rows.length === 0 || providerResult.rows[0].id !== booking.provider_id) {
      throw new AppError('You can only cancel bookings for your services.', 403, 'FORBIDDEN');
    }
  }

  if (booking.status === 'cancelled') {
    throw new AppError('Booking is already cancelled.', 400, 'ALREADY_CANCELLED');
  }

  const result = await query(
    `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
    [booking_id]
  );

  // Send cancellation email
  notificationService.sendCancellationNotice(booking.customer_email, result.rows[0]);

  return result.rows[0];
};

/**
 * Reschedule a booking.
 */
const rescheduleBooking = async (booking_id, user_id, new_start_time) => {
  // Fetch booking + service
  const bookingResult = await query(
    `SELECT b.*, s.duration_min, s.capacity
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.id = $1 AND b.user_id = $2`,
    [booking_id, user_id]
  );

  if (bookingResult.rows.length === 0) {
    throw new AppError('Booking not found or you do not own this booking.', 404, 'BOOKING_NOT_FOUND');
  }

  const booking = bookingResult.rows[0];

  if (booking.status === 'cancelled') {
    throw new AppError('Cannot reschedule a cancelled booking.', 400, 'BOOKING_CANCELLED');
  }

  const newStart = new Date(new_start_time);
  const newEnd = new Date(newStart.getTime() + booking.duration_min * 60 * 1000);

  if (newStart <= new Date()) {
    throw new AppError('Cannot reschedule to a time in the past.', 400, 'SLOT_IN_PAST');
  }

  // Check for conflicts
  const dayStart = new Date(newStart);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const conflictResult = await query(
    `SELECT start_time, end_time FROM bookings
     WHERE provider_id = $1
       AND id != $2
       AND status = 'booked'
       AND start_time >= $3 AND start_time < $4`,
    [booking.provider_id, booking_id, dayStart.toISOString(), dayEnd.toISOString()]
  );

  const overlapCount = countOverlapping(newStart.toISOString(), newEnd.toISOString(), conflictResult.rows);

  if (overlapCount >= booking.capacity) {
    throw new AppError('The new time slot is not available.', 409, 'SLOT_TAKEN');
  }

  const result = await query(
    `UPDATE bookings
     SET start_time = $1, end_time = $2, status = 'rescheduled'
     WHERE id = $3
     RETURNING *`,
    [newStart.toISOString(), newEnd.toISOString(), booking_id]
  );

  return result.rows[0];
};

/**
 * Manually confirm a booking (organiser).
 */
const confirmBooking = async (booking_id, user_id) => {
  // Verify organiser owns the service
  const providerResult = await query(
    'SELECT id FROM providers WHERE user_id = $1',
    [user_id]
  );

  if (providerResult.rows.length === 0) {
    throw new AppError('Provider profile not found.', 404, 'PROVIDER_NOT_FOUND');
  }

  const provider_id = providerResult.rows[0].id;

  const result = await query(
    `UPDATE bookings
     SET status = 'booked'
     WHERE id = $1 AND provider_id = $2 AND status = 'pending'
     RETURNING *`,
    [booking_id, provider_id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Booking not found, already confirmed, or you do not own this booking.', 404, 'BOOKING_NOT_FOUND');
  }

  // Send confirmation email
  const userResult = await query(
    'SELECT email FROM users WHERE id = $1',
    [result.rows[0].user_id]
  );

  if (userResult.rows.length > 0) {
    const serviceResult = await query(
      'SELECT name FROM services WHERE id = $1',
      [result.rows[0].service_id]
    );
    notificationService.sendBookingConfirmation(userResult.rows[0].email, {
      ...result.rows[0],
      service_name: serviceResult.rows[0]?.name || 'N/A',
    });
  }

  return result.rows[0];
};

module.exports = {
  lockSlot,
  createBooking,
  getMyBookings,
  getProviderBookings,
  getAllBookings,
  cancelBooking,
  rescheduleBooking,
  confirmBooking,
};
