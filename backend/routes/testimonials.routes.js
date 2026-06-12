const express = require('express');
const router = express.Router();

const { pool } = require('../db');
const authMiddleware = require('../middleware/auth.middleware');


// ===============================
// GET ALL TESTIMONIALS
// ===============================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM testimonials
      ORDER BY id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});


// ===============================
// CREATE TESTIMONIAL
// ===============================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, location, photo_url, quote } = req.body;

    const result = await pool.query(`
      INSERT INTO testimonials
      (name, location, photo_url, quote)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, location, photo_url, quote]);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur lors de la création'
    });
  }
});

module.exports = router;