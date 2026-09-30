// ====================================================================
// Journal de sécurité — enregistrement best-effort des évènements
// suspects (échec de connexion, jeton invalide, anti-robot refusé,
// origine CORS bloquée, rate-limit dépassé), et détection simple de
// suspicion par IP (seuil sur fenêtre glissante) avec alerte e-mail.
//
// Jamais bloquant : appelé sans `await` par ses points d'appel, et toute
// erreur d'écriture est avalée ici — le journal ne doit jamais faire
// échouer la requête qu'il observe.
//
// Purge paresseuse au-delà de RETENTION_DAYS, au plus une fois par 24h
// (même principe que la purge de chat_logs, voir routes/chat.routes.js).
// ====================================================================
const { pool } = require('../db');
const { sendMail } = require('../config/mailer');

const RETENTION_DAYS = 180;
let lastPurge = 0;

// Suspicion : N évènements (tous types confondus) depuis la même IP sur une
// fenêtre glissante courte. Seuil volontairement simple — pas de scoring par
// type d'évènement, pour rester lisible et prévisible.
const SUSPICION_THRESHOLD = 5;
const SUSPICION_WINDOW_MINUTES = 10;
// Anti-spam de boîte mail : une alerte au plus par IP et par heure.
const ALERT_COOLDOWN_MS = 60 * 60 * 1000;
const lastAlertByIp = new Map();

function purgeOldEventsMaybe() {
  const now = Date.now();
  if (now - lastPurge < 24 * 60 * 60 * 1000) return;
  lastPurge = now;
  pool
    .query(`DELETE FROM security_events WHERE created_at < NOW() - INTERVAL '${RETENTION_DAYS} days'`)
    .catch((err) => console.error('Purge security_events échouée:', err.message || err));
}

function clientIp(req) {
  const ip = req?.ip || (req?.headers && req.headers['x-forwarded-for']) || '';
  return String(ip).slice(0, 64) || null;
}

/**
 * Vérifie si l'IP vient de franchir le seuil de suspicion et, si oui,
 * envoie une alerte e-mail (au plus une par IP et par heure). No-op
 * silencieux si SECURITY_ALERT_EMAIL n'est pas configuré.
 */
async function checkSuspicion(ip) {
  if (!ip) return;
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS n
         FROM security_events
        WHERE ip = $1 AND created_at >= NOW() - INTERVAL '${SUSPICION_WINDOW_MINUTES} minutes'`,
      [ip]
    );
    if ((rows[0]?.n || 0) < SUSPICION_THRESHOLD) return;

    const now = Date.now();
    const last = lastAlertByIp.get(ip) || 0;
    if (now - last < ALERT_COOLDOWN_MS) return; // déjà alerté récemment pour cette IP
    lastAlertByIp.set(ip, now);

    const to = process.env.SECURITY_ALERT_EMAIL;
    if (!to) return; // pas de destinataire configuré : rien ne casse, juste pas d'e-mail

    await sendMail({
      to,
      subject: `⚠️ Activité suspecte détectée — ${ip}`,
      text: `${rows[0].n} évènements de sécurité depuis l'IP ${ip} au cours des ${SUSPICION_WINDOW_MINUTES} dernières minutes.\n\nDétail dans l'espace admin → Journal de sécurité.`,
    });
  } catch (err) {
    console.error('[security-log] vérification de suspicion échouée:', err.message || err);
  }
}

/**
 * Enregistre un évènement de sécurité (fire-and-forget).
 * @param {string} eventType voir la liste dans migrations/014_create_security_events.sql
 * @param {import('express').Request} req
 * @param {string} [detail] info complémentaire non sensible (jamais de mot de passe)
 */
function logSecurityEvent(eventType, req, detail) {
  const ip = clientIp(req);
  pool
    .query(
      `INSERT INTO security_events (event_type, method, route, ip, detail)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        eventType,
        req?.method || null,
        (req?.originalUrl || '').slice(0, 255) || null,
        ip,
        detail ? String(detail).slice(0, 500) : null,
      ]
    )
    .then(() => {
      purgeOldEventsMaybe();
      checkSuspicion(ip);
    })
    .catch((err) => console.error('[security-log] échec écriture:', err.message || err));
}

module.exports = { logSecurityEvent, SUSPICION_THRESHOLD, SUSPICION_WINDOW_MINUTES };
