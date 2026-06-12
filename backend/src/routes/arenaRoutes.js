const express = require('express');
const router = express.Router();
const arenaController = require('../controllers/arenaController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/posts', arenaController.getPosts);
router.post('/posts', verifyToken, arenaController.createPost);
router.post('/posts/repost', verifyToken, arenaController.createRepost);
router.post('/posts/:id/like', verifyToken, arenaController.toggleLike);
router.get('/posts/:id/comments', arenaController.getComments);
router.post('/posts/:id/comments', verifyToken, arenaController.addComment);
router.post('/posts/:id/share', verifyToken, arenaController.trackShare);

module.exports = router;
