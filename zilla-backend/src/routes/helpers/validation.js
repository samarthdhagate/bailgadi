/**
 * Shared validation helper for express-validator.
 */

const { validationResult } = require('express-validator');

/**
 * Middleware that checks for validation errors from express-validator.
 * If errors exist, returns 400 with structured error response.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: messages.join(' '),
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      },
    });
  }

  next();
};

module.exports = { validateRequest };
