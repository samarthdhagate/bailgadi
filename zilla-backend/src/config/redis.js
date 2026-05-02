/**
 * Upstash Redis client (REST-based).
 * Provides graceful degradation if Redis is unavailable.
 */

const { Redis } = require('@upstash/redis');
const { env } = require('./env');

let redis = null;
let redisAvailable = false;

if (env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN) {
  try {
    redis = new Redis({
      url: env.UPSTASH_REDIS_URL,
      token: env.UPSTASH_REDIS_TOKEN,
    });
    redisAvailable = true;
    console.log('🔴 Redis (Upstash) client initialized');
  } catch (err) {
    console.warn('⚠️  Redis initialization failed:', err.message);
  }
} else {
  console.warn('⚠️  Redis not configured — slot locking will use DB-only fallback');
}

/**
 * GET a key from Redis.
 * Returns null if Redis is unavailable.
 */
const redisGet = async (key) => {
  if (!redisAvailable) return null;
  try {
    return await redis.get(key);
  } catch (err) {
    console.warn('Redis GET error:', err.message);
    return null;
  }
};

/**
 * SET a key with NX (only if not exists) and EX (TTL in seconds).
 * Returns 'OK' if set, null if key already exists.
 * Returns null if Redis is unavailable.
 */
const redisSetNX = async (key, value, ttlSeconds) => {
  if (!redisAvailable) return 'OK'; // Fallback: always "succeeds", DB is final truth
  try {
    const result = await redis.set(key, value, { nx: true, ex: ttlSeconds });
    return result;
  } catch (err) {
    console.warn('Redis SET NX error:', err.message);
    return 'OK'; // Fallback: let DB handle concurrency
  }
};

/**
 * DEL a key from Redis.
 */
const redisDel = async (key) => {
  if (!redisAvailable) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.warn('Redis DEL error:', err.message);
  }
};

/**
 * Check if a key exists in Redis.
 * Returns false if Redis is unavailable.
 */
const redisExists = async (key) => {
  if (!redisAvailable) return false;
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (err) {
    console.warn('Redis EXISTS error:', err.message);
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
