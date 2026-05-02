require('dotenv').config();
const { pool } = require('./src/config/db');

async function fixServices() {
  try {
    console.log('Fixing services to enable advance payment and prices...');
    
    // Set all published services to have a price of 50 and advance_payment true
    const result = await pool.query(`
      UPDATE facilities 
      SET base_price = 50.00, advance_payment = true 
      WHERE name = 'Haircut & Styling' OR base_price = 0
      RETURNING name, base_price, advance_payment;
    `);
    
    console.log('Updated services:', result.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error fixing services:', err);
    process.exit(1);
  }
}

fixServices();
