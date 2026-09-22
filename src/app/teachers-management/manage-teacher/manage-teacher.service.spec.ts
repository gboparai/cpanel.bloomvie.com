import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageTeacherService } from './manage-teacher.service';
import { environment } from '../../../environments/environment';

describe('ManageTeacherService', () => {
  let service: ManageTeacherService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ManageTeacherService]
    });
    service = TestBed.inject(ManageTeacherService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageTeacher with body and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.manageTeacher(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageTeacher`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle manageTeacher error (400)', () => {
      let errResp: any;
      service.manageTeacher({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageTeacher`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getuserBankingInfo with params and handle success', () => {
      let response: any;
      service.getuserBankingInfo(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getUserbankingInfo?UserID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getStaffTransferedDetailsByCentreID with params and handle success', () => {
      let response: any;
      service.getStaffTransferedDetailsByCentreID(1, 2, 'status', 'type').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getStaffTransferedDetailsByCentreID?centreID=1&UserRoleID=2&status=status&type=type`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getStaffTransferedDetailsByCentreID network error (0)', () => {
      let errResp: any;
      service.getStaffTransferedDetailsByCentreID(1, 2, 'status', 'type').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getStaffTransferedDetailsByCentreID?centreID=1&UserRoleID=2&status=status&type=type`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });

    it('should call getPendingStudentAttendance with params and handle success', () => {
      let response: any;
      service.getPendingStudentAttendance(5, '2').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/GetPendingStudentAttendanceByTeacherId?teacherId=5&days=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
