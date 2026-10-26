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
      providers: [UserRoleService],
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

  it('should post ManageUserRole', () => {
    const roleBO = { roleName: 'Supervisor', description: 'Centre supervisor' };
    service.ManageUserRole(roleBO).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/User/manageUserRole`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(roleBO);
    req.flush({ success: true });
  });

  it('should get all user roles', () => {
    service.getAllUserRoles().subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getAllUserRoles`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should toggle active/inactive user role by ID', () => {
    service.activeInActiveUserRoleByID(3).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/User/activeInActiveUserRoleByID?Id=3`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true });
  });

  it('should get user roles by ID', () => {
    service.getUserRolesByID(3).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/User/getUserRolesByID?id=3`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ id: 3, roleName: 'Staff' });
  });

  it('should post userRoleRelation', () => {
    const relationObj = { userId: 10, roleId: 3 };
    service.userRoleRelation(relationObj).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/User/userRoleRelation`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(relationObj);
    req.flush({ success: true });
  });
});
