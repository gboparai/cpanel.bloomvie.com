import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginService } from '../../../login/login.service';
import { CookieService } from 'ngx-cookie-service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let cookieSpy: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['user', 'loadUserFromStorage', 'getUrlParameters', 'isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    cookieSpy = jasmine.createSpyObj('CookieService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CookieService, useValue: cookieSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when authenticated and MustChangePassword is not set', () => {
    loginServiceSpy.user.and.returnValue({ token: 'mock-token', centreId: 1 } as any);
    loginServiceSpy.isAuthenticated.and.returnValue(true);
    loginServiceSpy.getUrlParameters.and.returnValue('token123');
    cookieSpy.get.and.returnValue('');

    expect(guard.canActivate()).toBeTrue();
  });

  it('should redirect to /change-the-password if MustChangePassword cookie is true', () => {
    loginServiceSpy.user.and.returnValue({ token: 'mock-token', centreId: 1 } as any);
    loginServiceSpy.isAuthenticated.and.returnValue(true);
    loginServiceSpy.getUrlParameters.and.returnValue('token123');
    cookieSpy.get.and.returnValue('true');

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/change-the-password']);
  });

  it('should redirect to login when unauthenticated and no urlToken', () => {
    loginServiceSpy.user.and.returnValue(null as any);
    loginServiceSpy.isAuthenticated.and.returnValue(false);
    loginServiceSpy.getUrlParameters.and.returnValue(null);

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
