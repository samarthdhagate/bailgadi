/**
 * Dynamic slot generation logic.
 * Generates time slots for a given provider/service/date from working hours.
 * Uses batch DB fetching to avoid N+1 queries.
 */

const { query } = require('../config/db');

/**
 * Generate all possible time slots for a provider's service on a given date.
 *
 * @param {string} provider_id - UUID of the provider
 * @param {string} service_id - UUID of the service
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Promise<Array<{ start_time: string, end_time: string }>>}
 *          Array of slot objects with UTC ISO strings
 */
const generateSlots = async (provider_id, service_id, date) => {
  // 1. Fetch service duration
  const serviceResult = await query(
    'SELECT duration_min FROM services WHERE id = $1',
    [service_id]
  );

  if (serviceResult.rows.length === 0) {
    return [];
  }

  const { duration_min } = serviceResult.rows[0];

  // 2. Determine day_of_week for the given date (0=Sunday, 6=Saturday)
  const dateObj = new Date(date + 'T00:00:00Z');
  const dayOfWeek = dateObj.getUTCDay();

  // 3. Fetch provider working hours for that day
  const availResult = await query(
    `SELECT start_time, end_time
     FROM availability
     WHERE provider_id = $1 AND day_of_week = $2
     ORDER BY start_time`,
    [provider_id, dayOfWeek]
  );

  if (availResult.rows.length === 0) {
    return [];
  }

  // 4. Generate slots from each working hours window
  const slots = [];

  for (const window of availResult.rows) {
    // Parse TIME values (HH:MM:SS) into minutes since midnight
    const startParts = window.start_time.split(':').map(Number);
    const endParts = window.end_time.split(':').map(Number);

    const windowStartMin = startParts[0] * 60 + startParts[1];
    const windowEndMin = endParts[0] * 60 + endParts[1];

    // Generate slots within this window
    let currentMin = windowStartMin;

    while (currentMin + duration_min <= windowEndMin) {
      const slotStartHour = Math.floor(currentMin / 60);
      const slotStartMinute = currentMin % 60;
      const slotEndMin = currentMin + duration_min;
      const slotEndHour = Math.floor(slotEndMin / 60);
      const slotEndMinute = slotEndMin % 60;

      // Construct UTC ISO strings
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

      currentMin += duration_min;
    }
  }

  return slots;
};

module.exports = { generateSlots };
