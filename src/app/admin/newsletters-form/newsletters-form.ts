// src/app/newsletters/newsletters-form.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { NewslettersService } from '../../services/newsletters.service';

@Component({
  selector: 'app-newsletters-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './newsletters-form.html',
  styleUrls: ['./newsletters-form.css']
})
export class NewslettersForm {

  form: FormGroup;

  // Signals
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  selectedPdf = signal<string | null>(null);
  selectedCover = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private newslettersService: NewslettersService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      file: [null, Validators.required],
      cover: [null]
    });
  }

  // ========================
  // PDF FILE
  // ========================
  onPdfChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    if (file.type !== 'application/pdf') {
      this.error.set('Veuillez sélectionner un fichier PDF valide.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10 Mo max
      this.error.set('Le fichier PDF ne doit pas dépasser 10 Mo.');
      return;
    }

    this.form.patchValue({ file });
    this.selectedPdf.set(file.name);
    this.error.set(null);
  }

  // ========================
  // COVER IMAGE
  // ========================
  onCoverChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    // Validation image
    if (!file.type.startsWith('image/')) {
      this.error.set('Veuillez sélectionner une image valide (jpg, png, webp).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5 Mo max
      this.error.set('L’image de couverture ne doit pas dépasser 5 Mo.');
      return;
    }

    this.form.patchValue({ cover: file });
    this.selectedCover.set(file.name);
    this.error.set(null);
  }

  // ========================
  // SUBMIT
  // ========================
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.success.set(null);
    this.error.set(null);

    const formData = new FormData();

    formData.append('title', this.form.value.title);
    formData.append('description', this.form.value.description || '');

    // PDF (obligatoire)
    if (this.form.value.file) {
      formData.append('file', this.form.value.file);
    }

    // Cover Image (optionnelle)
    if (this.form.value.cover) {
      formData.append('cover', this.form.value.cover);
    }

    this.newslettersService.addNewsletter(formData).subscribe({
      next: (response) => {
        this.success.set('Newsletter publiée avec succès !');
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.message || 'Une erreur est survenue lors de la publication.');
        this.loading.set(false);
      }
    });
  }

  // ========================
  // RESET FORM
  // ========================
  private resetForm(): void {
    this.loading.set(false);
    this.form.reset();

    this.selectedPdf.set(null);
    this.selectedCover.set(null);

    // Reset des inputs file
    const fileInput = document.getElementById('file') as HTMLInputElement;
    const coverInput = document.getElementById('cover') as HTMLInputElement;

    if (fileInput) fileInput.value = '';
    if (coverInput) coverInput.value = '';
  }

  // ========================
  // VALIDATION HELPER
  // ========================
  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}