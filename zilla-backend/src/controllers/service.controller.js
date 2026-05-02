/**
 * Service controller — handles CRUD for organiser facilities (services).
 * Queries the `facilities` table (the actual DB schema) rather than `services`/`providers`.
 * Business logic is simple enough to live directly in the controller.
 */

const { query } = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

/**
 * GET /api/services — list all published facilities (public)
 */
const listPublished = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT f.id, f.name, f.duration_mins AS duration_min, f.max_capacity AS capacity,
              f.advance_payment, f.manual_confirm AS manual_confirmation,
              f.base_price AS price, f.status, f.created_at,
              f.organiser_id, u.full_name AS provider_name
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
 * GET /api/services/my — organiser's own facilities
 */
const listMine = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, duration_mins AS duration_min, max_capacity AS capacity,
              status, advance_payment, manual_confirm AS manual_confirmation,
              base_price AS price, schedule_type, working_hours, working_tz,
              questions_schema, cancellation_hrs, intro_message, confirm_message,
              assignment_mode, booking_mode, created_at
       FROM facilities
       WHERE organiser_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [req.user.user_id]
    );

    // Map status to is_published for frontend compatibility
    const mapped = result.rows.map(row => ({
      ...row,
      is_published: row.status === 'published',
    }));

    res.json({ success: true, data: mapped });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/services/:id — get one organiser-owned facility
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, duration_mins AS duration_min, max_capacity AS capacity,
              status, advance_payment, manual_confirm AS manual_confirmation,
              base_price AS price, schedule_type, working_hours, working_tz,
              questions_schema, cancellation_hrs, intro_message, confirm_message,
              assignment_mode, booking_mode, created_at
       FROM facilities
       WHERE id = $1 AND organiser_id = $2 AND deleted_at IS NULL`,
      [id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Service not found or you do not own this service.', 404, 'SERVICE_NOT_FOUND');
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        ...row,
        is_published: row.status === 'published',
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/services — create a new facility
 */
const create = async (req, res, next) => {
  try {
    const {
      name,
      duration_min,
      capacity = 1,
      advance_payment = false,
      manual_confirmation = false,
      base_price = 0,
    } = req.body;

    const result = await query(
      `INSERT INTO facilities (organiser_id, name, duration_mins, max_capacity, advance_payment, manual_confirm, base_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, duration_mins AS duration_min, max_capacity AS capacity,
                 advance_payment, manual_confirm AS manual_confirmation, base_price,
                 status, created_at`,
      [req.user.user_id, name, duration_min, capacity, advance_payment, manual_confirmation, base_price]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/services/:id — update a facility
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, duration_min, capacity, advance_payment, manual_confirmation, base_price } = req.body;

    const result = await query(
      `UPDATE facilities
       SET name = COALESCE($1, name),
           duration_mins = COALESCE($2, duration_mins),
           max_capacity = COALESCE($3, max_capacity),
           advance_payment = COALESCE($4, advance_payment),
           manual_confirm = COALESCE($5, manual_confirm),
           base_price = COALESCE($6, base_price)
       WHERE id = $7 AND organiser_id = $8 AND deleted_at IS NULL
       RETURNING id, name, duration_mins AS duration_min, max_capacity AS capacity,
                 advance_payment, manual_confirm AS manual_confirmation, base_price,
                 status, created_at`,
      [name, duration_min, capacity, advance_payment, manual_confirmation, base_price, id, req.user.user_id]
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
 * DELETE /api/services/:id — soft-delete a facility
 */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE facilities SET deleted_at = NOW()
       WHERE id = $1 AND organiser_id = $2 AND deleted_at IS NULL
       RETURNING id`,
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

    // Get current status
    const current = await query(
      `SELECT status FROM facilities WHERE id = $1 AND organiser_id = $2 AND deleted_at IS NULL`,
      [id, req.user.user_id]
    );

    if (current.rows.length === 0) {
      throw new AppError('Service not found or you do not own this service.', 404, 'SERVICE_NOT_FOUND');
    }

    const newStatus = current.rows[0].status === 'published' ? 'unpublished' : 'published';

    const result = await query(
      `UPDATE facilities
       SET status = $1
       WHERE id = $2 AND organiser_id = $3 AND deleted_at IS NULL
       RETURNING id, name, status`,
      [newStatus, id, req.user.user_id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        is_published: result.rows[0].status === 'published',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPublished, listMine, getById, create, update, remove, togglePublish };
