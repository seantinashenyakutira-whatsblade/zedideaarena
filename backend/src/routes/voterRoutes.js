const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const voteController = require('../controllers/voteController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', verifyToken, paymentController.registerVoter);
router.post('/vote', verifyToken, voteController.castVoteV2);

module.exports = router;
