const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const paymentController = require('../controllers/paymentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cache');

router.get('/', cacheMiddleware(60), adminController.getCompetitions);
router.get('/:id', cacheMiddleware(60), adminController.getCompetitionById);
router.post('/', verifyToken, isAdmin, adminController.createCompetition);
router.put('/:id', verifyToken, isAdmin, adminController.updateCompetition);
router.post('/:id/enter', verifyToken, paymentController.enterCompetition);

module.exports = router;
