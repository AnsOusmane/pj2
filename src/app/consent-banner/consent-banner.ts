import { Component, signal, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from 'core/services/analytics.service/analytics.service';

@Component({
  selector: 'app-consent-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consent-banner.html',
})
export class ConsentBannerComponent implements OnInit {

  show = signal(false);

  private readonly DELAY_MS = 1500;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private analytics: AnalyticsService
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const consent = localStorage.getItem('siteConsent');

    // Si déjà accepté → on charge directement Analytics
    if (consent === 'accepted') {
      this.analytics.load();
      return;
    }

    // S'il n'y a PAS de consentement → on affiche après un délai
    if (!consent) {
      setTimeout(() => {
        this.show.set(true);
      }, this.DELAY_MS);
    }
  }

  accept() {
    localStorage.setItem('siteConsent', 'accepted');
    this.analytics.load();
    this.show.set(false);
  }

  refuse() {
    localStorage.setItem('siteConsent', 'refused');
    this.show.set(false);
  }
}