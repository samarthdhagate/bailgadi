/**
 * Environment variable validation and export.
 * Throws on missing critical variables so the app fails fast.
 */

const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'GOOGLE_CLIENT_ID',
];

const optionalVars = {
  PORT: '5000',
  NODE_ENV: 'development',
  REDIS_URL: '',
  REDIS_HOST: '',
  REDIS_PORT: '',
  REDIS_PASSWORD: '',
  RAZORPAY_KEY_ID: '',
  RAZORPAY_KEY_SECRET: '',
  RAZORPAY_WEBHOOK_SECRET: '',
  RAZORPAY_DEMO_MODE: 'true',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: '',
  SMTP_PASS: '',
  FROM_EMAIL: 'noreply@zilla.app',
  FRONTEND_URL: 'http://localhost:5173',
  GOOGLE_CLIENT_SECRET: '',
  GOOGLE_REDIRECT_URI: 'http://localhost:5000/api/auth/google/callback',
  GEMINI_API_KEY: '',
};

// Validate required vars
const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}\n` +
    'Copy .env.example to .env and fill in the values.'
  );
}

// Build env object
const env = {};

for (const key of requiredVars) {
  env[key] = process.env[key];
}

for (const [key, defaultValue] of Object.entries(optionalVars)) {
  env[key] = process.env[key] || defaultValue;
}

// Coerce types
env.PORT = parseInt(env.PORT, 10);
env.SMTP_PORT = parseInt(env.SMTP_PORT, 10);

module.exports = { env };
