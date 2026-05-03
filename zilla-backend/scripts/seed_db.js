const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'zilla-backend/.env' });

const TARGET_USER_COUNT = 500;

const organiserProfiles = [
  {
    full_name: 'Aarav Menon',
    email: 'aarav.menon@zilla.com',
    password: 'Aarav@2026!',
    facility_name: 'Serene Roots Wellness',
    type: 'Wellness',
    description: 'Mindfulness coaching, breathwork, and guided stress relief sessions in a calm private studio.',
    duration_mins: 60,
    base_price: 1200,
    resource_name: 'Serenity Room',
  },
  {
    full_name: 'Priya Iyer',
    email: 'priya.iyer@zilla.com',
    password: 'Priya@2026!',
    facility_name: 'Lotus Dental Care',
    type: 'Healthcare',
    description: 'Routine consultations, cleanings, and preventive dental care with a warm patient-first approach.',
    duration_mins: 30,
    base_price: 900,
    resource_name: 'Consultation Suite',
  },
  {
    full_name: 'Kabir Shah',
    email: 'kabir.shah@zilla.com',
    password: 'Kabir@2026!',
    facility_name: 'Shutter & Frame Studio',
    type: 'Creative',
    description: 'Portraits, product shoots, and short-form creative sessions with lighting and backdrop support.',
    duration_mins: 90,
    base_price: 3500,
    resource_name: 'Portrait Set',
  },
  {
    full_name: 'Neha Kapoor',
    email: 'neha.kapoor@zilla.com',
    password: 'Neha@2026!',
    facility_name: 'Cedar Skin Clinic',
    type: 'Wellness',
    description: 'Skin consultations, facials, and tailored wellness rituals for busy professionals.',
    duration_mins: 45,
    base_price: 1800,
    resource_name: 'Treatment Room 1',
  },
  {
    full_name: 'Rohan Das',
    email: 'rohan.das@zilla.com',
    password: 'Rohan@2026!',
    facility_name: 'Peak Motion Fitness',
    type: 'Fitness',
    description: 'One-on-one training, mobility work, and strength sessions built around measurable goals.',
    duration_mins: 60,
    base_price: 1500,
    resource_name: 'Training Floor',
  },
  {
    full_name: 'Meera Nair',
    email: 'meera.nair@zilla.com',
    password: 'Meera@2026!',
    facility_name: 'Blue Pine Legal Desk',
    type: 'Professional',
    description: 'Focused legal consultations for contracts, registrations, and small business compliance.',
    duration_mins: 45,
    base_price: 2200,
    resource_name: 'Conference Room A',
  },
  {
    full_name: 'Arjun Verma',
    email: 'arjun.verma@zilla.com',
    password: 'Arjun@2026!',
    facility_name: 'Sharp Edge Barbershop',
    type: 'Beauty',
    description: 'Precision cuts, beard grooming, and styling services with short walk-in friendly slots.',
    duration_mins: 30,
    base_price: 650,
    resource_name: 'Chair 1',
  },
  {
    full_name: 'Sana Khan',
    email: 'sana.khan@zilla.com',
    password: 'Sana@2026!',
    facility_name: 'Mentor Circle Tutoring',
    type: 'Education',
    description: 'Math, science, and exam prep tutoring for students who need structured weekly support.',
    duration_mins: 60,
    base_price: 1000,
    resource_name: 'Study Room',
  },
  {
    full_name: 'Vikram Rao',
    email: 'vikram.rao@zilla.com',
    password: 'Vikram@2026!',
    facility_name: 'Copper Spoon Culinary Lab',
    type: 'Workshop',
    description: 'Hands-on cooking classes, menu testing, and small group culinary experiences.',
    duration_mins: 120,
    base_price: 2500,
    resource_name: 'Chef Station',
  },
  {
    full_name: 'Ananya Bose',
    email: 'ananya.bose@zilla.com',
    password: 'Ananya@2026!',
    facility_name: 'Open Door Counseling',
    type: 'Wellness',
    description: 'Confidential counseling sessions for work stress, burnout, and relationship support.',
    duration_mins: 50,
    base_price: 1700,
    resource_name: 'Private Office',
  },
  {
    full_name: 'Imran Qureshi',
    email: 'imran.qureshi@zilla.com',
    password: 'Imran@2026!',
    facility_name: 'Polish Auto Care',
    type: 'Automotive',
    description: 'Interior detailing, ceramic polish, and inspection-ready finishing for personal vehicles.',
    duration_mins: 90,
    base_price: 3200,
    resource_name: 'Bay 1',
  },
  {
    full_name: 'Kavya Jain',
    email: 'kavya.jain@zilla.com',
    password: 'Kavya@2026!',
    facility_name: 'Glow Ritual Spa',
    type: 'Wellness',
    description: 'Facials, massage therapy, and restorative treatments in a boutique spa setting.',
    duration_mins: 75,
    base_price: 2100,
    resource_name: 'Spa Suite A',
  },
  {
    full_name: 'Dev Patel',
    email: 'dev.patel@zilla.com',
    password: 'Dev@2026!',
    facility_name: 'Rhythm House Music School',
    type: 'Creative',
    description: 'Piano, guitar, and vocal coaching for beginners and intermediate learners.',
    duration_mins: 45,
    base_price: 1100,
    resource_name: 'Practice Room',
  },
  {
    full_name: 'Ishita Roy',
    email: 'ishita.roy@zilla.com',
    password: 'Ishita@2026!',
    facility_name: 'Harbor Cowork Lounge',
    type: 'Workspace',
    description: 'Private desk bookings and small meeting rooms for freelancers and remote teams.',
    duration_mins: 120,
    base_price: 800,
    resource_name: 'Meeting Pod',
  },
  {
    full_name: 'Rahul Sethi',
    email: 'rahul.sethi@zilla.com',
    password: 'Rahul@2026!',
    facility_name: 'Pawprints Grooming Studio',
    type: 'Services',
    description: 'Gentle pet grooming and washing sessions for dogs and cats in a calm environment.',
    duration_mins: 60,
    base_price: 900,
    resource_name: 'Grooming Table',
  },
  {
    full_name: 'Tanya Malhotra',
    email: 'tanya.malhotra@zilla.com',
    password: 'Tanya@2026!',
    facility_name: 'Lingua Flow Academy',
    type: 'Education',
    description: 'Language coaching for English speaking, interview prep, and professional communication.',
    duration_mins: 50,
    base_price: 1300,
    resource_name: 'Seminar Room',
  },
  {
    full_name: 'Nikhil Chandra',
    email: 'nikhil.chandra@zilla.com',
    password: 'Nikhil@2026!',
    facility_name: 'Ledger Point Advisory',
    type: 'Professional',
    description: 'Accounting, tax, and business bookkeeping consultations for startups and SMEs.',
    duration_mins: 45,
    base_price: 2400,
    resource_name: 'Advisory Desk',
  },
  {
    full_name: 'Pooja Kulkarni',
    email: 'pooja.kulkarni@zilla.com',
    password: 'Pooja@2026!',
    facility_name: 'Tranquil Touch Spa',
    type: 'Wellness',
    description: 'Massage therapy, relaxation treatments, and evening recovery packages.',
    duration_mins: 90,
    base_price: 2600,
    resource_name: 'Therapy Room',
  },
  {
    full_name: 'Suresh Pillai',
    email: 'suresh.pillai@zilla.com',
    password: 'Suresh@2026!',
    facility_name: 'North Star IT Support',
    type: 'IT',
    description: 'Hardware troubleshooting, laptop setup, and remote tech support appointments.',
    duration_mins: 30,
    base_price: 700,
    resource_name: 'Help Desk',
  },
  {
    full_name: 'Fatima Ali',
    email: 'fatima.ali@zilla.com',
    password: 'Fatima@2026!',
    facility_name: 'Evergreen Events Studio',
    type: 'Events',
    description: 'Event planning consultations, décor concepts, and venue coordination sessions.',
    duration_mins: 60,
    base_price: 2000,
    resource_name: 'Planning Studio',
  },
];

