import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { firstAccessibleRoute } from '../admin-menu.config';

// Page d'atterrissage de /admin : redirige chaque utilisateur vers la première
// section à laquelle il a accès (un admin va vers la gestion des utilisateurs).
// Si l'utilisateur n'a accès à aucune section, on affiche un message.
@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="noAccess"
         class="max-w-2xl mx-auto bg-white rounded-2xl shadow p-10 text-center">
      <p class="text-4xl mb-3">⛔</p>
      <h2 class="text-xl font-semibold text-gray-800">Aucune section accessible</h2>
      <p class="text-gray-500 mt-2">
        Votre compte n'a accès à aucune section pour le moment.
        Contactez un administrateur.
      </p>
    </div>
  `,
})
export class AdminHomeComponent implements OnInit {

  noAccess = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    const route = firstAccessibleRoute(user?.role, user?.permissions);

    if (route) {
      this.router.navigate(['/admin', route]);
    } else {
      this.noAccess = true;
    }
  }
}
