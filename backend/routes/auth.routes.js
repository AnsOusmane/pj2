const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

// ====================== VALIDATION SCHEMA ======================
const loginSchema = z.object({
  email: z.string().email('Email invalide').trim().toLowerCase(),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

// ====================== LOGIN ======================
router.post('/login', async (req, res) => {
  try {
    // 1. Validation des données
    const { email, password } = loginSchema.parse(req.body);

    // 2. Recherche de l'utilisateur
    const result = await pool.query(
      'SELECT id, fullname, email, password, role, is_active FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants incorrects' 
      });
    }

    // 3. Vérification du mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants incorrects' 
      });
    }

    // 4. Création du token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,           // ← Plus de fallback faible
      { 
        expiresIn: '8h',
        issuer: 'sencsu.sn'             // Optionnel mais bien
      }
    );

    // Option recommandée : Token en cookie httpOnly (plus sécurisé)
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',   // true en prod
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000   // 8 heures
    });

    // Réponse sans exposer le token dans le body (recommandé)
    res.json({
      success: true,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
      },
      // token: token   ← À supprimer si tu utilises le cookie
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données invalides', 
        errors: err.errors 
      });
    }

    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

module.exports = router;