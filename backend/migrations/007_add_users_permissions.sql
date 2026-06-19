-- 007_add_users_permissions.sql
-- Ajoute une colonne `permissions` (liste des clés du menu admin accessibles)
-- aux utilisateurs. Les admins ont accès à tout : cette colonne ne concerne
-- que les utilisateurs non-admin.
-- Changement additif et non destructif (valeur par défaut : tableau vide).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS permissions jsonb NOT NULL DEFAULT '[]'::jsonb;
