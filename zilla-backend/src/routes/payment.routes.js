const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Create Razorpay order
router.post('/create-order', verifyToken, paymentController.createOrder);

// Verify payment and confirm booking
router.post('/verify', verifyToken, paymentController.verifyPaymentAndConfirm);

// Razorpay Webhook (No verifyToken here, handled by signature check in controller)
router.post('/webhook', paymentController.handleWebhook);

// Cancel a pending payment and release the booking hold
router.post('/cancel', verifyToken, paymentController.cancelPendingPayment);

// Get payment status
router.get('/status/:reservation_id', verifyToken, paymentController.getPaymentStatus);

module.exports = router;
