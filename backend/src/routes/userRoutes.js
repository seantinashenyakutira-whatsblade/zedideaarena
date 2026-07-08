const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');

router.get('/profile', verifyToken, userController.getUserProfile);
router.get('/profile/:id', userController.getUserProfileById);
router.post('/profile', verifyToken, userController.syncUserProfile);
router.patch('/profile', verifyToken, userController.updateMode);
router.post('/signup', userController.syncUserProfile);
router.post('/login', userController.login);
router.post('/forgot-password', forgotPasswordLimiter, userController.forgotPassword);
router.post('/reset-password', authLimiter, userController.resetPassword);

module.exports = router;
