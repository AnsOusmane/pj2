import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export type AoStatut = 'a_venir' | 'ouvert' | 'cloture';

export interface AppelOffre {
  id: number;
  reference: string | null;
  objet: string;
  description: string | null;
  type_marche: string | null;
  mode_passation: string | null;
  source_financement: string | null;
  date_lancement: string | null;
  date_limite: string | null;
  file_url: string | null;
  statut: AoStatut;
  is_published?: boolean;
  archived_at?: string | null;
  // Lien vers la ligne PPM d'origine (optionnel).
  ppm_id?: number | null;
  // Champs joints (route de gestion) : référence/objet de la ligne PPM liée.
  ppm_reference?: string | null;
  ppm_objet?: string | null;
  // Avis d'attribution publié et lié (route publique) : pour affichage + téléchargement.
  avis_file_url?: string | null;
  avis_reference?: string | null;
  avis_attributaire?: string | null;
  avis_montant?: number | null;
  avis_date_attribution?: string | null;
  updated_at: string;
  // Présents uniquement via la route de gestion (cellule/admin)
  created_by?: number | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
  created_at?: string;
}

export interface AoFilters {
  statut?: AoStatut;
  type_marche?: string;
}

@Injectable({ providedIn: 'root' })
export class AppelsOffreService {
  private apiUrl = `${environment.apiBaseUrl}/appels-offre`;

  constructor(private http: HttpClient) {}

  /** Liste publique : avis publiés uniquement. */
  getAll(filters: AoFilters = {}): Observable<AppelOffre[]> {
    let params = new HttpParams();
    if (filters.statut)      params = params.set('statut', filters.statut);
    if (filters.type_marche) params = params.set('type_marche', filters.type_marche);
    return this.http.get<AppelOffre[]>(this.apiUrl, { params }).pipe(catchError(this.handleError));
  }

  /** Liste de gestion (cellule/admin) : actifs par défaut, ou archivés si demandé. */
  getAllForManage(archived = false): Observable<AppelOffre[]> {
    let params = new HttpParams();
    if (archived) params = params.set('archived', 'true');
    return this.http.get<AppelOffre[]>(`${this.apiUrl}/manage`, { params }).pipe(catchError(this.handleError));
  }

  /** Création — FormData (upload PDF de l'avis). */
  create(data: FormData): Observable<AppelOffre> {
    return this.http.post<AppelOffre>(this.apiUrl, data).pipe(catchError(this.handleError));
  }

  /** Mise à jour — FormData (PDF optionnel). */
  update(id: number, data: FormData): Observable<AppelOffre> {
    return this.http.put<AppelOffre>(`${this.apiUrl}/${id}`, data).pipe(catchError(this.handleError));
  }

  /** Archive un appel d'offres (soft-archive). */
  archive(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/archive`, {})
      .pipe(catchError(this.handleError));
  }

  /** Restaure un appel d'offres archivé. */
  unarchive(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/unarchive`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || `Erreur ${error.status}`;
    }
    console.error('Erreur API Appels d\'offres :', error);
    return throwError(() => new Error(message));
  }
}
