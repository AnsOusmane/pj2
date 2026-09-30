// admin-app/src/environments/environment.prod.ts
// Phase 1 : l'admin continue d'appeler le backend existant (backend-jnjz).
// Phase 2 : basculera vers le futur service Render dédié (backend-admin).
export const environment = {
  production: true,
  apiBaseUrl: 'https://backend-jnjz.onrender.com/api'
};
