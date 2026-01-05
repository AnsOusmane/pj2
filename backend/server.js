// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// ----------------------
// CONFIGURATION CORS
// ----------------------
app.use(cors({
  origin: 'https://sencsu.sn', // autorise uniquement ton front
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
// SERVIR ANGULAR DANS /angular
// ----------------------
const angularDistPath = path.join(__dirname, 'public');
app.use('/', express.static(angularDistPath));

// Redirige toutes les requêtes non-API vers Angular (pour SPA routing)
app.get('/*', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

// ----------------------
// LANCEMENT DU SERVEUR
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
