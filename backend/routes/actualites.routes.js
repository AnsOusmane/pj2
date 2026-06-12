const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const { z } = require('zod');

// ====================== UPLOAD CLOUDINARY ======================
const upload = makeUpload('actualites', {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format image invalide (jpg, png, webp uniquement)'), false);
    }
  }
});

// ====================== VALIDATION ======================
const actualiteSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  link: z.string().url("Lien invalide").optional().or(z.literal(''))
});

// ====================== ROUTES ======================

// GET ALL → Public (visible sur le site vitrine)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM actualites
      ORDER BY published_at DESC NULLS LAST, id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur GET actualites:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST → Protégé (admin uniquement)
router.post('/', authMiddleware, upload.single('thumbnail'), async (req, res) => {
  try {
    const data = actualiteSchema.parse(req.body);

    const image_url = req.file ? req.file.path : null;

    const result = await pool.query(`
      INSERT INTO actualites (title, content, image_url, link, published_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [data.title, data.content, image_url, data.link]);

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