const bookingService = require('../services/booking.service');

const paymentService = require('../services/payment.service');

/**
 * Handle Razorpay payment verification and final booking confirmation.
 */
const verifyPaymentAndConfirm = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const paymentData = req.body;

    if (!paymentData || !paymentData.razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Missing payment data.' });
    }

    const result = await bookingService.verifyAndConfirmBooking(userId, paymentData);

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Razorpay Webhooks.
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody; // Populated by the custom parser in app.js

    const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('⚠️  Invalid Razorpay webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    console.log('🔔 Received Razorpay Webhook:', event);

    if (event === 'payment.captured') {
      const { order_id, id: payment_id } = req.body.payload.payment.entity;
      
      // Attempt to confirm booking via background task or service
      // We use the same service but might need to handle "already confirmed" state gracefully
      try {
        // In webhook, we might not have a userId in req.user, 
        // so verifyAndConfirmBooking should be robust enough or we need a specific webhook confirmation method.
        // For simplicity, let's assume we can confirm by order_id alone.
        await bookingService.confirmBookingByOrderId(order_id, payment_id);
      } catch (err) {
        console.error('❌ Failed to confirm booking via webhook:', err.message);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  verifyPaymentAndConfirm,
  handleWebhook,
};
