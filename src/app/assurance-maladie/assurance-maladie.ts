import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assurance-maladie',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assurance-maladie.html',
})
export class AssuranceMaladieComponent {

  selected: string | null = null;

  data: any = {
    poste: `
      <h2 class="text-2xl font-bold mb-4">Poste de santé — Mutuelles de santé</h2>
      <p><strong>Définition :</strong> Les mutuelles sont des associations solidaires permettant une prise 
      en charge partielle des dépenses de santé grâce aux cotisations.</p>

      <p class="font-semibold mt-3">Conditions d’adhésion :</p>
      <ul class="list-disc ml-6">
        <li>21 ans minimum</li>
        <li>Payer le droit d’adhésion</li>
        <li>Fournir 2 photos d’identité</li>
        <li>Payer régulièrement ses cotisations</li>
      </ul>

      <p class="font-semibold mt-3">Prise en charge :</p>
      <ul class="list-disc ml-6">
        <li>80% structures publiques + médicaments génériques</li>
        <li>50% pharmacies privées</li>
      </ul>

      <p class="mt-3"><strong>Cotisation :</strong> 7000 FCFA/an → subvention 50% → 3500 FCFA.<br>
      Indigents : gratuit.</p>
    `,

    eleve: `
      <h2 class="text-2xl font-bold mb-4">CSU Élève</h2>
      <p><strong>Définition :</strong> Régime couvrant 80% des dépenses de santé des élèves.</p>
      <p><strong>Exemple :</strong> Facture 2500 F → Mutuelle 2000 F, Parent 500 F.</p>
      <p><strong>Médicaments privés :</strong> couverture 50%.</p>

      <p class="font-semibold mt-3">Inscription :</p>
      <p>Dans l’établissement scolaire de l’élève.</p>

      <p class="font-semibold mt-3">Cotisation :</p>
      <ul class="list-disc ml-6">
        <li>1000 F/an/enfant + État 3500 F</li>
        <li>Option premium : 3500 F + État 3500 F → couverture complète jusqu’à l’hôpital</li>
      </ul>
    `,

    daara: `
      <h2 class="text-2xl font-bold mb-4">CSU Daara</h2>
      <p>Une assurance dédiée aux daaras du Sénégal, garantissant une couverture santé 
      pour les apprenants dans les structures publiques.</p>
    `
  };

  showContent(key: string) {
    this.selected = this.data[key];
  }
}
