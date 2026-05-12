// src/app/testimonials/testimonials-form.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestimonialsService } from '../../services/testimonials.service';

@Component({
  selector: 'app-testimonials-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './testimonials-form.html',
  styleUrls: ['./testimonials-form.css']
})
export class TestimonialsFormComponent {

  form: FormGroup;

  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private testimonialsService: TestimonialsService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      location: [''],
      photoUrl: [''],
      quote: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.success.set(null);
    this.error.set(null);

    const payload = {
      name: this.form.value.name,
      location: this.form.value.location,
      photo_url: this.form.value.photoUrl,
      quote: this.form.value.quote
    };

    this.testimonialsService.createTestimonial(payload).subscribe({
      next: () => {
        this.success.set('Témoignage ajouté avec succès !');
        this.resetForm();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors de l’ajout.');
        this.loading.set(false);
      }
    });
  }

  private resetForm(): void {
    this.loading.set(false);
    this.form.reset();
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}