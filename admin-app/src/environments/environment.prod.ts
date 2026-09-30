// admin-app/src/environments/environment.prod.ts
// Phase 2 : l'admin appelle désormais son propre backend dédié (backend-admin),
// séparé du backend public (backend-jnjz) — voir le plan de séparation admin.
export const environment = {
  production: true,
  apiBaseUrl: 'https://backend-admin-rg7i.onrender.com/api'
};
