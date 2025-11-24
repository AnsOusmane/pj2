import { Component, EventEmitter, Output, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements AfterViewInit {

  isMenuOpen = false;
  isBrowser = false;

  @Output() openTuto = new EventEmitter<void>();
  @Output() openAboutTimeline = new EventEmitter<void>();
  @Output() openAbout = new EventEmitter<void>();
  @Output() openDonation = new EventEmitter<void>();
  @Output() openOrganigramme = new EventEmitter<void>();
  @Output() openMissionsvision = new EventEmitter<void>();

  /** 👇 ➕ AJOUT ICI : lien retour accueil */
  @Output() goHome = new EventEmitter<void>();

  // === Carrousel Pub ===
  bannerImages: string[] = [
    'assets/pub/1.png',
    'assets/pub/2.PNG',
    'assets/pub/3.PNG',
    'assets/pub/4.PNG',
  ];

  bannerLinks: string[] = [
    'https://sunucsu.sn',
    'https://sunucsu.sn/pharmacies',
    'https://sunucsu.sn/actualite-3',
    'https://sunucsu.sn/',
  ];

  bannerIndex: number = 0;
  imageOpacity: number = 1;
  bannerInterval: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  // === Carrousel méthodes ===
  nextBanner() {
    this.imageOpacity = 0;
    setTimeout(() => {
      this.bannerIndex = (this.bannerIndex + 1) % this.bannerImages.length;
      this.imageOpacity = 1;
    }, 200);
  }

  previousBanner() {
    this.imageOpacity = 0;
    setTimeout(() => {
      this.bannerIndex =
        (this.bannerIndex - 1 + this.bannerImages.length) % this.bannerImages.length;
      this.imageOpacity = 1;
    }, 200);
  }

  startBannerAuto() {
    this.bannerInterval = setInterval(() => {
      this.nextBanner();
    }, 3000);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    this.startBannerAuto();
  }

  // === Navigation ===
  onAboutClick() { this.openAboutTimeline.emit(); }
  showOrganigrammeClick() { this.openOrganigramme.emit(); }
  onMissionsvisionClick() { this.openMissionsvision.emit(); }
  GoHomeClick() { this.goHome.emit(); }

  goToMedia() { this.router.navigate(['/media']); }
  goToBankImg() { this.router.navigate(['/banque-images']); }
  goToComuPresse() { this.router.navigate(['/communiques-presse']); }
  goToRapports() { this.router.navigate(['/rapports-officiels']); }
  goToGuide() { this.router.navigate(['/guide']); }
  goToDecret() { this.router.navigate(['/decrets']); }
  goToManuel() { this.router.navigate(['/manuel-d-audit']); }
  goToContact() { this.router.navigate(['/contact']); }
  goToSr() { this.router.navigate(['/nos-services-regionaux']); }
  goTozero5ans() { this.router.navigate(['/zero-cinq-ans']); }
  goToPlanSesame() { this.router.navigate(['/plan-sesame']); }
  goToDialyse() { this.router.navigate(['/dialyse']); }
  goToCesarienne() { this.router.navigate(['/cesarienne']); }
  goToAssuranceMaladie() { this.router.navigate(['/assurance-maladie']); }
}
