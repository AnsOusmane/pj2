const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/rapports';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Route POST pour ajouter un rapport officiel
router.post('/', upload.single('file'), (req, res) => {
  const { title, description } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!title || !file) {
    return res.status(400).json({ message: 'Titre et fichier requis.' });
  }

  // Ici tu peux insérer les données dans MySQL
  // Exemple :
  // db.query('INSERT INTO rapports_officiels (title, description, file) VALUES (?, ?, ?)',
  //          [title, description, file]);

  console.log({ title, description, file });
  res.json({ message: 'Rapport ajouté avec succès !', data: { title, description, file } });
});

module.exports = router;
