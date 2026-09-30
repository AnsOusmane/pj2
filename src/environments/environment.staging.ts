// src/environments/environment.staging.ts
// Préprod : mêmes réglages que la prod, mais pointant vers les services
// de préprod (base de données dédiée, voir plan de séparation admin — Phase 3).
export const environment = {
  production: true,
  apiBaseUrl: 'https://backend-staging-ruzw.onrender.com/api',
  mediaBaseUrl: 'https://backend-staging-ruzw.onrender.com',
  turnstileSiteKey: '1x00000000000000000000AA',
  chatbotEnabled: false,
  appelsOffreEnabled: true
};
