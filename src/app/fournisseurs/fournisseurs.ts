import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FournisseursService } from 'app/services/fournisseurs.service';

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fournisseurs.html',
  styleUrls: ['./fournisseurs.css']
})
export class FournisseursComponent {

  readonly domaines = ['Fournitures', 'Travaux', 'Services', 'Prestations intellectuelles'];

  form: FormGroup;
  saving = signal(false);
  error = signal<string | null>(null);

  // Écran de confirmation après dépôt réussi
  numeroConfirme = signal<string | null>(null);

  // Fichiers (hors FormControl)
  // Pièces du cahier des charges (obligatoires)
  docDemande = signal<File | null>(null);
  docNinea = signal<File | null>(null);
  docPresentation = signal<File | null>(null);
  // Pièces facultatives (bonus)
  docRegistre = signal<File | null>(null);
  docFiscale = signal<File | null>(null);

  constructor(private fb: FormBuilder, private service: FournisseursService) {
    this.form = this.fb.group({
      raison_sociale: ['', Validators.required],
      ninea: [''],
      rccm: [''],
      domaine: [''],
      adresse: [''],
      telephone: [''],
      email: ['', Validators.email],
      contact_nom: [''],
      message: ['']
    });
  }

  onFileChange(event: Event, slot: 'demande' | 'ninea' | 'presentation' | 'registre' | 'fiscale'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      this.error.set('Tous les documents doivent être au format PDF.');
      input.value = '';
      return;
    }
    this.error.set(null);
    if (slot === 'demande') this.docDemande.set(file);
    else if (slot === 'ninea') this.docNinea.set(file);
    else if (slot === 'presentation') this.docPresentation.set(file);
    else if (slot === 'registre') this.docRegistre.set(file);
    else this.docFiscale.set(file);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.docDemande() || !this.docNinea() || !this.docPresentation()) {
      this.error.set('La demande au Directeur Général, la copie du NINEA et la présentation de l\'entreprise (PDF) sont obligatoires.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const v = this.form.value;
    const fd = new FormData();
    fd.append('raison_sociale', v.raison_sociale);
    for (const key of ['ninea', 'rccm', 'domaine', 'adresse', 'telephone', 'email', 'contact_nom', 'message']) {
      if (v[key]) fd.append(key, v[key]);
    }
    fd.append('doc_demande', this.docDemande() as File);
    fd.append('doc_ninea', this.docNinea() as File);
    fd.append('doc_presentation', this.docPresentation() as File);
    if (this.docRegistre()) fd.append('doc_registre', this.docRegistre() as File);
    if (this.docFiscale()) fd.append('doc_fiscale', this.docFiscale() as File);

    this.service.deposer(fd).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.numeroConfirme.set(res.numero);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => { this.saving.set(false); this.error.set(err?.message || 'Erreur lors du dépôt.'); }
    });
  }

  nouveauDepot(): void {
    this.numeroConfirme.set(null);
    this.form.reset({ email: '' });
    this.docDemande.set(null);
    this.docNinea.set(null);
    this.docPresentation.set(null);
    this.docRegistre.set(null);
    this.docFiscale.set(null);
    ['demande', 'ninea', 'present', 'reg', 'fisc'].forEach(id => {
      const el = document.getElementById('f-' + id) as HTMLInputElement | null;
      if (el) el.value = '';
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
