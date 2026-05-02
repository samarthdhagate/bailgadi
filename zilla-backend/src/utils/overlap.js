/**
 * Interval overlap helpers for slot/booking collision detection.
 */

/**
 * Check if two time intervals overlap.
 * Uses the standard overlap formula: A.start < B.end AND A.end > B.start
 *
 * @param {Date|string} aStart - Start of interval A
 * @param {Date|string} aEnd - End of interval A
 * @param {Date|string} bStart - Start of interval B
 * @param {Date|string} bEnd - End of interval B
 * @returns {boolean} True if intervals overlap
 */
const intervalsOverlap = (aStart, aEnd, bStart, bEnd) => {
  const a0 = new Date(aStart).getTime();
  const a1 = new Date(aEnd).getTime();
  const b0 = new Date(bStart).getTime();
  const b1 = new Date(bEnd).getTime();
  return a0 < b1 && a1 > b0;
};

/**
 * Check if a slot overlaps any booking in a list.
 *
 * @param {string} slotStart - Slot start ISO string
 * @param {string} slotEnd - Slot end ISO string
 * @param {Array<{ start_time: string, end_time: string }>} bookings
 * @returns {boolean} True if any overlap exists
 */
const hasOverlap = (slotStart, slotEnd, bookings) => {
  return bookings.some((b) => intervalsOverlap(slotStart, slotEnd, b.start_time, b.end_time));
};

/**
 * Count how many bookings overlap with a slot.
 * Used for capacity checks in group services.
 *
 * @param {string} slotStart - Slot start ISO string
 * @param {string} slotEnd - Slot end ISO string
 * @param {Array<{ start_time: string, end_time: string }>} bookings
 * @returns {number} Number of overlapping bookings
 */
const countOverlapping = (slotStart, slotEnd, bookings) => {
  return bookings.filter((b) => intervalsOverlap(slotStart, slotEnd, b.start_time, b.end_time)).length;
};

module.exports = { intervalsOverlap, hasOverlap, countOverlapping };
