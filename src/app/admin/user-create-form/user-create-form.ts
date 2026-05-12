import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { UsersService } from 'app/services/user.service';

@Component({
  selector: 'app-user-create-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create-form.html',
  styleUrls: ['./user-create-form.css']
})
export class UserCreateForm {

  form: FormGroup;

  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private userService: UsersService
  ) {

    this.form = this.fb.group(
      {
        fullname: ['', Validators.required],

        email: ['', [
          Validators.required,
          Validators.email
        ]],

        password: ['', [
          Validators.required,
          Validators.minLength(4)
        ]],

        confirmPassword: ['', Validators.required],

        role: ['admin', Validators.required],

        is_active: [true]
      },
      {
        validators: this.passwordsMatchValidator
      }
    );

  }

  passwordsMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordsMismatch: true };
    }

    return null;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);

    return !!(
      control &&
      control.invalid &&
      control.touched
    );
  }

  passwordsDoNotMatch(): boolean {
    return !!(
      this.form.hasError('passwordsMismatch') &&
      this.form.get('confirmPassword')?.touched
    );
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    // retirer confirmPassword avant envoi API
    const { confirmPassword, ...payload } = this.form.value;

    this.userService.create(payload).subscribe({

      next: () => {

        this.loading.set(false);

        this.success.set(
          'Utilisateur créé avec succès'
        );

        this.form.reset({
          role: 'admin',
          is_active: true
        });

      },

      error: (err) => {

        this.loading.set(false);

        this.error.set(
          err.message || 'Erreur lors de la création'
        );

      }
    });

  }

}