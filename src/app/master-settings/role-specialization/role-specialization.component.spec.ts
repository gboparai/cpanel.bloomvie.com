import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RoleSpecializationComponent } from './role-specialization.component';
import { UserRoleService } from '../../settings/Permission/user-role/user-role.service';
import { RoleSpecializationService } from './role-specialization.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('RoleSpecializationComponent', () => {
  let component: RoleSpecializationComponent;
  let fixture: ComponentFixture<RoleSpecializationComponent>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockRoleSpecializationService: jasmine.SpyObj<RoleSpecializationService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockUserRoleService = jasmine.createSpyObj('UserRoleService', ['getAllUserRoles']);
    mockRoleSpecializationService = jasmine.createSpyObj('RoleSpecializationService', [
      'getAllRoleSpecializations',
      'ManageRoleSpecialization',
      'getRoleSpecializationByID',
      'activeInactiveRoleSpecialization',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);

    mockUserRoleService.getAllUserRoles.and.returnValue(
      of({
        message: 'OK',
        result: [
          { id: 4, userRole: 'Teacher' },
          { id: 12, userRole: 'Others' },
          { id: 1, userRole: 'Admin' },
        ],
      })
    );

    mockRoleSpecializationService.getAllRoleSpecializations.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, roleID: 4, name: 'Special Education', isActive: true },
          { id: 2, roleID: 12, name: 'Support Worker', isActive: false },
        ],
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      prop: jasmine.createSpy('prop'),
    });

    await TestBed.configureTestingModule({
      imports: [RoleSpecializationComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: RoleSpecializationService, useValue: mockRoleSpecializationService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(RoleSpecializationComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RoleSpecializationComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize default form values', () => {
    expect(component).toBeTruthy();
    expect(component.RoleSpecializationForm).toBeDefined();
    expect(component.RoleSpecializationForm.value.id).toBe(0);
    expect(component.RoleSpecializationForm.value.isActive).toBeTrue();
    expect(component.ContentP).toBe(1);
    expect(component.Contentsize).toBe(5);
    expect(component.isEditMode).toBeFalse();
    expect(component.input).toBe(component.RoleSpecializationForm.controls);
    expect(component.RoleSpecializationFormControls).toBe(component.RoleSpecializationForm.controls);
  });

  describe('ngOnInit & getUserRoles', () => {
    it('should filter Teacher and Others roles and fetch specialization list', () => {
      component.ngOnInit();

      expect(mockUserRoleService.getAllUserRoles).toHaveBeenCalled();
      expect(component.userRoleList.length).toBe(2);
      expect(component.userRoleList[0].name).toBe('Teacher');
      expect(component.userRoleList[1].name).toBe('Others');
      expect(mockRoleSpecializationService.getAllRoleSpecializations).toHaveBeenCalled();
      expect(component.roleSpecializationList.length).toBe(2);
      expect(component.skeletonShow).toBe('');
    });

    it('should handle error when getUserRoles fails', () => {
      mockUserRoleService.getAllUserRoles.and.returnValue(
        throwError(() => new Error('Failed to load roles'))
      );

      component.getUserRoles();

      expect(mockToastr.error).toHaveBeenCalledWith('Failed to load roles');
    });
  });

  describe('onSubmit', () => {
    it('should mark all controls touched if form is invalid', () => {
      spyOn(component.RoleSpecializationForm, 'markAllAsTouched');
      component.RoleSpecializationForm.patchValue({ roleID: '', name: null });

      component.onSubmit();

      expect(component.RoleSpecializationForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should save new specialization on Success when id is 0', () => {
      component.RoleSpecializationForm.patchValue({
        id: 0,
        roleID: 4,
        name: 'Math Specialist',
      });

      mockRoleSpecializationService.ManageRoleSpecialization.and.returnValue(
        of({ message: 'Success' })
      );
      spyOn(component, 'getAllRoleSpecializationList');

      component.onSubmit();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockRoleSpecializationService.ManageRoleSpecialization).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Data saved successfully');
      expect(component.isEditMode).toBeFalse();
      expect(component.getAllRoleSpecializationList).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should update specialization on Success when id > 0', () => {
      component.RoleSpecializationForm.patchValue({
        id: 5,
        roleID: 4,
        name: 'Language Specialist',
      });

      mockRoleSpecializationService.ManageRoleSpecialization.and.returnValue(
        of({ message: 'Success' })
      );

      component.onSubmit();

      expect(mockToastr.success).toHaveBeenCalledWith('Data updated successfully');
    });

    it('should show warning toastr when ManageRoleSpecialization returns non-Success', () => {
      component.RoleSpecializationForm.patchValue({
        id: 0,
        roleID: 4,
        name: 'Music Specialist',
      });

      mockRoleSpecializationService.ManageRoleSpecialization.and.returnValue(
        of({ message: 'Specialization already exists' })
      );

      component.onSubmit();

      expect(mockToastr.warning).toHaveBeenCalledWith('Specialization already exists');
    });
  });

  describe('onEdit', () => {
    it('should fetch specialization by ID, patch form, and set isEditMode true', () => {
      mockRoleSpecializationService.getRoleSpecializationByID.and.returnValue(
        of({
          message: 'Success',
          result: { id: 8, roleID: 4, name: 'Science Coordinator' },
        })
      );

      component.onEdit(8);

      expect(mockRoleSpecializationService.getRoleSpecializationByID).toHaveBeenCalledWith(8);
      expect(component.isEditMode).toBeTrue();
      expect(component.RoleSpecializationForm.value.id).toBe(8);
      expect(component.RoleSpecializationForm.value.roleID).toBe(4);
      expect(component.RoleSpecializationForm.value.name).toBe('Science Coordinator');
    });
  });

  describe('activeInactive', () => {
    it('should deactivate specialization when confirmed and isActive was true', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockRoleSpecializationService.activeInactiveRoleSpecialization.and.returnValue(
        of({ message: 'Success' })
      );
      spyOn(component, 'getAllRoleSpecializationList');

      component.activeInactive(1, true);
      tick();

      expect(mockRoleSpecializationService.activeInactiveRoleSpecialization).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Role Specialization has been deactivated successfully'
      );
      expect(component.getAllRoleSpecializationList).toHaveBeenCalled();
    }));

    it('should activate specialization when confirmed and isActive was false', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockRoleSpecializationService.activeInactiveRoleSpecialization.and.returnValue(
        of({ message: 'Success' })
      );
      spyOn(component, 'getAllRoleSpecializationList');

      component.activeInactive(2, false);
      tick();

      expect(mockRoleSpecializationService.activeInactiveRoleSpecialization).toHaveBeenCalledWith(2);
      expect(mockToastr.success).toHaveBeenCalledWith(
        'Role Specialization has been activated successfully'
      );
    }));

    it('should do nothing if confirmation is cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.activeInactive(1, true);
      tick();

      expect(mockRoleSpecializationService.activeInactiveRoleSpecialization).not.toHaveBeenCalled();
    }));
  });

  describe('cancel', () => {
    it('should reset isEditMode and form', () => {
      component.isEditMode = true;
      component.RoleSpecializationForm.patchValue({ name: 'Specialist' });

      component.cancel();

      expect(component.isEditMode).toBeFalse();
      expect(component.RoleSpecializationForm.value.name).toBeNull();
    });
  });
});
