import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { RetryInterceptor } from './interceptors/retry.interceptor';
import { SessionInterceptor } from './interceptors/session.interceptor';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Routing
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      })
    ),

    // HTTP Client + Interceptors : JWT ajouté, retry au réveil à froid de Render,
    // puis redirection auto vers /login si la session expire (401).
    provideHttpClient(
      withInterceptors([AuthInterceptor, RetryInterceptor, SessionInterceptor])
    ),

    // Au démarrage (navigateur only) : si une session existait, on récupère un
    // access token frais via le cookie refresh avant que les guards n'agissent.
    provideAppInitializer(() => inject(AuthService).initSession()),

    // Hydration (pour SSR)
    provideClientHydration(withEventReplay())
  ]
};