import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CesareItem {
  title: string;
  content: string[];
}

@Component({
  selector: 'app-cesarienne',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cesarienne.html',
})
export class CesarienneComponent {

  cesarienneData: CesareItem[] = [
    {
      title: "Éligibilité",
      content: [
        "Toute femme sénégalaise en état de grossesse",
        "Cas nécessitant une césarienne : obligatoire, de nécessité ou de prudence"
      ]
    },
    {
      title: "Structures concernées",
      content: [
        "Tous les hôpitaux publics du pays",
        "Centres de santé habilités",
        "SONU (Soins Obstétricaux & Néonataux d'Urgence)",
        "Centres de santé avec bloc opératoire",
        "Structures publiques assurant des soins obstétricaux néonataux d’urgence"
      ]
    },
    {
      title: "Prise en charge gratuite",
      content: [
        "Acte opératoire de la césarienne",
        "Bilan pré-opératoire",
        "Kit de médicaments et consommables liés à l'acte",
        "Séjour hospitalier jusqu’à 5 jours",
        "Médicaments & produits nécessaires à une éventuelle réanimation",
        "Bilan médical lié à la réanimation"
      ]
    }
  ];
}
