const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { pool } = require('../db');
const rateLimit = require('express-rate-limit');
const { makeUpload, pdfOnly } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const celluleOrAdmin = require('../middleware/cellule.middleware');
const verifyTurnstile = require('../middleware/turnstile.middleware');
const { sendMail, AGENCY_EMAIL } = require('../config/mailer');

const upload = makeUpload('fournisseurs', { fileFilter: pdfOnly });

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

// Envoie (sans bloquer le dépôt) la confirmation au fournisseur + la notification interne.
// Tout est encapsulé : un échec SMTP est journalisé mais n'impacte jamais la réponse HTTP.
async function notifierDepot(dossier, data) {
  const dateFr = new Date(dossier.created_at).toLocaleString('fr-FR', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Dakar'
  });

  // 1) Accusé de réception au fournisseur (uniquement s'il a renseigné un email).
  if (data.email) {
    await sendMail({
      to: data.email,
      subject: `Confirmation de votre demande d'agrément — ${dossier.numero}`,
      html: `
        <h2>Votre demande d'agrément a bien été reçue</h2>
        <p>Bonjour${data.contact_nom ? ' ' + escapeHtml(data.contact_nom) : ''},</p>
        <p>Nous accusons réception de votre demande d'agrément déposée auprès de l'Agence
           de la Couverture Sanitaire Universelle (SEN-CSU).</p>
        <p>Votre numéro de dossier est :</p>
        <p style="font-size:20px;font-weight:bold;color:#15803d;letter-spacing:1px;">${dossier.numero}</p>
        <p>Conservez ce numéro pour tout suivi auprès de l'Agence. Votre dossier sera
           étudié par nos services et vous serez informé(e) de la suite donnée.</p>
        <hr>
        <p style="color:#6b7280;font-size:13px;">Récapitulatif :<br>
           <b>Raison sociale :</b> ${escapeHtml(data.raison_sociale)}<br>
           <b>Déposé le :</b> ${dateFr}</p>
        <p style="color:#6b7280;font-size:12px;">Cet email est automatique, merci de ne pas y répondre.</p>
      `,
    }).catch((e) => console.error('Mail confirmation fournisseur non envoyé:', e.message));
  }

  // 2) Notification interne à l'agence.
  await sendMail({
    to: AGENCY_EMAIL,
    replyTo: data.email || undefined,
    subject: `🆕 Nouvelle demande d'agrément — ${escapeHtml(data.raison_sociale)} (${dossier.numero})`,
    html: `
      <h2>Nouvelle demande d'agrément</h2>
      <p><b>N° dossier :</b> ${dossier.numero}</p>
      <p><b>Raison sociale :</b> ${escapeHtml(data.raison_sociale)}</p>
      <p><b>Domaine :</b> ${escapeHtml(data.domaine) || '-'}</p>
      <p><b>NINEA :</b> ${escapeHtml(data.ninea) || '-'} &nbsp;|&nbsp;
         <b>RCCM :</b> ${escapeHtml(data.rccm) || '-'}</p>
      <p><b>Contact :</b> ${escapeHtml(data.contact_nom) || '-'} &nbsp;|&nbsp;
         <b>Tél :</b> ${escapeHtml(data.telephone) || '-'} &nbsp;|&nbsp;
         <b>Email :</b> ${escapeHtml(data.email) || '-'}</p>
      <p><b>Adresse :</b> ${escapeHtml(data.adresse) || '-'}</p>
      <p><b>Message :</b><br>${escapeHtml(data.message) || '-'}</p>
      <hr>
      <p style="color:#6b7280;font-size:13px;">Déposé le ${dateFr}. À traiter dans l'espace de gestion des agréments.</p>
    `,
  }).catch((e) => console.error('Mail notification interne non envoyé:', e.message));
}

// Échappe le HTML pour éviter toute injection via les champs du formulaire public.
function escapeHtml(v) {
  if (v === undefined || v === null) return '';
  return String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ====================== POST PUBLIC (dépôt sans compte) ======================
// Pièces du cahier des charges (PDF) :
//   - doc_demande      : demande formelle au DG          (OBLIGATOIRE)
//   - doc_ninea        : copie du NINEA                   (OBLIGATOIRE)
//   - doc_presentation : présentation entreprise/plaquette (OBLIGATOIRE)
//   - doc_registre     : registre de commerce             (OBLIGATOIRE)
//   - doc_fiscale      : attestation fiscale              (facultatif, bonus)
router.post('/', depotLimiter, verifyTurnstile, upload.fields([
  { name: 'doc_demande', maxCount: 1 },
  { name: 'doc_ninea', maxCount: 1 },
  { name: 'doc_presentation', maxCount: 1 },
  { name: 'doc_registre', maxCount: 1 },
  { name: 'doc_fiscale', maxCount: 1 }
]), async (req, res) => {
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

    // Notifications email (fournisseur + agence) en arrière-plan : on ne fait pas
    // attendre/échouer le dépôt si le serveur SMTP est lent ou indisponible.
    notifierDepot(inserted, data)
      .catch((e) => console.error('Notifications dépôt non envoyées:', e.message));

    res.status(201).json({
      success: true,
      message: 'Votre demande d\'agrément a bien été enregistrée.',
      numero: inserted.numero,
      created_at: inserted.created_at
    });
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
router.get('/manage', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const { statut } = req.query;
    const conditions = [];
    const values = [];
    if (statut) { values.push(statut); conditions.push(`f.statut = $${values.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

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

// ====================== DELETE ======================
router.delete('/:id', authMiddleware, celluleOrAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM fournisseurs_agrements WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    res.json({ success: true, message: 'Demande supprimée' });
  } catch (err) {
    console.error('Erreur DELETE fournisseurs:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
