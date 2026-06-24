import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

interface Rapport {
  id: number;
  titre: string;
  date: string;
  image: string;
  categorie: string;
  fichier: string;
  contenu?: string; // pour la vue détaillée
}

@Component({
  selector: 'app-rapports-officiels',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './rapports-officiels.html',
  styleUrls: ['./rapports-officiels.css']
})
export class RapportsOfficielsComponent {

  categories = ['Tous', 'Rapports Annuels', 'Études', 'Statistiques', 'Finances'];

  selectedCat = 'Tous';
  searchValue = '';

  // état modal
  selectedRapport: Rapport | null = null;

  // Les rapports de démo (fichiers webp/pdf absents) ont été retirés.
  // À remplacer par les vrais rapports (ou un chargement depuis l'API) une fois le contenu disponible.
  rapports: Rapport[] = [];

  // Filtres combinés (catégorie + recherche)
  get filteredRapports() {
    return this.rapports.filter(r =>
      (this.selectedCat === 'Tous' || r.categorie === this.selectedCat) &&
      (this.searchValue.trim() === '' || r.titre.toLowerCase().includes(this.searchValue.toLowerCase()))
    );
  }

  selectCat(cat: string) {
    this.selectedCat = cat;
  }

  openPDF(path: string) {
    window.open(path, '_blank');
  }

  // Ouvrir modal
  openDetails(r: Rapport) {
    this.selectedRapport = r;
  }

  // Fermer modal
  closeModal() {
    this.selectedRapport = null;
  }
}
