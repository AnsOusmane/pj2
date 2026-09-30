import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer, throwError } from 'rxjs';

// Nombre de tentatives supplémentaires après l'échec initial.
const MAX_RETRIES = 3;
// Délai de base ; on l'augmente à chaque tentative (2s, 4s, 6s).
const BASE_DELAY_MS = 2000;

/**
 * Détermine si une erreur mérite d'être rejouée.
 *
 * Le backend est sur le plan gratuit de Render qui met le service en veille
 * après ~15 min d'inactivité : la première requête au réveil échoue (~30-60s
 * le temps que Node redémarre) avec une absence de réponse ou une page d'erreur
 * HTML générée par le proxy de Render.
 *
 * On NE rejoue PAS les vraies erreurs applicatives (4xx, ou 5xx renvoyées en
 * JSON structuré par notre API) pour éviter notamment les doubles soumissions.
 */
function isColdStartError(error: HttpErrorResponse): boolean {
  // Pas de réponse du tout (réseau coupé / serveur injoignable pendant le réveil).
  if (error.status === 0) return true;

  // Erreurs passerelle typiques d'un service en cours de démarrage.
  if (error.status === 502 || error.status === 503 || error.status === 504) {
    return true;
  }

  // 500 renvoyé sous forme de page HTML = page d'erreur du proxy Render au réveil.
  // (Nos erreurs applicatives renvoient un objet JSON, qu'on ne rejoue pas.)
  if (error.status === 500 && typeof error.error === 'string') return true;

  return false;
}

export const RetryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error, retryCount) => {
        if (error instanceof HttpErrorResponse && isColdStartError(error)) {
          return timer(BASE_DELAY_MS * retryCount); // 2s, 4s, 6s
        }
        // Erreur non rejouable → on propage immédiatement.
        return throwError(() => error);
      }
    })
  );
};
