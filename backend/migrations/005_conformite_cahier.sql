-- ====================================================================
-- Migration 005 — mise en conformité au cahier des charges (propo.pdf)
-- À exécuter une fois sur la base Neon (éditeur SQL ou script node).
-- ====================================================================

-- --------------------------------------------------------------------
-- Module 4 — demande d'agrément : aligner les pièces sur le cahier.
-- Le cahier impose 3 pièces PDF :
--   1. Demande formelle adressée au Directeur Général
--   2. Copie du NINEA (en cours de validité)
--   3. Présentation de l'entreprise (catalogue / plaquette commerciale)
-- Le registre de commerce et l'attestation fiscale sont conservés mais
-- deviennent FACULTATIFS (bonus hors cahier).
-- --------------------------------------------------------------------
ALTER TABLE fournisseurs_agrements
  ADD COLUMN IF NOT EXISTS doc_demande_url      TEXT,  -- demande formelle au DG (obligatoire)
  ADD COLUMN IF NOT EXISTS doc_ninea_url        TEXT,  -- copie du NINEA (obligatoire)
  ADD COLUMN IF NOT EXISTS doc_presentation_url TEXT;  -- présentation entreprise / plaquette (obligatoire)

-- doc_registre_url et doc_fiscale_url restent en place (désormais facultatifs).
-- L'ancienne « pièce complémentaire » générique disparaît au profit des pièces du cahier.
ALTER TABLE fournisseurs_agrements
  DROP COLUMN IF EXISTS doc_complementaire_url;

-- --------------------------------------------------------------------
-- Module 2 — Appels d'offres : l'heure limite de dépôt.
-- Le cahier indique une échéance précise (« 20 février 2026 à 12h00 mn T.U »).
-- On passe date_limite de DATE à TIMESTAMPTZ pour conserver l'heure.
-- --------------------------------------------------------------------
ALTER TABLE appels_offre
  ALTER COLUMN date_limite TYPE TIMESTAMPTZ USING date_limite::timestamptz;
