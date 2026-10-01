const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const requirePermission = require('../middleware/permission.middleware');
const { z } = require('zod');

// ====================== UPLOAD CLOUDINARY ======================
// 50 Mo : plafond partagé entre images (quelques Mo en pratique) et vidéos
// (fichiers bien plus lourds) — même limite que videos.routes.js.
const upload = makeUpload('actualites', {
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if ((file.fieldname === 'thumbnail' || file.fieldname === 'images') && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Format image invalide (jpg, png, webp uniquement)'), false);
    }
    if (file.fieldname === 'videos' && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Fichier vidéo invalide'), false);
    }
    cb(null, true);
  }
});

// Ancré sur le début de l'URL : n'accepte que youtube.com/youtu.be comme hôte
// réel (même garde-fou que backend-admin/routes/videos.routes.js), pas une URL
// arbitraire contenant simplement ces mots ailleurs, qui serait injectée dans
// une iframe via bypassSecurityTrustResourceUrl côté front.
const YOUTUBE_URL_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)[\w-]{6,}|youtu\.be\/[\w-]{6,})(\?.*)?$/;
const youtubeUrlSchema = z.string().trim().regex(YOUTUBE_URL_REGEX, 'Lien YouTube invalide');

// ====================== VALIDATION ======================
const actualiteSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  link: z.string().url("Lien invalide").optional().or(z.literal('')),
  // Lien YouTube unique historique (toujours accepté pour compat), en plus de
  // video_urls (plusieurs liens, galerie façon Facebook).
  video_url: youtubeUrlSchema.optional().or(z.literal('')),
  // Envoyé par le front comme une chaîne JSON (tableau de liens YouTube).
  video_urls: z.string().optional().or(z.literal(''))
});

// POST → Protégé (admin uniquement)
router.post(
  '/',
  authMiddleware,
  requirePermission('actualites'),
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]),
  async (req, res) => {
  try {
    const data = actualiteSchema.parse(req.body);

    // video_urls arrive en JSON (plusieurs liens YouTube saisis dans le formulaire).
    let extraVideoUrls = [];
    if (data.video_urls) {
      let parsed;
      try {
        parsed = JSON.parse(data.video_urls);
      } catch {
        return res.status(400).json({ success: false, message: 'video_urls invalide (JSON attendu)' });
      }
      if (!Array.isArray(parsed)) {
        return res.status(400).json({ success: false, message: 'video_urls doit être un tableau' });
      }
      for (const url of parsed) {
        const check = youtubeUrlSchema.safeParse(url);
        if (!check.success) {
          return res.status(400).json({ success: false, message: `Lien YouTube invalide : ${url}` });
        }
        extraVideoUrls.push(check.data);
      }
    }

    const image_url = req.files?.['thumbnail'] ? req.files['thumbnail'][0].path : null;
    const galleryImages = (req.files?.['images'] || []).map((f) => f.path);
    const galleryVideos = (req.files?.['videos'] || []).map((f) => f.path);

    // Couverture + 1ère vidéo : conservées dans leurs colonnes historiques pour
    // compat (anciens enregistrements, éventuels autres usages de l'API).
    const video_url = data.video_url || extraVideoUrls[0] || null;
    const video = galleryVideos[0] || null;

    // Galerie complète façon Facebook : toutes les images + toutes les vidéos,
    // dans l'ordre d'ajout (uploadées puis liens YouTube).
    const media = [
      ...galleryImages.map((url) => ({ type: 'image', url })),
      ...galleryVideos.map((url) => ({ type: 'video', url, source: 'upload' })),
      ...extraVideoUrls.map((url) => ({ type: 'video', url, source: 'youtube' }))
    ];

    const result = await pool.query(`
      INSERT INTO actualites (title, content, image_url, video_url, video, media, link, published_at)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW())
      RETURNING *
    `, [data.title, data.content, image_url, video_url, video, JSON.stringify(media), data.link]);

    res.status(201).json({
      success: true,
      message: 'Actualité créée avec succès',
      data: result.rows[0]
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: err.errors
      });
    }

    console.error('Erreur POST actualites:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'actualité'
    });
  }
});

module.exports = router;
