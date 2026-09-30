// admin-app/src/environments/environment.staging.ts
// Préprod : pointe vers le backend-admin de préprod (base de données dédiée,
// voir plan de séparation admin — Phase 3).
export const environment = {
  production: true,
  apiBaseUrl: 'https://backend-admin-staging.onrender.com/api'
};
