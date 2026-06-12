import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // L'espace admin dépend du token stocké dans le localStorage du navigateur :
  // il ne peut pas être pré-rendu/SSR (pas d'auth côté build/serveur).
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
