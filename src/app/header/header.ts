import { Component, EventEmitter, Output, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
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

  ngAfterViewInit() {
    if (!this.isBrowser) return;

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
  }
}
