// Création (POST) déplacée vers backend-admin/routes/images-bank.routes.js
// — voir le plan de séparation admin. Ce fichier ne sert plus que la lecture publique.
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

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

module.exports = router;
