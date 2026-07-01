import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export type CandidatureStatut = 'recu' | 'en_cours' | 'retenu' | 'rejete';

/** Payload du dépôt public (formulaire Carrière). */
export interface CandidaturePayload {
  nom: string;
  email: string;
  telephone?: string;
  poste?: string;
  cv_url?: string;
  message?: string;
}

export interface CandidatureDepotResponse {
  success: boolean;
  message: string;
  id: number;
  created_at: string;
}

export interface Candidature {
  id: number;
  nom: string;
  email: string;
  telephone: string | null;
  poste: string | null;
  cv_url: string | null;
  message: string | null;
  statut: CandidatureStatut;
  note_traitement: string | null;
  archived_at?: string | null;
  updated_by_name?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class CandidaturesService {
  private apiUrl = `${environment.apiBaseUrl}/candidatures`;

  constructor(private http: HttpClient) {}

  /** Dépôt public d'une candidature (stockage en base, en plus de l'e-mail). */
  enregistrer(data: CandidaturePayload): Observable<CandidatureDepotResponse> {
    return this.http.post<CandidatureDepotResponse>(this.apiUrl, data).pipe(catchError(this.handleError));
  }

  /** Liste de gestion (cellule/admin), filtre statut optionnel. Actifs par défaut, ou archivés. */
  getAllForManage(statut?: CandidatureStatut | '', archived = false): Observable<Candidature[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    if (archived) params = params.set('archived', 'true');
    return this.http.get<Candidature[]>(`${this.apiUrl}/manage`, { params }).pipe(catchError(this.handleError));
  }

  /** Mise à jour du statut / note de traitement. */
  update(id: number, payload: { statut?: CandidatureStatut; note_traitement?: string | null }): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.apiUrl}/${id}`, payload).pipe(catchError(this.handleError));
  }

  /** Archive une candidature (soft-archive). */
  archive(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/archive`, {})
      .pipe(catchError(this.handleError));
  }

  /** Restaure une candidature archivée. */
  unarchive(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/unarchive`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;
    if (error.error instanceof ErrorEvent || error.status === 0) {
      message = 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.';
    } else if (error.status === 429) {
      message = error.error?.message || 'Trop de tentatives. Veuillez réessayer dans un moment.';
    } else if (Array.isArray(error.error?.errors) && error.error.errors.length) {
      message = error.error.errors
        .map((e: { message?: string }) => e?.message)
        .filter(Boolean)
        .join(' • ') || (error.error?.message ?? 'Données invalides.');
    } else if (error.status >= 500) {
      message = 'Le serveur a rencontré une erreur. Réessayez dans quelques instants.';
    } else {
      message = error.error?.message || `Une erreur est survenue (code ${error.status}).`;
    }
    console.error('Erreur API Candidatures :', error);
    return throwError(() => new Error(message));
  }
}
