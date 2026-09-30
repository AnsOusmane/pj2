import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface AvisAttribution {
  id: number;
  reference: string | null;
  objet: string;
  attributaire: string;
  montant: number | null;
  type_marche: string | null;
  mode_passation: string | null;
  date_attribution: string | null;
  file_url: string | null;
  is_published?: boolean;
  archived_at?: string | null;
  // Lien vers l'appel d'offres d'origine (optionnel).
  appel_offre_id?: number | null;
  // Champs joints (route de gestion) : référence/objet de l'AO lié.
  ao_reference?: string | null;
  ao_objet?: string | null;
  updated_at: string;
  // Présents uniquement via la route de gestion (cellule/admin)
  created_by?: number | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
  created_at?: string;
}

export interface AttrFilters {
  type_marche?: string;
}

@Injectable({ providedIn: 'root' })
export class AvisAttributionService {
  private apiUrl = `${environment.apiBaseUrl}/avis-attribution`;

  constructor(private http: HttpClient) {}

  /** Liste publique : avis publiés uniquement. */
  getAll(filters: AttrFilters = {}): Observable<AvisAttribution[]> {
    let params = new HttpParams();
    if (filters.type_marche) params = params.set('type_marche', filters.type_marche);
    return this.http.get<AvisAttribution[]>(this.apiUrl, { params }).pipe(catchError(this.handleError));
  }

  /** Liste de gestion (cellule/admin) : actifs par défaut, ou archivés si demandé. */
  getAllForManage(archived = false): Observable<AvisAttribution[]> {
    let params = new HttpParams();
    if (archived) params = params.set('archived', 'true');
    return this.http.get<AvisAttribution[]>(`${this.apiUrl}/manage`, { params }).pipe(catchError(this.handleError));
  }

  /** Création — FormData (upload PDF de l'avis). */
  create(data: FormData): Observable<AvisAttribution> {
    return this.http.post<AvisAttribution>(this.apiUrl, data).pipe(catchError(this.handleError));
  }

  /** Mise à jour — FormData (PDF optionnel). */
  update(id: number, data: FormData): Observable<AvisAttribution> {
    return this.http.put<AvisAttribution>(`${this.apiUrl}/${id}`, data).pipe(catchError(this.handleError));
  }

  /** Archive un avis d'attribution (soft-archive). */
  archive(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/archive`, {})
      .pipe(catchError(this.handleError));
  }

  /** Restaure un avis d'attribution archivé. */
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
    console.error('Erreur API Avis d\'attribution :', error);
    return throwError(() => new Error(message));
  }
}
