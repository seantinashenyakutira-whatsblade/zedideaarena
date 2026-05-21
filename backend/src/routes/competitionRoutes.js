const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', adminController.getCompetitions);
router.get('/:id', adminController.getCompetitions);
router.post('/', verifyToken, isAdmin, adminController.createCompetition);
router.put('/:id', verifyToken, isAdmin, adminController.updateCompetition);

module.exports = router;
