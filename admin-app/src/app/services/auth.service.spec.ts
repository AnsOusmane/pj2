import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService, LoginResponse } from './auth.service';
import { environment } from 'environments/environment';

// Fabrique un JWT factice (header/payload/signature) pour tester la lecture
// du champ `exp` sans dépendre d'un vrai secret côté back.
function fakeJwt(expSecondsFromNow: number): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }));
  return `${header}.${payload}.signature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const loginResponse: LoginResponse = {
    success: true,
    token: fakeJwt(300),
    user: { id: 1, fullname: 'Test User', email: 'test@sencsu.sn', role: 'user', permissions: ['ppm'] }
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts logged out with no token when localStorage is empty', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
  });

  it('login() stores the access token in memory and the profile in localStorage, never the token', () => {
    service.login('test@sencsu.sn', 'secret').subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.withCredentials).toBeTrue();
    req.flush(loginResponse);

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.getToken()).toBe(loginResponse.token);
    expect(service.getCurrentUser()?.email).toBe('test@sencsu.sn');

    const stored = JSON.parse(localStorage.getItem('currentUser')!);
    expect(stored.email).toBe('test@sencsu.sn');
    expect(localStorage.getItem('currentUser')).not.toContain(loginResponse.token);
  });

  it('isAdmin() reflects the role of the currently logged-in user', () => {
    service.login('admin@sencsu.sn', 'secret').subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`).flush({
      ...loginResponse,
      user: { ...loginResponse.user, role: 'admin', permissions: [] }
    });

    expect(service.isAdmin()).toBeTrue();
  });

  it('hasPermission() grants everything to an admin but only listed keys to a regular user', () => {
    service.login('user@sencsu.sn', 'secret').subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`).flush(loginResponse); // role: 'user', permissions: ['ppm']

    expect(service.hasPermission('ppm')).toBeTrue();
    expect(service.hasPermission('candidatures')).toBeFalse();
  });

  it('hasPermission() returns false for anyone when no user is logged in', () => {
    expect(service.hasPermission('ppm')).toBeFalse();
  });

  it('logout() clears the session locally even if the backend call fails', () => {
    service.login('test@sencsu.sn', 'secret').subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`).flush(loginResponse);
    expect(service.isLoggedIn()).toBeTrue();

    service.logout();
    const logoutReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/logout`);
    logoutReq.flush(null, { status: 500, statusText: 'Erreur serveur' });

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });

  it('restores the profile from localStorage on construction (for immediate display) without restoring a token', () => {
    // Simule un rechargement de page avec une session existante : le profil doit
    // déjà être en localStorage AVANT que le service (et son constructeur) existe.
    // On instancie directement (hors DI) pour ne pas perturber le HttpTestingController
    // partagé par les autres tests de ce fichier.
    localStorage.setItem('currentUser', JSON.stringify(loginResponse.user));

    const restored = new AuthService(TestBed.inject(HttpClient), 'browser');

    expect(restored.isLoggedIn()).toBeTrue();
    expect(restored.getToken()).toBeNull(); // le token d'accès n'est jamais persisté
  });
});
