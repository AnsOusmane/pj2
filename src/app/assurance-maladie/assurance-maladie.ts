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
    poste: `<h2 class="text-3xl font-bold text-green-700 mb-4">CSU</h2>

<p class="mb-4">
  <strong>Qu’est-ce que l’assurance maladie universelle ?</strong><br>
  L’assurance maladie est un dispositif qui vise à protéger les individus contre le risque financier lié à la maladie.
</p>

<h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">Comment peut-on adhérer à l’Assurance Maladie Universelle ?</h3>
<ul class="list-disc ml-6 space-y-1">
  <li>Être âgé d’au moins 21 ans (pour l’adhérent principal)</li>
  <li>Souscrire et s’inscrire dans les plateformes d’inscription dédiées de la SEN-CSU</li>
  <li>Se prémunir de sa pièce d’identification Nationale (CNI) et celles des personnes à charge (CNI ou extrait de naissance)</li>
  <li>Verser ses frais administratifs et sa cotisation annuelle ainsi que celles des personnes à charge via Orange Money ou Wave</li>
</ul>

<h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">Quelle est la part supportée par la SEN-CSU ?</h3>
<ul class="list-disc ml-6 space-y-1">
  <li>Prise en charge à hauteur de 80% pour les prestations de soins au niveau des structures publiques et les médicaments génériques</li>
  <li>Prise en charge à hauteur de 50% des médicaments vendus au niveau des pharmacies privées</li>
</ul>

<p class="mt-4 font-semibold">Pour accéder aux services, le bénéficiaire doit :</p>
<ul class="list-disc ml-6 space-y-1">
  <li>Être à jour de ses cotisations</li>
  <li>Avoir terminé sa période d’observation</li>
  <li>Se munir de sa carte d’assuré</li>
  <li>Se présenter au niveau des structures de santé publiques ayant signé des conventions avec l’Agence Sénégalaise de la CSU</li>
</ul>

<h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">Services offerts</h3>
<ul class="list-disc ml-6 space-y-1">
  <li>Les consultations primaires curatives</li>
  <li>Les consultations préventives</li>
  <li>Les hospitalisations</li>
  <li>Les accouchements</li>
  <li>Les examens complémentaires</li>
  <li>Les soins spécialisés</li>
  <li>Les évacuations</li>
  <li>Les médicaments</li>
</ul>

<h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">À quoi servent les cotisations ?</h3>
<p>
  Les cotisations sont indispensables au fonctionnement de l’assurance maladie.  
  Le non-versement des cotisations par l’adhérent, l’entreprise, le groupement ou l’association entraîne la suspension de l’adhésion et celle des ayants droit.  
  Par conséquent, les bénéficiaires n’auront pas accès aux services offerts tant qu’ils n’auront pas régularisé leurs cotisations.
</p>

<h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">Frais administratifs</h3>
<ul class="list-disc ml-6 space-y-1">
  <li>1000 FCFA pour tout chef de ménage disposant d’une capacité contributive désirant s’enrôler avec les membres de sa famille</li>
  <li>1000 FCFA pour chaque bénéficiaire parrainé par une entreprise privée ou publique</li>
  <li>1000 FCFA pour tout membre d’un groupement ou association à but non lucratif (possibilité de réduction selon le nombre de bénéficiaires)</li>
</ul>

<h3 class="text-xl font-semibold text-green-600 mt-6 mb-2">Cotisation annuelle</h3>
<ul class="list-disc ml-6 space-y-1">
  <li>7000 FCFA par personne et par an pour toutes les entreprises privées ou publiques dans le cadre de la RSE</li>
  <li>3500 FCFA par an pour tout ménage ayant la capacité contributive, ainsi que pour tout groupement ou association à but non lucratif</li>
</ul>

<p class="mt-2">
  Les 50% autres sont supportés par l’Agence pour la prise en charge des soins de santé au niveau des EPS.
</p>

<p class="mt-3 font-semibold text-green-700">
  Pour les bénéficiaires du PNBSF et les titulaires de la CEC, la cotisation est gratuite (prise en charge totale à 100%).
</p>
 `,

    eleve: `
      <h2 class="text-3xl text-green-700  font-bold mb-4">CSU Élève</h2>
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
      <h2 class="text-3xl text-green-700  font-bold mb-4">CSU Daara</h2>
      <p>Une assurance dédiée aux daaras du Sénégal, garantissant une couverture santé 
      pour les apprenants dans les structures publiques jusqu'à 80% des dépenses de santé des apprenants.</p>
      <p><strong>Exemple :</strong> Facture 2500 F → Mutuelle 2000 F, Parent 500 F.</p>
      <p><strong>Médicaments privés :</strong> couverture 50%.</p>

      <p class="font-semibold mt-3">Inscription :</p>
      <p>Dans l’établissement de l'apprenant.</p>

      <p class="font-semibold mt-3">Cotisation :</p>
      <ul class="list-disc ml-6">
        <li>1000 F/an/enfant + État 3500 F</li>
        <li>Option premium : 3500 F + État 3500 F → couverture complète jusqu’à l’hôpital</li>
      </ul>
    `
  };

 selectedKey: string | null = null;

showContent(key: string) {
  this.selectedKey = key;
  this.selected = this.data[key];
}

}
