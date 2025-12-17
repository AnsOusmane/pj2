// db.js
const mysql = require('mysql2'); // 👈 OBLIGATOIRE

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'entreprise_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL connecté');
});

module.exports = db;
