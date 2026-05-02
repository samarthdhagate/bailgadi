/**
 * Redis client using ioredis.
 * Standard implementation with graceful failure logging.
 */

const Redis = require('ioredis');
const { env } = require('./env');

let redis = null;
let redisAvailable = false;

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

try {
  redis = new Redis(redisConfig);

  redis.on('connect', () => {
    redisAvailable = true;
    console.log('🔴 Redis client connected successfully');
  });

  redis.on('error', (err) => {
    redisAvailable = false;
    console.warn('⚠️  Redis connection error:', err.message);
  });
} catch (err) {
  console.warn('⚠️  Redis initialization failed:', err.message);
}

/**
 * GET a key from Redis.
 */
const redisGet = async (key) => {
  if (!redisAvailable) return null;
  try {
    return await redis.get(key);
  } catch (err) {
    return null;
  }
};

/**
 * SET a key with NX and EX.
 */
const redisSetNX = async (key, value, ttlSeconds) => {
  if (!redisAvailable) return 'OK';
  try {
    const result = await redis.set(key, value, 'EX', ttlSeconds, 'NX');
    return result;
  } catch (err) {
    return 'OK';
  }
};

/**
 * DEL a key from Redis.
 */
const redisDel = async (key) => {
  if (!redisAvailable) return;
  try {
    await redis.del(key);
  } catch (err) {}
};

/**
 * Check if a key exists.
 */
const redisExists = async (key) => {
  if (!redisAvailable) return false;
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (err) {
    return false;
  }
};

module.exports = {
  redis,
  redisAvailable,
  redisGet,
  redisSetNX,
  redisDel,
  redisExists,
};
