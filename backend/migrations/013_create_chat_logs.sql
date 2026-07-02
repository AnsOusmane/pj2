-- ====================================================================
-- Chatbot — Journal d'utilisation (analytics « bon / moins bon »)
-- --------------------------------------------------------------------
-- Trace chaque message reçu par l'assistant SEN-CSU pour mesurer ce qui
-- fonctionne (une entrée FAQ a répondu) et ce qui coince (repli sans
-- réponse → question à intégrer à la base de connaissances).
--
-- Dépôt PUBLIC anonyme : pas de compte, pas d'IP, pas de données perso
-- structurées. `session_id` est un identifiant aléatoire généré côté
-- navigateur (regroupe les messages d'une même visite, sans identifier
-- la personne).
--
-- Confidentialité : le texte de la question est conservé BRUT (utile pour
-- améliorer la FAQ) mais purgé automatiquement après 90 jours (voir la
-- purge planifiée dans routes/chat.routes.js). Additif, non destructif.
-- ====================================================================
CREATE TABLE IF NOT EXISTS chat_logs (
  id             SERIAL PRIMARY KEY,
  session_id     VARCHAR(64),                   -- id anonyme de visite (navigateur)
  lang_mode      VARCHAR(10),                   -- auto | fr | wo | en (sélecteur)
  detected_lang  VARCHAR(5),                    -- fr | wo | en (langue effective)
  message        TEXT,                          -- question brute (purgée à 90 j)
  outcome        VARCHAR(20) NOT NULL,          -- faq | fallback (| claude à terme)
  matched_id     VARCHAR(50),                   -- id de l'entrée FAQ si outcome='faq'
  created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Volume par période + tri chronologique (liste récente).
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs (created_at);
-- Taux de résolution (faq vs fallback).
CREATE INDEX IF NOT EXISTS idx_chat_logs_outcome ON chat_logs (outcome);
-- Top des sujets FAQ réellement sollicités.
CREATE INDEX IF NOT EXISTS idx_chat_logs_matched_id ON chat_logs (matched_id) WHERE matched_id IS NOT NULL;
