import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {

  constructor(private router: Router) {}

  // mêmes événements que dans header
  @Output() openAboutTimeline = new EventEmitter<void>();
  @Output() openMissionsvision = new EventEmitter<void>();
  @Output() openOrganigramme = new EventEmitter<void>();
  @Output() openDonation = new EventEmitter<void>();



  //navigation
  goToAppelsOffre() { this.router.navigate(['/appels-offre']); }
  goToRapports() { this.router.navigate(['/rapports-officiels']); }
  goToGuide() { this.router.navigate(['/guide']); }
  goToDecret() { this.router.navigate(['/decrets']); }
  goToManuel() { this.router.navigate(['/manuel-d-audit']); }
  goToMedia() { this.router.navigate(['/media']); }
  goToBankImg() { this.router.navigate(['/banque-images']); }
  goToComuPresse() { this.router.navigate(['/communiques-presse']); }
  goToAssuranceMaladie() { this.router.navigate(['/assurance-maladie']); }
  goToZero5ans() { this.router.navigate(['/zero-cinq-ans']); }
  goToDialyse() { this.router.navigate(['/dialyse']); }
  goToPlanSesame() { this.router.navigate(['/plan-sesame']); }
  goToCesarienne() { this.router.navigate(['/cesarienne']); }
  goToContact() { this.router.navigate(['/contact']); }
  goToSr() { this.router.navigate(['/nos-services-regionaux']); }
    goToMaintenance() {
    this.router.navigate(['/maintenance']);
  }
}
