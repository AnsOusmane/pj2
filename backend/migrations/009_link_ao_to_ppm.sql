-- 009_link_ao_to_ppm.sql
-- Lie un appel d'offres à la ligne du PPM dont il découle.
--
-- Cycle de vie : une ligne PPM (planifiée) donne lieu à un appel d'offres
-- lorsqu'elle est lancée. On matérialise ce lien par une clé étrangère
-- nullable `ppm_id` (un AO peut exister sans origine PPM, ex. historique).
--
-- ON DELETE SET NULL : si la ligne PPM disparaît un jour, l'AO subsiste
-- simplement détaché (cohérent avec notre archivage : on n'efface pas).
--
-- Changement additif et non destructif.

ALTER TABLE appels_offre
  ADD COLUMN IF NOT EXISTS ppm_id INTEGER REFERENCES ppm(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ao_ppm_id ON appels_offre (ppm_id);
