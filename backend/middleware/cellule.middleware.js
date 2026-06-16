// Autorise l'écriture du PPM aux membres de la cellule de passation des marchés
// (rôle 'cellule-pm') ainsi qu'aux administrateurs.
// À chaîner APRÈS authMiddleware, qui renseigne req.user à partir du JWT.
const celluleOrAdmin = (req, res, next) => {
  const role = req.user?.role;

  if (role !== 'cellule-pm' && role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Réservé à la cellule de passation des marchés.'
    });
  }

  next();
};

module.exports = celluleOrAdmin;
