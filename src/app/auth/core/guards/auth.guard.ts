import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../../../login/login.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

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

    return true;
  }
}
