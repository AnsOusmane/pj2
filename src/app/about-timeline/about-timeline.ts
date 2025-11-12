import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TimelineEvent {
  year: number;
  text: string;
}

@Component({
  selector: 'app-about-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-timeline.html',
  styleUrls: ['./about-timeline.css']
})
export class AboutTimelineComponent {
  events: TimelineEvent[] = [
    { year: 2001, text: "La Constitution sénégalaise consacre la santé comme droit fondamental." },
    { year: 2013, text: "Création du Plan stratégique 2013-2017 et du code des collectivités locales." },
    { year: 2015, text: "Décret de création de l’Agence de la Couverture Maladie Universelle (ACMU)." },
    { year: 2016, text: "Actualisation de la Stratégie nationale de Protection sociale." },
    { year: 2017, text: "Adoption du Plan stratégique 2017-2021 et du contrat de performance." },
    { year: 2019, text: "Validation du Plan national de développement sanitaire et social 2019-2028." },
    { year: 2023, text: "Adoption du Plan stratégique 2023-2027 et des décrets sur la prise en charge." },
    { year: 2024, text: "Création de la SEN-CSU et nouveau référentiel de politique 'Sénégal 2050'." }
  ];
}
