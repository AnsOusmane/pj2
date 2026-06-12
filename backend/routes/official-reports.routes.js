const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth.middleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, file_url, cover_url, created_at 
      FROM official_reports 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', authMiddleware, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, report_type } = req.body;
    const file = req.files?.file?.[0];
    const cover = req.files?.cover?.[0];

    if (!file) return res.status(400).json({ message: 'Fichier PDF requis' });

    const fileUrl = `/uploads/${file.filename}`;
    const coverUrl = cover ? `/uploads/${cover.filename}` : null;

    const result = await pool.query(
      `INSERT INTO official_reports (title, description, file_url, cover_url, report_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, fileUrl, coverUrl, report_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;