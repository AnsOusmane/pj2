require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const { pool } = require('./db');

// Routes
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

// Render (comme la plupart des PaaS) place l'app derrière un reverse proxy.
// Sans ceci, express-rate-limit voit l'IP du proxy pour tout le monde
// (rate-limit inefficace) et lève un avertissement de validation X-Forwarded-For.
app.set('trust proxy', 1);

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
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  xFrameOptions: { action: "deny" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => {
    const allowed = ['http://localhost:4200', 'https://sencsu.sn', 'https://www.sencsu.sn', 'https://pj2-gr26.vercel.app'];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin non autorisée'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Rate Limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: "Trop de requêtes." }
}));

app.use('/api/auth/', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 12,
  message: { error: "Trop de tentatives." }
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* =========================
   STATIC FILES
============================ */
// Les fichiers statiques sont servis cross-origin (front Vercel ↔ backend Render) :
// on autorise explicitement leur chargement, sinon le CORP same-origin de helmet
// fait bloquer les images par le navigateur.
const staticOptions = {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
};
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));
app.use('/storage/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));

/* ==========================
   ROUTES
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

app.get('/api/test', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: 'Backend OK' });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

app.use((req, res) => res.status(404).json({ message: 'Route non trouvée' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur sécurisé sur port ${PORT}`);
});