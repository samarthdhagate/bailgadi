const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const users = [
  { full_name: 'Admin User', email: 'admin@zilla.com', password: 'password123', role: 'admin' },
  { full_name: 'Customer User', email: 'customer@zilla.com', password: 'password123', role: 'customer' },
  { full_name: 'Organiser User', email: 'organiser@zilla.com', password: 'password123', role: 'organiser' },
];

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to DB');

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 12);
      const res = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role, is_verified)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (email) DO UPDATE
           SET full_name = EXCLUDED.full_name,
               password_hash = EXCLUDED.password_hash,
               role = EXCLUDED.role,
               is_verified = EXCLUDED.is_verified
         RETURNING id, email, role`,
        [u.full_name, u.email, hash, u.role]
      );
      console.log('Upserted user:', res.rows[0]);

      if (u.role === 'organiser') {
        console.log('Organiser account ready for', u.email);
      }
    }

    // Show created users
    const check = await client.query(
      `SELECT id, full_name, email, role, is_verified, (password_hash IS NOT NULL) AS has_password
       FROM users
       WHERE email IN ('admin@zilla.com','customer@zilla.com','organiser@zilla.com')`);
    console.table(check.rows);

  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
