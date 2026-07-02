// ====================================================================
// Chatbot — repli conversationnel via l'API Claude (Anthropic)
// --------------------------------------------------------------------
// Le front (assistant SEN-CSU) répond d'abord via sa FAQ locale
// trilingue. Quand aucune entrée ne correspond, il interroge cette
// route pour obtenir une réponse conversationnelle (fr / wolof / en).
//
// Authentification : ANTHROPIC_API_KEY (dans backend/.env + Render).
//   • Si la clé est absente → { configured: false } : le front garde
//     son message de repli local (rien ne casse, aucun coût).
//
// Modèle : CHAT_MODEL (défaut « claude-sonnet-4-6 », bon compromis
//   qualité multilingue / coût). Surchargeable par variable d'env.
//
// Sécurité / coût :
//   • rate-limit dédié (plus strict que le /api/ global) ;
//   • messages et historique bornés en taille ;
//   • pas de streaming (réponse unique, plus simple à consommer).
// ====================================================================
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.CHAT_MODEL || 'claude-sonnet-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_TOKENS = 500;
const MAX_MESSAGE_LEN = 1000;   // longueur max d'un message utilisateur
const MAX_HISTORY = 6;          // nb max de tours d'historique conservés

// Limiteur dédié : le chat coûte de l'argent → on borne par IP.
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: { error: "Trop de messages. Réessayez dans quelques minutes." },
});

/**
 * Consignes système : cadrent le ton, la langue et le périmètre.
 * On rappelle les faits clés du site pour des réponses fiables, et on
 * interdit d'inventer chiffres / tarifs / adresses.
 */
function systemPrompt(lang) {
  const langLine =
    lang === 'fr' ? "Réponds en FRANÇAIS." :
    lang === 'wo' ? "Réponds en WOLOF (orthographe francisée, celle qu'on tape au clavier)." :
    lang === 'en' ? "Answer in ENGLISH." :
    "Réponds TOUJOURS dans la langue du dernier message de l'utilisateur (français, wolof ou anglais).";

  return [
    "Tu es l'assistant virtuel de la SEN-CSU (Agence de la Couverture Sanitaire Universelle du Sénégal).",
    "Ton rôle : renseigner le public sur la couverture santé et les dispositifs sociaux du Sénégal.",
    langLine,
    "Style : bref (2 à 4 phrases), clair, poli et bienveillant. Pas de listes interminables.",
    "",
    "Faits fiables que tu peux utiliser :",
    "- CSU (Couverture Sanitaire Universelle) : adhésion via une mutuelle de santé communale, cotisation modique, couvre la famille inscrite.",
    "- Césarienne : GRATUITE dans les structures publiques (prise en charge par l'État).",
    "- Soins des enfants de 0 à 5 ans : GRATUITS dans les structures publiques.",
    "- Dialyse : prise en charge par l'État dans les centres agréés.",
    "- Plan Sésame : prise en charge des personnes âgées de 60 ans et plus.",
    "- PNBSF : les bénéficiaires sont automatiquement enrôlés dans la CSU.",
    "- Carte d'Égalité des Chances (CEC) : pour les personnes en situation de handicap.",
    "- Le site propose : localiser une agence, formulaire de contact, réclamation, offres d'emploi (Carrière).",
    "",
    "Règles :",
    "- N'invente JAMAIS de tarifs précis, de numéros de téléphone, d'adresses ni de statistiques. Si tu ne les connais pas, invite à contacter l'agence.",
    "- Ne donne pas de diagnostic ni de conseil médical personnel : oriente vers un professionnel de santé.",
    "- Si la question sort de ton domaine, dis-le poliment et propose la page Contact ou de localiser une agence.",
  ].join('\n');
}

