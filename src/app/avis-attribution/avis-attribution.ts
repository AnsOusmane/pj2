import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisAttributionService, AvisAttribution } from 'app/services/avis-attribution.service';
import { BackButtonComponent } from 'app/shared/back-button/back-button';

@Component({
  selector: 'app-avis-attribution',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  templateUrl: './avis-attribution.html',
  styleUrls: ['./avis-attribution.css']
})
export class AvisAttributionComponent implements OnInit {

  readonly typesMarche = ['Fournitures', 'Travaux', 'Services', 'Prestations intellectuelles'];

  lignes = signal<AvisAttribution[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  filtreType = signal<string>('');

  lignesFiltrees = computed(() => {
    const type = this.filtreType();
    return this.lignes().filter(l => type === '' || l.type_marche === type);
  });

  constructor(private attrService: AvisAttributionService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.attrService.getAll().subscribe({
      next: (data) => { this.lignes.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); }
    });
  }

  resetFiltres(): void {
    this.filtreType.set('');
  }
}
