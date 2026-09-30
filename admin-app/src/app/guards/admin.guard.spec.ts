import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { AdminGuard } from './admin.guard';
import { AuthService, User } from '../services/auth.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let currentUser$: BehaviorSubject<User | null>;
  let router: jasmine.SpyObj<Router>;

  const state = {} as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;

  beforeEach(() => {
    currentUser$ = new BehaviorSubject<User | null>(null);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: { currentUser$ } },
        { provide: Router, useValue: router }
      ]
    });
    guard = TestBed.inject(AdminGuard);
  });

  it('allows access for an admin user', (done) => {
    currentUser$.next({ id: 1, fullname: 'Admin', email: 'admin@sencsu.sn', role: 'admin', permissions: [] });

    guard.canActivate(route, state).pipe(take(1)).subscribe(result => {
      expect(result).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('blocks a logged-in non-admin user and redirects to /login', (done) => {
    currentUser$.next({ id: 2, fullname: 'User', email: 'user@sencsu.sn', role: 'user', permissions: ['ppm'] });

    guard.canActivate(route, state).pipe(take(1)).subscribe(result => {
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('blocks access when no user is logged in', (done) => {
    guard.canActivate(route, state).pipe(take(1)).subscribe(result => {
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
