const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const voteController = require('../controllers/voteController');
const { verifyToken } = require('../middleware/authMiddleware');
const { voteLimiter } = require('../middleware/rateLimiter');

router.post('/register', verifyToken, paymentController.registerVoter);
router.post('/vote', verifyToken, voteLimiter, voteController.castVoteV2);

module.exports = router;
