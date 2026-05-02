const crypto = require('crypto');
const { query, pool } = require('../config/db');
const { redisSetNX, redisGet, redisDel, isRedisAvailable, redisEnabled } = require('../config/redis');
const { env } = require('../config/env');
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
 * Lock a slot via Redis and create a DB reservation.
 * Aligned with v5 schema: facilities -> time_slots -> reservations.
 */
const lockSlot = async (user_id, facility_id, start_time, attendee_count = 1) => {
  // Validate UUID format to prevent DB crash
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(facility_id)) {
    throw new AppError('Invalid service ID format. Please use a valid service.', 400, 'INVALID_SERVICE_ID');
  }

  const slotStart = new Date(start_time);
  if (slotStart <= new Date()) {
    throw new AppError('Cannot lock a slot in the past.', 400, 'SLOT_IN_PAST');
  }

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // 1. Get or create the time_slot for this facility/time
    let slotResult = await dbClient.query(
      `SELECT id, total_capacity, confirmed_count, reserved_count, status, frozen_price 
       FROM time_slots 
       WHERE facility_id = $1 AND slot_start = $2 FOR UPDATE`,
      [facility_id, slotStart.toISOString()]
    );

    let slot;
    if (slotResult.rows.length === 0) {
      const facilityRes = await dbClient.query(
        'SELECT duration_mins, max_capacity, base_price FROM facilities WHERE id = $1',
        [facility_id]
      );
      if (facilityRes.rows.length === 0) throw new AppError('Facility not found.', 404);
      
      const { duration_mins, max_capacity, base_price } = facilityRes.rows[0];
      const slotEnd = new Date(slotStart.getTime() + duration_mins * 60 * 1000);
      
      const newSlotRes = await dbClient.query(
        `INSERT INTO time_slots (facility_id, slot_start, slot_end, total_capacity, frozen_price)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [facility_id, slotStart.toISOString(), slotEnd.toISOString(), max_capacity, base_price]
      );
      slot = newSlotRes.rows[0];
    } else {
      slot = slotResult.rows[0];
    }

    if (slot.status !== 'available') {
      throw new AppError(`Slot is ${slot.status}.`, 409, 'SLOT_UNAVAILABLE');
    }

    // Check if user already has an active reservation for this slot
    const existingRes = await dbClient.query(
      'SELECT id, frozen_price, expires_at FROM reservations WHERE customer_id = $1 AND slot_id = $2 AND status = \'holding\'',
      [user_id, slot.id]
    );

    if (existingRes.rows.length > 0) {
      // User already has a hold, allow them to re-use it
      const reservation = existingRes.rows[0];
      // Check for existing payment
      const paymentRes = await dbClient.query(
        'SELECT order_id, amount, currency FROM payments WHERE reservation_id = $1 AND status = \'pending\'',
        [reservation.id]
      );

      await dbClient.query('COMMIT');
      
      const response = { 
        locked: true, 
        reservation_id: reservation.id, 
        expires_in: Math.max(0, Math.floor((new Date(reservation.expires_at) - new Date()) / 1000)),
        reused: true
      };

      if (paymentRes.rows.length > 0) {
        const p = paymentRes.rows[0];
        response.payment_order = {
          id: p.order_id,
          amount: Math.round(p.amount * 100),
          currency: p.currency,
          key_id: process.env.RAZORPAY_KEY_ID
        };
      }

      return response;
    }

    if (slot.confirmed_count + slot.reserved_count + Number(attendee_count) > slot.total_capacity) {
      throw new AppError('Slot is fully booked or insufficient capacity.', 409, 'SLOT_FULL');
    }

    // 2. Redis Lock
    const lockKey = `slot:lock:${slot.id}:${user_id}`;
    if (isRedisAvailable()) {
      const result = await redisSetNX(lockKey, user_id, LOCK_TTL_SECONDS);
      if (result === 0) {
        // Safe to ignore if DB check passed
      }
    }

    // 3. Create DB Reservation
    const idempotencyKey = `lock:${slot.id}:${user_id}:${Date.now()}`;
    const reservationRes = await dbClient.query(
      `INSERT INTO reservations (slot_id, customer_id, facility_id, attendee_count, idempotency_key, redis_key)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, frozen_price`,
      [slot.id, user_id, facility_id, attendee_count, idempotencyKey, lockKey]
    );

    const reservation = reservationRes.rows[0];
    await dbClient.query('COMMIT');

    let response = { 
      locked: true, 
      reservation_id: reservation.id, 
      expires_in: LOCK_TTL_SECONDS 
    };

    // 4. Handle Advance Payment if needed
    const facilityPaymentRes = await dbClient.query(
      'SELECT advance_payment FROM facilities WHERE id = $1',
      [facility_id]
    );
    
    if (facilityPaymentRes.rows[0]?.advance_payment && reservation.frozen_price > 0) {
      const amountInPaise = Math.round(reservation.frozen_price * 100);
      const order = await createRazorpayOrder(amountInPaise, `res_${reservation.id}`);
      
      await dbClient.query(
        `INSERT INTO payments (reservation_id, amount, currency, status, order_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [reservation.id, reservation.frozen_price, 'INR', 'pending', order.id]
      );

      response.payment_order = {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: env.RAZORPAY_KEY_ID
      };
    }

    return response;
  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  } finally {
    dbClient.release();
  }
};

