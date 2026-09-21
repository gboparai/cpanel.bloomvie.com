import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DaycareManualAppointmentService } from './daycare-manual-appointment.service';
import { environment } from '../../../../environments/environment';

describe('DaycareManualAppointmentService', () => {
  let service: DaycareManualAppointmentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DaycareManualAppointmentService]
    });
    service = TestBed.inject(DaycareManualAppointmentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getAllCentreTypes and handle success', () => {
      let response: any;
      service.getAllCentreTypes().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllCentreTypes`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getAllCentreTypes error (500)', () => {
      let errResp: any;
      service.getAllCentreTypes().subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllCentreTypes`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call manageForDayCareInterestedUsers with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.manageForDayCareInterestedUsers(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/manageForDayCareInterestedUsers`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getAvailableSlots with params and handle success', () => {
      let response: any;
      service.getAvailableSlots(1, '2023-01-01', 5, 30).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getAvailableSlots?counsellorId=1&date=2023-01-01&regionHours=5&regionMinutes=30`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getAvailableSlots network error (0)', () => {
      let errResp: any;
      service.getAvailableSlots(1, '2023-01-01', 5, 30).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getAvailableSlots?counsellorId=1&date=2023-01-01&regionHours=5&regionMinutes=30`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });
  });
});
