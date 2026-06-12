// routes/guides.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');

// Upload Cloudinary
const upload = makeUpload('guides');

// GET ALL
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM guides ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET guides:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST
router.post('/', authMiddleware, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.files?.file?.[0];
    const cover = req.files?.cover?.[0];

    if (!file) return res.status(400).json({ message: 'Fichier PDF requis' });

    const fileUrl = file.path;
    const coverUrl = cover ? cover.path : null;

    const result = await pool.query(
      `INSERT INTO guides (title, description, file_url, cover_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, fileUrl, coverUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST guide:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;