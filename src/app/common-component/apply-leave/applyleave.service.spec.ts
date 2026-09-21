import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApplyleaveService } from './applyleave.service';
import { environment } from '../../../environments/environment';

describe('ApplyleaveService', () => {
  let service: ApplyleaveService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApplyleaveService]
    });
    service = TestBed.inject(ApplyleaveService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageLeaves with payload and handle success', () => {
      let response: any;
      const payload = { leaveType: 'sick' };
      service.manageLeaves(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/MarkEmployeeLeave`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle manageLeaves error (400)', () => {
      let errResp: any;
      service.manageLeaves({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/MarkEmployeeLeave`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getEmployeeLeave with params and handle success', () => {
      let response: any;
      service.getEmployeeLeave(1, 2, 3, '2023-01-01', '2023-01-31').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getEmployeeLeave?employeeId=1&centreID=2&userRoleID=3&startDate=2023-01-01&endDate=2023-01-31`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getEmployeeLeave network timeout (0)', () => {
      let errResp: any;
      service.getEmployeeLeave(1, 2, 3, '2023-01-01', '2023-01-31').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Attendance/getEmployeeLeave?employeeId=1&centreID=2&userRoleID=3&startDate=2023-01-01&endDate=2023-01-31`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });

    it('should call getTocSlotbyUserid with params and handle success', () => {
      let response: any;
      service.getTocSlotbyUserid(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getTocSlotbyUserid?UserId=1&CentreId=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getTocSlotbyUserid error (404)', () => {
      let errResp: any;
      service.getTocSlotbyUserid(99, 99).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getTocSlotbyUserid?UserId=99&CentreId=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });
  });
});
