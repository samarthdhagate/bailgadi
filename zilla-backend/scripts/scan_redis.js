require('dotenv').config();
const Redis = require('ioredis');

async function testRedisManual() {
  const host = '103.97.164.106';
  const ports = [3000, 6379, 6380];
  
  console.log(`--- SCANNING REDIS PORTS ON ${host} ---`);
  
  for (const port of ports) {
    console.log(`Trying port ${port}...`);
    const redis = new Redis({
      host,
      port,
      connectTimeout: 3000,
      lazyConnect: true
    });
    
    try {
      await redis.connect();
      console.log(`✅ SUCCESS: Redis connected on port ${port}`);
      await redis.set('test_manual', 'working');
      const val = await redis.get('test_manual');
      console.log(`   Data verification: ${val}`);
      await redis.quit();
      process.exit(0);
    } catch (err) {
      console.log(`❌ FAILED: port ${port} (${err.message})`);
    }
  }
  
  console.log('--- ALL PORTS FAILED ---');
  process.exit(1);
}

testRedisManual();
