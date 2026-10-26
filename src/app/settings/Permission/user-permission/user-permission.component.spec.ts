import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserPermissionComponent } from './user-permission.component';
import { UserPermissionService } from './user-permission.service';
import { UserRoleService } from '../user-role/user-role.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('UserPermissionComponent', () => {
  let component: UserPermissionComponent;
  let fixture: ComponentFixture<UserPermissionComponent>;
  let mockUserPermissionService: jasmine.SpyObj<UserPermissionService>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockUserPermissionService = jasmine.createSpyObj('UserPermissionService', [
      'getAllUsers',
      'assignRolePermissionToUser',
      'getUserRolePermissionByUserRoleID',
    ]);
    mockUserRoleService = jasmine.createSpyObj('UserRoleService', ['getAllUserRoles']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockUserPermissionService.getAllUsers.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, firstName: 'John', middleName: 'M', lastName: 'Doe' },
          { id: 2, firstName: 'Jane', middleName: '', lastName: 'Smith' },
        ],
      })
    );

    mockUserRoleService.getAllUserRoles.and.returnValue(
      of({
        message: 'OK',
        result: [
          { id: 10, userRole: 'Teacher', isActive: true },
          { id: 11, userRole: 'Inactive', isActive: false },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [UserPermissionComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: UserPermissionService, useValue: mockUserPermissionService },
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(UserPermissionComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UserPermissionComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize default properties', () => {
    expect(component).toBeTruthy();
    expect(component.Permission).toBeDefined();
    expect(component.IsMenuPresent).toBeTrue();
    expect(component.input).toBe(component.Permission.controls);
  });

  describe('ngOnInit & data fetching', () => {
    it('should map full name for users on success', () => {
      component.ngOnInit();

      expect(mockUserPermissionService.getAllUsers).toHaveBeenCalled();
      expect(component.UserList.length).toBe(2);
      expect(component.UserList[0].fullName).toBe('John M Doe ');
      expect(component.UserList[1].fullName).toBe('Jane Smith ');
    });

    it('should filter active roles only from getAllUserRoles', () => {
      component.ngOnInit();

      expect(mockUserRoleService.getAllUserRoles).toHaveBeenCalled();
      expect(component.UserRoleList.length).toBe(1);
      expect(component.UserRoleList[0].id).toBe(10);
    });
  });

  describe('BindUser & BindUserTypePermission', () => {
    it('BindUser should set userId from item id', () => {
      component.BindUser({ id: 12 });
      expect(component.userId).toBe(12);

      component.BindUser(null);
      expect(component.userId).toBeNull();
    });

    it('treeview should set data properties', () => {
      const mockObj = [{ id: 1 }];
      component.treeview(mockObj);

      expect(component.data.ParentChildchecklist).toBe(mockObj);
      expect(component.data.isAllSelected).toBeFalse();
    });

    it('BindUserTypePermission should set uid and UserIDInt', () => {
      component.BindUserTypePermission({ id: '5' });

      expect(component.uid).toBe('5');
      expect(component.UserIDInt).toBe(5);
    });
  });

  describe('AssignConfirmation & AssignPermission', () => {
    it('AssignConfirmation should warn if userRoleID (uid) is empty', () => {
      spyOn(Swal, 'fire');
      component.uid = '';

      component.AssignConfirmation();

      expect(Swal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({ icon: 'warning', text: 'Please select role.' })
      );
    });

    it('AssignConfirmation should show warning modal when form is valid', fakeAsync(() => {
      component.uid = '10';
      component.Permission.patchValue({ RoleID: 10, UserID: 1 });

      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      spyOn(component, 'AssignPermission');

      component.AssignConfirmation();
      tick();

      expect(component.AssignPermission).toHaveBeenCalled();
    }));

    it('AssignConfirmation should markAllAsTouched if form is invalid', () => {
      spyOn(component.Permission, 'markAllAsTouched');
      component.uid = '10';
      component.Permission.patchValue({ RoleID: null, UserID: null });

      component.AssignConfirmation();

      expect(component.Permission.markAllAsTouched).toHaveBeenCalled();
    });

    it('AssignPermission should call service, show spinner, and reset form on ok message', () => {
      component.userId = '5';
      component.Permission.patchValue({ RoleID: 10, UserID: 5 });

      mockUserPermissionService.assignRolePermissionToUser.and.returnValue(
        of({ message: 'ok' })
      );
      spyOn(Swal, 'fire');
      spyOn(component, 'BindUserTypePermission');

      component.AssignPermission();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockUserPermissionService.assignRolePermissionToUser).toHaveBeenCalledWith(
        component.Permission.value
      );
      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(component.BindUserTypePermission).toHaveBeenCalledWith('');
    });
  });

  describe('Reset', () => {
    it('should reset Permission form', () => {
      component.Permission.patchValue({ RoleID: 10, UserID: 1 });
      component.Reset();

      expect(component.Permission.value.RoleID).toBeNull();
      expect(component.Permission.value.UserID).toBeNull();
    });
  });
});
