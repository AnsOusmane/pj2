import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DialyseItem {
  title: string;
  icon: string;
  content: string[];
}

@Component({
  selector: 'app-dialyse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialyse.html',
})
export class DialyseComponent {

  dialyseData: DialyseItem[] = [
    {
      title: "Éligibilité",
      icon: "🩺",
      content: [
        "Être sénégalais et souffrir d’insuffisance rénale chronique",
        "Prescription obligatoire d’un néphrologue"
      ]
    },
    {
      title: "Prise en charge gratuite",
      icon: "💚",
      content: [
        "Séances d’hémodialyse totalement gratuites",
        "Possibilité de dialyse péritonéale gratuitement",
      ]
    },
    {
      title: "Prise en charge en structures privées",
      icon: "🏥",
      content: [
        "Séances d’hémodialyse à tarif réduit dans les cliniques privées",
        "Valable uniquement dans les structures privées conventionnées CMU",
        "Selon la disponibilité des places"
      ]
    },
    {
      title: "Procédure d’accès",
      icon: "📋",
      content: [
        "S’inscrire sur la liste d’attente d’un centre de dialyse public",
        "Suivre la pyramide sanitaire et les orientations des spécialistes"
      ]
    },
    {
      title: "Actes gratuits en structure publique",
      icon: "✔️",
      content: [
        "Séance d’hémodialyse",
        "Kit d’hémodialyse ou kit de dialyse péritonéale"
      ]
    }
  ];
}
