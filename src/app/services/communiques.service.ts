import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment'; // ajuste le chemin si nécessaire

// Interfaces (gardées pour le typage fort)
export interface Communique {
  title: string;
  description?: string;
  file: File;
}

export interface CommuniqueResponse {
  message: string;
  data: {
    id: number;
    title: string;
    description: string | null;
    file_path: string;
    created_at: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CommuniqueService {
  private apiUrl = `${environment.apiBaseUrl}/communiques`;

  constructor(private http: HttpClient) {}

  /**
   * Ajoute un communiqué en envoyant les données sous forme multipart/form-data
   * @param data Objet contenant title, description (optionnel) et file
   */
  addCommunique(data: Communique): Observable<CommuniqueResponse> {
    const formData = new FormData();
    
    // Champs obligatoires
    formData.append('title', data.title.trim());
    
    // Champ optionnel
    if (data.description?.trim()) {
      formData.append('description', data.description.trim());
    }
    
    // Le fichier
    formData.append('file', data.file);

    return this.http.post<CommuniqueResponse>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue lors de la communication avec le serveur';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client (ex: réseau coupé)
      message = `Erreur client : ${error.error.message}`;
    } else {
      // Erreur côté serveur (ex: 400, 500, message JSON du backend)
      message = error.error?.message 
        || `Erreur ${error.status} : ${error.statusText}`;
    }

    console.error('Erreur API communiqués :', error);
    return throwError(() => new Error(message));
  }
}