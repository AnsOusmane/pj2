import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface SecurityEventTypeRow { type: string; label: string; n: number; }

export interface SecurityEventRow {
  id: number;
  event_type: string;
  method: string | null;
  route: string | null;
  ip: string | null;
  detail: string | null;
  created_at: string;
}

export interface SuspiciousIpRow { ip: string; n: number; last_seen: string; }

export interface SecurityEventsData {
  days: number;
  total: number;
  byType: SecurityEventTypeRow[];
  recent: SecurityEventRow[];
  suspiciousIps: SuspiciousIpRow[];
  suspicionWindowMinutes: number;
}

/** Journal de sécurité (réservé aux administrateurs). */
@Injectable({ providedIn: 'root' })
export class SecurityEventsService {
  private apiUrl = `${environment.apiBaseUrl}/security-events`;

  constructor(private http: HttpClient) {}

  getEvents(days = 7, type?: string): Observable<SecurityEventsData> {
    let params = new HttpParams().set('days', String(days));
    if (type) params = params.set('type', type);
    return this.http.get<SecurityEventsData>(this.apiUrl, { params }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;
    if (error.error instanceof ErrorEvent || error.status === 0) {
      message = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
    } else if (error.status === 403) {
      message = 'Accès réservé aux administrateurs.';
    } else if (error.status >= 500) {
      message = 'Le serveur a rencontré une erreur. Réessayez dans quelques instants.';
    } else {
      message = error.error?.message || `Une erreur est survenue (code ${error.status}).`;
    }
    console.error('Erreur API Security events :', error);
    return throwError(() => new Error(message));
  }
}
