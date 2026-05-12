import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.css']
})
export class LoginForm {

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
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    // Récupère le returnUrl depuis les query params
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/admin';
    });
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.success.set('Connexion réussie ! Redirection...');
        
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1200);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Email ou mot de passe incorrect');
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}