// Autorise l'accès si l'utilisateur est administrateur, OU s'il possède la
// permission demandée (colonne users.permissions, assignée dès la création du
// compte). Remplace l'ancien contrôle par rôle 'cellule-pm' (supprimé).
// À chaîner APRÈS authMiddleware, qui renseigne req.user (role + permissions).
module.exports = function requirePermission(key) {
  return (req, res, next) => {
    const role = req.user?.role;
    const permissions = req.user?.permissions || [];

    if (role === 'admin' || permissions.includes(key)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Accès refusé. Vous n'avez pas la permission requise pour cette section."
    });
  };
};
