import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppelsOffreService, AppelOffre } from 'app/services/appels-offre.service';
import { BackButtonComponent } from 'app/shared/back-button/back-button';

@Component({
  selector: 'app-appels-offre',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  templateUrl: './appels-offre.html',
  styleUrls: ['./appels-offre.css']
})
export class AppelsOffreComponent implements OnInit {

  readonly typesMarche = ['Fournitures', 'Travaux', 'Services', 'Prestations intellectuelles'];

  lignes = signal<AppelOffre[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filtres
  filtreType = signal<string>('');
  // 'tous' | 'ouvert' (en cours) | 'cloture' (clôturés/expirés)
  filtreEtat = signal<string>('tous');

  lignesFiltrees = computed(() => {
    const type = this.filtreType();
    const etat = this.filtreEtat();
    return this.lignes().filter(l => {
      if (type !== '' && l.type_marche !== type) return false;
      if (etat === 'a_venir' && !this.estAVenir(l)) return false;
      if (etat === 'ouvert' && !this.estEnCours(l)) return false;
      if (etat === 'cloture' && (this.estEnCours(l) || this.estAVenir(l))) return false;
      return true;
    });
  });

  constructor(private aoService: AppelsOffreService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.aoService.getAll().subscribe({
      next: (data) => { this.lignes.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); }
    });
  }

  /** À venir = pas encore lancé (statut « à venir » ou date de lancement future). */
  estAVenir(l: AppelOffre): boolean {
    if (l.statut === 'cloture') return false;
    if (l.statut === 'a_venir') return true;
    return !!l.date_lancement && new Date(l.date_lancement).getTime() > Date.now();
  }

  /** En cours = lancé, non clôturé ET date/heure limite non dépassée (auto-expiration). */
  estEnCours(l: AppelOffre): boolean {
    if (l.statut === 'cloture') return false;
    if (this.estAVenir(l)) return false;
    if (!l.date_limite) return true;
    return new Date(l.date_limite).getTime() >= Date.now();
  }

  /** La date limite de dépôt des offres est-elle dépassée ? (vert tant que non) */
  limiteDepassee(l: AppelOffre): boolean {
    if (!l.date_limite) return false;
    return new Date(l.date_limite).getTime() < Date.now();
  }

  resetFiltres(): void {
    this.filtreType.set('');
    this.filtreEtat.set('tous');
  }
}
