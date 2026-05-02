/**
 * Simple structured logger wrapper.
 * Provides consistent JSON logging for production and readable logs for development.
 */

const { env } = require('../config/env');

const isProd = env.NODE_ENV === 'production';

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  if (isProd) {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  }
  
  const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
  const colors = {
    info: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m',
  };
  
  const color = colors[level] || colors.reset;
  return `${timestamp} ${color}${level.toUpperCase()}${colors.reset}: ${message}${metaStr}`;
};

const logger = {
  info: (message, meta) => console.log(formatMessage('info', message, meta)),
  warn: (message, meta) => console.warn(formatMessage('warn', message, meta)),
  error: (message, meta) => console.error(formatMessage('error', message, meta)),
  debug: (message, meta) => {
    if (!isProd) console.log(formatMessage('debug', message, meta));
  },
};

module.exports = logger;
