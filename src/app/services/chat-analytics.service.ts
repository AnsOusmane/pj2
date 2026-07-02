import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface ChatStatsTotals {
  total: number;
  faq: number;
  fallback: number;
  sessions: number;
  resolutionRate: number; // % de messages résolus par la FAQ
}

export interface ChatLangRow { lang: 'fr' | 'wo' | 'en' | null; n: number; }
export interface ChatFallbackRow { question: string; n: number; }
export interface ChatTopicRow { topic: string; n: number; }
export interface ChatDailyRow { day: string; total: number; fallback: number; }
export interface ChatRecentRow {
  id: number;
  message: string | null;
  outcome: 'faq' | 'fallback' | 'claude';
  matched_id: string | null;
  detected_lang: 'fr' | 'wo' | 'en' | null;
  created_at: string;
}

export interface ChatStats {
  days: number;
  totals: ChatStatsTotals;
  byLang: ChatLangRow[];
  topFallback: ChatFallbackRow[];
  topMatched: ChatTopicRow[];
  daily: ChatDailyRow[];
  recent: ChatRecentRow[];
}

/** Statistiques d'utilisation du chatbot (réservé aux administrateurs). */
@Injectable({ providedIn: 'root' })
export class ChatAnalyticsService {
  private apiUrl = `${environment.apiBaseUrl}/chat`;

  constructor(private http: HttpClient) {}

  getStats(days = 30): Observable<ChatStats> {
    const params = new HttpParams().set('days', String(days));
    return this.http.get<ChatStats>(`${this.apiUrl}/stats`, { params }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;
    if (error.error instanceof ErrorEvent || error.status === 0) {
      message = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
    } else if (error.status === 403) {
      message = "Accès réservé aux administrateurs.";
    } else if (error.status >= 500) {
      message = 'Le serveur a rencontré une erreur. Réessayez dans quelques instants.';
    } else {
      message = error.error?.message || `Une erreur est survenue (code ${error.status}).`;
    }
    console.error('Erreur API Chat analytics :', error);
    return throwError(() => new Error(message));
  }
}
