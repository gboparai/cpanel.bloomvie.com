import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../../../login/login.service';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private loginService: LoginService,
    private router: Router,
    private cookie: CookieService
  ) {}

  canActivate(): boolean {
    const user = this.loginService.user();
    if (!user?.token || user.centreId === 0) {
      this.loginService.loadUserFromStorage();
    }
    let urlToken = this.loginService.getUrlParameters();

    if (!this.loginService.isAuthenticated() && !urlToken) {
      this.router.navigate(['/login']);
      return false;
    }

    if (this.cookie.get('MustChangePassword') === 'true') {
      this.router.navigate(['/change-the-password']);
      return false;
    }

    return true;
  }
}
