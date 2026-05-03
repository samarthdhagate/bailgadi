/**
 * Redis client using ioredis.
 * Standard implementation with graceful failure logging.
 */

const Redis = require('ioredis');
const { env } = require('./env');
const logger = require('../utils/logger');

let redis = null;
let redisAvailable = false;

// Enabled only when the user actually configured Redis (don’t treat env defaults as “enabled”).
const redisEnabled = Boolean(env.REDIS_URL || env.REDIS_HOST || env.REDIS_PORT);

const redisConfig = env.REDIS_URL || {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
  password: env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    // Only retry up to 3 times to prevent blocking the event loop on startup
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  }
};

if (redisEnabled) {
  try {
    redis = new Redis(redisConfig);

    redis.on('connect', () => {
      redisAvailable = true;
      logger.info('🔴 Redis client connected successfully');
    });

    redis.on('error', (err) => {
      redisAvailable = false;
      logger.warn('⚠️  Redis connection error', { error: err.message });
    });
  } catch (err) {
    logger.warn('⚠️  Redis initialization failed', { error: err.message });
  }
} else {
  if (env.NODE_ENV === 'development') {
    logger.info('ℹ️  Redis skipped: Not configured in .env');
  }
}

/**
 * Whether Redis is currently usable for reads/writes.
 * Exported as a function so callers don’t get a stale snapshot.
 */
const isRedisAvailable = () => redisAvailable && Boolean(redis);

/**
 * GET a key from Redis.
 */
const redisGet = async (key) => {
  if (!isRedisAvailable()) return null;
  try {
    return await redis.get(key);
  } catch (err) {
    return null;
  }
};

/**
 * MGET multiple keys from Redis.
 * Returns an array aligned to the input keys.
 */
const redisMGet = async (keys) => {
  if (!isRedisAvailable()) return keys.map(() => null);
  if (!Array.isArray(keys) || keys.length === 0) return [];

  try {
    return await redis.mget(keys);
  } catch (_err) {
    return keys.map(() => null);
  }
};

/**
 * SET a key with NX and EX.
 */
const redisSetNX = async (key, value, ttlSeconds) => {
  if (!isRedisAvailable()) return null;
  try {
    const result = await redis.set(key, value, 'EX', ttlSeconds, 'NX');
    return result;
  } catch (err) {
    return null;
  }
};

/**
 * DEL a key from Redis.
 */
const redisDel = async (key) => {
  if (!isRedisAvailable()) return;
  try {
    await redis.del(key);
  } catch (err) {}
};

/**
 * Check if a key exists.
 */
const redisExists = async (key) => {
  if (!isRedisAvailable()) return false;
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (err) {
    return false;
  }
};

/**
 * Get TTL of a key in seconds.
 * Returns -1 if key exists but has no expiration, -2 if key doesn't exist.
 */
const redisTTL = async (key) => {
  if (!isRedisAvailable()) return -2;
  try {
    const result = await redis.ttl(key);
    return result;
  } catch (err) {
    return -2;
  }
};

module.exports = {
  redis,
  redisEnabled,
  isRedisAvailable,
  redisGet,
  redisMGet,
  redisSetNX,
  redisDel,
  redisExists,
  redisTTL,
};
