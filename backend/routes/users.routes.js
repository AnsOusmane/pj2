const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

// ====================== GET ALL USERS ======================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, fullname, email, role, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== CREATE USER ======================
router.post('/', async (req, res) => {
  try {
    const { fullname, email, password, role, is_active } = req.body;

    const check = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (fullname, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, fullname, email, role, is_active`,
      [fullname, email, hashedPassword, role || 'user', is_active ?? true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== UPDATE USER ======================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, role, is_active } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET fullname = $1, email = $2, role = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING id, fullname, email, role, is_active`,
      [fullname, email, role, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================== DELETE USER ======================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher la suppression du dernier admin
    const adminCount = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true`
    );

    if (adminCount.rows[0].count <= 1) {
      const user = await pool.query(`SELECT role FROM users WHERE id = $1`, [id]);
      if (user.rows[0]?.role === 'admin') {
        return res.status(400).json({ message: 'Impossible de supprimer le dernier administrateur actif' });
      }
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;