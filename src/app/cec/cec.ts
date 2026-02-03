import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cec',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cec.html',
  styleUrl: './cec.css',
})
export class CecComponent {

  cecData = [
    {
      title: 'Cadre juridique',
      content: [
        'Décret n°2023-848 instituant le régime de couverture non contributif',
        'Destiné aux bénéficiaires du PNBSF et aux détenteurs de la CEC'
      ]
    },
    {
      title: 'Enregistrement et immatriculation',
      content: [
        'Enrôlement automatique à la CSU',
        'Basé sur les bases de données de la DGPSN et de la DGAS'
      ]
    },
    {
      title: 'Adhésion et cotisation',
      content: [
        'Frais d’adhésion entièrement pris en charge par l’État',
        'Aucune contribution financière demandée aux bénéficiaires'
      ]
    },
    {
      title: 'Prise en charge des soins',
      content: [
        'Gratuité des soins AMU dans les postes et centres de santé',
        'Ticket modérateur de 20 % au niveau des EPS',
        'Possibilité d’exonération du ticket modérateur pendant 3 mois'
      ]
    },
    {
      title: 'Prestations soumises à accord préalable',
      content: [
        'IRM, appareillages, prothèses, orthèses et lunettes',
        'Actes opératoires hors césarienne',
        'Accord préalable requis de la SEN-CSU'
      ]
    }
  ];

}
