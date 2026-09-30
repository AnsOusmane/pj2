import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { RetryInterceptor } from './interceptors/retry.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Routing
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      })
    ),

    // HTTP Client + Interceptor : retry au réveil à froid de Render.
    // (JWT/session : gérés par admin-app, qui héberge désormais /admin et /login.)
    provideHttpClient(
      withInterceptors([RetryInterceptor])
    ),

    // Hydration (pour SSR)
    provideClientHydration(withEventReplay())
  ]
};