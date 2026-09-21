import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserRoleService } from './user-role.service';
import { environment } from '../../../../environments/environment';

describe('UserRoleService', () => {
  let service: UserRoleService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserRoleService]
    });
    service = TestBed.inject(UserRoleService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call ManageUserRole with body and handle success', () => {
      const payload = { roleName: 'Admin' };
      service.ManageUserRole(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/manageUserRole`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle ManageUserRole error (500)', () => {
      let errResp: any;
      service.ManageUserRole({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/manageUserRole`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getAllUserRoles and handle success', () => {
      service.getAllUserRoles().subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getAllUserRoles`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle getAllUserRoles error (404)', () => {
      let errResp: any;
      service.getAllUserRoles().subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getAllUserRoles`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call activeInActiveUserRoleByID with param and handle success', () => {
      service.activeInActiveUserRoleByID(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/activeInActiveUserRoleByID?Id=10`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getUserRolesByID with param and handle success', () => {
      service.getUserRolesByID(5).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getUserRolesByID?id=5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call userRoleRelation with body and handle success', () => {
      const payload = { relation: true };
      service.userRoleRelation(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/userRoleRelation`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle userRoleRelation network error (0)', () => {
      let errResp: any;
      service.userRoleRelation({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/User/userRoleRelation`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
