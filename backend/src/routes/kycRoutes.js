const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route POST /api/kyc/submit
 * @desc Initiate a Didit.me KYC session
 * @access Private
 */
router.post('/submit', verifyToken, kycController.submitKYC);

/**
 * @route POST /api/kyc/webhook
 * @desc Handle real-time status updates from Didit.me
 * @access Public (with signature verification)
 */
router.post('/webhook', express.json(), kycController.handleWebhook);

module.exports = router;
