import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UsersService, User } from 'app/services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css']
})
export class UsersListComponent implements OnInit {

  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err.message || 'Impossible de charger les utilisateurs'
        );
        this.loading.set(false);
      }
    });
  }

  deleteUser(id: number): void {
    if (
      confirm(
        'Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.'
      )
    ) {
      this.usersService.delete(id).subscribe({
        next: () => {
          this.users.set(
            this.users().filter(u => u.id !== id)
          );

          alert('Utilisateur supprimé avec succès');
        },
        error: (err) => {
          alert(err.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}