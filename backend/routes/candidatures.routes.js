// ====================================================================
// Carrière — Candidatures spontanées
// --------------------------------------------------------------------
// Stocke en base les candidatures reçues via le formulaire Carrière, EN
// PLUS de la notification e-mail (Web3Forms) gérée côté front.
//
// Le CV est uploadé sur Cloudinary par le front (preset non signé, accepte
// PDF/DOC/DOCX) ; ce backend reçoit donc des données JSON et conserve l'URL
// du CV. Pas d'upload multer ici (sinon le filtre PDF-only rejetterait les
// CV Word).
//
// - POST /            : public anonyme (dépôt), rate-limité
// - GET  /manage      : cellule / admin (liste, filtre statut + archivés)
// - PUT  /:id         : cellule / admin (statut + note)
// - PATCH /:id/archive, /:id/unarchive : cellule / admin (soft-archive)
// ====================================================================
const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { pool } = require('../db');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth.middleware');
const celluleOrAdmin = require('../middleware/cellule.middleware');

// Dépôt public anonyme : on limite par IP pour prévenir l'abus
// (en plus du limiteur global /api/).
const depotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 15,
  message: { message: 'Trop de candidatures depuis cette adresse. Réessayez plus tard.' }
});

// ====================== VALIDATION ======================
const STATUTS = ['recu', 'en_cours', 'retenu', 'rejete'];
const empty = (v) => (v === '' || v === undefined || v === null ? undefined : v);

const depotSchema = z.object({
  nom: z.string().trim().min(2, 'Le nom est requis').max(255),
  email: z.string().trim().email('Email invalide').max(255),
  telephone: z.string().trim().max(50).optional(),
  poste: z.string().trim().max(255).optional(),
  // cv_url : URL Cloudinary fournie par le front (optionnelle — un candidat
  // peut postuler sans joindre de fichier).
  cv_url: z.string().trim().url('Lien du CV invalide').max(2048).optional(),
  message: z.string().trim().max(5000).optional()
});

function clean(body) {
  const out = {};
  for (const [k, v] of Object.entries(body || {})) out[k] = empty(v);
  return out;
}

// ====================== POST PUBLIC (dépôt sans compte) ======================
router.post('/', depotLimiter, async (req, res) => {
  try {
    const data = depotSchema.parse(clean(req.body));

    const result = await pool.query(
      `INSERT INTO candidatures (nom, email, telephone, poste, cv_url, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [
        data.nom,
        data.email,
        data.telephone ?? null,
        data.poste ?? null,
        data.cv_url ?? null,
        data.message ?? null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Votre candidature a bien été enregistrée.',
      id: result.rows[0].id,
      created_at: result.rows[0].created_at
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    console.error('Erreur POST candidatures:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== GET GESTION (cellule/admin) ======================
// Filtres optionnels : ?statut=recu  &  ?archived=true
router.get('/manage', authMiddleware, celluleOrAdmin, async (req, res) => {
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
router.put('/:id', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const schema = z.object({
      statut: z.enum(STATUTS).optional(),
      note_traitement: z.string().trim().optional().nullable()
    });
    const data = schema.parse(req.body);

    const fields = [];
    const values = [];
    if (data.statut !== undefined) { values.push(data.statut); fields.push(`statut = $${values.length}`); }
    if (data.note_traitement !== undefined) {
      values.push(data.note_traitement || null);
      fields.push(`note_traitement = $${values.length}`);
    }

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
router.patch('/:id/archive', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE candidatures SET archived_at = CURRENT_TIMESTAMP, archived_by = $1
       WHERE id = $2 AND archived_at IS NULL RETURNING id`,
      [req.user.id, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Candidature non trouvée ou déjà archivée' });
    }
    res.json({ success: true, message: 'Candidature archivée' });
  } catch (err) {
    console.error('Erreur archive candidatures:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.patch('/:id/unarchive', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE candidatures SET archived_at = NULL, archived_by = NULL
       WHERE id = $1 AND archived_at IS NOT NULL RETURNING id`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Candidature non trouvée ou déjà active' });
    }
    res.json({ success: true, message: 'Candidature restaurée' });
  } catch (err) {
    console.error('Erreur unarchive candidatures:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
