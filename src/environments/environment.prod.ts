// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://sencsu-backend.onrender.com/api',
  mediaBaseUrl: 'https://sencsu-backend.onrender.com',
  // À REMPLACER par la vraie clé de site Cloudflare Turnstile (dashboard Turnstile).
  // Pour l'instant : clé de TEST (le widget passe toujours → aucune protection réelle).
  turnstileSiteKey: '1x00000000000000000000AA'
};