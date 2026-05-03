/**
 * Admin routes — system management endpoints.
 * All routes require admin role.
 */

const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { validateRequest } = require('./helpers/validation');

// All admin routes require authentication + admin role
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', adminController.getStats);

// GET /api/admin/users
router.get('/users', adminController.listUsers);

router.put(
  '/users/:id',
  [param('id').isUUID().withMessage('Invalid user ID.'), validateRequest],
  adminController.updateUser
);

router.delete(
  '/users/:id',
  [param('id').isUUID().withMessage('Invalid user ID.'), validateRequest],
  adminController.deleteUser
);

// ─── Facilities ─────────────────────────────────────────────────────
router.get('/facilities', adminController.listAllFacilities);

router.get(
  '/facilities/:id',
  [param('id').isUUID().withMessage('Invalid facility ID.'), validateRequest],
  adminController.getFacility
);

router.put(
  '/facilities/:id',
  [param('id').isUUID().withMessage('Invalid facility ID.'), validateRequest],
  adminController.updateFacility
);

router.delete(
  '/facilities/:id',
  [param('id').isUUID().withMessage('Invalid facility ID.'), validateRequest],
  adminController.deleteFacility
);

// ─── Time Slots ─────────────────────────────────────────────────────
router.get(
  '/facilities/:id/slots',
  [param('id').isUUID().withMessage('Invalid facility ID.'), validateRequest],
  adminController.listSlots
);

router.post(
  '/facilities/:id/slots',
  [param('id').isUUID().withMessage('Invalid facility ID.'), validateRequest],
  adminController.createSlot
);

router.post(
  '/facilities/:id/slots/bulk',
  [param('id').isUUID().withMessage('Invalid facility ID.'), validateRequest],
  adminController.bulkCreateSlots
);

router.put(
  '/slots/:slotId',
  [param('slotId').isUUID().withMessage('Invalid slot ID.'), validateRequest],
  adminController.updateSlot
);

router.delete(
  '/slots/:slotId',
  [param('slotId').isUUID().withMessage('Invalid slot ID.'), validateRequest],
  adminController.deleteSlot
);

// ─── Bookings ─────────────────────────────────────────────────────
router.get('/bookings', adminController.listBookings);

router.post(
  '/bookings',
  adminController.createBookingForUser
);

router.put(
  '/bookings/:id/status',
  [param('id').isUUID().withMessage('Invalid booking ID.'), validateRequest],
  adminController.updateBookingStatus
);

router.delete(
  '/bookings/:id',
  [param('id').isUUID().withMessage('Invalid booking ID.'), validateRequest],
  adminController.deleteBooking
);

module.exports = router;
