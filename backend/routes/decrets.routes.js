const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db'); // 🔴 MANQUAIT

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/decrets';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// POST : ajouter un décret officiel
router.post('/', upload.single('file'), (req, res) => {
  const { title, description } = req.body;
  const file = req.file?.filename;

  if (!title || !file) {
    return res.status(400).json({ message: 'Titre et fichier requis.' });
  }

  const sql = `
    INSERT INTO decrets (title, description, file)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [title, description, file], (err, result) => {
    if (err) {
      console.error('❌ ERREUR SQL :', err);
      return res.status(500).json({ message: 'Erreur lors de l’enregistrement' });
    }

    console.log('✅ Décret enregistré ID:', result.insertId);

    res.json({
      message: 'Décret ajouté avec succès',
      id: result.insertId,
      data: { title, description, file }
    });
  });
});

module.exports = router;
