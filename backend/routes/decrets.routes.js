// routes/decrets.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/decrets';
    if (!fs.existsSync(dir)) {
      console.log('Création dossier uploads/decrets');
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = name + ext;
    console.log('Nom généré :', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    console.log('Fichier accepté :', file.originalname, file.mimetype);
    cb(null, true);
  } else {
    console.log('Fichier rejeté :', file.originalname, file.mimetype);
    cb(new Error('PDF, JPG ou PNG uniquement'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo
});

// POST – Ajouter un décret
router.post('/', (req, res, next) => {
  console.log('Requête POST reçue sur /api/decrets');
  console.log('Content-Type :', req.headers['content-type']);
  console.log('Body brut :', req.body);

  upload.single('file')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('MulterError :', err);
      return res.status(400).json({ message: err.message || 'Erreur upload Multer' });
    } else if (err) {
      console.error('Erreur Multer :', err);
      return res.status(500).json({ message: 'Erreur upload', error: err.message });
    }

    // Log après parsing
    console.log('Après upload.single :');
    console.log('req.file :', req.file ? req.file.originalname : 'AUCUN FICHIER');
    console.log('req.body :', req.body);

    next();
  });
}, async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title) {
      return res.status(400).json({ message: 'Le titre est obligatoire.' });
    }

    if (!file) {
      return res.status(400).json({ message: 'Le fichier est obligatoire (champ "file" manquant).' });
    }

    const filePath = `/uploads/decrets/${file.filename}`;

    const result = await pool.query(
      `INSERT INTO decrets (title, description, file_path, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, title, description, file_path, created_at`,
      [title, description || null, filePath]
    );

    console.log('Succès INSERT - ID:', result.rows[0].id, 'Chemin :', filePath);
    res.status(201).json({
      message: 'Décret ajouté avec succès',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur complète POST décret:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;