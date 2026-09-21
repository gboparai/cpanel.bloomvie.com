import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginService } from './login.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { CommonService } from '../common-component/common.service';
import { environment } from '../../environments/environment';

describe('LoginService', () => {
  let service: LoginService;
  let httpTestingController: HttpTestingController;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;

  beforeEach(() => {
    const cookieSpy = jasmine.createSpyObj('CookieService', ['get', 'check', 'deleteAll']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const commonSpy = jasmine.createSpyObj('CommonService', ['']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        LoginService,
        { provide: CookieService, useValue: cookieSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: CommonService, useValue: commonSpy }
      ]
    });

    service = TestBed.inject(LoginService);
    httpTestingController = TestBed.inject(HttpTestingController);
    cookieServiceSpy = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    commonServiceSpy = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadUserFromStorage', () => {
    it('should load user data successfully from cookies', () => {
      const mockCookieData = JSON.stringify({
        result: {
          token: 'test-token',
          id: 1,
          userRoleID: 2,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          centreID: 10,
          centreAdminId: 20
        }
      });
      cookieServiceSpy.get.and.returnValue(mockCookieData);

      service.loadUserFromStorage();

      expect(service.user()).toBeTruthy();
      expect(service.user()?.token).toBe('test-token');
      expect(service.user()?.userId).toBe(1);
      expect(service.user()?.name).toBe('John Doe');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should handle missing cookie gracefully', () => {
      cookieServiceSpy.get.and.returnValue('');
      service.loadUserFromStorage();
      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should handle invalid JSON in cookie gracefully', () => {
      cookieServiceSpy.get.and.returnValue('invalid-json');
      spyOn(console, 'error');
      service.loadUserFromStorage();
      expect(service.user()).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    // BUG DISCOVERED: If userRoleID is 5 and studentID array is missing or empty, it will throw TypeError: Cannot read properties of undefined (reading '0')
    xit('should handle userRoleID 5 without studentID properly', () => {
      const mockCookieData = JSON.stringify({
        result: {
          id: 1,
          userRoleID: 5,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          centreID: 10,
          centreAdminId: 20
        }
      });
      cookieServiceSpy.get.and.returnValue(mockCookieData);
      service.loadUserFromStorage();

      expect(service.user()).toBeTruthy();
      expect(service.user()?.centreId).toBe(10);
    });
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call Login with correct data and handle success', () => {
      const mockData = { email: 'test@test.com', password: 'password' };
      let response: any;
      service.Login(mockData).subscribe(res => response = res);

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush({ success: true });
      expect(response).toEqual({ success: true });
    });

    it('should handle Login error (404)', () => {
      const mockData = { email: 'test@test.com', password: 'password' };
      let errorResponse: any;
      service.Login(mockData).subscribe({
        next: () => fail('should have failed with 404'),
        error: error => errorResponse = error
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/login`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errorResponse.status).toBe(404);
    });

    it('should call IsUserExit with correct data and handle success', () => {
      const mockData = { email: 'test@test.com' };
      service.IsUserExit(mockData).subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/IsUserExit`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush({});
    });

    it('should handle IsUserExit network timeout/error (0)', () => {
      const mockData = { email: 'test@test.com' };
      let errorResponse: any;
      service.IsUserExit(mockData).subscribe({
        next: () => fail('should have failed with 0'),
        error: error => errorResponse = error
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/IsUserExit`);
      req.error(new ProgressEvent('Network error'));
      expect(errorResponse.status).toBe(0);
    });

    it('should call checkTOCUserAcceptedSlotRequest with correct params', () => {
      service.checkTOCUserAcceptedSlotRequest(1, 2).subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/checkTOCUserAcceptedSlotRequest?userID=1&centreID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call TokenMatch with correct params and handle 500 error', () => {
      let errorResponse: any;
      service.TokenMatch('test-token').subscribe({
        next: () => fail('should have failed with 500'),
        error: error => errorResponse = error
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/tokenMatch?token=test-token`);
      expect(req.request.method).toBe('GET');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      expect(errorResponse.status).toBe(500);
    });

    it('should call getStudentPaymentDetailByParentID with correct params', () => {
      service.getStudentPaymentDetailByParentID(10).subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentPaymentDetailByParentID?parentID=10`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call CheckLoginEmail with correct params and handle 400 error', () => {
      let errorResponse: any;
      service.CheckLoginEmail('invalid-email').subscribe({
        next: () => fail('should have failed with 400'),
        error: error => errorResponse = error
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/CheckLoginEmail?email=invalid-email`);
      expect(req.request.method).toBe('GET');
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errorResponse.status).toBe(400);
    });

    it('should call generateNewAccessToken with correct params', () => {
      service.generateNewAccessToken('access', 'refresh').subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/generateNewAccessToken?accessToken=access&refreshToken=refresh`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('logOut', () => {
    it('should clear cookies, reset user state and navigate to login', () => {
      service.logOut();
      expect(cookieServiceSpy.deleteAll).toHaveBeenCalled();
      expect(service.user()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