const buildSlotSet = (startDayOffset, durationMins, basePrice) => {
  const slots = [];
  const hourOffsets = [9, 11, 14];

  for (let day = 0; day < 2; day += 1) {
    for (const hour of hourOffsets) {
      const start = new Date();
      start.setDate(start.getDate() + startDayOffset + day);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + durationMins);

      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        price: basePrice,
      });
    }
  }

  return slots;
};

const buildBookingNotes = (organiserName, facilityName) => {
  return {
    note: `Seeded booking for ${organiserName} at ${facilityName}.`,
    source: 'seed_db.js',
  };
};

const buildSampleUsers = (count, startIndex) => {
  return Array.from({ length: count }, (_, offset) => {
    const index = startIndex + offset;

    return {
      full_name: `Sample User ${String(index).padStart(3, '0')}`,
      email: `sample-user-${String(index).padStart(4, '0')}@zilla.com`,
      role: index % 25 === 0 ? 'organiser' : 'customer',
    };
  });
};

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    const passwordHash = await bcrypt.hash('password123', 10);
    const organiserSeeds = [];

    // 1. Create Core Test Users
    console.log('Seeding core test users...');
    
    // Admin
    await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash
    `, ['System Admin', 'admin@zilla.com', passwordHash, 'admin', true]);

    // Customer
    await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash
    `, ['Demo Customer', 'customer@zilla.com', passwordHash, 'customer', true]);

    // Organiser
    const userRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash
      RETURNING id
    `, ['Demo Organiser', 'organiser@zilla.com', passwordHash, 'organiser', true]);
    
    const userId = userRes.rows[0].id;
    console.log('Core test users seeded (admin, customer, organiser @zilla.com)');

    let providerId = null;
    const providerRelation = await client.query("SELECT to_regclass('public.providers') AS relation");
    if (providerRelation.rows[0].relation) {
      const providerRes = await client.query(`
        INSERT INTO providers (user_id)
        VALUES ($1)
        RETURNING id
      `, [userId]);

      providerId = providerRes.rows[0].id;
      console.log('Created Provider');
    } else {
      console.log('Skipping provider seeding; public.providers is not available in this schema.');
    }

    const serviceRelation = await client.query("SELECT to_regclass('public.services') AS relation");
    if (providerId && serviceRelation.rows[0].relation) {
      await client.query(`
        INSERT INTO services (provider_id, name, duration_min, capacity, is_published, price)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [providerId, 'General Consultation', 30, 1, true, 500]);
      console.log('Created Service');
    } else {
      console.log('Skipping service seeding; public.services is not available in this schema.');
    }

    const countRes = await client.query('SELECT COUNT(*)::int AS count FROM users');
    const currentCount = countRes.rows[0].count;
    const missingCount = Math.max(0, TARGET_USER_COUNT - currentCount);

    if (missingCount > 0) {
      console.log(`Creating ${missingCount} sample users to reach ${TARGET_USER_COUNT} total users...`);
      const sampleUsers = buildSampleUsers(missingCount, currentCount + 1);

      // Batch insert in chunks of 100 to avoid query string length issues
      const BATCH_SIZE = 100;
      for (let i = 0; i < sampleUsers.length; i += BATCH_SIZE) {
        const batch = sampleUsers.slice(i, i + BATCH_SIZE);
        
        // Build multi-row VALUES insert
        const values = [];
        const params = [];
        let paramIndex = 1;

        batch.forEach((user) => {
          values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, true)`);
          params.push(user.full_name, user.email, passwordHash, user.role);
          paramIndex += 4;
        });

        const sql = `
          INSERT INTO users (full_name, email, password_hash, role, is_verified)
          VALUES ${values.join(', ')}
          ON CONFLICT (email) DO UPDATE
            SET full_name = EXCLUDED.full_name,
                password_hash = EXCLUDED.password_hash,
                role = EXCLUDED.role,
                is_verified = EXCLUDED.is_verified
        `;

        try {
          const result = await client.query(sql, params);
          console.log(`  - Batch ${Math.floor(i / BATCH_SIZE) + 1}: Inserted/updated ${batch.length} users`);
        } catch (err) {
          console.error(`  - Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, err.message);
          throw err;
        }
      }

      console.log(`✅ Created or updated ${sampleUsers.length} sample users.`);
    } else {
      console.log(`Skipping sample user generation; ${currentCount} users already exist.`);
    }

    console.log('Seeding 20 realistic organisers with facilities and time slots...');
    const seededBookings = [];
    for (let i = 0; i < organiserProfiles.length; i += 1) {
      const profile = organiserProfiles[i];
      const organiserHash = await bcrypt.hash(profile.password, 10);

      const organiserRes = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role, is_verified)
         VALUES ($1, $2, $3, 'organiser', true)
         ON CONFLICT (email) DO UPDATE
           SET full_name = EXCLUDED.full_name,
               password_hash = EXCLUDED.password_hash,
               role = EXCLUDED.role,
               is_verified = EXCLUDED.is_verified
         RETURNING id`,
        [profile.full_name, profile.email, organiserHash]
      );

      const organiserId = organiserRes.rows[0].id;
      const existingFacility = await client.query(
        `SELECT id FROM facilities WHERE organiser_id = $1 AND name = $2 LIMIT 1`,
        [organiserId, profile.facility_name]
      );

      let facilityId = existingFacility.rows[0]?.id || null;
      let resourceId = null;

      if (!facilityId) {
        const facilityRes = await client.query(
          `INSERT INTO facilities (
             organiser_id, name, description, type, duration_mins, base_price,
             advance_payment, manage_capacity, max_capacity, schedule_type,
             working_hours, working_tz, questions_schema, cancellation_hrs,
             intro_message, confirm_message, manual_confirm, assignment_mode,
             booking_mode, status, config
           )
           VALUES ($1, $2, $3, $4, $5, $6,
                   false, false, 1, 'weekly',
                   $7, 'Asia/Kolkata', '[]', 1,
                   $8, $9, false, 'auto',
                   'slot', 'published', '{}')
           RETURNING id`,
          [
            organiserId,
            profile.facility_name,
            profile.description,
            profile.type,
            profile.duration_mins,
            profile.base_price,
            JSON.stringify({ mon: ['09:00-17:00'], tue: ['09:00-17:00'] }),
            `Welcome to ${profile.facility_name}. Book a private session with ${profile.full_name}.`,
            `Thanks for booking ${profile.facility_name}. We will confirm your slot shortly.`,
          ]
        );

        facilityId = facilityRes.rows[0].id;

        const resourceRes = await client.query(
          `INSERT INTO resources (facility_id, name, type, metadata)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [facilityId, profile.resource_name, profile.type, JSON.stringify({ seeded: true })]
        );

        resourceId = resourceRes.rows[0].id;

        const slotSet = buildSlotSet(i % 3, profile.duration_mins, profile.base_price);
        for (const slot of slotSet) {
          await client.query(
            `INSERT INTO time_slots (
               facility_id, resource_id, slot_start, slot_end, total_capacity,
               frozen_price, status
             )
             VALUES ($1, $2, $3, $4, 1, $5, 'available')`,
            [facilityId, resourceId, slot.start, slot.end, slot.price]
          );
        }
      } else {
        const resourceRes = await client.query(
          `SELECT id FROM resources WHERE facility_id = $1 AND name = $2 LIMIT 1`,
          [facilityId, profile.resource_name]
        );
        resourceId = resourceRes.rows[0]?.id || null;

        if (!resourceId) {
          const resourceResInsert = await client.query(
            `INSERT INTO resources (facility_id, name, type, metadata)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [facilityId, profile.resource_name, profile.type, JSON.stringify({ seeded: true })]
          );
          resourceId = resourceResInsert.rows[0].id;
        }

        const slotCountRes = await client.query(
          `SELECT COUNT(*)::int AS count FROM time_slots WHERE facility_id = $1`,
          [facilityId]
        );

        if (slotCountRes.rows[0].count === 0) {
          const slotSet = buildSlotSet(i % 3, profile.duration_mins, profile.base_price);
          for (const slot of slotSet) {
            await client.query(
              `INSERT INTO time_slots (
                 facility_id, resource_id, slot_start, slot_end, total_capacity,
                 frozen_price, status
               )
               VALUES ($1, $2, $3, $4, 1, $5, 'available')`,
              [facilityId, resourceId, slot.start, slot.end, slot.price]
            );
          }
        }
      }

      organiserSeeds.push({
        id: organiserId,
        full_name: profile.full_name,
        email: profile.email,
        password: profile.password,
        facility: profile.facility_name,
      });
    }

    const customerRows = await client.query(
      `SELECT id, full_name, email
       FROM users
       WHERE role = 'customer'
       ORDER BY created_at ASC
       LIMIT 40`
    );

    const facilityRows = await client.query(
      `SELECT f.id AS facility_id, f.organiser_id, f.name AS facility_name, f.duration_mins, f.base_price, r.id AS resource_id, u.full_name AS organiser_name
       FROM facilities f
       JOIN resources r ON r.facility_id = f.id
       JOIN users u ON u.id = f.organiser_id
       WHERE u.email = ANY($1)
       ORDER BY f.created_at ASC`,
      [organiserProfiles.map((profile) => profile.email)]
    );

    for (let i = 0; i < facilityRows.rows.length; i += 1) {
      const facility = facilityRows.rows[i];
      const customer = customerRows.rows[i % customerRows.rows.length];

      const slotRes = await client.query(
        `SELECT id, slot_start, slot_end, frozen_price
         FROM time_slots
         WHERE facility_id = $1 AND status = 'available'
         ORDER BY slot_start ASC
         LIMIT 1`,
        [facility.facility_id]
      );

      if (slotRes.rows.length === 0) {
        continue;
      }

      const slot = slotRes.rows[0];
      const attendeeCount = 1;
      const idempotencyKey = `seed-res-${facility.facility_id}-${customer.id}`;

      const existingBooking = await client.query(
        `SELECT id, confirmation_code
         FROM bookings
         WHERE slot_id = $1 AND customer_id = $2 AND status = 'confirmed'
         LIMIT 1`,
        [slot.id, customer.id]
      );

      if (existingBooking.rows.length > 0) {
        continue;
      }

      const existingReservation = await client.query(
        `SELECT id, frozen_price, status
         FROM reservations
         WHERE idempotency_key = $1
         LIMIT 1`,
        [idempotencyKey]
      );

      let reservation = existingReservation.rows[0] || null;
      if (reservation && reservation.status !== 'holding') {
        continue;
      }

      if (!reservation) {
        const reservationRes = await client.query(
          `INSERT INTO reservations (
             slot_id, customer_id, facility_id, attendee_count, answers, idempotency_key, redis_key
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, frozen_price, status`,
          [
            slot.id,
            customer.id,
            facility.facility_id,
            attendeeCount,
            JSON.stringify(buildBookingNotes(facility.organiser_name, facility.facility_name)),
            idempotencyKey,
            `slot:lock:${slot.id}:${customer.id}`,
          ]
        );
        reservation = reservationRes.rows[0];
      }

      const paymentAmount = Number(reservation.frozen_price || slot.frozen_price || facility.base_price) || 1;
      const existingPayment = await client.query(
        `SELECT id, booking_id, amount
         FROM payments
         WHERE reservation_id = $1
         LIMIT 1`,
        [reservation.id]
      );

      let paymentId = existingPayment.rows[0]?.id || null;
      if (existingPayment.rows[0]?.booking_id) {
        continue;
      }

      if (!paymentId) {
        const paymentRes = await client.query(
          `INSERT INTO payments (reservation_id, amount, currency, status, gateway_txn_id, order_id)
           VALUES ($1, $2, 'INR', 'success', $3, $4)
           RETURNING id`,
          [
            reservation.id,
            paymentAmount,
            `seed-txn-${facility.facility_id.slice(0, 8)}-${customer.id.slice(0, 8)}`,
            `seed-order-${facility.facility_id.slice(0, 8)}-${customer.id.slice(0, 8)}`,
          ]
        );
        paymentId = paymentRes.rows[0].id;
      }

      const bookingRes = await client.query(
        `INSERT INTO bookings (
           customer_id, facility_id, resource_id, slot_id, reservation_id,
           attendee_count, answers, total_price, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed')
         RETURNING id, confirmation_code`,
        [
          customer.id,
          facility.facility_id,
          facility.resource_id,
          slot.id,
          reservation.id,
          attendeeCount,
          JSON.stringify(buildBookingNotes(facility.organiser_name, facility.facility_name)),
          paymentAmount * attendeeCount,
        ]
      );

      await client.query(
        `UPDATE payments SET booking_id = $1 WHERE id = $2`,
        [bookingRes.rows[0].id, paymentId]
      );

      seededBookings.push({
        booking_id: bookingRes.rows[0].id,
        confirmation_code: bookingRes.rows[0].confirmation_code,
        organiser: facility.organiser_name,
        facility: facility.facility_name,
        customer: customer.full_name,
      });
    }

    console.table(seededBookings);

    console.table(organiserSeeds.map(({ id, full_name, email, password, facility }) => ({
      id,
      full_name,
      email,
      password,
      facility,
    })));

    console.log('Seeding complete!');
    
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    await client.end();
  }
}

seed();
