const express = require('express');
const router = express.Router();
const multer = require('multer');
const mediaController = require('../controllers/mediaController');
const { verifyToken } = require('../middleware/authMiddleware');

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for videos
  }
});

/**
 * @route POST /api/media/upload
 * @desc Upload a file to cloud storage
 * @access Private
 */
router.post('/upload', verifyToken, upload.single('file'), mediaController.uploadMedia);

module.exports = router;
