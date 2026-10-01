import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActualitesService } from '../../services/actualites.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-actualites-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './actualites-form.html',
  styleUrls: ['./actualites-form.css']
})
export class ActualitesFormComponent {

  form: FormGroup;

  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  selectedFile: File | null = null;
  selectedVideoFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private actualitesService: ActualitesService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: [''],
      video_url: [''],
      link: ['']
    });
  }

  // 📌 sélection du fichier image
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // 📌 sélection du fichier vidéo (alternative au lien YouTube)
  onVideoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedVideoFile = input.files[0];
    }
  }

  // 📌 submit
  onSubmit(): void {
    if (this.form.invalid || !this.selectedFile) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez remplir tous les champs obligatoires et choisir une image.');
      return;
    }

    this.loading.set(true);
    this.success.set(null);
    this.error.set(null);

    const formData = new FormData();

    formData.append('title', this.form.value.title);
    formData.append('content', this.form.value.content || '');
    formData.append('link', this.form.value.link || '');
    formData.append('video_url', this.form.value.video_url || '');
    formData.append('thumbnail', this.selectedFile); // 👈 fichier image
    if (this.selectedVideoFile) {
      formData.append('video', this.selectedVideoFile); // 👈 fichier vidéo (optionnel)
    }

    this.actualitesService.createActualiteWithUpload(formData).subscribe({
      next: () => {
        this.success.set('Actualité publiée avec succès !');
        this.resetForm();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors de la publication.');
        this.loading.set(false);
      }
    });
  }

  // 📌 reset form
  private resetForm(): void {
    this.loading.set(false);
    this.form.reset();
    this.selectedFile = null;
    this.selectedVideoFile = null;
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}