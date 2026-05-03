const crypto = require('crypto');
const { env } = require('../config/env');
const { AppError } = require('../middleware/error.middleware');

const isDemoMode = () => env.RAZORPAY_DEMO_MODE === 'true' || !env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET;

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
    payment_capture: 1,
  };

  if (isDemoMode()) {
    return {
      id: `order_demo_${receipt}_${Date.now()}`,
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      demo: true,
    };
  }

  try {
    const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new AppError(
        data?.error?.description || 'Unable to create Razorpay order.',
        response.status,
        'RAZORPAY_ORDER_FAILED'
      );
    }

    return data;
  } catch (err) {
    const description = err?.error?.description || err?.message || 'Unable to create Razorpay order.';
    console.error('Razorpay order creation failed:', description);
    if (err instanceof AppError) throw err;
    throw new AppError(description, err?.statusCode || 502, 'RAZORPAY_ORDER_FAILED');
  }
};

/**
 * Verify Razorpay signature.
 * @param {string} orderId 
 * @param {string} paymentId 
 * @param {string} signature 
 */
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  if (isDemoMode() && paymentId?.startsWith('pay_demo_') && signature === 'demo_signature') {
    return true;
  }

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
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    if (process.env.NODE_ENV === 'production') {
       throw new Error('CRITICAL: RAZORPAY_WEBHOOK_SECRET is missing in production environment.');
    }
    console.warn('WARNING: RAZORPAY_WEBHOOK_SECRET is missing. Skipping signature check in non-production mode.');
    return true; 
  }
  
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
  isDemoMode,
};
