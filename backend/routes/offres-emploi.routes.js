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

// GET ALL
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM offres_emploi 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET offres-emploi:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST
router.post('/', authMiddleware, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, company, location, deadline } = req.body;
    const file = req.files?.file?.[0];
    const cover = req.files?.cover?.[0];

    if (!file) return res.status(400).json({ message: 'Fichier PDF requis' });

    const fileUrl = `/uploads/${file.filename}`;
    const coverUrl = cover ? `/uploads/${cover.filename}` : null;

    const result = await pool.query(
      `INSERT INTO offres_emploi (title, description, company, location, deadline, file_url, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, company, location, deadline, fileUrl, coverUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST offre-emploi:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;