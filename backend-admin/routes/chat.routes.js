// ====================================================================
// Chatbot — statistiques d'utilisation (admin)
// --------------------------------------------------------------------
// Le repli conversationnel (POST /) et le journal d'usage (POST /log)
// sont publics et vivent côté backend public. Cette route ne sert que
// la synthèse admin, alimentée par la même table chat_logs.
// ====================================================================
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs.' });
  }
  next();
}

// GET /api/chat/stats → Admin. Synthèse « bon / moins bon ».
//   ?days=30 (période, défaut 30, borné 1..365)
router.get('/stats', authMiddleware, requireAdmin, async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
  const since = `NOW() - INTERVAL '${days} days'`;

  try {
    const [totals, byLang, topFallback, topMatched, daily, recent] = await Promise.all([
      // Totaux + taux de résolution (faq vs fallback).
      pool.query(
        `SELECT
           COUNT(*)::int                                        AS total,
           COUNT(*) FILTER (WHERE outcome = 'faq')::int         AS faq,
           COUNT(*) FILTER (WHERE outcome = 'fallback')::int    AS fallback,
           COUNT(DISTINCT session_id)::int                      AS sessions
         FROM chat_logs WHERE created_at >= ${since}`,
      ),
      // Répartition par langue effective.
      pool.query(
        `SELECT detected_lang AS lang, COUNT(*)::int AS n
           FROM chat_logs WHERE created_at >= ${since}
          GROUP BY detected_lang ORDER BY n DESC`,
      ),
      // « Moins bon » : questions restées sans réponse (repli), regroupées.
      pool.query(
        `SELECT lower(btrim(message)) AS question, COUNT(*)::int AS n
           FROM chat_logs
          WHERE created_at >= ${since} AND outcome = 'fallback'
            AND message IS NOT NULL AND btrim(message) <> ''
          GROUP BY lower(btrim(message))
          ORDER BY n DESC, question ASC
          LIMIT 25`,
      ),
      // « Bon » : sujets FAQ les plus sollicités.
      pool.query(
        `SELECT matched_id AS topic, COUNT(*)::int AS n
           FROM chat_logs
          WHERE created_at >= ${since} AND outcome = 'faq' AND matched_id IS NOT NULL
          GROUP BY matched_id ORDER BY n DESC`,
      ),
      // Volume quotidien (courbe d'activité).
      pool.query(
        `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE outcome = 'fallback')::int AS fallback
           FROM chat_logs WHERE created_at >= ${since}
          GROUP BY 1 ORDER BY 1 ASC`,
      ),
      // Derniers messages (contexte brut).
      pool.query(
        `SELECT id, message, outcome, matched_id, detected_lang, created_at
           FROM chat_logs WHERE created_at >= ${since}
          ORDER BY created_at DESC LIMIT 50`,
      ),
    ]);

    const t = totals.rows[0] || { total: 0, faq: 0, fallback: 0, sessions: 0 };
    const resolutionRate = t.total ? Math.round((t.faq / t.total) * 100) : 0;

    return res.json({
      days,
      totals: { ...t, resolutionRate },
      byLang: byLang.rows,
      topFallback: topFallback.rows,
      topMatched: topMatched.rows,
      daily: daily.rows,
      recent: recent.rows,
    });
  } catch (err) {
    console.error('Lecture chat_logs (stats) échouée:', err.message || err);
    return res.status(500).json({ success: false, message: 'Erreur lors du calcul des statistiques.' });
  }
});

module.exports = router;
