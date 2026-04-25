const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route POST /api/idea/save
 * @desc Save a draft or update an existing one
 * @access Private
 */
router.post('/save', verifyToken, ideaController.saveIdeaDraft);

/**
 * @route POST /api/idea/submit
 * @desc Finalize and lock an idea submission
 * @access Private
 */
router.post('/submit', verifyToken, ideaController.submitIdea);

/**
 * @route GET /api/idea/user
 * @desc Get all ideas belonging to the authenticated user
 * @access Private
 */
router.get('/user', verifyToken, ideaController.getUserIdeas);

/**
 * @route GET /api/ideas/:id
 * @desc Get details of a specific idea
 * @access Public/Private
 */
router.get('/:id', ideaController.getIdeaById);

/**
 * @route GET /api/ideas/public
 * @desc Get all paid/public ideas for voting
 * @access Public
 */
router.get('/public', ideaController.getPublicIdeas);

module.exports = router;
