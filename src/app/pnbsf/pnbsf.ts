import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pnbsf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pnbsf.html',
  styleUrl: './pnbsf.css',
})
export class PnbsfComponent {

  pnbsfData = [
    {
    
      title: 'Bénéficiaires du PNBSF',
      content: [
        'Ménages identifiés comme vulnérables par l’État',
        'Inscrits dans la base nationale du Programme de Bourses de Sécurité Familiale'
      ]
    },
    {
      title: 'Enrôlement à la CMU',
      content: [
        'Immatriculation automatique à la Couverture Sanitaire Universelle',
        'Basée sur les données officielles de la DGPSN'
      ]
    },
    {
      title: 'Adhésion et cotisation',
      content: [
        'Aucun frais d’adhésion à payer',
        'Cotisations entièrement subventionnées par l’État'
      ]
    },
    {
      title: 'Prise en charge des soins',
      content: [
        'Accès gratuit aux soins couverts par l’AMU dans les postes et centres de santé',
        'Participation de 20 % (ticket modérateur) au niveau des EPS',
        'Possibilité d’exonération temporaire du ticket modérateur'
      ]
    },
    {
      title: 'Soins soumis à autorisation',
      content: [
        'Certaines prestations spécialisées hors paquet AMU',
        'Prise en charge conditionnée à l’accord préalable de la SEN-CSU'
      ]
    }
  ];

}
