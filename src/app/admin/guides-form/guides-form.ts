import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { GuidesService } from 'app/services/guides.service';

@Component({
  selector: 'app-guides-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './guides-form.html',
  styleUrls: ['./guides-form.css']
})
export class GuidesForm {
  form: FormGroup;
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  selectedPdf = signal<string | null>(null);
  selectedCover = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private guidesService: GuidesService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      file: [null, Validators.required],
      cover: [null]
    });
  }

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

  onCoverChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.form.patchValue({ cover: file });
    this.selectedCover.set(file.name);
  }

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
    formData.append('file', this.form.value.file);
    if (this.form.value.cover) {
      formData.append('cover', this.form.value.cover);
    }

    this.guidesService.addGuide(formData).subscribe({
      next: () => {
        this.success.set('Guide ajouté avec succès !');
        this.loading.set(false);
        this.resetForm();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message || 'Erreur lors de l’ajout.');
      }
    });
  }

  resetForm(): void {
    this.form.reset();
    this.selectedPdf.set(null);
    this.selectedCover.set(null);
    const fileInput = document.getElementById('file') as HTMLInputElement;
    const coverInput = document.getElementById('cover') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    if (coverInput) coverInput.value = '';
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}