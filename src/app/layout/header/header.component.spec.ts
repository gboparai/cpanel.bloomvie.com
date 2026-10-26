import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { HeaderServiceService } from './header-service.service';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { WelcomeService } from '../../welcome/welcome.service';
import { UserRoleService } from '../../settings/Permission/user-role/user-role.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { ProfileService } from '../../common-component/profile/profile.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common-component/common.service';
import { LoginService } from '../../login/login.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { DaycareService } from '../../day-care-management/day-care-settings/daycare.service';
import { of, BehaviorSubject, Subject } from 'rxjs';
import Swal from 'sweetalert2';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockHeaderService: any;
  let mockAppSettingsService: any;
  let mockWelcomeService: jasmine.SpyObj<WelcomeService>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCommonService: any;
  let mockLoginService: any;
  let mockOnboardingService: any;
  let mockDaycareService: any;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      text: jasmine.createSpy('text').and.returnValue(''),
    });

    mockHeaderService = {
      newStudent: signal(0),
      notification: new BehaviorSubject<boolean>(false),
      switchProfile: signal(0),
      getAllStudentsByParentID: jasmine.createSpy('getAllStudentsByParentID').and.returnValue(of({ message: 'Success', result: [] })),
      checkStudentOnboardingCompleteOrNotByStudentID: jasmine.createSpy('checkStudentOnboardingCompleteOrNotByStudentID').and.returnValue(of({ message: 'Error' })),
      CheckParentOnboarding: jasmine.createSpy('CheckParentOnboarding').and.returnValue(of({ message: 'Success' })),
      generateExpressLoginLink: jasmine.createSpy('generateExpressLoginLink').and.returnValue(of({ result: { url: 'https://stripe.com' } })),
      updateTriggerModal: jasmine.createSpy('updateTriggerModal'),
    };

    mockAppSettingsService = {
      breadcrumb$: new BehaviorSubject<any>(null),
      GetNofications: jasmine.createSpy('GetNofications').and.returnValue(of({ message: 'ok', result: [] })),
      AppintmentIsRead: jasmine.createSpy('AppintmentIsRead').and.returnValue(of({ message: 'ok', result: [] })),
      GetApplicationSetting: jasmine.createSpy('GetApplicationSetting').and.returnValue(of({ message: 'Success', result: { businessName: 'Bloomvie' } })),
    };

    mockWelcomeService = jasmine.createSpyObj('WelcomeService', ['getDaycareLogos']);
    mockWelcomeService.getDaycareLogos.and.returnValue(of({ message: 'OK', result: 'logo.png' }));

    mockUserRoleService = jasmine.createSpyObj('UserRoleService', ['getUserRolesByID']);
    mockUserRoleService.getUserRolesByID.and.returnValue(of({ message: 'Ok', result: { userRole: 'Admin' } }));

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'check', 'deleteAll']);
    mockCookieService.get.and.returnValue('1');

    mockProfileService = jasmine.createSpyObj('ProfileService', ['getSubscriptionPlanByUserId', 'GetUserById']);
    mockProfileService.getSubscriptionPlanByUserId.and.returnValue(of({ message: 'OK', result: [] }));
    mockProfileService.GetUserById.and.returnValue(of({
      message: 'Success',
      result: { firstName: 'Jane', lastName: 'Doe', studentList: [] },
    }));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);

    mockCommonService = {
      headerImage: signal(''),
      triggerSignal: signal(0),
      triggerLogoSignal: signal(0),
      daycareCentreInformation: {
        update: jasmine.createSpy('update'),
      },
      getBloomvieSettings: jasmine.createSpy('getBloomvieSettings').and.returnValue(of({ result: { platformFeePercentage: 5 } })),
      setPlatFormFee: jasmine.createSpy('setPlatFormFee'),
      convertS3File: jasmine.createSpy('convertS3File').and.returnValue('https://s3.aws.com/logo.png'),
      getS3FileByName: jasmine.createSpy('getS3FileByName').and.returnValue(of(new Blob())),
      decrypt: jasmine.createSpy('decrypt').and.returnValue('decrypted'),
      encrypt: jasmine.createSpy('encrypt').and.returnValue('encrypted'),
    };

    mockLoginService = {
      authData: {
        centreId: 10,
        userRoleId: 1,
        userId: 100,
        email: 'user@bloomvie.com',
        name: 'John Doe',
      },
      loadUserFromStorage: jasmine.createSpy('loadUserFromStorage'),
    };

    mockOnboardingService = {
      connectedAccountId: signal('acc_123'),
      isOnboardedAccount: signal(true),
      stripeOnboardingStepsCount: signal(2),
      stripeOnboardingUrl: signal('https://stripe.com'),
      onboardingState: signal({ connectedAccountId: 'acc_123' }),
      getAccountDetails: jasmine.createSpy('getAccountDetails').and.returnValue(of({
        result: {
          accountId: 'acc_123',
          isOnboarded: true,
          stripeStepsCount: 2,
          onBoardingUrl: 'https://stripe.com',
        },
      })),
    };

    mockDaycareService = {
      checkExternalBilling: jasmine.createSpy('checkExternalBilling').and.returnValue(of({ message: 'Success', result: { externalBillingEnabled: false } })),
      externalBilling$: new BehaviorSubject<boolean>(false),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        FormBuilder,
        { provide: HeaderServiceService, useValue: mockHeaderService },
        { provide: ApplicationsSettingsService, useValue: mockAppSettingsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => null } },
            queryParams: of({}),
          },
        },
        { provide: WelcomeService, useValue: mockWelcomeService },
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CommonService, useValue: mockCommonService },
        { provide: LoginService, useValue: mockLoginService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: DaycareService, useValue: mockDaycareService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(HeaderComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create the HeaderComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize user details from authData', async () => {
      await component.ngOnInit();

      expect(component.centreId).toBe(10);
      expect(component.loginUserRoleId).toBe(1);
      expect(component.loginUserId).toBe(100);
      expect(component.loginUserEmail).toBe('user@bloomvie.com');
      expect(component.loginUserName).toBe('John Doe');
      expect(mockDaycareService.checkExternalBilling).toHaveBeenCalledWith(10);
      expect(mockCommonService.getBloomvieSettings).toHaveBeenCalledWith(1);
    });
  });

  describe('Routing helper - getRouterLink', () => {
    it('should return correct route depending on userRoleId', () => {
      component.loginUserRoleId = 1;
      expect(component.getRouterLink()).toBe('/dashboard');

      component.loginUserRoleId = 3;
      expect(component.getRouterLink()).toBe('/daycare-dashboard');

      component.loginUserRoleId = 4;
      expect(component.getRouterLink()).toBe('/teachers-dashboard');

      component.loginUserRoleId = 5;
      expect(component.getRouterLink()).toBe('/parent-dashboard');

      component.loginUserRoleId = 6;
      expect(component.getRouterLink()).toBe('/counsellor-dashboard');

      component.loginUserRoleId = 999;
      expect(component.getRouterLink()).toBe('/');
    });
  });

  describe('Notification filtering & formatting', () => {
    it('should filter notifications based on userRoleId', () => {
      component.notification = [
        { notificationID: 14 },
        { notificationID: 5 },
        { notificationID: 4 },
        { notificationID: 1 },
      ];

      component.loginUserRoleId = 1;
      expect(component.filteredNotifications()).toEqual([{ notificationID: 14 }]);

      component.loginUserRoleId = 4;
      expect(component.filteredNotifications()).toEqual([{ notificationID: 5 }]);

      component.loginUserRoleId = 5;
      expect(component.filteredNotifications()).toEqual([{ notificationID: 4 }]);

      component.loginUserRoleId = 3;
      expect(component.filteredNotifications()).toEqual([{ notificationID: 1 }]);
    });

    it('should format date and time strings accurately', () => {
      expect(component.formatTime('14:30:00')).toBe('14:30');
      const testDate = new Date('2026-05-15');
      expect(component.formatDate(testDate)).toBe(testDate.toLocaleDateString());
    });

    it('should compute getTimeAgo correctly', () => {
      const now = new Date();
      const tenSecAgo = new Date(now.getTime() - 10000).toISOString();
      expect(component.getTimeAgo(tenSecAgo)).toContain('secs ago');

      const fiveMinsAgo = new Date(now.getTime() - 5 * 60000).toISOString();
      expect(component.getTimeAgo(fiveMinsAgo)).toContain('mins ago');

      const threeHoursAgo = new Date(now.getTime() - 3 * 3600000).toISOString();
      expect(component.getTimeAgo(threeHoursAgo)).toContain('hours ago');

      const twoDaysAgo = new Date(now.getTime() - 2 * 86400000).toISOString();
      expect(component.getTimeAgo(twoDaysAgo)).toContain('days ago');
    });
  });

  describe('Notification handling', () => {
    it('should clear all notifications and mark as read', () => {
      component.notification = [{ id: 1, notificationID: 14 }];
      spyOn(component, 'navigateToAppointments');

      component.clearNotifications(new Event('click'));

      expect(component.navigateToAppointments).toHaveBeenCalledWith(1, { id: 1, notificationID: 14 });
      expect(component.notification).toEqual([]);
      expect(component.notificationCount).toBe(0);
    });

    it('should call AppintmentIsRead and navigate appropriately', fakeAsync(() => {
      component.loginUserId = 100;
      component.loginUserRoleId = 1;

      component.navigateToAppointments(1, { notificationID: 14 });
      tick(600);

      expect(mockAppSettingsService.AppintmentIsRead).toHaveBeenCalled();
    }));
  });

  describe('Parent profile switching', () => {
    it('should prompt Swal warning if student onboarding is pending', async () => {
      component.allStudents = [{ id: 22, firstName: 'Sam', lastName: 'Smith' }];
      mockHeaderService.checkStudentOnboardingCompleteOrNotByStudentID.and.returnValue(
        of({
          message: 'Success',
          result: { orderNumber: 'ord123', studentID: 22, token: 'tok123' },
        })
      );
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      await component.switchStudentProfile(22);

      expect(Swal.fire).toHaveBeenCalled();
    });

    it('should switch profile and update cookies if onboarding is completed', async () => {
      component.data = {};
      component.allStudents = [
        { id: 33, firstName: 'Alice', lastName: 'Brown', profilePhoto: 'alice.png', centreAdminID: 5 },
      ];
      mockHeaderService.checkStudentOnboardingCompleteOrNotByStudentID.and.returnValue(
        of({ message: 'Completed' })
      );

      await component.switchStudentProfile(33);

      expect(component.username).toBe('Alice Brown');
      expect(mockCookieService.set).toHaveBeenCalledWith('StudentID', '33');
      expect(mockCookieService.set).toHaveBeenCalledWith('CentreAdminID', '5');
      expect(mockToastr.success).toHaveBeenCalledWith('Profile Switched Successfully.');
    });
  });

  describe('Stripe Dashboard navigation', () => {
    it('should open link in new window if expressLoginLink exists', () => {
      component.expressLoginLink = 'https://dashboard.stripe.com/express';
      spyOn(window, 'open');

      component.navigateToStripeDashboard();

      expect(window.open).toHaveBeenCalledWith('https://dashboard.stripe.com/express', '_blank');
    });

    it('should log error if expressLoginLink is missing', () => {
      component.expressLoginLink = '';
      spyOn(console, 'error');

      component.navigateToStripeDashboard();

      expect(console.error).toHaveBeenCalledWith('Express login link is not available.');
    });
  });

  describe('loadHeader and setBreadCrumb', () => {
    it('should emit headerLoad when isDataFullyLoad is true', () => {
      spyOn(component.headerLoad, 'emit');
      component.isDataFullyLoad = true;
      component.loadHeader();
      expect(component.headerLoad.emit).toHaveBeenCalledWith(true);
    });

    it('should set Component cookie on setBreadCrumb', () => {
      spyOn(component, 'getProfileDetailsHeaderComponent');
      component.setBreadCrumb();
      expect(mockCookieService.set).toHaveBeenCalledWith('Component', 'Profile');
      expect(component.getProfileDetailsHeaderComponent).toHaveBeenCalled();
    });
  });
});
