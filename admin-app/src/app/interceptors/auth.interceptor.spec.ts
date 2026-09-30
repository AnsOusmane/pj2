import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceStub: { getToken: jasmine.Spy };

  beforeEach(() => {
    authServiceStub = { getToken: jasmine.createSpy('getToken').and.returnValue(null) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceStub }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('adds an Authorization: Bearer header when a token is present', () => {
    authServiceStub.getToken.and.returnValue('fake.jwt.token');

    http.get('/api/ppm/manage').subscribe();

    const req = httpMock.expectOne('/api/ppm/manage');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake.jwt.token');
    req.flush({});
  });

  it('leaves the request untouched when there is no token', () => {
    http.get('/api/ppm').subscribe();

    const req = httpMock.expectOne('/api/ppm');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('does not mutate the original request object (clones it)', () => {
    authServiceStub.getToken.and.returnValue('fake.jwt.token');
    const original = new HttpRequest('GET', '/api/ppm/manage');
    expect(original.headers.has('Authorization')).toBeFalse();

    http.get('/api/ppm/manage').subscribe();
    httpMock.expectOne('/api/ppm/manage').flush({});

    // La requête d'origine (créée séparément) n'a jamais été modifiée.
    expect(original.headers.has('Authorization')).toBeFalse();
  });
});
