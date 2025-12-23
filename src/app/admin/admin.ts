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
    goToAddRapportsOff() {
    this.router.navigate(['/admin/rapports-officiels-form']);
  }
     goToAddDecret() {
    this.router.navigate(['/admin/decrets-form']);
  }
         goToAddCom() {
    this.router.navigate(['/admin/communiques-form']);
  }
           goToAddImg() {
    this.router.navigate(['/admin/banque_d_image-form']);
  }
}
