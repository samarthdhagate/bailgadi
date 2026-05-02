const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema.sql...');
    await client.query(schema);
    console.log('Database schema applied successfully!');

    // Optional: Seed some data
    console.log('Seeding initial data...');
    // Add logic here if needed
    
  } catch (err) {
    console.error('Error setting up database:', err.message);
  } finally {
    await client.end();
  }
}

setup();
