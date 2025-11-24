import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Section {
  id: string;
  title: string;
  icon: string;
  content: string[];
}

@Component({
  selector: 'app-assurance-maladie',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assurance-maladie.html',
})
export class AssuranceMaladieComponent {

  openSection: string | null = null;

  sections: Section[] = [
    {
      id: 'mutuelle',
      title: 'Mutuelles de santé (Poste de santé)',
      icon: '🏥',
      content: [
        "Les mutuelles sont des associations à but non lucratif fondées sur la solidarité.",
        "Elles financent la prise en charge des risques sanitaires via les cotisations.",
        "Conditions d’adhésion : avoir 21 ans, payer le droit d’adhésion, fournir 2 photos, respecter les statuts.",
        "La mutuelle prend en charge : 80% des soins publics & médicaments génériques, 50% en pharmacies privées.",
        "Obligations : être à jour des cotisations, période d’observation, présenter livret cacheté.",
        "Services : consultations, préventif, hospitalisations, accouchements, examens, soins spécialisés, évacuations, médicaments.",
        "Cotisations : 7000 FCFA/personne/an. Subvention de 50% → 3500 FCFA.",
        "Indigents : gratuité totale (100%)."
      ]
    },
    {
      id: 'csu-eleve',
      title: 'CSU Élèves',
      icon: '🎒',
      content: [
        "Régime d’assurance basé sur les mutuelles, prenant en charge 80% des dépenses de santé des élèves.",
        "Exemple : sur 2500 F CFA, 2000 F payés par la mutuelle, 500 F restent à payer.",
        "Médicaments privés : 50% pris en charge.",
        "Inscription : dans l’établissement scolaire de l’enfant.",
        "Cotisation : 1000 F CFA/an + 3500 F ajoutés par l'État.",
        "Droits : postes & centres de santé (tous services), à l’hôpital : consultations & génériques.",
        "Option premium : 3500 F/an + 3500 F de l'État → couverture totale hôpitaux."
      ]
    },
    {
      id: 'csu-daara',
      title: 'CSU Daara',
      icon: '📘',
      content: [
        "Une assurance maladie dédiée aux daaras du Sénégal.",
        "Protection médicale des apprenants et encadreurs.",
        "Accès aux soins dans les structures de santé publiques.",
        "Règlementation alignée sur les mutuelles de santé."
      ]
    }
  ];

  toggleSection(id: string) {
    this.openSection = this.openSection === id ? null : id;
  }
}
