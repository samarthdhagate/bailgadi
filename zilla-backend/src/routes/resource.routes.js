const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');

// GET /api/resources/:facility_id
router.get('/:facility_id', resourceController.listByFacility);

module.exports = router;
