import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Bloque l'accès direct (par URL) aux pages Appels d'offres/PPM/Avis
// d'attribution/Fournisseurs quand la section est mise en pause
// (appelsOffreEnabled: false). Les liens de navigation ouvrent déjà une
// modale d'info à la place, mais sans ce garde l'URL restait accessible
// en la tapant directement dans le navigateur.
export const appelsOffreGuard: CanActivateFn = () => {
  if (environment.appelsOffreEnabled) return true;
  return inject(Router).createUrlTree(['/maintenance']);
};
