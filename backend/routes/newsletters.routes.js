// Création (POST) déplacée vers backend-admin/routes/newsletters.routes.js
// — voir le plan de séparation admin. Ce fichier ne sert plus que la lecture publique.
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET ALL (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, file_url, cover_url, created_at
      FROM newsletters
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
