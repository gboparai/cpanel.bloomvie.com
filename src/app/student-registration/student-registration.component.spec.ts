import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StudentRegistrationComponent } from './student-registration.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StudentRegistrationService } from './student-registration.service';
import { HeaderServiceService } from '../layout/header/header-service.service';
import { DaycareService } from '../day-care-management/day-care-settings/daycare.service';
import { of, throwError } from 'rxjs';

describe('StudentRegistrationComponent', () => {
  let component: StudentRegistrationComponent;
  let fixture: ComponentFixture<StudentRegistrationComponent>;
  let mockDatePipe: any;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockStudentRegService: jasmine.SpyObj<StudentRegistrationService>;
  let mockHeaderService: any;
  let mockDaycareService: jasmine.SpyObj<DaycareService>;

  beforeEach(async () => {
    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.callFake((date: any) => '2025-01-01');

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'StudentID') return '42';
      if (key === 'CentreID') return '10';
      return '';
    });

    mockStudentRegService = jasmine.createSpyObj('StudentRegistrationService', [
      'getPlanDetailsByUserID',
      'GetAllAgeGroup',
      'manageStudentRegistration',
      'getSubscriptionPlansByCentreAndAgeID'
    ]);

    mockStudentRegService.GetAllAgeGroup.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, minAge: 1, maxAge: 2, isMonthly: false },
        { id: 2, minAge: 6, maxAge: 12, isMonthly: true }
      ]
    }));

    mockStudentRegService.getPlanDetailsByUserID.and.returnValue(of({
      message: 'Success',
      result: {
        planID: 5,
        planPrice: 1200,
        centreAdminID: 20,
        discountValue: 50,
        discountType: 'flat'
      }
    }));

    mockDaycareService = jasmine.createSpyObj('DaycareService', ['getCentreSettings']);
    mockDaycareService.getCentreSettings.and.returnValue(of({
      message: 'Success',
      result: { externalBillingEnabled: false }
    }));

    const studentSignal = signal(0);
    mockHeaderService = {
      newStudent: studentSignal
    };

    await TestBed.configureTestingModule({
      imports: [StudentRegistrationComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: StudentRegistrationService, useValue: mockStudentRegService },
        { provide: HeaderServiceService, useValue: mockHeaderService },
        { provide: DaycareService, useValue: mockDaycareService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(StudentRegistrationComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentRegistrationComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.studentRegistrationForm).toBeDefined();
  });

  describe('ngOnInit and Initial State', () => {
    it('should initialize UserID, StudentID, centreID and call age group and billing check', () => {
      spyOn(component, 'getAgeGroupList').and.callThrough();
      spyOn(component, 'checkExternalBilling').and.callThrough();

      component.ngOnInit();

      expect(component.UserID).toBe(101);
      expect(component.StudentID).toBe(42);
      expect(component.centreID).toBe(10);
      expect(component.getAgeGroupList).toHaveBeenCalled();
      expect(component.checkExternalBilling).toHaveBeenCalled();
    });

    it('should fetch plan details directly if centreID is not present', () => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserId') return '101';
        return '';
      });
      spyOn(component, 'getPlanDetailsByUserID').and.callThrough();

      component.ngOnInit();

      expect(component.centreID).toBe(0);
      expect(component.getPlanDetailsByUserID).toHaveBeenCalledWith(101);
    });
  });

  describe('checkExternalBilling', () => {
    it('should set external billing true and clear plans when enabled in settings', () => {
      mockDaycareService.getCentreSettings.and.returnValue(of({
        message: 'Success',
        result: { externalBillingEnabled: true }
      }));

      component.centreID = 10;
      component.checkExternalBilling();

      expect(component.isExternalBilling).toBeTrue();
      expect(component.planInfo).toBeNull();
      expect(component.planList).toEqual([]);
    });

    it('should fallback to getPlanDetailsByUserID when external billing is disabled or error occurs', () => {
      mockDaycareService.getCentreSettings.and.returnValue(of({
        message: 'Success',
        result: { externalBillingEnabled: false }
      }));
      spyOn(component, 'getPlanDetailsByUserID');

      component.centreID = 10;
      component.checkExternalBilling();

      expect(component.isExternalBilling).toBeFalse();
      expect(component.getPlanDetailsByUserID).toHaveBeenCalledWith(component.UserID);
    });
  });

  describe('Age and Plan Calculations', () => {
    it('should correctly convert year to month and month to year', () => {
      expect(component.convertYearToMonth(2)).toBe(24);
      expect(component.convertMonthToYear(24)).toBe(2);
      expect(component.convertMonthToYear(18)).toBe(1.5);
    });

    it('should fetch age group list and format filteredageGroupList', fakeAsync(() => {
      component.centreID = 10;
      component.getAgeGroupList();
      tick(350);

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockStudentRegService.GetAllAgeGroup).toHaveBeenCalledWith(10);
      expect(component.filteredageGroupList.length).toBe(2);
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));

    it('should query plans on onAgeGroupChange when not external billing', () => {
      spyOn(component, 'getPlanListByAge');
      component.isExternalBilling = false;
      component.onAgeGroupChange(1);
      expect(component.getPlanListByAge).toHaveBeenCalledWith(1);

      component.isExternalBilling = true;
      component.onAgeGroupChange(1);
      expect(component.getPlanListByAge).toHaveBeenCalledTimes(1); // not called again
    });

    it('should set selectedPlan on getSelectedPlan', () => {
      const plan = { id: 7, name: 'Full-time Plan', price: 900 };
      component.getSelectedPlan(plan);
      expect(component.selectedPlan).toEqual(plan);
    });
  });

  describe('manageStudentRegistration Form Submission', () => {
    it('should submit registration successfully with planInfo values', () => {
      component.studentRegistrationForm.patchValue({
        firstName: 'Tommy',
        lastName: 'Pickles',
        gender: 'Male',
        billingDate: new Date('2025-01-01')
      });
      component.planInfo = {
        planID: 5,
        planPrice: 1200,
        centreAdminID: 20,
        discountValue: 50,
        discountType: 'flat'
      };
      component.centreID = 10;
      component.UserID = 101;

      mockStudentRegService.manageStudentRegistration.and.returnValue(of({
        message: 'Success',
        activity: 'Student Registered Successfully'
      }));
      spyOn(component, 'resetForm');

      component.manageStudentRegistration();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockStudentRegService.manageStudentRegistration).toHaveBeenCalledWith(jasmine.objectContaining({
        firstName: 'Tommy',
        planID: 5,
        planPrice: 1200,
        centreID: 10,
        parentID: 101
      }));
      expect(mockToastr.success).toHaveBeenCalledWith('Student Registered Successfully');
      expect(component.resetForm).toHaveBeenCalled();
      expect(mockHeaderService.newStudent()).toBe(1);
    });

    it('should submit registration properly under external billing mode', () => {
      component.studentRegistrationForm.patchValue({
        firstName: 'Angelica',
        lastName: 'Pickles',
        gender: 'Female',
        billingDate: new Date('2025-01-01')
      });
      component.isExternalBilling = true;
      mockStudentRegService.manageStudentRegistration.and.returnValue(of({
        message: 'Success',
        activity: 'Student Registered'
      }));

      component.manageStudentRegistration();

      expect(mockStudentRegService.manageStudentRegistration).toHaveBeenCalledWith(jasmine.objectContaining({
        firstName: 'Angelica',
        planID: null,
        planPrice: 0,
        billingDate: null
      }));
    });

    it('should mark all controls as touched if form is invalid', () => {
      component.studentRegistrationForm.patchValue({
        firstName: '' // required
      });
      spyOn(component.studentRegistrationForm, 'markAllAsTouched');

      component.manageStudentRegistration();

      expect(component.studentRegistrationForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should show warning on non-Success registration message', () => {
      component.studentRegistrationForm.patchValue({
        firstName: 'Chuckie',
        gender: 'Male'
      });
      mockStudentRegService.manageStudentRegistration.and.returnValue(of({
        message: 'Failed to register student'
      }));

      component.manageStudentRegistration();

      expect(mockToastr.warning).toHaveBeenCalledWith('Failed to register student');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('resetForm', () => {
    it('should reset form and default gender to Male', () => {
      component.studentRegistrationForm.patchValue({
        firstName: 'Dil',
        gender: 'Female'
      });

      component.resetForm();

      expect(component.studentRegistrationForm.value.firstName).toBeNull();
      expect(component.studentRegistrationForm.value.gender).toBe('Male');
      expect(component.studentRegistrationForm.value.id).toBe(0);
    });
  });
});
