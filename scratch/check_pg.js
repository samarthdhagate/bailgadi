const { Client } = require('pg');

async function checkPostgres() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '', // common default for local dev
  });

  try {
    await client.connect();
    console.log('✅ Connected to local PostgreSQL');
    await client.end();
  } catch (err) {
    console.error('❌ Could not connect to local PostgreSQL:', err.message);
    process.exit(1);
  }
}

checkPostgres();
