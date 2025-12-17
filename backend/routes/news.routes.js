const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configuration Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // dossier où seront stockées les images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Création dossier uploads si inexistant
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ------------------ Routes ------------------

// Ajouter une news avec image
router.post('/', upload.single('image'), (req, res) => {
  const { title, content } = req.body;
  let image = '';
  if (req.file) {
    image = '/uploads/' + req.file.filename; // chemin relatif pour Angular
  }
  const sql = 'INSERT INTO news (title, content, image) VALUES (?, ?, ?)';
  db.query(sql, [title, content, image], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'News ajoutée avec image', data: result });
  });
});

// Récupérer toutes les news
router.get('/', (req, res) => {
  db.query('SELECT * FROM news ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

module.exports = router;
