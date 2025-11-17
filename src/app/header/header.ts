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

  // ⭐ AJOUT POUR MISSIONSVISION
  @Output() openMissionsvision = new EventEmitter<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onAboutClick() {
    this.openAboutTimeline.emit();
  }

  showOrganigrammeClick() {
    this.openOrganigramme.emit();
  }

  // ⭐ AJOUT POUR MISSIONSVISION
  onMissionsvisionClick() {
    this.openMissionsvision.emit();
  }

  goToMedia() {
    this.router.navigate(['/media']);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    // === Carrousel principal (mincarou) ===
    const images = [
      'assets/mincarou/1.png',
      'assets/mincarou/2.png',
      'assets/mincarou/3.png',
      'assets/mincarou/4.png',
      'assets/mincarou/5.png',
    ];
    let index = 0;
    const imgElement = document.getElementById('carouselImage') as HTMLImageElement | null;
    if (imgElement) {
      imgElement.style.objectFit = 'cover';
      imgElement.style.width = '100%';
      imgElement.style.height = '100%';
      setInterval(() => {
        index = (index + 1) % images.length;
        imgElement.style.opacity = '0';
        setTimeout(() => {
          imgElement.src = images[index];
          imgElement.style.opacity = '1';
        }, 100);
      }, 1500);
    }

    // === Carrousel pharmacies partenaires ===
    const pharmacyImages = [
      'assets/pharmacies/1.png',
      'assets/pharmacies/2.png',
      'assets/pharmacies/3.png',
      'assets/pharmacies/4.png',
      'assets/pharmacies/5.png',
    ];
    let phIndex = 0;
    const phImgElement = document.getElementById('carouselPharmacies') as HTMLImageElement | null;
    if (phImgElement) {
      phImgElement.style.objectFit = 'cover';
      phImgElement.style.width = '100%';
      phImgElement.style.height = '100%';
      setInterval(() => {
        phIndex = (phIndex + 1) % pharmacyImages.length;
        phImgElement.style.opacity = '0';
        setTimeout(() => {
          phImgElement.src = pharmacyImages[phIndex];
          phImgElement.style.opacity = '1';
        }, 200); // correspond au fade
      }, 3000); // change toutes les 3s
    }
  }
}
