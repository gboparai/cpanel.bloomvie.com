import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManageQualificationComponent } from './manage-qualification.component';
import { CommonService } from '../../common-component/common.service';
import { UserRoleService } from '../Permission/user-role/user-role.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ManageQualificationComponent', () => {
  let component: ManageQualificationComponent;
  let fixture: ComponentFixture<ManageQualificationComponent>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'manageMasterQualifications',
      'getMasterAllQualifications',
      'activeInActiveQualificationID',
    ]);
    mockUserRoleService = jasmine.createSpyObj('UserRoleService', ['getAllUserRoles']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'check']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '15';
      if (key === 'UserId') return '8';
      if (key === 'UserRoleId') return '3';
      return '';
    });

    mockCommonService.getMasterAllQualifications.and.returnValue(
      of({
        message: 'OK',
        result: [
          { id: 1, name: 'ECE Certificate', isActive: true, centreID: 15, userRoleID: 3 },
          { id: 2, name: 'First Aid', isActive: false, centreID: 15, userRoleID: 3 },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [ManageQualificationComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: CommonService, useValue: mockCommonService },
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageQualificationComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageQualificationComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize form and defaults', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.get('id')?.value).toBe(0);
    expect(component.isEditMode).toBeFalse();
    expect(component.ContentP).toBe(1);
    expect(component.Contentsize).toBe(5);
    expect(component.input).toBe(component.form.controls);
  });

  describe('ngOnInit & getMasterAllQualifications', () => {
    it('should set cookies and fetch qualifications for Day Care Admin', () => {
      component.ngOnInit();

      expect(component.centreID).toBe('15');
      expect(component.userID).toBe(8);
      expect(component.userRoleID).toBe(3);
      expect(mockCommonService.getMasterAllQualifications).toHaveBeenCalledWith(8, 3, 'Day Care Admin');
      expect(component.MasterAllQualifications.length).toBe(2);
      expect(component.skeletonShow).toBe('');
    });

    it('should query with Bloomvie Owner when userRoleID is not 3', () => {
      component.userRoleID = 1;
      component.userID = 8;

      component.getMasterAllQualifications();

      expect(mockCommonService.getMasterAllQualifications).toHaveBeenCalledWith(8, 1, 'Bloomvie Owner');
    });

    it('should handle non-OK and HTTP error safely in getMasterAllQualifications', () => {
      spyOn(console, 'error');
      mockCommonService.getMasterAllQualifications.and.returnValue(
        of({ message: 'Error', result: [] })
      );

      component.getMasterAllQualifications();
      expect(component.skeletonShow).toBe('');
      expect(console.error).toHaveBeenCalledWith('Error:', 'Error');

      mockCommonService.getMasterAllQualifications.and.returnValue(
        throwError(() => new Error('Network error'))
      );
      component.getMasterAllQualifications();
      expect(component.skeletonShow).toBe('');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('manageMasterQualifications', () => {
    it('should mark all controls as touched if form is invalid', () => {
      spyOn(component.form, 'markAllAsTouched');
      component.form.patchValue({ name: '' });

      component.manageMasterQualifications();

      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('should add qualification and show success toastr on message OK', () => {
      component.form.patchValue({ name: 'Infant CPR', userRoleID: 3 });
      mockCommonService.manageMasterQualifications.and.returnValue(of({ message: 'OK' }));

      component.manageMasterQualifications();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockCommonService.manageMasterQualifications).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Qualifications has been added successfully');
      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(component.isEditMode).toBeFalse();
    });

    it('should update qualification on message Updated successfully', () => {
      component.form.patchValue({ id: 2, name: 'First Aid Level C', userRoleID: 3 });
      mockCommonService.manageMasterQualifications.and.returnValue(
        of({ message: 'Updated successfully' })
      );

      component.manageMasterQualifications();

      expect(mockToastr.success).toHaveBeenCalledWith('Qualifications has been  updated successfully');
      expect(component.isEditMode).toBeFalse();
    });

    it('should show error when manageMasterQualifications returns unexpected message', () => {
      component.form.patchValue({ name: 'Infant CPR', userRoleID: 3 });
      mockCommonService.manageMasterQualifications.and.returnValue(
        of({ message: 'Error', Message: 'Duplicate qualification' })
      );

      component.manageMasterQualifications();

      expect(mockToastr.error).toHaveBeenCalledWith('', 'Duplicate qualification');
    });
  });

  describe('filtering & getters', () => {
    it('applyFilter should filter qualifications based on search input', () => {
      component.MasterAllQualifications = [
        { id: 1, name: 'First Aid' },
        { id: 2, name: 'CPR' },
      ];

      component.searchText = 'cpr';
      component.applyFilter();

      expect(component.filteredQualifications.length).toBe(1);
      expect(component.filteredQualifications[0].name).toBe('CPR');
      expect(component.displayedQualifications.length).toBe(1);
    });

    it('displayedQualifications should return MasterAllQualifications if searchText is blank', () => {
      component.MasterAllQualifications = [{ id: 1, name: 'First Aid' }];
      component.searchText = '';

      expect(component.displayedQualifications).toEqual(component.MasterAllQualifications);
    });
  });

  describe('onEdit, Reset, cancel', () => {
    it('onEdit should populate form and set isEditMode true', () => {
      const item = { id: 3, centreID: 15, userRoleID: 3, name: 'Montessori Diploma', isActive: true };

      component.onEdit(item);

      expect(component.isEditMode).toBeTrue();
      expect(component.form.value.name).toBe('Montessori Diploma');
      expect(component.form.value.id).toBe(3);
    });

    it('Reset should reset id and name in form', () => {
      component.form.patchValue({ id: 10, name: 'Safety Training' });
      component.Reset();

      expect(component.form.value.id).toBe(0);
      expect(component.form.value.name).toBe('');
    });

    it('cancel should reset isEditMode and reset form', () => {
      spyOn(component, 'Reset');
      component.isEditMode = true;

      component.cancel();

      expect(component.isEditMode).toBeFalse();
      expect(component.Reset).toHaveBeenCalled();
    });
  });

  describe('ActiveInactiveQualification', () => {
    it('should deactivate qualification when confirmed and isActive was true', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockCommonService.activeInActiveQualificationID.and.returnValue(of({ message: 'Success' }));

      component.ActiveInactiveQualification(1, true);
      tick();

      expect(mockCommonService.activeInActiveQualificationID).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith('Qualification has been deactivated successfully.');
    }));

    it('should activate qualification when confirmed and isActive was false', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockCommonService.activeInActiveQualificationID.and.returnValue(of({ message: 'Success' }));

      component.ActiveInactiveQualification(2, false);
      tick();

      expect(mockCommonService.activeInActiveQualificationID).toHaveBeenCalledWith(2);
      expect(mockToastr.success).toHaveBeenCalledWith('Qualification has been activated successfully.');
    }));

    it('should do nothing if confirmation is cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.ActiveInactiveQualification(1, true);
      tick();

      expect(mockCommonService.activeInActiveQualificationID).not.toHaveBeenCalled();
    }));
  });
});
