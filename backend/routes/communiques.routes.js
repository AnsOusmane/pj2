const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const { z } = require('zod');

const uploadDir = 'uploads/communiques';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, name + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Seuls PDF, JPG et PNG sont autorisés'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

const communiqueSchema = z.object({
  title: z.string().min(3, "Titre trop court"),
  description: z.string().max(1000).optional()
});

// GET public
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, file_url, file_name, created_at 
      FROM communiques ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST protégé
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const data = communiqueSchema.parse(req.body);
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: 'Fichier obligatoire' });

    const result = await pool.query(
      `INSERT INTO communiques (title, description, file_url, file_name, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.title, data.description, `/uploads/communiques/${file.filename}`, file.originalname, file.mimetype, file.size]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ success: false, errors: err.errors });
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;