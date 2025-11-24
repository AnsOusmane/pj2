import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appels-offre',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appels-offre.html',
  styleUrls: ['./appels-offre.css']
})
export class AppelsOffreComponent {

  selectedKey: string | null = null;
  selected: string | null = null;

  data: any = {
    ao1: `
      <h2 class="text-2xl font-bold mb-4">Fourniture de matériel médical</h2>
      <p><strong>Objet :</strong> Acquisition d’équipements médicaux destinés aux postes et centres de santé.</p>
      <p><strong>Deadline :</strong> 15 Février 2025</p>
      <p><strong>Documents requis :</strong></p>
      <ul class="list-disc ml-6">
        <li>Registre de commerce</li>
        <li>Attestation fiscale</li>
        <li>Catalogue technique</li>
      </ul>
    `,
    ao2: `
      <h2 class="text-2xl font-bold mb-4">Construction d’un centre de dialyse</h2>
      <p><strong>Objet :</strong> Projet de réalisation et équipement d’un centre de dialyse régional.</p>
      <p><strong>Deadline :</strong> 28 Février 2025</p>
      <p><strong>Pièces exigées :</strong></p>
      <ul class="list-disc ml-6">
        <li>Plan architectural</li>
        <li>Dossier technique complet</li>
        <li>Attestation CNSS & IPRES</li>
      </ul>
    `,
    ao3: `
      <h2 class="text-2xl font-bold mb-4">Maintenance des équipements biomédicaux</h2>
      <p><strong>Objet :</strong> Maintenance préventive et corrective des appareils hospitaliers.</p>
      <p><strong>Deadline :</strong> 10 Mars 2025</p>
      <p><strong>Conditions :</strong></p>
      <ul class="list-disc ml-6">
        <li>Expérience ≥ 3 ans</li>
        <li>Techniciens certifiés</li>
        <li>Attestation de capacité financière</li>
      </ul>
    `
  };

  showContent(key: string) {
    this.selectedKey = key;
    this.selected = this.data[key];
  }
}
