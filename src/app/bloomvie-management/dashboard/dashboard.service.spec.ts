import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { environment } from '../../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageApproval with payload and handle success', () => {
      let response: any;
      const payload = { approval: true };
      service.manageApproval(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/manageApproval`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle manageApproval error (400)', () => {
      let errResp: any;
      service.manageApproval({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/manageApproval`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getAllJobs with params and handle success', () => {
      let response: any;
      service.getAllJobs('active').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/getJobpostingAllList?status=active`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getInterestedDayCare with params and handle success', () => {
      let response: any;
      service.getInterestedDayCare(1, 'john').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getInterestedDayCare?UserType=1&name=john`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getDashBoardCount with params and handle success', () => {
      let response: any;
      service.getDashBoardCount(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getDashBoardCount?UserTypeID=1&UserID=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getDashBoardCount error (500)', () => {
      let errResp: any;
      service.getDashBoardCount(1, 2).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getDashBoardCount?UserTypeID=1&UserID=2`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getAppliedJobTOCListByStatus with params and handle success', () => {
      let response: any;
      service.getAppliedJobTOCListByStatus('john', 5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getAppliedJobTOCListByStatus?Name=john&statusID=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
