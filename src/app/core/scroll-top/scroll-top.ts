import { Component, signal, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

/**
 * Bouton flottant « Revenir en haut ».
 *
 * N'apparaît qu'après avoir suffisamment défilé (> 400 px) : il reste donc
 * invisible sur les pages courtes et ne se montre que sur les pages longues.
 * Un clic ramène en haut de page avec un défilement fluide.
 */
@Component({
  selector: 'app-scroll-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scroll-top.html',
  styleUrls: ['./scroll-top.css'],
})
export class ScrollTopComponent {
  visible = signal(false);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) return;
    this.visible.set(window.scrollY > 400);
  }

  scrollToTop(): void {
    if (!this.isBrowser) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
