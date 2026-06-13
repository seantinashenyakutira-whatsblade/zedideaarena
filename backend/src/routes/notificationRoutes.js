const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.post('/like', verifyToken, notificationController.sendLikeNotification);
router.post('/comment', verifyToken, notificationController.sendCommentNotification);
router.post('/chat', verifyToken, notificationController.sendChatNotification);
router.post('/broadcast', verifyToken, verifyAdmin, notificationController.sendBroadcast);
router.post('/competition-update', verifyToken, verifyAdmin, notificationController.notifyCompetitionUpdate);
router.post('/new-ideas', verifyToken, verifyAdmin, notificationController.notifyNewIdeas);

module.exports = router;
