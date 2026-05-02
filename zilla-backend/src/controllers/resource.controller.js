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

module.exports = { listByFacility };
