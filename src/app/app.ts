import { Component, signal, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

// Composants
import { HeaderComponent } from './header/header';
import { TutoScreenComponent } from './tuto-screen-component/tuto-screen-component';
import { AboutTimelineComponent } from './about-timeline/about-timeline';
import { DonationComponent } from './donation/donation';
import { OrganigrammeComponent } from './organigramme/organigramme';
import { MissionsvisionComponent } from './missionsvision/missionsvision';
import { Footer } from './footer/footer';
import { LoaderComponent } from './core/loader/loader';

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
    MissionsvisionComponent,
    Footer,
    LoaderComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements AfterViewInit {
  isLoading = signal(true); 
  showTuto = signal(false);
  showAbout = signal(false);
  showDonation = signal(false);
  showOrganigramme = signal(false);
  showMissionsvision = signal(false);

  @ViewChild('logo', { static: false }) logo!: ElementRef<HTMLImageElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public router: Router
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Appliquer l'animation "grow" après 0.2s
      setTimeout(() => {
        if (this.logo) {
          this.logo.nativeElement.classList.add('animate-grow-logo');
        }

        // Supprimer le loader après la fin de l'animation (0.8s)
        setTimeout(() => this.isLoading.set(false), 400);
      }, 200);
    }
  }

  openTuto() { this.showTuto.set(true); }
  openAbout() { this.showAbout.set(true); }
  openDonation() { this.showDonation.set(true); }
  openOrganigramme() { this.showOrganigramme.set(true); }
  closeOrganigramme() { this.showOrganigramme.set(false); }
  openMissionsvision() { this.showMissionsvision.set(true); }
  closeMissionsvision() { this.showMissionsvision.set(false); }
  goHome() { this.router.navigate(['/']); }
}
