import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WorkTimingService } from './work-timings.service';
import { environment } from '../../../environments/environment';

describe('WorkTimingService', () => {
  let service: WorkTimingService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WorkTimingService]
    });
    service = TestBed.inject(WorkTimingService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call saveWorkTimings with payload and handle success', () => {
      const payload = { test: 123 };
      service.saveWorkTimings(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageCentreWorkingDays`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call getCentreWorkingDaysByCentreID and handle error (404)', () => {
      let errResp: any;
      service.getCentreWorkingDaysByCentreID(10).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getCentreWorkingDaysByCentreID?centreID=10`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call manageDaycareCentreHoliday with payload and handle success', () => {
      const payload = { test: 123 };
      service.manageDaycareCentreHoliday(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageDaycareCentreHolidays`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call getCentreHolidayList and handle error (500)', () => {
      let errResp: any;
      service.getCentreHolidayList(5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getDaycareCentreHolidayList?dayCareID=5`);
      req.flush('Error', { status: 500, statusText: 'Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call activeInactiveHolidays with payload and params and handle success', () => {
      const payload = [1, 2];
      service.activeInactiveHolidays(10, payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/activeInactiveHolidays?dayCareID=10`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call manageSeasonalBreaks with payload and handle success', () => {
      const payload = { test: 123 };
      service.manageSeasonalBreaks(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageSeasonalHolidays`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('should call getSeasonalHolidays and handle success', () => {
      service.getSeasonalHolidays(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getDaycareSeasonalHolidayList?dayCareID=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call activeInactiveSeasonalHoliday and handle success', () => {
      service.activeInactiveSeasonalHoliday(100).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/activeInactiveSeasonalHoliday?ID=100`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call deleteHoliday and handle success', () => {
      service.deleteHoliday(100).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/deleteDaycareHoliday?ID=100`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
