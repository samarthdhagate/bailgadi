/**
 * Payment controller — Razorpay order creation, verification, and webhooks.
 */

const paymentService = require('../services/payment.service');

const createOrder = async (req, res, next) => {
  try {
    const { booking_id, amount } = req.body;

    if (!booking_id || !amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'booking_id and amount are required.',
        },
      });
    }

    const result = await paymentService.createOrder(req.user.user_id, booking_id, amount);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
        },
      });
    }

    const result = await paymentService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'X-Razorpay-Signature header is required.',
        },
      });
    }

    // req.rawBody is set by express.raw() middleware for this route
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await paymentService.handleWebhook(rawBody, signature);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, verifyPayment, webhook };
