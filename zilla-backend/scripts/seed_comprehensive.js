const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'zilla-backend/.env' });

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    const passwordHash = await bcrypt.hash('password123', 12);

    // 1. Create/Update Demo Organiser
    const orgRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id
    `, ['Demo Organiser', 'organiser@zilla.com', passwordHash, 'organiser', true]);
    const organiserId = orgRes.rows[0].id;

    // 2. Clear existing facilities for a clean state
    await client.query('DELETE FROM facilities WHERE organiser_id = $1', [organiserId]);

    const servicesData = [
      { name: 'Haircut & Styling', type: 'Beauty', price: 500, duration: 45, resources: ['Chair 1', 'Chair 2', 'VIP Booth'] },
      { name: 'Dental Checkup', type: 'Healthcare', price: 1000, duration: 30, resources: ['Dental Lab A', 'Dental Lab B'] },
      { name: 'Personal Training', type: 'Fitness', price: 1200, duration: 60, resources: ['Private Gym Area', 'Yoga Studio'] },
      { name: 'Legal Consultation', type: 'Professional', price: 2000, duration: 60, resources: ['Meeting Room 1', 'Meeting Room 2', 'Executive Office'] },
      { name: 'Massage Therapy', type: 'Wellness', price: 1500, duration: 90, resources: ['Spa Room 1', 'Spa Room 2'] },
      { name: 'Math Tutoring', type: 'Education', price: 800, duration: 60, resources: ['Classroom 101', 'Online Room A'] },
      { name: 'Car Detailing', type: 'Automotive', price: 3000, duration: 120, resources: ['Bay 1', 'Bay 2'] },
      { name: 'Photography Session', type: 'Creative', price: 5000, duration: 180, resources: ['Indoor Studio', 'Outdoor Garden'] },
      { name: 'Pet Grooming', type: 'Services', price: 700, duration: 45, resources: ['Grooming Station 1', 'Grooming Station 2'] },
      { name: 'Tech Support', type: 'IT', price: 0, duration: 15, resources: ['Help Desk', 'Remote Desk'] }
    ];

    console.log('Seeding 10 services (facilities)...');
    for (const s of servicesData) {
      const facilityRes = await client.query(`
        INSERT INTO facilities (organiser_id, name, type, base_price, duration_mins, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [organiserId, s.name, s.type, s.price, s.duration, 'published']);
      
      const facilityId = facilityRes.rows[0].id;
      console.log(`- Created ${s.name}`);

      if (s.resources) {
        console.log(`  - Adding ${s.resources.length} resources...`);
        for (const rName of s.resources) {
          await client.query(`
            INSERT INTO resources (facility_id, name, type)
            VALUES ($1, $2, $3)
          `, [facilityId, rName, s.type]);
        }
      }
    }

    console.log('\n✅ Comprehensive seeding complete!');
    console.log('Organiser: organiser@zilla.com / password123');
    
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
  } finally {
    await client.end();
  }
}

seed();
