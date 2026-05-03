/**
 * PostgreSQL connection pool using node-postgres (pg).
 * Connects to Neon serverless PostgreSQL with SSL.
 */

const { Pool } = require('pg');
const { env } = require('./env');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: (env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('10.20.20')) ? false : {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error', { error: err.message });
});

pool.on('connect', () => {
  if (env.NODE_ENV === 'development') {
    logger.info('📦 New PostgreSQL client connected');
  }
});

/**
 * Execute a parameterized SQL query.
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = { pool, query };
