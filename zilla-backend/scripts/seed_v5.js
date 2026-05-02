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

    const passwordHash = await bcrypt.hash('password123', 12);

    // 1. Create Users
    console.log('Seeding users...');
    
    // Admin
    await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
    `, ['System Admin', 'admin@zilla.com', passwordHash, 'admin', true]);

    // Organiser
    const orgRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
      RETURNING id
    `, ['Demo Organiser', 'organiser@zilla.com', passwordHash, 'organiser', true]);
    const organiserId = orgRes.rows[0].id;

    // Customer
    await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
    `, ['Demo Customer', 'customer@zilla.com', passwordHash, 'customer', true]);

    console.log('Users seeded successfully.');

    // 2. Create a Facility for the Organiser
    console.log('Seeding facility...');
    const facilityRes = await client.query(`
      INSERT INTO facilities (organiser_id, name, description, type, duration_mins, base_price, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [organiserId, 'Zilla Wellness Center', 'Professional healthcare and wellness consultations.', 'Healthcare', 60, 1500, 'published']);
    const facilityId = facilityRes.rows[0].id;
    console.log('Facility seeded successfully.');

    // 3. Create a Resource
    console.log('Seeding resource...');
    const resourceRes = await client.query(`
      INSERT INTO resources (facility_id, name, type)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [facilityId, 'Room A', 'Consultation Room']);
    const resourceId = resourceRes.rows[0].id;
    console.log('Resource seeded successfully.');

    // 4. Create some Time Slots
    console.log('Seeding time slots...');
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    for (let i = 0; i < 5; i++) {
      const start = new Date(today);
      start.setHours(today.getHours() + i);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);

      await client.query(`
        INSERT INTO time_slots (facility_id, resource_id, slot_start, slot_end, total_capacity, frozen_price, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [facilityId, resourceId, start.toISOString(), end.toISOString(), 1, 1500, 'available']);
    }
    console.log('Time slots seeded successfully.');

    console.log('✅ V5 Seeding complete!');
    console.log('Credentials: password123 for all accounts.');
    
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
  } finally {
    await client.end();
  }
}

seed();
