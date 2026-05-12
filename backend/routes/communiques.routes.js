const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');

// =====================
// CONFIG MULTER
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/communiques';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, name + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF, JPG et PNG sont autorisés'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo
});

// =====================
// GET ALL
// =====================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, file_url, file_name, created_at 
      FROM communiques 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET communiques:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// =====================
// POST COMMUNIQUÉ
// =====================
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log("📥 BODY:", req.body);
    console.log("📁 FILE:", req.file);

    const { title, description } = req.body;
    const file = req.file;

    if (!title) {
      return res.status(400).json({ message: 'Le titre est obligatoire' });
    }

    if (!file) {
      return res.status(400).json({ message: 'Le fichier est obligatoire' });
    }

    const fileUrl = `/uploads/communiques/${file.filename}`;

    const result = await pool.query(
      `INSERT INTO communiques 
       (title, description, file_url, file_name, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title,
        description || null,
        fileUrl,
        file.originalname,
        file.mimetype,
        file.size
      ]
    );

    console.log("✅ Communiqué inséré avec succès :", result.rows[0]);

    res.status(201).json({
      message: 'Communiqué ajouté avec succès',
      data: result.rows[0]
    });

  } catch (err) {
    console.error("❌ Erreur POST communique:", err);
    res.status(500).json({ 
      message: 'Erreur lors de l\'ajout du communiqué',
      error: err.message 
    });
  }
});

module.exports = router;