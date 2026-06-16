const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { pool } = require('../db');
const { makeUpload, pdfOnly } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const celluleOrAdmin = require('../middleware/cellule.middleware');

const upload = makeUpload('appels-offre', { fileFilter: pdfOnly });

// ====================== VALIDATION ======================
const STATUTS = ['ouvert', 'cloture'];

// Les données arrivent en multipart/form-data (upload de PDF) : tout est chaîne.
// On normalise donc une chaîne vide en undefined avant validation.
const empty = (v) => (v === '' || v === undefined || v === null ? undefined : v);

const aoSchema = z.object({
  reference: z.string().trim().max(100).optional(),
  objet: z.string().trim().min(2, "L'objet de l'appel d'offres est requis"),
  description: z.string().trim().optional(),
  type_marche: z.string().trim().max(50).optional(),
  mode_passation: z.string().trim().max(100).optional(),
  source_financement: z.string().trim().max(150).optional(),
  date_lancement: z.coerce.date().optional(),
  date_limite: z.coerce.date().optional(),
  statut: z.enum(STATUTS).optional().default('ouvert')
});

const aoUpdateSchema = aoSchema.partial();

// Pré-traite req.body : '' → undefined pour tous les champs.
function clean(body) {
  const out = {};
  for (const [k, v] of Object.entries(body)) out[k] = empty(v);
  return out;
}

// is_published arrive en chaîne ('true'/'false') depuis le FormData.
const parseBool = (v) => v === true || v === 'true';

// ====================== GET PUBLIC (publiés uniquement) ======================
// Filtres : ?statut=ouvert&type_marche=Travaux
router.get('/', async (req, res) => {
  try {
    const { statut, type_marche } = req.query;
    const conditions = ['is_published = true'];
    const values = [];

    if (statut)      { values.push(statut);      conditions.push(`statut = $${values.length}`); }
    if (type_marche) { values.push(type_marche); conditions.push(`type_marche = $${values.length}`); }

    const result = await pool.query(
      `SELECT id, reference, objet, description, type_marche, mode_passation,
              source_financement, date_lancement, date_limite, file_url, statut, updated_at
       FROM appels_offre
       WHERE ${conditions.join(' AND ')}
       ORDER BY (date_limite IS NULL), date_limite ASC, created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET appels-offre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== GET GESTION (cellule/admin) ======================
router.get('/manage', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.fullname AS updated_by_name
       FROM appels_offre a
       LEFT JOIN users u ON u.id = a.updated_by
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET appels-offre/manage:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== POST (création) ======================
router.post('/', authMiddleware, celluleOrAdmin, upload.single('file'), async (req, res) => {
  try {
    const data = aoSchema.parse(clean(req.body));
    const isPublished = parseBool(req.body.is_published);
    const fileUrl = req.file ? req.file.path : null;

    const result = await pool.query(
      `INSERT INTO appels_offre
         (reference, objet, description, type_marche, mode_passation, source_financement,
          date_lancement, date_limite, file_url, statut, is_published, created_by, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12)
       RETURNING *`,
      [
        data.reference ?? null, data.objet, data.description ?? null,
        data.type_marche ?? null, data.mode_passation ?? null, data.source_financement ?? null,
        data.date_lancement ?? null, data.date_limite ?? null, fileUrl,
        data.statut, isPublished, req.user.id
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    console.error('Erreur POST appels-offre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== PUT (mise à jour partielle) ======================
router.put('/:id', authMiddleware, celluleOrAdmin, upload.single('file'), async (req, res) => {
  try {
    const data = aoUpdateSchema.parse(clean(req.body));

    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      values.push(value);
      fields.push(`${key} = $${values.length}`);
    }

    // is_published : présent seulement s'il est explicitement envoyé.
    if (req.body.is_published !== undefined) {
      values.push(parseBool(req.body.is_published));
      fields.push(`is_published = $${values.length}`);
    }

    // Nouveau PDF fourni → on remplace l'URL ; sinon on conserve l'existant.
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
      `UPDATE appels_offre SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appel d\'offres non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    console.error('Erreur PUT appels-offre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== DELETE ======================
router.delete('/:id', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM appels_offre WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Appel d\'offres non trouvé' });
    }
    res.json({ success: true, message: 'Appel d\'offres supprimé' });
  } catch (err) {
    console.error('Erreur DELETE appels-offre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
