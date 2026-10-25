import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginService } from '../../../login/login.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['user', 'loadUserFromStorage', 'getUrlParameters', 'isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when authenticated', () => {
    loginServiceSpy.user.and.returnValue({ token: 'tok', centreId: 1 } as any);
    loginServiceSpy.isAuthenticated.and.returnValue(true);
    loginServiceSpy.getUrlParameters.and.returnValue('token123');

    expect(guard.canActivate()).toBeTrue();
  });

  it('should redirect to login and prevent activation when not authenticated and no urlToken', () => {
    loginServiceSpy.user.and.returnValue(null as any);
    loginServiceSpy.isAuthenticated.and.returnValue(false);
    loginServiceSpy.getUrlParameters.and.returnValue(null);

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
