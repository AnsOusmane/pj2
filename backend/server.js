require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Imports
const { pool } = require('./db');
const communiquesRouter = require('./routes/communiques.routes');
const decretsRouter = require('./routes/decrets.routes');

const app = express();

// CORS global (pour tout le serveur)
app.use(cors({
  origin: ['http://localhost:4200', 'https://sencsu.sn', 'https://pj2-gr26.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les uploads avec CORS spécifique (une seule fois !)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // ou restreins à tes domaines en prod
  res.header('Access-Control-Allow-Methods', 'GET, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/communiques', communiquesRouter);
app.use('/api/decrets', decretsRouter);

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend fonctionne !', dbConnected: true });
});

// 404 handler – TOUJOURS EN TOUT DERNIER
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
console.log('Chemin uploads :', path.join(__dirname, 'uploads'));
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});