require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ----------------------
// CONFIGURATION CORS
// ----------------------
app.use(cors({
  origin: [
    'https://sencsu.sn',
    'https://sencsu.sn',
    'http://localhost:4200' // dev Angular
  ],
  credentials: true
}));

// ----------------------
// BODY PARSER
// ----------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------
// ROUTES STATIQUES (uploads)
// ----------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------------
// ROUTES API
// ----------------------
app.use('/api/rapports_officiels', require('./routes/rapportsofficiels.routes'));
app.use('/api/decrets_officiels', require('./routes/decrets.routes'));
app.use('/api/communiques_officiels', require('./routes/communiques.routes'));
app.use('/api/banque_images', require('./routes/banquedimage.routes'));
app.use('/api/auth', require('./routes/auth.routes'));

// ----------------------
// HEALTH CHECK (Render aime ça)
// ----------------------
app.get('/', (req, res) => {
  res.send('API OK 🚀');
});

// ----------------------
// ❌ ON SUPPRIME LE SERVE D’ANGULAR ICI
// Angular est maintenant hébergé AILLEURS
// ----------------------

// const angularDistPath = path.join(__dirname, 'public/angular');
// app.use('/angular', express.static(angularDistPath));
// app.get('/angular/*', (req, res) => {
//   res.sendFile(path.join(angularDistPath, 'index.html'));
// });

// ----------------------
// LANCEMENT DU SERVEUR
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API en ligne sur le port ${PORT}`);
});
