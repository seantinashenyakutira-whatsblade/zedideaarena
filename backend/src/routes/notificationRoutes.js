const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/', verifyToken, notificationController.getNotifications);
router.put('/read/:id', verifyToken, notificationController.markRead);
router.put('/read-all', verifyToken, notificationController.markAllRead);

router.post('/like', verifyToken, notificationController.sendLikeNotification);
router.post('/comment', verifyToken, notificationController.sendCommentNotification);
router.post('/chat', verifyToken, notificationController.sendChatNotification);
router.post('/broadcast', verifyToken, isAdmin, notificationController.sendBroadcast);
router.post('/competition-update', verifyToken, isAdmin, notificationController.notifyCompetitionUpdate);
router.post('/new-ideas', verifyToken, isAdmin, notificationController.notifyNewIdeas);

module.exports = router;
