-- ============================================================
-- Table PPM (Plan de Passation des Marchés)
-- À exécuter une fois sur la base Neon (SQL editor ou psql).
-- Éditée fréquemment par les membres de la cellule (rôle 'cellule-pm')
-- et les administrateurs. Le public ne voit que les lignes publiées.
-- ============================================================

CREATE TABLE IF NOT EXISTS ppm (
  id                      SERIAL PRIMARY KEY,

  -- Données métier (cf. propo.pdf + standard PPM)
  reference               VARCHAR(100),
  objet                   TEXT NOT NULL,
  type_marche             VARCHAR(50),        -- Fournitures / Travaux / Services / Prestations intellectuelles
  mode_passation          VARCHAR(100),       -- Appel d'offres ouvert, DRP, entente directe...
  source_financement      VARCHAR(150),
  montant_estime          NUMERIC(15, 2),     -- en FCFA
  annee                   INTEGER NOT NULL,
  trimestre               VARCHAR(10),         -- T1 / T2 / T3 / T4
  date_prevue_lancement   DATE,
  statut                  VARCHAR(30) NOT NULL DEFAULT 'prevu', -- prevu / lance / attribue / cloture

  -- Visibilité : la cellule rédige en brouillon, publie quand prêt
  is_published            BOOLEAN NOT NULL DEFAULT false,

  -- Traçabilité « dernière modif »
  created_by              INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by              INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les filtres publics les plus fréquents
CREATE INDEX IF NOT EXISTS idx_ppm_published ON ppm (is_published, annee);
CREATE INDEX IF NOT EXISTS idx_ppm_annee     ON ppm (annee);
