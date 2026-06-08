const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth.middleware');
const { z } = require('zod');

// ====================== MULTER (inchangé) ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max ajouté
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

      const fileUrl = `/uploads/${file.filename}`;
      const coverUrl = cover ? `/uploads/${cover.filename}` : null;

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