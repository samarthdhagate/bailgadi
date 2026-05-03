require('dotenv').config();
const { query } = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
    
    // We need to drop old tables if they exist to avoid conflicts with the new schema
    // since we are moving from (services, providers) to (facilities, time_slots).
    console.log('Dropping old tables...');
    await query(`
      DROP TABLE IF EXISTS bookings CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS availability CASCADE;
      DROP TABLE IF EXISTS services CASCADE;
      DROP TABLE IF EXISTS providers CASCADE;
      DROP TABLE IF EXISTS facility_images CASCADE;
      DROP TABLE IF EXISTS resources CASCADE;
      DROP TABLE IF EXISTS time_slots CASCADE;
      DROP TABLE IF EXISTS reservations CASCADE;
      DROP TABLE IF EXISTS waitlist CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log('Applying new schema...');
    await query(schemaSql);
    console.log('Schema applied successfully.');

    // Seed a test organiser and a facility
    console.log('Seeding initial data...');
    const userRes = await query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ('Admin User', 'admin@zilla.app', '$2b$10$abcdefghijklmnopqrstuv', 'admin', true),
             ('Test Organiser', 'organiser@zilla.app', '$2b$10$abcdefghijklmnopqrstuv', 'organiser', true)
      RETURNING id, role
    `);
    
    const organiserId = userRes.rows.find(u => u.role === 'organiser').id;

    const facilityRes = await query(`
      INSERT INTO facilities (organiser_id, name, description, duration_mins, base_price, max_capacity, status, working_hours)
      VALUES ($1, 'Haircut & Styling', 'Professional styling and hair care.', 60, 50.00, 1, 'published', 
              '{"1":[{"start":"09:00","end":"17:00"}], "2":[{"start":"09:00","end":"17:00"}], "3":[{"start":"09:00","end":"17:00"}], "4":[{"start":"09:00","end":"17:00"}], "5":[{"start":"09:00","end":"17:00"}]}')
      RETURNING id
    `, [organiserId]);

    console.log('Seed completed. Facility ID:', facilityRes.rows[0].id);

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit();
  }
}

migrate();
