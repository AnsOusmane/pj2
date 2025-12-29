const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = "votre_secret_jwt_super_secure"; // change ça après

// 🔐 Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Champ manquant" });

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    if (results.length === 0)
      return res.status(401).json({ message: "Utilisateur introuvable" });

    const user = results[0];
    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass)
      return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  });
});

module.exports = router;
