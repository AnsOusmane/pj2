// ====================================================================
// Journal de sécurité — consultation (réservée aux administrateurs)
// --------------------------------------------------------------------
// Alimenté en best-effort par backend/utils/security-log.js, appelé
// depuis auth.middleware (jeton invalide, compte désactivé),
// auth.routes (connexion refusée), turnstile.middleware (anti-robot
// refusé) et server.js (origine CORS bloquée, rate-limit dépassé).
// ====================================================================
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth.middleware');
const { SUSPICION_THRESHOLD, SUSPICION_WINDOW_MINUTES } = require('../utils/security-log');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs.' });
  }
  next();
}

const EVENT_LABELS = {
  login_failed: 'Connexion refusée',
  auth_invalid_token: 'Jeton invalide',
  auth_inactive_account: 'Compte désactivé',
  turnstile_rejected: 'Anti-robot refusé',
  rate_limited: 'Trop de requêtes',
  cors_blocked: 'Origine bloquée',
};

// GET /api/security-events → Admin. Synthèse + liste récente sur une période.
//   ?days=7 (défaut 7, borné 1..365)   ?type=login_failed (filtre optionnel)
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 365);
  const since = `NOW() - INTERVAL '${days} days'`;
  const type = typeof req.query.type === 'string' && req.query.type.trim() ? req.query.type.trim() : null;

  try {
    const [byType, recentResult, suspiciousResult] = await Promise.all([
      pool.query(
        `SELECT event_type, COUNT(*)::int AS n
           FROM security_events WHERE created_at >= ${since}
          GROUP BY event_type ORDER BY n DESC`
      ),
      pool.query(
        type
          ? `SELECT id, event_type, method, route, ip, detail, created_at
               FROM security_events
              WHERE created_at >= ${since} AND event_type = $1
              ORDER BY created_at DESC LIMIT 200`
          : `SELECT id, event_type, method, route, ip, detail, created_at
               FROM security_events
              WHERE created_at >= ${since}
              ORDER BY created_at DESC LIMIT 200`,
        type ? [type] : []
      ),
      // Suspicion « en ce moment » : indépendante de la période sélectionnée
      // ci-dessus (mêmes seuil et fenêtre que l'alerte e-mail, voir security-log.js).
      pool.query(
        `SELECT ip, COUNT(*)::int AS n, MAX(created_at) AS last_seen
           FROM security_events
          WHERE created_at >= NOW() - INTERVAL '${SUSPICION_WINDOW_MINUTES} minutes'
            AND ip IS NOT NULL
          GROUP BY ip
         HAVING COUNT(*) >= ${SUSPICION_THRESHOLD}
          ORDER BY n DESC`
      ),
    ]);

    const total = byType.rows.reduce((s, r) => s + r.n, 0);

    res.json({
      days,
      total,
      byType: byType.rows.map(r => ({
        type: r.event_type,
        label: EVENT_LABELS[r.event_type] || r.event_type,
        n: r.n,
      })),
      recent: recentResult.rows,
      suspiciousIps: suspiciousResult.rows,
      suspicionWindowMinutes: SUSPICION_WINDOW_MINUTES,
    });
  } catch (err) {
    console.error('Lecture security_events échouée:', err.message || err);
    res.status(500).json({ success: false, message: 'Erreur lors de la lecture du journal.' });
  }
});

module.exports = router;
