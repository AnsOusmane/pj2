import { Component, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DecretsService } from '../../services/decrets.service';

@Component({
  selector: 'app-decrets-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './decrets-form.html',
  styleUrls: ['./decrets-form.css'] // optionnel
})
export class DecretsFormComponent {
  form: FormGroup;
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  selectedFileName = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private decretsService: DecretsService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]],
      description: [''],
      file: [null, Validators.required]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowed.includes(file.type)) {
        this.error.set('PDF, JPG ou PNG uniquement.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.error.set('Fichier trop volumineux (max 10 Mo).');
        return;
      }

      this.form.patchValue({ file });
      this.selectedFileName.set(file.name);
      this.form.get('file')?.markAsTouched();
      this.error.set(null);
    }
  }

  async onSubmit(): Promise<void> {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading.set(true);
  this.success.set(null);
  this.error.set(null);

  // Construire FormData ici
  const formData = new FormData();
  formData.append('title', this.form.value.title.trim());
  if (this.form.value.description?.trim()) {
    formData.append('description', this.form.value.description.trim());
  }
  formData.append('file', this.form.value.file);

  try {
    await this.decretsService.addDecret(formData).toPromise();
    this.success.set('Décret ajouté avec succès !');
    this.form.reset();
    this.selectedFileName.set(null);
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  } catch (err: any) {
    this.error.set(err.message || 'Erreur lors de l’ajout');
    console.error(err);
  } finally {
    this.loading.set(false);
  }
}

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.touched && control?.invalid);
  }
}