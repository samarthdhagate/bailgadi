require('dotenv').config();
const { pool } = require('../src/config/db');

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, email, full_name, role, is_verified, google_id FROM users ORDER BY created_at DESC LIMIT 5');
    console.log('Last 5 users:', result.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error checking users:', err);
    process.exit(1);
  }
}

checkUsers();
