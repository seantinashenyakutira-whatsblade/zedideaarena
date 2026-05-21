const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/save', verifyToken, ideaController.saveIdeaDraft);
router.post('/submit', verifyToken, ideaController.submitIdea);
router.get('/user', verifyToken, ideaController.getUserIdeas);
router.get('/:id', ideaController.getIdeaById);
router.get('/public', ideaController.getPublicIdeas);

module.exports = router;
