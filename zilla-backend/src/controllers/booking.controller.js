/**
 * Booking controller — handles booking HTTP requests.
 */

const bookingService = require('../services/booking.service');

const lockSlot = async (req, res, next) => {
  try {
    const { service_id, start_time } = req.body;

    if (!service_id || !start_time) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'service_id and start_time are required.',
        },
      });
    }

    const result = await bookingService.lockSlot(req.user.user_id, service_id, start_time);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const { service_id, start_time, notes } = req.body;

    if (!service_id || !start_time) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'service_id and start_time are required.',
        },
      });
    }

    const result = await bookingService.createBooking(
      req.user.user_id,
      service_id,
      start_time,
      notes || null
    );

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getMyBookings(req.user.user_id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getProviderBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getProviderBookings(req.user.user_id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getAllBookings();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await bookingService.cancelBooking(id, req.user.user_id, req.user.role);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_start_time } = req.body;

    if (!new_start_time) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'new_start_time is required.',
        },
      });
    }

    const result = await bookingService.rescheduleBooking(id, req.user.user_id, new_start_time);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await bookingService.confirmBooking(id, req.user.user_id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
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
