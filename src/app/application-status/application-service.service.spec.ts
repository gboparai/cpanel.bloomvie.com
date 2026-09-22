import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApplicationServiceService } from './application-service.service';
import { environment } from '../../environments/environment';

describe('ApplicationServiceService', () => {
  let service: ApplicationServiceService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApplicationServiceService]
    });
    service = TestBed.inject(ApplicationServiceService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getAppointmentList with params and handle success', () => {
      let response: any;
      service.getAppointmentList(1, 'search', 5, 30).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getRescheduleOrCompleteDayCareList?statusID=1&searchItem=search&regionHours=5&regionMinutes=30`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getAppointmentList error (500)', () => {
      let errResp: any;
      service.getAppointmentList(1, 'search', 5, 30).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getRescheduleOrCompleteDayCareList?statusID=1&searchItem=search&regionHours=5&regionMinutes=30`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call rescheduleMeeting with body and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.rescheduleMeeting(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/rescheduledayCareMeeting`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getPlansForDaycare with params and handle success', () => {
      let response: any;
      service.getPlansForDaycare(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllPlans?userRoleId=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getAllStudentMediaPlans with params and handle success', () => {
      let response: any;
      service.getAllStudentMediaPlans(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllStudentMediaPlans?userRoleId=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getSubscriptionPlansByID with params and handle success', () => {
      let response: any;
      service.getSubscriptionPlansByID(5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getSubscriptionPlansByID?id=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getPrimaryDayCareID with params and handle success', () => {
      let response: any;
      service.getPrimaryDayCareID('test@test.com').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getPrimaryCentreIdByEmail?CentreEmail=test@test.com`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getPrimaryDayCareID network timeout (0)', () => {
      let errResp: any;
      service.getPrimaryDayCareID('test@test.com').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getPrimaryCentreIdByEmail?CentreEmail=test@test.com`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });

    it('should call getPrimaryDayCareList with params and handle success', () => {
      let response: any;
      service.getPrimaryDayCareList(1, 'type').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getPrimaryDayCareByCentreID?centreID=1&type=type`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call sendMailPrimaryDaycareCentre with params and handle success', () => {
      let response: any;
      service.sendMailPrimaryDaycareCentre('enc1', 'enc2', 'test@test.com', 'type1').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/sendMailPrimaryDaycareCentre?planEncryptID=enc1&dayCareUserEncryptID=enc2&CentreEmail=test@test.com&DayCareType=type1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call primaryDaycareCentreRegistration with body/params and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.primaryDaycareCentreRegistration(payload, 5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/managePrimaryDaycareCentreRegistration?oldDayCareID=5`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getTrialFreeDaycares and handle success', () => {
      let response: any;
      service.getTrialFreeDaycares().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getTrialPeriodDaycares`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call activateTrial with params and handle success', () => {
      let response: any;
      service.activateTrial(10, 5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/activateTrial?intresetedDayCareId=10&days=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
