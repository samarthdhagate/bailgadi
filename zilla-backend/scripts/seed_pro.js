const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('--- STARTING REAL DATABASE SEEDING ---');

    const passwordHash = await bcrypt.hash('password123', 10);

    const providers = [
      { name: 'Dr. Sarah Smith', email: 'dr.smith@zilla.com', role: 'organiser', services: [
        { name: 'Medical Consultation', duration: 20, capacity: 1 },
        { name: 'Full Health Checkup', duration: 60, capacity: 1 }
      ], hours: [
        { day: 1, start: '09:00', end: '17:00' },
        { day: 2, start: '09:00', end: '17:00' },
        { day: 3, start: '09:00', end: '17:00' },
        { day: 4, start: '09:00', end: '17:00' },
        { day: 5, start: '09:00', end: '13:00' }
      ]},
      { name: 'James Wilson (Tax Expert)', email: 'james@wilson-tax.com', role: 'organiser', services: [
        { name: 'Tax Filing Assistant', duration: 45, capacity: 2 },
        { name: 'Audit Consultation', duration: 90, capacity: 1 }
      ], hours: [
        { day: 1, start: '10:00', end: '18:00' },
        { day: 2, start: '10:00', end: '18:00' },
        { day: 4, start: '10:00', end: '18:00' }
      ]},
      { name: 'TechHub Co-working', email: 'admin@techhub.com', role: 'organiser', services: [
        { name: 'Conference Room A', duration: 60, capacity: 10 }
      ], hours: [
        { day: 1, start: '00:00', end: '23:59' },
        { day: 2, start: '00:00', end: '23:59' },
        { day: 3, start: '00:00', end: '23:59' },
        { day: 4, start: '00:00', end: '23:59' },
        { day: 5, start: '00:00', end: '23:59' },
        { day: 6, start: '00:00', end: '23:59' },
        { day: 0, start: '00:00', end: '23:59' }
      ]}
    ];

    for (const p of providers) {
      // 1. Ensure user exists
      let userRes = await client.query('SELECT id FROM users WHERE email = $1', [p.email]);
      let userId;
      
      if (userRes.rows.length === 0) {
        userRes = await client.query(`
          INSERT INTO users (full_name, email, password_hash, role, is_verified)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [p.name, p.email, passwordHash, p.role, true]);
        userId = userRes.rows[0].id;
        console.log(`👤 Created user: ${p.name}`);
      } else {
        userId = userRes.rows[0].id;
      }
      
      // 2. Ensure provider exists for this user
      let provRes = await client.query('SELECT id FROM providers WHERE user_id = $1', [userId]);
      let providerId;
      
      if (provRes.rows.length === 0) {
        provRes = await client.query(`
          INSERT INTO providers (user_id)
          VALUES ($1)
          RETURNING id
        `, [userId]);
        providerId = provRes.rows[0].id;
        console.log(`📦 Created provider profile for: ${p.name}`);
      } else {
        providerId = provRes.rows[0].id;
      }

      // 3. Clear existing services/availability for this provider
      await client.query('DELETE FROM services WHERE provider_id = $1', [providerId]);
      await client.query('DELETE FROM availability WHERE provider_id = $1', [providerId]);

      for (const s of p.services) {
        await client.query(`
          INSERT INTO services (provider_id, name, duration_min, capacity, is_published)
          VALUES ($1, $2, $3, $4, $5)
        `, [providerId, s.name, s.duration, s.capacity, true]);
      }

      for (const h of p.hours) {
        await client.query(`
          INSERT INTO availability (provider_id, day_of_week, start_time, end_time)
          VALUES ($1, $2, $3, $4)
        `, [providerId, h.day, h.start, h.end]);
      }

      console.log(`✅ Seeded REAL data for: ${p.name}`);
    }

    // Add a Customer user
    await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['Test Customer', 'customer@test.com', passwordHash, 'customer', true]);
    console.log('✅ Seeded Test Customer (customer@test.com / password123)');

    console.log('\n🚀 DATABASE SEEDING COMPLETE WITH REAL DATA!');
    
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
  } finally {
    await client.end();
  }
}

seed();
