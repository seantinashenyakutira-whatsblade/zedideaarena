const { supabase } = require('../config/supabase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_FILE_SIZE = 500 * 1024 * 1024;

const uploadMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  if (req.file.size > MAX_FILE_SIZE) {
    return res.status(400).json({ status: 'error', message: 'File size exceeds 500MB limit' });
  }

  if (!VIDEO_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ status: 'error', message: 'Only mp4, mov, and webm videos are allowed' });
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `${req.user.uid}/${uuidv4()}${ext}`;

    const { data, error } = await supabase.storage
      .from('pitch-videos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: signedUrlData } = await supabase.storage
      .from('pitch-videos')
      .createSignedUrl(fileName, 86400);

    res.json({
      status: 'success',
      url: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error during upload' });
  }
};

module.exports = { uploadMedia };
