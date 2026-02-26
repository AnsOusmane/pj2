import { Component, EventEmitter, Output, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';

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
  @Output() goHome = new EventEmitter<void>();

  bannerImages: string[] = [
    'assets/pub/1.png',
    'assets/pub/2.png',
    'assets/pub/3.png',
    'assets/pub/4.png',
  ];

  bannerLinks: string[] = [];

  bannerIndex: number = 0;
  imageOpacity: number = 1;
  bannerInterval: any;

  partnerImages: string[] = [
    'assets/mincarou/1.png',
    'assets/mincarou/2.png',
    'assets/mincarou/3.png',
    'assets/mincarou/4.png',
    'assets/mincarou/5.png',
  ];

  partnerIndex: number = 0;
  partnerOpacity: number = 1;
  partnerInterval: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.closeAllMenus();
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // PUB
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
      this.bannerIndex = (this.bannerIndex - 1 + this.bannerImages.length) % this.bannerImages.length;
      this.imageOpacity = 1;
    }, 200);
  }

  startBannerAuto() {
    this.bannerInterval = setInterval(() => {
      this.nextBanner();
    }, 18000);
  }

  // Partenaires
  nextPartner() {
    this.partnerOpacity = 0;
    setTimeout(() => {
      this.partnerIndex = (this.partnerIndex + 1) % this.partnerImages.length;
      this.partnerOpacity = 1;
    }, 200);
  }

  startPartnerAuto() {
    this.partnerInterval = setInterval(() => {
      this.nextPartner();
    }, 2500);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    this.startBannerAuto();
    this.startPartnerAuto();
  }

  // ────────────────────────────────────────────────
  //  GESTION DES MENUS MOBILES (seule partie modifiée)
  // ────────────────────────────────────────────────

  mobileDropdown = {
    sen: false,
    publications: false,     // ← AJOUTÉ pour le sous-menu Publications
    assurance: false,
    assistance: false,
    media: false,
    contact: false
  };

  toggleMobileDropdown(menu: 'sen' | 'publications' | 'assurance' | 'assistance' | 'media' | 'contact') {
    const wasOpen = this.mobileDropdown[menu];

    if (menu === 'publications') {
      // On toggle seulement le sous-menu (SEN doit rester ouvert)
      this.mobileDropdown.publications = !wasOpen;
    }
    else if (menu === 'sen') {
      // Quand on touche SEN → on toggle SEN
      this.mobileDropdown.sen = !wasOpen;
      // Si on ferme SEN, on ferme aussi Publications
      if (!this.mobileDropdown.sen) {
        this.mobileDropdown.publications = false;
      }
    }
    else {
      // Pour tous les autres menus de niveau 1 → fermeture complète
      Object.keys(this.mobileDropdown).forEach(key => {
        this.mobileDropdown[key as keyof typeof this.mobileDropdown] = false;
      });
      this.mobileDropdown[menu] = true;
    }
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.mobileDropdown = {
      sen: false,
      publications: false,
      assurance: false,
      assistance: false,
      media: false,
      contact: false
    };
  }

  closeAllMenus() {
    this.isMenuOpen = false;
    this.mobileDropdown = {
      sen: false,
      publications: false,
      assurance: false,
      assistance: false,
      media: false,
      contact: false
    };
  }

  // ────────────────────────────────────────────────
  //  Navigation (inchangée)
  // ────────────────────────────────────────────────

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
  goToZero5ans() { this.router.navigate(['/zero-cinq-ans']); }
  goToPlanSesame() { this.router.navigate(['/plan-sesame']); }
  goToDialyse() { this.router.navigate(['/dialyse']); }
  goToCesarienne() { this.router.navigate(['/cesarienne']); }
  goToAssuranceMaladie() { this.router.navigate(['/assurance-maladie']); }
  goToAppelsOffre() { this.router.navigate(['/appels-offre']); }
  goToCarriere() { this.router.navigate(['/carriere']); }
  goToAdmin() { this.router.navigate(['/admin']); }
  goToActualites() { this.router.navigate(['pages/actualites']); }
  goToCEC() { this.router.navigate(['/cec']); }
  goToPNBSF() { this.router.navigate(['/pnbsf']); }
  goToReclamation() { this.router.navigate(['/reclamation-form']); }

  goToCSU() {
    this.router.navigate(['/assurance-maladie'], { queryParams: { type: 'poste' } });
  }

  goToCSUEleve() {
    this.router.navigate(['/assurance-maladie'], { queryParams: { type: 'eleve' } });
  }

  goToCSUDaara() {
    this.router.navigate(['/assurance-maladie'], { queryParams: { type: 'daara' } });
  }

  goToMaintenance() {
    this.router.navigate(['/maintenance']);
  }

  isVisible = false;
  isPinned = false;
  private hoverTimeout: any = null;

  toggleSocials() {
    this.isPinned = !this.isPinned;
    this.isVisible = this.isPinned;
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  onMouseEnter() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    if (!this.isPinned) {
      this.isVisible = true;
    }
  }

  onMouseLeave() {
    if (!this.isPinned) {
      this.hoverTimeout = setTimeout(() => {
        this.isVisible = false;
      }, 2000);
    }
  }
}