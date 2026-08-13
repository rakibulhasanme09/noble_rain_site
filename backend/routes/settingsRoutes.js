const express = require('express');
const router = express.Router();
const { getPolicies, updatePolicies } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/policies').get(getPolicies).put(protect, admin, updatePolicies);

module.exports = router;
