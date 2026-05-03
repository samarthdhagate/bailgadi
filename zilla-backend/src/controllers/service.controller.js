/**
 * Service controller — handles CRUD for organiser facilities (services).
 * Business logic is simple enough to live directly in the controller.
 */

const { query, pool } = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

const isUuid = (value) => (
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value))
);

const DAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const isValidDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
const isValidTimeString = (value) => /^\d{2}:\d{2}$/.test(String(value || ''));
const hasUsableAvailability = (value) => Array.isArray(value) && value.some((row) => {
  if (!row || !isValidTimeString(row.startTime) || !isValidTimeString(row.endTime)) return false;
  if (row.date) return isValidDateString(row.date);
  return DAY_INDEX[String(row.day || '').toLowerCase()] !== undefined;
});

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);
const toDateString = (date) => date.toISOString().split('T')[0];

const generateSlotsFromAvailability = async (client, {
  facilityId,
  availability,
  startDate,
  endDate,
  durationMins,
  capacity,
  price,
}) => {
  if (!Array.isArray(availability) || availability.length === 0 || !isValidDateString(startDate) || !isValidDateString(endDate)) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const deleteFrom = new Date(`${startDate}T00:00:00.000+05:30`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  // Optional: Clean up future unbooked slots for this facility to ensure "truth"
  // Only delete slots that are 'available' (not 'booked', 'cancelled', or 'blackout')
  // and have no confirmed/reserved bookings.
  await client.query(
    `DELETE FROM time_slots 
     WHERE facility_id = $1 
       AND slot_start >= $2 
       AND status = 'available' 
       AND confirmed_count = 0 
       AND reserved_count = 0
       AND NOT EXISTS (
         SELECT 1 FROM bookings b WHERE b.slot_id = time_slots.id
       )
       AND NOT EXISTS (
         SELECT 1 FROM reservations r WHERE r.slot_id = time_slots.id
       )`,
    [facilityId, deleteFrom.toISOString()]
  );

  let inserted = 0;
  for (let day = new Date(start); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
    const dayNameIndex = day.getUTCDay();
    const slotDate = toDateString(day);

    // Source of Truth logic:
    // 1. Check if there are specific date entries for this date.
    // 2. If yes, use ONLY those.
    // 3. If no, use the recurring day entries for this weekday.
    
    const specificRows = availability.filter((row) => row.date === slotDate);
    const recurringRows = availability.filter((row) => 
      !row.date && DAY_INDEX[String(row.day || '').toLowerCase()] === dayNameIndex
    );

    const rowsForDay = specificRows.length > 0 ? specificRows : recurringRows;

    for (const row of rowsForDay) {
      if (!isValidTimeString(row.startTime) || !isValidTimeString(row.endTime)) continue;

      let slotStart = new Date(`${slotDate}T${row.startTime}:00+05:30`);
      const windowEnd = new Date(`${slotDate}T${row.endTime}:00+05:30`);

      while (addMinutes(slotStart, durationMins) <= windowEnd) {
        const slotEnd = addMinutes(slotStart, durationMins);
        
        // Double check if exists (in case it's a booked slot we didn't delete)
        const existing = await client.query(
          'SELECT id FROM time_slots WHERE facility_id = $1 AND slot_start = $2 LIMIT 1',
          [facilityId, slotStart.toISOString()]
        );

        if (existing.rows.length === 0) {
          await client.query(
            `INSERT INTO time_slots (facility_id, slot_start, slot_end, total_capacity, frozen_price, status)
             VALUES ($1, $2, $3, $4, $5, 'available')`,
            [facilityId, slotStart.toISOString(), slotEnd.toISOString(), capacity, price]
          );
          inserted++;
        }

        slotStart = slotEnd;
      }
    }
  }

  return inserted;
};

/**
 * GET /api/services — list all published services (public)
 */
const listPublished = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT f.id, f.name, f.duration_mins, f.duration_mins AS duration_min, 
              f.max_capacity, f.max_capacity AS capacity, 
              f.advance_payment, f.manual_confirm, f.manual_confirm AS manual_confirmation, 
              f.created_at, f.organiser_id AS organiser_id, f.organiser_id AS provider_user_id, 
              u.full_name AS provider_name, u.full_name AS organiser_name,
              f.type, f.description, f.location, f.base_price, f.base_price AS price,
              f.status, f.schedule_type, f.working_tz, f.cancellation_hrs,
              f.intro_message, f.confirm_message, f.assignment_mode, f.booking_mode,
              f.questions_schema, f.questions_schema AS questions,
              (SELECT image_url FROM facility_images WHERE facility_id = f.id AND is_primary = true LIMIT 1) AS image
       FROM facilities f
       JOIN users u ON f.organiser_id = u.id
       WHERE f.status = 'published' AND f.deleted_at IS NULL
       ORDER BY f.created_at DESC`
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/services/my — organiser's own services
 */
const listMine = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT f.id, f.name, f.duration_mins, f.duration_mins AS duration_min, 
              f.max_capacity, f.max_capacity AS capacity, 
              f.status, (f.status = 'published') AS is_published,
              f.advance_payment, f.manual_confirm, f.manual_confirm AS manual_confirmation, 
              f.created_at, f.type, f.description, f.location, f.base_price, f.base_price AS price,
              f.assignment_mode,
              f.questions_schema, f.questions_schema AS questions,
              f.working_hours AS availability,
              (SELECT image_url FROM facility_images WHERE facility_id = f.id AND is_primary = true LIMIT 1) AS image,
              (SELECT json_agg(user_id) FROM facility_staff WHERE facility_id = f.id) AS assigned_users,
              (SELECT COUNT(*) FROM bookings WHERE facility_id = f.id) AS booking_count,
              (SELECT COUNT(*) FROM bookings WHERE facility_id = f.id) AS bookings
       FROM facilities f
       WHERE f.organiser_id = $1 AND f.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
      [req.user.user_id]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/services/:id — get one organiser-owned service
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT f.id, f.name, f.duration_mins, f.duration_mins AS duration_min, 
              f.max_capacity, f.max_capacity AS capacity, 
              f.status, (f.status = 'published') AS is_published,
              f.advance_payment, f.manual_confirm, f.manual_confirm AS manual_confirmation, 
              f.created_at, f.type, f.description, f.location, f.base_price, f.base_price AS price,
              f.assignment_mode,
              f.questions_schema, f.questions_schema AS questions,
              f.working_hours AS availability,
              (SELECT image_url FROM facility_images WHERE facility_id = f.id AND is_primary = true LIMIT 1) AS image,
              (SELECT json_agg(user_id) FROM facility_staff WHERE facility_id = f.id) AS assigned_users
       FROM facilities f
       WHERE f.id = $1 AND f.organiser_id = $2 AND f.deleted_at IS NULL`,
      [id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Service not found or you do not own this service.', 404, 'SERVICE_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/services — create a new service
 */
const create = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { 
      name, duration_min, capacity = 1, advance_payment = false, manual_confirmation = false, 
      type = 'General', description = '', location = '', price = 0, image, assigned_users = [], questions = [],
      assignment_mode = 'auto',
      status = 'draft', availability = [], availability_start_date, availability_end_date
    } = req.body;

    if (!['draft', 'published', 'unpublished'].includes(status)) {
      throw new AppError('Invalid service status.', 400, 'INVALID_STATUS');
    }

    const result = await client.query(
      `INSERT INTO facilities (organiser_id, name, duration_mins, max_capacity, advance_payment, manual_confirm, type, description, location, base_price, questions_schema, status, working_hours, assignment_mode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, name, duration_mins AS duration_min, max_capacity AS capacity, advance_payment, manual_confirm AS manual_confirmation, status`,
      [req.user.user_id, name, duration_min, capacity, advance_payment, manual_confirmation, type, description, location, price, JSON.stringify(questions), status, JSON.stringify(availability), assignment_mode]
    );

    const facilityId = result.rows[0].id;

    // Handle Image
    if (image) {
      await client.query(
        `INSERT INTO facility_images (facility_id, image_url, is_primary) VALUES ($1, $2, true)`,
        [facilityId, image]
      );
    }

    // Handle Assigned Users
    if (Array.isArray(assigned_users) && assigned_users.length > 0) {
      for (const userId of assigned_users.filter(isUuid)) {
        await client.query(
          `INSERT INTO facility_staff (facility_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [facilityId, userId]
        );
      }
    }

    const slotsCreated = await generateSlotsFromAvailability(client, {
      facilityId,
      availability,
      startDate: availability_start_date,
      endDate: availability_end_date,
      durationMins: duration_min || 30,
      capacity,
      price,
    });

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: { ...result.rows[0], image, assigned_users, questions, slots_created: slotsCreated } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * PUT /api/services/:id — update a service
 */
const update = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { 
      name, duration_min, capacity, advance_payment, manual_confirmation, 
      type, description, location, price, image, assigned_users, questions, status, assignment_mode,
      availability = [], availability_start_date, availability_end_date
    } = req.body;

    if (status && !['draft', 'published', 'unpublished'].includes(status)) {
      throw new AppError('Invalid service status.', 400, 'INVALID_STATUS');
    }

    const result = await client.query(
      `UPDATE facilities
       SET name = COALESCE($1, name),
           duration_mins = COALESCE($2, duration_mins),
           max_capacity = COALESCE($3, max_capacity),
           advance_payment = COALESCE($4, advance_payment),
           manual_confirm = COALESCE($5, manual_confirm),
           type = COALESCE($6, type),
           description = COALESCE($7, description),
           location = COALESCE($8, location),
           base_price = COALESCE($9, base_price),
           questions_schema = COALESCE($10, questions_schema),
           status = COALESCE($11, status),
           working_hours = COALESCE($12, working_hours),
           assignment_mode = COALESCE($13, assignment_mode)
       WHERE id = $14 AND organiser_id = $15 AND deleted_at IS NULL
       RETURNING id, name, duration_mins AS duration_min, max_capacity AS capacity, status, advance_payment, manual_confirm AS manual_confirmation, location, base_price AS price`,
      [
        name, duration_min, capacity, advance_payment, manual_confirmation, 
        type, description, location, price, 
        questions ? JSON.stringify(questions) : null,
        status || null,
        availability ? JSON.stringify(availability) : null,
        assignment_mode || null,
        id, req.user.user_id
      ]
    );

    if (result.rows.length === 0) {
      throw new AppError('Service not found or you do not own this service.', 404, 'SERVICE_NOT_FOUND');
    }

    // Handle Image Update
    if (image !== undefined) {
      await client.query(`DELETE FROM facility_images WHERE facility_id = $1`, [id]);
      if (image) {
        await client.query(
          `INSERT INTO facility_images (facility_id, image_url, is_primary) VALUES ($1, $2, true)`,
          [id, image]
        );
      }
    }

    // Handle Assigned Users Update
    if (assigned_users !== undefined && Array.isArray(assigned_users)) {
      await client.query(`DELETE FROM facility_staff WHERE facility_id = $1`, [id]);
      for (const userId of assigned_users.filter(isUuid)) {
        await client.query(
          `INSERT INTO facility_staff (facility_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, userId]
        );
      }
    }

    if (price !== undefined) {
      await client.query(
        `UPDATE time_slots
         SET frozen_price = $1
         WHERE facility_id = $2
           AND slot_start > NOW()
           AND status = 'available'
           AND confirmed_count = 0
           AND reserved_count = 0`,
        [Number(price), id]
      );
    }

    const shouldRegenerateSlots = hasUsableAvailability(availability)
      && availability_start_date
      && availability_end_date;

    const slotsCreated = shouldRegenerateSlots
      ? await generateSlotsFromAvailability(client, {
          facilityId: id,
          availability,
          startDate: availability_start_date,
          endDate: availability_end_date,
          durationMins: Number(duration_min || result.rows[0].duration_min || 30),
          capacity: Number(capacity || result.rows[0].capacity || 1),
          price: Number(price ?? result.rows[0].price ?? 0),
        })
      : 0;

    await client.query('COMMIT');
    res.json({ success: true, data: { ...result.rows[0], image, assigned_users, questions, slots_created: slotsCreated } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * DELETE /api/services/:id — soft-delete a service
 */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE facilities SET deleted_at = NOW() WHERE id = $1 AND organiser_id = $2 AND deleted_at IS NULL RETURNING id',
      [id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Service not found or you do not own this service.', 404, 'SERVICE_NOT_FOUND');
    }

    res.json({ success: true, data: { message: 'Service deleted successfully.' } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/services/:id/publish — toggle publish status
 */
const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE facilities
       SET status = CASE WHEN status = 'published' THEN 'draft' ELSE 'published' END
       WHERE id = $1 AND organiser_id = $2 AND deleted_at IS NULL
       RETURNING id, name, status`,
      [id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Service not found or you do not own this service.', 404, 'SERVICE_NOT_FOUND');
    }

    res.json({ success: true, data: { ...result.rows[0], is_published: result.rows[0].status === 'published' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPublished, listMine, getById, create, update, remove, togglePublish };
