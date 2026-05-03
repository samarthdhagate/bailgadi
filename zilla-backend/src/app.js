/**
 * Express application setup.
 * Mounts all middleware, routes, and error handlers.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { env } = require('./config/env');
const { errorHandler } = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimit.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const availabilityRoutes = require('./routes/availability.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const aiRoutes = require('./routes/ai.routes');
const resourceRoutes = require('./routes/resource.routes');

const app = express();

// ─── Security Middleware ────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = new Set([env.FRONTEND_URL, 'https://zilla-frontend-chi.vercel.app']);
if (env.NODE_ENV === 'development') {
  allowedOrigins.add('http://localhost:5173');
  allowedOrigins.add('http://127.0.0.1:5173');
  allowedOrigins.add('http://localhost:5174');
  allowedOrigins.add('http://127.0.0.1:5174');
  allowedOrigins.add('http://localhost:5175');
  allowedOrigins.add('http://localhost:5176');
  allowedOrigins.add('http://localhost:5177');
  allowedOrigins.add('http://localhost:5178');
  allowedOrigins.add('http://localhost:3000');
}

app.use(cors({
  origin: (origin, callback) => {
    if (env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Bypass-Tunnel-Reminder'],
}));

// ─── Body Parsing ───────────────────────────────────────────────────
// Raw body for webhook signature verification (must come BEFORE express.json)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  try {
    req.rawBody = req.body.toString('utf8');
    req.body = JSON.parse(req.rawBody);
    next();
  } catch {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_WEBHOOK_BODY',
        message: 'Request body must be valid JSON.',
      },
    });
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── General Rate Limiter ───────────────────────────────────────────
app.use(generalLimiter);

// ─── Health Check ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// ─── API Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/ai', aiRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist.',
    },
  });
});

// ─── Global Error Handler (must be LAST) ────────────────────────────
app.use(errorHandler);

module.exports = app;
