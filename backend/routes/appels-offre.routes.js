// Gestion (POST/PUT/archivage) déplacée vers backend-admin/routes/appels-offre.routes.js
// — voir le plan de séparation admin. Ce fichier ne sert plus que la lecture publique.
//
// Le balayage lazySweep() n'est PLUS appelé ici : il tourne désormais
// uniquement côté backend-admin (au démarrage + toutes les heures), pour
// éviter que les deux services l'exécutent en parallèle sans verrou
// inter-process. Les statuts publics restent à jour dans l'heure.
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// ====================== GET PUBLIC (publiés uniquement) ======================
// Filtres : ?statut=ouvert&type_marche=Travaux
router.get('/', async (req, res) => {
  try {
    const { statut, type_marche } = req.query;
    const conditions = ['ao.is_published = true', 'ao.archived_at IS NULL'];
    const values = [];

    if (statut)      { values.push(statut);      conditions.push(`ao.statut = $${values.length}`); }
    if (type_marche) { values.push(type_marche); conditions.push(`ao.type_marche = $${values.length}`); }

    // Avis d'attribution publié et lié à l'AO (le plus récent) : exposé au public
    // pour consultation/téléchargement directement depuis la page des appels d'offres.
    const result = await pool.query(
      `SELECT ao.id, ao.reference, ao.objet, ao.description, ao.type_marche, ao.mode_passation,
              ao.source_financement, ao.date_lancement, ao.date_limite, ao.file_url, ao.statut, ao.updated_at,
              av.file_url        AS avis_file_url,
              av.reference       AS avis_reference,
              av.attributaire    AS avis_attributaire,
              av.montant         AS avis_montant,
              av.date_attribution AS avis_date_attribution
       FROM appels_offre ao
       LEFT JOIN LATERAL (
         SELECT file_url, reference, attributaire, montant, date_attribution
         FROM avis_attribution
         WHERE appel_offre_id = ao.id AND is_published = true AND archived_at IS NULL
         ORDER BY date_attribution DESC NULLS LAST, created_at DESC
         LIMIT 1
       ) av ON true
       WHERE ${conditions.join(' AND ')}
       ORDER BY (ao.date_limite IS NULL), ao.date_limite ASC, ao.created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET appels-offre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
