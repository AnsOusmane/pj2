// Création (POST) déplacée vers backend-admin/routes/actualites.routes.js
// — voir le plan de séparation admin. Ce fichier ne sert plus que la lecture publique.
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET ALL → Public (visible sur le site vitrine)
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
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
