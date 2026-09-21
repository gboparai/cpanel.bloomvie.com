import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AssignUserPermissionService } from './assign-user-permission.service';
import { environment } from '../../../../environments/environment';

describe('AssignUserPermissionService', () => {
  let service: AssignUserPermissionService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssignUserPermissionService]
    });
    service = TestBed.inject(AssignUserPermissionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getUserRole and handle success', () => {
      service.getUserRole().subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getAllUserRoles`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle getUserRole error (500)', () => {
      let errResp: any;
      service.getUserRole().subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getAllUserRoles`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getDayCare with params and handle success', () => {
      service.getDayCare('all').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAllCentre?type=all`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle getDayCare network error (0)', () => {
      let errResp: any;
      service.getDayCare('all').subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getAllCentre?type=all`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call getEmployeeRole with params and handle success', () => {
      service.getEmployeeRole(2, true).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getEmployeeRole?userRoleId=2&isActive=true`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should call getassignedDcc with params and handle success', () => {
      service.getassignedDcc(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getAssignedDccForCounsellor?counsellorID=10`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should call getEmployeebyID with correct endpoint and handle success', () => {
      service.getEmployeebyID().subscribe();
      // Service literally appends '' to URL: this.URL + ''
      const req = httpTestingController.expectOne(`${environment.apiUrl}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call activeInActiveEmployeeStatusByID with params and handle success', () => {
      service.activeInActiveEmployeeStatusByID(5, false).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/activeInActiveEmployeesByID?id=5&isActive=false`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call validateDayCareAssignment with params and handle success', () => {
      service.validateDayCareAssignment(100).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/validateDayCareAssignment?centreID=100`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle validateDayCareAssignment error (400)', () => {
      let errResp: any;
      service.validateDayCareAssignment(100).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/validateDayCareAssignment?centreID=100`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call EmployeeRole with body and handle success', () => {
      const payload = { role: 'Teacher' };
      service.EmployeeRole(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/EmployeeRole`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });
  });
});
