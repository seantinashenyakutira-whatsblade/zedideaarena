const { supabase } = require('../config/supabase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DOCUMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  if (req.file.size > MAX_DOCUMENT_SIZE) {
    return res.status(400).json({ status: 'error', message: 'File size exceeds 10MB limit' });
  }

  if (!DOCUMENT_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ status: 'error', message: 'Only JPEG, PNG, WebP images and PDF files are allowed' });
  }

  const documentType = req.body.type;
  if (!documentType || !['identity', 'address'].includes(documentType)) {
    return res.status(400).json({ status: 'error', message: 'Document type must be "identity" or "address"' });
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `${req.user.uid}/${documentType}-${uuidv4()}${ext}`;

    const { error } = await supabase.storage
      .from('user-documents')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: signedUrlData } = await supabase.storage
      .from('user-documents')
      .createSignedUrl(fileName, 86400);

    res.json({
      status: 'success',
      url: signedUrlData.signedUrl,
      documentType,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error during document upload' });
  }
};

const ALLOWED_ARENA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];

const uploadArenaMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  if (!ALLOWED_ARENA_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ status: 'error', message: 'Only JPEG, PNG, WebP, GIF images and MP4/MOV/WebM videos are allowed' });
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase() || `.${req.file.mimetype.split('/')[1]}`;
    const fileName = `${req.user.uid}/${uuidv4()}${ext}`;

    const { data, error } = await supabase.storage
      .from('arena-media')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) throw error;

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/arena-media/${fileName}`;

    res.json({
      status: 'success',
      url: publicUrl,
    });
  } catch (error) {
    console.error('Arena upload error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error during upload' });
  }
};

module.exports = { uploadDocument, uploadArenaMedia };
