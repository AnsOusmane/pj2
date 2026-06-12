const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const { z } = require('zod');

const upload = makeUpload('decrets', {
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('PDF, JPG ou PNG uniquement'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

const decretSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional()
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, title, description, file_path, created_at FROM decrets ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const data = decretSchema.parse(req.body);
    if (!req.file) return res.status(400).json({ success: false, message: 'Fichier obligatoire' });

    const result = await pool.query(
      `INSERT INTO decrets (title, description, file_path, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [data.title, data.description, req.file.path]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ success: false, errors: err.errors });
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;