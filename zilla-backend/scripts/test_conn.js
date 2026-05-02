require('dotenv').config();
const { redisGet, redisSetNX } = require('../src/config/redis');
const { query } = require('../src/config/db');

async function testConnections() {
  console.log('--- TESTING REDIS ---');
  try {
    const res = await redisSetNX('test_key', 'test_value', 60);
    console.log('Redis SET result:', res);
    const redisVal = await redisGet('test_key');
    console.log('Redis GET result:', redisVal);
    if (redisVal === 'test_value') {
      console.log('✅ Redis connected and working');
    } else {
      console.log('❌ Redis value mismatch');
    }
  } catch (err) {
    console.error('❌ Redis failed:', err.message);
  }

  console.log('--- TESTING POSTGRES ---');
  try {
    const dbRes = await query('SELECT NOW()');
    console.log('✅ PostgreSQL connected:', dbRes.rows[0].now);
  } catch (err) {
    console.error('❌ PostgreSQL failed:', err.message);
  }
  
  process.exit(0);
}

testConnections();
