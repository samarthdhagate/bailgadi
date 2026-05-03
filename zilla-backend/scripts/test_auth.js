const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'zilla-backend/.env' });

async function test() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const res = await client.query('SELECT email, password_hash FROM users WHERE email = $1', ['admin@zilla.com']);
  if (res.rows.length === 0) {
    console.log('User not found');
  } else {
    const user = res.rows[0];
    const match = await bcrypt.compare('password123', user.password_hash);
    console.log(`Email: ${user.email}`);
    console.log(`Hash: ${user.password_hash}`);
    console.log(`Match: ${match}`);
  }
  await client.end();
}
test();
