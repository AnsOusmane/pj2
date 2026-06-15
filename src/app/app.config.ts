import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';
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

    // HTTP Client + Interceptors (JWT puis retry au réveil à froid de Render)
    provideHttpClient(
      withInterceptors([AuthInterceptor, RetryInterceptor])
    ),

    // Hydration (pour SSR)
    provideClientHydration(withEventReplay())
  ]
};