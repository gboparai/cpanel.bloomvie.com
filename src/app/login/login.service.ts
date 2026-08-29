import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { userInfo } from 'os';
import { OnboardingService } from '../onboarding/onboarding.service';
import { Router } from '@angular/router';
import { CommonService } from '../common-component/common.service';

export interface AuthData {
  token: string;
  userId: number;
  userRoleId: number;
  email: string;
  name: string;
  centreId: number;
  centreAdminId: number;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private _user = signal<AuthData | null>(null);
  public user = computed(() => this._user());
  public isAuthenticated = computed(() => !!this._user());

  readonly URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private CommonService: CommonService
  ) {}

  get authData() {
    return this.user();
  }

  loadUserFromStorage() {
    const storedAuthData = this.cookieService.get('UserInfo');

    let centreAdminID: number = 0;
    if (this.cookieService.check('CentreAdminID')) {
      centreAdminID = parseInt(this.cookieService.get('CentreAdminID'));
    }

    if (storedAuthData) {
      try {
        const authJson = JSON.parse(storedAuthData)?.result || null;

        if (authJson) {
          const authData: AuthData = {
            token: authJson.token || '',
            userId: authJson.id,
            userRoleId: authJson.userRoleID,
            name: `${authJson.firstName ?? ''} ${
              authJson.lastName ?? ''
            }`.trim(),
            email: authJson.email,
            centreId:
              authJson.userRoleID == 5
                ? authJson.studentID
                  ? authJson.studentID[0].centreID
                  : authJson.centreID
                : authJson.centreID,
            centreAdminId:
              authJson.userRoleID == 5
                ? authJson.studentID
                  ? authJson.studentID[0].adminID
                  : centreAdminID
                : authJson.centreAdminId,
          };
          this._user.set(authData);
        }
      } catch (e) {
        console.error('Failed to parse auth cookie:', e);
      }
    }
  }

  getUrlParameters() {
    const url = new URL(window.location.href);
    return url.searchParams.get('urlToken');
  }

  Login(loginForm: any): Observable<any> {
    return this.http.post<any>(this.URL + '/Login/login', loginForm);
  }

  IsUserExit(loginForm: any): Observable<any> {
    return this.http.post<any>(this.URL + '/Login/IsUserExit', loginForm);
  }

  checkTOCUserAcceptedSlotRequest(userID: any, centreID: any): Observable<any> {
    return this.http.get(this.URL + '/Login/checkTOCUserAcceptedSlotRequest', {
      params: { userID, centreID },
    });
  }

  TokenMatch(token: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/Login/tokenMatch?token=${token}`);
  }

  getStudentPaymentDetailByParentID(parentID: any): Observable<any> {
    return this.http.get<any>(
      this.URL + '/DayCareCentreUser/getStudentPaymentDetailByParentID',
      { params: { parentID } }
    );
  }

  logOut(): void {
    const cookiesDomain = environment.cookiesDomain;
    this.cookieService.deleteAll();
    this.cookieService.deleteAll('/', cookiesDomain);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  CheckLoginEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/User/CheckLoginEmail`, {
      params: { email },
    });
  }

   generateNewAccessToken(accessToken:string,refreshToken:string){
    return this.http.get<any>(this.URL + '/Login/generateNewAccessToken',{params:{accessToken,refreshToken}});
  }

}
