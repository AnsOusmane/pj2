const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { logSecurityEvent } = require('../utils/security-log');

const authMiddleware = async (req, res, next) => {
  // L'access token est gardé en mémoire côté front (pas en cookie, pour ne
  // pas l'exposer au XSS) et envoyé via l'en-tête Authorization. Seul le
  // refresh token voyage en cookie httpOnly, et uniquement vers /api/auth
  // (voir routes/auth.routes.js) : il n'atteint jamais ce middleware.
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès refusé. Veuillez vous connecter.'
    });
  }

  let decoded;
  try {
    // Utilisation de la variable d'environnement (beaucoup plus sécurisé)
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('JWT Error:', err.message);
    logSecurityEvent('auth_invalid_token', req, err.message);
    // 401 (et non 403) : l'authentification a échoué → le client doit se
    // reconnecter. Le front s'appuie sur ce code pour rediriger vers /login.
    // (403 est réservé à « authentifié mais droits insuffisants ».)
    return res.status(401).json({
      success: false,
      message: 'Session expirée ou invalide. Veuillez vous reconnecter.'
    });
  }

  // Sécurité : un refresh token (cookie /api/auth) ne doit jamais servir de
  // jeton d'accès sur les routes protégées. Seul l'access token est accepté ici.
  if (decoded.type === 'refresh') {
    return res.status(401).json({
      success: false,
      message: 'Jeton invalide. Veuillez vous reconnecter.'
    });
  }

  try {
    // Le token est valide jusqu'à 8h : on revérifie l'état du compte en base à
    // CHAQUE requête. Sans ça, désactiver un compte ou rétrograder un admin
    // n'aurait d'effet qu'à l'expiration du token (jusqu'à 8h de droits zombie).
    // On prend aussi le rôle/permissions à jour de la base, pas ceux figés dans
    // le token au moment du login.
    const { rows } = await pool.query(
      'SELECT id, email, role, is_active, permissions FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = rows[0];

    if (!user || !user.is_active) {
      logSecurityEvent('auth_inactive_account', req, `user id ${decoded.id}`);
      // 401 : la session ne correspond plus à un compte actif → reconnexion requise.
      return res.status(401).json({
        success: false,
        message: 'Compte introuvable ou désactivé. Veuillez vous reconnecter.'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.role === 'admin' ? [] : (user.permissions || [])
    };
    next();
  } catch (err) {
    console.error('Auth DB Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur de vérification de session.'
    });
  }
};

module.exports = authMiddleware;
