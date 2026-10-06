const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf'
  ];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, WebP, SVG, GIF) and PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// POST /api/media/upload (Admin only)
router.post('/upload', authenticateAdmin, (req, res) => {
  upload.single('file')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const category = req.body.category || 'general';

    const stmt = db.prepare(`
      INSERT INTO media_files (filename, original_name, file_path, mime_type, file_size, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.file.filename,
      req.file.originalname,
      fileUrl,
      req.file.mimetype,
      req.file.size,
      category
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: result.lastInsertRowid,
        url: fileUrl,
        filename: req.file.filename,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        category
      }
    });
  });
});

// GET /api/media (Admin only - list all media)
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const files = db.prepare('SELECT * FROM media_files ORDER BY id DESC').all();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch media library' });
  }
});

// DELETE /api/media/:id (Admin only)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const file = db.prepare('SELECT * FROM media_files WHERE id = ?').get(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fullPath = path.join(uploadsDir, file.filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        console.error('Failed to unlink file:', e);
      }
    }

    db.prepare('DELETE FROM media_files WHERE id = ?').run(id);
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
