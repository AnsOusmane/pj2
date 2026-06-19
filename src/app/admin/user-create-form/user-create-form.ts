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
import { AuthService } from 'app/services/auth.service';
import { ADMIN_MENU } from 'app/admin/admin-menu.config';

@Component({
  selector: 'app-user-create-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create-form.html',
  styleUrls: ['./user-create-form.css']
})
export class UserCreateForm {

  form: FormGroup;

  // Groupes du menu admin (entrées assignables uniquement) pour les cases à cocher.
  menuGroups = ADMIN_MENU
    .map((g) => ({ title: g.title, items: g.items.filter((i) => !i.adminOnly && !i.comingSoon) }))
    .filter((g) => g.items.length > 0);

  selectedPermissions = signal<Set<string>>(new Set<string>());

  // Seul un admin peut créer un utilisateur : sinon on n'affiche pas le formulaire.
  isAdmin = false;

  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private authService: AuthService
  ) {

    this.isAdmin = this.authService.isAdmin();

    this.form = this.fb.group(
      {
        fullname: ['', Validators.required],

        email: ['', [
          Validators.required,
          Validators.email
        ]],

        password: ['', [
          Validators.required,
          Validators.minLength(8)
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

  get isAdminRole(): boolean {
    return this.form.get('role')?.value === 'admin';
  }

  isPermissionSelected(key: string): boolean {
    return this.selectedPermissions().has(key);
  }

  togglePermission(key: string, checked: boolean): void {
    this.selectedPermissions.update((set) => {
      const next = new Set(set);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
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
    const { confirmPassword, ...rest } = this.form.value;

    // Un admin a accès à tout : pas de permissions spécifiques à envoyer.
    const payload = {
      ...rest,
      permissions: this.isAdminRole ? [] : Array.from(this.selectedPermissions())
    };

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
        this.selectedPermissions.set(new Set<string>());

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