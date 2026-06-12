const express = require('express');
const router = express.Router();
const arenaController = require('../controllers/arenaController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/impression', verifyToken, arenaController.trackAdImpression);

module.exports = router;
