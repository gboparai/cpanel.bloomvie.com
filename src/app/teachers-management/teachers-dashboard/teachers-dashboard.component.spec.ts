import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { TeachersDashboardComponent } from './teachers-dashboard.component';
import { CookieService } from 'ngx-cookie-service';
import { TeacherDashboardServiceService } from './teacher-dashboard-service.service';
import { WorkTimingService } from '../../day-care-management/work-timings/work-timings.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { DayCareDashboardService } from '../../day-care-management/daycare-dashboard/day-care-dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { LoginService } from '../../login/login.service';
import Swal from 'sweetalert2';

describe('TeachersDashboardComponent', () => {
  let component: TeachersDashboardComponent;
  let fixture: ComponentFixture<TeachersDashboardComponent>;

  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockTeacherDashService: jasmine.SpyObj<TeacherDashboardServiceService>;
  let mockWorkTimingService: jasmine.SpyObj<WorkTimingService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockTocService: jasmine.SpyObj<TocRegistrationService>;
  let mockDayCareDashService: jasmine.SpyObj<DayCareDashboardService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockOnboardingService: any;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(async () => {
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);
    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '55';
      if (key === 'UserRoleId') return '4';
      return '';
    });

    mockTeacherDashService = jasmine.createSpyObj('TeacherDashboardServiceService', [
      'getTeacherDashboardCount',
      'getDashboardPendingStudentAttandanceByuserId',
      'getEmployeeJoiningDocuments',
      'employeeJoiningDocuments',
      'getDayCareActivities'
    ]);
    mockTeacherDashService.getTeacherDashboardCount.and.returnValue(
      of({ message: 'Ok', result: { totalStudents: 15 } })
    );
    mockTeacherDashService.getDashboardPendingStudentAttandanceByuserId.and.returnValue(
      of({
        message: 'ok',
        result: {
          pendingActivityDetails: [{ id: 1, title: 'Art' }],
          pendingAttendanceDetails: [{ id: 2, status: 'Pending' }]
        }
      })
    );
    mockTeacherDashService.getEmployeeJoiningDocuments.and.returnValue(
      of({
        message: 'OK',
        result: { isOfferLetterAccepted: null, s3ImageUrl: 'offer.pdf' }
      })
    );
    mockTeacherDashService.employeeJoiningDocuments.and.returnValue(
      of({ message: 'OK', result: { id: 100 } })
    );
    mockTeacherDashService.getDayCareActivities.and.returnValue(
      of({ result: [{ id: 1, name: 'Play' }] })
    );

    mockWorkTimingService = jasmine.createSpyObj('WorkTimingService', ['getCentreHolidayList']);
    mockWorkTimingService.getCentreHolidayList.and.returnValue(
      of({ message: 'Success', result: [{ date: '2026-12-25', holidayName: 'Christmas' }] })
    );

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockTocService = jasmine.createSpyObj('TocRegistrationService', ['someMethod']);
    mockDayCareDashService = jasmine.createSpyObj('DayCareDashboardService', ['getAllEventManagementType']);
    mockDayCareDashService.getAllEventManagementType.and.returnValue(
      of({ message: 'Ok', result: [{ eventId: 1, eventName: 'Concert' }] })
    );

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockLoginService = jasmine.createSpyObj('LoginService', ['logOut']);

    mockSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    mockSanitizer.bypassSecurityTrustResourceUrl.and.callFake((val: string) => val as any);

    mockOnboardingService = {
      stripeOnboardingUrl: signal(''),
      onboardingState: jasmine.createSpy('onboardingState').and.returnValue({ stripeOnboardingUrl: '' }),
      getAccountDetails: jasmine.createSpy('getAccountDetails').and.returnValue(
        of({ result: { onBoardingUrl: 'https://stripe.com/onboard' } })
      )
    };

    // Mock jQuery
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal')
    });

    // Mock window.fetch for IP resolution
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        json: () => Promise.resolve({ ip: '192.168.1.1' })
      } as any)
    );

    await TestBed.configureTestingModule({
      imports: [TeachersDashboardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: CookieService, useValue: mockCookie },
        { provide: TeacherDashboardServiceService, useValue: mockTeacherDashService },
        { provide: WorkTimingService, useValue: mockWorkTimingService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: TocRegistrationService, useValue: mockTocService },
        { provide: DayCareDashboardService, useValue: mockDayCareDashService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: LoginService, useValue: mockLoginService }
      ]
    })
    .overrideComponent(TeachersDashboardComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeachersDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize properties from cookies', () => {
    expect(component).toBeTruthy();
    expect(component.centreID).toBe('10');
    expect(component.userID).toBe('55');
    expect(component.userRoleID).toBe('4');
  });

  it('should fetch teacher dashboard count', () => {
    component.getTeacherDashboardCount();
    expect(mockTeacherDashService.getTeacherDashboardCount).toHaveBeenCalledWith('55', '10');
    expect(component.countResult).toEqual({ totalStudents: 15 });
  });

  describe('getAllHolidayList', () => {
    it('should set holidayList on success', () => {
      component.getAllHolidayList();
      expect(mockWorkTimingService.getCentreHolidayList).toHaveBeenCalledWith(10 as any);
      expect(component.holidayList.length).toBe(1);
      expect(component.skeletonShowCalenderCard).toBe('');
    });

    it('should set empty holidayList on non-success message', () => {
      mockWorkTimingService.getCentreHolidayList.and.returnValue(
        of({ message: 'Failed', result: null })
      );
      component.getAllHolidayList();
      expect(component.holidayList).toEqual([]);
      expect(component.skeletonShowCalenderCard).toBe('');
    });
  });

  describe('getDashboardPendingStudentAttandanceByuserId', () => {
    it('should populate pending activities and attendance details on success', () => {
      component.getDashboardPendingStudentAttandanceByuserId();
      expect(component.pendingActivityDetails.length).toBe(1);
      expect(component.pendingAttendanceDetails.length).toBe(1);
      expect(component.skalatonShowCard).toBe('');
    });

    it('should clear data when API returns non-ok message', () => {
      mockTeacherDashService.getDashboardPendingStudentAttandanceByuserId.and.returnValue(
        of({ message: 'Error', result: null })
      );
      component.getDashboardPendingStudentAttandanceByuserId();
      expect(component.pendingActivityDetails).toEqual([]);
      expect(component.pendingAttendanceDetails).toEqual([]);
    });
  });

  it('should bypass url in getPdfUrl', () => {
    const url = component.getPdfUrl('test.pdf');
    expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('test.pdf');
    expect(url).toBe('test.pdf' as any);
  });

  it('should handle employee joining document check and show modal if pending acceptance', async () => {
    await component.getEmployeeJoiningDocuments();
    expect(component.teacherid.isOfferLetterAccepted).toBeNull();
    expect((window as any).$).toHaveBeenCalledWith('#AgrrementLetter');
  });

  describe('employeeJoiningDocuments', () => {
    it('should handle offer rejection after confirmation', fakeAsync(async () => {
      spyOn(Swal, 'fire').and.callFake(((options: any) => {
        return Promise.resolve({ isConfirmed: true } as any);
      }) as any);

      await component.employeeJoiningDocuments('reject');
      tick(500);

      expect(mockTeacherDashService.employeeJoiningDocuments).toHaveBeenCalledWith(
        '55',
        false,
        null,
        '192.168.1.1'
      );
      expect(mockLoginService.logOut).toHaveBeenCalled();
    }));

    it('should block offer acceptance if checkbox not checked or signature missing', fakeAsync(async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      component.letterAccepted = false;
      component.letterSignature = null;

      await component.employeeJoiningDocuments('accept');
      tick();

      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'Incomplete!'
      }));
      expect(mockTeacherDashService.employeeJoiningDocuments).not.toHaveBeenCalled();
    }));

    it('should proceed with offer acceptance when signed and accepted', fakeAsync(async () => {
      spyOn(Swal, 'fire').and.callFake(((options: any) => {
        return Promise.resolve({ isConfirmed: true } as any);
      }) as any);
      component.letterAccepted = true;
      component.letterSignature = 'John Doe';

      await component.employeeJoiningDocuments('accept');
      tick(500);

      expect(mockTeacherDashService.employeeJoiningDocuments).toHaveBeenCalledWith(
        '55',
        true,
        'John Doe',
        '192.168.1.1'
      );
    }));
  });

  describe('handleKeyPress', () => {
    it('should allow alphabetic letters and spaces', () => {
      const eventA = new KeyboardEvent('keypress', { key: 'A' });
      const eventSpace = new KeyboardEvent('keypress', { key: ' ' });
      expect(component.handleKeyPress(eventA)).toBeTrue();
      expect(component.handleKeyPress(eventSpace)).toBeTrue();
    });

    it('should reject numbers and symbols', () => {
      const eventNum = new KeyboardEvent('keypress', { key: '9' });
      const eventSym = new KeyboardEvent('keypress', { key: '$' });
      expect(component.handleKeyPress(eventNum)).toBeFalse();
      expect(component.handleKeyPress(eventSym)).toBeFalse();
    });
  });

  it('should fetch daycare activities and update list', () => {
    component.getDayCareActivities();
    expect(mockTeacherDashService.getDayCareActivities).toHaveBeenCalledWith('10');
    expect(component.dayCareActivity.length).toBe(1);
    expect(component.skeletonShowList2).toBe('');
  });

  it('should fetch event management types', () => {
    component.getAllEventManagementType();
    expect(mockDayCareDashService.getAllEventManagementType).toHaveBeenCalled();
    expect(component.eventList.length).toBe(1);
  });

  describe('navigateToStripeOnboarding', () => {
    it('should navigate directly if stripeUrl already exists', () => {
      mockOnboardingService.onboardingState.and.returnValue({
        stripeOnboardingUrl: 'https://connect.stripe.com/setup'
      });
      spyOnProperty(window, 'location', 'get').and.returnValue({ href: '' } as any);

      component.navigateToStripeOnboarding();
      expect(mockOnboardingService.getAccountDetails).not.toHaveBeenCalled();
    });

    it('should fetch account details and set url if stripeUrl is empty', () => {
      mockOnboardingService.onboardingState.and.returnValue({
        stripeOnboardingUrl: ''
      });
      component.userID = '55';

      component.navigateToStripeOnboarding();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockOnboardingService.getAccountDetails).toHaveBeenCalledWith(55, '');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should handle error when fetching account details fails', () => {
      spyOn(Swal, 'fire');
      mockOnboardingService.onboardingState.and.returnValue({
        stripeOnboardingUrl: ''
      });
      mockOnboardingService.getAccountDetails.and.returnValue(
        throwError(() => new Error('API failure'))
      );
      component.userID = '55';

      component.navigateToStripeOnboarding();

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith(
        'Server error',
        'Could not retrieve Stripe onboarding link. Please try again.',
        'error'
      );
    });
  });
});
