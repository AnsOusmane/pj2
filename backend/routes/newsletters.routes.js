const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const { z } = require('zod');

// ====================== UPLOAD CLOUDINARY ======================
const upload = makeUpload('newsletters', {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file' && file.mimetype !== 'application/pdf') {
      return cb(new Error('Le fichier doit être un PDF'), false);
    }
    if (file.fieldname === 'cover' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('La couverture doit être une image'), false);
    }
    cb(null, true);
  }
});

// Validation Zod
const newsletterSchema = z.object({
  title: z.string().min(3, "Le titre est trop court").max(200),
  description: z.string().max(1000).optional()
});

// Protection : seules les routes POST sont protégées (GET public pour le site vitrine)
router.use('/create', authMiddleware); // ou protéger tout le router si tu veux

// GET ALL (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, file_url, cover_url, created_at 
      FROM newsletters 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST (protégé)
router.post(
  '/',
  authMiddleware,
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  async (req, res) => {
    try {
      const data = newsletterSchema.parse(req.body);
      const file = req.files?.file?.[0];
      const cover = req.files?.cover?.[0];

      if (!file) return res.status(400).json({ success: false, message: 'Fichier PDF requis' });

      const result = await pool.query(
        `INSERT INTO newsletters (title, description, file_url, cover_url)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.title, data.description, file.path, cover ? cover.path : null]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: err.errors });
      }
      console.error(err);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
);

module.exports = router;