/**
 * Availability service — slot queries for V5 schema.
 * Fetches pre-generated slots from time_slots table.
 */

const { query } = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

/**
 * Get available time slots for a facility on a given date.
 *
 * @param {string} facility_id - UUID
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<Array>} Available slots
 */
const getAvailableSlots = async (facility_id, date) => {
  // 1. Fetch facility details (using V5 schema: facilities)
  const facilityResult = await query(
    'SELECT id, organiser_id, duration_mins, max_capacity FROM facilities WHERE id = $1',
    [facility_id]
  );

  if (facilityResult.rows.length === 0) {
    throw new AppError('Facility not found.', 404, 'FACILITY_NOT_FOUND');
  }

  // 2. Fetch slots from time_slots table for this India-local date.
  // Admin and customer date pickers are calendar-day based for India, while
  // slot_start is stored as timestamptz. Querying UTC midnight can hide slots
  // near the date boundary from the customer booking page.
  const dayStart = `${date}T00:00:00.000+05:30`;
  const dayEnd = `${date}T23:59:59.999+05:30`;

  const slotsResult = await query(
    `SELECT id, slot_start, slot_end, total_capacity, confirmed_count, reserved_count, status, resource_id, frozen_price
     FROM time_slots
     WHERE facility_id = $1
       AND slot_start >= $2
       AND slot_start <= $3
       AND status = 'available'
       AND (confirmed_count + reserved_count) < total_capacity
     ORDER BY slot_start`,
    [facility_id, dayStart, dayEnd]
  );

  const now = new Date();

  return slotsResult.rows
    .filter(slot => new Date(slot.slot_start) > now) // Only future slots
    .map(slot => ({
      id: slot.id,
      time: slot.slot_start, // ISO string for the backend validation
      start_time: slot.slot_start,
      end_time: slot.slot_end,
      remaining_capacity: Number(slot.total_capacity) - Number(slot.confirmed_count) - Number(slot.reserved_count),
      total_capacity: slot.total_capacity,
      price: slot.frozen_price,
      available: true,
      resource_id: slot.resource_id
    }));
};

/**
 * Set working hours (placeholder for V5 compatibility if needed).
 */
const setWorkingHours = async (user_id, workingHours) => {
  // V5 uses complex working hours in facilities.jsonb or separate table.
  // For now, let's just return a message or implement simple upsert.
  return { message: 'Working hours management is handled via facility configuration in V5.' };
};

/**
 * Get working hours.
 */
const getWorkingHours = async (user_id) => {
  const result = await query(
    'SELECT working_hours FROM facilities WHERE organiser_id = $1',
    [user_id]
  );
  return result.rows[0]?.working_hours || [];
};

module.exports = { getAvailableSlots, setWorkingHours, getWorkingHours };
