import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface Guide {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  cover_url: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class GuidesService {
  private apiUrl = `${environment.apiBaseUrl}/guides`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Guide[]> {
    return this.http.get<Guide[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  addGuide(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) message = error.error.message;
    else message = error.error?.message || `Erreur ${error.status}`;
    console.error('Erreur API Guides :', error);
    return throwError(() => new Error(message));
  }
}