/**
 * Nodemailer wrapper for sending OTP and booking confirmation emails.
 */

const nodemailer = require('nodemailer');
const { env } = require('../config/env');

let transporter = null;

// Only create transporter if SMTP is configured
if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  // Verify connection on startup
  transporter.verify()
    .then(() => console.log('📧 SMTP connection verified'))
    .catch((err) => console.warn('⚠️  SMTP verification failed:', err.message));
} else {
  console.warn('⚠️  SMTP not configured — emails will be logged to console');
}

/**
 * Send an email. Falls back to console.log if SMTP is not configured.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${html}`);
    return { messageId: 'console-fallback' };
  }

  const info = await transporter.sendMail({
    from: `"Zilla" <${env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });

  return info;
};

/**
 * Send OTP verification email.
 */
const sendOTPEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: 'Your Zilla Verification Code',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 8px;">🦎 Zilla</h1>
        <p style="color: #666; font-size: 16px; margin-bottom: 24px;">Your verification code is:</p>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin-bottom: 24px;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  });
};

/**
 * Send booking confirmation email.
 */
const sendBookingConfirmation = async (email, booking) => {
  return sendEmail({
    to: email,
    subject: `Booking Confirmed — ${booking.confirmation_code}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 8px;">🦎 Zilla</h1>
        <h2 style="color: #27ae60; font-size: 20px;">✅ Booking Confirmed</h2>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Confirmation Code</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1a1a2e; font-size: 14px; text-align: right;">${booking.confirmation_code}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Service</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1a1a2e; font-size: 14px; text-align: right;">${booking.service_name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Date & Time</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1a1a2e; font-size: 14px; text-align: right;">${new Date(booking.start_time).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Status</td>
              <td style="padding: 8px 0; font-weight: bold; color: #27ae60; font-size: 14px; text-align: right;">${booking.status}</td>
            </tr>
          </table>
        </div>
        <p style="color: #999; font-size: 13px;">Need to make changes? Log in to your Zilla dashboard.</p>
      </div>
    `,
  });
};

/**
 * Send booking cancellation notice.
 */
const sendCancellationNotice = async (email, booking) => {
  return sendEmail({
    to: email,
    subject: `Booking Cancelled — ${booking.confirmation_code}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 8px;">🦎 Zilla</h1>
        <h2 style="color: #e74c3c; font-size: 20px;">❌ Booking Cancelled</h2>
        <p style="color: #666; font-size: 14px;">Your booking <strong>${booking.confirmation_code}</strong> has been cancelled.</p>
        <p style="color: #999; font-size: 13px;">If this was a mistake, please rebook through your dashboard.</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendBookingConfirmation,
  sendCancellationNotice,
};
