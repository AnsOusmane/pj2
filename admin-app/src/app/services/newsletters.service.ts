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

export interface Newsletter {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  cover_url: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewslettersService {

  private apiUrl =
    `${environment.apiBaseUrl}/newsletters`;

  constructor(private http: HttpClient) {}

  // ==========================
  // GET ALL
  // ==========================
  getAllNewsletters(): Observable<Newsletter[]> {
    return this.http.get<Newsletter[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // ==========================
  // POST ADD NEWSLETTER
  // ==========================
  addNewsletter(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  // ==========================
  // ERRORS
  // ==========================
  private handleError(
    error: HttpErrorResponse
  ): Observable<never> {

    let message =
      'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {

      message = error.error.message;

    } else {

      message =
        error.error?.message ||
        `Erreur ${error.status}: ${error.statusText}`;
    }

    console.error(
      'Erreur API newsletters :',
      error
    );

    return throwError(() => new Error(message));
  }
}