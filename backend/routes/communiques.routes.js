// routes/communiques.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');   // ← ton pool Neon exporté

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/communiques';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, name + ext);
  }
});

// Optionnel : filtre par type de fichier
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non autorisé. PDF, JPG, PNG uniquement.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo max
});

// GET : Récupère tous les communiqués (pour l'affichage public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, file_path, created_at
      FROM communiques
      ORDER BY created_at DESC
    `);

    // Renvoie directement le tableau JSON
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des communiqués :', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération' });
  }
});
// POST – Ajouter un communiqué
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const filePath = req.file ? `/uploads/communiques/${req.file.filename}` : null;

    if (!title || !filePath) {
      return res.status(400).json({ message: 'Titre et fichier sont obligatoires.' });
    }

    const result = await pool.query(
      `INSERT INTO communiques 
         (title, description, file_path, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, title, description, file_path, created_at`,
      [title, description || null, filePath]
    );

    res.status(201).json({
      message: 'Communiqué ajouté avec succès',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur lors de l’ajout communiqué:', err);
    res.status(500).json({
      message: 'Erreur serveur lors de l’enregistrement',
      error: err.message
    });
  }
});

module.exports = router;