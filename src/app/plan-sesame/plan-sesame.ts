import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SesameItem {
  title: string;
  icon: string;
  color: string;     // ex: "green-600"
  content: string[];
}

@Component({
  selector: 'app-plan-sesame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-sesame.html'
})
export class PlanSesameComponent {

  sesameData: SesameItem[] = [

    {
      title: "Conditions d'éligibilité",
      icon: "🪪",
      color: "green-600",
      content: [
        "✔ Être âgé de 60 ans ou plus",
        "✔ Être de nationalité sénégalaise",
        "✔ Avoir une carte d’identité numérisée",
        "✔ Respecter la pyramide sanitaire"
      ]
    },

    {
      title: "Structures concernées",
      icon: "🏥",
      color: "blue-600",
      content: [
        "✔ Postes de santé (1ère intention)",
        "✔ Centres de santé",
        "✔ Hôpitaux de niveau 1, 2 et 3 sur référence",
        "✔ Établissements publics non hospitaliers"
      ]
    },

    {
      title: "Soins gratuits",
      icon: "💚",
      color: "emerald-600",
      content: [
        "✔ Consultations",
        "✔ Médicaments essentiels",
        "✔ Examens complémentaires",
        "✔ Actes médico-chirurgicaux",
        "✔ Hospitalisations"
      ]
    },

    {
      title: "Particularités de prise en charge",
      icon: "📌",
      color: "orange-600",
      content: [
        "✔ 100% de prise en charge pour PAF",
        "✔ Complémentaire si déjà IPRES / FNR",
        "✔ Respect du système de référence"
      ]
    },

    {
      title: "Actes exclus",
      icon: "⛔",
      color: "red-600",
      content: [
        "❌ Prothèses (dentaires, hanches, etc.)",
        "❌ Pacemakers",
        "❌ Chirurgie esthétique",
        "❌ IRM et Scanners (hors urgences)",
        "❌ Soins non essentiels"
      ]
    },

  ];

}
