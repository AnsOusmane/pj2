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

  rapports: Rapport[] = [
    {
      id: 1,
      titre: 'Rapport Annuel 2024 – Santé Publique',
      date: '12 Décembre 2024',
      image: 'assets/rapports/r1.webp',
      categorie: 'Rapports Annuels',
      fichier: 'assets/rapports/pdf/r1.pdf',
      contenu: 'Ce rapport présente les grandes avancées du ministère...'
    },
    {
      id: 2,
      titre: 'Étude nationale sur le numérique médical',
      date: '04 Février 2025',
      image: 'assets/rapports/r2.webp',
      categorie: 'Études',
      fichier: 'assets/rapports/pdf/r2.pdf',
      contenu: 'Une étude complète sur l\'évolution du digital médical...'
    },
    {
      id: 3,
      titre: 'Statistiques 2025 : couverture pharmaceutique',
      date: '20 Janvier 2025',
      image: 'assets/rapports/r3.webp',
      categorie: 'Statistiques',
      fichier: 'assets/rapports/pdf/r3.pdf',
      contenu: 'Toutes les statistiques de la couverture pharmaceutique...'
    },
    {
      id: 4,
      titre: 'Audit financier – Programme Santé Digitale',
      date: '10 Décembre 2024',
      image: 'assets/rapports/r4.webp',
      categorie: 'Finances',
      fichier: 'assets/rapports/pdf/r4.pdf',
      contenu: 'Audit complet sur l’utilisation des fonds...'
    }
  ];

  // 🔍 Filtres combinés (catégorie + recherche)
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

  // 🟢 Ouvrir modal
  openDetails(r: Rapport) {
    this.selectedRapport = r;
  }

  // 🔴 Fermer modal
  closeModal() {
    this.selectedRapport = null;
  }
}
