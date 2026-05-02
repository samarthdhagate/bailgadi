/**
 * Payment routes — Razorpay order creation, verification, and webhooks.
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const paymentController = require('../controllers/payment.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { validateRequest } = require('./helpers/validation');

// POST /api/payments/create-order — create Razorpay order [auth: customer]
router.post(
  '/create-order',
  verifyToken,
  requireRole('customer'),
  [
    body('booking_id').isUUID().withMessage('Valid booking_id is required.'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer (in INR).'),
    validateRequest,
  ],
  paymentController.createOrder
);

// POST /api/payments/verify — verify Razorpay payment [auth: customer]
router.post(
  '/verify',
  verifyToken,
  requireRole('customer'),
  [
    body('razorpay_order_id').notEmpty().withMessage('razorpay_order_id is required.'),
    body('razorpay_payment_id').notEmpty().withMessage('razorpay_payment_id is required.'),
    body('razorpay_signature').notEmpty().withMessage('razorpay_signature is required.'),
    validateRequest,
  ],
  paymentController.verifyPayment
);

// POST /api/payments/webhook — Razorpay webhook handler (public, HMAC verified)
router.post('/webhook', paymentController.webhook);

module.exports = router;
