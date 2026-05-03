const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'zilla-backend/.env' });

async function reset() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    console.log('Dropping all tables...');
    await client.query(`
      DROP TABLE IF EXISTS booking_events CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS bookings CASCADE;
      DROP TABLE IF EXISTS waitlist CASCADE;
      DROP TABLE IF EXISTS reservations CASCADE;
      DROP TABLE IF EXISTS time_slots CASCADE;
      DROP TABLE IF EXISTS resources CASCADE;
      DROP TABLE IF EXISTS facility_staff CASCADE;
      DROP TABLE IF EXISTS facility_images CASCADE;
      DROP TABLE IF EXISTS facilities CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS providers CASCADE;
      DROP TABLE IF EXISTS services CASCADE;
    `);

    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema.sql...');
    await client.query(schema);
    console.log('Database schema applied successfully!');

    console.log('Running seed_db.js...');
    // We can just require it if it's designed to run on import, 
    // but better to run it as a separate process or just call its logic.
    // Since seed_db.js calls seed() at the end, requiring it will run it.
    require('./seed_db.js');
    
  } catch (err) {
    console.error('Error resetting database:', err.message);
  } finally {
    // Wait a bit for seed_db to finish if it's async (seed_db.js calls process.exit or client.end)
    // Actually seed_db.js ends the client it creates.
  }
}

reset();
