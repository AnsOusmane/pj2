import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { AdminOnlyGuard } from './admin-only.guard';
import { AuthService, User } from '../services/auth.service';

describe('AdminOnlyGuard', () => {
  let guard: AdminOnlyGuard;
  let currentUser$: BehaviorSubject<User | null>;
  let router: jasmine.SpyObj<Router>;

  const state = {} as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;

  beforeEach(() => {
    currentUser$ = new BehaviorSubject<User | null>(null);
    router = jasmine.createSpyObj('Router', ['navigate']);
    spyOn(window, 'alert');

    TestBed.configureTestingModule({
      providers: [
        AdminOnlyGuard,
        { provide: AuthService, useValue: { currentUser$ } },
        { provide: Router, useValue: router }
      ]
    });
    guard = TestBed.inject(AdminOnlyGuard);
  });

  it('allows access for an admin user without alerting', (done) => {
    currentUser$.next({ id: 1, fullname: 'Admin', email: 'admin@sencsu.sn', role: 'admin', permissions: [] });

    guard.canActivate(route, state).pipe(take(1)).subscribe(result => {
      expect(result).toBeTrue();
      expect(window.alert).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('blocks a non-admin user, alerts, and redirects to /admin/users', (done) => {
    currentUser$.next({ id: 2, fullname: 'User', email: 'user@sencsu.sn', role: 'user', permissions: [] });

    guard.canActivate(route, state).pipe(take(1)).subscribe(result => {
      expect(result).toBeFalse();
      expect(window.alert).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/admin/users']);
      done();
    });
  });
});
