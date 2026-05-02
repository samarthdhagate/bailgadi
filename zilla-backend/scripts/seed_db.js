const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create an Organiser User
    const userRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING id
    `, ['Demo Organiser', 'organiser@zilla.com', passwordHash, 'organiser', true]);
    
    const userId = userRes.rows[0].id;
    console.log('Created Organiser user');

    // 2. Create a Provider
    const providerRes = await client.query(`
      INSERT INTO providers (user_id)
      VALUES ($1)
      RETURNING id
    `, [userId]);
    
    const providerId = providerRes.rows[0].id;
    console.log('Created Provider');

    // 3. Create a Service
    await client.query(`
      INSERT INTO services (provider_id, name, duration_min, capacity, is_published, price)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [providerId, 'General Consultation', 30, 1, true, 500]);
    console.log('Created Service');

    console.log('Seeding complete!');
    
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    await client.end();
  }
}

seed();
