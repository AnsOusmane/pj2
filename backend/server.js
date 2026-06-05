require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');   // ← Ajout important

const { pool } = require('./db');

// Import des routes
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
   SECURITY MIDDLEWARES
========================== */

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], 
      styleSrc: ["'self'", "'unsafe-inline'"], 
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://sencsu.sn", "https://pj2-gr26.vercel.app"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { 
    maxAge: 31536000, 
    includeSubDomains: true, 
    preload: true 
  },
  xFrameOptions: { action: "deny" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  permissionsPolicy: {
    features: {
      geolocation: [],
      microphone: [],
      camera: [],
      payment: []
    }
  }
}));

// CORS plus strict
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:4200',
        'https://sencsu.sn',
        'https://www.sencsu.sn',
        'https://pj2-gr26.vercel.app'
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin non autorisée'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
  })
);

// Cookie Parser (important pour httpOnly cookies)
app.use(cookieParser());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, veuillez réessayer plus tard." }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 12,
  message: { error: "Trop de tentatives de connexion." }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Body parsers avec limite
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ==========================
   STATIC FILES (Uploads)
========================== */
app.use(
  '/uploads',
  helmet({ contentSecurityPolicy: false }),
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d'
  })
);

app.use(
  '/storage/uploads',
  helmet({ contentSecurityPolicy: false }),
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
   ROUTES DE TEST
========================== */
app.get('/api/test', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: 'Backend fonctionne correctement' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur base de données' });
  }
});

// ⚠️ SUPPRIMER cette route en production !
// app.get('/api/debug-users', ...);

/* ==========================
   404 Handler
========================== */
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée' 
  });
});

/* ==========================
   START SERVER
========================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('=======================================');
  console.log(`🚀 Serveur sécurisé démarré sur le port ${PORT}`);
  console.log(`📁 Uploads : ${path.join(__dirname, 'uploads')}`);
  console.log(`🌍 Mode : ${process.env.NODE_ENV || 'development'}`);
  console.log('=======================================');
});