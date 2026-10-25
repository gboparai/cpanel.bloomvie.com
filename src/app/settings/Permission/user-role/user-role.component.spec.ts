import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserRoleComponent } from './user-role.component';
import { UserRoleService } from './user-role.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('UserRoleComponent', () => {
  let component: UserRoleComponent;
  let fixture: ComponentFixture<UserRoleComponent>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockUserRoleService = jasmine.createSpyObj('UserRoleService', [
      'ManageUserRole',
      'getAllUserRoles',
      'activeInActiveUserRoleByID',
      'userRoleRelation',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);

    mockCookie.get.and.returnValue('3');

    mockUserRoleService.getAllUserRoles.and.returnValue(
      of({
        message: 'OK',
        result: [
          { id: 1, userRole: 'Admin', isActive: true, bloomvie: true, daycare: false },
          { id: 2, userRole: 'Staff', isActive: false, bloomvie: false, daycare: true },
        ],
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      prop: jasmine.createSpy('prop'),
    });

    await TestBed.configureTestingModule({
      imports: [UserRoleComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(UserRoleComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UserRoleComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize default form and properties', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.value.id).toBe(0);
    expect(component.form.value.isActive).toBeTrue();
    expect(component.isEditMode).toBeFalse();
    expect(component.ContentP).toBe(1);
    expect(component.Contentsize).toBe(5);
    expect(component.input).toBe(component.form.controls);
  });

  describe('ngOnInit & GetUserRoles', () => {
    it('should read cookie, fetch user roles, and initialize checkbox state', () => {
      component.ngOnInit();

      expect(component.userRoleID).toBe(3);
      expect(mockUserRoleService.getAllUserRoles).toHaveBeenCalled();
      expect(component.userRoleList.length).toBe(2);
      expect(component.checkBoxState[1]).toEqual({ bloomvie: true, daycare: false });
      expect(component.checkBoxState[2]).toEqual({ bloomvie: false, daycare: true });
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('manageUserRole', () => {
    it('should mark all touched if form is invalid', () => {
      spyOn(component.form, 'markAllAsTouched');
      component.form.patchValue({ userRole: '' });

      component.manageUserRole();

      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('should add user role successfully on message Ok when id == 0', () => {
      component.form.patchValue({ id: 0, userRole: 'Accountant' });
      mockUserRoleService.ManageUserRole.and.returnValue(of({ message: 'Ok' }));
      spyOn(component, 'GetUserRoles');

      component.manageUserRole();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockUserRoleService.ManageUserRole).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('User Role has been added successfully');
      expect(component.GetUserRoles).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should update user role successfully on message Ok when id > 0', () => {
      component.form.patchValue({ id: 10, userRole: 'Senior Accountant' });
      mockUserRoleService.ManageUserRole.and.returnValue(of({ message: 'Ok' }));

      component.manageUserRole();

      expect(mockToastr.success).toHaveBeenCalledWith('User Role has been updated successfully');
      expect(component.isEditMode).toBeFalse();
    });

    it('should show duplicate record warning with Swal when role exists', () => {
      component.form.patchValue({ userRole: 'Admin' });
      mockUserRoleService.ManageUserRole.and.returnValue(
        of({ message: 'Data already exist !' })
      );
      spyOn(Swal, 'fire');

      component.manageUserRole();

      expect(Swal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'warning',
          title: 'Duplicate Record',
          text: 'User Role already exists!',
        })
      );
    });

    it('should show error toastr when response is unexpected', () => {
      component.form.patchValue({ userRole: 'Other' });
      mockUserRoleService.ManageUserRole.and.returnValue(
        of({ message: 'Error', Message: 'Unknown error' })
      );

      component.manageUserRole();

      expect(mockToastr.error).toHaveBeenCalledWith('Error fetching details', 'Unknown error');
    });
  });

  describe('onEdit, Reset, cancel, pageChange', () => {
    it('onEdit should populate form and set isEditMode true', () => {
      const item = { id: 8, userRole: 'Supervisor', true: true };
      component.onEdit(item);

      expect(component.isEditMode).toBeTrue();
      expect(component.form.value.id).toBe(8);
      expect(component.form.value.userRole).toBe('Supervisor');
    });

    it('Reset should reset id and userRole in form', () => {
      component.form.patchValue({ id: 9, userRole: 'Driver' });
      component.Reset();

      expect(component.form.value.id).toBe(0);
      expect(component.form.value.userRole).toBe('');
    });

    it('cancel should reset isEditMode and call Reset', () => {
      spyOn(component, 'Reset');
      component.isEditMode = true;

      component.cancel();

      expect(component.isEditMode).toBeFalse();
      expect(component.Reset).toHaveBeenCalled();
    });

    it('pageChange should call getCheckboxState', () => {
      spyOn(component, 'getCheckboxState');
      component.pageChange(2);

      expect(component.getCheckboxState).toHaveBeenCalled();
    });
  });

  describe('ActiveInactiveUserRole', () => {
    it('should deactivate role when confirmed and isActive was true', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockUserRoleService.activeInActiveUserRoleByID.and.returnValue(of({ message: 'OK' }));

      component.ActiveInactiveUserRole(1, true);
      tick();

      expect(mockUserRoleService.activeInActiveUserRoleByID).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith(' UserRole has been deactivated successfully.');
    }));

    it('should activate role when confirmed and isActive was false', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockUserRoleService.activeInActiveUserRoleByID.and.returnValue(of({ message: 'OK' }));

      component.ActiveInactiveUserRole(2, false);
      tick();

      expect(mockUserRoleService.activeInActiveUserRoleByID).toHaveBeenCalledWith(2);
      expect(mockToastr.success).toHaveBeenCalledWith(' UserRole has been activated successfully.');
    }));

    it('should do nothing if confirmation is rejected', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.ActiveInactiveUserRole(1, true);
      tick();

      expect(mockUserRoleService.activeInActiveUserRoleByID).not.toHaveBeenCalled();
    }));
  });

  describe('userRoleRelation', () => {
    it('should update daycare relation and checkBoxState', () => {
      component.checkBoxState = { 1: { bloomvie: false, daycare: false } };
      mockUserRoleService.userRoleRelation.and.returnValue(
        of({ message: 'Relation saved' })
      );

      const event = { target: { checked: true } };
      component.userRoleRelation(event, 1, 'Daycare');

      expect(mockUserRoleService.userRoleRelation).toHaveBeenCalledWith({
        RoleId: 1,
        RoleBelongsTo: 'Daycare',
        Activate: true,
      });
      expect(mockToastr.success).toHaveBeenCalledWith('Relation saved');
      expect(component.checkBoxState[1].daycare).toBeTrue();
    });

    it('should update bloomvie relation and checkBoxState', () => {
      component.checkBoxState = { 1: { bloomvie: false, daycare: false } };
      mockUserRoleService.userRoleRelation.and.returnValue(
        of({ message: 'Bloomvie relation saved' })
      );

      const event = { target: { checked: true } };
      component.userRoleRelation(event, 1, 'Bloomvie');

      expect(mockUserRoleService.userRoleRelation).toHaveBeenCalledWith({
        RoleId: 1,
        RoleBelongsTo: 'Bloomvie',
        Activate: true,
      });
      expect(component.checkBoxState[1].bloomvie).toBeTrue();
    });
  });
});
