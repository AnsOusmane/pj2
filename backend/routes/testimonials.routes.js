// Création (POST) déplacée vers backend-admin/routes/testimonials.routes.js
// — voir le plan de séparation admin. Ce fichier ne sert plus que la lecture publique.
const express = require('express');
const router = express.Router();

const { pool } = require('../db');

// ===============================
// GET ALL TESTIMONIALS
// ===============================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM testimonials
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

module.exports = router;
