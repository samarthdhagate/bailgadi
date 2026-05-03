const { query } = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

/**
 * GET /api/resources/:facility_id — list resources for a facility (service)
 */
const listByFacility = async (req, res, next) => {
  try {
    const { facility_id } = req.params;
    const result = await query(
      'SELECT id, name, type, is_active FROM resources WHERE facility_id = $1 AND deleted_at IS NULL',
      [facility_id]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

const createForFacility = async (req, res, next) => {
  try {
    const { facility_id } = req.params;
    const { name, type = 'staff' } = req.body;

    if (!name || !String(name).trim()) {
      throw new AppError('Resource name is required.', 400, 'MISSING_RESOURCE_NAME');
    }

    const facility = await query(
      'SELECT id FROM facilities WHERE id = $1 AND organiser_id = $2 AND deleted_at IS NULL',
      [facility_id, req.user.user_id]
    );

    if (facility.rows.length === 0) {
      throw new AppError('Service not found or you do not own this service.', 404, 'SERVICE_NOT_FOUND');
    }

    const result = await query(
      `INSERT INTO resources (facility_id, name, type)
       VALUES ($1, $2, $3)
       RETURNING id, name, type, is_active`,
      [facility_id, String(name).trim(), type]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { listByFacility, createForFacility };
