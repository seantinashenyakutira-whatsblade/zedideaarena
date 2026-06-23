const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/pawapay', express.raw({ type: 'application/json' }), paymentController.handlePawapayWebhook);

module.exports = router;
