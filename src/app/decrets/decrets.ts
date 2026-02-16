import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecretsService } from '../services/decrets.service'; // ajuste le chemin
import { environment } from '../../environments/environment';

interface DecretDisplay {
  id: number;
  titre: string;
  date: string;
  resume: string;
  file: string;       // lien vers le PDF ou image
  loaded?: boolean;
}

@Component({
  selector: 'app-decrets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './decrets.html',
  styleUrls: ['./decrets.css']
})
export class DecretsComponent implements OnInit {
  isLoading = true;
  errorMessage: string | null = null;
  decrets: DecretDisplay[] = [];

  constructor(private decretsService: DecretsService) {}

  ngOnInit() {
    this.loadDecrets();
  }

  loadDecrets() {
    this.isLoading = true;
    this.errorMessage = null;

    this.decretsService.getAllDecrets().subscribe({
      next: (data) => {
        this.decrets = data.map(item => ({
          id: item.id,
          titre: item.title,
          date: new Date(item.created_at).toLocaleDateString('fr-SN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          resume: item.description || 'Aucun résumé disponible',
          file: `${environment.mediaBaseUrl || environment.apiBaseUrl.replace(/\/api$/, '')}${item.file_path}`,
          loaded: false
        }));

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement décrets', err);
        this.errorMessage = 'Impossible de charger les décrets pour le moment.';
        this.isLoading = false;
      }
    });
  }
}