import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Gère l'expiration de l'access token (court, 5 min) de façon transparente :
 *
 * - Sur un 401 d'une route protégée, on tente UN rafraîchissement via le cookie
 *   refresh, puis on rejoue la requête d'origine avec le nouveau token.
 * - Si le refresh échoue (refresh expiré / compte désactivé) → logout + /login.
 * - Un 403 (« connecté mais droits insuffisants ») ne déclenche PAS de logout.
 * - On n'intervient pas sur les endpoints /auth/* (login, refresh, logout).
 */
export const SessionInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthCall = req.url.includes('/auth/');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // On ne réagit qu'aux 401 de routes protégées, quand une session existe.
      if (error.status !== 401 || isAuthCall || !authService.isLoggedIn()) {
        return throwError(() => error);
      }

      // Tentative de rafraîchissement puis rejeu de la requête d'origine.
      return authService.refreshToken().pipe(
        switchMap(() => {
          const token = authService.getToken();
          const retried = token
            ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
            : req;
          return next(retried);
        }),
        catchError(() => {
          // Le refresh a échoué : la session est réellement terminée.
          authService.logout();
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url, expired: '1' }
          });
          return throwError(() => error);
        })
      );
    })
  );
};
