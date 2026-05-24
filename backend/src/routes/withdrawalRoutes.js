const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, withdrawalController.getWithdrawals);
router.post('/', verifyToken, withdrawalController.createWithdrawal);

module.exports = router;
