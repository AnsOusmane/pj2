const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const requirePermission = require('../middleware/permission.middleware');

const upload = makeUpload('images-bank');

// POST
router.post('/', authMiddleware, requirePermission('banque-images'), upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Image requise' });

    const imageUrl = file.path;

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
