const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { pool } = require('../db');
const rateLimit = require('express-rate-limit');
const { makeUpload, pdfOnly } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const requirePermission = require('../middleware/permission.middleware');
const verifyTurnstile = require('../middleware/turnstile.middleware');
const { sendAgrementConfirmation } = require('../services/agrement-notify');

const upload = makeUpload('fournisseurs', { fileFilter: pdfOnly });

// Champs de fichiers attendus pour le dépôt.
const depotFields = upload.fields([
  { name: 'doc_demande', maxCount: 1 },
  { name: 'doc_ninea', maxCount: 1 },
  { name: 'doc_presentation', maxCount: 1 },
  { name: 'doc_registre', maxCount: 1 },
  { name: 'doc_fiscale', maxCount: 1 }
]);

// Enveloppe multer pour transformer ses erreurs (fichier trop lourd, etc.) en
// réponses JSON claires : sans ça, une erreur multer court-circuite la route et
// renvoie un 500 opaque non interprétable côté client.
function handleDepotUpload(req, res, next) {
  depotFields(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: 'Un des fichiers PDF dépasse la taille maximale autorisée (10 Mo).'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Fichier inattendu dans le formulaire.' });
    }
    console.error('Erreur upload fournisseurs:', err);
    return res.status(400).json({
      message: 'Échec du téléversement des fichiers. Vérifiez qu\'il s\'agit bien de PDF de moins de 10 Mo.'
    });
  });
}

// Le dépôt est public et anonyme + upload de fichiers : on limite fortement
// par IP pour prévenir l'abus de stockage Cloudinary (en plus du limiteur global).
const depotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 8,
  message: { message: 'Trop de dépôts depuis cette adresse. Réessayez plus tard.' }
});

// ====================== VALIDATION ======================
const STATUTS = ['recu', 'en_cours', 'valide', 'rejete'];
const empty = (v) => (v === '' || v === undefined || v === null ? undefined : v);

// Dépôt public : on valide les champs métier (les fichiers sont gérés par multer).
const depotSchema = z.object({
  raison_sociale: z.string().trim().min(2, 'La raison sociale est requise'),
  ninea: z.string().trim().max(50).optional(),
  rccm: z.string().trim().max(100).optional(),
  domaine: z.string().trim().max(150).optional(),
  adresse: z.string().trim().optional(),
  telephone: z.string().trim().max(50).optional(),
  email: z.string().trim().email('Email invalide').max(255).optional(),
  contact_nom: z.string().trim().max(255).optional(),
  message: z.string().trim().optional()
});

function clean(body) {
  const out = {};
  for (const [k, v] of Object.entries(body)) out[k] = empty(v);
  return out;
}

// Génère le prochain numéro AGR-[ANNÉE]-[chrono sur 4 chiffres].
// numero étant UNIQUE, en cas de collision (concurrence rare), on relance.
async function nextNumero() {
  const annee = new Date().getFullYear();
  const { rows } = await pool.query(
    `SELECT COALESCE(MAX(CAST(SPLIT_PART(numero, '-', 3) AS INTEGER)), 0) + 1 AS prochain
     FROM fournisseurs_agrements
     WHERE numero LIKE $1`,
    [`AGR-${annee}-%`]
  );
  const chrono = String(rows[0].prochain).padStart(4, '0');
  return `AGR-${annee}-${chrono}`;
}

