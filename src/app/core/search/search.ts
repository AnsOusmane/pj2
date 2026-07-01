import {
  Component,
  computed,
  signal,
  effect,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SearchService, SearchEntry } from './search.service';

/**
 * Palette de recherche globale.
 *
 * S'ouvre via le bouton loupe de la navbar ou le raccourci Ctrl+K.
 * Filtrage instantané côté client, navigation clavier (↑ ↓ Entrée), Échap ferme.
 */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.html',
  styleUrls: ['./search.css'],
})
export class SearchComponent {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  query = signal('');
  activeIndex = signal(0);
  private isBrowser: boolean;

  /** Résultats filtrés selon la requête courante. */
  results = computed<SearchEntry[]>(() => this.searchService.search(this.query()));

  constructor(
    public searchService: SearchService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // À l'ouverture : reset et focus sur le champ.
    effect(() => {
      if (this.searchService.isOpen()) {
        this.query.set('');
        this.activeIndex.set(0);
        if (this.isBrowser) {
          setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
        }
      }
    });

    // Garde l'index actif dans les bornes quand les résultats changent.
    effect(() => {
      const len = this.results().length;
      if (this.activeIndex() >= len) this.activeIndex.set(Math.max(0, len - 1));
    });
  }

  /** Raccourci global Ctrl+K (ou Cmd+K) pour ouvrir la recherche. */
  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchService.toggle();
    }
  }

  onInput(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  onKeydown(event: KeyboardEvent): void {
    const results = this.results();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (results.length) this.activeIndex.set((this.activeIndex() + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (results.length)
          this.activeIndex.set((this.activeIndex() - 1 + results.length) % results.length);
        break;
      case 'Enter':
        event.preventDefault();
        this.goTo(results[this.activeIndex()]);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  goTo(entry: SearchEntry | undefined): void {
    if (!entry) return;
    this.router.navigate([entry.route], entry.queryParams ? { queryParams: entry.queryParams } : {});
    this.close();
  }

  close(): void {
    this.searchService.close();
  }
}
