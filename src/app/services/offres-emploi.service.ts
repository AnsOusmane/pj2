import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface OffreEmploi {
  id: number;
  title: string;
  description: string | null;
  company: string | null;
  location: string | null;
  deadline: string | null;
  file_url: string;
  cover_url: string | null;
  is_active: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class OffresEmploiService {
  private apiUrl = `${environment.apiBaseUrl}/offres-emploi`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<OffreEmploi[]> {
    return this.http.get<OffreEmploi[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  addOffre(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || `Erreur ${error.status}`;
    }
    console.error('Erreur API Offres d\'emploi :', error);
    return throwError(() => new Error(message));
  }
}