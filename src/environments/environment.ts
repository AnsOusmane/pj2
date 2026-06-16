// src/environments/environment.ts
export const environment = {
  production: false,
    apiBaseUrl: 'http://localhost:3000/api',
    mediaBaseUrl: 'http://localhost:3000/storage',
    // Clé de TEST Cloudflare Turnstile (valide toujours) — ok en dev.
    turnstileSiteKey: '1x00000000000000000000AA'
};