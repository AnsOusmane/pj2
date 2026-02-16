// routes/decrets.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db'); // ton pool Neon

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/decrets';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, name + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('PDF, JPG ou PNG uniquement'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo
});

// GET – Liste tous les décrets (pour affichage public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, file_path, created_at
      FROM decrets
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET décrets:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// POST – Ajouter un décret
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const filePath = req.file ? `/uploads/decrets/${req.file.filename}` : null;

    if (!title || !filePath) {
      return res.status(400).json({ message: 'Titre et fichier obligatoires.' });
    }

    const result = await pool.query(
      `INSERT INTO decrets 
         (title, description, file_path, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, title, description, file_path, created_at`,
      [title, description || null, filePath]
    );

    res.status(201).json({
      message: 'Décret ajouté avec succès',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur ajout décret:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;