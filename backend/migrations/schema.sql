-- ====================================================================
-- Schéma complet — à exécuter UNE FOIS sur une base PostgreSQL NEUVE
-- --------------------------------------------------------------------
-- Reconstruit, table par table, l'état final attendu par le code actuel
-- du backend (routes/*.routes.js). Les fichiers 001_*.sql → 014_*.sql
-- dans ce même dossier sont l'historique incrémental appliqué sur
-- l'ancienne base : ne les rejouez PAS par-dessus ce script, il en
-- intègre déjà tous les effets. N'exécutez QUE ce fichier sur une base
-- neuve.
--
-- Usage (Neon : éditeur SQL du dashboard, ou psql) :
--   psql "$DATABASE_URL" -f backend/migrations/schema.sql
-- ====================================================================

-- --------------------------------------------------------------------
-- Utilisateurs — comptes admin / back-office (routes/auth.routes.js,
-- routes/users.routes.js, middleware/auth.middleware.js).
-- 'cellule-pm' reste autorisé par la contrainte pour compatibilité avec
-- l'historique, mais n'est plus utilisé : l'accès se gère désormais par
-- la colonne `permissions` (voir middleware/permission.middleware.js).
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  fullname    VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,          -- hash bcrypt
  role        VARCHAR(20) NOT NULL DEFAULT 'user'
              CHECK (role IN ('admin', 'user', 'cellule-pm')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- Marchés publics — cycle de vie :
--   PPM (prévu) → Appel d'offres (ppm_id) → Avis d'attribution (appel_offre_id)
-- Archivage doux partout (archived_at/archived_by) : on n'efface jamais
-- une ligne, on la marque archivée (routes/*, jobs/ao-status.job.js).
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ppm (
  id                      SERIAL PRIMARY KEY,
  reference               VARCHAR(100),
  objet                   TEXT NOT NULL,
  type_marche             VARCHAR(50),        -- Fournitures / Travaux / Services / Prestations intellectuelles
  mode_passation          VARCHAR(100),       -- Appel d'offres ouvert, DRP, entente directe...
  source_financement      VARCHAR(150),
  montant_estime          NUMERIC(15, 2),     -- en FCFA
  annee                   INTEGER NOT NULL,
  trimestre               VARCHAR(10),        -- T1 / T2 / T3 / T4
  date_prevue_lancement   TIMESTAMPTZ,
  statut                  VARCHAR(30) NOT NULL DEFAULT 'prevu', -- prevu / lance / attribue / cloture
  is_published            BOOLEAN NOT NULL DEFAULT false,
  created_by              INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by              INTEGER REFERENCES users(id) ON DELETE SET NULL,
  archived_at             TIMESTAMPTZ,
  archived_by             INTEGER REFERENCES users(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ppm_published ON ppm (is_published, annee);
CREATE INDEX IF NOT EXISTS idx_ppm_annee     ON ppm (annee);
CREATE INDEX IF NOT EXISTS idx_ppm_active    ON ppm (created_at) WHERE archived_at IS NULL;

CREATE TABLE IF NOT EXISTS appels_offre (
  id                  SERIAL PRIMARY KEY,
  reference           VARCHAR(100),
  objet               TEXT NOT NULL,
  description         TEXT,
  type_marche         VARCHAR(50),
  mode_passation      VARCHAR(100),
  source_financement  VARCHAR(150),
  date_lancement      TIMESTAMPTZ,
  date_limite         TIMESTAMPTZ,            -- précision à la minute (heure limite de dépôt)
  file_url            TEXT,                   -- avis PDF (Cloudinary)
  statut              VARCHAR(30) DEFAULT 'ouvert',  -- a_venir | ouvert | cloture
  is_published        BOOLEAN DEFAULT false,
  ppm_id              INTEGER REFERENCES ppm(id) ON DELETE SET NULL,
  created_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  archived_at         TIMESTAMPTZ,
  archived_by         INTEGER REFERENCES users(id),
  created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ao_published        ON appels_offre (is_published, date_limite);
CREATE INDEX IF NOT EXISTS idx_ao_statut           ON appels_offre (statut);
CREATE INDEX IF NOT EXISTS idx_ao_ppm_id           ON appels_offre (ppm_id);
CREATE INDEX IF NOT EXISTS idx_appels_offre_active ON appels_offre (created_at) WHERE archived_at IS NULL;

CREATE TABLE IF NOT EXISTS avis_attribution (
  id                  SERIAL PRIMARY KEY,
  reference           VARCHAR(100),
  objet               TEXT NOT NULL,          -- objet du marché attribué
  attributaire        VARCHAR(255) NOT NULL,  -- titulaire / société retenue
  montant             NUMERIC(15,2),          -- FCFA
  type_marche         VARCHAR(50),
  mode_passation      VARCHAR(100),
  date_attribution    TIMESTAMPTZ,
  file_url            TEXT,                   -- avis PDF (Cloudinary)
  is_published        BOOLEAN DEFAULT false,
  appel_offre_id      INTEGER REFERENCES appels_offre(id) ON DELETE SET NULL,
  created_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  archived_at         TIMESTAMPTZ,
  archived_by         INTEGER REFERENCES users(id),
  created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attr_published          ON avis_attribution (is_published, date_attribution);
CREATE INDEX IF NOT EXISTS idx_avis_appel_offre_id     ON avis_attribution (appel_offre_id);
CREATE INDEX IF NOT EXISTS idx_avis_attribution_active ON avis_attribution (created_at) WHERE archived_at IS NULL;

-- --------------------------------------------------------------------
-- Demande d'agrément fournisseur — dépôt public libre (sans compte).
-- Numéro auto AGR-[ANNÉE]-[chrono] généré côté backend.
-- Pièces du cahier des charges (obligatoires) : demande au DG, NINEA,
-- présentation entreprise. Registre de commerce / attestation fiscale :
-- facultatifs, conservés pour compatibilité.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fournisseurs_agrements (
  id                      SERIAL PRIMARY KEY,
  numero                  VARCHAR(50) UNIQUE NOT NULL,   -- AGR-2026-0001
  raison_sociale          VARCHAR(255) NOT NULL,
  ninea                   VARCHAR(50),
  rccm                    VARCHAR(100),
  domaine                 VARCHAR(150),
  adresse                 TEXT,
  telephone               VARCHAR(50),
  email                   VARCHAR(255),
  contact_nom             VARCHAR(255),
  message                 TEXT,
  doc_registre_url        TEXT,   -- facultatif
  doc_fiscale_url         TEXT,   -- facultatif
  doc_demande_url         TEXT,   -- obligatoire (demande formelle au DG)
  doc_ninea_url           TEXT,   -- obligatoire (copie du NINEA)
  doc_presentation_url    TEXT,   -- obligatoire (présentation entreprise)
  statut                  VARCHAR(30) DEFAULT 'recu',    -- recu | en_cours | valide | rejete
  note_traitement         TEXT,
  updated_by              INTEGER REFERENCES users(id) ON DELETE SET NULL,
  archived_at             TIMESTAMPTZ,
  archived_by             INTEGER REFERENCES users(id),
  created_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_agr_statut        ON fournisseurs_agrements (statut);
CREATE INDEX IF NOT EXISTS idx_agr_numero        ON fournisseurs_agrements (numero);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_active ON fournisseurs_agrements (created_at) WHERE archived_at IS NULL;

-- --------------------------------------------------------------------
-- Carrière — candidatures spontanées (dépôt public, sans compte).
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidatures (
  id              SERIAL PRIMARY KEY,
  nom             VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  telephone       VARCHAR(50),
  poste           VARCHAR(255),
  cv_url          TEXT,                          -- Cloudinary (PDF/DOC/DOCX)
  message         TEXT,
  statut          VARCHAR(30) DEFAULT 'recu',    -- recu | en_cours | retenu | rejete
  note_traitement TEXT,
  updated_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  archived_at     TIMESTAMPTZ,
  archived_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_candidatures_statut ON candidatures (statut);
CREATE INDEX IF NOT EXISTS idx_candidatures_active ON candidatures (created_at) WHERE archived_at IS NULL;

-- --------------------------------------------------------------------
-- Chatbot — journal d'utilisation anonyme (analytics FAQ vs repli).
-- Purgé à 90 jours côté application (routes/chat.routes.js).
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_logs (
  id             SERIAL PRIMARY KEY,
  session_id     VARCHAR(64),
  lang_mode      VARCHAR(10),   -- auto | fr | wo | en
  detected_lang  VARCHAR(5),    -- fr | wo | en
  message        TEXT,
  outcome        VARCHAR(20) NOT NULL,  -- faq | fallback | claude
  matched_id     VARCHAR(50),
  created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_chat_logs_outcome    ON chat_logs (outcome);
CREATE INDEX IF NOT EXISTS idx_chat_logs_matched_id ON chat_logs (matched_id) WHERE matched_id IS NOT NULL;

-- --------------------------------------------------------------------
-- Journal de sécurité — tentatives suspectes / refusées (best-effort,
-- voir utils/security-log.js). Purgé à 180 jours côté application.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_events (
  id          SERIAL PRIMARY KEY,
  event_type  VARCHAR(40) NOT NULL,  -- login_failed | auth_invalid_token | auth_inactive_account | turnstile_rejected | rate_limited | cors_blocked
  method      VARCHAR(10),
  route       VARCHAR(255),
  ip          VARCHAR(64),
  detail      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events (created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_type       ON security_events (event_type);

-- --------------------------------------------------------------------
-- Contenu du site — 11 ressources suivant le même schéma générique
-- (GET public / POST-PUT-DELETE protégés + upload Cloudinary + zod),
-- chacune avec ses propres champs métier (routes/*.routes.js).
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS actualites (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  content      TEXT NOT NULL,
  image_url    TEXT,
  link         TEXT,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS communiques (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  file_url    TEXT,
  file_name   VARCHAR(255),
  file_type   VARCHAR(100),
  file_size   INTEGER,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decrets (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  file_path   TEXT,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  embed_url   TEXT,          -- lien YouTube (validé côté route)
  duration    VARCHAR(20),
  thumbnail   TEXT,          -- Cloudinary
  video       TEXT,          -- Cloudinary
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletters (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  file_url    TEXT,
  cover_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guides (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  file_url    TEXT,
  cover_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_manuals (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  file_url    TEXT,
  cover_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS official_reports (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  file_url    TEXT,
  cover_url   TEXT,
  report_type VARCHAR(100),
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS images_bank (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  image_url   TEXT,
  category    VARCHAR(100),
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  location    VARCHAR(255),
  photo_url   TEXT,
  quote       TEXT,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offres_emploi (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  company     VARCHAR(255),
  location    VARCHAR(255),
  deadline    DATE,
  file_url    TEXT,
  cover_url   TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
