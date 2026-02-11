const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log('🟢 Connecté à Neon PostgreSQL'))
  .catch(err => console.error('🔴 Erreur connexion Neon:', err));

module.exports = pool; 
