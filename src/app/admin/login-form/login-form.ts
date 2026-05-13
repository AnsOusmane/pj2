import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.css']
})
export class LoginForm implements OnInit {

  form: FormGroup;

  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);

  private returnUrl: string = '/admin';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    // ==========================
    // FORMULAIRE
    // ==========================
    this.form = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(4)
        ]
      ]
    });
  }

  // ==========================
  // INIT
  // ==========================
  ngOnInit(): void {

    // Si déjà connecté → redirection
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin']);
      return;
    }

    // URL de retour après login
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/admin';
    });
  }

  // ==========================
  // AFFICHER / MASQUER MDP
  // ==========================
  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  // ==========================
  // SUBMIT LOGIN
  // ==========================
  onSubmit(): void {

    // Reset messages
    this.error.set(null);
    this.success.set(null);

    // Validation
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Loading ON
    this.loading.set(true);

    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({

      // ==========================
      // SUCCESS
      // ==========================
      next: (response) => {

        // Stop loading
        this.loading.set(false);

        // Message succès
        this.success.set('Connexion réussie ! Redirection...');

        // Redirection
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1000);
      },

      // ==========================
      // ERROR
      // ==========================
      error: (err) => {

        console.error('Erreur login :', err);

        // Stop loading
        this.loading.set(false);

        // Message erreur
        this.error.set(
          err?.error?.message ||
          err?.message ||
          'Email ou mot de passe incorrect'
        );
      }
    });
  }

  // ==========================
  // VALIDATION CHAMPS
  // ==========================
  isInvalid(field: string): boolean {

    const control = this.form.get(field);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  // ==========================
  // GETTERS
  // ==========================
  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }
}