import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Decret {
  id: number;
  titre: string;
  numero: string;
  date: string;
  resume: string;
  pdf: string;
  categorie: string;
}

@Component({
  selector: 'app-decrets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './decrets.html',
  styleUrls: ['./decrets.css']
})
export class DecretsComponent {

  searchValue = '';
  selectedCat = 'Tous';

  categories = ['Tous', 'Santé', 'Administration', 'Finance', 'Numérique'];

  decrets: Decret[] = [
    {
      id: 1,
      titre: "Décret portant création de l'Agence Nationale de Santé Digitale",
      numero: "Décret N°2025-014",
      date: "12 Février 2025",
      resume: "Ce décret officialise la mise en place d'une agence dédiée à la transformation numérique du système de santé.",
      pdf: "assets/decrets/d1.pdf",
      categorie: "Santé"
    },
    {
      id: 2,
      titre: "Décret relatif à la modernisation des systèmes administratifs",
      numero: "Décret N°2025-006",
      date: "03 Février 2025",
      resume: "Met en place un nouveau cadre réglementaire pour la digitalisation des services publics.",
      pdf: "assets/decrets/d2.pdf",
      categorie: "Administration"
    },
    {
      id: 3,
      titre: "Décret portant réforme des structures financières publiques",
      numero: "Décret N°2025-002",
      date: "15 Janvier 2025",
      resume: "Réorganisation des mécanismes d’attribution budgétaire dans les secteurs prioritaires.",
      pdf: "assets/decrets/d3.pdf",
      categorie: "Finance"
    }
  ];

  get filteredDecrets() {
    let list = this.decrets;

    if (this.selectedCat !== 'Tous') {
      list = list.filter(d => d.categorie === this.selectedCat);
    }

    if (this.searchValue.trim() !== '') {
      const s = this.searchValue.toLowerCase();
      list = list.filter(d =>
        d.titre.toLowerCase().includes(s) ||
        d.resume.toLowerCase().includes(s) ||
        d.numero.toLowerCase().includes(s)
      );
    }

    return list;
  }

  selectCat(cat: string) {
    this.selectedCat = cat;
  }
}
