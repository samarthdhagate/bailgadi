/**
 * Notification service — centralized email notification wrapper.
 * Delegates to mailer utility. All calls are non-blocking (fire-and-forget).
 */

const mailer = require('../utils/mailer');

/**
 * Send OTP email notification.
 * @param {string} email
 * @param {string} otp - 6-digit OTP code
 */
const sendOTP = (email, otp) => {
  return mailer.sendOTPEmail(email, otp).catch((err) => {
    console.error(`[NOTIFICATION] Failed to send OTP to ${email}:`, err.message);
  });
};

/**
 * Send booking confirmation notification.
 * @param {string} email
 * @param {object} booking - Booking record with confirmation_code, service_name, etc.
 */
const sendBookingConfirmation = (email, booking) => {
  return mailer.sendBookingConfirmation(email, booking).catch((err) => {
    console.error(`[NOTIFICATION] Failed to send booking confirmation to ${email}:`, err.message);
  });
};

/**
 * Send booking cancellation notification.
 * @param {string} email
 * @param {object} booking - Booking record
 */
const sendCancellationNotice = (email, booking) => {
  return mailer.sendCancellationNotice(email, booking).catch((err) => {
    console.error(`[NOTIFICATION] Failed to send cancellation notice to ${email}:`, err.message);
  });
};

module.exports = {
  sendOTP,
  sendBookingConfirmation,
  sendCancellationNotice,
};
