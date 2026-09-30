// admin-app/src/environments/environment.ts
// Même détection d'hôte que le site public (pj2/src/environments/environment.ts) :
// en dev, le backend tourne sur la même machine, port 3000.
const host = (typeof window !== 'undefined' && window.location.hostname) || 'localhost';

export const environment = {
  production: false,
  apiBaseUrl: `http://${host}:3000/api`
};
