/**
 * Booking service — slot locking, atomic booking creation, and booking management.
 * Implements the two-layer concurrency model: Redis lock + DB transaction.
 */

const crypto = require('crypto');
const { query, pool } = require('../config/db');
const { redisSetNX, redisGet, redisDel } = require('../config/redis');
const { intervalsOverlap, countOverlapping } = require('../utils/overlap');
const { AppError } = require('../middleware/error.middleware');
const { sendBookingConfirmation, sendCancellationNotice } = require('../utils/mailer');

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
 * SET key user_id NX EX 600
 *
 * @param {string} user_id
 * @param {string} service_id
 * @param {string} start_time - ISO string
 * @returns {{ locked: boolean, expires_in: number }}
 */
const lockSlot = async (user_id, service_id, start_time) => {
  // Fetch service to get provider_id
  const serviceResult = await query(
    'SELECT provider_id, duration_min, capacity FROM services WHERE id = $1',
    [service_id]
  );

  if (serviceResult.rows.length === 0) {
    throw new AppError('Service not found.', 404, 'SERVICE_NOT_FOUND');
  }

  const { provider_id, duration_min, capacity } = serviceResult.rows[0];

  // Validate slot is in the future
  const slotStart = new Date(start_time);
  if (slotStart <= new Date()) {
    throw new AppError('Cannot lock a slot in the past.', 400, 'SLOT_IN_PAST');
  }

  const slotEnd = new Date(slotStart.getTime() + duration_min * 60 * 1000);

  // Quick DB check: are there already enough bookings to fill capacity?
  const bookingsResult = await query(
    `SELECT COUNT(*) AS cnt FROM bookings
     WHERE provider_id = $1 AND status = 'booked'
       AND start_time < $2 AND end_time > $3`,
    [provider_id, slotEnd.toISOString(), slotStart.toISOString()]
  );

  if (parseInt(bookingsResult.rows[0].cnt) >= capacity) {
    throw new AppError('This slot is fully booked.', 409, 'SLOT_FULL');
  }

  // Attempt Redis lock
  const lockKey = `slot:${provider_id}:${start_time}`;
  const result = await redisSetNX(lockKey, user_id, LOCK_TTL_SECONDS);

  if (result === null || result === 0) {
    // Check if current user already holds the lock
    const currentHolder = await redisGet(lockKey);
    if (currentHolder === user_id) {
      return { locked: true, expires_in: LOCK_TTL_SECONDS, message: 'You already hold this lock.' };
    }

    throw new AppError(
      'This slot is currently held by another user. Try again in a moment.',
      409,
      'SLOT_LOCKED'
    );
  }

  return { locked: true, expires_in: LOCK_TTL_SECONDS };
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
  const slotEnd = new Date(slotStart.getTime() + duration_min * 60 * 1000);

  // Validate future time
  if (slotStart <= new Date()) {
    throw new AppError('Cannot book a slot in the past.', 400, 'SLOT_IN_PAST');
  }

  // 2. Verify Redis lock exists and is owned by this user
  const lockKey = `slot:${provider_id}:${start_time}`;
  const lockHolder = await redisGet(lockKey);

  if (!lockHolder) {
    throw new AppError(
      'No active lock found. Your lock may have expired. Please re-lock the slot.',
      410,
      'LOCK_EXPIRED'
    );
  }

  if (lockHolder !== user_id) {
    throw new AppError(
      'This slot is locked by another user.',
      409,
      'SLOT_LOCKED'
    );
  }

  // 3-9. Atomic transaction
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 4. SELECT FOR UPDATE — lock conflicting booking rows
    const conflictResult = await client.query(
      `SELECT id, status FROM bookings
       WHERE provider_id = $1
         AND status IN ('booked', 'pending')
         AND start_time < $2 AND end_time > $3
       FOR UPDATE`,
      [provider_id, slotEnd.toISOString(), slotStart.toISOString()]
    );

    // 5. Re-run overlap check
    const bookedConflicts = conflictResult.rows.filter((r) => r.status === 'booked');

    // 6. Capacity check
    if (bookedConflicts.length >= capacity) {
      await client.query('ROLLBACK');
      // Release Redis lock since booking failed
      await redisDel(lockKey);
      throw new AppError(
        'This slot was booked by someone else while you had it locked. Please choose another slot.',
        409,
        'SLOT_TAKEN'
      );
    }

    // 7. Generate confirmation code
    const confirmation_code = generateConfirmationCode();

    // Determine initial status
    const initialStatus = advance_payment
      ? 'pending'   // Needs payment first
      : manual_confirmation
        ? 'pending'  // Needs organiser confirmation
        : 'booked';  // Auto-confirmed

    // 8. INSERT booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, provider_id, service_id, start_time, end_time, status, confirmation_code, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, provider_id, service_id, slotStart.toISOString(), slotEnd.toISOString(), initialStatus, confirmation_code, notes]
    );

    // 9. COMMIT
    await client.query('COMMIT');

    const booking = bookingResult.rows[0];

    // 10. Release Redis lock
    await redisDel(lockKey);

    // 11. Send confirmation email (non-blocking, fire-and-forget)
    if (initialStatus === 'booked') {
      // Get user email
      const userResult = await query('SELECT email FROM users WHERE id = $1', [user_id]);
      if (userResult.rows.length > 0) {
        sendBookingConfirmation(userResult.rows[0].email, {
          ...booking,
          service_name: service.service_name,
        }).catch((err) => console.error('Failed to send confirmation email:', err.message));
      }
    }

    // 12. Return booking
    return booking;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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
  sendCancellationNotice(booking.customer_email, result.rows[0]).catch((err) => {
    console.error('Failed to send cancellation email:', err.message);
  });

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
  const conflictResult = await query(
    `SELECT COUNT(*) AS cnt FROM bookings
     WHERE provider_id = $1
       AND id != $2
       AND status = 'booked'
       AND start_time < $3 AND end_time > $4`,
    [booking.provider_id, booking_id, newEnd.toISOString(), newStart.toISOString()]
  );

  if (parseInt(conflictResult.rows[0].cnt) >= booking.capacity) {
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
    sendBookingConfirmation(userResult.rows[0].email, {
      ...result.rows[0],
      service_name: serviceResult.rows[0]?.name || 'N/A',
    }).catch((err) => console.error('Failed to send confirmation email:', err.message));
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
