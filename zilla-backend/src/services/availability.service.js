/**
 * Availability service — slot filtering with real-time availability checks.
 * Aligned with the v5 schema: uses `facilities` + `time_slots` tables.
 *
 * Two modes:
 *   - If pre-generated time_slots exist for the date, use them directly
 *   - Otherwise, dynamically generate from facility working_hours and overlay
 *     against existing bookings/reservations
 */

const { query } = require('../config/db');
const { generateSlots } = require('../utils/slotGenerator');
const { redisMGet } = require('../config/redis');
const { AppError } = require('../middleware/error.middleware');

/**
 * Get available time slots for a facility on a given date.
 *
 * @param {string} facility_id - UUID (frontend sends this as service_id)
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<Array>} Available slots
 */
const getAvailableSlots = async (facility_id, date) => {
  // 1. Fetch facility details
  const facilityResult = await query(
    `SELECT id, organiser_id, duration_mins, max_capacity, working_hours
     FROM facilities
     WHERE id = $1 AND deleted_at IS NULL`,
    [facility_id]
  );

  if (facilityResult.rows.length === 0) {
    throw new AppError('Service not found.', 404, 'SERVICE_NOT_FOUND');
  }

  const facility = facilityResult.rows[0];
  const { organiser_id, max_capacity } = facility;

  // 2. Check for pre-generated time_slots for this date
  const dayStart = new Date(date + 'T00:00:00Z');
  const dayEnd = new Date(date + 'T23:59:59.999Z');

  const existingSlotsResult = await query(
    `SELECT id, slot_start, slot_end, total_capacity, confirmed_count, reserved_count, status
     FROM time_slots
     WHERE facility_id = $1
       AND slot_start >= $2
       AND slot_start < $3
       AND status NOT IN ('cancelled', 'blackout')
     ORDER BY slot_start`,
    [facility_id, dayStart.toISOString(), dayEnd.toISOString()]
  );

  // If we have pre-generated slots, use them (v5 path)
  if (existingSlotsResult.rows.length > 0) {
    const now = new Date();
    const available = existingSlotsResult.rows
      .filter(slot => {
        const slotStart = new Date(slot.slot_start);
        if (slotStart <= now) return false; // Past
        const remaining = slot.total_capacity - slot.confirmed_count - slot.reserved_count;
        return remaining > 0;
      })
      .map(slot => ({
        id: slot.id,
        time: slot.slot_start,
        start_time: slot.slot_start,
        end_time: slot.slot_end,
        available: true,
        remaining: slot.total_capacity - slot.confirmed_count - slot.reserved_count,
      }));

    return available;
  }

  // 3. Fallback: dynamically generate from working_hours
  const allSlots = await generateSlots(facility_id, date);

  if (allSlots.length === 0) {
    return [];
  }

  // 4. Fetch existing bookings for this facility on this date
  const bookingsResult = await query(
    `SELECT b.slot_id, ts.slot_start, ts.slot_end, b.attendee_count, b.status
     FROM bookings b
     JOIN time_slots ts ON b.slot_id = ts.id
     WHERE b.facility_id = $1
       AND ts.slot_start >= $2
       AND ts.slot_start < $3
       AND b.status IN ('confirmed')`,
    [facility_id, dayStart.toISOString(), dayEnd.toISOString()]
  );

  // Build a map of slot_start -> total_booked
  const bookedMap = {};
  for (const b of bookingsResult.rows) {
    const key = new Date(b.slot_start).toISOString();
    bookedMap[key] = (bookedMap[key] || 0) + b.attendee_count;
  }

  // 5. Filter slots
  const now = new Date();
  const availableSlots = [];

  // Batch Redis lock check
  const lockKeys = allSlots.map(slot => `slot:${organiser_id}:${slot.start_time}`);
  const lockHolders = await redisMGet(lockKeys);

  for (let i = 0; i < allSlots.length; i++) {
    const slot = allSlots[i];
    const slotStart = new Date(slot.start_time);

    // Skip past slots
    if (slotStart <= now) continue;

    // Check booked count
    const bookedCount = bookedMap[slot.start_time] || 0;
    if (bookedCount >= max_capacity) continue;

    // Check Redis lock
    const lockHolder = lockHolders[i];
    if (lockHolder && bookedCount + 1 >= max_capacity) continue;

    availableSlots.push({
      id: slot.start_time,
      time: slot.start_time,
      start_time: slot.start_time,
      end_time: slot.end_time,
      available: true,
      remaining: max_capacity - bookedCount,
    });
  }

  return availableSlots;
};

/**
 * Set working hours for a facility.
 * Stores directly on the facilities.working_hours JSONB column.
 *
 * Input format: [{ day_of_week: 0-6, start_time: "HH:MM", end_time: "HH:MM" }, ...]
 * Storage format: { "0": [{"start":"09:00","end":"17:00"}], ... }
 */
const setWorkingHours = async (user_id, workingHours) => {
  // Build JSONB from the array
  const hoursMap = {};
  for (const wh of workingHours) {
    const day = wh.day_of_week.toString();
    if (!hoursMap[day]) hoursMap[day] = [];
    hoursMap[day].push({ start: wh.start_time, end: wh.end_time });
  }

  // Update all facilities owned by this user
  // (In a real app you'd target a specific facility; for now update all)
  const result = await query(
    `UPDATE facilities
     SET working_hours = $1
     WHERE organiser_id = $2 AND deleted_at IS NULL
     RETURNING id, working_hours`,
    [JSON.stringify(hoursMap), user_id]
  );

  if (result.rows.length === 0) {
    throw new AppError('No facilities found for this organiser.', 404, 'FACILITY_NOT_FOUND');
  }

  // Return in the original array format for frontend compatibility
  return workingHours;
};

/**
 * Get working hours for an organiser's facilities.
 */
const getWorkingHours = async (user_id) => {
  const result = await query(
    `SELECT working_hours FROM facilities
     WHERE organiser_id = $1 AND deleted_at IS NULL
     LIMIT 1`,
    [user_id]
  );

  if (result.rows.length === 0) {
    return [];
  }

  const hoursMap = result.rows[0].working_hours || {};

  // Convert JSONB to array format for frontend
  const hoursArray = [];
  for (const [dayStr, windows] of Object.entries(hoursMap)) {
    for (const window of windows) {
      hoursArray.push({
        day_of_week: parseInt(dayStr, 10),
        start_time: window.start,
        end_time: window.end,
      });
    }
  }

  return hoursArray.sort((a, b) => a.day_of_week - b.day_of_week);
};

module.exports = { getAvailableSlots, setWorkingHours, getWorkingHours };
