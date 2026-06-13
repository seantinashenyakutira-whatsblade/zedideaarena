const express = require('express');
const router = express.Router();
const multer = require('multer');
const arenaController = require('../controllers/arenaController');
const reportController = require('../controllers/reportController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const uploadChat = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get('/posts', arenaController.getPosts);
router.get('/posts/trending-topics', arenaController.getTrendingTopics);
router.get('/posts/by-topic', arenaController.getPostsByTopic);
router.post('/posts', verifyToken, arenaController.createPost);
router.put('/posts/:id', verifyToken, arenaController.updatePost);
router.delete('/posts/:id', verifyToken, arenaController.deletePost);
router.post('/posts/repost', verifyToken, arenaController.createRepost);
router.post('/posts/:id/like', verifyToken, arenaController.toggleLike);
router.get('/posts/:id/comments', arenaController.getComments);
router.post('/posts/:id/comments', verifyToken, arenaController.addComment);
router.post('/posts/:id/share', verifyToken, arenaController.trackShare);

router.get('/chat', verifyToken, arenaController.getChatMessages);
router.post('/chat', verifyToken, arenaController.sendChatMessage);
router.post('/chat/upload', verifyToken, uploadChat.single('file'), arenaController.uploadChatFile);
router.post('/chat/:conversationId/reply', verifyToken, isAdmin, arenaController.adminChatReply);
router.post('/chat/:conversationId/read', verifyToken, arenaController.markConversationRead);

router.get('/rules', arenaController.getRules);

router.get('/profile/:userId', arenaController.getUserProfile);

router.post('/reports', verifyToken, reportController.submitReport);

module.exports = router;
