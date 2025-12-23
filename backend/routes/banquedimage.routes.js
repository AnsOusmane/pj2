const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// 📂 Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/banque_images';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/**
 * POST /api/banque-images
 * Ajouter une image à la banque
 */
router.post('/', upload.single('file'), (req, res) => {
  const { title, description, alt_text, category } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!title || !file) {
    return res.status(400).json({
      message: 'Le titre et le fichier sont obligatoires'
    });
  }

  const sql = `
    INSERT INTO banque_images
    (title, description, file, alt_text, category)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title,
      description || null,
      file,
      alt_text || null,
      category || null
    ],
    (err, result) => {
      if (err) {
        console.error('❌ ERREUR SQL :', err);
        return res.status(500).json({
          message: 'Erreur lors de l’enregistrement de l’image'
        });
      }

      res.status(201).json({
        message: '✅ Image ajoutée avec succès',
        id: result.insertId,
        data: {
          title,
          description,
          file,
          alt_text,
          category
        }
      });
    }
  );
});

module.exports = router;
