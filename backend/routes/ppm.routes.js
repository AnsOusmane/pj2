const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth.middleware');
const celluleOrAdmin = require('../middleware/cellule.middleware');

// ====================== SCHÉMAS DE VALIDATION ======================
const STATUTS = ['prevu', 'lance', 'attribue', 'cloture'];

// z.coerce : les valeurs arrivent en chaînes (form-urlencoded / JSON souple).
const ppmSchema = z.object({
  reference: z.string().trim().max(100).optional().nullable(),
  objet: z.string().trim().min(2, "L'objet du marché est requis"),
  type_marche: z.string().trim().max(50).optional().nullable(),
  mode_passation: z.string().trim().max(100).optional().nullable(),
  source_financement: z.string().trim().max(150).optional().nullable(),
  montant_estime: z.coerce.number().nonnegative().optional().nullable(),
  annee: z.coerce.number().int().min(2000).max(2100),
  trimestre: z.enum(['T1', 'T2', 'T3', 'T4']).optional().nullable(),
  date_prevue_lancement: z.coerce.date().optional().nullable(),
  statut: z.enum(STATUTS).optional().default('prevu'),
  is_published: z.coerce.boolean().optional().default(false)
});

// PUT : tous les champs deviennent optionnels (mise à jour partielle).
const ppmUpdateSchema = ppmSchema.partial();

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

// ====================== GET GESTION (cellule/admin : tout, brouillons inclus) ======================
router.get('/manage', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    // ?archived=true → lignes archivées ; sinon lignes actives uniquement.
    const archived = req.query.archived === 'true';
    const result = await pool.query(
      `SELECT p.*, u.fullname AS updated_by_name
       FROM ppm p
       LEFT JOIN users u ON u.id = p.updated_by
       WHERE p.archived_at IS ${archived ? 'NOT NULL' : 'NULL'}
       ORDER BY p.annee DESC, p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET ppm/manage:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== POST (création) ======================
router.post('/', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const data = ppmSchema.parse(req.body);
    const result = await pool.query(
      `INSERT INTO ppm
         (reference, objet, type_marche, mode_passation, source_financement,
          montant_estime, annee, trimestre, date_prevue_lancement, statut,
          is_published, created_by, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12)
       RETURNING *`,
      [
        data.reference ?? null, data.objet, data.type_marche ?? null,
        data.mode_passation ?? null, data.source_financement ?? null,
        data.montant_estime ?? null, data.annee, data.trimestre ?? null,
        data.date_prevue_lancement ?? null, data.statut, data.is_published,
        req.user.id
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    console.error('Erreur POST ppm:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== PUT (mise à jour partielle) ======================
router.put('/:id', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const data = ppmUpdateSchema.parse(req.body);

    // Construction dynamique du SET à partir des seuls champs fournis.
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      values.push(value);
      fields.push(`${key} = $${values.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }

    // updated_by = utilisateur courant, updated_at = maintenant
    values.push(req.user.id);
    fields.push(`updated_by = $${values.length}`);
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE ppm SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ligne PPM non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    console.error('Erreur PUT ppm:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== ARCHIVAGE (remplace la suppression) ======================
router.patch('/:id/archive', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE ppm SET archived_at = CURRENT_TIMESTAMP, archived_by = $1
       WHERE id = $2 AND archived_at IS NULL RETURNING id`,
      [req.user.id, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Ligne PPM non trouvée ou déjà archivée' });
    }
    res.json({ success: true, message: 'Ligne PPM archivée' });
  } catch (err) {
    console.error('Erreur archive ppm:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.patch('/:id/unarchive', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE ppm SET archived_at = NULL, archived_by = NULL
       WHERE id = $1 AND archived_at IS NOT NULL RETURNING id`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Ligne PPM non trouvée ou déjà active' });
    }
    res.json({ success: true, message: 'Ligne PPM restaurée' });
  } catch (err) {
    console.error('Erreur unarchive ppm:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
