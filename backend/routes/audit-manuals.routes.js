const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');
const { z } = require('zod');

// ====================== UPLOAD CLOUDINARY ======================
const upload = makeUpload('audit-manuals', {
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// ====================== VALIDATION ======================
const auditManualSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().max(1000).optional()
});

// ====================== ROUTES ======================

// GET ALL → Public (site vitrine)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM audit_manuals ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET audit-manuals:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST → Protégé
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const data = auditManualSchema.parse(req.body);

      const file = req.files?.file?.[0];
      const cover = req.files?.cover?.[0];

      if (!file) {
        return res.status(400).json({ 
          success: false, 
          message: 'Fichier PDF requis' 
        });
      }

      const fileUrl = file.path;
      const coverUrl = cover ? cover.path : null;

      const result = await pool.query(
        `INSERT INTO audit_manuals (title, description, file_url, cover_url)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.title, data.description, fileUrl, coverUrl]
      );

      res.status(201).json({ 
        success: true, 
        message: 'Document ajouté avec succès',
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

      console.error('Erreur POST audit-manual:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur' 
      });
    }
  }
);

module.exports = router;