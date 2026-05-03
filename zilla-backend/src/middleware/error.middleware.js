/**
 * Global error handling middleware.
 * All errors propagated via next(err) land here.
 */

const { env } = require('../config/env');

/**
 * Custom application error class.
 * Usage: throw new AppError('Slot already booked', 409, 'SLOT_TAKEN');
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler — must be registered LAST in Express middleware chain.
 */
const errorHandler = (err, req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred.';

  // express-validator errors
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired.';
  }

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'A record with this value already exists.';
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    code = 'REFERENCE_ERROR';
    message = 'Referenced record does not exist.';
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`, {
      code,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: env.NODE_ENV === 'production' && statusCode >= 500
        ? 'An unexpected error occurred.'
        : message,
    },
  });
};

module.exports = { AppError, errorHandler };
