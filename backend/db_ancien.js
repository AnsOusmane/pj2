// db.js
const mysql = require('mysql2'); 

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sencsudb'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL connecté');
});

module.exports = db;

// // db.js
// const mysql = require('mysql2'); 

// const db = mysql.createConnection({
//   host: 'ftp.sencsu.sn',
//   user: 'sencsudb_sencsusn68332658',
//   password: 'SenCSU2542!',
//   database: 'sencsudb_sencsusn68332658'
// });

// db.connect(err => {
//   if (err) throw err;
//   console.log('✅ MySQL connecté');
// });

// module.exports = db;

