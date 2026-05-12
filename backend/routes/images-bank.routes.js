const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// GET ALL
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM images_bank ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET images-bank:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Image requise' });

    const imageUrl = `/uploads/${file.filename}`;

    const result = await pool.query(
      `INSERT INTO images_bank (title, description, image_url, category)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, imageUrl, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST images-bank:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;