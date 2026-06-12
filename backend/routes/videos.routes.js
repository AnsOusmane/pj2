const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { pool } = require('../db');
const authMiddleware = require('../middleware/auth.middleware');


// ===============================
// CONFIG MULTER (UPLOAD)
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails/');
    } else if (file.fieldname === 'video') {
      cb(null, 'uploads/videos/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 Mo max
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Fichier image invalide'), false);
      }
    }

    if (file.fieldname === 'video') {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Fichier vidéo invalide'), false);
      }
    }

    cb(null, true);
  }
});


// ===============================
// GET ALL VIDEOS
// ===============================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM videos
      ORDER BY id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});


// ===============================
// CREATE VIDEO
// ===============================
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, description, embed_url, duration } = req.body;

      const thumbnail = req.files['thumbnail']
        ? req.files['thumbnail'][0].filename
        : null;

      const video = req.files['video']
        ? req.files['video'][0].filename
        : null;

      // ✅ Validation logique
      if (!embed_url && !video) {
        return res.status(400).json({
          message: 'Veuillez fournir un lien YouTube ou une vidéo.'
        });
      }

      const result = await pool.query(`
        INSERT INTO videos
        (title, description, embed_url, duration, thumbnail, video)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        title,
        description,
        embed_url || null,
        duration || null,
        thumbnail,
        video
      ]);

      res.status(201).json(result.rows[0]);

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erreur lors de la création de la vidéo'
      });
    }
  }
);

module.exports = router;