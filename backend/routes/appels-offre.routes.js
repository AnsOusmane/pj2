const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { pool } = require('../db');
const { makeUpload, pdfOnly } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const celluleOrAdmin = require('../middleware/cellule.middleware');
const { lazySweep, sweepAoStatuses } = require('../jobs/ao-status.job');

const upload = makeUpload('appels-offre', { fileFilter: pdfOnly });

// ====================== VALIDATION ======================
// a_venir : la date de lancement n'est pas encore atteinte (statut piloté par les dates).
const STATUTS = ['a_venir', 'ouvert', 'cloture'];

// Statut déduit des dates, cohérent avec le balayage SQL.
// Règle progressive : limite dépassée → clôturé ; lancement futur → à venir ; sinon ouvert.
// date_lancement et date_limite sont des TIMESTAMPTZ (précision minute).
function statusFromDates(dateLancement, dateLimite) {
  const now = new Date();
  if (dateLimite && new Date(dateLimite) < now) return 'cloture';
  if (dateLancement && new Date(dateLancement) > now) return 'a_venir';
  return 'ouvert';
}

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
  statut: z.enum(STATUTS).optional().default('ouvert'),
  // Lien optionnel vers la ligne PPM dont découle cet appel d'offres.
  ppm_id: z.coerce.number().int().positive().optional()
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
    await lazySweep(); // réconcilie les statuts avec les dates avant de répondre
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

// ====================== GET GESTION (cellule/admin) ======================
router.get('/manage', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    await lazySweep(); // réconcilie les statuts avec les dates avant de répondre
    const archived = req.query.archived === 'true';
    const result = await pool.query(
      `SELECT a.*, u.fullname AS updated_by_name,
              p.reference AS ppm_reference, p.objet AS ppm_objet
       FROM appels_offre a
       LEFT JOIN users u ON u.id = a.updated_by
       LEFT JOIN ppm p ON p.id = a.ppm_id
       WHERE a.archived_at IS ${archived ? 'NOT NULL' : 'NULL'}
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
  let client;
  try {
    const data = aoSchema.parse(clean(req.body));
    const isPublished = parseBool(req.body.is_published);
    const fileUrl = req.file ? req.file.path : null;
    const ppmId = data.ppm_id ?? null;

    // Statut piloté par les dates : si une date est fournie, on le déduit
    // (à venir / ouvert / clôturé) plutôt que de faire confiance à la valeur saisie.
    // Sans aucune date, on conserve le statut choisi manuellement.
    const hasDates = data.date_lancement || data.date_limite;
    const statut = hasDates
      ? statusFromDates(data.date_lancement, data.date_limite)
      : (data.statut ?? 'ouvert');

    // Transaction : insertion de l'AO + éventuelle synchro de statut de la ligne PPM.
    client = await pool.connect();
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO appels_offre
         (reference, objet, description, type_marche, mode_passation, source_financement,
          date_lancement, date_limite, file_url, statut, is_published, ppm_id, created_by, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$13)
       RETURNING *`,
      [
        data.reference ?? null, data.objet, data.description ?? null,
        data.type_marche ?? null, data.mode_passation ?? null, data.source_financement ?? null,
        data.date_lancement ?? null, data.date_limite ?? null, fileUrl,
        statut, isPublished, ppmId, req.user.id
      ]
    );

    // Synchro conservatrice : la ligne PPM d'origine passe « prévu » → « lancé »
    // seulement si l'AO est effectivement lancé (ouvert/clôturé) et encore prévu côté PPM.
    // Un AO « à venir » ne lance pas le PPM : le balayage s'en chargera le jour venu.
    if (ppmId && statut !== 'a_venir') {
      await client.query(
        `UPDATE ppm SET statut = 'lance', updated_by = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND statut = 'prevu'`,
        [req.user.id, ppmId]
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
      return res.status(400).json({ message: 'La ligne PPM associée est introuvable.' });
    }
    console.error('Erreur POST appels-offre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    if (client) client.release();
  }
});

// ====================== PUT (mise à jour partielle) ======================
router.put('/:id', authMiddleware, celluleOrAdmin, upload.single('file'), async (req, res) => {
  try {
    const data = aoUpdateSchema.parse(clean(req.body));

    // Ligne existante : nécessaire pour fusionner les dates (mise à jour partielle)
    // et gérer le 404 avant de recalculer le statut.
    const existing = await pool.query(
      'SELECT date_lancement, date_limite, statut FROM appels_offre WHERE id = $1',
      [req.params.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Appel d\'offres non trouvé' });
    }
    const cur = existing.rows[0];

    const fields = [];
    const values = [];
    // Champs simples — le statut est exclu ici : il est recalculé d'après les dates.
    for (const [key, value] of Object.entries(data)) {
      if (key === 'statut') continue;
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

    // Statut piloté par les dates : on fusionne les dates du payload et l'existant.
    // Si aucune date n'est connue, on retombe sur le statut saisi (ou l'actuel).
    const effLancement = ('date_lancement' in data) ? data.date_lancement : cur.date_lancement;
    const effLimite    = ('date_limite' in data)    ? data.date_limite    : cur.date_limite;
    const statut = (effLancement || effLimite)
      ? statusFromDates(effLancement, effLimite)
      : (data.statut ?? cur.statut);
    values.push(statut);
    fields.push(`statut = $${values.length}`);

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

    // Si l'édition vient de lancer l'AO (date atteinte), synchronise la ligne PPM
    // « prévu » → « lancé ». Idempotent et non bloquant.
    if (statut !== 'a_venir') sweepAoStatuses().catch(() => {});

    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    if (err.code === '23503') {
      return res.status(400).json({ message: 'La ligne PPM associée est introuvable.' });
    }
    console.error('Erreur PUT appels-offre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== ARCHIVAGE (remplace la suppression) ======================
router.patch('/:id/archive', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE appels_offre SET archived_at = CURRENT_TIMESTAMP, archived_by = $1
       WHERE id = $2 AND archived_at IS NULL RETURNING id`,
      [req.user.id, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Appel d\'offres non trouvé ou déjà archivé' });
    }
    res.json({ success: true, message: 'Appel d\'offres archivé' });
  } catch (err) {
    console.error('Erreur archive appels-offre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.patch('/:id/unarchive', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE appels_offre SET archived_at = NULL, archived_by = NULL
       WHERE id = $1 AND archived_at IS NOT NULL RETURNING id`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Appel d\'offres non trouvé ou déjà actif' });
    }
    res.json({ success: true, message: 'Appel d\'offres restauré' });
  } catch (err) {
    console.error('Erreur unarchive appels-offre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
