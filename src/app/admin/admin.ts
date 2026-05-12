import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
})
export class AdminComponent implements OnInit {

  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // ====================== NAVIGATION ======================
  goToAddNews() {
    this.router.navigate(['/admin/newsletters-form']);
  }

  goToAddRapportsOff() {
    this.router.navigate(['/admin/official-reports-form']);
  }

  goToAddDecret() {
    this.router.navigate(['/admin/decrets-form']);
  }

  goToAddCom() {
    this.router.navigate(['/admin/communiques-form']);
  }

  goToAddImg() {
    this.router.navigate(['/admin/images-bank-form']);
  }

  goToAddGuides() {
    this.router.navigate(['/admin/guides-form']);
  }

  goToAddOffresEmploi() {
    this.router.navigate(['/admin/offres-emploi-form']);
  }

  // ====================== DÉCONNEXION ======================
  logout(): void {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}