import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecretsService, Decret } from '../services/decrets.service';
import { environment } from '../../environments/environment';

interface DecretDisplay {
  id: number;
  titre: string;
  date: string;
  resume: string;
  file_url: string;      // ← Corrigé
  cover_url?: string;    // ← Corrigé (optionnel)
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

  private mediaBase = environment.mediaBaseUrl || 
                     environment.apiBaseUrl.replace(/\/api$/, '');

  constructor(private decretsService: DecretsService) {}

  ngOnInit(): void {
    this.loadDecrets();
  }

  loadDecrets(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.decretsService.getAll().subscribe({     // ← Corrigé : getAll()
      next: (data: Decret[]) => {
        this.decrets = data.map(item => ({
          id: item.id,
          titre: item.title?.trim() || 'Décret sans titre',
          date: this.formatDate(item.created_at),
          resume: item.description?.trim() || 'Aucun résumé disponible',
          file_url: this.constructFileUrl(item.file_url),      // ← Corrigé
          cover_url: item.cover_url ? this.constructFileUrl(item.cover_url) : undefined,
          loaded: false
        }));
        this.isLoading = false;
      },
      error: (err: any) => {                         // ← Typé
        console.error('Erreur lors du chargement des décrets :', err);
        this.errorMessage = 'Impossible de charger les décrets pour le moment.';
        this.isLoading = false;
      }
    });
  }

  private formatDate(dateStr?: string): string {
    if (!dateStr) return 'Date inconnue';
    try {
      return new Date(dateStr).toLocaleDateString('fr-SN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  }

  private constructFileUrl(path?: string): string {
    if (!path?.trim()) return 'assets/images/placeholder.jpg';
    
    const separator = path.startsWith('/') ? '' : '/';
    return `${this.mediaBase}${separator}${path}`;
  }

  isImage(fileUrl: string): boolean {
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileUrl);
  }
}