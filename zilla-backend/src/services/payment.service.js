const Razorpay = require('razorpay');
const crypto = require('crypto');
const { env } = require('../config/env');

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a new Razorpay order.
 * @param {number} amount - Amount in paise (INR * 100)
 * @param {string} receipt - Unique receipt ID (e.g. pending_payment_id)
 */
const createRazorpayOrder = async (amount, receipt) => {
  const options = {
    amount: Math.round(amount), // in paise
    currency: 'INR',
    receipt: receipt,
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    throw err;
  }
};

/**
 * Verify Razorpay signature.
 * @param {string} orderId 
 * @param {string} paymentId 
 * @param {string} signature 
 */
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Verify Razorpay Webhook Signature.
 * @param {string} rawBody - The raw request body as string
 * @param {string} signature - The X-Razorpay-Signature header
 */
const verifyWebhookSignature = (rawBody, signature) => {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return true; // Skip check if secret not set (demo mode)
  
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
};
