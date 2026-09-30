// ====================================================================
// Carrière — Candidatures spontanées (gestion admin)
// --------------------------------------------------------------------
// - GET  /manage      : cellule / admin (liste, filtre statut + archivés)
// - PUT  /:id         : cellule / admin (statut + note)
// - PATCH /:id/archive, /:id/unarchive : cellule / admin (soft-archive)
// Le dépôt public (POST /) vit côté backend public (dépôt anonyme).
// ====================================================================
const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth.middleware');
const requirePermission = require('../middleware/permission.middleware');
const { buildSetClause, mountArchiveRoutes } = require('../utils/crud-helpers');

// ====================== VALIDATION ======================
const STATUTS = ['recu', 'en_cours', 'retenu', 'rejete'];

// ====================== GET GESTION (cellule/admin) ======================
// Filtres optionnels : ?statut=recu  &  ?archived=true
router.get('/manage', authMiddleware, requirePermission('candidatures'), async (req, res) => {
  try {
    const { statut } = req.query;
    const archived = req.query.archived === 'true';
    const conditions = [`c.archived_at IS ${archived ? 'NOT NULL' : 'NULL'}`];
    const values = [];
    if (statut) { values.push(statut); conditions.push(`c.statut = $${values.length}`); }
    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await pool.query(
      `SELECT c.*, u.fullname AS updated_by_name
       FROM candidatures c
       LEFT JOIN users u ON u.id = c.updated_by
       ${where}
       ORDER BY c.created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET candidatures/manage:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== PUT (mise à jour du statut / note) ======================
router.put('/:id', authMiddleware, requirePermission('candidatures'), async (req, res) => {
  try {
    const schema = z.object({
      statut: z.enum(STATUTS).optional(),
      note_traitement: z.string().trim().optional().nullable()
    });
    const data = schema.parse(req.body);
    // Normalise la note vide en NULL, comme le faisait le code manuel d'origine.
    if (data.note_traitement !== undefined) data.note_traitement = data.note_traitement || null;

    const { fields, values } = buildSetClause(data);

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }

    values.push(req.user.id);
    fields.push(`updated_by = $${values.length}`);
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE candidatures SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    console.error('Erreur PUT candidatures:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== ARCHIVAGE (remplace la suppression) ======================
mountArchiveRoutes(router, {
  table: 'candidatures',
  permission: 'candidatures',
  messages: {
    notFoundArchive: 'Candidature non trouvée ou déjà archivée',
    archived: 'Candidature archivée',
    notFoundRestore: 'Candidature non trouvée ou déjà active',
    restored: 'Candidature restaurée'
  }
});

module.exports = router;
