import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, finalize, shareReplay } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    fullname: string;
    email: string;
    role: 'admin' | 'user';
    permissions: string[];
  };
}

export interface User {
  id: number;
  fullname: string;
  email: string;
  role: 'admin' | 'user';
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  /** Access token court : gardé UNIQUEMENT en mémoire (jamais en localStorage). */
  private accessToken: string | null = null;

  /** Timer de rafraîchissement proactif (avant expiration de l'access token). */
  private refreshTimer: any = null;

  /** Rafraîchissement en cours partagé (évite les appels concurrents). */
  private refreshInFlight$: Observable<LoginResponse> | null = null;

  private readonly isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // On restaure le profil (pour l'affichage immédiat) ; l'access token, lui,
    // est récupéré via /auth/refresh au démarrage (voir initSession()).
    this.loadUserFromStorage();
  }

  // ============================================================
  // CONNEXION / DÉCONNEXION
  // ============================================================
  login(email: string, password: string): Observable<LoginResponse> {
    // withCredentials : indispensable pour recevoir le cookie refresh (cross-site).
    return this.http.post<LoginResponse>(
      `${environment.apiBaseUrl}/auth/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(response => this.setSession(response))
    );
  }

  logout(): void {
    // Best-effort : demander au backend d'effacer le cookie refresh.
    this.http.post(`${environment.apiBaseUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({ next: () => {}, error: () => {} });
    this.clearSession();
  }

  // ============================================================
  // RAFRAÎCHISSEMENT DU TOKEN
  // ============================================================
  /**
   * Échange le cookie refresh contre un nouvel access token.
   * Partagé : plusieurs appels simultanés ne déclenchent qu'une seule requête.
   */
  refreshToken(): Observable<LoginResponse> {
    if (this.refreshInFlight$) return this.refreshInFlight$;

    this.refreshInFlight$ = this.http.post<LoginResponse>(
      `${environment.apiBaseUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => this.setSession(response)),
      finalize(() => { this.refreshInFlight$ = null; }),
      shareReplay(1)
    );

    return this.refreshInFlight$;
  }

  /**
   * Appelé au démarrage de l'app (APP_INITIALIZER). Si un profil est présent
   * (une session existait), on récupère un access token frais via le cookie
   * refresh. Sinon (visiteur anonyme, ou côté serveur SSR) on ne fait rien.
   */
  initSession(): Promise<void> {
    if (!this.isBrowser) return Promise.resolve();
    if (!this.currentUserSubject.value) return Promise.resolve();

    return new Promise(resolve => {
      this.refreshToken().subscribe({
        next: () => resolve(),
        error: () => { this.clearSession(); resolve(); }
      });
    });
  }

  // ============================================================
  // ÉTAT / GETTERS
  // ============================================================
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
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

  getToken(): string | null {
    return this.accessToken;
  }

  // ============================================================
  // INTERNE
  // ============================================================
  private setSession(response: LoginResponse): void {
    if (!response?.token) return;
    this.accessToken = response.token;
    this.currentUserSubject.next(response.user);
    if (this.isBrowser) {
      // On ne stocke QUE le profil (affichage + indicateur « une session existe »).
      // Le token d'accès reste en mémoire, le refresh dans un cookie httpOnly.
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
    this.scheduleRefresh(response.token);
  }

  private clearSession(): void {
    this.accessToken = null;
    this.currentUserSubject.next(null);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token'); // nettoyage d'anciennes sessions
    }
  }

  /** Programme un refresh ~45 s avant l'expiration de l'access token. */
  private scheduleRefresh(token: string): void {
    if (!this.isBrowser) return;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    const expMs = this.getTokenExpiry(token);
    if (!expMs) return;

    // 45 s de marge, minimum 5 s pour éviter une boucle si le token est déjà court.
    const delay = Math.max(expMs - Date.now() - 45_000, 5_000);
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().subscribe({
        next: () => {},
        error: () => this.clearSession()
      });
    }, delay);
  }

  /** Lit le champ `exp` (en ms) du JWT sans librairie externe. */
  private getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr) as User;
      // Compatibilité avec d'anciennes sessions sans permissions.
      if (!Array.isArray(user.permissions)) user.permissions = [];
      this.currentUserSubject.next(user);
    } catch (e) {
      console.error('Erreur parsing user storage');
    }
  }
}
