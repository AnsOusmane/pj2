import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppelsOffreService, AppelOffre } from 'app/services/appels-offre.service';

@Component({
  selector: 'app-appels-offre-gestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appels-offre-gestion.html',
  styleUrls: ['./appels-offre-gestion.css']
})
export class AppelsOffreGestionComponent implements OnInit {

  readonly typesMarche = ['Fournitures', 'Travaux', 'Services', 'Prestations intellectuelles'];
  readonly modesPassation = [
    "Appel d'offres ouvert",
    "Appel d'offres restreint",
    'Demande de renseignements et de prix (DRP)',
    'Demande de cotation',
    'Entente directe'
  ];
  readonly statuts = [
    { value: 'ouvert', label: 'Ouvert' },
    { value: 'cloture', label: 'Clôturé' }
  ];

  lignes = signal<AppelOffre[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // null = panneau fermé, 'new' = création, number = édition de cette ligne
  editingId = signal<number | 'new' | null>(null);
  showForm = computed(() => this.editingId() !== null);

  // Fichier sélectionné (séparé du form : input file non lié à FormControl)
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string | null>(null);
  existingFileUrl = signal<string | null>(null);

  form: FormGroup;

  constructor(private fb: FormBuilder, private aoService: AppelsOffreService) {
    this.form = this.fb.group({
      reference: [''],
      objet: ['', Validators.required],
      description: [''],
      type_marche: [''],
      mode_passation: [''],
      source_financement: [''],
      date_lancement: [''],
      date_limite: [''],
      statut: ['ouvert', Validators.required],
      is_published: [false]
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.aoService.getAllForManage().subscribe({
      next: (data) => { this.lignes.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); }
    });
  }

  // ====================== OUVERTURE DU PANNEAU ======================
  openCreate(): void {
    this.resetMessages();
    this.resetFile();
    this.form.reset({
      reference: '', objet: '', description: '', type_marche: '', mode_passation: '',
      source_financement: '', date_lancement: '', date_limite: '', statut: 'ouvert', is_published: false
    });
    this.editingId.set('new');
  }

  openEdit(ligne: AppelOffre): void {
    this.resetMessages();
    this.resetFile();
    this.existingFileUrl.set(ligne.file_url ?? null);
    this.form.reset({
      reference: ligne.reference ?? '',
      objet: ligne.objet,
      description: ligne.description ?? '',
      type_marche: ligne.type_marche ?? '',
      mode_passation: ligne.mode_passation ?? '',
      source_financement: ligne.source_financement ?? '',
      date_lancement: ligne.date_lancement ? ligne.date_lancement.substring(0, 10) : '',
      // datetime-local attend « YYYY-MM-DDTHH:mm » → on tronque la chaîne ISO.
      date_limite: ligne.date_limite ? ligne.date_limite.substring(0, 16) : '',
      statut: ligne.statut,
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
    // Champs texte : on n'envoie que les valeurs renseignées (le backend
    // traite '' comme « non fourni » de toute façon).
    fd.append('objet', v.objet);
    fd.append('statut', v.statut);
    fd.append('is_published', String(!!v.is_published));
    if (v.reference)          fd.append('reference', v.reference);
    if (v.description)         fd.append('description', v.description);
    if (v.type_marche)        fd.append('type_marche', v.type_marche);
    if (v.mode_passation)     fd.append('mode_passation', v.mode_passation);
    if (v.source_financement) fd.append('source_financement', v.source_financement);
    if (v.date_lancement)     fd.append('date_lancement', v.date_lancement);
    if (v.date_limite)        fd.append('date_limite', v.date_limite);
    if (this.selectedFile())  fd.append('file', this.selectedFile() as File);

    const current = this.editingId();
    const req$ = current === 'new'
      ? this.aoService.create(fd)
      : this.aoService.update(current as number, fd);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(current === 'new' ? 'Appel d\'offres ajouté.' : 'Appel d\'offres mis à jour.');
        this.editingId.set(null);
        this.resetFile();
        this.load();
      },
      error: (err) => { this.saving.set(false); this.error.set(err?.message || 'Erreur lors de l\'enregistrement.'); }
    });
  }

  // ====================== SUPPRESSION ======================
  remove(ligne: AppelOffre): void {
    if (!confirm(`Supprimer l'appel d'offres « ${ligne.objet} » ?`)) return;
    this.aoService.delete(ligne.id).subscribe({
      next: () => { this.success.set('Appel d\'offres supprimé.'); this.load(); },
      error: (err) => this.error.set(err?.message || 'Erreur lors de la suppression.')
    });
  }

  // ====================== PUBLICATION RAPIDE ======================
  togglePublish(ligne: AppelOffre): void {
    const fd = new FormData();
    fd.append('is_published', String(!ligne.is_published));
    this.aoService.update(ligne.id, fd).subscribe({
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

  private resetFile(): void {
    this.selectedFile.set(null);
    this.selectedFileName.set(null);
    this.existingFileUrl.set(null);
    const input = document.getElementById('ao-file') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  private resetMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}
