import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeacherDashboardServiceService } from './teacher-dashboard-service.service';
import { environment } from '../../../environments/environment';

describe('TeacherDashboardServiceService', () => {
  let service: TeacherDashboardServiceService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherDashboardServiceService]
    });
    service = TestBed.inject(TeacherDashboardServiceService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getTeacherDashboardCount with params and handle success', () => {
      let response: any;
      service.getTeacherDashboardCount(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getTeacherDashboardCount?userID=1&DaycareID=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getDayCareEventsByID with params and handle success', () => {
      let response: any;
      service.getDayCareEventsByID(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getEventsByDayCareId?dayCareID=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getDayCareActivities with params and handle success', () => {
      let response: any;
      service.getDayCareActivities(5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getActivitesByCenterId?dayCareID=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getEmployeeJoiningDocuments with params and handle success', () => {
      let response: any;
      service.getEmployeeJoiningDocuments(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getEmployeeJoiningDocumentsByUserID?userID=1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call employeeJoiningDocuments with params and handle success', () => {
      let response: any;
      service.employeeJoiningDocuments(1, true, 'sig', 'ip').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/manageEmployeeJoiningDocuments?userID=1&letterAccepted=true&letterSignature=sig&acceptanceIP=ip`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getAllEventManagementType and handle success', () => {
      let response: any;
      service.getAllEventManagementType().subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllEventManagementType`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getAllEventManagementType error (500)', () => {
      let errResp: any;
      service.getAllEventManagementType().subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllEventManagementType`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getDashboardPendingStudentAttandanceByuserId with params and handle success', () => {
      let response: any;
      service.getDashboardPendingStudentAttandanceByuserId(1, 2, 3, 4).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getDashboardPendingStudentAttandanceByuserId?userId=1&userRoleId=2&centreId=3&studentId=4`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
