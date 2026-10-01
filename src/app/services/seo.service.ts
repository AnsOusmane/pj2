import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

// Le <title> par route est géré nativement par Angular Router (propriété
// `title` de chaque Route). Seule la meta description n'a pas d'équivalent
// natif : ce service l'applique à partir de `route.data['description']`.
@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private meta: Meta) {}

  setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
  }
}
