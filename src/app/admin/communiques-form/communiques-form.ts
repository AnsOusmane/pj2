import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommuniqueService } from '../../services/communiques.service';  // ajuste le chemin si nécessaire

@Component({
  selector: 'app-communique-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './communiques-form.html',
  // styleUrls: ['./communiques-form.component.css']   // décommente si tu as un fichier css
})
export class CommuniqueFormComponent {
  form: FormGroup;
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(false);
  selectedFileName = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private communiqueService: CommuniqueService
  ) {
    this.form = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(250)
        ]
      ],
      description: [''],
      file: [null, Validators.required]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Vérification basique du type et de la taille
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        this.error.set('Format non autorisé. PDF, JPG ou PNG uniquement.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10 Mo max
        this.error.set('Le fichier est trop volumineux (max 10 Mo).');
        return;
      }

      this.form.patchValue({ file });
      this.form.get('file')?.markAsTouched();
      this.selectedFileName.set(file.name);
      this.error.set(null); // reset erreur précédente
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

    // Création de l'objet conforme à l'interface Communique attendue par le service
    const communiqueData = {
      title: this.form.value.title.trim(),
      description: this.form.value.description?.trim() || undefined,
      file: this.form.value.file as File
    };

    try {
      // Appel au service avec l'objet (pas FormData)
      await this.communiqueService.addCommunique(communiqueData).toPromise();

      this.success.set('Communiqué ajouté avec succès !');

      // Reset complet
      this.form.reset();
      this.selectedFileName.set(null);

      // Reset manuel du champ fichier (important)
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err: any) {
      console.error('Erreur ajout communiqué:', err);

      // Gestion d'erreur plus fine
      const errorMsg = err.error?.message ||
                       err.message ||
                       'Une erreur est survenue lors de l\'enregistrement';

      this.error.set(errorMsg);
    } finally {
      this.loading.set(false);
    }
  }

  // Helper utile pour le template (ex: [class.border-red-500]="isInvalid('title')")
  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.touched && control?.invalid);
  }
}