/**
 * Verify payment and confirm booking.
 */
const verifyAndConfirmBooking = async (user_id, paymentData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Missing payment parameters.', 400, 'MISSING_PAYMENT_PARAMS');
  }

  const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    throw new AppError('Payment verification failed.', 400, 'PAYMENT_VERIFICATION_FAILED');
  }

  return await confirmBookingByOrderId(razorpay_order_id, razorpay_payment_id, user_id);
};

/**
 * Core confirmation logic used by both controller and webhook.
 * Idempotent: If booking already exists, returns it.
 */
const confirmBookingByOrderId = async (order_id, payment_id, user_id = null) => {
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // 1. Find the payment and associated reservation
    const paymentRes = await dbClient.query(
      'SELECT id, reservation_id, amount, status, booking_id FROM payments WHERE order_id = $1 FOR UPDATE',
      [order_id]
    );

    if (paymentRes.rows.length === 0) throw new AppError('Payment record not found.', 404);
    const payment = paymentRes.rows[0];

    // If already successful, return existing info (idempotency)
    if (payment.status === 'success' && payment.booking_id) {
      const bRes = await dbClient.query('SELECT id, confirmation_code FROM bookings WHERE id = $1', [payment.booking_id]);
      await dbClient.query('COMMIT');
      return { success: true, booking_id: bRes.rows[0]?.id, confirmation_code: bRes.rows[0]?.confirmation_code };
    }

    const reservationRes = await dbClient.query(
      'SELECT * FROM reservations WHERE id = $1 FOR UPDATE',
      [payment.reservation_id]
    );
    if (reservationRes.rows.length === 0) throw new AppError('Reservation not found.', 404);
    const reservation = reservationRes.rows[0];

    // 2. Create the booking record
    const confirmationCode = generateConfirmationCode();
    const finalUserId = user_id || reservation.customer_id;

    const bookingRes = await dbClient.query(
      `INSERT INTO bookings (customer_id, facility_id, slot_id, reservation_id, attendee_count, total_price, confirmation_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (reservation_id) DO UPDATE SET reservation_id = EXCLUDED.reservation_id 
       RETURNING id, confirmation_code`,
      [finalUserId, reservation.facility_id, reservation.slot_id, reservation.id, reservation.attendee_count, payment.amount, confirmationCode]
    );

    const bookingId = bookingRes.rows[0].id;

    // 3. Update payment record
    await dbClient.query(
      `UPDATE payments SET booking_id = $1, gateway_txn_id = $2, status = 'success', paid_at = NOW()
       WHERE id = $3`,
      [bookingId, payment_id, payment.id]
    );

    await dbClient.query('COMMIT');
    
    if (isRedisAvailable()) {
      await redisDel(reservation.redis_key);
    }

    return { success: true, booking_id: bookingId, confirmation_code: bookingRes.rows[0].confirmation_code };
  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  } finally {
    dbClient.release();
  }
};

/**
 * Create a direct booking (for free services or cases where payment is handled differently).
 */
