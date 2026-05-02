const { Client } = require('pg');
require('dotenv').config();

async function inspectTable(name) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${name}'`);
  console.log(`${name} columns:`, res.rows.map(r => r.column_name));
  await client.end();
}

inspectTable('bookings');
