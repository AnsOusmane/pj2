-- ====================================================================
-- Module 4 — Espace Fournisseurs (dépôt public libre d'agrément)
-- Manifestation d'intérêt déposée SANS compte par les fournisseurs.
-- Numéro auto AGR-[ANNÉE]-[chrono] généré côté backend.
-- Suivi du statut par la cellule / l'admin (traçabilité updated_by/at).
-- ====================================================================
CREATE TABLE IF NOT EXISTS fournisseurs_agrements (
  id                      SERIAL PRIMARY KEY,
  numero                  VARCHAR(50) UNIQUE NOT NULL,   -- AGR-2026-0001
  raison_sociale          VARCHAR(255) NOT NULL,
  ninea                   VARCHAR(50),
  rccm                    VARCHAR(100),                  -- registre du commerce
  domaine                 VARCHAR(150),                  -- domaine d'activité
  adresse                 TEXT,
  telephone               VARCHAR(50),
  email                   VARCHAR(255),
  contact_nom             VARCHAR(255),                  -- personne à contacter
  message                 TEXT,
  doc_registre_url        TEXT,                          -- registre de commerce (PDF)
  doc_fiscale_url         TEXT,                          -- attestation fiscale (PDF)
  doc_complementaire_url  TEXT,                          -- pièce complémentaire (PDF)
  statut                  VARCHAR(30) DEFAULT 'recu',    -- recu | en_cours | valide | rejete
  note_traitement         TEXT,                          -- note interne de la cellule
  updated_by              INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agr_statut ON fournisseurs_agrements (statut);
CREATE INDEX IF NOT EXISTS idx_agr_numero ON fournisseurs_agrements (numero);
