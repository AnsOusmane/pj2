import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // ou environment.prod

interface Communique {
  id: number;
  titre: string;
  date: string;
  resume: string;
  image: string;
  categorie: string;      // on peut mettre "Général" par défaut ou ajouter un champ category plus tard
  loaded?: boolean;
}

@Component({
  selector: 'app-communiques-presse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './communiques-presse.html',
  styleUrls: ['./communiques-presse.css']
})
export class CommuniquesPresseComponent implements OnInit {
  categories = ['Tous', 'Santé', 'Innovation', 'Urgent', 'Gouvernance'];
  selectedCat = 'Tous';

  communiques: Communique[] = [];
  filteredCommuniques: Communique[] = [];

  isLoading = true;
  errorMessage: string | null = null;

  modal: Communique | null = null;

  private apiUrl = `${environment.apiBaseUrl}/communiques`;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCommuniques();
  }

  loadCommuniques() {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
       this.communiques = data.map(item => ({
  id: item.id,
  titre: item.title,
  date: new Date(item.created_at).toLocaleDateString('fr-SN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }),
  resume: item.description || 'Aucun résumé disponible',
  image: item.file_path && item.file_path.trim()
    ? `${environment.mediaBaseUrl}${item.file_path.startsWith('/') ? '' : '/'}${item.file_path}`
    : 'assets/placeholder.jpg',
  categorie: 'Général',
  loaded: false
}));

        this.updateFilteredCommuniques();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement communiqués', err);
        this.errorMessage = 'Impossible de charger les communiqués pour le moment. Réessayez plus tard.';
        this.isLoading = false;
      }
    });
  }

  updateFilteredCommuniques() {
    if (this.selectedCat === 'Tous') {
      this.filteredCommuniques = [...this.communiques];
    } else {
      this.filteredCommuniques = this.communiques.filter(c => c.categorie === this.selectedCat);
    }
  }

  selectCat(cat: string) {
    this.selectedCat = cat;
    this.updateFilteredCommuniques();
  }

  openModal(c: Communique) {
    this.modal = c;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal = null;
    document.body.style.overflow = 'auto';
  }

  retryLoad() {
    this.loadCommuniques();
  }
}