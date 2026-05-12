// routes/decrets.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');

// ==========================
// CONFIG MULTER
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/decrets';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('📁 Dossier créé :', dir);
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;

    console.log('📝 Nom fichier généré :', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ];

  if (allowed.includes(file.mimetype)) {
    console.log('✅ Fichier accepté :', file.originalname);
    cb(null, true);
  } else {
    console.log('❌ Fichier refusé :', file.originalname);
    cb(new Error('Formats autorisés : PDF, JPG, PNG'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 Mo
  }
});

// ==========================
// GET TOUS LES DÉCRETS
// ==========================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        description,
        file_path,
        created_at
      FROM decrets
      ORDER BY created_at DESC
    `);

    console.log('📤 Décrets envoyés :', result.rows.length);

    res.json(result.rows);
  } catch (err) {
    console.error('🔥 Erreur GET décrets :', err);

    res.status(500).json({
      message: 'Erreur serveur lors du chargement'
    });
  }
});

// ==========================
// POST AJOUTER DÉCRET
// ==========================
router.post(
  '/',
  (req, res, next) => {
    console.log('📩 POST /api/decrets reçu');
    console.log('Content-Type :', req.headers['content-type']);

    next();
  },

  upload.single('file'),

  async (req, res) => {
    try {
      console.log('BODY :', req.body);
      console.log('FILE :', req.file);

      const { title, description } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          message: 'Le titre est obligatoire.'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: 'Le fichier est obligatoire.'
        });
      }

      const filePath =
        `/uploads/decrets/${req.file.filename}`;

      const result = await pool.query(
        `
        INSERT INTO decrets
        (
          title,
          description,
          file_path,
          created_at
        )
        VALUES ($1, $2, $3, NOW())
        RETURNING
          id,
          title,
          description,
          file_path,
          created_at
        `,
        [
          title.trim(),
          description?.trim() || null,
          filePath
        ]
      );

      console.log('✅ Décret ajouté ID :', result.rows[0].id);

      res.status(201).json({
        message: 'Décret ajouté avec succès',
        data: result.rows[0]
      });

    } catch (err) {
      console.error('🔥 Erreur POST décret :', err);

      res.status(500).json({
        message: 'Erreur serveur',
        error: err.message
      });
    }
  }
);

module.exports = router;