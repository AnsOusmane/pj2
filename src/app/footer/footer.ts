import { ChangeDetectionStrategy, Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {
  // On enlève tout le listener NavigationEnd et le shouldScrollTop (plus besoin)

  /** Année courante pour le copyright. */
  readonly currentYear = new Date().getFullYear();

  @Output() openAboutTimeline = new EventEmitter<void>();
  @Output() openMissionsvision = new EventEmitter<void>();
  @Output() openOrganigramme = new EventEmitter<void>();
  @Output() openDonation = new EventEmitter<void>();
  /** Prod : la section Appels d'offres est en pause → on ouvre une modale d'info. */
  @Output() openAppelsOffreInfo = new EventEmitter<void>();

  /** Affiche « (en édition) » à côté du libellé tant que la section n'est pas publiée. */
  readonly appelsOffreEnabled = environment.appelsOffreEnabled;

  constructor(private router: Router) {}

  // Navigation simple (utilisée par les boutons du footer)
  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  //Navigation
  goToAppelsOffre() {
    if (environment.appelsOffreEnabled) {
      this.router.navigate(['/appels-offre']);
    } else {
      this.openAppelsOffreInfo.emit();
    }
  }
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
