import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from './common-component/common.service';
import { LoginService } from './login/login.service';
@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private cookie: CookieService,
    private loginService :LoginService
  ) {}
  changeFavicon(iconUrl: string) {
    const head = document.head || document.getElementsByTagName('head')[0];
    const favicon = this.getOrCreateFavicon();
    favicon.href = iconUrl;
    head.appendChild(favicon);
  }

  private getOrCreateFavicon(): HTMLLinkElement {
    let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    return favicon;
  }

  initAuth(): Promise<void> {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('urlToken');

    if (!token) {
      console.warn('No urlToken found in query params');
      return Promise.resolve(); // Don't block app
    }

    return new Promise((resolve, reject) => {
      this.commonService.TokenMatchQueryParam(token).subscribe({
        next: (response) => {
          const jwtToken = response.token;
          if (jwtToken && response.result) {
            response.result['token'] = jwtToken;
            let userInfo = JSON.stringify(response);
            this.cookie.set('UserInfo', userInfo);
          }
          if (response?.result) {
            this.cookie.set('CentreID', response.result.centreID);
            this.cookie.set('UserId', response.result.id);
            this.cookie.set('UserRoleId', response.result.userRoleID);
            this.cookie.set('email', response.result.email);
          }
          resolve();
        },
        error: (err) => {
          console.error('Token validation failed', err);
          resolve(); // Still resolve to allow app startup
        },
      });
    });
  }


  private dataSource = new Subject<any>();
  data$ = this.dataSource.asObservable();

  sendData(data: { key: any; value: any }) {
    this.dataSource.next(data);
  }
}
