import { Component, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

// Composants
import { HeaderComponent } from './header/header';
import { HeroComponent } from './hero/hero';
import { TutoScreenComponent } from './tuto-screen-component/tuto-screen-component';
import { AboutTimelineComponent } from './about-timeline/about-timeline';
import { DonationComponent } from './donation/donation';
import { OrganigrammeComponent } from './organigramme/organigramme';
import { AccueilsunuComponent } from './accueilsunu/accueilsunu';
import { MissionsvisionComponent } from './missionsvision/missionsvision';
import { ContactFormComponent } from "./contact-form/contact-form";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    TutoScreenComponent,
    AboutTimelineComponent,
    DonationComponent,
    OrganigrammeComponent,
    AccueilsunuComponent,
    MissionsvisionComponent,
    ContactFormComponent
],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  showTuto = signal(false);
  showAbout = signal(false);
  showDonation = signal(false);
  showOrganigramme = signal(false);
  showMissionsvision = signal(false);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      document.body.addEventListener('closeTuto', () => this.showTuto.set(false));
      document.body.addEventListener('closeAbout', () => this.showAbout.set(false));
      document.body.addEventListener('closeDonation', () => this.showDonation.set(false));
    }
  }

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
  openMissionsvision() {
    this.showMissionsvision.set(true);
  }
  closeMissionsvision() {
    this.showMissionsvision.set(false);
  }
  goHome() {
  this.router.navigate(['/']);

}


}
