-- 011_link_avis_to_ao.sql
-- Lie un avis d'attribution à l'appel d'offres dont il découle.
--
-- Cycle de vie complet du marché :
--   PPM (prévu) → Appel d'offres (lance le PPM) → Avis d'attribution (clôt l'AO + attribue le PPM)
--
-- Clé étrangère nullable (un avis peut exister sans AO d'origine, ex. historique).
-- ON DELETE SET NULL : cohérent avec l'archivage (on n'efface jamais en cascade).
--
-- Changement additif et non destructif.

ALTER TABLE avis_attribution
  ADD COLUMN IF NOT EXISTS appel_offre_id INTEGER REFERENCES appels_offre(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_avis_appel_offre_id ON avis_attribution (appel_offre_id);
