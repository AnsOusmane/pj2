-- 010_dates_to_timestamptz.sql
-- Passe les dates métier en TIMESTAMPTZ (précision minute) afin de piloter
-- les statuts à l'heure exacte, et d'uniformiser la saisie (datetime-local).
--
-- Cohérent avec appels_offre.date_limite, déjà en timestamptz.
-- Les valeurs DATE existantes sont converties à minuit (cast direct), donc
-- aucune perte : un ancien « 2026-06-22 » devient « 2026-06-22 00:00:00+TZ ».
--
-- Changement de type non destructif (USING cast).

ALTER TABLE appels_offre
  ALTER COLUMN date_lancement TYPE TIMESTAMPTZ USING date_lancement::timestamptz;

ALTER TABLE ppm
  ALTER COLUMN date_prevue_lancement TYPE TIMESTAMPTZ USING date_prevue_lancement::timestamptz;

ALTER TABLE avis_attribution
  ALTER COLUMN date_attribution TYPE TIMESTAMPTZ USING date_attribution::timestamptz;
