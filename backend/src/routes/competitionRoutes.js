const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const paymentController = require('../controllers/paymentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', adminController.getCompetitions);
router.get('/:id', adminController.getCompetitionById);
router.post('/', verifyToken, isAdmin, adminController.createCompetition);
router.put('/:id', verifyToken, isAdmin, adminController.updateCompetition);
router.post('/:id/enter', verifyToken, paymentController.enterCompetition);

module.exports = router;
