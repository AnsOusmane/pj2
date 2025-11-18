import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LOCALES } from './locales';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guide.html',
  styleUrl: './guide.css'
})
export class Guide {

  lang: 'fr' | 'en' | 'wo' = 'fr';
  t = LOCALES[this.lang];

  activeTab = 'inscription';

  changeLang(language: 'fr' | 'en' | 'wo') {
    this.lang = language;
    this.t = LOCALES[this.lang];
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
