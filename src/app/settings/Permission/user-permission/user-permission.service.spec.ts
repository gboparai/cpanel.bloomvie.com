import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserPermissionService } from './user-permission.service';
import { environment } from '../../../../environments/environment';

describe('UserPermissionService', () => {
  let service: UserPermissionService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserPermissionService],
    });
    service = TestBed.inject(UserPermissionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get role permission by userRoleID', () => {
    service.getUserRolePermissionByUserRoleID(2).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/MenuPermission/getUserRolePermissionByID?UserRoleID=2`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should post assignRolePermissionToUser', () => {
    const payload = { userId: 5, menuIds: [1, 2, 3] };
    service.assignRolePermissionToUser(payload).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/MenuPermission/assignPermissionToUser`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('should post assignPermissionToRole with UserRoleID param', () => {
    const menus = [{ menuId: 10, canRead: true }];
    service.assignPermissionToRole(3, menus).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/MenuPermission/assignPermissionToUserRole?UserRoleID=3`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(menus);
    req.flush({ success: true });
  });

  it('should get all users', () => {
    service.getAllUsers().subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/User/getAllUser`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get user permissions by UserID', () => {
    service.getUserPermissionByUserID(44).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/MenuPermission/getUserPermissionByUserID?UserID=44`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should check TOC user accepted slot request with userID and centreID', () => {
    service.checkTOCUserAcceptedSlotRequest(44, 2).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Login/checkTOCUserAcceptedSlotRequest?userID=44&centreID=2`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ accepted: true });
  });
});
