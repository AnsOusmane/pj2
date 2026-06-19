import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { ADMIN_MENU, AdminMenuGroup, AdminMenuItem } from './admin-menu.config';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
})
export class AdminComponent implements OnInit {

  currentUser: User | null = null;

  // Menu filtré selon le rôle / les permissions de l'utilisateur connecté.
  visibleMenu: AdminMenuGroup[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.visibleMenu = this.buildVisibleMenu(user);
    });
  }

  private buildVisibleMenu(user: User | null): AdminMenuGroup[] {
    const isAdmin = user?.role === 'admin';
    const permissions = user?.permissions || [];

    const canSee = (item: AdminMenuItem): boolean => {
      if (isAdmin) return true;
      if (item.adminOnly) return false;
      return permissions.includes(item.key);
    };

    return ADMIN_MENU
      .map(group => ({ ...group, items: group.items.filter(canSee) }))
      .filter(group => group.items.length > 0);
  }

  // ====================== DÉCONNEXION ======================
  logout(): void {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}