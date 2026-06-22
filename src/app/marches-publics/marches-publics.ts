import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BackButtonComponent } from 'app/shared/back-button/back-button';

interface Rubrique {
  titre: string;
  description: string;
  lien?: string;       // défini = section active
  bientot?: boolean;   // true = « à venir »
}

@Component({
  selector: 'app-marches-publics',
  standalone: true,
  imports: [CommonModule, RouterModule, BackButtonComponent],
  templateUrl: './marches-publics.html',
  styleUrls: ['./marches-publics.css']
})
export class MarchesPublicsComponent {

  rubriques: Rubrique[] = [
    {
      titre: 'Plan de Passation des Marchés',
      description: 'Consultez le PPM publié de l’Agence : objet, mode de passation, type et calendrier prévisionnel.',
      lien: '/appels-offre/ppm'
    },
    {
      titre: 'Appels d’offres',
      description: 'Avis d’appel d’offres en cours : référence, date limite de dépôt et téléchargement de l’avis.',
      lien: '/appels-offre/avis'
    },
    {
      titre: 'Avis d’attribution',
      description: 'Résultats d’attribution des marchés : marché concerné, attributaire et montant.',
      lien: '/appels-offre/attributions'
    },
    {
      titre: "Demande d'agrément",
      description: 'Déposez en ligne votre demande d’agrément (manifestation d’intérêt).',
      lien: '/appels-offre/fournisseurs'
    }
  ];
}
