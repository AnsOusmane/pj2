const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const requirePermission = require('../middleware/permission.middleware');
const { z } = require('zod');

// ====================== UPLOAD CLOUDINARY ======================
// 50 Mo : plafond partagé par le champ image (quelques Mo en pratique) et le
// champ vidéo (fichier bien plus lourd) — même limite que videos.routes.js.
const upload = makeUpload('actualites', {
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Format image invalide (jpg, png, webp uniquement)'), false);
    }
    if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
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

// ====================== VALIDATION ======================
const actualiteSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  link: z.string().url("Lien invalide").optional().or(z.literal('')),
  video_url: z.string().trim().regex(YOUTUBE_URL_REGEX, 'Lien YouTube invalide').optional().or(z.literal(''))
});

// POST → Protégé (admin uniquement)
router.post(
  '/',
  authMiddleware,
  requirePermission('actualites'),
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  async (req, res) => {
  try {
    const data = actualiteSchema.parse(req.body);

    const image_url = req.files?.['thumbnail'] ? req.files['thumbnail'][0].path : null;
    const video = req.files?.['video'] ? req.files['video'][0].path : null;

    const result = await pool.query(`
      INSERT INTO actualites (title, content, image_url, video_url, video, link, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [data.title, data.content, image_url, data.video_url || null, video, data.link]);

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
