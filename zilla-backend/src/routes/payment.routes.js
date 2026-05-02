const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Verify payment and confirm booking
router.post('/verify', verifyToken, paymentController.verifyPaymentAndConfirm);

module.exports = router;