// ====================== POST PUBLIC (dépôt sans compte) ======================
// Pièces du cahier des charges (PDF) :
//   - doc_demande      : demande formelle au DG          (OBLIGATOIRE)
//   - doc_ninea        : copie du NINEA                   (OBLIGATOIRE)
//   - doc_presentation : présentation entreprise/plaquette (OBLIGATOIRE)
//   - doc_registre     : registre de commerce             (OBLIGATOIRE)
//   - doc_fiscale      : attestation fiscale              (facultatif, bonus)
// Anti-robot Cloudflare Turnstile désactivé pour l'instant (réactiver : remettre verifyTurnstile)
router.post('/', depotLimiter, /* verifyTurnstile, */ handleDepotUpload, async (req, res) => {
  try {
    const data = depotSchema.parse(clean(req.body));

    const docDemande = req.files?.doc_demande?.[0]?.path ?? null;
    const docNinea = req.files?.doc_ninea?.[0]?.path ?? null;
    const docPresentation = req.files?.doc_presentation?.[0]?.path ?? null;
    const docRegistre = req.files?.doc_registre?.[0]?.path ?? null;
    const docFiscale = req.files?.doc_fiscale?.[0]?.path ?? null;

    if (!docDemande || !docNinea || !docPresentation || !docRegistre) {
      return res.status(400).json({
        message: 'La demande au Directeur Général, la copie du NINEA, la présentation de l\'entreprise et le registre de commerce (PDF) sont obligatoires.'
      });
    }

    // Jusqu'à 2 tentatives en cas de collision de numéro (UNIQUE).
    let inserted = null;
    for (let attempt = 0; attempt < 2 && !inserted; attempt++) {
      const numero = await nextNumero();
      try {
        const result = await pool.query(
          `INSERT INTO fournisseurs_agrements
             (numero, raison_sociale, ninea, rccm, domaine, adresse, telephone, email,
              contact_nom, message, doc_demande_url, doc_ninea_url, doc_presentation_url,
              doc_registre_url, doc_fiscale_url)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
           RETURNING id, numero, created_at`,
          [
            numero, data.raison_sociale, data.ninea ?? null, data.rccm ?? null,
            data.domaine ?? null, data.adresse ?? null, data.telephone ?? null,
            data.email ?? null, data.contact_nom ?? null, data.message ?? null,
            docDemande, docNinea, docPresentation, docRegistre, docFiscale
          ]
        );
        inserted = result.rows[0];
      } catch (e) {
        if (e.code === '23505') continue; // violation UNIQUE → on retente
        throw e;
      }
    }

    if (!inserted) {
      return res.status(500).json({ message: 'Impossible de générer le numéro de dossier, réessayez.' });
    }

    res.status(201).json({
      success: true,
      message: 'Votre demande d\'agrément a bien été enregistrée.',
      numero: inserted.numero,
      created_at: inserted.created_at
    });

    // Confirmation au fournisseur (best-effort, non bloquant) : email + PDF récap.
    // Lancé après la réponse — un échec d'envoi n'impacte jamais le dépôt.
    const docName = (f) => req.files?.[f]?.[0]?.originalname || null;
    sendAgrementConfirmation({
      numero: inserted.numero,
      date: new Date(inserted.created_at).toLocaleString('fr-FR'),
      raison_sociale: data.raison_sociale,
      ninea: data.ninea, rccm: data.rccm, domaine: data.domaine,
      adresse: data.adresse, telephone: data.telephone, email: data.email,
      contact_nom: data.contact_nom, message: data.message,
      documents: [
        { label: 'Demande adressée au Directeur Général', nom: docName('doc_demande') },
        { label: 'Copie du NINEA', nom: docName('doc_ninea') },
        { label: "Présentation de l'entreprise", nom: docName('doc_presentation') },
        { label: 'Registre de commerce (RCCM)', nom: docName('doc_registre') },
        { label: 'Attestation fiscale', nom: docName('doc_fiscale') }
      ]
    }).catch((e) => console.error('[agrement] email de confirmation non envoyé:', e.message));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    console.error('Erreur POST fournisseurs:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== GET GESTION (cellule/admin) ======================
// Filtre optionnel : ?statut=recu
router.get('/manage', authMiddleware, requirePermission('fournisseurs'), async (req, res) => {
  try {
    const { statut } = req.query;
    const archived = req.query.archived === 'true';
    const conditions = [`f.archived_at IS ${archived ? 'NOT NULL' : 'NULL'}`];
    const values = [];
    if (statut) { values.push(statut); conditions.push(`f.statut = $${values.length}`); }
    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await pool.query(
      `SELECT f.*, u.fullname AS updated_by_name
       FROM fournisseurs_agrements f
       LEFT JOIN users u ON u.id = f.updated_by
       ${where}
       ORDER BY f.created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET fournisseurs/manage:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== PUT (mise à jour du statut / note) ======================
router.put('/:id', authMiddleware, requirePermission('fournisseurs'), async (req, res) => {
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
      `UPDATE fournisseurs_agrements SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Données invalides', errors: err.errors });
    }
    console.error('Erreur PUT fournisseurs:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== ARCHIVAGE (remplace la suppression) ======================
router.patch('/:id/archive', authMiddleware, requirePermission('fournisseurs'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE fournisseurs_agrements SET archived_at = CURRENT_TIMESTAMP, archived_by = $1
       WHERE id = $2 AND archived_at IS NULL RETURNING id`,
      [req.user.id, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Demande non trouvée ou déjà archivée' });
    }
    res.json({ success: true, message: 'Demande archivée' });
  } catch (err) {
    console.error('Erreur archive fournisseurs:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.patch('/:id/unarchive', authMiddleware, requirePermission('fournisseurs'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE fournisseurs_agrements SET archived_at = NULL, archived_by = NULL
       WHERE id = $1 AND archived_at IS NOT NULL RETURNING id`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Demande non trouvée ou déjà active' });
    }
    res.json({ success: true, message: 'Demande restaurée' });
  } catch (err) {
    console.error('Erreur unarchive fournisseurs:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
