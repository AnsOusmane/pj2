-- 008_add_archiving.sql
-- Met en place l'archivage (soft-archive) des écrans Marchés Publics :
-- PPM, appels d'offres, avis d'attribution et demandes d'agrément fournisseurs.
--
-- Principe : on n'efface plus les lignes. On les marque comme archivées via
--   - archived_at : date d'archivage (NULL = ligne active)
--   - archived_by : utilisateur ayant archivé (traçabilité)
-- Une ligne archivée est exclue des listes publiques et de la liste « actifs »
-- de gestion ; elle reste consultable et restaurable depuis l'onglet « Archivés ».
--
-- Changement additif et non destructif.

ALTER TABLE ppm
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by INTEGER REFERENCES users(id);

ALTER TABLE appels_offre
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by INTEGER REFERENCES users(id);

ALTER TABLE avis_attribution
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by INTEGER REFERENCES users(id);

ALTER TABLE fournisseurs_agrements
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by INTEGER REFERENCES users(id);

-- Index partiels : accélèrent le filtrage actifs (archived_at IS NULL) le plus fréquent.
CREATE INDEX IF NOT EXISTS idx_ppm_active               ON ppm                   (created_at)  WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appels_offre_active       ON appels_offre          (created_at)  WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_avis_attribution_active   ON avis_attribution      (created_at)  WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_fournisseurs_active       ON fournisseurs_agrements(created_at)  WHERE archived_at IS NULL;
