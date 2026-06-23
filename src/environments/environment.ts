// src/environments/environment.ts
// Détection automatique de l'hôte : l'API/les médias sont servis par la MÊME
// machine que le frontend, sur le port 3000. On déduit donc l'adresse du
// backend depuis l'URL d'ouverture du site, au lieu de coder une IP en dur.
//   - ouvert via http://localhost:4200     → backend http://localhost:3000
//   - ouvert via http://10.100.226.141:4200 → backend http://10.100.226.141:3000
// Avantage : si l'IP DHCP change, ou si un autre PC du réseau accède au site,
// rien à modifier. (La prod utilise environment.prod.ts → URL Render fixe.)
const host = (typeof window !== 'undefined' && window.location.hostname) || 'localhost';

export const environment = {
  production: false,
  apiBaseUrl: `http://${host}:3000/api`,
  mediaBaseUrl: `http://${host}:3000/storage`,
  // Clé de TEST Cloudflare Turnstile (valide toujours) — ok en dev.
  turnstileSiteKey: '1x00000000000000000000AA'
};
