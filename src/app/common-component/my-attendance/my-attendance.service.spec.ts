import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MyAttendanceService } from './my-attendance.service';
import { environment } from '../../../environments/environment';

describe('MyAttendanceService', () => {
  let service: MyAttendanceService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MyAttendanceService]
    });
    service = TestBed.inject(MyAttendanceService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getMyAttendanceByID with params and handle success', () => {
      let response: any;
      service.getMyAttendanceByID(1, '2023-01-01', '2023-01-31', 2, 3).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getMyAttendanceByID?ID=1&startDate=2023-01-01&endDate=2023-01-31&userRoleId=2&centreID=3`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getMyAttendanceByID network error (0)', () => {
      let errResp: any;
      service.getMyAttendanceByID(1, '2023-01-01', '2023-01-31', 2, 3).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getMyAttendanceByID?ID=1&startDate=2023-01-01&endDate=2023-01-31&userRoleId=2&centreID=3`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call getCurrentMonthAttendanceSummaryByID with params and handle success', () => {
      let response: any;
      service.getCurrentMonthAttendanceSummaryByID(1, 2, 3).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getCurrentMonthAttendanceSummaryByID?ID=1&userRoleId=2&centreID=3`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getDaycareSeasonalHolidayList with params and handle success', () => {
      let response: any;
      service.getDaycareSeasonalHolidayList(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getDaycareSeasonalHolidayList?dayCareID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getStudentDetailByStudentId with params and handle success', () => {
      let response: any;
      service.getStudentDetailByStudentId(5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getStudentProfileByStudentID?id=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getStudentDetailByStudentId error (404)', () => {
      let errResp: any;
      service.getStudentDetailByStudentId(99).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getStudentProfileByStudentID?id=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call checkTodayAttandanceStatusById with params and handle success', () => {
      let response: any;
      service.checkTodayAttandanceStatusById(1, 2, 3).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/checkTodayAttandanceStatusById?userId=1&userRoleId=2&centreID=3`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle checkTodayAttandanceStatusById error (500)', () => {
      let errResp: any;
      service.checkTodayAttandanceStatusById(1, 2, 3).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/checkTodayAttandanceStatusById?userId=1&userRoleId=2&centreID=3`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });
  });
});
