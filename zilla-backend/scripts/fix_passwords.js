const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'zilla-backend/.env' });

async function fix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const hash = await bcrypt.hash('password123', 12);
  await client.query('UPDATE users SET password_hash = $1, is_verified = TRUE', [hash]);
  console.log('All user passwords reset to password123 and all verified.');
  await client.end();
}
fix();
