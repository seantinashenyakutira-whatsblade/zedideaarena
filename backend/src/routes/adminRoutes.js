const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const reportController = require('../controllers/reportController');
const waitlistController = require('../controllers/waitlistController');
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

router.get('/withdrawals', verifyToken, isAdmin, adminController.getAllWithdrawals);
router.patch('/withdrawals/:id/status', verifyToken, isAdmin, adminController.updateWithdrawalStatus);

router.get('/payments', verifyToken, isAdmin, adminController.getAllPayments);
router.post('/payments/:id/refund', verifyToken, isAdmin, adminController.refundPayment);
router.get('/export/ideas', verifyToken, isAdmin, adminController.exportIdeasCSV);
router.get('/export/users', verifyToken, isAdmin, adminController.exportUsersCSV);
router.get('/export/competitions/:id', verifyToken, isAdmin, adminController.exportCompetitionResultsCSV);
router.get('/export/payments', verifyToken, isAdmin, adminController.exportPaymentsCSV);

// Waitlist admin
router.get('/waitlist', verifyToken, isAdmin, waitlistController.adminGetAll);
router.get('/waitlist/stats', verifyToken, isAdmin, waitlistController.adminGetStats);
router.get('/waitlist/export', verifyToken, isAdmin, waitlistController.adminExport);
router.post('/waitlist/send-email', verifyToken, isAdmin, waitlistController.adminSendEmail);

module.exports = router;
