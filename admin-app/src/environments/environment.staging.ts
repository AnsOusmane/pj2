// admin-app/src/environments/environment.staging.ts
// Préprod : pointe vers le backend-admin de préprod (base de données dédiée,
// voir plan de séparation admin — Phase 3).
// ⚠️ URL à remplacer une fois le service Render de préprod déployé.
export const environment = {
  production: true,
  apiBaseUrl: 'https://REMPLACER-backend-admin-staging.onrender.com/api'
};
