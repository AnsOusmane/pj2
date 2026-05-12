import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImagesBankService } from '../../services/images-bank.service';

@Component({
  selector: 'app-images-bank-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './images-bank-form.html',
  styleUrls: ['./images-bank-form.css']
})
export class ImagesBankForm {
  form: FormGroup;
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  selectedImage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private imagesBankService: ImagesBankService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [''],
      image: [null, Validators.required]
    });
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.form.patchValue({ image: file });
    this.selectedImage.set(file.name);
    this.error.set(null);
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
    formData.append('category', this.form.value.category || '');
    formData.append('image', this.form.value.image);

    this.imagesBankService.addImage(formData).subscribe({
      next: () => {
        this.success.set('Image ajoutée avec succès !');
        this.loading.set(false);
        this.form.reset();
        this.selectedImage.set(null);
        (document.getElementById('image') as HTMLInputElement).value = '';
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message || 'Erreur lors de l’ajout');
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}