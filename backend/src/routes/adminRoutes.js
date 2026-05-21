const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, isAdmin, adminController.getAdminStats);
router.get('/ideas', verifyToken, isAdmin, adminController.getAllIdeas);
router.post('/ideas/:id/status', verifyToken, isAdmin, adminController.updateIdeaStatus);
router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);
router.post('/users/:id/verify', verifyToken, isAdmin, adminController.verifyUser);

module.exports = router;
