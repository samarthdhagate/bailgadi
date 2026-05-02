const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const { body } = require('express-validator');
const { validateRequest } = require('./helpers/validation');

// Verify payment and confirm booking
router.post(
  '/verify', 
  verifyToken,
  [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
  ],
  validateRequest,
  paymentController.verifyPaymentAndConfirm
);

// Razorpay Webhook (No verifyToken here, handled by signature check in controller)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
