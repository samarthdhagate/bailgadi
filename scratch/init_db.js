const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDb() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:zilla_pass@localhost:5432/zilla',
    ssl: false
  });

  try {
    console.log('⏳ Waiting for Postgres to be ready...');
    let connected = false;
    let retries = 10;
    while (!connected && retries > 0) {
      try {
        await pool.query('SELECT 1');
        connected = true;
      } catch (e) {
        retries--;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!connected) {
      console.error('❌ Postgres is not ready after retries.');
      process.exit(1);
    }

    console.log('✅ Connected to Postgres. Running schema...');
    const schema = fs.readFileSync(path.join(__dirname, '../zilla-backend/db/schema.sql'), 'utf8');
    
    // Split by semicolons, but be careful with functions/triggers if any
    // For this schema, simple split should work as it's mostly CREATE TABLE
    const statements = schema.split(';').filter(s => s.trim());
    
    for (let statement of statements) {
      await pool.query(statement);
    }

    console.log('🚀 Database initialized successfully!');
    await pool.end();
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1);
  }
}

initDb();
