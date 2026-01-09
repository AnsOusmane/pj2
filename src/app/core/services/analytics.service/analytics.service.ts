import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private loaded = false;
  private readonly GA_ID = 'G-8LNPX9WSBD';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  load() {
    if (!isPlatformBrowser(this.platformId) || this.loaded) return;

    // Préparer gtag avant d'injecter le script
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    // Injecter GA
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_ID}`;
    document.head.appendChild(script);

    // Initialiser GA
    window.gtag('js', new Date());
    window.gtag('config', this.GA_ID, {
      anonymize_ip: true,
      send_page_view: true
    });

    this.loaded = true;
  }

  // Pour envoyer des événements personnalisés
  event(name: string, params?: Record<string, any>) {
    if (!this.loaded) return;
    window.gtag('event', name, params || {});
  }
}
