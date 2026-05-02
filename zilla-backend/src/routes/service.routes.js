/**
 * Service routes — CRUD for appointment services.
 */

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const serviceController = require('../controllers/service.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { validateRequest } = require('./helpers/validation');

// GET /api/services — list all published services (public)
router.get('/', serviceController.listPublished);

// GET /api/services/my — organiser's own services
router.get('/my', verifyToken, requireRole('organiser'), serviceController.listMine);

// POST /api/services — create a service
router.post(
  '/',
  verifyToken,
  requireRole('organiser'),
  [
    body('name').trim().notEmpty().withMessage('Service name is required.').isLength({ max: 100 }),
    body('duration_min').isInt({ min: 5, max: 480 }).withMessage('Duration must be between 5 and 480 minutes.'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1.'),
    body('advance_payment').optional().isBoolean(),
    body('manual_confirmation').optional().isBoolean(),
    validateRequest,
  ],
  serviceController.create
);

// PUT /api/services/:id — update a service
router.put(
  '/:id',
  verifyToken,
  requireRole('organiser'),
  [
    param('id').isUUID().withMessage('Invalid service ID.'),
    body('name').optional().trim().notEmpty().isLength({ max: 100 }),
    body('duration_min').optional().isInt({ min: 5, max: 480 }),
    body('capacity').optional().isInt({ min: 1 }),
    body('advance_payment').optional().isBoolean(),
    body('manual_confirmation').optional().isBoolean(),
    validateRequest,
  ],
  serviceController.update
);

// DELETE /api/services/:id — delete a service
router.delete(
  '/:id',
  verifyToken,
  requireRole('organiser'),
  [
    param('id').isUUID().withMessage('Invalid service ID.'),
    validateRequest,
  ],
  serviceController.remove
);

// PATCH /api/services/:id/publish — toggle publish
router.patch(
  '/:id/publish',
  verifyToken,
  requireRole('organiser'),
  [
    param('id').isUUID().withMessage('Invalid service ID.'),
    validateRequest,
  ],
  serviceController.togglePublish
);

module.exports = router;
