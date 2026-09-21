import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ParentDashboardService } from './parent-dashboard.service';
import { environment } from '../../../environments/environment';

describe('ParentDashboardService', () => {
  let service: ParentDashboardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ParentDashboardService]
    });
    service = TestBed.inject(ParentDashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call CheckParentOnboarding with params and handle success', () => {
      let response: any;
      service.CheckParentOnboarding(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/CheckParentOnboarding?studentID=1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle CheckParentOnboarding error (404)', () => {
      let errResp: any;
      service.CheckParentOnboarding(999).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/CheckParentOnboarding?studentID=999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getTeacherCount with params and handle success', () => {
      let response: any;
      service.getTeacherCount(5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getTeacherCountforParentDashboard?id=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getEventByStudentID with params and handle success', () => {
      let response: any;
      service.getEventByStudentID(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getEventByStudentID?studentID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getAllPendingPaymentsByStudentID with params and handle success', () => {
      let response: any;
      service.getAllPendingPaymentsByStudentID(15).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getAllPendingPaymentsByStudentID?StudentID=15`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call ClearStudentPendingPayments with payload and params and handle success', () => {
      let response: any;
      const payload = [{ id: 1 }];
      service.ClearStudentPendingPayments(payload, 20).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPayment/ClearStudentPendingPayments?CentreID=20`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle ClearStudentPendingPayments network timeout (0)', () => {
      let errResp: any;
      service.ClearStudentPendingPayments([], 20).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPayment/ClearStudentPendingPayments?CentreID=20`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });
  });
});
