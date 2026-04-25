const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route GET /api/user/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', verifyToken, userController.getUserProfile);
router.get('/profile/:id', userController.getUserProfileById);

/**
 * @route POST /api/user/profile
 * @desc Sync or Create user profile (after signup)
 * @access Private
 */
router.post('/profile', verifyToken, userController.syncUserProfile);

/**
 * @route POST /api/user/signup
 * @desc Sync or Create user profile (after firebase signup)
 * @access Private
 */
router.post('/signup', verifyToken, userController.syncUserProfile);

/**
 * @route POST /api/user/login
 * @desc Sync or Create user profile (after firebase login)
 * @access Private
 */
router.post('/login', verifyToken, userController.login);

module.exports = router;

