import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export type UserRole = 'admin' | 'user' | 'cellule-pm';

export interface User {
  id: number;
  fullname: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  permissions: string[];
  created_at: string;
}

export interface CreateUserDto {
  fullname: string;
  email: string;
  password: string;
  role?: UserRole;
  is_active?: boolean;
  permissions?: string[];
}

export interface UpdateUserDto {
  fullname?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
  permissions?: string[];
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
    if (error.error?.message) {
      message = error.error.message;
    } else if (Array.isArray(error.error?.errors) && error.error.errors.length) {
      // ZodError renvoyée par le backend : { errors: [{ message, path }] }
      message = error.error.errors.map((e: any) => e.message).join(' ');
    }
    console.error('Erreur API Users :', error);
    return throwError(() => new Error(message));
  }
}