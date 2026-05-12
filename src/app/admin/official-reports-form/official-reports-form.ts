import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OfficialReportsService } from '../../services/official-reports.service';

@Component({
  selector: 'app-official-reports-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './official-reports-form.html'
})
export class OfficialReportsForm {
  form: FormGroup;
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  selectedPdf = signal<string | null>(null);
  selectedCover = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private reportsService: OfficialReportsService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      report_type: [''],
      file: [null, Validators.required],
      cover: [null]
    });
  }

  onPdfChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      this.error.set('Veuillez sélectionner un fichier PDF');
      return;
    }
    this.form.patchValue({ file });
    this.selectedPdf.set(file.name);
    this.error.set(null);
  }

  onCoverChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
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
    const formData = new FormData();
    formData.append('title', this.form.value.title);
    formData.append('description', this.form.value.description || '');
    formData.append('report_type', this.form.value.report_type || '');
    formData.append('file', this.form.value.file);
    if (this.form.value.cover) formData.append('cover', this.form.value.cover);

    this.reportsService.addReport(formData).subscribe({
      next: () => {
        this.success.set('Rapport ajouté avec succès !');
        this.loading.set(false);
        this.resetForm();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message || 'Erreur lors de l’ajout');
      }
    });
  }

  resetForm() {
    this.form.reset();
    this.selectedPdf.set(null);
    this.selectedCover.set(null);
    // Reset inputs
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}