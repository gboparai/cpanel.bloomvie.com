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
      providers: [WorkTimingService],
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

  it('should post work timings', () => {
    const data = { centreID: 5, timings: [{ day: 'Monday', open: '08:00', close: '17:00' }] };
    service.saveWorkTimings(data).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageCentreWorkingDays`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ success: true });
  });

  it('should get centre working days by centreID', () => {
    service.getCentreWorkingDaysByCentreID(5).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Centre/getCentreWorkingDaysByCentreID?centreID=5`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should post manageDaycareCentreHoliday', () => {
    const holiday = { holidayName: 'Victoria Day', date: '2026-05-18' };
    service.manageDaycareCentreHoliday(holiday).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Centre/manageDaycareCentreHolidays`
    );
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should get holiday list for dayCareID', () => {
    service.getCentreHolidayList(5).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Centre/getDaycareCentreHolidayList?dayCareID=5`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should post activeInactiveHolidays with dayCareID param and body', () => {
    const list = [1, 2, 3];
    service.activeInactiveHolidays(5, list).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Centre/activeInactiveHolidays?dayCareID=5`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(list);
    req.flush({ success: true });
  });

  it('should delete holiday with ID param', () => {
    service.deleteHoliday(12).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Centre/deleteDaycareHoliday?ID=12`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
