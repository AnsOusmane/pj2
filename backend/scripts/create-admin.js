// ====================================================================
// Bootstrap du premier compte admin sur une base neuve.
// --------------------------------------------------------------------
// Aucune route API ne peut créer un admin sans être déjà authentifié en
// admin (routes/users.routes.js) : sur une base vide, il n'existe donc
// aucun moyen de se connecter. Ce script contourne ce problème une
// seule fois, en insérant directement le compte (hash bcrypt, comme le
// ferait l'API).
//
// Usage :
//   node backend/scripts/create-admin.js <email> <mot-de-passe> ["Nom complet"]
//
// Exemple :
//   node backend/scripts/create-admin.js admin@sencsu.sn UnMotDePasseSolide123 "Admin SEN-CSU"
// ====================================================================
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

async function main() {
  const [, , email, password, fullname] = process.argv;

  if (!email || !password) {
    console.error('Usage : node backend/scripts/create-admin.js <email> <mot-de-passe> ["Nom complet"]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Le mot de passe doit contenir au moins 8 caractères.');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (fullname, email, password, role, is_active, permissions)
       VALUES ($1, $2, $3, 'admin', true, '[]'::jsonb)
       ON CONFLICT (email) DO UPDATE
         SET password = EXCLUDED.password, role = 'admin', is_active = true
       RETURNING id, fullname, email, role, created_at`,
      [fullname || 'Administrateur', email.trim().toLowerCase(), hashed]
    );
    console.log('Compte admin prêt :', result.rows[0]);
  } catch (err) {
    console.error('Échec de la création du compte admin :', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
