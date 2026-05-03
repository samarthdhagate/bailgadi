/**
 * Admin controller — full CRUD for facilities, users, and system stats.
 * All endpoints require admin role.
 */

const { query, pool } = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

/**
 * GET /api/admin/stats — system-wide statistics
 */
const getStats = async (req, res, next) => {
  try {
    const [usersRes, facilitiesRes, bookingsRes] = await Promise.all([
      query('SELECT COUNT(*) AS count FROM users'),
      query("SELECT COUNT(*) AS count FROM facilities WHERE deleted_at IS NULL"),
      query('SELECT COUNT(*) AS count FROM bookings'),
    ]);

    const revenueRes = await query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'success'"
    );

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(usersRes.rows[0].count),
        activeServices: parseInt(facilitiesRes.rows[0].count),
        totalBookings: parseInt(bookingsRes.rows[0].count),
        revenue: parseFloat(revenueRes.rows[0].total),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/users — list all users
 */
const listUsers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, email, full_name, role, is_verified, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/users/:id — update role / verification status
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_verified } = req.body;

    if (role && !['customer', 'organiser', 'admin'].includes(role)) {
      throw new AppError('Invalid role.', 400, 'INVALID_ROLE');
    }

    if (id === req.user.user_id && role && role !== 'admin') {
      throw new AppError('You cannot remove your own admin role.', 400, 'SELF_ROLE_CHANGE');
    }

    const result = await query(
      `UPDATE users
       SET role = COALESCE($1, role),
           is_verified = COALESCE($2, is_verified),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, full_name, role, is_verified, created_at`,
      [role || null, typeof is_verified === 'boolean' ? is_verified : null, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/users/:id — remove a user when no dependent records block it
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.user_id) {
      throw new AppError('You cannot delete your own account.', 400, 'SELF_DELETE');
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id, email', [id]);

    if (result.rows.length === 0) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    res.json({ success: true, data: { message: `User ${result.rows[0].email} deleted.` } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/facilities — list ALL facilities (any organiser)
 */
const listAllFacilities = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT f.id, f.name, f.description, f.type, 
              f.duration_mins, f.duration_mins AS duration_min,
              f.base_price, f.base_price AS price,
              f.advance_payment, f.manual_confirm, f.manual_confirm AS manual_confirmation,
              f.max_capacity, f.max_capacity AS capacity,
              f.status, (f.status = 'published') AS is_published,
              f.schedule_type, f.working_tz, f.cancellation_hrs, f.location,
              f.intro_message, f.confirm_message, f.assignment_mode, f.booking_mode,
              f.questions_schema, f.questions_schema AS questions,
              f.organiser_id, u.full_name AS organiser_name, u.full_name AS provider_name, 
              u.email AS organiser_email,
              f.created_at, f.updated_at,
              (SELECT image_url FROM facility_images WHERE facility_id = f.id AND is_primary = true LIMIT 1) AS image,
              (SELECT json_agg(user_id) FROM facility_staff WHERE facility_id = f.id) AS assigned_users
       FROM facilities f
       JOIN users u ON f.organiser_id = u.id
       WHERE f.deleted_at IS NULL
       ORDER BY f.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/facilities/:id — single facility detail
 */
const getFacility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT f.*, f.duration_mins AS duration_min, f.base_price AS price, f.max_capacity AS capacity,
              (f.status = 'published') AS is_published, f.questions_schema AS questions,
              u.full_name AS organiser_name, u.full_name AS provider_name, u.email AS organiser_email,
              (SELECT image_url FROM facility_images WHERE facility_id = f.id AND is_primary = true LIMIT 1) AS image,
              (SELECT json_agg(user_id) FROM facility_staff WHERE facility_id = f.id) AS assigned_users
       FROM facilities f
       JOIN users u ON f.organiser_id = u.id
       WHERE f.id = $1 AND f.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Facility not found.', 404, 'FACILITY_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/facilities/:id — update ANY facility
 */
const updateFacility = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const {
      name, description, type, duration_mins, duration_min, base_price, price,
      advance_payment, manual_confirm, manual_confirmation, max_capacity, capacity, status,
      cancellation_hrs, intro_message, confirm_message, location, questions,
      assignment_mode, booking_mode, image, assigned_users
    } = req.body;

    const result = await client.query(
      `UPDATE facilities
       SET name             = COALESCE($1,  name),
           description      = COALESCE($2,  description),
           type             = COALESCE($3,  type),
           duration_mins    = COALESCE($4,  COALESCE($5, duration_mins)),
           base_price       = COALESCE($6,  COALESCE($7, base_price)),
           advance_payment  = COALESCE($8,  advance_payment),
           manual_confirm   = COALESCE($9,  COALESCE($10, manual_confirm)),
           max_capacity     = COALESCE($11, COALESCE($12, max_capacity)),
           status           = COALESCE($13, status),
           cancellation_hrs = COALESCE($14, cancellation_hrs),
           intro_message    = COALESCE($15, intro_message),
           confirm_message  = COALESCE($16, confirm_message),
           location         = COALESCE($17, location),
           questions_schema = COALESCE($18, questions_schema),
           assignment_mode  = COALESCE($19, assignment_mode),
           booking_mode     = COALESCE($20, booking_mode)
       WHERE id = $21 AND deleted_at IS NULL
       RETURNING id, name, duration_mins AS duration_min, max_capacity AS capacity, status`,
      [
        name, description, type, duration_mins, duration_min, base_price, price,
        advance_payment, manual_confirm, manual_confirmation, max_capacity, capacity, status,
        cancellation_hrs, intro_message, confirm_message, location, 
        questions ? JSON.stringify(questions) : null,
        assignment_mode, booking_mode, id
      ]
    );

    if (result.rows.length === 0) {
      throw new AppError('Facility not found.', 404, 'FACILITY_NOT_FOUND');
    }

    // Handle image update
    if (image !== undefined) {
      await client.query('DELETE FROM facility_images WHERE facility_id = $1', [id]);
      if (image) {
        await client.query(
          'INSERT INTO facility_images (facility_id, image_url, is_primary) VALUES ($1, $2, true)',
          [id, image]
        );
      }
    }

    // Handle staff update
    if (assigned_users !== undefined && Array.isArray(assigned_users)) {
      await client.query('DELETE FROM facility_staff WHERE facility_id = $1', [id]);
      for (const userId of assigned_users.filter(isUuid)) {
        await client.query(
          'INSERT INTO facility_staff (facility_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, userId]
        );
      }
    }

    if (price !== undefined || base_price !== undefined) {
      await client.query(
        `UPDATE time_slots
         SET frozen_price = $1
         WHERE facility_id = $2
           AND slot_start > NOW()
           AND status = 'available'
           AND confirmed_count = 0
           AND reserved_count = 0`,
        [Number(price ?? base_price), id]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, data: { ...result.rows[0], image, assigned_users, questions } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * DELETE /api/admin/facilities/:id — soft-delete a facility
 */
const deleteFacility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE facilities SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id, name`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Facility not found.', 404, 'FACILITY_NOT_FOUND');
    }

    res.json({ success: true, data: { message: `Facility "${result.rows[0].name}" deleted.` } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/facilities/:id/slots — list all slots for a facility
 * Query params: date (YYYY-MM-DD, optional)
 */
const listSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    let sql = `SELECT ts.*, r.name AS resource_name
               FROM time_slots ts
               LEFT JOIN resources r ON ts.resource_id = r.id
               WHERE ts.facility_id = $1`;
    const params = [id];

    if (date) {
      sql += ` AND ts.slot_start >= ($2 || 'T00:00:00.000+05:30')::timestamptz
               AND ts.slot_start <= ($2 || 'T23:59:59.999+05:30')::timestamptz`;
      params.push(date);
    }

    sql += ' ORDER BY ts.slot_start ASC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/facilities/:id/slots — create a single slot
 */
const createSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { slot_start, slot_end, total_capacity, frozen_price, resource_id, status } = req.body;

    if (!slot_start || !slot_end) {
      throw new AppError('slot_start and slot_end are required.', 400, 'MISSING_FIELDS');
    }

    const result = await query(
      `INSERT INTO time_slots (facility_id, resource_id, slot_start, slot_end, total_capacity, frozen_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, resource_id || null, slot_start, slot_end, total_capacity || 1, frozen_price || 0, status || 'available']
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/facilities/:id/slots/bulk — bulk generate slots
 * Body: { date_from, date_to, start_hour, end_hour, interval_mins, frozen_price, total_capacity }
 */
const bulkCreateSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      date_from, date_to,
      start_hour = 9, end_hour = 17,
      interval_mins = 60,
      frozen_price = 0,
      total_capacity = 1
    } = req.body;

    if (!date_from || !date_to) {
      throw new AppError('date_from and date_to are required.', 400, 'MISSING_FIELDS');
    }

    const facResult = await query('SELECT duration_mins FROM facilities WHERE id = $1', [id]);
    if (facResult.rows.length === 0) {
      throw new AppError('Facility not found.', 404, 'FACILITY_NOT_FOUND');
    }
    const durationMins = facResult.rows[0].duration_mins;

    const slots = [];
    const from = new Date(date_from + 'T00:00:00');
    const to = new Date(date_to + 'T00:00:00');

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      for (let hour = start_hour; hour < end_hour; hour++) {
        const slotStart = new Date(d);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + durationMins * 60 * 1000);
        slots.push([slotStart.toISOString(), slotEnd.toISOString()]);
      }
    }

    if (slots.length === 0) {
      return res.json({ success: true, data: [], count: 0 });
    }

    let inserted = 0;
    for (const [ss, se] of slots) {
      try {
        await query(
          `INSERT INTO time_slots (facility_id, slot_start, slot_end, total_capacity, frozen_price, status)
           VALUES ($1, $2, $3, $4, $5, 'available')`,
          [id, ss, se, total_capacity, frozen_price]
        );
        inserted++;
      } catch (e) {
        // skip duplicates or constraint violations
      }
    }

    res.status(201).json({ success: true, count: inserted, message: `${inserted} slots created.` });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/slots/:slotId — update a slot
 */
const updateSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const { slot_start, slot_end, total_capacity, frozen_price, status, resource_id } = req.body;

    const result = await query(
      `UPDATE time_slots
       SET slot_start      = COALESCE($1, slot_start),
           slot_end        = COALESCE($2, slot_end),
           total_capacity  = COALESCE($3, total_capacity),
           frozen_price    = COALESCE($4, frozen_price),
           status          = COALESCE($5, status),
           resource_id     = COALESCE($6, resource_id)
       WHERE id = $7
       RETURNING *`,
      [slot_start, slot_end, total_capacity, frozen_price, status, resource_id, slotId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Slot not found.', 404, 'SLOT_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/slots/:slotId — delete a slot
 */
const deleteSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const result = await query(
      `DELETE FROM time_slots
       WHERE id = $1
         AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.slot_id = time_slots.id)
         AND NOT EXISTS (SELECT 1 FROM reservations r WHERE r.slot_id = time_slots.id)
       RETURNING id`,
      [slotId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Slot not found or already has booking history.', 409, 'SLOT_HAS_BOOKINGS');
    }

    res.json({ success: true, data: { message: 'Slot deleted.' } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/bookings — list all bookings in the system
 */
const listBookings = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT b.*, f.name AS service_name, f.organiser_id, owner.full_name AS organiser_name,
              u.full_name AS customer_name, u.email AS customer_email,
              ts.slot_start, ts.slot_end,
              p.status AS payment_status, p.amount AS paid_amount, p.gateway_txn_id
       FROM bookings b
       JOIN facilities f ON b.facility_id = f.id
       JOIN users owner ON f.organiser_id = owner.id
       JOIN users u ON b.customer_id = u.id
       JOIN time_slots ts ON b.slot_id = ts.id
       LEFT JOIN payments p ON p.booking_id = b.id
       ORDER BY b.booked_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/bookings — create a booking on behalf of a user
 */
const createBookingForUser = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { customer_id, facility_id, slot_id, status = 'confirmed', attendee_count = 1 } = req.body;

    if (!customer_id || !facility_id || !slot_id) {
      throw new AppError('customer_id, facility_id, and slot_id are required.', 400, 'MISSING_FIELDS');
    }

    // Check if slot exists and is available
    const slotRes = await client.query('SELECT * FROM time_slots WHERE id = $1 AND facility_id = $2 FOR UPDATE', [slot_id, facility_id]);
    if (slotRes.rows.length === 0) {
      throw new AppError('Slot not found.', 404, 'SLOT_NOT_FOUND');
    }
    const slot = slotRes.rows[0];

    if (slot.status !== 'available') {
      throw new AppError(`Slot is ${slot.status}.`, 409, 'SLOT_UNAVAILABLE');
    }

    if (Number(slot.confirmed_count) + Number(slot.reserved_count) + Number(attendee_count) > Number(slot.total_capacity)) {
      throw new AppError('Slot does not have enough remaining capacity.', 409, 'SLOT_FULL');
    }

    // Create a holding reservation so DB triggers keep slot counts consistent.
    const resRes = await client.query(
      `INSERT INTO reservations (slot_id, customer_id, facility_id, attendee_count, status, idempotency_key, redis_key)
       VALUES ($1, $2, $3, $4, 'holding', $5, $6)
       RETURNING id, frozen_price`,
      [slot_id, customer_id, facility_id, attendee_count, `admin_${Date.now()}_${slot_id}`, `lock:admin:${slot_id}`]
    );
    const reservation = resRes.rows[0];

    const result = await client.query(
      `INSERT INTO bookings (customer_id, facility_id, slot_id, reservation_id, attendee_count, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [customer_id, facility_id, slot_id, reservation.id, attendee_count, reservation.frozen_price, status]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * PUT /api/admin/bookings/:id/status — update booking status
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'cancelled', 'rescheduled', 'no_show'].includes(status)) {
      throw new AppError('Invalid status. Must be confirmed, cancelled, rescheduled, or no_show.', 400, 'INVALID_STATUS');
    }

    const result = await query(
      `UPDATE bookings
       SET status = $1,
           cancelled_at = CASE WHEN $1 = 'cancelled' THEN NOW() ELSE cancelled_at END
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/bookings/:id — delete a booking
 */
const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM bookings WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      throw new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND');
    }

    res.json({ success: true, data: { message: 'Booking deleted.' } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats, listUsers, updateUser, deleteUser, listAllFacilities, getFacility, updateFacility, deleteFacility,
  listSlots, createSlot, bulkCreateSlots, updateSlot, deleteSlot,
  listBookings, createBookingForUser, updateBookingStatus, deleteBooking
};
