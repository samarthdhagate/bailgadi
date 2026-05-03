/**
 * Booking routes — slot locking, booking CRUD, and management.
 */

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const bookingController = require('../controllers/booking.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { bookingLockLimiter } = require('../middleware/rateLimit.middleware');
const { validateRequest } = require('./helpers/validation');

// POST /api/bookings/lock — acquire Redis lock [auth: customer]
router.post(
  '/lock',
  verifyToken,
  requireRole('customer'),
  bookingLockLimiter,
  [
    body('service_id').notEmpty().withMessage('Valid service_id is required.'),
    body('start_time').isISO8601().withMessage('start_time must be a valid ISO 8601 date.'),
    body('attendee_count').optional().isInt({ min: 1 }).withMessage('attendee_count must be at least 1.'),
    validateRequest,
  ],
  bookingController.lockSlot
);

// GET /api/bookings/timer — get remaining time for slot lock [auth: customer]
router.get(
  '/timer',
  verifyToken,
  requireRole('customer'),
  bookingController.getSlotTimer
);

// POST /api/bookings — create booking [auth: customer]
router.post(
  '/',
  verifyToken,
  requireRole('customer'),
  [
    body('service_id').notEmpty().withMessage('Valid service_id is required.'),
    body('start_time').isISO8601().withMessage('start_time must be a valid ISO 8601 date.'),
    body('notes').optional().isString().isLength({ max: 500 }),
    validateRequest,
  ],
  bookingController.createBooking
);

// GET /api/bookings/my — customer's bookings
router.get(
  '/my',
  verifyToken,
  requireRole('customer'),
  bookingController.getMyBookings
);

// GET /api/bookings/provider — provider's bookings [auth: organiser]
router.get(
  '/provider',
  verifyToken,
  requireRole('organiser'),
  bookingController.getProviderBookings
);

// GET /api/bookings/all — all bookings [auth: admin]
router.get(
  '/all',
  verifyToken,
  requireRole('admin'),
  bookingController.getAllBookings
);

// PATCH /api/bookings/:id/cancel — cancel booking [auth: customer|organiser]
router.patch(
  '/:id/cancel',
  verifyToken,
  requireRole('customer', 'organiser'),
  [
    param('id').isUUID().withMessage('Invalid booking ID.'),
    validateRequest,
  ],
  bookingController.cancelBooking
);

// PATCH /api/bookings/:id/reschedule — reschedule [auth: customer]
router.patch(
  '/:id/reschedule',
  verifyToken,
  requireRole('customer'),
  [
    param('id').isUUID().withMessage('Invalid booking ID.'),
    body('new_start_time').isISO8601().withMessage('new_start_time must be a valid ISO 8601 date.'),
    validateRequest,
  ],
  bookingController.rescheduleBooking
);

// PATCH /api/bookings/:id/confirm — manual confirmation [auth: organiser]
router.patch(
  '/:id/confirm',
  verifyToken,
  requireRole('organiser'),
  [
    param('id').isUUID().withMessage('Invalid booking ID.'),
    validateRequest,
  ],
  bookingController.confirmBooking
);

// PATCH /api/bookings/:id/status — organiser lifecycle update
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('organiser'),
  [
    param('id').isUUID().withMessage('Invalid booking ID.'),
    body('status').isIn(['confirmed', 'cancelled', 'no_show']).withMessage('Invalid booking status.'),
    validateRequest,
  ],
  bookingController.updateProviderBookingStatus
);

module.exports = router;
