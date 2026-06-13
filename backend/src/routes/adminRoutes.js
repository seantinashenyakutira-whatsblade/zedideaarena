const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const reportController = require('../controllers/reportController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, isAdmin, adminController.getAdminStats);
router.get('/ideas', verifyToken, isAdmin, adminController.getAllIdeas);
router.post('/ideas/:id/status', verifyToken, isAdmin, adminController.updateIdeaStatus);
router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);
router.get('/users/:id', verifyToken, isAdmin, adminController.getUserDetail);
router.post('/users/:id/verify', verifyToken, isAdmin, adminController.verifyUser);
router.get('/analytics', verifyToken, isAdmin, adminController.getAnalytics);
router.get('/audit-log', verifyToken, isAdmin, adminController.getAuditLog);
router.delete('/competitions/:id', verifyToken, isAdmin, adminController.deleteCompetition);
router.delete('/users/:id', verifyToken, isAdmin, adminController.deleteUser);
router.delete('/ideas/:id', verifyToken, isAdmin, adminController.deleteIdea);

router.get('/reports', verifyToken, isAdmin, reportController.getReports);
router.patch('/reports/:id/status', verifyToken, isAdmin, reportController.updateReportStatus);

module.exports = router;
