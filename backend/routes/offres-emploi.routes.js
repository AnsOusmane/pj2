const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');

const upload = makeUpload('offres-emploi');

// GET ALL
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM offres_emploi 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET offres-emploi:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST
router.post('/', authMiddleware, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, company, location, deadline } = req.body;
    const file = req.files?.file?.[0];
    const cover = req.files?.cover?.[0];

    if (!file) return res.status(400).json({ message: 'Fichier PDF requis' });

    const fileUrl = file.path;
    const coverUrl = cover ? cover.path : null;

    const result = await pool.query(
      `INSERT INTO offres_emploi (title, description, company, location, deadline, file_url, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      // deadline vide ('') → null : une colonne date Postgres refuse la chaîne vide.
      [title, description, company, location, deadline || null, fileUrl, coverUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST offre-emploi:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;