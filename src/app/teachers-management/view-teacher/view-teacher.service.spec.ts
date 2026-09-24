import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ViewTeacherService } from './view-teacher.service';
import { environment } from '../../../environments/environment';

describe('ViewTeacherService', () => {
  let service: ViewTeacherService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ViewTeacherService]
    });
    service = TestBed.inject(ViewTeacherService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getAttendingTeachersInfo with params and handle success', () => {
      let response: any;
      service.getAttendingTeachersInfo(1, 2, 3).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getAttendingTeachersInfo?centerID=1&userRoleId=2&loginId=3`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getAttendingTeachersInfo error (500)', () => {
      let errResp: any;
      service.getAttendingTeachersInfo(1, 2, 3).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getAttendingTeachersInfo?centerID=1&userRoleId=2&loginId=3`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getTeacherDetailByStudentParentId with params and handle success', () => {
      let response: any;
      service.getTeacherDetailByStudentParentId(10, 20).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getTeacherDetailByStudentParentId?parentId=10&studentId=20`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getTeacherDetailByStudentParentId error (404)', () => {
      let errResp: any;
      service.getTeacherDetailByStudentParentId(99, 99).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Dashboard/getTeacherDetailByStudentParentId?parentId=99&studentId=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });
  });
});
