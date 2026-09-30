require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const { pool } = require('./db');

// Routes — 100% admin (auth/users/security-events), ou moitié admin des
// routeurs mixtes du backend public (voir plan de séparation admin).
const authRouter = require('./routes/auth.routes');
const usersRouter = require('./routes/users.routes');
const securityEventsRouter = require('./routes/security-events.routes');
const communiquesRouter = require('./routes/communiques.routes');
const newslettersRouter = require('./routes/newsletters.routes');
const decretsRouter = require('./routes/decrets.routes');
const imagesBankRouter = require('./routes/images-bank.routes');
const officialReportsRouter = require('./routes/official-reports.routes');
const guidesRouter = require('./routes/guides.routes');
const auditManualsRouter = require('./routes/audit-manuals.routes');
const offresEmploiRouter = require('./routes/offres-emploi.routes');
const testimonialsRouter = require('./routes/testimonials.routes');
const actualitesRouter = require('./routes/actualites.routes');
const videosRouter = require('./routes/videos.routes');
const ppmRouter = require('./routes/ppm.routes');
const appelsOffreRouter = require('./routes/appels-offre.routes');
const avisAttributionRouter = require('./routes/avis-attribution.routes');
const fournisseursRouter = require('./routes/fournisseurs.routes');
const candidaturesRouter = require('./routes/candidatures.routes');
const chatRouter = require('./routes/chat.routes');

const { logSecurityEvent } = require('./utils/security-log');

// Job planifié — tourne UNIQUEMENT ici (voir jobs/ao-status.job.js) : le
// backend public n'appelle plus lazySweep() pour éviter une double exécution
// concurrente entre les deux services sur la même base.
const { scheduleAoStatusSweep } = require('./jobs/ao-status.job');

const app = express();

// Render (comme la plupart des PaaS) place l'app derrière un reverse proxy.
app.set('trust proxy', 1);

/* ==========================
   SECURITY MIDDLEWARES
========================== */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
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
    // Seul admin-app (front admin séparé) appelle cette API — jamais le site
    // public. Port dev dédié (4200 déjà pris par le site public) + URL(s) Vercel.
    const allowed = [
      'http://localhost:4201',
      'https://pj2-5u7x.vercel.app',
    ];
    const allowLan = process.env.CORS_ALLOW_LAN === '1';
    const privateLan = /^http:\/\/(localhost|127\.0\.0\.1|(?:10|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.[\d.]+):\d+$/;
    if (!origin || allowed.includes(origin) || (allowLan && privateLan.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Origin non autorisée'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Rate Limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: "Trop de requêtes." },
  handler: (req, res, next, options) => {
    logSecurityEvent('rate_limited', req, req.originalUrl);
    res.status(options.statusCode).json(options.message);
  }
}));

app.use('/api/auth/', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 12,
  message: { error: "Trop de tentatives." },
  handler: (req, res, next, options) => {
    logSecurityEvent('rate_limited', req, req.originalUrl);
    res.status(options.statusCode).json(options.message);
  }
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ==========================
   ROUTES
========================== */
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/security-events', securityEventsRouter);
app.use('/api/communiques', communiquesRouter);
app.use('/api/newsletters', newslettersRouter);
app.use('/api/decrets', decretsRouter);
app.use('/api/images-bank', imagesBankRouter);
app.use('/api/official-reports', officialReportsRouter);
app.use('/api/guides', guidesRouter);
app.use('/api/audit-manuals', auditManualsRouter);
app.use('/api/offres-emploi', offresEmploiRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/actualites', actualitesRouter);
app.use('/api/videos', videosRouter);
app.use('/api/ppm', ppmRouter);
app.use('/api/appels-offre', appelsOffreRouter);
app.use('/api/avis-attribution', avisAttributionRouter);
app.use('/api/fournisseurs', fournisseursRouter);
app.use('/api/candidatures', candidaturesRouter);
app.use('/api/chat', chatRouter);

app.get('/api/test', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: 'Backend admin OK' });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

app.use((req, res) => res.status(404).json({ message: 'Route non trouvée' }));

// Filet de sécurité : capte toute erreur qui échappe aux try/catch des routes
// (ex. origine CORS refusée, corps JSON malformé, erreur synchrone dans un
// middleware) pour ne jamais laisser Express renvoyer sa page d'erreur HTML
// par défaut (qui peut exposer la stack trace) à la place d'une réponse JSON.
app.use((err, req, res, next) => {
  if (err.message === 'Origin non autorisée') {
    logSecurityEvent('cors_blocked', req, req.headers.origin || null);
    return res.status(403).json({ message: 'Origine non autorisée' });
  }
  console.error('Erreur non interceptée:', err);
  res.status(err.status || 500).json({ message: 'Erreur serveur' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend admin sécurisé sur port ${PORT}`);
  // Pilotage automatique du statut des appels d'offres par les dates.
  // Tourne UNIQUEMENT dans ce service (voir commentaire plus haut).
  scheduleAoStatusSweep();
});
