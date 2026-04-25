const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route POST /api/votes/cast
 * @desc Cast a vote for an innovation
 * @access Private
 */
router.post('/cast', verifyToken, voteController.castVote);

module.exports = router;
