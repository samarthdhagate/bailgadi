/**
 * Authentication service — all auth business logic.
 * Handles signup, OTP, login, refresh, logout, password reset.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, pool } = require('../config/db');
const { env } = require('../config/env');
const { AppError } = require('../middleware/error.middleware');
const { sendOTPEmail } = require('../utils/mailer');

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate a 6-digit OTP.
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate JWT access token.
 */
const generateAccessToken = (user_id, role) => {
  return jwt.sign({ user_id, role }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generate JWT refresh token.
 */
const generateRefreshToken = (user_id, role) => {
  return jwt.sign({ user_id, role }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Signup — create user, generate OTP, send email.
 */
const signup = async ({ full_name, email, password, role = 'customer' }) => {
  // Check if user exists
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate OTP
  const otp = generateOTP();
  const otp_expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  // Insert user
  const result = await query(
    `INSERT INTO users (full_name, email, password_hash, role, otp_code, otp_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, role`,
    [full_name, email, password_hash, role, otp, otp_expires_at]
  );

  // Send OTP email (fire-and-forget)
  sendOTPEmail(email, otp).catch((err) => {
    console.error('Failed to send OTP email:', err.message);
  });

  return {
    message: 'Account created. Please verify your email with the OTP sent.',
    user: result.rows[0],
  };
};

/**
 * Verify OTP — marks user as verified, creates provider if organiser.
 */
const verifyOTP = async ({ email, otp }) => {
  const result = await query(
    'SELECT id, role, otp_code, otp_expires_at, is_verified FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('No account found with this email.', 404, 'USER_NOT_FOUND');
  }

  const user = result.rows[0];

  if (user.is_verified) {
    throw new AppError('Email is already verified.', 400, 'ALREADY_VERIFIED');
  }

  if (user.otp_code !== otp) {
    throw new AppError('Invalid OTP code.', 400, 'INVALID_OTP');
  }

  if (new Date(user.otp_expires_at) < new Date()) {
    throw new AppError('OTP has expired. Please request a new one.', 410, 'OTP_EXPIRED');
  }

  // Mark as verified, clear OTP
  await query(
    `UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL
     WHERE id = $1`,
    [user.id]
  );

  // Auto-create provider record if organiser
  if (user.role === 'organiser') {
    await query(
      'INSERT INTO providers (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [user.id]
    );
  }

  return { message: 'Email verified successfully. You can now log in.' };
};

/**
 * Login — verify credentials, issue tokens, set refresh cookie.
 */
const login = async ({ email, password }) => {
  const result = await query(
    'SELECT id, full_name, email, password_hash, role, is_verified FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const user = result.rows[0];

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  // Check verification
  if (!user.is_verified) {
    throw new AppError('Please verify your email before logging in.', 403, 'EMAIL_NOT_VERIFIED');
  }

  // Generate tokens
  const access_token = generateAccessToken(user.id, user.role);
  const refresh_token = generateRefreshToken(user.id, user.role);

  // Store hashed refresh token in DB
  const refresh_hash = await bcrypt.hash(refresh_token, SALT_ROUNDS);
  await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refresh_hash, user.id]);

  return {
    access_token,
    refresh_token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Refresh — verify refresh token cookie, issue new access token.
 */
const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required.', 401, 'NO_REFRESH_TOKEN');
  }

  // Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Check user exists and has a stored refresh token
  const result = await query(
    'SELECT id, role, refresh_token FROM users WHERE id = $1',
    [decoded.user_id]
  );

  if (result.rows.length === 0 || !result.rows[0].refresh_token) {
    throw new AppError('Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Verify refresh token matches stored hash
  const isValid = await bcrypt.compare(refreshToken, result.rows[0].refresh_token);
  if (!isValid) {
    throw new AppError('Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Issue new access token
  const access_token = generateAccessToken(result.rows[0].id, result.rows[0].role);

  return { access_token };
};

/**
 * Logout — clear refresh token from DB.
 */
const logout = async (user_id) => {
  await query('UPDATE users SET refresh_token = NULL WHERE id = $1', [user_id]);
  return { message: 'Logged out successfully.' };
};

/**
 * Forgot password — generate and send OTP.
 */
const forgotPassword = async ({ email }) => {
  const result = await query('SELECT id FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    // Don't reveal if email exists — return success either way
    return { message: 'If an account with that email exists, an OTP has been sent.' };
  }

  const otp = generateOTP();
  const otp_expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  await query(
    'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE email = $3',
    [otp, otp_expires_at, email]
  );

  sendOTPEmail(email, otp).catch((err) => {
    console.error('Failed to send forgot password OTP:', err.message);
  });

  return { message: 'If an account with that email exists, an OTP has been sent.' };
};

/**
 * Reset password — verify OTP and set new password.
 */
const resetPassword = async ({ email, otp, new_password }) => {
  const result = await query(
    'SELECT id, otp_code, otp_expires_at FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('No account found with this email.', 404, 'USER_NOT_FOUND');
  }

  const user = result.rows[0];

  if (user.otp_code !== otp) {
    throw new AppError('Invalid OTP code.', 400, 'INVALID_OTP');
  }

  if (new Date(user.otp_expires_at) < new Date()) {
    throw new AppError('OTP has expired. Please request a new one.', 410, 'OTP_EXPIRED');
  }

  const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);

  await query(
    `UPDATE users SET password_hash = $1, otp_code = NULL, otp_expires_at = NULL, refresh_token = NULL
     WHERE id = $2`,
    [password_hash, user.id]
  );

  return { message: 'Password reset successful. You can now log in with your new password.' };
};

module.exports = {
  signup,
  verifyOTP,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
