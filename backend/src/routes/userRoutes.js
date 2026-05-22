const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.get('/profile', verifyToken, userController.getUserProfile);
router.get('/profile/:id', userController.getUserProfileById);
router.post('/profile', verifyToken, userController.syncUserProfile);
router.patch('/profile', verifyToken, userController.updateMode);
router.post('/signup', authLimiter, verifyToken, userController.syncUserProfile);
router.post('/login', authLimiter, verifyToken, userController.login);

module.exports = router;
