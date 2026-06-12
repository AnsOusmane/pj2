const { Pool } = require('pg');
require('dotenv').config();

// Vérification variable d'environnement
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL manquant dans le fichier .env');
  process.exit(1);
}

// Pool PostgreSQL / Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // SSL strict : le certificat de Neon est signé par une AC publique de confiance,
  // on valide donc la chaîne (protection contre le MITM).
  ssl: {
    rejectUnauthorized: true
  },

  // Optimisations
  max: 20, // nombre max de connexions simultanées
  idleTimeoutMillis: 30000, // ferme connexions inactives après 30 sec
  connectionTimeoutMillis: 10000 // timeout connexion 10 sec
});

// Test connexion au démarrage
pool.connect()
  .then(client => {
    console.log('✅ Connecté à Neon PostgreSQL');
    client.release();
  })
  .catch(err => {
    console.error('❌ Erreur connexion base de données :', err.message);
  });

// Gestion erreurs runtime du pool
pool.on('error', (err) => {
  console.error('❌ Erreur inattendue PostgreSQL :', err.message);
});

// Fonction helper requêtes SQL
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
