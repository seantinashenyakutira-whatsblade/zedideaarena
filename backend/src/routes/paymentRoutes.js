const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route POST /api/payment/create-payment-intent
 * @desc Create a Stripe side payment intent
 * @access Private
 */
router.post('/create-payment-intent', verifyToken, paymentController.createPaymentIntent);

/**
 * @route POST /api/payment/webhook
 * @desc Handle Stripe webhooks
 * @access Public
 */
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

module.exports = router;
