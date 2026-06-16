import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PpmService, Ppm, PpmStatut } from 'app/services/ppm.service';

@Component({
  selector: 'app-ppm-public',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ppm-public.html',
  styleUrls: ['./ppm-public.css']
})
export class PpmPublicComponent implements OnInit {

  readonly typesMarche = ['Fournitures', 'Travaux', 'Services', 'Prestations intellectuelles'];
  readonly statuts: { value: PpmStatut; label: string }[] = [
    { value: 'prevu', label: 'Prévu' },
    { value: 'lance', label: 'Lancé' },
    { value: 'attribue', label: 'Attribué' },
    { value: 'cloture', label: 'Clôturé' }
  ];

  lignes = signal<Ppm[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filtres (liés au template via ngModel)
  filtreAnnee = signal<number | ''>('');
  filtreType = signal<string>('');
  filtreStatut = signal<string>('');

  // Années disponibles, dérivées des données chargées
  anneesDisponibles = computed(() => {
    const set = new Set(this.lignes().map(l => l.annee));
    return Array.from(set).sort((a, b) => b - a);
  });

  lignesFiltrees = computed(() => {
    const annee = this.filtreAnnee();
    const type = this.filtreType();
    const statut = this.filtreStatut();
    return this.lignes().filter(l =>
      (annee === '' || l.annee === annee) &&
      (type === '' || l.type_marche === type) &&
      (statut === '' || l.statut === statut)
    );
  });

  constructor(private ppmService: PpmService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.ppmService.getAll().subscribe({
      next: (data) => { this.lignes.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); }
    });
  }

  statutLabel(value: string): string {
    return this.statuts.find(s => s.value === value)?.label ?? value;
  }

  resetFiltres(): void {
    this.filtreAnnee.set('');
    this.filtreType.set('');
    this.filtreStatut.set('');
  }
}
