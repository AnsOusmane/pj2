// src/environments/environment.staging.ts
// Préprod : mêmes réglages que la prod, mais pointant vers les services
// de préprod (base de données dédiée, voir plan de séparation admin — Phase 3).
// ⚠️ URLs à remplacer une fois les services Render de préprod déployés.
export const environment = {
  production: true,
  apiBaseUrl: 'https://REMPLACER-backend-staging.onrender.com/api',
  mediaBaseUrl: 'https://REMPLACER-backend-staging.onrender.com',
  turnstileSiteKey: '1x00000000000000000000AA',
  chatbotEnabled: false,
  appelsOffreEnabled: true
};
