import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageMasterLeaveService } from './manage-master-leave.service';
import { environment } from '../../../environments/environment';

describe('ManageMasterLeaveService', () => {
  let service: ManageMasterLeaveService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ManageMasterLeaveService]
    });
    service = TestBed.inject(ManageMasterLeaveService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageLeave with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.manageLeave(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/UpsertLeaveType`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle manageLeave error (400)', () => {
      let errResp: any;
      service.manageLeave({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/UpsertLeaveType`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call upsertDaycareLeave with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.upsertDaycareLeave(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/UpsertDaycareLeave`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getLeaveList with params and handle success', () => {
      let response: any;
      service.getLeaveList(10, 'admin').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/GetLeaveTypeList?CentreId=10&userType=admin`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle getLeaveList error (500)', () => {
      let errResp: any;
      service.getLeaveList(10, 'admin').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/GetLeaveTypeList?CentreId=10&userType=admin`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getAssignedLeavesByDaycareId with params and handle success', () => {
      let response: any;
      service.getAssignedLeavesByDaycareId(5).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAssignedLeavesByDaycareId?daycareId=5`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call activeInactive with params and handle success', () => {
      let response: any;
      service.activeInactive(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/ActiveInactiveLeaveType?id=1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call activeInactiveDaycareLeaveAssignment with params and handle success', () => {
      let response: any;
      service.activeInactiveDaycareLeaveAssignment(2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/ActiveInactiveDaycareLeaveAssignment?id=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
