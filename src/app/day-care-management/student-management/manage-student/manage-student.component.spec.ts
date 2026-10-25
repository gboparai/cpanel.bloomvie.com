import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManageStudentComponent } from './manage-student.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ManageStudentService } from './manage-student.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SubscriptionFeaturesService } from '../../subscription-plans/subscription-features/subscription-features.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../../common-component/common.service';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { DaycareService } from '../../day-care-settings/daycare.service';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ManageStudentComponent', () => {
  let component: ManageStudentComponent;
  let fixture: ComponentFixture<ManageStudentComponent>;
  let mockManageStudentService: jasmine.SpyObj<ManageStudentService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockPlanService: jasmine.SpyObj<SubscriptionFeaturesService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockDaycareService: jasmine.SpyObj<DaycareService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockOnboardingService: any;

  beforeEach(async () => {
    mockManageStudentService = jasmine.createSpyObj('ManageStudentService', [
      'GetAllAgeGroup',
      'manageStudentEnrollment',
      'uploadBulkStudent',
      'checkEmailExistsForEnrollmentRequest',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockPlanService = jasmine.createSpyObj('SubscriptionFeaturesService', [
      'GetSubscriptionPlanandFeaturesByUserId',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'getCountriesFlag',
      'getDefaultCountryFlag',
      'decrypt',
      'formatPhoneNumber',
      'formatPostalCode',
      'manageDaycareOnBoarding',
    ]);
    mockDaycareService = jasmine.createSpyObj('DaycareService', ['getCentreSettings']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockCommonService.getCountriesFlag.and.returnValue([
      { id: 1, name: 'Canada', code: 'CA', flag: '🇨🇦' },
      { id: 2, name: 'USA', code: 'US', flag: '🇺🇸' },
    ]);
    mockCommonService.getDefaultCountryFlag.and.returnValue({ id: 1, name: 'Canada', code: 'CA', flag: '🇨🇦' });
    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '5';
      if (key === 'UserRoleId') return '3';
      return '';
    });
    mockCookie.check.and.returnValue(true);

    mockDaycareService.getCentreSettings.and.returnValue(of({
      message: 'OK',
      result: { externalBillingEnabled: false },
    }));
    mockManageStudentService.GetAllAgeGroup.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, groupName: 'Toddlers' }],
    }));
    mockPlanService.GetSubscriptionPlanandFeaturesByUserId.and.returnValue(of({
      message: 'OK',
      result: [{ planId: 1, planName: 'Full Time', duration: 'monthly' }],
    }));

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    mockOnboardingService = {
      onBoardingData: { isCompleteStep6: false },
      handleNext: jasmine.createSpy('handleNext'),
      getCurrentTab: jasmine.createSpy('getCurrentTab'),
    };

    await TestBed.configureTestingModule({
      imports: [ManageStudentComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        ChangeDetectorRef,
        { provide: ManageStudentService, useValue: mockManageStudentService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: SubscriptionFeaturesService, useValue: mockPlanService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookie },
        { provide: CommonService, useValue: mockCommonService },
        { provide: DaycareService, useValue: mockDaycareService },
        { provide: Router, useValue: mockRouter },
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
      .overrideComponent(ManageStudentComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageStudentComponent);
    component = fixture.componentInstance;
  });

  it('should create ManageStudentComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization and ngOnInit', () => {
    it('should initialize form with studentInformation and parentInformation groups', () => {
      expect(component.form.contains('studentInformation')).toBeTrue();
      expect(component.form.contains('parentInformation')).toBeTrue();
      expect(component.parentForm.contains('email')).toBeTrue();
    });

    it('should initialize properties on ngOnInit', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(mockDaycareService.getCentreSettings).toHaveBeenCalledWith(10);
      expect(mockManageStudentService.GetAllAgeGroup).toHaveBeenCalled();
      expect(mockPlanService.GetSubscriptionPlanandFeaturesByUserId).toHaveBeenCalled();
    }));
  });

  describe('Date Calculation Helpers', () => {
    it('should calculate next month end date in addOneMonth', () => {
      const dateStr = '01-15-2026';
      const result = component.addOneMonth(dateStr);
      expect(result).toBe('01-31-2026');
    });

    it('should add one year in addOneYear', () => {
      const dateStr = '01-15-2026';
      const result = component.addOneYear(dateStr);
      expect(result).toBe('01-15-2027');
    });

    it('should get days in selected month', () => {
      const date = new Date(2026, 0, 15); // January 2026
      expect(component.getDaysInSelectedMonth(date)).toBe(31);
    });

    it('should convert year to month and month to year', () => {
      expect(component.convertYearToMonth(2)).toBe(24);
      expect(component.convertMonthToYear(24)).toBe(2);
    });
  });

  describe('Relation Type Handling', () => {
    it('should update validators when relation is Guardian', () => {
      component.onChangeRelationType('Guardian');
      expect(component.showSpecifyRelationship).toBeTrue();

      component.onChangeRelationType('Mother');
      expect(component.showSpecifyRelationship).toBeFalse();
    });

    it('should update validators for parent form when relation is Guardian', () => {
      component.onChangeRelationType1('Guardian');
      expect(component.showSpecifyRelationship1).toBeTrue();

      component.onChangeRelationType1('Father');
      expect(component.showSpecifyRelationship1).toBeFalse();
    });
  });

  describe('Student Submission', () => {
    it('should mark form touched when form is invalid', () => {
      component.form.reset();
      component.onAddStudent();

      expect(mockManageStudentService.manageStudentEnrollment).not.toHaveBeenCalled();
    });

    it('should call manageStudent when form is valid', fakeAsync(() => {
      component.form.patchValue({
        studentInformation: {
          id: 0,
          firstName: 'Leo',
          ageGroupID: 1,
          gender: 'Male',
          dob: '01/01/2022',
        },
        parentInformation: {
          id: 0,
          firstName: 'Robert',
          email: 'robert@test.com',
          mobile: '123 456 7890',
          pinCode: 'A1A 1A1',
          relation: 'Father',
          address: '123 Street',
          planID: 1,
        },
      });

      mockManageStudentService.manageStudentEnrollment.and.returnValue(of({
        message: 'Success',
        activity: 'Student enrolled successfully',
      }));

      component.onAddStudent();
      tick();

      expect(mockManageStudentService.manageStudentEnrollment).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Student enrolled successfully');
    }));

    it('should handle error when student enrollment fails', fakeAsync(() => {
      component.form.patchValue({
        studentInformation: {
          id: 0,
          firstName: 'Leo',
          ageGroupID: 1,
          gender: 'Male',
          dob: '01/01/2022',
        },
        parentInformation: {
          id: 0,
          firstName: 'Robert',
          email: 'robert@test.com',
          mobile: '123 456 7890',
          pinCode: 'A1A 1A1',
          relation: 'Father',
          address: '123 Street',
          planID: 1,
        },
      });

      mockManageStudentService.manageStudentEnrollment.and.returnValue(throwError(() => ({ message: 'Save error' })));

      component.onAddStudent();
      tick();

      expect(mockToastr.error).toHaveBeenCalledWith('Save error');
    }));
  });

  describe('Onboarding and Reset', () => {
    it('should handle proceededOnBoarding', () => {
      mockCommonService.manageDaycareOnBoarding.and.returnValue(of({ message: 'Success' }));
      component.onBoardingService.onBoardingData.isCompleteStep6 = false;

      component.proceededOnBoarding();

      expect(mockCommonService.manageDaycareOnBoarding).toHaveBeenCalled();
      expect(component.onBoardingService.onBoardingData.isCompleteStep6).toBeTrue();
      expect(mockOnboardingService.handleNext).toHaveBeenCalledWith('Tab-6');
    });

    it('should reset form on resetForm()', () => {
      spyOn(component.form, 'reset');
      component.resetForm();
      expect(component.form.reset).toHaveBeenCalled();
    });

    it('should toggle dropdown and select country', () => {
      expect(component.dropdownOpen).toBeFalse();
      component.toggleDropdown();
      expect(component.dropdownOpen).toBeTrue();

      component.selectCountry({ name: 'USA' });
      expect(component.selectedCountry).toEqual({ name: 'USA' });
    });
  });
});
