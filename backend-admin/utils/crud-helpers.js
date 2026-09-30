const { pool } = require('../db');
const authMiddleware = require('../middleware/auth.middleware');
const requirePermission = require('../middleware/permission.middleware');

// Construit dynamiquement la clause SET d'un UPDATE à partir des seules clés
// présentes dans `data` (les champs optionnels absents ne sont pas touchés).
// Retourne des tableaux `fields`/`values` : l'appelant peut y ajouter d'autres
// champs (is_published, file_url, updated_by...) avant de finaliser la requête,
// les index `$n` restent corrects tant qu'on continue à pousser dans `values`.
function buildSetClause(data) {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    fields.push(`${key} = $${values.length}`);
  }
  return { fields, values };
}

// Monte les deux routes PATCH /:id/archive et /:id/unarchive (soft-delete par
// horodatage), identiques d'une entité à l'autre à part le nom de table et les
// messages. Remplace la duplication présente dans candidatures, fournisseurs,
// ppm, appels-offre et avis-attribution.
function mountArchiveRoutes(router, { table, permission, messages = {} }) {
  const m = {
    notFoundArchive: 'Élément non trouvé ou déjà archivé',
    archived: 'Élément archivé',
    notFoundRestore: 'Élément non trouvé ou déjà actif',
    restored: 'Élément restauré',
    ...messages
  };

  router.patch('/:id/archive', authMiddleware, requirePermission(permission), async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE ${table} SET archived_at = CURRENT_TIMESTAMP, archived_by = $1
         WHERE id = $2 AND archived_at IS NULL RETURNING id`,
        [req.user.id, req.params.id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: m.notFoundArchive });
      }
      res.json({ success: true, message: m.archived });
    } catch (err) {
      console.error(`Erreur archive ${table}:`, err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  router.patch('/:id/unarchive', authMiddleware, requirePermission(permission), async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE ${table} SET archived_at = NULL, archived_by = NULL
         WHERE id = $1 AND archived_at IS NOT NULL RETURNING id`,
        [req.params.id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: m.notFoundRestore });
      }
      res.json({ success: true, message: m.restored });
    } catch (err) {
      console.error(`Erreur unarchive ${table}:`, err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
}

module.exports = { buildSetClause, mountArchiveRoutes };
