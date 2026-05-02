/**
 * Availability service — slot filtering with real-time availability checks.
 * Filters generated slots against bookings, Redis locks, capacity, and time.
 */

const { query } = require('../config/db');
const { generateSlots } = require('../utils/slotGenerator');
const { countOverlapping } = require('../utils/overlap');
const { redisMGet } = require('../config/redis');
const { AppError } = require('../middleware/error.middleware');

/**
 * Get available time slots for a service on a given date.
 * Implements the 4-filter rule:
 *   1. Overlapping booked/locked bookings
 *   2. Redis lock key exists
 *   3. Booking count >= capacity
 *   4. Slot is in the past
 *
 * Uses batch DB fetch — ONE query for all bookings on that date.
 *
 * @param {string} service_id - UUID
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<Array>} Available slots
 */
const getAvailableSlots = async (service_id, date) => {
  // 1. Fetch service details
  const serviceResult = await query(
    'SELECT id, provider_id, duration_min, capacity FROM services WHERE id = $1',
    [service_id]
  );

  if (serviceResult.rows.length === 0) {
    throw new AppError('Service not found.', 404, 'SERVICE_NOT_FOUND');
  }

  const service = serviceResult.rows[0];
  const { provider_id, capacity } = service;

  // 2. Generate all possible slots for the day
  const allSlots = await generateSlots(provider_id, service_id, date);

  if (allSlots.length === 0) {
    return [];
  }

  // 3. Batch-fetch ALL bookings for this provider on this date (ONE query, no N+1)
  const dayStart = new Date(date + 'T00:00:00Z').toISOString();
  const dayEnd = new Date(date + 'T23:59:59.999Z').toISOString();

  const bookingsResult = await query(
    `SELECT start_time, end_time, status
     FROM bookings
     WHERE provider_id = $1
       AND status IN ('booked', 'locked', 'pending')
       AND start_time >= $2
       AND start_time < $3`,
    [provider_id, dayStart, dayEnd]
  );

  const existingBookings = bookingsResult.rows;
  // Pending bookings should reduce availability (they already reserved capacity).
  const capacityConsumingBookings = existingBookings.filter(
    (b) => b.status === 'booked' || b.status === 'pending'
  );

  // 4. Filter slots
  const now = new Date();
  const availableSlots = [];

  // Batch-fetch Redis lock holders for all slots (fast path, avoids N Redis roundtrips)
  const lockKeys = allSlots.map((slot) => `slot:${provider_id}:${slot.start_time}`);
  const lockHolders = await redisMGet(lockKeys);

  for (let i = 0; i < allSlots.length; i++) {
    const slot = allSlots[i];
    const slotStart = new Date(slot.start_time);
    const slotEnd = new Date(slot.end_time);

    // Filter (d): Slot is in the past
    if (slotStart <= now) {
      continue;
    }

    // Filter (a): Overlapping booked booking exists
    const overlapCount = countOverlapping(slot.start_time, slot.end_time, capacityConsumingBookings);

    // Filter (c): Booking count >= capacity
    if (overlapCount >= capacity) {
      continue;
    }

    // Filter (b): Redis lock key exists
    const lockHolder = lockHolders[i];
    if (lockHolder) {
      // Slot is locked, count it toward capacity
      if (overlapCount + 1 >= capacity) {
        continue;
      }
    }

    availableSlots.push({
      id: slot.start_time,
      time: slot.start_time,
      start_time: slot.start_time,
      end_time: slot.end_time,
      available: true,
    });
  }

  return availableSlots;
};

/**
 * Set working hours for a provider (upsert).
 */
const setWorkingHours = async (user_id, workingHours) => {
  // Get provider_id
  const providerResult = await query(
    'SELECT id FROM providers WHERE user_id = $1',
    [user_id]
  );

  if (providerResult.rows.length === 0) {
    throw new AppError('Provider profile not found.', 404, 'PROVIDER_NOT_FOUND');
  }

  const provider_id = providerResult.rows[0].id;

  // Delete existing working hours and re-insert
  // (simpler and safer than complex upsert logic)
  await query('DELETE FROM availability WHERE provider_id = $1', [provider_id]);

  const insertedRows = [];

  for (const wh of workingHours) {
    const result = await query(
      `INSERT INTO availability (provider_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [provider_id, wh.day_of_week, wh.start_time, wh.end_time]
    );
    insertedRows.push(result.rows[0]);
  }

  return insertedRows;
};

/**
 * Get working hours for a provider.
 */
const getWorkingHours = async (user_id) => {
  const providerResult = await query(
    'SELECT id FROM providers WHERE user_id = $1',
    [user_id]
  );

  if (providerResult.rows.length === 0) {
    throw new AppError('Provider profile not found.', 404, 'PROVIDER_NOT_FOUND');
  }

  const provider_id = providerResult.rows[0].id;

  const result = await query(
    `SELECT id, day_of_week, start_time, end_time
     FROM availability
     WHERE provider_id = $1
     ORDER BY day_of_week, start_time`,
    [provider_id]
  );

  return result.rows;
};

module.exports = { getAvailableSlots, setWorkingHours, getWorkingHours };
