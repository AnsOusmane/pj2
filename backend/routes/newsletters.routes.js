const express = require('express');
const router = express.Router();
const { pool } = require('../db');

const multer = require('multer');
const path = require('path');

// ==============================
// CONFIG MULTER
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ==============================
// GET ALL NEWSLETTERS
// ==============================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        title,
        description,
        file_url,
        cover_url,
        created_at
      FROM newsletters
      ORDER BY created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error('Erreur GET newsletters :', err);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});

// ==============================
// POST ADD NEWSLETTER  ✅ IMPORTANT
// ==============================
router.post(
  '/',
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, description } = req.body;

      const file = req.files?.file?.[0];
      const cover = req.files?.cover?.[0];

      if (!file) {
        return res.status(400).json({
          message: 'Fichier PDF requis'
        });
      }

      const fileUrl = `/uploads/${file.filename}`;
      const coverUrl = cover
        ? `/uploads/${cover.filename}`
        : null;

      const result = await pool.query(
        `INSERT INTO newsletters
        (title, description, file_url, cover_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [title, description, fileUrl, coverUrl]
      );

      res.status(201).json(result.rows[0]);

    } catch (err) {
      console.error('Erreur POST newsletter :', err);
      res.status(500).json({
        message: 'Erreur serveur'
      });
    }
  }
);

module.exports = router;