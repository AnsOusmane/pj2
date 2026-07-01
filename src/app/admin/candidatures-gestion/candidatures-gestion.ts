import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidaturesService, Candidature, CandidatureStatut } from 'app/services/candidatures.service';

@Component({
  selector: 'app-candidatures-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidatures-gestion.html',
  styleUrls: ['./candidatures-gestion.css']
})
export class CandidaturesGestionComponent implements OnInit {

  readonly statuts: { value: CandidatureStatut; label: string }[] = [
    { value: 'recu', label: 'Reçu' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'retenu', label: 'Retenu' },
    { value: 'rejete', label: 'Rejeté' }
  ];

  lignes = signal<Candidature[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  filtreStatut = signal<CandidatureStatut | ''>('');

  // false = candidatures actives ; true = candidatures archivées.
  showArchived = signal(false);

  // Ligne dont le panneau de détail est ouvert
  detailId = signal<number | null>(null);

  constructor(private service: CandidaturesService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAllForManage(this.filtreStatut() || undefined, this.showArchived()).subscribe({
      next: (data) => { this.lignes.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); }
    });
  }

  onFiltreChange(): void {
    this.load();
  }

  // Bascule entre les candidatures actives et archivées.
  setArchivedView(archived: boolean): void {
    if (this.showArchived() === archived) return;
    this.showArchived.set(archived);
    this.detailId.set(null);
    this.resetMessages();
    this.load();
  }

  toggleDetail(l: Candidature): void {
    this.detailId.set(this.detailId() === l.id ? null : l.id);
  }

  changerStatut(l: Candidature, statut: CandidatureStatut): void {
    this.resetMessages();
    this.service.update(l.id, { statut }).subscribe({
      next: () => { this.success.set(`Statut de ${l.nom} mis à jour.`); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur de mise à jour.')
    });
  }

  enregistrerNote(l: Candidature, note: string): void {
    this.resetMessages();
    this.service.update(l.id, { note_traitement: note }).subscribe({
      next: () => { this.success.set(`Note enregistrée pour ${l.nom}.`); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur lors de l\'enregistrement de la note.')
    });
  }

  archive(l: Candidature): void {
    if (!confirm(`Archiver la candidature de ${l.nom} ?`)) return;
    this.resetMessages();
    this.service.archive(l.id).subscribe({
      next: () => { this.success.set('Candidature archivée.'); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur lors de l\'archivage.')
    });
  }

  restore(l: Candidature): void {
    this.resetMessages();
    this.service.unarchive(l.id).subscribe({
      next: () => { this.success.set('Candidature restaurée.'); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur lors de la restauration.')
    });
  }

  statutLabel(value: string): string {
    return this.statuts.find(s => s.value === value)?.label ?? value;
  }

  private resetMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}
