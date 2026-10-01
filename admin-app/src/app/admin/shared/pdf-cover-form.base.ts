import { signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

// Base commune aux formulaires admin « PDF + couverture optionnelle »
// (décrets, guides, rapports officiels, manuels d'audit, newsletters) :
// mêmes champs file/cover, mêmes contrôles de type/taille, même flux
// success/error/loading. Chaque sous-classe construit son propre `form`
// (champs métier supplémentaires, validators spécifiques) et n'a plus qu'à
// appeler `submitUpload(...)` avec sa requête HTTP et son message de succès.
export abstract class PdfCoverFormBase {
  abstract form: FormGroup;

  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  selectedPdf = signal<string | null>(null);
  selectedCover = signal<string | null>(null);
  coverPreviewUrl = signal<string | null>(null);

  // Alignés sur la limite multer par défaut côté backend (10 Mo/fichier) ;
  // la couverture est plafonnée plus bas car c'est une simple image de vignette.
  protected maxPdfSizeMb = 10;
  protected maxCoverSizeMb = 5;

  onPdfChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (file.type !== 'application/pdf') {
      this.error.set('Veuillez sélectionner un fichier PDF.');
      return;
    }
    if (file.size > this.maxPdfSizeMb * 1024 * 1024) {
      this.error.set(`Le fichier PDF ne doit pas dépasser ${this.maxPdfSizeMb} Mo.`);
      return;
    }

    this.form.patchValue({ file });
    this.selectedPdf.set(file.name);
    this.error.set(null);
  }

  onCoverChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.error.set('Veuillez sélectionner une image valide (jpg, png, webp).');
      return;
    }
    if (file.size > this.maxCoverSizeMb * 1024 * 1024) {
      this.error.set(`L'image de couverture ne doit pas dépasser ${this.maxCoverSizeMb} Mo.`);
      return;
    }

    this.form.patchValue({ cover: file });
    this.selectedCover.set(file.name);
    if (this.coverPreviewUrl()) URL.revokeObjectURL(this.coverPreviewUrl()!);
    this.coverPreviewUrl.set(URL.createObjectURL(file));
    this.error.set(null);
  }

  removePdf(): void {
    this.form.patchValue({ file: null });
    this.selectedPdf.set(null);
    const fileInput = document.getElementById('file') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  }

  removeCover(): void {
    if (this.coverPreviewUrl()) URL.revokeObjectURL(this.coverPreviewUrl()!);
    this.form.patchValue({ cover: null });
    this.selectedCover.set(null);
    this.coverPreviewUrl.set(null);
    const coverInput = document.getElementById('cover') as HTMLInputElement | null;
    if (coverInput) coverInput.value = '';
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  // Construit le FormData commun (title/description/file/cover) ; `extra`
  // ajoute les champs métier propres à chaque entité (ex. report_type).
  protected buildFormData(extra: Record<string, string> = {}): FormData {
    const formData = new FormData();
    formData.append('title', this.form.value.title);
    formData.append('description', this.form.value.description || '');
    for (const [key, value] of Object.entries(extra)) {
      formData.append(key, value ?? '');
    }
    if (this.form.value.file) formData.append('file', this.form.value.file);
    if (this.form.value.cover) formData.append('cover', this.form.value.cover);
    return formData;
  }

  protected submitUpload(request$: Observable<unknown>, successMessage: string): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.success.set(null);
    this.error.set(null);

    request$.subscribe({
      next: () => {
        this.success.set(successMessage);
        this.resetForm();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || err?.message || "Erreur lors de l'ajout.");
      }
    });
  }

  resetForm(): void {
    this.loading.set(false);
    this.form.reset();
    this.selectedPdf.set(null);
    this.selectedCover.set(null);
    if (this.coverPreviewUrl()) URL.revokeObjectURL(this.coverPreviewUrl()!);
    this.coverPreviewUrl.set(null);

    const fileInput = document.getElementById('file') as HTMLInputElement | null;
    const coverInput = document.getElementById('cover') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
    if (coverInput) coverInput.value = '';
  }
}
