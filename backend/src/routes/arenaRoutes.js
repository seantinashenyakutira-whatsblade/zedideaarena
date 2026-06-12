const express = require('express');
const router = express.Router();
const arenaController = require('../controllers/arenaController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/posts', arenaController.getPosts);
router.post('/posts', verifyToken, arenaController.createPost);
router.post('/posts/:id/like', verifyToken, arenaController.toggleLike);
router.get('/posts/:id/comments', arenaController.getComments);
router.post('/posts/:id/comments', verifyToken, arenaController.addComment);

module.exports = router;
