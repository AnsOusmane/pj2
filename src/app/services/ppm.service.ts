import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export type PpmStatut = 'prevu' | 'lance' | 'attribue' | 'cloture';
export type PpmTrimestre = 'T1' | 'T2' | 'T3' | 'T4';

export interface Ppm {
  id: number;
  reference: string | null;
  objet: string;
  type_marche: string | null;
  mode_passation: string | null;
  source_financement: string | null;
  montant_estime: number | null;
  annee: number;
  trimestre: PpmTrimestre | null;
  date_prevue_lancement: string | null;
  statut: PpmStatut;
  is_published?: boolean;
  updated_at: string;
  // Présents uniquement via la route de gestion (cellule/admin)
  created_by?: number | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
  created_at?: string;
}

// Champs éditables (création / mise à jour)
export type PpmPayload = Partial<Omit<Ppm, 'id' | 'updated_at' | 'created_at' | 'updated_by_name'>> & {
  objet: string;
  annee: number;
};

export interface PpmFilters {
  annee?: number;
  type_marche?: string;
  statut?: PpmStatut;
}

@Injectable({ providedIn: 'root' })
export class PpmService {
  private apiUrl = `${environment.apiBaseUrl}/ppm`;

  constructor(private http: HttpClient) {}

  /** Liste publique : lignes publiées uniquement, avec filtres optionnels. */
  getAll(filters: PpmFilters = {}): Observable<Ppm[]> {
    let params = new HttpParams();
    if (filters.annee)       params = params.set('annee', String(filters.annee));
    if (filters.type_marche) params = params.set('type_marche', filters.type_marche);
    if (filters.statut)      params = params.set('statut', filters.statut);
    return this.http.get<Ppm[]>(this.apiUrl, { params }).pipe(catchError(this.handleError));
  }

  /** Liste de gestion (cellule/admin) : brouillons inclus + nom du dernier éditeur. */
  getAllForManage(): Observable<Ppm[]> {
    return this.http.get<Ppm[]>(`${this.apiUrl}/manage`).pipe(catchError(this.handleError));
  }

  create(payload: PpmPayload): Observable<Ppm> {
    return this.http.post<Ppm>(this.apiUrl, payload).pipe(catchError(this.handleError));
  }

  update(id: number, payload: Partial<PpmPayload>): Observable<Ppm> {
    return this.http.put<Ppm>(`${this.apiUrl}/${id}`, payload).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || `Erreur ${error.status}`;
    }
    console.error('Erreur API PPM :', error);
    return throwError(() => new Error(message));
  }
}
