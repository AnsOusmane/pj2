require('dotenv').config();
require('./db'); // 🔥 initialise MySQL

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ----------------------
// CORS
// ----------------------
app.use(cors({
  origin: [
    'https://sencsu.sn',
    'http://localhost:4200'
  ],
  credentials: true
}));

// ----------------------
// BODY PARSER
// ----------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------
// STATIC FILES
// ----------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------------
// ROUTES
// ----------------------
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/rapports_officiels', require('./routes/rapportsofficiels.routes'));
app.use('/api/decrets_officiels', require('./routes/decrets.routes'));
app.use('/api/communiques_officiels', require('./routes/communiques.routes'));
app.use('/api/banque_images', require('./routes/banquedimage.routes'));
app.use('/api/auth', require('./routes/auth.routes'));

// ----------------------
// HEALTH CHECK
// ----------------------
app.get('/', (req, res) => {
  res.send('API OK 🚀');
});

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API en ligne sur le port ${PORT}`);
});
