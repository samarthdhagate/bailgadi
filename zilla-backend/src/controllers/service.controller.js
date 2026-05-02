/**
 * Service controller — handles CRUD for organiser services.
 * Business logic is simple enough to live directly in the controller.
 */

const { query } = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

/**
 * GET /api/services — list all published services (public)
 */
const listPublished = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT s.id, s.name, s.duration_min, s.capacity, s.advance_payment,
              s.manual_confirmation, s.created_at, p.user_id AS provider_user_id,
              u.full_name AS provider_name
       FROM services s
       JOIN providers p ON s.provider_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE s.is_published = TRUE
       ORDER BY s.created_at DESC`
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
    // Get provider_id for the current user
    const providerResult = await query(
      'SELECT id FROM providers WHERE user_id = $1',
      [req.user.user_id]
    );

    if (providerResult.rows.length === 0) {
      throw new AppError('Provider profile not found.', 404, 'PROVIDER_NOT_FOUND');
    }

    const provider_id = providerResult.rows[0].id;

    const result = await query(
      `SELECT id, name, duration_min, capacity, is_published, advance_payment,
              manual_confirmation, created_at
       FROM services
       WHERE provider_id = $1
       ORDER BY created_at DESC`,
      [provider_id]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/services — create a new service
 */
const create = async (req, res, next) => {
  try {
    const { name, duration_min, capacity = 1, advance_payment = false, manual_confirmation = false } = req.body;

    // Get provider_id
    const providerResult = await query(
      'SELECT id FROM providers WHERE user_id = $1',
      [req.user.user_id]
    );

    if (providerResult.rows.length === 0) {
      throw new AppError('Provider profile not found. Complete your profile first.', 404, 'PROVIDER_NOT_FOUND');
    }

    const provider_id = providerResult.rows[0].id;

    const result = await query(
      `INSERT INTO services (provider_id, name, duration_min, capacity, advance_payment, manual_confirmation)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [provider_id, name, duration_min, capacity, advance_payment, manual_confirmation]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/services/:id — update a service
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, duration_min, capacity, advance_payment, manual_confirmation } = req.body;

    // Verify ownership
    const providerResult = await query(
      'SELECT id FROM providers WHERE user_id = $1',
      [req.user.user_id]
    );

    if (providerResult.rows.length === 0) {
      throw new AppError('Provider profile not found.', 404, 'PROVIDER_NOT_FOUND');
    }

    const provider_id = providerResult.rows[0].id;

    const result = await query(
      `UPDATE services
       SET name = COALESCE($1, name),
           duration_min = COALESCE($2, duration_min),
           capacity = COALESCE($3, capacity),
           advance_payment = COALESCE($4, advance_payment),
           manual_confirmation = COALESCE($5, manual_confirmation)
       WHERE id = $6 AND provider_id = $7
       RETURNING *`,
      [name, duration_min, capacity, advance_payment, manual_confirmation, id, provider_id]
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
 * DELETE /api/services/:id — delete a service
 */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const providerResult = await query(
      'SELECT id FROM providers WHERE user_id = $1',
      [req.user.user_id]
    );

    if (providerResult.rows.length === 0) {
      throw new AppError('Provider profile not found.', 404, 'PROVIDER_NOT_FOUND');
    }

    const provider_id = providerResult.rows[0].id;

    const result = await query(
      'DELETE FROM services WHERE id = $1 AND provider_id = $2 RETURNING id',
      [id, provider_id]
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

    const providerResult = await query(
      'SELECT id FROM providers WHERE user_id = $1',
      [req.user.user_id]
    );

    if (providerResult.rows.length === 0) {
      throw new AppError('Provider profile not found.', 404, 'PROVIDER_NOT_FOUND');
    }

    const provider_id = providerResult.rows[0].id;

    const result = await query(
      `UPDATE services
       SET is_published = NOT is_published
       WHERE id = $1 AND provider_id = $2
       RETURNING id, name, is_published`,
      [id, provider_id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Service not found or you do not own this service.', 404, 'SERVICE_NOT_FOUND');
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPublished, listMine, create, update, remove, togglePublish };
