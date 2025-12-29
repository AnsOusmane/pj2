const jwt = require('jsonwebtoken');
const JWT_SECRET = "VOTRE_CLE_SECRETE_A_CHANGER";

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if(!token){
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token invalide' });
  }
};
