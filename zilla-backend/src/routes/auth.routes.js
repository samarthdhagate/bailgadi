/**
 * Auth routes — signup, OTP, login, refresh, logout, password reset.
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { validateRequest } = require('./helpers/validation');

// --- Google OAuth Flows ---
// 1. Redirect flow: Initiate login
router.get('/google', authController.initGoogleAuth);
// 2. Redirect flow: Handle callback
router.get('/google/callback', authController.googleCallback);
// 3. Token flow: Verify token from frontend (e.g., @react-oauth/google)
router.post(
  '/google',
  [
    body('token').notEmpty().withMessage('Google token is required.'),
    validateRequest,
  ],
  authController.googleLogin
);

// --- Standard Auth Flows (Rate Limited) ---
router.use(authLimiter);

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('role')
      .optional()
      .isIn(['customer', 'organiser'])
      .withMessage('Role must be customer or organiser.'),
    validateRequest,
  ],
  authController.signup
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.'),
    validateRequest,
  ],
  authController.verifyOTP
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
    validateRequest,
  ],
  authController.login
);


// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    validateRequest,
  ],
  authController.forgotPassword
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.'),
    body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
    validateRequest,
  ],
  authController.resetPassword
);

module.exports = router;

