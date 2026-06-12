const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth'); 

// ====================== SCHÉMAS DE VALIDATION ======================
const createUserSchema = z.object({
  fullname: z.string().min(2, "Le nom complet doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").trim().toLowerCase(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(['user', 'admin']).optional().default('user'),
  is_active: z.boolean().optional().default(true)
});

const updateUserSchema = z.object({
  fullname: z.string().min(2).optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  role: z.enum(['user', 'admin']).optional(),
  is_active: z.boolean().optional()
});

// ====================== MIDDLEWARE DE PROTECTION ======================
router.use(authMiddleware); // Toutes les routes users sont protégées

// Vérification supplémentaire : seul un admin peut gérer les users
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Droits administrateur requis.'
    });
  }
  next();
};

// ====================== GET ALL USERS ======================
router.get('/', adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, fullname, email, role, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ====================== CREATE USER ======================
router.post('/', adminOnly, async (req, res) => {
  try {
    const data = createUserSchema.parse(req.body);

    // Vérifier si l'email existe déjà
    const check = await pool.query(`SELECT id FROM users WHERE email = $1`, [data.email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12); // 12 rounds recommandé

    const result = await pool.query(
      `INSERT INTO users (fullname, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, fullname, email, role, is_active, created_at`,
      [data.fullname, data.email, hashedPassword, data.role, data.is_active]
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ====================== UPDATE USER ======================
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    const result = await pool.query(
      `UPDATE users
       SET fullname = COALESCE($1, fullname),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, fullname, email, role, is_active, updated_at`,
      [data.fullname, data.email, data.role, data.is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      message: 'Utilisateur mis à jour',
      user: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ====================== DELETE USER ======================
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher la suppression du dernier admin actif
    const adminCount = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true`
    );

    if (parseInt(adminCount.rows[0].count) <= 1) {
      const userToDelete = await pool.query(`SELECT role FROM users WHERE id = $1`, [id]);
      if (userToDelete.rows[0]?.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer le dernier administrateur actif'
        });
      }
    }

    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;