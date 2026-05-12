import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { VideosService } from '../../services/videos.service';

@Component({
  selector: 'app-videos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './videos-form.html',
  styleUrls: ['./videos-form.css']
})
export class VideosFormComponent {

  form: FormGroup;

  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  selectedThumbnail = signal<string | null>(null);
  selectedVideo = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private videosService: VideosService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      embed_url: ['', [Validators.pattern(/youtube\.com|youtu\.be/)]], // optionnel
      duration: [''],
      thumbnail: [null],
      video: [null]
    });
  }

  // ========================
  // THUMBNAIL IMAGE
  // ========================
  onThumbnailChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.error.set('Veuillez sélectionner une image valide (jpg, png, webp).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error.set('L’image ne doit pas dépasser 5 Mo.');
      return;
    }

    this.form.patchValue({ thumbnail: file });
    this.selectedThumbnail.set(file.name);
    this.error.set(null);
  }

  // ========================
  // VIDEO FILE
  // ========================
  onVideoChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('video/')) {
      this.error.set('Veuillez sélectionner une vidéo valide.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      this.error.set('La vidéo ne doit pas dépasser 50 Mo.');
      return;
    }

    this.form.patchValue({ video: file });
    this.selectedVideo.set(file.name);
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

    // ✅ YouTube OU vidéo obligatoire
    if (!this.form.value.embed_url && !this.form.value.video) {
      this.error.set('Veuillez ajouter un lien YouTube OU une vidéo.');
      this.loading.set(false);
      return;
    }

    const formData = new FormData();

    formData.append('title', this.form.value.title);
    formData.append('description', this.form.value.description || '');

    if (this.form.value.embed_url) {
      formData.append('embed_url', this.form.value.embed_url);
    }

    if (this.form.value.duration) {
      formData.append('duration', this.form.value.duration);
    }

    if (this.form.value.thumbnail) {
      formData.append('thumbnail', this.form.value.thumbnail);
    }

    if (this.form.value.video) {
      formData.append('video', this.form.value.video);
    }

    this.videosService.addVideo(formData).subscribe({
      next: () => {
        this.success.set('Vidéo ajoutée avec succès !');
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.message || 'Erreur lors de l’ajout de la vidéo.');
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

    this.selectedThumbnail.set(null);
    this.selectedVideo.set(null);

    const thumbnailInput = document.getElementById('thumbnail') as HTMLInputElement;
    if (thumbnailInput) thumbnailInput.value = '';

    const videoInput = document.getElementById('video') as HTMLInputElement;
    if (videoInput) videoInput.value = '';
  }

  // ========================
  // VALIDATION HELPER
  // ========================
  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}