require('dotenv').config();
const { pool } = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const client = await pool.connect();
  try {
    const email = 'admin@gmail.com';
    const password = '11223344';
    const fullName = 'System Admin';
    const role = 'admin';

    console.log(`Checking if admin user exists: ${email}...`);
    const checkRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);

    if (checkRes.rows.length > 0) {
      console.log('Admin user already exists. Updating password...');
      const passwordHash = await bcrypt.hash(password, 10);
      await client.query(
        'UPDATE users SET password_hash = $1, role = $2, is_verified = TRUE WHERE email = $3',
        [passwordHash, role, email]
      );
    } else {
      console.log('Creating new admin user...');
      const passwordHash = await bcrypt.hash(password, 10);
      await client.query(
        `INSERT INTO users (full_name, email, password_hash, role, is_verified)
         VALUES ($1, $2, $3, $4, TRUE)`,
        [fullName, email, passwordHash, role]
      );
    }

    console.log('✅ Admin account successfully created/updated.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

createAdmin();
