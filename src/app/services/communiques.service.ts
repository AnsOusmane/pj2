import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Communique {
  title: string;
  description?: string;
  file: File;
}

export interface CommuniqueResponse {
  message: string;
  data: {
    id: number;
    title: string;
    description: string | null;
    file_path: string;
    created_at: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CommuniqueService {
  private apiUrl = `${environment.apiBaseUrl}/communiques`;

  constructor(private http: HttpClient) {}

  addCommunique(data: Communique): Observable<CommuniqueResponse> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('file', data.file);

    return this.http.post<CommuniqueResponse>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(message));
  }
}