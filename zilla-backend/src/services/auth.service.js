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
const notificationService = require('./notification.service');

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
  const cleanEmail = email.toLowerCase().trim();
  // Check if user exists
  const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
  if (existing.rows.length > 0) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate OTP
  const otp = generateOTP();
  const otp_expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Insert user as verified by default
  const result = await query(
    `INSERT INTO users (full_name, email, password_hash, role, otp_code, otp_expires_at, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, FALSE)
     RETURNING id, full_name, email, role`,
    [full_name, cleanEmail, password_hash, role, otp, otp_expires_at]
  );

  const user = result.rows[0];

  // Send OTP
  notificationService.sendOTP(cleanEmail, otp);

  return {
    message: 'Account created successfully. Please verify your email with the OTP sent to your address.',
    user: user,
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

  return { message: 'Email verified successfully. You can now log in.' };
};

/**
 * Login — verify credentials, issue tokens, set refresh cookie.
 */
const login = async ({ email, password }) => {
  const cleanEmail = email.toLowerCase().trim();
  const result = await query(
    'SELECT id, full_name, email, password_hash, role, is_verified FROM users WHERE email = $1',
    [cleanEmail]
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
    'SELECT id, full_name, email, role, refresh_token FROM users WHERE id = $1',
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

  const user = result.rows[0];

  // Issue new access token
  const access_token = generateAccessToken(user.id, user.role);

  return {
    access_token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Logout — clear refresh token from DB.
 */
const logout = async (user_id) => {
  await query('UPDATE users SET refresh_token = NULL WHERE id = $1', [user_id]);
  return { message: 'Logged out successfully.' };
};

/**
 * Logout using refresh token cookie fallback.
 * Useful when access token is expired but browser still has refresh cookie.
 */
const logoutByRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    return { message: 'Logged out successfully.' };
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const result = await query('SELECT refresh_token FROM users WHERE id = $1', [decoded.user_id]);

    if (result.rows.length === 0 || !result.rows[0].refresh_token) {
      return { message: 'Logged out successfully.' };
    }

    const isMatch = await bcrypt.compare(refreshToken, result.rows[0].refresh_token);
    if (isMatch) {
      await query('UPDATE users SET refresh_token = NULL WHERE id = $1', [decoded.user_id]);
    }
  } catch (_err) {
    // Intentionally ignore token parsing/verification errors for idempotent logout.
  }

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

  notificationService.sendOTP(email, otp);

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

/**
 * Google Login — verify ID token or use provided info, find/create user, issue tokens.
 */
const googleLogin = async (data) => {
  let email, name, picture, google_id;

  if (typeof data === 'string') {
    // Treat as idToken (from @react-oauth/google)
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: data,
        audience: env.GOOGLE_CLIENT_ID,
      });
    } catch (err) {
      throw new AppError('Invalid Google token.', 401, 'INVALID_GOOGLE_TOKEN');
    }

    const payload = ticket.getPayload();
    email = payload.email;
    name = payload.name;
    picture = payload.picture;
    google_id = payload.sub;
  } else {
    // Treat as user info object (from redirect flow)
    email = data.email;
    name = data.full_name;
    picture = data.picture;
    google_id = data.google_id;
  }

  // Check if user exists by email
  let result = await query(
    'SELECT id, full_name, email, role, is_verified, google_id FROM users WHERE email = $1',
    [email]
  );

  let user;

  if (result.rows.length === 0) {
    // Create new user (social login bypasses OTP)
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const password_hash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

    const signupResult = await query(
      `INSERT INTO users (full_name, email, password_hash, role, google_id, is_verified, profile_image)
       VALUES ($1, $2, $3, 'customer', $4, TRUE, $5)
       RETURNING id, full_name, email, role`,
      [name, email, password_hash, google_id, picture]
    );
    user = signupResult.rows[0];
  } else {
    user = result.rows[0];
    // Update google_id and profile_image if missing or different
    if (user.google_id !== google_id) {
      await query('UPDATE users SET google_id = $1, is_verified = TRUE WHERE id = $2', [google_id, user.id]);
    }
    if (picture) {
      await query('UPDATE users SET profile_image = $1 WHERE id = $2 AND profile_image IS NULL', [picture, user.id]);
    }
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

module.exports = {

  signup,
  verifyOTP,
  login,
  googleLogin,
  refresh,
  logout,
  logoutByRefreshToken,
  forgotPassword,
  resetPassword,
};

