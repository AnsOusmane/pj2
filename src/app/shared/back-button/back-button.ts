import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Flèche « Retour » réutilisable — style/marge uniques pour toutes les pages.
 * - [link] défini  : navigue vers cette route (ex. '/appels-offre').
 * - [link] absent  : revient à la page précédente (historique).
 * À placer comme premier enfant du <section> de la page.
 */
@Component({
  selector: 'app-back-button',
  standalone: true,
  template: `
    <button type="button" (click)="goBack()"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-700 transition mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
           stroke-width="2" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      {{ label }}
    </button>
  `
})
export class BackButtonComponent {
  /** Route de destination. Si absent, retour à la page précédente. */
  @Input() link?: string;
  /** Libellé affiché. */
  @Input() label = 'Retour';

  constructor(private router: Router, private location: Location) {}

  goBack(): void {
    if (this.link) {
      this.router.navigateByUrl(this.link);
    } else {
      this.location.back();
    }
  }
}
