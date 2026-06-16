const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// User notification endpoints
router.get('/', verifyToken, notificationController.getNotifications);
router.put('/read/:id', verifyToken, notificationController.markRead);
router.put('/read-all', verifyToken, notificationController.markAllRead);

// Arena engagement triggers (called from frontend)
router.post('/like', verifyToken, notificationController.sendLikeNotification);
router.post('/comment', verifyToken, notificationController.sendCommentNotification);
router.post('/chat', verifyToken, notificationController.sendChatNotification);

// Admin broadcast endpoints
router.post('/broadcast', verifyToken, isAdmin, notificationController.sendBroadcast);
router.post('/competition-update', verifyToken, isAdmin, notificationController.notifyCompetitionUpdate);
router.post('/new-ideas', verifyToken, isAdmin, notificationController.notifyNewIdeas);

// Admin notification triggers (called from other controllers or frontend)
router.post('/admin/new-idea', verifyToken, isAdmin, notificationController.notifyAdminNewIdea);
router.post('/admin/new-user', verifyToken, isAdmin, notificationController.notifyAdminNewUser);
router.post('/admin/new-payment', verifyToken, isAdmin, notificationController.notifyAdminNewPayment);
router.post('/admin/new-report', verifyToken, isAdmin, notificationController.notifyAdminNewReport);
router.post('/admin/withdrawal', verifyToken, isAdmin, notificationController.notifyAdminWithdrawal);

// User notification triggers
router.post('/user/verification', verifyToken, isAdmin, notificationController.notifyUserVerification);
router.post('/user/idea-status', verifyToken, isAdmin, notificationController.notifyUserIdeaStatus);
router.post('/user/payment', verifyToken, notificationController.notifyUserPayment);
router.post('/user/report-update', verifyToken, notificationController.notifyUserReportUpdate);
router.post('/user/new-competition', verifyToken, notificationController.notifyUserNewCompetition);
router.post('/user/arena-engagement', verifyToken, notificationController.notifyUserArenaEngagement);

module.exports = router;
