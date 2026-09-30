import { RenderMode, ServerRoute } from '@angular/ssr';

// L'espace admin (jamais pré-rendable : auth côté navigateur) vit désormais
// dans admin-app/, une application Angular séparée — plus de route ici à exclure.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
