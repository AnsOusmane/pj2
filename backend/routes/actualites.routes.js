const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const { z } = require('zod');

const uploadDir = path.join(__dirname, '../uploads/actualites');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Image uniquement (jpg, png, webp)'), false);
    }
    cb(null, true);
  }
});

const actualiteSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  link: z.string().url().optional().or(z.literal(''))
});

// GET public
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM actualites ORDER BY published_at DESC NULLS LAST, id DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST protégé
router.post('/', authMiddleware, upload.single('thumbnail'), async (req, res) => {
  try {
    const data = actualiteSchema.parse(req.body);
    const image_url = req.file ? `/uploads/actualites/${req.file.filename}` : null;

    const result = await pool.query(`
      INSERT INTO actualites (title, content, image_url, link, published_at)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *
    `, [data.title, data.content, image_url, data.link]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ success: false, errors: err.errors });
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;