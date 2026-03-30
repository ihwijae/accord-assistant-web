const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const { uploadBuffer, getDownloadUrl, deleteObject, buildPublicUrl } = require('../services/r2Files');

const router = express.Router();
const maxFileSize = Number(process.env.UPLOAD_MAX_BYTES) || 25 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize }
});

function toSafeFilename(name) {
  const base = path.basename(name || 'file');
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return safe || 'file';
}

function normalizeKey(key) {
  if (!key) return '';
  return String(key).replace(/\\/g, '/').replace(/^\/+/, '');
}

function buildKey({ prefix = 'uploads', originalName }) {
  const trimmedPrefix = normalizeKey(prefix || 'uploads');
  const date = new Date().toISOString().slice(0, 10);
  const id = crypto.randomUUID();
  const safeName = toSafeFilename(originalName);
  return `${trimmedPrefix}/${date}/${id}-${safeName}`;
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'file is required' });
    }

    const requestedKey = normalizeKey(req.body?.key);
    const prefix = req.body?.prefix;
    const key = requestedKey || buildKey({ prefix, originalName: req.file.originalname });

    const result = await uploadBuffer({
      key,
      body: req.file.buffer,
      contentType: req.file.mimetype
    });

    const downloadUrl = await getDownloadUrl({ key });

    return res.json({
      success: true,
      key,
      size: req.file.size,
      contentType: req.file.mimetype,
      publicUrl: result.publicUrl,
      downloadUrl
    });
  } catch (error) {
    console.error('[files] upload failed:', error);
    return res.status(500).json({ success: false, message: 'upload failed' });
  }
});

router.get('/*', async (req, res) => {
  try {
    const key = normalizeKey(req.params[0]);
    if (!key) return res.status(400).json({ success: false, message: 'key is required' });

    const expiresIn = Number(req.query.expiresIn) || 900;
    const downloadUrl = await getDownloadUrl({ key, expiresIn });

    return res.json({
      success: true,
      key,
      downloadUrl,
      publicUrl: buildPublicUrl(key)
    });
  } catch (error) {
    console.error('[files] download url failed:', error);
    return res.status(500).json({ success: false, message: 'download url failed' });
  }
});

router.delete('/*', async (req, res) => {
  try {
    const key = normalizeKey(req.params[0]);
    if (!key) return res.status(400).json({ success: false, message: 'key is required' });

    await deleteObject({ key });
    return res.json({ success: true, key });
  } catch (error) {
    console.error('[files] delete failed:', error);
    return res.status(500).json({ success: false, message: 'delete failed' });
  }
});

module.exports = router;
