const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// GET /api/resources/:facility_id
router.get('/:facility_id', resourceController.listByFacility);

router.post('/:facility_id', verifyToken, requireRole('organiser'), resourceController.createForFacility);

module.exports = router;
