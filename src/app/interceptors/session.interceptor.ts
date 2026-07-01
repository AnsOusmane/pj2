import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Déconnecte et renvoie vers /login dès que la session expire.
 *
 * Le backend renvoie 401 quand l'authentification échoue (token expiré/invalide
 * ou compte désactivé). Un 403, lui, signifie « connecté mais droits
 * insuffisants » : on ne déconnecte PAS dans ce cas.
 *
 * On exclut l'endpoint de connexion (/auth/login), où un 401 veut simplement
 * dire « identifiants incorrects » et ne doit pas déclencher de redirection.
 */
export const SessionInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.includes('/auth/login');

      // On ne réagit que si une session existait réellement (sinon le guard
      // gère déjà la navigation des visiteurs non connectés).
      if (error.status === 401 && !isLoginRequest && authService.isLoggedIn()) {
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url, expired: '1' }
        });
      }

      return throwError(() => error);
    })
  );
};
