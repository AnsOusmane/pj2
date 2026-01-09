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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private analytics: AnalyticsService
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const consent = localStorage.getItem('siteConsent');

    if (consent === 'accepted') {
      this.analytics.load(); // ✅ GA chargé automatiquement
    }

    if (!consent) {
      this.show.set(true); // ✅ affiche le bandeau
    }
  }

  accept() {
    localStorage.setItem('siteConsent', 'accepted');
    this.analytics.load(); // ✅ charge GA après clic
    this.show.set(false);
  }

  refuse() {
    localStorage.setItem('siteConsent', 'refused');
    this.show.set(false);
  }
}
