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
  docRegistre = signal<File | null>(null);
  docFiscale = signal<File | null>(null);
  docComplementaire = signal<File | null>(null);

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

  onFileChange(event: Event, slot: 'registre' | 'fiscale' | 'complementaire'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      this.error.set('Tous les documents doivent être au format PDF.');
      input.value = '';
      return;
    }
    this.error.set(null);
    if (slot === 'registre') this.docRegistre.set(file);
    else if (slot === 'fiscale') this.docFiscale.set(file);
    else this.docComplementaire.set(file);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.docRegistre() || !this.docFiscale()) {
      this.error.set('Le registre de commerce et l\'attestation fiscale (PDF) sont obligatoires.');
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
    fd.append('doc_registre', this.docRegistre() as File);
    fd.append('doc_fiscale', this.docFiscale() as File);
    if (this.docComplementaire()) fd.append('doc_complementaire', this.docComplementaire() as File);

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
    this.docRegistre.set(null);
    this.docFiscale.set(null);
    this.docComplementaire.set(null);
    ['reg', 'fisc', 'comp'].forEach(id => {
      const el = document.getElementById('f-' + id) as HTMLInputElement | null;
      if (el) el.value = '';
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
