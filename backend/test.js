const bcrypt = require("bcrypt");
const db = require("./db");

const username = "admin";
const password = "admin123"; // tu peux changer 🚨
const role = "admin";

bcrypt.hash(password, 10, (err, hash) => {
  if (err) return console.error("❌ Erreur hash:", err);

  const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
  db.query(sql, [username, hash, role], (err, result) => {
    if (err) return console.error("❌ Erreur SQL:", err);
    console.log("✅ Admin créé avec succès ! ID:", result.insertId);
    process.exit(); // ferme le script
  });
});
