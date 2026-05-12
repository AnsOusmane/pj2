import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { UpdateUserDto, User, UsersService } from 'app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.css']
})
export class UserEditForm implements OnInit {

  form: FormGroup;
  userId!: number;

  success = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(true);
  isSubmitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.userId) {
      this.error.set('ID utilisateur invalide');
      this.loading.set(false);
      return;
    }
    this.loadUser();
  }

  private loadUser(): void {
    this.usersService.getAll().subscribe({
      next: (users: User[]) => {
        const user = users.find(u => u.id === this.userId);
        if (user) {
          this.form.patchValue({
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            is_active: user.is_active
          });
        } else {
          this.error.set('Utilisateur non trouvé');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Impossible de charger les données de l’utilisateur');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const updateData: UpdateUserDto = this.form.value;

    this.usersService.update(this.userId, updateData).subscribe({
      next: () => {
        this.success.set('Utilisateur modifié avec succès !');
        setTimeout(() => {
          this.router.navigate(['/admin/users']);
        }, 1500);
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur lors de la modification');
        this.isSubmitting.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}