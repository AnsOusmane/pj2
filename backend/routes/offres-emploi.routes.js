// Gestion (GET /manage, POST, PATCH /active, DELETE) déplacée vers
// backend-admin/routes/offres-emploi.routes.js — voir le plan de séparation
// admin. Ce fichier ne sert plus que la lecture publique.
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

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

module.exports = router;
