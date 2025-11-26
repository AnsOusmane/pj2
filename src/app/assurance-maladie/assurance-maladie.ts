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
  <h2 class="text-3xl font-bold text-green-700 mb-4">CSU Solidarité</h2>

  <p class="mb-4">
    <strong>Définition :</strong> L’assurance maladie est un dispositif qui vise à protéger les individus
    contre le risque financier lié à la maladie.
  </p>

  <h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">Comment adhérer ?</h3>
  <ul class="list-disc ml-6 space-y-1">
    <li>Être âgé d’au moins 21 ans (adhérent principal)</li>
    <li>Souscrire et s’inscrire dans les plateformes dédiées</li>
    <li>Présenter la CNI ou extrait de naissance (pour les ayants droit)</li>
    <li>Verser les frais administratifs et cotisations via Orange Money ou Wave</li>
  </ul>

  <h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">Part supportée par la SEN-CSU</h3>
  <ul class="list-disc ml-6 space-y-1">
    <li>80% : soins structures publiques + médicaments génériques</li>
    <li>50% : pharmacies privées</li>
  </ul>

  <p class="mt-4 font-semibold">Pour accéder aux services, le bénéficiaire doit :</p>
  <ul class="list-disc ml-6 space-y-1">
    <li>Être à jour de ses cotisations</li>
    <li>Avoir terminé la période d’observation</li>
    <li>Avoir sa carte d’assuré</li>
    <li>Se présenter dans une structure conventionnée</li>
  </ul>

  <h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">Services offerts</h3>
  <ul class="list-disc ml-6 space-y-1">
    <li>Consultations primaires curatives</li>
    <li>Consultations préventives</li>
    <li>Hospitalisations</li>
    <li>Accouchements</li>
    <li>Examens complémentaires</li>
    <li>Soins spécialisés</li>
    <li>Évacuations</li>
    <li>Médicaments</li>
  </ul>

  <h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">À quoi servent les cotisations ?</h3>
  <p>
    Elles financent le dispositif. Le non-paiement entraîne la suspension de l’assurance
    pour l’adhérent et ses ayants droit.
  </p>

  <h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">Frais administratifs</h3>
  <ul class="list-disc ml-6 space-y-1">
    <li>1000 FCFA chef de ménage</li>
    <li>1000 FCFA bénéficiaire parrainé par une entreprise</li>
    <li>1000 FCFA membre groupement / association (réduction possible)</li>
  </ul>

  <h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">Cotisation annuelle</h3>
  <ul class="list-disc ml-6 space-y-1">
    <li>7000 FCFA / personne / an (entreprises RSE)</li>
    <li>3500 FCFA / personne / an ménages et associations</li>
  </ul>

  <p class="mt-2">
    Les 50% restants sont supportés par l’Agence.
  </p>

  <p class="mt-3 font-semibold text-green-700">
    Bénéficiaires PNBSF et titulaires CEC : cotisation gratuite.
  </p>
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

 selectedKey: string | null = null;

showContent(key: string) {
  this.selectedKey = key;
  this.selected = this.data[key];
}

}
