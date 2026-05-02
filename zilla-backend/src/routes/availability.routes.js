/**
 * Availability routes — slot queries and working hours.
 */

const express = require('express');
const router = express.Router();

const availabilityController = require('../controllers/availability.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// GET /api/availability?service_id=&date= — available time slots (public)
router.get('/', availabilityController.getSlots);

// POST /api/availability/working-hours — set working hours [auth: organiser]
router.post(
  '/working-hours',
  verifyToken,
  requireRole('organiser'),
  availabilityController.setWorkingHours
);

// GET /api/availability/working-hours — get working hours [auth: organiser]
router.get(
  '/working-hours',
  verifyToken,
  requireRole('organiser'),
  availabilityController.getWorkingHours
);

module.exports = router;
