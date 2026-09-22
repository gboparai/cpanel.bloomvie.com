import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StudentRegistrationService } from './student-registration.service';
import { environment } from '../../environments/environment';

describe('StudentRegistrationService', () => {
  let service: StudentRegistrationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentRegistrationService]
    });
    service = TestBed.inject(StudentRegistrationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getPlanDetailsByUserID with params and handle success', () => {
      let response: any;
      service.getPlanDetailsByUserID(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getPlanDetailsByUserID?ID=1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getPlanDetailsByUserID network error (0)', () => {
      let errResp: any;
      service.getPlanDetailsByUserID(1).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getPlanDetailsByUserID?ID=1`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });

    it('should call GetAllAgeGroup with params and handle success', () => {
      let response: any;
      service.GetAllAgeGroup(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAllAgeGroupByCentreID?CentreID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call manageStudentRegistration with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.manageStudentRegistration(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageStudentRegistration`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle manageStudentRegistration error (400)', () => {
      let errResp: any;
      service.manageStudentRegistration({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageStudentRegistration`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getSubscriptionPlansByCentreAndAgeID with params and handle success', () => {
      let response: any;
      service.getSubscriptionPlansByCentreAndAgeID(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/getSubscriptionPlansByCentreAndAgeID?centreID=1&ageGroupID=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
