import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface User {
  id: number;
  fullname: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
}

export interface CreateUserDto {
  fullname: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
}

export interface UpdateUserDto {
  fullname?: string;
  email?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  create(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData).pipe(catchError(this.handleError));
  }

  update(id: number, userData: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error?.message) message = error.error.message;
    console.error('Erreur API Users :', error);
    return throwError(() => new Error(message));
  }
}