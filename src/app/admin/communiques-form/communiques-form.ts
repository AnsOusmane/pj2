// src/app/admin/communique-form/communique-form.component.ts
import { Component, signal } from '@angular/core';
import { 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup, 
  Validators 
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommuniqueService } from '../../services/communique.service';

@Component({
  selector: 'app-communique-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './communiques-form.html',
  styleUrls: ['./communiques-form.css'] // optionnel
})
export class CommuniqueFormComponent {
  form: FormGroup;
  success = signal<string | null>(null);
  error   = signal<string | null>(null);
  loading = signal(false);

  selectedFileName = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private communiqueService: CommuniqueService
  ) {
    this.form = this.fb.group({
      title:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]],
      description: [''],
      file:        [null, Validators.required]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.form.patchValue({ file });
      this.selectedFileName.set(file.name);
      this.form.get('file')?.markAsTouched();
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

    const value = this.form.value;

    try {
      await this.communiqueService.addCommunique({
        title: value.title,
        description: value.description || undefined,
        file: value.file
      }).toPromise();

      this.success.set('Communiqué publié avec succès ✓');
      this.form.reset();
      this.selectedFileName.set(null);
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      this.error.set(err.message || 'Échec de l’enregistrement');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  get f() { return this.form.controls; }
}