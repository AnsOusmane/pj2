import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    fullname: string;
    email: string;
    role: 'admin' | 'user' | 'cellule-pm';
    permissions: string[];
  };
}

export interface User {
  id: number;
  fullname: string;
  email: string;
  role: 'admin' | 'user' | 'cellule-pm';
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { 
      email, 
      password 
    }).pipe(
      tap(response => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  /** Un admin a accès à tout ; sinon on vérifie la liste de permissions. */
  hasPermission(key: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    if (user.role === 'admin') return true;
    return (user.permissions || []).includes(key);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        // Compatibilité avec d'anciennes sessions sans permissions.
        if (!Array.isArray(user.permissions)) {
          user.permissions = [];
        }
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Erreur parsing user storage');
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}