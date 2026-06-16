import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export type AgrementStatut = 'recu' | 'en_cours' | 'valide' | 'rejete';

export interface DepotResponse {
  success: boolean;
  message: string;
  numero: string;
  created_at: string;
}

export interface Agrement {
  id: number;
  numero: string;
  raison_sociale: string;
  ninea: string | null;
  rccm: string | null;
  domaine: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  contact_nom: string | null;
  message: string | null;
  doc_demande_url: string | null;
  doc_ninea_url: string | null;
  doc_presentation_url: string | null;
  doc_registre_url: string | null;
  doc_fiscale_url: string | null;
  statut: AgrementStatut;
  note_traitement: string | null;
  updated_by_name?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class FournisseursService {
  private apiUrl = `${environment.apiBaseUrl}/fournisseurs`;

  constructor(private http: HttpClient) {}

  /** Dépôt public d'une demande d'agrément (FormData, 3 PDF). */
  deposer(data: FormData): Observable<DepotResponse> {
    return this.http.post<DepotResponse>(this.apiUrl, data).pipe(catchError(this.handleError));
  }

  /** Liste de gestion (cellule/admin), filtre statut optionnel. */
  getAllForManage(statut?: AgrementStatut | ''): Observable<Agrement[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    return this.http.get<Agrement[]>(`${this.apiUrl}/manage`, { params }).pipe(catchError(this.handleError));
  }

  /** Mise à jour du statut / note de traitement. */
  update(id: number, payload: { statut?: AgrementStatut; note_traitement?: string | null }): Observable<Agrement> {
    return this.http.put<Agrement>(`${this.apiUrl}/${id}`, payload).pipe(catchError(this.handleError));
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
    console.error('Erreur API Fournisseurs :', error);
    return throwError(() => new Error(message));
  }
}
