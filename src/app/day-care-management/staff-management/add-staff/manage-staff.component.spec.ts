import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManageStaffComponent } from './manage-staff.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserRoleService } from '../../../settings/Permission/user-role/user-role.service';
import { ManageStaffService } from './manage-staff.service';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../../common-component/common.service';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ManageStaffComponent', () => {
  let component: ManageStaffComponent;
  let fixture: ComponentFixture<ManageStaffComponent>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockManageStaffService: jasmine.SpyObj<ManageStaffService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockOnboardingService: any;

  beforeEach(async () => {
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockUserRoleService = jasmine.createSpyObj('UserRoleService', ['getAllUserRoles']);
    mockManageStaffService = jasmine.createSpyObj('ManageStaffService', [
      'getAllDays',
      'getCentreWorkingDaysByCentreID',
      'getMasterQualification',
      'manageStaff',
      'getRoleSpecializationList',
      'getDayCare',
      'downloadBulkUploadSheetFormat',
      'uploadBulkStaff',
    ]);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'manageDaycareOnBoarding']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'UserId') return '10';
      if (key === 'UserRoleId') return '3';
      if (key === 'CentreID') return '5';
      return '';
    });
    mockCookie.check.and.returnValue(true);

    mockUserRoleService.getAllUserRoles.and.returnValue(of({
      message: 'OK',
      result: [
        { id: 4, userRole: 'Teacher' },
        { id: 8, userRole: 'TOC Teacher' },
        { id: 9, userRole: 'Cook' },
      ],
    }));
    mockManageStaffService.getAllDays.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, day: 'Monday' },
        { id: 2, day: 'Tuesday' },
      ],
    }));
    mockManageStaffService.getCentreWorkingDaysByCentreID.and.returnValue(of({
      message: 'Success',
      result: { mon: true, monStartTime: '08:00', monEndTime: '17:00' },
    }));
    mockManageStaffService.getMasterQualification.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, name: 'ECE' }],
    }));
    mockManageStaffService.getDayCare.and.returnValue(of({
      message: 'Success',
      result: [{ id: 5, centreName: 'My Daycare' }],
    }));

    mockOnboardingService = {
      onBoardingData: { isCompleteStep5: false },
      handleNext: jasmine.createSpy('handleNext'),
      getCurrentTab: jasmine.createSpy('getCurrentTab'),
    };

    await TestBed.configureTestingModule({
      imports: [ManageStaffComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: ManageStaffService, useValue: mockManageStaffService },
        { provide: CookieService, useValue: mockCookie },
        { provide: CommonService, useValue: mockCommonService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({
              get: (k: string) => (k === 'enc_id' ? null : null),
            }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageStaffComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageStaffComponent);
    component = fixture.componentInstance;
    spyOn(component, 'InitDatePicker').and.stub();
  });

  it('should create ManageStaffComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization and ngOnInit', () => {
    it('should initialize staffForm controls and default joiningDate', () => {
      expect(component.staffForm.contains('firstName')).toBeTrue();
      expect(component.staffForm.contains('email')).toBeTrue();
      expect(component.staffForm.contains('userRoleID')).toBeTrue();
      expect(component.staffForm.contains('joiningDate')).toBeTrue();
    });

    it('should call initialization methods on ngOnInit', fakeAsync(() => {
      component.ngOnInit();
      tick(350);

      expect(mockUserRoleService.getAllUserRoles).toHaveBeenCalled();
      expect(mockManageStaffService.getAllDays).toHaveBeenCalled();
      expect(mockManageStaffService.getCentreWorkingDaysByCentreID).toHaveBeenCalled();
      expect(mockManageStaffService.getMasterQualification).toHaveBeenCalled();
    }));
  });

  describe('Teacher Availability Form Array', () => {
    it('should add and remove teacher availability forms', () => {
      expect(component.teacherAvailabilityList.length).toBe(0);
      component.addTeacherAvailabilty();
      expect(component.teacherAvailabilityList.length).toBe(1);

      component.removeAvailableList(0);
      expect(component.teacherAvailabilityList.length).toBe(0);
    });

    it('should validate start and end times in availability', () => {
      component.addTeacherAvailabilty();
      const group = component.teacherAvailabilityList.at(0);
      group.patchValue({
        startTime: '10:00',
        endTime: '09:00',
      });

      component.ValidateStartTime(0);
      expect(component.greaterTimeValidationForStartTime).toBeTrue();

      component.ValidateEndTime(0);
      expect(component.greaterTimeValidationForEndTime).toBeTrue();
    });
  });

  describe('Role and Specialization', () => {
    it('should handle onChangeRole and set flags', () => {
      mockManageStaffService.getRoleSpecializationList.and.returnValue(of({
        message: 'Success',
        result: [{ id: 1, name: 'Infant care' }],
      }));

      component.onChangeRole({ id: 4, name: 'Teacher' });

      expect(component.isRoleSpecialLizationActive).toBeTrue();
      expect(component.isQualification).toBeTrue();
      expect(mockManageStaffService.getRoleSpecializationList).toHaveBeenCalledWith(4);
    });

    it('should disable specialization when role does not support it', () => {
      component.onChangeRole({ id: 9, name: 'Cook' });

      expect(component.isRoleSpecialLizationActive).toBeFalse();
      expect(component.isQualification).toBeFalse();
    });
  });

  describe('Staff Submission', () => {
    it('should mark all controls touched when form is invalid', () => {
      component.staffForm.patchValue({ firstName: '', email: '' });
      component.onSubmitStaff();

      expect(mockManageStaffService.manageStaff).not.toHaveBeenCalled();
    });

    it('should submit staff form successfully when valid', fakeAsync(() => {
      component.staffForm.patchValue({
        id: 0,
        userRoleID: 4,
        firstName: 'Jane',
        email: 'jane@daycare.com',
        joiningDate: '01/01/2026',
      });
      component.addTeacherAvailabilty();
      component.teacherAvailabilityList.at(0).patchValue({
        startTime: '09:00',
        endTime: '17:00',
        dayID: 1,
      });

      mockManageStaffService.manageStaff.and.returnValue(of({
        message: 'Success',
        activity: 'Staff created successfully',
      }));

      component.onSubmitStaff();
      tick();

      expect(mockManageStaffService.manageStaff).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Staff created successfully');
    }));

    it('should handle error when staff submission fails', fakeAsync(() => {
      component.staffForm.patchValue({
        id: 0,
        userRoleID: 4,
        firstName: 'Jane',
        email: 'jane@daycare.com',
        joiningDate: '01/01/2026',
      });
      component.addTeacherAvailabilty();
      component.teacherAvailabilityList.at(0).patchValue({
        startTime: '09:00',
        endTime: '17:00',
        dayID: 1,
      });

      mockManageStaffService.manageStaff.and.returnValue(throwError(() => ({ message: 'Submission error' })));

      component.onSubmitStaff();
      tick();

      expect(mockToastr.error).toHaveBeenCalledWith('Submission error');
    }));
  });

  describe('Onboarding and Reset', () => {
    it('should complete onboarding step 5 on proceededOnBoarding()', () => {
      mockCommonService.manageDaycareOnBoarding.and.returnValue(of({ message: 'Success' }));
      component.onBoardingService.onBoardingData.isCompleteStep5 = false;

      component.proceededOnBoarding();

      expect(mockCommonService.manageDaycareOnBoarding).toHaveBeenCalled();
      expect(component.onBoardingService.onBoardingData.isCompleteStep5).toBeTrue();
      expect(mockOnboardingService.handleNext).toHaveBeenCalledWith('Tab-5');
    });

    it('should reset staff form on reset()', () => {
      spyOn(component.staffForm, 'reset');
      component.reset();
      expect(component.staffForm.reset).toHaveBeenCalled();
    });
  });
});
