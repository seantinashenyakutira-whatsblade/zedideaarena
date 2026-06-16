const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getPreferences, updatePreferences } = require('../controllers/notificationPreferenceController');

router.get('/', verifyToken, getPreferences);
router.put('/', verifyToken, updatePreferences);

module.exports = router;
