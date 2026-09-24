import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DaycareAppointmentsService } from './daycare-appointments.service';
import { environment } from '../../../environments/environment';

describe('DaycareAppointmentsService', () => {
  let service: DaycareAppointmentsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DaycareAppointmentsService]
    });
    service = TestBed.inject(DaycareAppointmentsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageSlots with payload and handle success', () => {
      let response: any;
      const payload = { slot: '10:00' };
      service.manageSlots(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/manageSlotsBySlotDuration`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle manageSlots error (500)', () => {
      let errResp: any;
      service.manageSlots({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/manageSlotsBySlotDuration`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getSlotTime with params and handle success', () => {
      let response: any;
      service.getSlotTime('2023-01-01', 5, 30).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getSlotDate?slotDate=2023-01-01&regionHours=5&regionMinutes=30`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getSlotTime network error (0)', () => {
      let errResp: any;
      service.getSlotTime('2023-01-01', 5, 30).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getSlotDate?slotDate=2023-01-01&regionHours=5&regionMinutes=30`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });
  });
});