const createBooking = async (user_id, facility_id, start_time, notes) => {
  // First, we need a reservation (lock)
  const lockResult = await lockSlot(user_id, facility_id, start_time);
  
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    const reservationRes = await dbClient.query(
      'SELECT * FROM reservations WHERE id = $1 FOR UPDATE',
      [lockResult.reservation_id]
    );
    const reservation = reservationRes.rows[0];

    const confirmationCode = generateConfirmationCode();
    const bookingRes = await dbClient.query(
      `INSERT INTO bookings (customer_id, facility_id, slot_id, reservation_id, attendee_count, total_price, answers, confirmation_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, facility_id, reservation.slot_id, reservation.id, reservation.attendee_count, reservation.frozen_price, notes || '{}', confirmationCode]
    );

    await dbClient.query('COMMIT');

    if (isRedisAvailable()) {
      await redisDel(reservation.redis_key);
    }

    return bookingRes.rows[0];
  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  } finally {
    dbClient.release();
  }
};

const getMyBookings = async (user_id) => {
  const result = await query(
    `SELECT b.*, f.name AS service_name, ts.slot_start, ts.slot_end,
            p.gateway_txn_id, p.amount AS paid_amount, p.status AS payment_status
     FROM bookings b
     JOIN facilities f ON b.facility_id = f.id
     JOIN time_slots ts ON b.slot_id = ts.id
     LEFT JOIN payments p ON p.booking_id = b.id
     WHERE b.customer_id = $1
     ORDER BY ts.slot_start DESC`,
    [user_id]
  );
  return result.rows;
};

const getProviderBookings = async (user_id) => {
  const result = await query(
    `SELECT b.*, f.name AS service_name, u.full_name AS customer_name, u.email AS customer_email, ts.slot_start, ts.slot_end
     FROM bookings b
     JOIN facilities f ON b.facility_id = f.id
     JOIN users u ON b.customer_id = u.id
     JOIN time_slots ts ON b.slot_id = ts.id
     WHERE f.organiser_id = $1
     ORDER BY ts.slot_start DESC`,
    [user_id]
  );
  return result.rows;
};

const getAllBookings = async () => {
  const result = await query(
    `SELECT b.*, f.name AS service_name, u.full_name AS customer_name, ts.slot_start, ts.slot_end
     FROM bookings b
     JOIN facilities f ON b.facility_id = f.id
     JOIN users u ON b.customer_id = u.id
     JOIN time_slots ts ON b.slot_id = ts.id
     ORDER BY ts.slot_start DESC`
  );
  return result.rows;
};

const cancelBooking = async (booking_id, user_id, user_role) => {
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    const bookingRes = await dbClient.query(
      `SELECT b.*, f.organiser_id FROM bookings b 
       JOIN facilities f ON b.facility_id = f.id 
       WHERE b.id = $1 FOR UPDATE`,
      [booking_id]
    );

    if (bookingRes.rows.length === 0) throw new AppError('Booking not found.', 404);
    const booking = bookingRes.rows[0];

    if (user_role === 'customer' && booking.customer_id !== user_id) {
      throw new AppError('Forbidden.', 403);
    }
    if (user_role === 'organiser' && booking.organiser_id !== user_id) {
      throw new AppError('Forbidden.', 403);
    }

    const result = await dbClient.query(
      "UPDATE bookings SET status = 'cancelled', cancelled_at = NOW() WHERE id = $1 RETURNING *",
      [booking_id]
    );

    await dbClient.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  } finally {
    dbClient.release();
  }
};

const rescheduleBooking = async (booking_id, user_id, new_start_time) => {
  // Use the stored procedure if possible, but let's implement it in JS for flexibility
  // For brevity, we'll implement a basic version that leverages our existing logic
  const bookingRes = await query('SELECT facility_id FROM bookings WHERE id = $1', [booking_id]);
  if (bookingRes.rows.length === 0) throw new AppError('Booking not found.', 404);
  
  const facility_id = bookingRes.rows[0].facility_id;
  
  // 1. Lock the new slot
  const lockResult = await lockSlot(user_id, facility_id, new_start_time);
  
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');
    
    // 2. Call the reschedule procedure or perform manual steps
    const result = await dbClient.query(
      'SELECT reschedule_booking($1, (SELECT slot_id FROM reservations WHERE id = $2), $2)',
      [booking_id, lockResult.reservation_id]
    );
    
    await dbClient.query('COMMIT');
    return { id: result.rows[0].reschedule_booking };
  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  } finally {
    dbClient.release();
  }
};

const confirmBooking = async (booking_id, user_id) => {
  const result = await query(
    `UPDATE bookings SET status = 'confirmed', confirmed_at = NOW() 
     WHERE id = $1 AND facility_id IN (SELECT id FROM facilities WHERE organiser_id = $2)
     RETURNING *`,
    [booking_id, user_id]
  );
  
  if (result.rows.length === 0) throw new AppError('Booking not found or unauthorized.', 404);
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
  verifyAndConfirmBooking
};
