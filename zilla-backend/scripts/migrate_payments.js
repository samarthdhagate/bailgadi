const { Client } = require('pg');
require('dotenv').config();

async function fixConstraints() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  try {
    // 1. Update bookings status constraint
    await client.query('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check');
    await client.query("ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('confirmed', 'cancelled', 'rescheduled', 'no_show', 'pending_payment'))");
    console.log('✅ Updated bookings status constraint');

    // 2. Ensure payments has razorpay fields
    await client.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255)');
    await client.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255)');
    await client.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255)');
    console.log('✅ Updated payments table columns');

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

fixConstraints();
