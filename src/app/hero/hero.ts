import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrls: ['./hero.css'],
})
export class HeroComponent implements AfterViewInit {
  headerHeight = 64;
  showGreenBlock = false;
  showBtn1 = false;
  showBtn2 = false;
  showBtn3 = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Calcule la hauteur du header
      setTimeout(() => {
        const header = document.querySelector('header');
        if (header) this.headerHeight = header.offsetHeight;
      }, 100);

      // Animation en cascade
      setTimeout(() => {
        this.showGreenBlock = true;
        setTimeout(() => this.showBtn1 = true, 300);
        setTimeout(() => this.showBtn2 = true, 600);
        setTimeout(() => this.showBtn3 = true, 900);
      }, 500);
    }
  }
}