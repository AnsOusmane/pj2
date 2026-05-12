import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface ImageBank {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  category?: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ImagesBankService {
  private apiUrl = `${environment.apiBaseUrl}/images-bank`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ImageBank[]> {
    return this.http.get<ImageBank[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  addImage(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
    }
    console.error('Erreur API Banque d\'images :', error);
    return throwError(() => new Error(message));
  }
}