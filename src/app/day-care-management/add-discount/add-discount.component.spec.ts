import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddDiscountComponent } from './add-discount.component';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AddDiscountService } from './add-discount.service';
import { ManageClassroomService } from '../classroom-management/manage-classroom/manage-classroom.service';
import { DayCareDashboardService } from '../daycare-dashboard/day-care-dashboard.service';
import { DaycareService } from '../day-care-settings/daycare.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';

describe('AddDiscountComponent', () => {
  let component: AddDiscountComponent;
  let fixture: ComponentFixture<AddDiscountComponent>;

  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockDiscountService: jasmine.SpyObj<AddDiscountService>;
  let mockClassService: jasmine.SpyObj<ManageClassroomService>;
  let mockDashboardService: jasmine.SpyObj<DayCareDashboardService>;
  let mockDaycareService: any;
  let externalBillingSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check', 'deleteAll']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockDiscountService = jasmine.createSpyObj('AddDiscountService', [
      'getAllEnrolledStudentsRecord',
      'sendDiscountFormMail',
      'sendPaymentMailToParent',
      'geDiscountByPlanID',
      'getAllSubscriptionPlansForFrontEnd',
      'getCustomPlanByUserID',
    ]);
    mockClassService = jasmine.createSpyObj('ManageClassroomService', ['GetAllAgeGroup']);
    mockDashboardService = jasmine.createSpyObj('DayCareDashboardService', ['getAllEnrollmentRequestByCentreID']);

    externalBillingSubject = new BehaviorSubject<boolean>(false);
    mockDaycareService = {
      checkExternalBilling: jasmine.createSpy('checkExternalBilling').and.returnValue(
        of({ result: { externalBillingEnabled: false } })
      ),
      externalBilling$: externalBillingSubject.asObservable(),
    };

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '101';
      if (key === 'UserId') return '55';
      return '';
    });

    mockDashboardService.getAllEnrollmentRequestByCentreID.and.returnValue(
      of({
        message: 'Success',
        result: [
          {
            parentID: 1,
            email: 'parent@example.com',
            planID: 10,
            planName: 'Toddler Full Time',
            planPrice: 1200,
            students: [{ studentID: 101, name: 'Student 1', isMonthlyAge: true, minAge: 12, maxAge: 24 }],
          },
        ],
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });
    spyOn(window, 'scrollTo');

    await TestBed.configureTestingModule({
      imports: [AddDiscountComponent, ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: AddDiscountService, useValue: mockDiscountService },
        { provide: ManageClassroomService, useValue: mockClassService },
        { provide: DayCareDashboardService, useValue: mockDashboardService },
        { provide: DaycareService, useValue: mockDaycareService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddDiscountComponent, {
        set: {
          imports: [ReactiveFormsModule, FormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddDiscountComponent);
    component = fixture.componentInstance;
  });

  it('should create AddDiscountComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize parentDiscountForm and giveDiscountForm with controls', () => {
      expect(component.parentDiscountForm.contains('parentID')).toBeTrue();
      expect(component.parentDiscountForm.contains('email')).toBeTrue();
      expect(component.parentDiscountForm.contains('studentID')).toBeTrue();
      expect(component.parentDiscountForm.contains('PlanID')).toBeTrue();
      expect(component.parentDiscountForm.contains('discount')).toBeTrue();
      expect(component.parentDiscountForm.contains('discountType')).toBeTrue();

      expect(component.giveDiscountForm.contains('name')).toBeTrue();
      expect(component.giveDiscountForm.contains('ageGroup')).toBeTrue();
      expect(component.giveDiscountForm.contains('email')).toBeTrue();
      expect(component.giveDiscountForm.contains('planID')).toBeTrue();
    });
  });

  describe('Lifecycle: ngOnInit & ngOnDestroy', () => {
    it('should read cookies, check external billing, and fetch discount applied requests', () => {
      component.ngOnInit();
      expect(component.centreID).toBe(101);
      expect(component.userID).toBe(55);
      expect(mockDaycareService.checkExternalBilling).toHaveBeenCalledWith(101);
      expect(mockDashboardService.getAllEnrollmentRequestByCentreID).toHaveBeenCalled();
    });

    it('should react to externalBilling$ updates', () => {
      component.ngOnInit();
      externalBillingSubject.next(true);
      expect(component.isExternalBilling).toBeTrue();
      expect(component.parentDiscountForm.get('PlanID')?.validator).toBeNull();
    });

    it('should unsubscribe from externalBillingSub on destroy', () => {
      component.ngOnInit();
      spyOn((component as any).externalBillingSub, 'unsubscribe');
      component.ngOnDestroy();
      expect((component as any).externalBillingSub.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Month and Year conversions', () => {
    it('should convert months to years correctly', () => {
      expect(component.convertMonthsToYears(24)).toBe(2);
      expect(component.convertMonthsToYears(18)).toBe(1);
    });

    it('should throw error when months is negative', () => {
      expect(() => component.convertMonthsToYears(-5)).toThrowError(
        'Invalid input: months cannot be negative.'
      );
    });

    it('should convert years to months correctly', () => {
      expect(component.convertYearsToMonths(2)).toBe(24);
      expect(component.convertYearsToMonths(0)).toBe(0);
    });

    it('should throw error when years is negative', () => {
      expect(() => component.convertYearsToMonths(-1)).toThrowError(
        'Invalid input: years cannot be negative.'
      );
    });
  });

  describe('Student Records and Formatting', () => {
    it('should format studentList with monthly age correctly', () => {
      const discount = {
        students: [
          { isMonthlyAge: true, minAge: 12, maxAge: 24 },
          { isMonthlyAge: false, minAge: 2, maxAge: 4 },
        ],
      };
      component.getStudentRecords(discount);
      expect(component.studentList.length).toBe(2);
      expect(component.studentList[0].ageGroup).toContain('12 - 24 Months');
      expect(component.studentList[1].ageGroup).toContain('24 - 48 Months');
    });

    it('should format enrolledStudentList correctly', () => {
      const enrollmentRecord = {
        student: [
          { isMonthlyAge: true, minAge: 6, maxAge: 12 },
          { isMonthlyAge: false, minAge: 1, maxAge: 2 },
        ],
      };
      component.getEnrolledStudentRecords(enrollmentRecord);
      expect(component.enrolledStudentList.length).toBe(2);
      expect(component.enrolledStudentList[0].ageGroup).toContain('6 - 12 Months');
      expect(component.enrolledStudentList[1].ageGroup).toContain('12 - 24 Months');
    });
  });

  describe('Discount type and modal', () => {
    it('should set discount type in parentDiscountForm', () => {
      component.setDiscountType('percentage');
      expect(component.parentDiscountForm.value.discountType).toBe('percentage');

      component.onDiscountTypeChange({ value: 'amount' });
      expect(component.parentDiscountForm.value.discountType).toBe('amount');
    });

    it('should open discount modal and fetch age groups', () => {
      spyOn(component, 'getAgeGroupsList');
      component.openDiscountModal();
      expect(component.getAgeGroupsList).toHaveBeenCalled();
      expect((window as any).$).toHaveBeenCalledWith('#giveDiscount');
    });
  });

  describe('Validate Discount', () => {
    it('should clear percentage discount if input is < 0 or > 100', () => {
      component.parentDiscountForm.patchValue({ discountType: 'percentage' });
      component.validateDiscount({ target: { value: '150' } });
      expect(component.parentDiscountForm.value.discount).toBe('');

      component.validateDiscount({ target: { value: '-5' } });
      expect(component.parentDiscountForm.value.discount).toBe('');
    });

    it('should clear amount discount if greater than plan price', () => {
      component.parentDiscountForm.patchValue({ discountType: 'amount' });
      component.planDetails = { PlanPrice: 100 };
      component.validateDiscount({ target: { value: '150' } });
      expect(component.parentDiscountForm.value.discount).toBe('');
    });
  });

  describe('Enrolled Parent Records & Search', () => {
    it('should fetch enrolled parent records successfully', () => {
      mockDiscountService.getAllEnrolledStudentsRecord.and.returnValue(
        of({ message: 'Success', result: [{ parentID: 2, parentName: 'Jane' }] })
      );
      component.centreID = 101;

      component.getAllEnrolledParentRecord();

      expect(component.activeTab).toBe('Enrollment');
      expect(component.EnrolledParentRecord.length).toBe(1);
      expect(component.parentList.length).toBe(1);
    });

    it('should trigger searchParentDetails when query length > 3 or empty', () => {
      spyOn(component, 'getDiscountAppliedRequest');

      component.searchParentDetails({ target: { value: 'john' } });
      expect(component.searchItem).toBe('john');
      expect(component.getDiscountAppliedRequest).toHaveBeenCalled();

      component.searchParentDetails({ target: { value: '' } });
      expect(component.searchItem).toBe('');
      expect(component.getDiscountAppliedRequest).toHaveBeenCalledTimes(2);
    });
  });

  describe('Send Emails', () => {
    it('should send discount form to parent when giveDiscountForm is valid', () => {
      component.giveDiscountForm.patchValue({
        name: 'John Doe',
        ageGroup: '1',
        email: 'john@example.com',
        planID: '5',
      });
      component.centreID = 101;
      mockDiscountService.sendDiscountFormMail.and.returnValue(of({ message: 'Success' }));

      component.sendDiscountFormToParent();

      expect(mockDiscountService.sendDiscountFormMail).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Discount form email send successfully.');
    });

    it('should mark all touched if giveDiscountForm is invalid', () => {
      component.giveDiscountForm.patchValue({ email: '' });
      component.sendDiscountFormToParent();
      expect(mockDiscountService.sendDiscountFormMail).not.toHaveBeenCalled();
    });

    it('should send discount payment email when parentDiscountForm is valid', () => {
      component.parentDiscountForm.patchValue({
        parentID: 1,
        email: 'parent@example.com',
        studentID: 101,
        PlanID: 10,
        discount: '50',
        discountType: 'amount',
        parentType: 'new',
      });
      component.centreID = 101;
      mockDiscountService.sendPaymentMailToParent.and.returnValue(of({ message: 'Success' }));

      component.sendDiscountPlanEmail();

      expect(mockDiscountService.sendPaymentMailToParent).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Payment Email Send Successfully');
    });

    it('should handle Plan Assignment Succesfull response', () => {
      component.parentDiscountForm.patchValue({
        parentID: 1,
        email: 'parent@example.com',
        studentID: 101,
        PlanID: 10,
        discount: '50',
        discountType: 'amount',
        parentType: 'new',
      });
      component.centreID = 101;
      mockDiscountService.sendPaymentMailToParent.and.returnValue(
        of({ message: 'Plan Assignment Succesfull' })
      );

      component.sendDiscountPlanEmail();

      expect(mockToastr.success).toHaveBeenCalledWith('Plan Assigned Successfully');
    });
  });

  describe('Age groups and plans', () => {
    it('should fetch age groups list and map correctly', () => {
      component.centreID = 101;
      mockClassService.GetAllAgeGroup.and.returnValue(
        of({
          message: 'Success',
          result: [
            { id: 1, isActive: true, isMonthly: true, minAge: 6, maxAge: 12 },
            { id: 2, isActive: true, isMonthly: false, minAge: 1, maxAge: 3 },
            { id: 3, isActive: false, isMonthly: false, minAge: 3, maxAge: 5 },
          ],
        })
      );

      component.getAgeGroupsList();

      expect(component.ageGroupList.length).toBe(2);
      expect(component.ageGroupList[0].value).toBe(1);
    });

    it('should fetch discounts for selected plan', () => {
      mockDiscountService.geDiscountByPlanID.and.returnValue(
        of({
          message: 'Success',
          result: [{ id: 1, discountPlan: 'Early Bird', discountValue: 10 }],
        })
      );

      component.getDiscountsForSelectedPlan({ subscriptionPlanID: 5 });

      expect(component.discountedPlanList.length).toBe(1);
      expect(component.discountedPlanList[0].value).toBe(1);
    });

    it('should close banner', () => {
      component.closeBanner();
      expect(component.showBanner).toBeFalse();
    });
  });
});
