/**
 * Dynamic slot generation logic.
 * Generates time slots for a given facility on a date from its working_hours JSONB.
 *
 * The v5 schema stores working hours directly on the `facilities` table as JSONB:
 *   working_hours: { "1": [{"start":"09:00","end":"12:00"},{"start":"14:00","end":"18:00"}], ... }
 *   Keys are day-of-week (0=Sunday..6=Saturday), values are arrays of {start,end} windows.
 */

const { query } = require('../config/db');

/**
 * Generate all possible time slots for a facility on a given date.
 *
 * @param {string} facility_id - UUID of the facility
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Promise<Array<{ start_time: string, end_time: string }>>}
 */
const generateSlots = async (facility_id, date) => {
  // 1. Fetch facility duration and working hours
  const result = await query(
    'SELECT duration_mins, working_hours, working_tz FROM facilities WHERE id = $1 AND deleted_at IS NULL',
    [facility_id]
  );

  if (result.rows.length === 0) {
    return [];
  }

  const { duration_mins, working_hours } = result.rows[0];

  if (!working_hours || typeof working_hours !== 'object') {
    return [];
  }

  // 2. Determine day_of_week for the given date (0=Sunday, 6=Saturday)
  const dateObj = new Date(date + 'T00:00:00Z');
  const dayOfWeek = dateObj.getUTCDay().toString();

  // 3. Get windows for this day
  const windows = working_hours[dayOfWeek];
  if (!Array.isArray(windows) || windows.length === 0) {
    return [];
  }

  // 4. Generate slots from each window
  const slots = [];

  for (const window of windows) {
    if (!window.start || !window.end) continue;

    const startParts = window.start.split(':').map(Number);
    const endParts = window.end.split(':').map(Number);

    const windowStartMin = startParts[0] * 60 + (startParts[1] || 0);
    const windowEndMin = endParts[0] * 60 + (endParts[1] || 0);

    let currentMin = windowStartMin;

    while (currentMin + duration_mins <= windowEndMin) {
      const slotStartHour = Math.floor(currentMin / 60);
      const slotStartMinute = currentMin % 60;
      const slotEndMin = currentMin + duration_mins;
      const slotEndHour = Math.floor(slotEndMin / 60);
      const slotEndMinute = slotEndMin % 60;

      const startISO = new Date(Date.UTC(
        dateObj.getUTCFullYear(),
        dateObj.getUTCMonth(),
        dateObj.getUTCDate(),
        slotStartHour,
        slotStartMinute,
        0
      )).toISOString();

      const endISO = new Date(Date.UTC(
        dateObj.getUTCFullYear(),
        dateObj.getUTCMonth(),
        dateObj.getUTCDate(),
        slotEndHour,
        slotEndMinute,
        0
      )).toISOString();

      slots.push({ start_time: startISO, end_time: endISO });

      currentMin += duration_mins;
    }
  }

  return slots;
};

module.exports = { generateSlots };
