import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ParentDashboardComponent } from './parent-dashboard.component';
import { CookieService } from 'ngx-cookie-service';
import { ParentDashboardService } from './parent-dashboard.service';
import { ClassroomDetailsService } from '../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { HeaderServiceService } from '../../layout/header/header-service.service';
import { ViewTeacherService } from '../../teachers-management/view-teacher/view-teacher.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MyAttendanceService } from '../../common-component/my-attendance/my-attendance.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common-component/common.service';
import { StripeService } from 'ngx-stripe';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { LoginService } from '../../login/login.service';
import { ManageStudentService } from '../../day-care-management/student-management/manage-student/manage-student.service';
import { DaycareService } from '../../day-care-management/day-care-settings/daycare.service';
import Swal from 'sweetalert2';

describe('ParentDashboardComponent', () => {
  let component: ParentDashboardComponent;
  let fixture: ComponentFixture<ParentDashboardComponent>;

  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockParentDashService: jasmine.SpyObj<ParentDashboardService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockClassroomService: jasmine.SpyObj<ClassroomDetailsService>;
  let mockHeaderService: any;
  let mockViewTeacherService: jasmine.SpyObj<ViewTeacherService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockAttendanceService: jasmine.SpyObj<MyAttendanceService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCommonService: any;
  let mockStripeService: any;
  let mockOnboardingService: jasmine.SpyObj<OnboardingService>;
  let mockLoginService: any;
  let mockManageStudentService: jasmine.SpyObj<ManageStudentService>;
  let mockDaycareService: jasmine.SpyObj<DaycareService>;

  beforeEach(async () => {
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookie.check.and.callFake((key: string) => key === 'CentreID');
    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '101';
      if (key === 'StudentID') return '501';
      if (key === 'UserRoleId') return '5';
      if (key === 'UserInfo') {
        return JSON.stringify({
          result: {
            firstName: 'Sarah',
            lastName: 'Connor',
            centreID: 10,
            termsAndCondition: 'Accepted'
          }
        });
      }
      return '';
    });

    mockParentDashService = jasmine.createSpyObj('ParentDashboardService', [
      'CheckParentOnboarding',
      'getAllPendingPaymentsByStudentID',
      'ClearStudentPendingPayments'
    ]);
    mockParentDashService.CheckParentOnboarding.and.returnValue(
      of({ message: 'Success' })
    );
    mockParentDashService.getAllPendingPaymentsByStudentID.and.returnValue(
      of({
        message: 'Success',
        result: [
          { uniqueID: 'pay-1', totalPaidAmount: 100, monthDueDate: '2026-05-01', planAmount: 100 }
        ]
      })
    );
    mockParentDashService.ClearStudentPendingPayments.and.returnValue(
      of({ message: 'Success', result: { subscriptionPlanPaymentIdList: [1] } })
    );

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', ['getStudentDetails']);
    mockClassroomService.getStudentDetails.and.returnValue(
      of({
        message: 'OK',
        result: [
          {
            days: [
              {
                date: new Date().toISOString(),
                studentData: [
                  { activityPath: '/act/', activityImage: 'img1.png', activityStartTime: '09:00' }
                ]
              }
            ]
          }
        ]
      })
    );

    mockHeaderService = {
      switchProfile: signal(0),
      getAllStudentsByParentID: jasmine.createSpy('getAllStudentsByParentID').and.returnValue(
        of({
          message: 'Success',
          result: {
            studentList: [{ id: 501, parentID: 101, centreID: 10 }]
          }
        })
      ),
      CheckStudentSubscriptionPayment: jasmine.createSpy('CheckStudentSubscriptionPayment').and.returnValue(
        of({ message: 'Success', result: [{ planName: 'Monthly Care' }] })
      )
    };

    mockViewTeacherService = jasmine.createSpyObj('ViewTeacherService', ['getTeacherDetailByStudentParentId']);
    mockViewTeacherService.getTeacherDetailByStudentParentId.and.returnValue(
      of({ message: 'OK', count: 2, result: [] })
    );

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockAttendanceService = jasmine.createSpyObj('MyAttendanceService', [
      'checkTodayAttandanceStatusById',
      'getCurrentMonthAttendanceSummaryByID'
    ]);
    mockAttendanceService.checkTodayAttandanceStatusById.and.returnValue(
      of({ message: 'ok', result: true })
    );
    mockAttendanceService.getCurrentMonthAttendanceSummaryByID.and.returnValue(
      of({ message: 'Success', result: { presentDays: 18 } })
    );

    mockToastr = jasmine.createSpyObj('ToastrService', ['error', 'success']);

    mockCommonService = {
      platFormFee: signal(2.5),
      updateDisplaySpinner: jasmine.createSpy('updateDisplaySpinner'),
      AcceptOrRejectTermsAndCondition: jasmine.createSpy('AcceptOrRejectTermsAndCondition').and.returnValue(
        of({ message: 'Success', activity: 'Accepted' })
      ),
      createPaymentIntent: jasmine.createSpy('createPaymentIntent').and.returnValue(
        of({ clientSecret: 'pi_test_secret_123' })
      ),
      createPayment: jasmine.createSpy('createPayment').and.returnValue(
        of({ result: { status: 'Success' } })
      ),
      transferToConnectedAccount: jasmine.createSpy('transferToConnectedAccount').and.returnValue(
        of({ message: 'Success' })
      )
    };

    mockStripeService = {
      elements: jasmine.createSpy('elements').and.returnValue(
        of({
          create: jasmine.createSpy('create').and.returnValue({
            mount: jasmine.createSpy('mount'),
            unmount: jasmine.createSpy('unmount')
          })
        })
      ),
      confirmCardPayment: jasmine.createSpy('confirmCardPayment').and.returnValue(
        of({
          paymentIntent: {
            id: 'pi_123',
            status: 'succeeded',
            amount: 10000,
            currency: 'cad',
            payment_method: 'pm_card'
          }
        })
      )
    };

    mockOnboardingService = jasmine.createSpyObj('OnboardingService', ['getAccountDetails']);
    mockOnboardingService.getAccountDetails.and.returnValue(
      of({ result: { accountId: 'acct_123', externalBillingEnabled: false } })
    );

    mockLoginService = {
      authData: { centreAdminId: 2, centreId: 10 },
      logOut: jasmine.createSpy('logOut')
    };

    mockManageStudentService = jasmine.createSpyObj('ManageStudentService', ['getDayCareCentreDetails']);
    mockManageStudentService.getDayCareCentreDetails.and.returnValue(
      of({ message: 'OK', result: { centreAdminID: 2, externalBillingEnabled: false } })
    );

    mockDaycareService = jasmine.createSpyObj('DaycareService', ['getCentreSettings']);
    mockDaycareService.getCentreSettings.and.returnValue(
      of({ message: 'OK', result: { externalBillingEnabled: false } })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal')
    });

    await TestBed.configureTestingModule({
      imports: [ParentDashboardComponent, ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        FormBuilder,
        { provide: CookieService, useValue: mockCookie },
        { provide: ParentDashboardService, useValue: mockParentDashService },
        { provide: Router, useValue: mockRouter },
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
        { provide: HeaderServiceService, useValue: mockHeaderService },
        { provide: ViewTeacherService, useValue: mockViewTeacherService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: MyAttendanceService, useValue: mockAttendanceService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CommonService, useValue: mockCommonService },
        { provide: StripeService, useValue: mockStripeService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: LoginService, useValue: mockLoginService },
        { provide: ManageStudentService, useValue: mockManageStudentService },
        { provide: DaycareService, useValue: mockDaycareService }
      ]
    })
    .overrideComponent(ParentDashboardComponent, {
      set: { imports: [ReactiveFormsModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize parent information', async () => {
    await component.ngOnInit();
    expect(component).toBeTruthy();
    expect(component.centreID).toBe(10);
    expect(component.parentName).toBe('Sarah Connor');
    expect(component.loginUserId).toBe('101');
    expect(component.studentID).toBe('501');
  });

  it('should initialize payment form with required validators', () => {
    expect(component.paymentForm).toBeDefined();
    expect(component.paymentForm.valid).toBeFalse();

    component.paymentForm.patchValue({
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah@test.com',
      phoneNumber: '1234567890'
    });
    expect(component.paymentForm.valid).toBeTrue();
  });

  describe('checkExternalBilling', () => {
    it('should set isExternalBilling to true when enabled by centre settings', async () => {
      mockDaycareService.getCentreSettings.and.returnValue(
        of({ message: 'OK', result: { externalBillingEnabled: true } })
      );
      const isExt = await component.checkExternalBilling(10);
      expect(isExt).toBeTrue();
      expect(component.isExternalBilling).toBeTrue();
      expect(component.pendingPaymentRecord).toEqual([]);
      expect(component.paymentDetail).toBeNull();
    });

    it('should return false if centreId is 0 or error occurs', async () => {
      const isExt = await component.checkExternalBilling(0);
      expect(isExt).toBeFalse();
    });
  });

  describe('Attendance and Onboarding checks', () => {
    it('should check today attendance status and update TodayAttendanceStatus', () => {
      component.studentID = '501';
      component.userroleID = '5';
      component.checkTodayAttandanceStatusById();

      expect(mockAttendanceService.checkTodayAttandanceStatusById).toHaveBeenCalledWith(501, 5, 0);
      expect(component.TodayAttendanceStatus).toBeTrue();
    });

    it('should check parent onboarding and navigate to onboarding if not success', () => {
      mockParentDashService.CheckParentOnboarding.and.returnValue(
        of({ message: 'Failed' })
      );
      component.CheckParentOnboarding(501);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['parent-onboarding']);
    });
  });

  describe('Terms and conditions', () => {
    it('should toggle isDisabledCondition on AcceptTermsAndConditions checkbox click', () => {
      component.AcceptTermsAndConditions({ target: { checked: true } });
      expect(component.isDisabledCondition).toBeFalse();

      component.AcceptTermsAndConditions({ target: { checked: false } });
      expect(component.isDisabledCondition).toBeTrue();
    });

    it('should handle TermsAndConditionAction and confirm with Swal', () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      spyOn(component, 'AcceptOrRejectTermsAndCondition');

      component.TermsAndConditionAction(6);
      expect(Swal.fire).toHaveBeenCalled();
    });

    it('should execute AcceptOrRejectTermsAndCondition on confirmation', () => {
      component.loginUserId = '101';
      component.AcceptOrRejectTermsAndCondition(6);

      expect(mockCommonService.AcceptOrRejectTermsAndCondition).toHaveBeenCalledWith('101', 6);
      expect(mockCookie.set).toHaveBeenCalledWith('termAndCondition', 'Accepted');
    });
  });

  describe('Payment operations', () => {
    it('should calculate total amount for selected pending payments', () => {
      component.selectedPendingPayments = [
        { totalPaidAmount: 50 },
        { totalPaidAmount: 150 }
      ];
      expect(component.calculateTotal()).toBe(200);
    });

    it('should select and deselect all pending payments', () => {
      component.pendingPaymentRecord = [
        { uniqueID: 'p1', totalPaidAmount: 100, check: false },
        { uniqueID: 'p2', totalPaidAmount: 200, check: false }
      ];

      component.selectAllPendingPayment({ target: { checked: true } });
      expect(component.selectedPendingPayments.length).toBe(2);
      expect(component.pendingPaymentRecord.every(p => p.check)).toBeTrue();

      component.selectAllPendingPayment({ target: { checked: false } });
      expect(component.selectedPendingPayments.length).toBe(0);
      expect(component.pendingPaymentRecord.every(p => !p.check)).toBeTrue();
    });

    it('should show error in payNow if no records are selected', () => {
      spyOn(Swal, 'fire');
      component.selectedPendingPayments = [];
      component.payNow();
      expect(Swal.fire).toHaveBeenCalledWith('Select Atleast one Record !!', '', 'error');
    });

    it('should open payment modal in payNow when items are selected', fakeAsync(() => {
      component.selectedPendingPayments = [{ totalPaidAmount: 100 }];
      component.payNow();
      expect((window as any).$).toHaveBeenCalledWith('#staticBackdrop');
      tick(600);
      expect(component.isPaymentModalOpen).toBeTrue();
      expect(mockStripeService.elements).toHaveBeenCalled();
    }));

    it('should closePaymentModal and reset paymentForm', () => {
      component.paymentForm.patchValue({ firstName: 'John' });
      component.isPaymentModalOpen = true;
      component.closePaymentModal();

      expect(component.isPaymentModalOpen).toBeFalse();
      expect(component.paymentForm.get('firstName')?.value).toBeNull();
      expect((window as any).$).toHaveBeenCalledWith('#staticBackdrop');
    });

    it('should proceed to submit payment when valid with stripe', async () => {
      component.paymentForm.patchValue({
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah@test.com',
        phoneNumber: '1234567890'
      });
      component.selectedPendingPayments = [
        { planID: 1, monthDueDate: '2026-05-01', paymentDate: '2026-05-02', planAmount: 100, totalPaidAmount: 100, discount: 0 }
      ];

      await component.onSubmitPayment();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockCommonService.createPaymentIntent).toHaveBeenCalled();
      expect(mockStripeService.confirmCardPayment).toHaveBeenCalled();
      expect(mockCommonService.createPayment).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should handle zero total payment submission directly', async () => {
      component.paymentForm.patchValue({
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah@test.com',
        phoneNumber: '1234567890'
      });
      component.selectedPendingPayments = [
        { planID: 1, monthDueDate: '2026-05-01', paymentDate: '2026-05-02', planAmount: 0, totalPaidAmount: 0, discount: 0 }
      ];

      await component.onSubmitPayment();

      expect(mockParentDashService.ClearStudentPendingPayments).toHaveBeenCalled();
      expect(mockStripeService.confirmCardPayment).not.toHaveBeenCalled();
    });
  });

  describe('Student Data and Grouping', () => {
    it('should group activities by day and sort them', () => {
      component.studentData = [
        {
          days: [
            {
              date: new Date().toISOString(),
              month: 'May',
              studentData: [
                { activityStartTime: '10:00', title: 'Story' },
                { activityStartTime: '11:00', title: 'Music' }
              ]
            }
          ]
        }
      ];

      component.groupActivitiesByDay();

      expect(component.flattenedActivitiesByDay.length).toBe(1);
      expect(component.flattenedActivitiesByDay[0].studentData[0].activityStartTime).toBe('11:00');
    });

    it('should fetch all students for parent and retrieve plan detail', async () => {
      await component.getAllStudentsForParent();
      expect(mockHeaderService.getAllStudentsByParentID).toHaveBeenCalledWith('101');
      expect(mockHeaderService.CheckStudentSubscriptionPayment).toHaveBeenCalled();
      expect(component.paymentDetail).toBeDefined();
    });

    it('should fetch daycare centre details', () => {
      component.centreID = 10;
      component.getDayCareCentreDetails();
      expect(mockManageStudentService.getDayCareCentreDetails).toHaveBeenCalledWith(10);
      expect(component.daycarecentreDetails).toBeDefined();
    });
  });
});
