import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { AuthGuard } from './auth.guard';
import { AuthService, User } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let currentUser$: BehaviorSubject<User | null>;
  let router: jasmine.SpyObj<Router>;

  const state = { url: '/admin/ppm-gestion' } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;

  beforeEach(() => {
    currentUser$ = new BehaviorSubject<User | null>(null);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { currentUser$ } },
        { provide: Router, useValue: router }
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('allows access when a user is logged in', (done) => {
    currentUser$.next({ id: 1, fullname: 'A', email: 'a@sencsu.sn', role: 'user', permissions: [] });

    guard.canActivate(route, state).pipe(take(1)).subscribe(result => {
      expect(result).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('blocks access and redirects to /login with a returnUrl when no user is logged in', (done) => {
    guard.canActivate(route, state).pipe(take(1)).subscribe(result => {
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/admin/ppm-gestion' }
      });
      done();
    });
  });
});
