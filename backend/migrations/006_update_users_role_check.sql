-- 006_update_users_role_check.sql
-- Élargit la contrainte de rôle des utilisateurs pour inclure 'cellule-pm'
-- (Cellule passation des marchés). L'ancienne contrainte n'autorisait que
-- 'admin' et 'user', ce qui provoquait une erreur 500 (violation de CHECK)
-- lors de la création d'un utilisateur avec le rôle 'cellule-pm'.
-- Changement additif et non destructif (aucune donnée modifiée).

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'user', 'cellule-pm'));
