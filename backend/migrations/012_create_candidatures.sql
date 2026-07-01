-- ====================================================================
-- Module Carrière — Candidatures spontanées (dépôt public)
-- --------------------------------------------------------------------
-- Stocke en base les candidatures reçues via le formulaire Carrière, EN
-- PLUS de la notification e-mail (Web3Forms) déjà en place. Le CV est
-- uploadé sur Cloudinary côté front ; on conserve ici son URL (cv_url).
--
-- Dépôt anonyme (sans compte) → pas de created_by. Suivi du statut par la
-- cellule / l'admin (traçabilité updated_by/at). Archivage soft, comme les
-- autres modules (cf. 008_add_archiving.sql).
-- Changement additif et non destructif.
-- ====================================================================
CREATE TABLE IF NOT EXISTS candidatures (
  id              SERIAL PRIMARY KEY,
  nom             VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  telephone       VARCHAR(50),
  poste           VARCHAR(255),                  -- poste souhaité (texte libre)
  cv_url          TEXT,                          -- URL Cloudinary du CV (PDF/DOC/DOCX)
  message         TEXT,                          -- message éventuel du candidat
  statut          VARCHAR(30) DEFAULT 'recu',    -- recu | en_cours | retenu | rejete
  note_traitement TEXT,                          -- note interne de la cellule
  updated_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  archived_at     TIMESTAMPTZ,                   -- NULL = active
  archived_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_candidatures_statut ON candidatures (statut);
-- Index partiel : accélère le filtrage « actifs » (le plus fréquent).
CREATE INDEX IF NOT EXISTS idx_candidatures_active ON candidatures (created_at) WHERE archived_at IS NULL;
