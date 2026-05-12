import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { OffresEmploiService } from 'app/services/offres-emploi.service';

@Component({
  selector: 'app-offres-emploi-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './offres-emploi-form.html',
  styleUrls: ['./offres-emploi-form.css']
})
export class OffresEmploiForm {

  form: FormGroup;
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  selectedPdf = signal<string | null>(null);
  selectedCover = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private offresService: OffresEmploiService   // ← Service correctement injecté
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      deadline: [''],
      description: [''],
      file: [null, Validators.required],
      cover: [null]
    });
  }

  // ====================== PDF ======================
  onPdfChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      this.error.set('Veuillez sélectionner un fichier PDF.');
      return;
    }

    this.form.patchValue({ file });
    this.selectedPdf.set(file.name);
    this.error.set(null);
  }

  // ====================== COVER ======================
  onCoverChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.form.patchValue({ cover: file });
    this.selectedCover.set(file.name);
  }

  // ====================== SUBMIT ======================
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
    formData.append('company', this.form.value.company);
    formData.append('location', this.form.value.location || '');
    formData.append('deadline', this.form.value.deadline || '');
    formData.append('description', this.form.value.description || '');
    formData.append('file', this.form.value.file);

    if (this.form.value.cover) {
      formData.append('cover', this.form.value.cover);
    }

    this.offresService.addOffre(formData).subscribe({
      next: () => {
        this.success.set('Offre d\'emploi publiée avec succès !');
        this.loading.set(false);
        this.resetForm();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message || 'Erreur lors de la publication.');
      }
    });
  }

  // ====================== RESET ======================
  resetForm(): void {
    this.form.reset();
    this.selectedPdf.set(null);
    this.selectedCover.set(null);

    const fileInput = document.getElementById('file') as HTMLInputElement;
    const coverInput = document.getElementById('cover') as HTMLInputElement;

    if (fileInput) fileInput.value = '';
    if (coverInput) coverInput.value = '';
  }

  // ====================== VALIDATION ======================
  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}