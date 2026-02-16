import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecretsService } from '../services/decrets.service';
import { environment } from '../../environments/environment';

interface DecretDisplay {
  id: number;
  titre: string;
  date: string;
  resume: string;
  file: string;
  loaded: boolean;
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

  private apiUrl = `${environment.apiBaseUrl}/decrets`;
  private mediaBase = environment.mediaBaseUrl || environment.apiBaseUrl.replace(/\/api$/, '');

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
          titre: item.title || 'Décret sans titre',
          date: item.created_at
            ? new Date(item.created_at).toLocaleDateString('fr-SN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            : 'Date inconnue',
          resume: item.description?.trim() || 'Aucun résumé disponible',
          file: item.file_path && item.file_path.trim()
            ? `${this.mediaBase}${item.file_path.startsWith('/') ? '' : '/'}${item.file_path}`
            : 'assets/placeholder.jpg',
          loaded: false
        }));

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des décrets', err);
        this.errorMessage = 'Impossible de charger les décrets pour le moment.';
        this.isLoading = false;
      }
    });
  }
}