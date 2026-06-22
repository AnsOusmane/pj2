const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { pool } = require('../db');
const { makeUpload, pdfOnly } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const celluleOrAdmin = require('../middleware/cellule.middleware');

const upload = makeUpload('avis-attribution', { fileFilter: pdfOnly });

// ====================== VALIDATION ======================
// Les données arrivent en multipart/form-data (upload PDF) : tout est chaîne.
const empty = (v) => (v === '' || v === undefined || v === null ? undefined : v);

const attrSchema = z.object({
  reference: z.string().trim().max(100).optional(),
  objet: z.string().trim().min(2, "L'objet du marché est requis"),
  attributaire: z.string().trim().min(2, "L'attributaire est requis"),
  montant: z.coerce.number().nonnegative().optional(),
  type_marche: z.string().trim().max(50).optional(),
  mode_passation: z.string().trim().max(100).optional(),
  date_attribution: z.coerce.date().optional(),
  // Lien optionnel vers l'appel d'offres dont découle cet avis.
  appel_offre_id: z.coerce.number().int().positive().optional()
});

const attrUpdateSchema = attrSchema.partial();

function clean(body) {
  const out = {};
  for (const [k, v] of Object.entries(body)) out[k] = empty(v);
  return out;
}

const parseBool = (v) => v === true || v === 'true';

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

// ====================== GET GESTION (cellule/admin) ======================
router.get('/manage', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const archived = req.query.archived === 'true';
    const result = await pool.query(
      `SELECT a.*, u.fullname AS updated_by_name,
              ao.reference AS ao_reference, ao.objet AS ao_objet
       FROM avis_attribution a
       LEFT JOIN users u ON u.id = a.updated_by
       LEFT JOIN appels_offre ao ON ao.id = a.appel_offre_id
       WHERE a.archived_at IS ${archived ? 'NOT NULL' : 'NULL'}
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET avis-attribution/manage:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== POST (création) ======================
router.post('/', authMiddleware, celluleOrAdmin, upload.single('file'), async (req, res) => {
  let client;
  try {
    const data = attrSchema.parse(clean(req.body));
    const isPublished = parseBool(req.body.is_published);
    const fileUrl = req.file ? req.file.path : null;
    const aoId = data.appel_offre_id ?? null;

    // Transaction : insertion de l'avis + clôture de l'AO + attribution du PPM lié.
    client = await pool.connect();
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO avis_attribution
         (reference, objet, attributaire, montant, type_marche, mode_passation,
          date_attribution, file_url, is_published, appel_offre_id, created_by, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)
       RETURNING *`,
      [
        data.reference ?? null, data.objet, data.attributaire, data.montant ?? null,
        data.type_marche ?? null, data.mode_passation ?? null, data.date_attribution ?? null,
        fileUrl, isPublished, aoId, req.user.id
      ]
    );

    // Synchro de bout de chaîne (conservatrice) : l'attribution clôt l'appel d'offres,
    // et la ligne PPM d'origine passe « lancé » → « attribué ».
    if (aoId) {
      await client.query(
        `UPDATE appels_offre SET statut = 'cloture', updated_by = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND archived_at IS NULL AND statut <> 'cloture'`,
        [req.user.id, aoId]
      );
      await client.query(
        `UPDATE ppm SET statut = 'attribue', updated_by = $1, updated_at = CURRENT_TIMESTAMP
         WHERE statut = 'lance'
           AND id = (SELECT ppm_id FROM appels_offre WHERE id = $2)`,
        [req.user.id, aoId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (client) { try { await client.query('ROLLBACK'); } catch (_) { /* pas de tx active */ } }
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    if (err.code === '23503') {
      return res.status(400).json({ message: "L'appel d'offres associé est introuvable." });
    }
    console.error('Erreur POST avis-attribution:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    if (client) client.release();
  }
});

// ====================== PUT (mise à jour partielle) ======================
router.put('/:id', authMiddleware, celluleOrAdmin, upload.single('file'), async (req, res) => {
  try {
    const data = attrUpdateSchema.parse(clean(req.body));

    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      values.push(value);
      fields.push(`${key} = $${values.length}`);
    }

    if (req.body.is_published !== undefined) {
      values.push(parseBool(req.body.is_published));
      fields.push(`is_published = $${values.length}`);
    }

    if (req.file) {
      values.push(req.file.path);
      fields.push(`file_url = $${values.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }

    values.push(req.user.id);
    fields.push(`updated_by = $${values.length}`);
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE avis_attribution SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Avis d\'attribution non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    if (err.code === '23503') {
      return res.status(400).json({ message: "L'appel d'offres associé est introuvable." });
    }
    console.error('Erreur PUT avis-attribution:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== ARCHIVAGE (remplace la suppression) ======================
router.patch('/:id/archive', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE avis_attribution SET archived_at = CURRENT_TIMESTAMP, archived_by = $1
       WHERE id = $2 AND archived_at IS NULL RETURNING id`,
      [req.user.id, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Avis d\'attribution non trouvé ou déjà archivé' });
    }
    res.json({ success: true, message: 'Avis d\'attribution archivé' });
  } catch (err) {
    console.error('Erreur archive avis-attribution:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.patch('/:id/unarchive', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE avis_attribution SET archived_at = NULL, archived_by = NULL
       WHERE id = $1 AND archived_at IS NOT NULL RETURNING id`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Avis d\'attribution non trouvé ou déjà actif' });
    }
    res.json({ success: true, message: 'Avis d\'attribution restauré' });
  } catch (err) {
    console.error('Erreur unarchive avis-attribution:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
