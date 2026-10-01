import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

// Composants
import { HeaderComponent } from './header/header';
import { AboutTimelineComponent } from './about-timeline/about-timeline';
import { DonationComponent } from './donation/donation';
import { OrganigrammeComponent } from './organigramme/organigramme';
import { MissionsvisionComponent } from './missionsvision/missionsvision';
import { Footer } from './footer/footer';
import { LoaderComponent } from './core/loader/loader';
import { ScrollTopComponent } from './core/scroll-top/scroll-top';
import { SearchComponent } from './core/search/search';
import { ChatComponent } from './core/chat/chat';
import { ConsentBannerComponent } from './consent-banner/consent-banner';
import { environment } from '../environments/environment';
import { SeoService } from './services/seo.service';

// Reprise si une route n'a pas de data.description (ex. pages admin, non indexées).
const DEFAULT_DESCRIPTION = "Agence de la Couverture Sanitaire Universelle du Sénégal : programmes de santé, marchés publics, actualités et services aux citoyens.";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    AboutTimelineComponent,
    DonationComponent,
    OrganigrammeComponent,
    MissionsvisionComponent,
    Footer,
    LoaderComponent,
    ScrollTopComponent,
    SearchComponent,
    ChatComponent,
    ConsentBannerComponent,
  ],
  templateUrl: './app.html',
})
export class App implements AfterViewInit {

  isLoading = signal(true);
  showNewYearWish = signal(false);

  /** Widget chatbot : en pause en prod (voir environment.prod.ts). */
  readonly chatbotEnabled = environment.chatbotEnabled;

  showAbout = signal(false);
  showDonation = signal(false);
  showOrganigramme = signal(false);
  showMissionsvision = signal(false);
  /** Modale « Appels d'offres bientôt disponible » (affichée en prod, cf. environment). */
  showAppelsOffreInfo = signal(false);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private seo: SeoService,
    private cdr: ChangeDetectorRef
  ) {
    // Meta description par route (le <title>, lui, est géré nativement par
    // Angular Router via la propriété `title` de chaque Route).
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        this.seo.setDescription(data['description'] || DEFAULT_DESCRIPTION);
        this.cdr.markForCheck();
      });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    /* VOEUX NOUVEL AN */
    const alreadyShown = localStorage.getItem('newYear2026Shown');

    if (!alreadyShown) {
      this.showNewYearWish.set(true);

      setTimeout(() => {
        this.showNewYearWish.set(false);
        localStorage.setItem('newYear2026Shown', 'true');
      }, 4500);
    }

    /* LOADER : on laisse l'animation visible le temps que le site s'initialise. */
    setTimeout(() => {
      this.isLoading.set(false);
    }, 300);
  }

  // Masque l'en-tête (navbar fixe) sur la page maintenance
  get hideHeader(): boolean {
    return this.router.url.split('?')[0].startsWith('/maintenance');
  }

  openAbout() { this.showAbout.set(true); }
  openDonation() { this.showDonation.set(true); }
  openOrganigramme() { this.showOrganigramme.set(true); }
  closeOrganigramme() { this.showOrganigramme.set(false); }
  openMissionsvision() { this.showMissionsvision.set(true); }
  closeMissionsvision() { this.showMissionsvision.set(false); }
  openAppelsOffreInfo() { this.showAppelsOffreInfo.set(true); }
  closeAppelsOffreInfo() { this.showAppelsOffreInfo.set(false); }
  goHome() { this.router.navigate(['/']); }
}

