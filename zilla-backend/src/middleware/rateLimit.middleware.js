/**
 * Rate limiting middleware using express-rate-limit.
 * Protects auth and booking lock endpoints from abuse.
 */

const rateLimit = require('express-rate-limit');

/**
 * Auth routes: 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again after 15 minutes.',
    },
  },
});

/**
 * Booking lock: 30 requests per minute per IP
 */
const bookingLockLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many lock attempts. Please try again shortly.',
    },
  },
});

/**
 * General API limiter: 100 requests per minute per IP
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
  },
});

module.exports = { authLimiter, bookingLockLimiter, generalLimiter };
