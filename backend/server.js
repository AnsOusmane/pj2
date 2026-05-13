require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { pool } = require('./db');

const communiquesRouter = require('./routes/communiques.routes');
const newslettersRouter = require('./routes/newsletters.routes');
const decretsRouter = require('./routes/decrets.routes');
const imagesBankRouter = require('./routes/images-bank.routes');
const officialReportsRouter = require('./routes/official-reports.routes');
const guidesRouter = require('./routes/guides.routes');
const auditManualsRouter = require('./routes/audit-manuals.routes');
const offresEmploiRouter = require('./routes/offres-emploi.routes');
const authRouter = require('./routes/auth.routes');
const usersRouter = require('./routes/users.routes');
const testimonialsRouter = require('./routes/testimonials.routes');
const actualitesRouter = require('./routes/actualites.routes');
const videosRouter = require('./routes/videos.routes');

const app = express();

/* ==========================
   CORS
========================== */
app.use(
  cors({
    origin: [
      'http://localhost:4200',
      'https://sencsu.sn',
      'https://pj2-gr26.vercel.app',
      'https://sencsu-backend.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

/* ==========================
   BODY PARSER
========================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==========================
   STATIC FILES
========================== */
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

app.use(
  '/storage/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

/* ==========================
   ROUTES API
========================== */
app.use('/api/communiques', communiquesRouter);
app.use('/api/newsletters', newslettersRouter);
app.use('/api/decrets', decretsRouter);
app.use('/api/images-bank', imagesBankRouter);
app.use('/api/official-reports', officialReportsRouter);
app.use('/api/guides', guidesRouter);
app.use('/api/audit-manuals', auditManualsRouter);
app.use('/api/offres-emploi', offresEmploiRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/actualites', actualitesRouter);
app.use('/api/videos', videosRouter);

/* ==========================
   TEST BACKEND
========================== */
app.get('/api/test', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      success: true,
      message: 'Backend fonctionne correctement',
      database: true
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Erreur connexion base de données',
      database: false
    });
  }
});

/* ==========================
   DEBUG USERS
========================== */
app.get('/api/debug-users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, fullname, email, role, is_active
      FROM users
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

/* ==========================
   404
========================== */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

/* ==========================
   START SERVER
========================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`Serveur lancé sur port ${PORT}`);
  console.log(`Uploads : ${path.join(__dirname, 'uploads')}`);
  console.log('=================================');
});