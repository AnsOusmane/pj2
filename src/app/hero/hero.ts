import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgIf],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css'],
})
export class HeroComponent implements AfterViewInit {

  currentHero: number = 0; // 0 = hero1, 1 = hero2

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    setInterval(() => {
      this.currentHero = this.currentHero === 0 ? 1 : 0;
    },5500);
  }
  accordionOpen = 1; // étape ouverte par défaut

toggleAccordion(n: number) {
  this.accordionOpen = this.accordionOpen === n ? 0 : n;
}
scrollTo(target: string) {
  const el = document.getElementById(target);
  if (!el) return;

  el.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

}
