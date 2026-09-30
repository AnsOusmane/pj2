const express = require('express');
const router = express.Router();

const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const requirePermission = require('../middleware/permission.middleware');
const { z } = require('zod');

// Ancré sur le début de l'URL : n'accepte que youtube.com/youtu.be comme hôte
// réel, pas une URL arbitraire contenant simplement ces mots ailleurs
// (ex. "https://evil.com/?x=youtube.com"), ce qui serait injecté dans une
// iframe via bypassSecurityTrustResourceUrl côté front.
const YOUTUBE_URL_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)[\w-]{6,}|youtu\.be\/[\w-]{6,})(\?.*)?$/;
const embedUrlSchema = z.string().trim().regex(YOUTUBE_URL_REGEX, 'Lien YouTube invalide').optional().or(z.literal(''));


// ===============================
// UPLOAD CLOUDINARY
// ===============================
const upload = makeUpload('videos', {
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 Mo max
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Fichier image invalide'), false);
      }
    }

    if (file.fieldname === 'video') {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Fichier vidéo invalide'), false);
      }
    }

    cb(null, true);
  }
});


// ===============================
// CREATE VIDEO
// ===============================
router.post(
  '/',
  authMiddleware,
  requirePermission('videos'),
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, description, embed_url, duration } = req.body;

      const thumbnail = req.files['thumbnail']
        ? req.files['thumbnail'][0].path
        : null;

      const video = req.files['video']
        ? req.files['video'][0].path
        : null;

      // ✅ Validation logique
      if (!embed_url && !video) {
        return res.status(400).json({
          message: 'Veuillez fournir un lien YouTube ou une vidéo.'
        });
      }

      if (embed_url) {
        const parsed = embedUrlSchema.safeParse(embed_url);
        if (!parsed.success) {
          return res.status(400).json({
            message: 'Le lien fourni n\'est pas une URL YouTube valide.'
          });
        }
      }

      const result = await pool.query(`
        INSERT INTO videos
        (title, description, embed_url, duration, thumbnail, video)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        title,
        description,
        embed_url || null,
        duration || null,
        thumbnail,
        video
      ]);

      res.status(201).json(result.rows[0]);

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erreur lors de la création de la vidéo'
      });
    }
  }
);

module.exports = router;
