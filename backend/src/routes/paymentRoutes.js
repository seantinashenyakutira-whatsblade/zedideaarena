const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, paymentController.getPaymentHistory);
router.get('/check-entry/:competitionId', verifyToken, paymentController.checkEntryPayment);
router.get('/check', verifyToken, paymentController.checkPayment);

module.exports = router;
