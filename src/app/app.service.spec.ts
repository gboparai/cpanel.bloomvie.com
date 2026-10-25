import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { of, throwError } from 'rxjs';
import { AppService } from './app.service';
import { CommonService } from './common-component/common.service';
import { LoginService } from './login/login.service';

describe('AppService', () => {
  let service: AppService;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;

  beforeEach(() => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['TokenMatchQueryParam']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['set', 'get', 'check']);
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['generateNewAccessToken']);

    TestBed.configureTestingModule({
      providers: [
        AppService,
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: ActivatedRoute, useValue: {} },
      ],
    });

    service = TestBed.inject(AppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('changeFavicon', () => {
    it('should update or create favicon link tag in document head', () => {
      service.changeFavicon('https://example.com/custom-favicon.ico');
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      expect(favicon).toBeTruthy();
      expect(favicon.href).toContain('custom-favicon.ico');
    });
  });

  describe('sendData and data$ stream', () => {
    it('should emit data through data$ Subject', (done: DoneFn) => {
      const testPayload = { key: 'status', value: 'active' };

      service.data$.subscribe(val => {
        expect(val).toEqual(testPayload);
        done();
      });

      service.sendData(testPayload);
    });
  });

  describe('initAuth', () => {
    it('should resolve immediately when no urlToken parameter in location', async () => {
      // Current test runner URL has no urlToken
      await expectAsync(service.initAuth()).toBeResolved();
    });
  });
});
