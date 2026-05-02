require('dotenv').config();
const { query } = require('../src/config/db');

async function check() {
  try {
    const res = await query('SELECT id, name FROM facilities LIMIT 5');
    console.log('Facilities:', res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

check();