// POST /api/chat  → Public (repli conversationnel)
router.post('/', chatLimiter, async (req, res) => {
  // Clé absente → le front conserve son repli local.
  if (!API_KEY) {
    return res.json({ configured: false, reply: null });
  }

  const { message, lang, history } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message requis.' });
  }
  const userMessage = message.trim().slice(0, MAX_MESSAGE_LEN);
  const language = ['fr', 'wo', 'en'].includes(lang) ? lang : 'auto';

  // Historique optionnel : on ne garde que les derniers tours, bornés.
  const safeHistory = Array.isArray(history)
    ? history
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-MAX_HISTORY)
        .map(m => ({ role: m.role, content: String(m.content).slice(0, MAX_MESSAGE_LEN) }))
    : [];

  const messages = [...safeHistory, { role: 'user', content: userMessage }];

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.3,
        system: systemPrompt(language),
        messages,
      }),
    });

    const json = await resp.json();

    if (!resp.ok || json.error) {
      const msg = (json.error && json.error.message) || `HTTP ${resp.status}`;
      console.error('Erreur API Claude:', msg);
      return res.status(502).json({ configured: true, reply: null, error: 'Assistant momentanément indisponible.' });
    }

    // Concatène les blocs texte de la réponse.
    const reply = Array.isArray(json.content)
      ? json.content.filter(b => b.type === 'text').map(b => b.text).join('').trim()
      : '';

    return res.json({ configured: true, reply: reply || null });
  } catch (err) {
    console.error('Erreur appel Claude:', err.message || err);
    return res.status(502).json({ configured: true, reply: null, error: 'Assistant momentanément indisponible.' });
  }
});

// ====================================================================
// Journal d'utilisation (analytics) — savoir ce qui marche / coince
// ====================================================================
const LOG_RETENTION_DAYS = 90;   // purge auto des messages au-delà
const OUTCOMES = ['faq', 'fallback', 'claude'];
const LANG_MODES = ['auto', 'fr', 'wo', 'en'];
const LANGS = ['fr', 'wo', 'en'];

// Chaque message du chat génère un log → limite généreuse (anti-abus seulement).
const logLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: 'Trop de requêtes.' },
});

// Purge paresseuse : au plus une fois par 24 h, sans bloquer la réponse.
// (Même principe que le balayage des appels d'offres : aucune dépendance
// externe, pas de cron à configurer sur l'hébergeur.)
let lastPurge = 0;
function purgeOldLogsMaybe() {
  const now = Date.now();
  if (now - lastPurge < 24 * 60 * 60 * 1000) return;
  lastPurge = now;
  pool
    .query(`DELETE FROM chat_logs WHERE created_at < NOW() - INTERVAL '${LOG_RETENTION_DAYS} days'`)
    .catch((err) => console.error('Purge chat_logs échouée:', err.message || err));
}

// POST /api/chat/log → Public. Enregistre une interaction (best-effort).
// Ne renvoie jamais d'erreur bloquante : le chat ne doit pas dépendre du log.
router.post('/log', logLimiter, async (req, res) => {
  try {
    const { sessionId, langMode, detectedLang, message, outcome, matchedId } = req.body || {};

    if (!OUTCOMES.includes(outcome)) {
      return res.status(400).json({ error: 'outcome invalide.' });
    }

    const values = [
      typeof sessionId === 'string' ? sessionId.slice(0, 64) : null,
      LANG_MODES.includes(langMode) ? langMode : null,
      LANGS.includes(detectedLang) ? detectedLang : null,
      typeof message === 'string' ? message.trim().slice(0, MAX_MESSAGE_LEN) : null,
      outcome,
      typeof matchedId === 'string' ? matchedId.slice(0, 50) : null,
    ];

    await pool.query(
      `INSERT INTO chat_logs (session_id, lang_mode, detected_lang, message, outcome, matched_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      values,
    );

    purgeOldLogsMaybe();
    return res.status(201).json({ ok: true });
  } catch (err) {
    // Best-effort : on avale l'erreur (le front n'en tient pas compte).
    console.error('Enregistrement chat_logs échoué:', err.message || err);
    return res.status(202).json({ ok: false });
  }
});

// GET /api/chat/stats → Admin. Synthèse « bon / moins bon ».
//   ?days=30 (période, défaut 30, borné 1..365)
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs.' });
  }
  next();
}

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
