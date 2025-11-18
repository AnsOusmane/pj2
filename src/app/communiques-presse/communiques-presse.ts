import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Presse {
  id: number;
  titre: string;
  date: string;
  resume: string;
  image: string;
  categorie: string;
  loaded?: boolean; // ⭐ pour détecter que l’image est chargée
}

@Component({
  selector: 'app-communiques-presse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './communiques-presse.html',
  styleUrls: ['./communiques-presse.css']
})
export class CommuniquesPresseComponent {

  categories = ['Tous', 'Santé', 'Innovation', 'Urgent', 'Gouvernance'];
  selectedCat = 'Tous';

  // ⭐ Ajout paramètre loaded:false pour loader
  communiques: Presse[] = [
    {
      id: 1,
      titre: 'Lancement du nouveau programme national de santé digitale',
      date: '10 Février 2025',
      resume: 'Le ministère dévoile une plateforme révolutionnaire visant à moderniser les soins et améliorer l’accessibilité numérique.',
      image: 'assets/presse/1.webp',
      categorie: 'Innovation',
      loaded: false
    },
    {
      id: 2,
      titre: 'Ouverture de 12 nouvelles pharmacies partenaires',
      date: '03 Février 2025',
      resume: 'Un pas important vers une meilleure couverture pharmaceutique dans les zones rurales.',
      image: 'assets/presse/2.jpg',
      categorie: 'Santé',
      loaded: false
    },
    {
      id: 3,
      titre: 'Communiqué urgent : campagne de vaccination accélérée',
      date: '28 Janvier 2025',
      resume: 'Face à l’augmentation des cas, le ministère renforce le déploiement de la campagne de vaccination.',
      image: 'assets/presse/3.webp',
      categorie: 'Urgent',
      loaded: false
    }
  ];

  // ⭐ Gestion filtre
  get filteredCommuniques() {
    if (this.selectedCat === 'Tous') return this.communiques;
    return this.communiques.filter(c => c.categorie === this.selectedCat);
  }

  selectCat(cat: string) {
    this.selectedCat = cat;
  }

  // ⭐ Gestion du modal
  modal: Presse | null = null;

  openModal(c: Presse) {
    this.modal = c;
    document.body.style.overflow = 'hidden'; // Empêche le scroll
  }

  closeModal() {
    this.modal = null;
    document.body.style.overflow = 'auto';
  }
}
