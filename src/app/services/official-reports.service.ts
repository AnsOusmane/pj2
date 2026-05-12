import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import {
  Observable,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface OfficialReport {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  cover_url: string | null;
  report_type?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfficialReportsService {

  private apiUrl = `${environment.apiBaseUrl}/official-reports`;

  constructor(private http: HttpClient) {}   // ← Injection HttpClient

  // ==========================
  // GET ALL
  // ==========================
  getAll(): Observable<OfficialReport[]> {
    return this.http.get<OfficialReport[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // ==========================
  // POST
  // ==========================
  addReport(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  // ==========================
  // ERROR HANDLING
  // ==========================
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
    }
    console.error('Erreur API Official Reports :', error);
    return throwError(() => new Error(message));
  }
}