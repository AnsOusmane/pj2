-- ====================================================================
-- Module 3 — Avis d'attribution
-- Résultats d'attribution des marchés publiés par la cellule.
-- Traçabilité « dernière modif » : updated_by + updated_at (comme PPM / AO).
-- ====================================================================
CREATE TABLE IF NOT EXISTS avis_attribution (
  id                  SERIAL PRIMARY KEY,
  reference           VARCHAR(100),
  objet               TEXT NOT NULL,          -- objet du marché attribué
  attributaire        VARCHAR(255) NOT NULL,  -- titulaire / société retenue
  montant             NUMERIC(15,2),          -- montant de l'attribution (FCFA)
  type_marche         VARCHAR(50),
  mode_passation      VARCHAR(100),
  date_attribution    DATE,
  file_url            TEXT,                   -- avis d'attribution (PDF Cloudinary)
  is_published        BOOLEAN DEFAULT false,
  created_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attr_published ON avis_attribution (is_published, date_attribution);
