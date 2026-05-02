/**
 * Authentication middleware.
 * - verifyToken: extracts and validates JWT from Authorization header
 * - requireRole: restricts access to specific user roles
 */

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Verify JWT access token from Authorization: Bearer <token>
 * Attaches req.user = { user_id, role }
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token is required. Provide it as: Authorization: Bearer <token>',
        },
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired. Please refresh your token.',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or malformed access token.',
      },
    });
  }
};

/**
 * Role-based access control.
 * Usage: requireRole('organiser', 'admin')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role(s): ${roles.join(', ')}`,
        },
      });
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
