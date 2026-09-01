const express = require('express');
const router = express.Router();
const { getPolicies, updatePolicies, getHomepageSettings, updateHomepageSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/policies').get(getPolicies).put(protect, admin, updatePolicies);
router.route('/homepage').get(getHomepageSettings).put(protect, admin, updateHomepageSettings);

module.exports = router;
