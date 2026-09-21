import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HeaderServiceService } from './header-service.service';
import { environment } from '../../../environments/environment';

describe('HeaderServiceService', () => {
  let service: HeaderServiceService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HeaderServiceService]
    });
    service = TestBed.inject(HeaderServiceService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Signal & Subject state management', () => {
    it('should update triggerModal signal', () => {
      expect(service.triggerModal()).toBeFalse();
      service.updateTriggerModal(true);
      expect(service.triggerModal()).toBeTrue();
    });

    it('should update triggerTermsAndCondition signal', () => {
      expect(service.triggerTermsAndCondition()).toBeFalse();
      service.updateTriggerTermsAndCondition();
      expect(service.triggerTermsAndCondition()).toBeTrue();
    });

    it('should emit on notificationSubject', (done) => {
      // First skip the initial true value
      let callCount = 0;
      service.notification.subscribe(val => {
        callCount++;
        if (callCount === 2) {
          expect(val).toBeTrue();
          done();
        }
      });
      service.onReceivedNotification();
    });
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call CheckParentOnboarding with correct params and handle success', () => {
      service.CheckParentOnboarding(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/CheckParentOnboarding?UserID=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle CheckParentOnboarding error (404)', () => {
      let errResp: any;
      service.CheckParentOnboarding(999).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/CheckParentOnboarding?UserID=999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getAllStudentsByParentID with correct params and handle success', () => {
      service.getAllStudentsByParentID(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllStudentsByParentID?parentID=10`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should call CheckStudentSubscriptionPayment with correct params and handle success', () => {
      service.CheckStudentSubscriptionPayment(1, 2, 3, 4).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/CheckStudentSubscriptionPaymentByParentId?parentId=1&userRoleId=2&studentId=3&centreId=4`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle CheckStudentSubscriptionPayment error (500)', () => {
      let errResp: any;
      service.CheckStudentSubscriptionPayment(1, 2, 3, 4).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/CheckStudentSubscriptionPaymentByParentId?parentId=1&userRoleId=2&studentId=3&centreId=4`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call checkStudentOnboardingCompleteOrNotByStudentID with correct params and handle success', () => {
      service.checkStudentOnboardingCompleteOrNotByStudentID(5).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/checkStudentOnboardingCompleteOrNotByStudentID?StudentID=5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call generateExpressLoginLink with correct params and body and handle success', () => {
      service.generateExpressLoginLink('acct_123').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Payment/express-login-link?connectedAccountId=acct_123`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({});
    });

    it('should handle generateExpressLoginLink network error (0)', () => {
      let errResp: any;
      service.generateExpressLoginLink('acct_123').subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Payment/express-login-link?connectedAccountId=acct_123`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
