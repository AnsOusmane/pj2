// ====================================================================
// Carrière — Candidatures spontanées (dépôt public)
// --------------------------------------------------------------------
// Gestion (GET /manage, PUT, archivage) déplacée vers
// backend-admin/routes/candidatures.routes.js — voir le plan de
// séparation admin.
//
// Stocke en base les candidatures reçues via le formulaire Carrière, EN
// PLUS de la notification e-mail (Web3Forms) gérée côté front.
//
// Le CV est uploadé sur Cloudinary par le front (preset non signé, accepte
// PDF/DOC/DOCX) ; ce backend reçoit donc des données JSON et conserve l'URL
// du CV.
// ====================================================================
const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { pool } = require('../db');
const rateLimit = require('express-rate-limit');

// Dépôt public anonyme : on limite par IP pour prévenir l'abus
// (en plus du limiteur global /api/).
const depotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 15,
  message: { message: 'Trop de candidatures depuis cette adresse. Réessayez plus tard.' }
});

// ====================== VALIDATION ======================
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

module.exports = router;
