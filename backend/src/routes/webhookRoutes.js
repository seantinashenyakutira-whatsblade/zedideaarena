const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/stripe', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);
router.post('/dpo', express.urlencoded({ extended: true }), paymentController.handleDpoWebhook);

module.exports = router;
