const { supabase } = require('../config/supabase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf',
];

const MAX_FILE_SIZE = 500 * 1024 * 1024;

const uploadMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  if (req.file.size > MAX_FILE_SIZE) {
    return res.status(400).json({ status: 'error', message: 'File size exceeds 500MB limit' });
  }

  if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ status: 'error', message: 'File type not allowed' });
  }

  try {
    const fileName = `${req.user.uid}/${uuidv4()}${path.extname(req.file.originalname)}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    res.json({
      status: 'success',
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error during upload' });
  }
};

module.exports = { uploadMedia };
