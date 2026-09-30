// Gestion (POST/PUT/archivage) déplacée vers backend-admin/routes/ppm.routes.js
// — voir le plan de séparation admin. Ce fichier ne sert plus que la lecture publique.
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// ====================== GET PUBLIC (lignes publiées uniquement) ======================
// Filtres optionnels : ?annee=2026&type_marche=Fournitures&statut=lance
router.get('/', async (req, res) => {
  try {
    const { annee, type_marche, statut } = req.query;
    const conditions = ['is_published = true', 'archived_at IS NULL'];
    const values = [];

    if (annee)       { values.push(annee);       conditions.push(`annee = $${values.length}`); }
    if (type_marche) { values.push(type_marche); conditions.push(`type_marche = $${values.length}`); }
    if (statut)      { values.push(statut);      conditions.push(`statut = $${values.length}`); }

    const result = await pool.query(
      `SELECT id, reference, objet, type_marche, mode_passation, source_financement,
              montant_estime, annee, trimestre, date_prevue_lancement, statut, updated_at
       FROM ppm
       WHERE ${conditions.join(' AND ')}
       ORDER BY annee DESC, created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET ppm:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
