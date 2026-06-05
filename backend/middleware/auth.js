const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Récupération du token : Priorité au cookie httpOnly (recommandé)
  let token = req.cookies?.auth_token;

  // 2. Fallback sur Bearer Token (pour compatibilité avec d'anciens appels)
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Accès refusé. Veuillez vous connecter.' 
    });
  }

  try {
    // Utilisation de la variable d'environnement (beaucoup plus sécurisé)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    return res.status(403).json({ 
      success: false,
      message: 'Session expirée ou invalide. Veuillez vous reconnecter.' 
    });
  }
};

module.exports = authMiddleware;