import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DaycareDashboardComponent } from './daycare-dashboard.component';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

import { TocViewService } from '../../toc-view/toc-view.service';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { ProfileService } from '../../common-component/profile/profile.service';
import { CommonService } from '../../common-component/common.service';
import { ViewStudentEnrollmentService } from '../student-management/view-student-enrollment/view-student-enrollment.service';
import { ClassroomDetailsService } from '../classroom-management/classroom-details/classroom-details.service';
import { LoginService } from '../../login/login.service';
import { JobPortalServiceService } from '../job-portal-details/job-portal-service.service';
import { DayCareDashboardService } from './day-care-dashboard.service';
import { WorkTimingService } from '../work-timings/work-timings.service';
import { ManageEventService } from '../../settings/manage-event/manage-event.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { HeaderServiceService } from '../../layout/header/header-service.service';
import { DaycareService } from '../day-care-settings/daycare.service';

describe('DaycareDashboardComponent', () => {
  let component: DaycareDashboardComponent;
  let fixture: ComponentFixture<DaycareDashboardComponent>;

  let mockTocViewService: jasmine.SpyObj<TocViewService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockTocRegService: jasmine.SpyObj<TocRegistrationService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockViewStudentService: jasmine.SpyObj<ViewStudentEnrollmentService>;
  let mockClassroomService: jasmine.SpyObj<ClassroomDetailsService>;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockJobPortalService: jasmine.SpyObj<JobPortalServiceService>;
  let mockDaycareDashboardService: jasmine.SpyObj<DayCareDashboardService>;
  let mockWorkTimingService: jasmine.SpyObj<WorkTimingService>;
  let mockManageEventService: jasmine.SpyObj<ManageEventService>;
  let mockDaycareService: jasmine.SpyObj<DaycareService>;

  let mockOnboardingService: any;
  let mockHeaderService: any;

  beforeEach(async () => {
    mockTocViewService = jasmine.createSpyObj('TocViewService', [
      'getQualifications',
      'getAppliedJobTOByID',
      'getDocumentTypeList',
    ]);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockTocRegService = jasmine.createSpyObj('TocRegistrationService', [
      'getAllAreaOfExpertise',
      'getAllMasterStatus',
    ]);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getProfileData']);
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'decrypt',
      'encrypt',
      'convertS3File',
      'AcceptOrRejectTermsAndCondition',
      'updateLoadSideBar',
    ]);
    mockViewStudentService = jasmine.createSpyObj('ViewStudentEnrollmentService', ['getStudentList']);
    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', ['getClassRoom']);
    mockLoginService = jasmine.createSpyObj('LoginService', ['logOut']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockJobPortalService = jasmine.createSpyObj('JobPortalServiceService', [
      'getJobPosts',
      'getAppliedJobPosting',
    ]);
    mockDaycareDashboardService = jasmine.createSpyObj('DayCareDashboardService', [
      'updateStripeStepCount',
      'getDayCareByID',
      'getDayCareDashBoardCount',
      'getActivitesByCenterId',
      'getStaffTransferedDetailsByCentreID',
      'getAllEnrollmentRequestByCentreID',
    ]);
    mockWorkTimingService = jasmine.createSpyObj('WorkTimingService', ['getCentreHolidayList']);
    mockManageEventService = jasmine.createSpyObj('ManageEventService', ['getEvents']);
    mockDaycareService = jasmine.createSpyObj('DaycareService', ['checkExternalBilling']);

    mockOnboardingService = {
      connectedAccountId: signal(''),
      stripeOnboardingStepsCount: signal(0),
      isOnboardedAccount: signal(false),
      stripeOnboardingUrl: signal(''),
      onboardingState: () => ({ stripeOnboardingUrl: 'https://stripe.com/test' }),
      getAccountDetails: jasmine.createSpy('getAccountDetails').and.returnValue(
        of({ result: { isOnboarded: true, onBoardingUrl: 'https://stripe.com/test' } })
      ),
    };

    mockHeaderService = {
      triggerEffect: signal(false),
      triggerModal: signal(false),
      triggerTermsAndCondition: signal(false),
      updateTriggerModal: jasmine.createSpy('updateTriggerModal'),
      updateTriggerTermsAndCondition: jasmine.createSpy('updateTriggerTermsAndCondition'),
    };

    mockCookieService.check.and.callFake((key: string) => {
      if (key === 'termAndCondition' || key === 'UserRoleId' || key === 'UserId') return true;
      return false;
    });
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserInfo') {
        return JSON.stringify({
          result: {
            centreID: 10,
            termsAndCondition: true,
            userRoleID: 3,
            pinCode: 'V1V 1V1',
          },
        });
      }
      if (key === 'termAndCondition') return 'Accepted';
      if (key === 'UserRoleId') return '3';
      if (key === 'UserId') return '101';
      return '';
    });

    mockDaycareService.checkExternalBilling.and.returnValue(
      of({ message: 'Success', result: false })
    );
    mockDaycareDashboardService.getDayCareByID.and.returnValue(
      of({ message: 'OK', result: { centreName: 'Sunshine Daycare' } })
    );
    mockDaycareDashboardService.getDayCareDashBoardCount.and.returnValue(
      of({ message: 'OK', result: { totalStudents: 45 } })
    );
    mockDaycareDashboardService.getActivitesByCenterId.and.returnValue(
      of({ message: 'OK', result: [] })
    );
    mockJobPortalService.getAppliedJobPosting.and.returnValue(
      of({ message: 'ok', result: [] })
    );
    mockDaycareDashboardService.getStaffTransferedDetailsByCentreID.and.returnValue(
      of({ message: 'OK', result: [] })
    );
    mockDaycareDashboardService.getAllEnrollmentRequestByCentreID.and.returnValue(
      of({ message: 'OK', result: [] })
    );
    mockTocViewService.getQualifications.and.returnValue(
      of({ message: 'OK', result: [{ id: 1, qualification: 'ECE' }] })
    );
    mockTocViewService.getDocumentTypeList.and.returnValue(
      of({ message: 'OK', result: [] })
    );
    mockTocRegService.getAllMasterStatus.and.returnValue(
      of({ message: 'OK', result: [] })
    );
    mockTocRegService.getAllAreaOfExpertise.and.returnValue(
      of({ message: 'Success', result: [{ id: 1, name: 'Special Needs', isActive: true }] })
    );
    mockWorkTimingService.getCentreHolidayList.and.returnValue(
      of({ message: 'Success', result: [] })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      tab: jasmine.createSpy('tab'),
    });

    await TestBed.configureTestingModule({
      imports: [DaycareDashboardComponent, ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: TocViewService, useValue: mockTocViewService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: Router, useValue: mockRouter },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: TocRegistrationService, useValue: mockTocRegService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: ViewStudentEnrollmentService, useValue: mockViewStudentService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (k: string) => null,
              },
            },
          },
        },
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
        { provide: LoginService, useValue: mockLoginService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: JobPortalServiceService, useValue: mockJobPortalService },
        { provide: DayCareDashboardService, useValue: mockDaycareDashboardService },
        { provide: WorkTimingService, useValue: mockWorkTimingService },
        { provide: ManageEventService, useValue: mockManageEventService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: HeaderServiceService, useValue: mockHeaderService },
        { provide: DaycareService, useValue: mockDaycareService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(DaycareDashboardComponent, {
        set: {
          imports: [ReactiveFormsModule, FormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DaycareDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create DaycareDashboardComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize loginForm, assignClassForm, and studentDiscountAppliedForm', () => {
      expect(component.loginForm.contains('email')).toBeTrue();
      expect(component.loginForm.contains('password')).toBeTrue();
      expect(component.assignClassForm.contains('classID')).toBeTrue();
      expect(component.studentDiscountAppliedForm.contains('discountValue')).toBeTrue();
    });
  });

  describe('ngOnInit & Data Loading', () => {
    it('should initialize data and fetch dashboard metrics on init', () => {
      component.ngOnInit();

      expect(component.DayCareId).toBe(10);
      expect(component.termsAndCondition).toBeTrue();
      expect(mockDaycareService.checkExternalBilling).toHaveBeenCalledWith(10);
      expect(mockDaycareDashboardService.getDayCareByID).toHaveBeenCalledWith(10);
      expect(mockDaycareDashboardService.getDayCareDashBoardCount).toHaveBeenCalledWith(10);
      expect(mockTocViewService.getQualifications).toHaveBeenCalled();
      expect(mockTocRegService.getAllAreaOfExpertise).toHaveBeenCalled();
      expect(mockWorkTimingService.getCentreHolidayList).toHaveBeenCalledWith(10);
    });
  });

  describe('Terms and Conditions', () => {
    it('should toggle isDisabledCondition with AcceptTermsAndConditions', () => {
      component.AcceptTermsAndConditions({ target: { checked: true } });
      expect(component.isDisabledCondition).toBeFalse();

      component.AcceptTermsAndConditions({ target: { checked: false } });
      expect(component.isDisabledCondition).toBeTrue();
    });

    it('should handle TermsAndConditionAction confirmation and acceptance', () => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true } as any)
      );
      spyOn(component, 'AcceptOrRejectTermsAndCondition');

      component.TermsAndConditionAction(6);

      expect(Swal.fire).toHaveBeenCalled();
    });

    it('should execute AcceptOrRejectTermsAndCondition and update cookies', () => {
      mockCommonService.AcceptOrRejectTermsAndCondition.and.returnValue(
        of({ message: 'Success', activity: 'Accepted' })
      );

      component.AcceptOrRejectTermsAndCondition(6);

      expect(mockCommonService.AcceptOrRejectTermsAndCondition).toHaveBeenCalledWith(component.UserID, 6);
      expect(mockCookieService.set).toHaveBeenCalledWith('termAndCondition', 'Accepted');
    });
  });

  describe('Discount calculations', () => {
    it('should apply discount when studentDiscountAppliedForm is valid', () => {
      component.paymentDetails = {
        totalAmountPaid: 1000,
        planName: 'Toddler',
        planPrice: 500,
        startDate: '2026-10-01',
      };
      component.acceptedStudent = [
        { studentID: 1, studentFullName: 'Student A' },
      ];
      component.studentDiscountAppliedForm.patchValue({
        studentID: 1,
        discountType: 'amount',
        discountValue: 50,
      });

      component.AddDiscount();

      expect(component.appliedDiscountStudentList.length).toBe(1);
      expect(component.appliedDiscountStudentList[0].studentID).toBe(1);
    });

    it('should update and delete discount records correctly', () => {
      component.appliedDiscountStudentList = [
        {
          studentID: 1,
          discountType: 'amount',
          discountValue: 50,
          totalAmount: '450.00',
        },
      ];
      component.paymentDetails = { totalDiscountAmount: 450 };

      component.updateDiscountRecord(0);
      expect(component.isUpdateCase).toBeTrue();
      expect(component.studentDiscountAppliedForm.value.studentID).toBe(1);

      component.deleteDiscountRecord(0);
      expect(component.appliedDiscountStudentList.length).toBe(0);
    });
  });

  describe('Helper methods', () => {
    it('should calculate daysInMonth correctly', () => {
      expect(component.daysInMonth(2026, 2)).toBe(28); // 2026 Feb
      expect(component.daysInMonth(2024, 2)).toBe(29); // Leap year Feb
      expect(component.daysInMonth(2026, 10)).toBe(31); // Oct
    });

    it('should fetch view details by ID using getByIDForView', () => {
      mockTocViewService.getAppliedJobTOByID.and.returnValue(
        of({
          message: 'ok',
          result: [
            {
              id: 99,
              educational_Credentails: 'edu.pdf',
              documentResumes: 'resume.pdf',
              uploadedDocument: 'doc.pdf',
              qualification: '1',
            },
          ],
        })
      );
      mockCommonService.convertS3File.and.callFake((path: string) => `https://s3.com/${path}`);

      component.getByIDForView(99);

      expect(mockTocViewService.getAppliedJobTOByID).toHaveBeenCalledWith(99, 10);
      expect(component.TocDetail.Educational_Credentails).toBe('https://s3.com/edu.pdf');
    });
  });
});
