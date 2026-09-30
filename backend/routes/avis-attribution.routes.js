// Gestion (POST/PUT/archivage) déplacée vers backend-admin/routes/avis-attribution.routes.js
// — voir le plan de séparation admin. Ce fichier ne sert plus que la lecture publique.
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// ====================== GET PUBLIC (publiés uniquement) ======================
// Filtres : ?type_marche=Travaux
router.get('/', async (req, res) => {
  try {
    const { type_marche } = req.query;
    const conditions = ['is_published = true', 'archived_at IS NULL'];
    const values = [];

    if (type_marche) { values.push(type_marche); conditions.push(`type_marche = $${values.length}`); }

    const result = await pool.query(
      `SELECT id, reference, objet, attributaire, montant, type_marche,
              mode_passation, date_attribution, file_url, updated_at
       FROM avis_attribution
       WHERE ${conditions.join(' AND ')}
       ORDER BY (date_attribution IS NULL), date_attribution DESC, created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET avis-attribution:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
