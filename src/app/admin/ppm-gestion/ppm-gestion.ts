import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PpmService, Ppm, PpmPayload } from 'app/services/ppm.service';

@Component({
  selector: 'app-ppm-gestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ppm-gestion.html',
  styleUrls: ['./ppm-gestion.css']
})
export class PpmGestionComponent implements OnInit {

  // Listes de référence (libellés affichés / valeurs stockées)
  readonly typesMarche = ['Fournitures', 'Travaux', 'Services', 'Prestations intellectuelles'];
  readonly modesPassation = [
    "Appel d'offres ouvert",
    "Appel d'offres restreint",
    'Demande de renseignements et de prix (DRP)',
    'Demande de cotation',
    'Entente directe'
  ];
  readonly trimestres = ['T1', 'T2', 'T3', 'T4'];
  readonly statuts = [
    { value: 'prevu', label: 'Prévu' },
    { value: 'lance', label: 'Lancé' },
    { value: 'attribue', label: 'Attribué' },
    { value: 'cloture', label: 'Clôturé' }
  ];

  lignes = signal<Ppm[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // false = lignes actives ; true = lignes archivées.
  showArchived = signal(false);

  // null = panneau fermé, 'new' = création, number = édition de cette ligne
  editingId = signal<number | 'new' | null>(null);
  showForm = computed(() => this.editingId() !== null);

  form: FormGroup;

  constructor(private fb: FormBuilder, private ppmService: PpmService) {
    this.form = this.fb.group({
      reference: [''],
      objet: ['', Validators.required],
      type_marche: [''],
      mode_passation: [''],
      source_financement: [''],
      montant_estime: [null],
      annee: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
      trimestre: [''],
      date_prevue_lancement: [''],
      statut: ['prevu', Validators.required],
      is_published: [false]
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.ppmService.getAllForManage(this.showArchived()).subscribe({
      next: (data) => { this.lignes.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); }
    });
  }

  // Bascule entre les lignes actives et les lignes archivées.
  setArchivedView(archived: boolean): void {
    if (this.showArchived() === archived) return;
    this.showArchived.set(archived);
    this.editingId.set(null);
    this.resetMessages();
    this.load();
  }

  // ====================== OUVERTURE DU PANNEAU ======================
  openCreate(): void {
    this.resetMessages();
    this.form.reset({
      reference: '', objet: '', type_marche: '', mode_passation: '',
      source_financement: '', montant_estime: null, annee: new Date().getFullYear(),
      trimestre: '', date_prevue_lancement: '', statut: 'prevu', is_published: false
    });
    this.editingId.set('new');
  }

  openEdit(ligne: Ppm): void {
    this.resetMessages();
    this.form.reset({
      reference: ligne.reference ?? '',
      objet: ligne.objet,
      type_marche: ligne.type_marche ?? '',
      mode_passation: ligne.mode_passation ?? '',
      source_financement: ligne.source_financement ?? '',
      montant_estime: ligne.montant_estime ?? null,
      annee: ligne.annee,
      trimestre: ligne.trimestre ?? '',
      date_prevue_lancement: ligne.date_prevue_lancement
        ? ligne.date_prevue_lancement.substring(0, 16) : '',
      statut: ligne.statut,
      is_published: !!ligne.is_published
    });
    this.editingId.set(ligne.id);
  }

  cancel(): void {
    this.editingId.set(null);
    this.resetMessages();
  }

  // ====================== ENREGISTREMENT ======================
  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.resetMessages();

    // Nettoyage : '' → null pour les champs optionnels
    const v = this.form.value;
    const payload: PpmPayload = {
      reference: v.reference || null,
      objet: v.objet,
      type_marche: v.type_marche || null,
      mode_passation: v.mode_passation || null,
      source_financement: v.source_financement || null,
      montant_estime: v.montant_estime === '' || v.montant_estime === null ? null : Number(v.montant_estime),
      annee: Number(v.annee),
      trimestre: v.trimestre || null,
      date_prevue_lancement: v.date_prevue_lancement || null,
      statut: v.statut,
      is_published: !!v.is_published
    };

    const current = this.editingId();
    const req$ = current === 'new'
      ? this.ppmService.create(payload)
      : this.ppmService.update(current as number, payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(current === 'new' ? 'Ligne ajoutée.' : 'Ligne mise à jour.');
        this.editingId.set(null);
        this.load();
      },
      error: (err) => { this.saving.set(false); this.error.set(err?.message || 'Erreur lors de l\'enregistrement.'); }
    });
  }

  // ====================== ARCHIVAGE ======================
  archive(ligne: Ppm): void {
    if (!confirm(`Archiver la ligne « ${ligne.objet} » ?`)) return;
    this.resetMessages();
    this.ppmService.archive(ligne.id).subscribe({
      next: () => { this.success.set('Ligne archivée.'); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur lors de l\'archivage.')
    });
  }

  restore(ligne: Ppm): void {
    this.resetMessages();
    this.ppmService.unarchive(ligne.id).subscribe({
      next: () => { this.success.set('Ligne restaurée.'); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur lors de la restauration.')
    });
  }

  // ====================== PUBLICATION RAPIDE ======================
  togglePublish(ligne: Ppm): void {
    this.ppmService.update(ligne.id, { is_published: !ligne.is_published }).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err?.message || 'Erreur de publication.')
    });
  }

  // ====================== HELPERS ======================
  statutLabel(value: string): string {
    return this.statuts.find(s => s.value === value)?.label ?? value;
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  private resetMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}
