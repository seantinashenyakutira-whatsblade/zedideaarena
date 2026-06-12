const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/cast', verifyToken, voteController.castVote);
router.get('/user', verifyToken, voteController.getUserVotes);
router.get('/:competitionId/leaderboard', voteController.getLeaderboard);
router.get('/ratings/:ideaId', verifyToken, voteController.getIdeaRatings);

module.exports = router;
