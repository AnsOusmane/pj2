const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { makeUpload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth.middleware');

const upload = makeUpload('offres-emploi');

// GET ALL
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM offres_emploi 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET offres-emploi:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET MANAGE (admin) — toutes les offres, actives ET inactives.
router.get('/manage', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM offres_emploi ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET offres-emploi/manage:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST
router.post('/', authMiddleware, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, company, location, deadline } = req.body;
    const file = req.files?.file?.[0];
    const cover = req.files?.cover?.[0];

    if (!file) return res.status(400).json({ message: 'Fichier PDF requis' });

    const fileUrl = file.path;
    const coverUrl = cover ? cover.path : null;

    const result = await pool.query(
      `INSERT INTO offres_emploi (title, description, company, location, deadline, file_url, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      // deadline vide ('') → null : une colonne date Postgres refuse la chaîne vide.
      [title, description, company, location, deadline || null, fileUrl, coverUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST offre-emploi:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PATCH /:id/active — afficher / masquer une offre (toggle is_active).
router.patch('/:id/active', authMiddleware, async (req, res) => {
  try {
    const is_active = req.body?.is_active === true || req.body?.is_active === 'true';
    const result = await pool.query(
      `UPDATE offres_emploi SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [is_active, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PATCH offre-emploi/active:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /:id — suppression définitive d'une offre.
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM offres_emploi WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }
    res.json({ success: true, message: 'Offre supprimée' });
  } catch (err) {
    console.error('Erreur DELETE offre-emploi:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;