import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FournisseursService, Agrement, AgrementStatut } from 'app/services/fournisseurs.service';

@Component({
  selector: 'app-fournisseurs-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fournisseurs-gestion.html',
  styleUrls: ['./fournisseurs-gestion.css']
})
export class FournisseursGestionComponent implements OnInit {

  readonly statuts: { value: AgrementStatut; label: string }[] = [
    { value: 'recu', label: 'Reçu' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'valide', label: 'Validé' },
    { value: 'rejete', label: 'Rejeté' }
  ];

  lignes = signal<Agrement[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  filtreStatut = signal<AgrementStatut | ''>('');

  // Ligne dont le panneau de détail est ouvert
  detailId = signal<number | null>(null);

  constructor(private service: FournisseursService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAllForManage(this.filtreStatut() || undefined).subscribe({
      next: (data) => { this.lignes.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); }
    });
  }

  onFiltreChange(): void {
    this.load();
  }

  toggleDetail(l: Agrement): void {
    this.detailId.set(this.detailId() === l.id ? null : l.id);
  }

  changerStatut(l: Agrement, statut: AgrementStatut): void {
    this.resetMessages();
    this.service.update(l.id, { statut }).subscribe({
      next: () => { this.success.set(`Statut de ${l.numero} mis à jour.`); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur de mise à jour.')
    });
  }

  enregistrerNote(l: Agrement, note: string): void {
    this.resetMessages();
    this.service.update(l.id, { note_traitement: note }).subscribe({
      next: () => { this.success.set(`Note enregistrée pour ${l.numero}.`); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur lors de l\'enregistrement de la note.')
    });
  }

  remove(l: Agrement): void {
    if (!confirm(`Supprimer la demande ${l.numero} (${l.raison_sociale}) ?`)) return;
    this.service.delete(l.id).subscribe({
      next: () => { this.success.set('Demande supprimée.'); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur lors de la suppression.')
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
