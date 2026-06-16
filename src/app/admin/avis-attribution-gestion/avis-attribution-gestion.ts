import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AvisAttributionService, AvisAttribution } from 'app/services/avis-attribution.service';

@Component({
  selector: 'app-avis-attribution-gestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './avis-attribution-gestion.html',
  styleUrls: ['./avis-attribution-gestion.css']
})
export class AvisAttributionGestionComponent implements OnInit {

  readonly typesMarche = ['Fournitures', 'Travaux', 'Services', 'Prestations intellectuelles'];
  readonly modesPassation = [
    "Appel d'offres ouvert",
    "Appel d'offres restreint",
    'Demande de renseignements et de prix (DRP)',
    'Demande de cotation',
    'Entente directe'
  ];

  lignes = signal<AvisAttribution[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  editingId = signal<number | 'new' | null>(null);
  showForm = computed(() => this.editingId() !== null);

  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string | null>(null);
  existingFileUrl = signal<string | null>(null);

  form: FormGroup;

  constructor(private fb: FormBuilder, private attrService: AvisAttributionService) {
    this.form = this.fb.group({
      reference: [''],
      objet: ['', Validators.required],
      attributaire: ['', Validators.required],
      montant: [null],
      type_marche: [''],
      mode_passation: [''],
      date_attribution: [''],
      is_published: [false]
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.attrService.getAllForManage().subscribe({
      next: (data) => { this.lignes.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); }
    });
  }

  // ====================== OUVERTURE DU PANNEAU ======================
  openCreate(): void {
    this.resetMessages();
    this.resetFile();
    this.form.reset({
      reference: '', objet: '', attributaire: '', montant: null,
      type_marche: '', mode_passation: '', date_attribution: '', is_published: false
    });
    this.editingId.set('new');
  }

  openEdit(ligne: AvisAttribution): void {
    this.resetMessages();
    this.resetFile();
    this.existingFileUrl.set(ligne.file_url ?? null);
    this.form.reset({
      reference: ligne.reference ?? '',
      objet: ligne.objet,
      attributaire: ligne.attributaire,
      montant: ligne.montant ?? null,
      type_marche: ligne.type_marche ?? '',
      mode_passation: ligne.mode_passation ?? '',
      date_attribution: ligne.date_attribution ? ligne.date_attribution.substring(0, 10) : '',
      is_published: !!ligne.is_published
    });
    this.editingId.set(ligne.id);
  }

  cancel(): void {
    this.editingId.set(null);
    this.resetFile();
    this.resetMessages();
  }

  // ====================== FICHIER ======================
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      this.error.set('Veuillez sélectionner un fichier PDF.');
      return;
    }
    this.selectedFile.set(file);
    this.selectedFileName.set(file.name);
    this.error.set(null);
  }

  // ====================== ENREGISTREMENT ======================
  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.resetMessages();

    const v = this.form.value;
    const fd = new FormData();
    fd.append('objet', v.objet);
    fd.append('attributaire', v.attributaire);
    fd.append('is_published', String(!!v.is_published));
    if (v.reference)      fd.append('reference', v.reference);
    if (v.montant !== null && v.montant !== '') fd.append('montant', String(v.montant));
    if (v.type_marche)    fd.append('type_marche', v.type_marche);
    if (v.mode_passation) fd.append('mode_passation', v.mode_passation);
    if (v.date_attribution) fd.append('date_attribution', v.date_attribution);
    if (this.selectedFile()) fd.append('file', this.selectedFile() as File);

    const current = this.editingId();
    const req$ = current === 'new'
      ? this.attrService.create(fd)
      : this.attrService.update(current as number, fd);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(current === 'new' ? 'Avis d\'attribution ajouté.' : 'Avis d\'attribution mis à jour.');
        this.editingId.set(null);
        this.resetFile();
        this.load();
      },
      error: (err) => { this.saving.set(false); this.error.set(err?.message || 'Erreur lors de l\'enregistrement.'); }
    });
  }

  // ====================== SUPPRESSION ======================
  remove(ligne: AvisAttribution): void {
    if (!confirm(`Supprimer l'avis d'attribution « ${ligne.objet} » ?`)) return;
    this.attrService.delete(ligne.id).subscribe({
      next: () => { this.success.set('Avis d\'attribution supprimé.'); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur lors de la suppression.')
    });
  }

  // ====================== PUBLICATION RAPIDE ======================
  togglePublish(ligne: AvisAttribution): void {
    const fd = new FormData();
    fd.append('is_published', String(!ligne.is_published));
    this.attrService.update(ligne.id, fd).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err?.message || 'Erreur de publication.')
    });
  }

  // ====================== HELPERS ======================
  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  private resetFile(): void {
    this.selectedFile.set(null);
    this.selectedFileName.set(null);
    this.existingFileUrl.set(null);
    const input = document.getElementById('attr-file') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  private resetMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}
