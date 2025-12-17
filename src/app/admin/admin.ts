import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
})
export class AdminComponent {

  constructor(private router: Router) {}

  goToAddNews() {
    this.router.navigate(['/admin/news']);
  }
}
