require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import du pool (de db.js ou directement ici si tu préfères)
const { pool } = require('./db'); // ajuste le chemin si db.js est ailleurs

// Import des routes
const communiquesRouter = require('./routes/communiques.routes');
// Ajoute d'autres routes si tu en as : const newsRouter = require('./routes/news.routes');

const app = express();

// Middleware CORS (essentiel pour Angular)
app.use(cors({
  origin: ['http://localhost:4200', 'https://pj2-gr26.vercel.app', 'https://sencsu.sn'],
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Parser JSON et urlencoded (utile même si tu fais du multipart)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés publiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Monte les routes API
app.use('/api/communiques', communiquesRouter);
// app.use('/api/news', newsRouter); // décommente si besoin

// Route de test pour vérifier que le serveur répond
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend fonctionne !', dbConnected: true });
});

// Lancement du serveur – C'EST ÇA QUI MANQUAIT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});