const express = require('express');
const router = express.Router();

const { pool } = require('../db');

const multer = require('multer');
const path = require('path');
const fs = require('fs');


// ===============================
// UPLOAD CONFIG (thumbnail)
// ===============================

// dossier de stockage
const uploadDir = path.join(__dirname, '../uploads/actualites');

// créer dossier si inexistant
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowed.test(file.mimetype);

    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error('Format image invalide (jpg, png, webp uniquement)'));
    }
  }
});


// ===============================
// GET ALL ACTUALITES
// ===============================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM actualites
      ORDER BY published_at DESC NULLS LAST, id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error('Erreur GET actualites:', error);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});


// ===============================
// CREATE ACTUALITE + UPLOAD IMAGE
// ===============================
router.post('/', upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, content, link } = req.body;

    // validation
    if (!title || !content) {
      return res.status(400).json({
        message: 'Titre et contenu requis'
      });
    }

    // image uploadée
    const image_url = req.file
      ? `/uploads/actualites/${req.file.filename}`
      : null;

    const result = await pool.query(`
      INSERT INTO actualites
      (title, content, image_url, link, published_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [title, content, image_url, link]);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Erreur POST actualites:', error);
    res.status(500).json({
      message: 'Erreur lors de la création'
    });
  }
});


// ===============================
// EXPORT ROUTER
// ===============================
module.exports = router;