/**
 * Availability controller — slot queries and working hours management.
 */

const availabilityService = require('../services/availability.service');

/**
 * GET /api/availability?service_id=&date= — get available time slots
 */
const getSlots = async (req, res, next) => {
  try {
    const { service_id, date } = req.query;

    if (!service_id || !date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Both service_id and date query parameters are required.',
        },
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Date must be in YYYY-MM-DD format.',
        },
      });
    }

    const slots = await availabilityService.getAvailableSlots(service_id, date);
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/availability/working-hours — set provider working hours
 */
const setWorkingHours = async (req, res, next) => {
  try {
    const { working_hours } = req.body;

    if (!Array.isArray(working_hours) || working_hours.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'working_hours must be a non-empty array.',
        },
      });
    }

    // Validate each entry
    for (const wh of working_hours) {
      if (
        wh.day_of_week === undefined ||
        wh.day_of_week < 0 ||
        wh.day_of_week > 6 ||
        !wh.start_time ||
        !wh.end_time
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Each working hour entry must have day_of_week (0-6), start_time, and end_time.',
          },
        });
      }
    }

    const result = await availabilityService.setWorkingHours(req.user.user_id, working_hours);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/availability/working-hours — get provider working hours
 */
const getWorkingHours = async (req, res, next) => {
  try {
    const result = await availabilityService.getWorkingHours(req.user.user_id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSlots, setWorkingHours, getWorkingHours };
