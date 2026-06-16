-- ====================================================================
-- Module 2 — Appels d'offres
-- Avis d'appel d'offres publiés par la cellule de passation des marchés.
-- Traçabilité « dernière modif » : updated_by + updated_at (comme PPM).
-- ====================================================================
CREATE TABLE IF NOT EXISTS appels_offre (
  id                  SERIAL PRIMARY KEY,
  reference           VARCHAR(100),
  objet               TEXT NOT NULL,
  description         TEXT,
  type_marche         VARCHAR(50),
  mode_passation      VARCHAR(100),
  source_financement  VARCHAR(150),
  date_lancement      DATE,
  date_limite         DATE,            -- date limite de dépôt des offres
  file_url            TEXT,            -- avis d'appel d'offres (PDF Cloudinary)
  statut              VARCHAR(30) DEFAULT 'ouvert',  -- ouvert | cloture
  is_published        BOOLEAN DEFAULT false,
  created_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ao_published ON appels_offre (is_published, date_limite);
CREATE INDEX IF NOT EXISTS idx_ao_statut    ON appels_offre (statut);
