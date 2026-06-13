const express = require('express');
const router = express.Router();
const multer = require('multer');
const mediaController = require('../controllers/mediaController');
const { verifyToken } = require('../middleware/authMiddleware');

const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

const uploadDoc = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadArena = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/upload', verifyToken, uploadVideo.single('file'), mediaController.uploadMedia);
router.post('/upload-document', verifyToken, uploadDoc.single('file'), mediaController.uploadDocument);
router.post('/arena-upload', verifyToken, uploadArena.single('file'), mediaController.uploadArenaMedia);

module.exports = router;
