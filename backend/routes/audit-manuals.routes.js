// Création (POST) déplacée vers backend-admin/routes/audit-manuals.routes.js
// — voir le plan de séparation admin. Ce fichier ne sert plus que la lecture publique.
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET ALL → Public (site vitrine)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM audit_manuals ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET audit-manuals:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
