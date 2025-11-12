import { Component, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Composants standalone importés depuis pj1
import { HeaderComponent } from './header/header';
import { HeroComponent } from './hero/hero';
import { TutoScreenComponent } from './tuto-screen-component/tuto-screen-component';
import { AboutTimelineComponent } from './about-timeline/about-timeline';
import { DonationComponent } from './donation/donation';
import { OrganigrammeComponent } from './organigramme/organigramme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    HeroComponent,
    TutoScreenComponent,
    AboutTimelineComponent,
    DonationComponent,
    OrganigrammeComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  // Signaux pour afficher/masquer les modales
  showTuto = signal(false);
  showAbout = signal(false);
  showDonation = signal(false);
  showOrganigramme = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Écoute des événements personnalisés venant des composants
      document.body.addEventListener('closeTuto', () => this.showTuto.set(false));
      document.body.addEventListener('closeAbout', () => this.showAbout.set(false));
      document.body.addEventListener('closeDonation', () => this.showDonation.set(false));
    }
  }

  // Fonctions pour ouvrir les modales
  openTuto() {
    this.showTuto.set(true);
  }

  openAbout() {
    this.showAbout.set(true);
  }

  openDonation() {
    this.showDonation.set(true);
  }

  openOrganigramme() {
    this.showOrganigramme.set(true);
  }

  closeOrganigramme() {
    this.showOrganigramme.set(false);
  }
}
