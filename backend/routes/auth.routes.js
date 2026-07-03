const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

/* ======================================================================
   JETONS : access token court (mémoire côté front) + refresh token long
   (cookie httpOnly). Même secret pour les deux, distingués par le claim
   `type` : un refresh token ne peut donc pas servir de jeton d'accès.
====================================================================== */
const ACCESS_TOKEN_TTL = '5m';                       // access token (renvoyé dans le body)
const REFRESH_TOKEN_TTL = '7d';                      // refresh token (cookie httpOnly)
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;     // 7 jours en ms
const isProd = process.env.NODE_ENV === 'production';

// Cookie refresh cross-site en prod (front sencsu.sn ↔ backend Render) :
// SameSite=None + Secure obligatoires pour qu'il soit envoyé. En local
// (même site localhost) SameSite=Lax suffit. Portée limitée à /api/auth.
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: REFRESH_MAX_AGE,
};
// Pour effacer le cookie, il faut rejouer les mêmes attributs (hors maxAge).
const clearCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/api/auth',
};

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL, issuer: 'sencsu.sn' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL, issuer: 'sencsu.sn' }
  );
}

// Profil renvoyé au front (jamais le mot de passe).
function buildUserPayload(user) {
  return {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
    // Un admin a accès à tout ; les autres sont limités à leurs permissions.
    permissions: user.role === 'admin' ? [] : (user.permissions || []),
  };
}

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
      'SELECT id, fullname, email, password, role, is_active, permissions FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    // Message volontairement flou : ne pas révéler si l'email existe.
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    // 3. Vérification du mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    // 4. Refresh token en cookie httpOnly + access token court dans le body.
    res.cookie('refresh_token', signRefreshToken(user), refreshCookieOptions);
    res.json({
      success: true,
      token: signAccessToken(user),
      user: buildUserPayload(user),
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Données invalides', errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ====================== REFRESH ======================
// Échange le refresh token (cookie httpOnly) contre un nouvel access token.
// Rotation : un nouveau refresh token est aussi émis à chaque appel.
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Session expirée. Veuillez vous reconnecter.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.clearCookie('refresh_token', clearCookieOptions);
    return res.status(401).json({ success: false, message: 'Session expirée. Veuillez vous reconnecter.' });
  }

  // Sécurité : seul un jeton de type "refresh" est accepté ici.
  if (decoded.type !== 'refresh') {
    return res.status(401).json({ success: false, message: 'Jeton invalide.' });
  }

  try {
    // On revérifie l'état du compte à chaque rafraîchissement (désactivation
    // immédiate possible, rôle/permissions à jour).
    const { rows } = await pool.query(
      'SELECT id, fullname, email, role, is_active, permissions FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = rows[0];

    if (!user || !user.is_active) {
      res.clearCookie('refresh_token', clearCookieOptions);
      return res.status(401).json({ success: false, message: 'Compte introuvable ou désactivé.' });
    }

    res.cookie('refresh_token', signRefreshToken(user), refreshCookieOptions);
    res.json({
      success: true,
      token: signAccessToken(user),
      user: buildUserPayload(user),
    });
  } catch (err) {
    console.error('Refresh DB Error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ====================== LOGOUT ======================
// Efface le cookie refresh. L'access token, lui, expire tout seul (5 min).
router.post('/logout', (req, res) => {
  res.clearCookie('refresh_token', clearCookieOptions);
  res.json({ success: true, message: 'Déconnexion réussie.' });
});

module.exports = router;
