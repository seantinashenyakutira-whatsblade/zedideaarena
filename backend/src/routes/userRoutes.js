const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/profile', verifyToken, userController.getUserProfile);
router.get('/profile/:id', userController.getUserProfileById);
router.post('/profile', verifyToken, userController.syncUserProfile);
router.post('/signup', verifyToken, userController.syncUserProfile);
router.post('/login', verifyToken, userController.login);

module.exports = router;
