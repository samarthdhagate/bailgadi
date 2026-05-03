const { Client } = require('pg');
require('dotenv').config();

async function fixSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('--- STARTING SCHEMA FIX (V2) ---');

    // 1. Fix facility_images table (change facility_id from INTEGER to UUID)
    console.log('Fixing facility_images table...');
    await client.query(`
      DROP TABLE IF EXISTS facility_images;
      CREATE TABLE facility_images (
        id SERIAL PRIMARY KEY,
        facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt_text TEXT,
        display_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Add facility_staff table for user assignment
    console.log('Adding facility_staff table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS facility_staff (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'staff',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(facility_id, user_id)
      );
    `);

    // 3. Add location column to facilities
    console.log('Adding location column to facilities...');
    await client.query(`
      ALTER TABLE facilities ADD COLUMN IF NOT EXISTS location TEXT;
    `);

    console.log('✅ Schema fix complete!');

  } catch (err) {
    console.error('❌ Error fixing schema:', err);
  } finally {
    await client.end();
  }
}

fixSchema();
