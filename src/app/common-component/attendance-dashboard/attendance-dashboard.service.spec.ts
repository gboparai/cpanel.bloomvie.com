import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AttendanceDashboardService } from './attendance-dashboard.service';
import { environment } from '../../../environments/environment';

describe('AttendanceDashboardService', () => {
  let service: AttendanceDashboardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AttendanceDashboardService]
    });
    service = TestBed.inject(AttendanceDashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getAttendanceByID with params and handle success', () => {
      let response: any;
      service.getAttendanceByID(1, '2023-01-01', '2023-01-31').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getAttendanceByID?ID=1&startDate=2023-01-01&endDate=2023-01-31`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getAttendanceByID network error (0)', () => {
      let errResp: any;
      service.getAttendanceByID(1, '2023-01-01', '2023-01-31').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getAttendanceByID?ID=1&startDate=2023-01-01&endDate=2023-01-31`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call getstaffAttendanceByCentreID with params and handle success', () => {
      let response: any;
      service.getstaffAttendanceByCentreID(1, '2023-01-01', '2023-01-31', 2, 3).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getstaffAttendanceByCentreID?centreID=1&startDate=2023-01-01&endDate=2023-01-31&userRoleId=2&classId=3`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getEmployeeAllDetails with params and handle success', () => {
      let response: any;
      service.getEmployeeAllDetails(1, '2023-01-01', '2023-01-31', 2, 5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getEmployeeAllDetails?centreID=1&startDate=2023-01-01&endDate=2023-01-31&userRoleId=2&employeeID=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getEmployeeAllDetails error (404)', () => {
      let errResp: any;
      service.getEmployeeAllDetails(99, '2023-01-01', '2023-01-31', 2, 5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getEmployeeAllDetails?centreID=99&startDate=2023-01-01&endDate=2023-01-31&userRoleId=2&employeeID=5`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getTodayAttendanceSummaryByCentreID with params and handle success', () => {
      let response: any;
      service.getTodayAttendanceSummaryByCentreID(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getTodayAttendanceSummaryByCentreID?centreID=1&userRoleId=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getTodayAttendanceSummaryByCentreID error (500)', () => {
      let errResp: any;
      service.getTodayAttendanceSummaryByCentreID(1, 2).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getTodayAttendanceSummaryByCentreID?centreID=1&userRoleId=2`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getDayCareByID with params and handle success', () => {
      let response: any;
      service.getDayCareByID(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getCentreByID?ID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
