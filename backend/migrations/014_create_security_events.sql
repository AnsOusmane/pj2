-- ====================================================================
-- Journal de sécurité — trace des tentatives suspectes / refusées
-- --------------------------------------------------------------------
-- Alimenté en best-effort (jamais bloquant) par backend/utils/security-log.js
-- depuis : auth.middleware (jeton invalide, compte désactivé),
-- auth.routes (connexion refusée), turnstile.middleware (anti-robot
-- refusé), server.js (origine CORS bloquée, dépassement de rate-limit).
--
-- Dépôt anonyme côté serveur uniquement : aucune route publique n'écrit
-- directement ici. Purge automatique au-delà de 180 jours (paresseuse,
-- comme chat_logs — voir security-log.js).
-- ====================================================================
CREATE TABLE IF NOT EXISTS security_events (
  id          SERIAL PRIMARY KEY,
  event_type  VARCHAR(40) NOT NULL,   -- login_failed | auth_invalid_token | auth_inactive_account | turnstile_rejected | rate_limited | cors_blocked
  method      VARCHAR(10),
  route       VARCHAR(255),
  ip          VARCHAR(64),
  detail      TEXT,                  -- info complémentaire non sensible (email tenté, code d'erreur…)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events (created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_type       ON security_events (event_type);
