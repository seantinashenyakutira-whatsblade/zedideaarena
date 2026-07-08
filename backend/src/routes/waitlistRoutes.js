const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');

router.get('/count', waitlistController.getCount);
router.post('/signup', waitlistController.register);
router.get('/verify', waitlistController.verifyEmail);
router.post('/resend-verification', waitlistController.resendVerification);
router.get('/status', waitlistController.getStatus);
router.get('/referral/:code', waitlistController.trackReferral);
router.post('/unsubscribe', waitlistController.unsubscribe);

module.exports = router;
