import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffresEmploiService, OffreEmploi } from 'app/services/offres-emploi.service';

@Component({
  selector: 'app-offres-emploi-gestion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offres-emploi-gestion.html',
  styleUrls: ['./offres-emploi-gestion.css']
})
export class OffresEmploiGestionComponent implements OnInit {

  lignes = signal<OffreEmploi[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor(private service: OffresEmploiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAllForManage().subscribe({
      next: (data) => { this.lignes.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); }
    });
  }

  // Affiche / masque l'offre sur le site public.
  toggleActive(l: OffreEmploi): void {
    this.resetMessages();
    const next = !l.is_active;
    this.service.setActive(l.id, next).subscribe({
      next: () => {
        this.success.set(next ? `« ${l.title} » est maintenant visible.` : `« ${l.title} » a été masquée.`);
        this.load();
      },
      error: (err) => this.error.set(err?.message || 'Erreur de mise à jour.')
    });
  }

  supprimer(l: OffreEmploi): void {
    if (!confirm(`Supprimer définitivement l'offre « ${l.title} » ? Cette action est irréversible.`)) return;
    this.resetMessages();
    this.service.delete(l.id).subscribe({
      next: () => { this.success.set('Offre supprimée.'); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur lors de la suppression.')
    });
  }

  private resetMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}
