import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActualitesService } from '../../services/actualites.service';
import { IconComponent } from '../../shared/icon/icon';

interface GalleryImage {
  file: File;
  previewUrl: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-actualites-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './actualites-form.html',
  styleUrls: ['./actualites-form.css']
})
export class ActualitesFormComponent {

  form: FormGroup;

  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  // Couverture (obligatoire, affichée dans les listes du site public).
  coverFile: File | null = null;
  coverPreviewUrl: string | null = null;

  // Galerie façon Facebook : plusieurs images, plusieurs vidéos (fichier ou lien YouTube).
  galleryImages: GalleryImage[] = [];
  galleryVideoFiles: File[] = [];
  youtubeLinks: string[] = [''];

  constructor(
    private fb: FormBuilder,
    private actualitesService: ActualitesService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: [''],
      link: ['']
    });
  }

  // ====================== COUVERTURE ======================
  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.coverFile = input.files[0];
      if (this.coverPreviewUrl) URL.revokeObjectURL(this.coverPreviewUrl);
      this.coverPreviewUrl = URL.createObjectURL(this.coverFile);
    }
  }

  removeCover(): void {
    if (this.coverPreviewUrl) URL.revokeObjectURL(this.coverPreviewUrl);
    this.coverFile = null;
    this.coverPreviewUrl = null;
  }

  // ====================== GALERIE IMAGES ======================
  onGalleryImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    for (const file of Array.from(input.files)) {
      this.galleryImages.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    input.value = '';
  }

  removeGalleryImage(index: number): void {
    URL.revokeObjectURL(this.galleryImages[index].previewUrl);
    this.galleryImages.splice(index, 1);
  }

  // ====================== GALERIE VIDÉOS (fichiers) ======================
  onGalleryVideosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.galleryVideoFiles.push(...Array.from(input.files));
    input.value = '';
  }

  removeGalleryVideo(index: number): void {
    this.galleryVideoFiles.splice(index, 1);
  }

  // ====================== LIENS YOUTUBE (plusieurs) ======================
  addYoutubeLink(): void {
    this.youtubeLinks.push('');
  }

  removeYoutubeLink(index: number): void {
    this.youtubeLinks.splice(index, 1);
    if (this.youtubeLinks.length === 0) this.youtubeLinks.push('');
  }

  updateYoutubeLink(index: number, value: string): void {
    this.youtubeLinks[index] = value;
  }

  // ====================== SUBMIT ======================
  onSubmit(): void {
    if (this.form.invalid || !this.coverFile) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez remplir tous les champs obligatoires et choisir une image de couverture.');
      return;
    }

    this.loading.set(true);
    this.success.set(null);
    this.error.set(null);

    const formData = new FormData();
    formData.append('title', this.form.value.title);
    formData.append('content', this.form.value.content || '');
    formData.append('link', this.form.value.link || '');
    formData.append('thumbnail', this.coverFile);

    for (const img of this.galleryImages) {
      formData.append('images', img.file);
    }
    for (const video of this.galleryVideoFiles) {
      formData.append('videos', video);
    }

    const validLinks = this.youtubeLinks.map((l) => l.trim()).filter((l) => l.length > 0);
    if (validLinks.length > 0) {
      formData.append('video_urls', JSON.stringify(validLinks));
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

  private resetForm(): void {
    this.loading.set(false);
    this.form.reset();
    this.removeCover();
    this.galleryImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    this.galleryImages = [];
    this.galleryVideoFiles = [];
    this.youtubeLinks = [''];
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
