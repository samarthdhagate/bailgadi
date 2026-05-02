require('dotenv').config();
const { pool } = require('./src/config/db');

async function fixConstraints() {
  const client = await pool.connect();
  try {
    console.log('Fixing database constraints...');
    
    // Add unique constraint to bookings.reservation_id
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'bookings_reservation_id_unique'
        ) THEN 
          ALTER TABLE bookings ADD CONSTRAINT bookings_reservation_id_unique UNIQUE (reservation_id);
        END IF; 
      END $$;
    `);
    
    console.log('Successfully added unique constraint to bookings(reservation_id)');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing constraints:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

fixConstraints();
