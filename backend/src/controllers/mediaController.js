const { storage } = require('../config/firebase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Handle Media Upload to Firebase Storage
 */
const uploadMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  if (!storage) {
    return res.status(503).json({ status: 'error', message: 'Storage service unavailable' });
  }

  try {
    const bucket = storage.bucket();
    const fileName = `${req.user.uid}/${uuidv4()}${path.extname(req.file.originalname)}`;
    const file = bucket.file(fileName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        firebaseStorageDownloadTokens: uuidv4()
      }
    });

    stream.on('error', (err) => {
      console.error('Storage stream error:', err);
      res.status(500).json({ status: 'error', message: 'File upload failed' });
    });

    stream.on('finish', async () => {
      // Make the file public (or get signed URL)
      // For simplicity in this arena, we'll get a signed URL or public URL
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      res.json({
        status: 'success',
        url: publicUrl
      });
    });

    stream.end(req.file.buffer);
  } catch (error) {
    console.error('Upload catch error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error during upload' });
  }
};

module.exports = {
  uploadMedia
};
