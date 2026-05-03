const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('--- STARTING RICH DATA SEEDING (V5) ---');

    const passwordHash = await bcrypt.hash('password123', 12);

    // 1. Create/Update Organiser
    const orgEmail = 'organiser@zilla.app';
    const orgRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
      RETURNING id
    `, ['Zilla Enterprise', orgEmail, passwordHash, 'organiser', true]);
    const organiserId = orgRes.rows[0].id;

    // 2. Clear existing facilities/images/resources for this organiser to avoid duplicates in this run
    // Note: In production you'd be more careful, but for "real values" demo, a clean slate is better.
    console.log('Cleaning existing data for organiser...');
    await client.query('DELETE FROM facilities WHERE organiser_id = $1', [organiserId]);

    const richServices = [
      {
        name: 'The Mindfulness Studio',
        type: 'Wellness',
        description: 'A serene space dedicated to meditation, breathwork, and mindfulness coaching. Our expert practitioners help you find clarity and calm in the chaos of modern life. Each session is tailored to your emotional and mental well-being.',
        duration_mins: 60,
        base_price: 1200.00,
        images: [
          'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&q=80&w=1000'
        ],
        resources: ['Serenity Room', 'Zen Garden Pod']
      },
      {
        name: 'Code & Coffee Coworking',
        type: 'Workspace',
        description: 'Where productivity meets premium caffeine. Book ergonomic hot desks or private meeting rooms equipped with 4K displays and high-speed fiber internet. Perfect for digital nomads and startup teams.',
        duration_mins: 120,
        base_price: 450.00,
        images: [
          'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'
        ],
        resources: ['Hot Desk A1', 'Meeting Room Blue', 'Focus Booth 1']
      },
      {
        name: 'Elite Performance Gym',
        type: 'Fitness',
        description: 'Premium personal training and athletic conditioning. We use bio-metric tracking and personalized nutrition plans to ensure you hit your peak performance. No crowds, just results.',
        duration_mins: 45,
        base_price: 2500.00,
        images: [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=1000'
        ],
        resources: ['Squat Rack 1', 'Cardio Zone', 'Private Training Suite']
      },
      {
        name: 'Artisan Pottery Workshop',
        type: 'Creative',
        description: 'Unleash your creativity with clay. Our workshops cover everything from wheel-throwing to hand-building and glazing. Take home your own handcrafted masterpieces.',
        duration_mins: 180,
        base_price: 3500.00,
        images: [
          'https://images.unsplash.com/photo-1565191999001-551c187427bb?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1493106641515-3269600e1291?auto=format&fit=crop&q=80&w=1000'
        ],
        resources: ['Wheel Station 1', 'Glazing Table', 'Kiln Access']
      },
      {
        name: 'Urban Dental Care',
        type: 'Healthcare',
        description: 'Modern dentistry with a gentle touch. From routine cleanings to advanced cosmetic procedures, we provide comprehensive oral health care in a relaxing, spa-like environment.',
        duration_mins: 30,
        base_price: 800.00,
        images: [
          'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1000'
        ],
        resources: ['Consultation Chair 1', 'X-Ray Suite']
      }
    ];

    for (const service of richServices) {
      console.log(`Creating facility: ${service.name}...`);
      const facRes = await client.query(`
        INSERT INTO facilities (organiser_id, name, description, type, duration_mins, base_price, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [organiserId, service.name, service.description, service.type, service.duration_mins, service.base_price, 'published']);
      const facilityId = facRes.rows[0].id;

      // Add Images
      for (let i = 0; i < service.images.length; i++) {
        await client.query(`
          INSERT INTO facility_images (facility_id, image_url, alt_text, display_order, is_primary)
          VALUES ($1, $2, $3, $4, $5)
        `, [facilityId, service.images[i], `${service.name} image ${i+1}`, i, i === 0]);
      }

      // Add Resources
      for (const resName of service.resources) {
        const resOutput = await client.query(`
          INSERT INTO resources (facility_id, name, type)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [facilityId, resName, service.type]);
        const resourceId = resOutput.rows[0].id;

        // Add some Time Slots for today and tomorrow
        const today = new Date();
        today.setHours(9, 0, 0, 0);

        for (let d = 0; d < 2; d++) {
          const date = new Date(today);
          date.setDate(today.getDate() + d);

          for (let h = 0; h < 6; h++) {
            const start = new Date(date);
            start.setHours(date.getHours() + h);
            const end = new Date(start);
            end.setMinutes(start.getMinutes() + service.duration_mins);

            await client.query(`
              INSERT INTO time_slots (facility_id, resource_id, slot_start, slot_end, total_capacity, frozen_price, status)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [facilityId, resourceId, start.toISOString(), end.toISOString(), 1, service.base_price, 'available']);
          }
        }
      }
    }

    console.log('✅ Rich data seeding complete!');
    console.log('Credentials: organiser@zilla.app / password123');

  } catch (err) {
    console.error('❌ Error seeding rich data:', err);
  } finally {
    await client.end();
  }
}

seed();
