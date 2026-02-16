import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment.prod';

export interface Decret {
  id: number;
  title: string;
  description: string | null;
  file_path: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class DecretsService {
  private apiUrl = `${environment.apiBaseUrl}/decrets`;

  constructor(private http: HttpClient) {}

  // Liste tous les décrets
  getAllDecrets(): Observable<Decret[]> {
    return this.http.get<Decret[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Ajout d’un décret 
addDecret(formData: FormData): Observable<any> {
  return this.http.post(this.apiUrl, formData).pipe(
    catchError(this.handleError)
  );
}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(message));
  }
}