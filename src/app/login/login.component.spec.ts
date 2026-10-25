import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProfileService } from '../common-component/profile/profile.service';
import { CommonService } from '../common-component/common.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockOnboardingService: jasmine.SpyObj<OnboardingService>;
  let mockTocService: jasmine.SpyObj<TocRegistrationService>;

  beforeEach(async () => {
    mockLoginService = jasmine.createSpyObj('LoginService', [
      'Login',
      'IsUserExit',
      'CheckLoginEmail',
      'checkTOCUserAcceptedSlotRequest',
      'loadUserFromStorage',
      'getStudentPaymentDetailByParentID',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check', 'deleteAll']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getSubscriptionPlanByUserId', 'getTOCUserCentreListById']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'encrypt', 'formatPostalCode']);
    mockOnboardingService = jasmine.createSpyObj('OnboardingService', ['getDetails']);
    mockTocService = jasmine.createSpyObj('TocRegistrationService', ['GetAllDayCareWithInRadius', 'ManageTOCMoreCentre']);

    // Mock jQuery modal
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val').and.returnValue(''),
      html: jasmine.createSpy('html'),
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: LoginService, useValue: mockLoginService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookieService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: jasmine.createSpy('get').and.returnValue(null),
              },
            },
          },
        },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: TocRegistrationService, useValue: mockTocService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LoginComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize loginForm with required controls', () => {
      expect(component.loginForm.contains('email')).toBeTrue();
      expect(component.loginForm.contains('password')).toBeTrue();
      expect(component.loginForm.contains('rememberMe')).toBeTrue();
      expect(component.loginForm.contains('centreId')).toBeTrue();
    });

    it('should validate email format and presence', () => {
      const email = component.loginForm.get('email');
      email?.setValue('');
      expect(email?.valid).toBeFalse();
      email?.setValue('invalid-email');
      expect(email?.valid).toBeFalse();
      email?.setValue('user@example.com');
      expect(email?.valid).toBeTrue();
    });

    it('should validate password presence', () => {
      const pwd = component.loginForm.get('password');
      pwd?.setValue('');
      expect(pwd?.valid).toBeFalse();
      pwd?.setValue('Secret123');
      expect(pwd?.valid).toBeTrue();
    });

    it('should expose f getter for controls', () => {
      expect(component.f['email']).toBeDefined();
    });
  });

  describe('Cookie Helpers', () => {
    it('should set cookie with path', () => {
      component.setCookie('testName', 'testValue');
      expect(mockCookieService.set).toHaveBeenCalled();
    });

    it('should delete cookie with path', () => {
      component.deleteCookie('testName');
      expect(mockCookieService.delete).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should populate email and password if rememberMe cookie is true', () => {
      mockCookieService.get.and.callFake((name: string) => {
        if (name === 'rememberMe') return 'true';
        if (name === 'Email') return 'user@test.com';
        if (name === 'Password') return 'pass123';
        return '';
      });

      component.ngOnInit();

      expect(component.rememberMe).toBeTrue();
      expect(component.loginForm.value.email).toBe('user@test.com');
      expect(component.loginForm.value.password).toBe('pass123');
    });

    it('should not populate credentials if rememberMe is not true', () => {
      mockCookieService.get.and.returnValue('');
      component.ngOnInit();
      expect(component.rememberMe).toBeFalse();
    });
  });

  describe('Password toggle & Forgot Password', () => {
    it('should toggle password field type between password and text', () => {
      component.passwordField = 'password';
      component.showPasswordIcon();
      expect(component.passwordField).toBe('text');
      component.showPasswordIcon();
      expect(component.passwordField).toBe('password');
    });

    it('should toggle forgot password visibility', () => {
      component.forgotPassword();
      expect(component.showForgotPassword).toBeTrue();
      component.backtoLoginScreen();
      expect(component.showForgotPassword).toBeFalse();
    });
  });

  describe('Login Flow', () => {
    it('should mark all touched and not call service if form is invalid', async () => {
      component.loginForm.patchValue({ email: '', password: '' });
      await component.login();
      expect(mockLoginService.Login).not.toHaveBeenCalled();
    });

    it('should navigate to dashboard on successful login for admin user (role 1)', async () => {
      component.loginForm.patchValue({ email: 'admin@bloomvie.com', password: 'password123' });
      const authResponse = {
        message: 'Success',
        refreshToken: 'refresh-token',
        result: {
          id: 101,
          centreID: 10,
          userRoleID: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'admin@bloomvie.com',
          isOnBoarded: true,
        },
      };
      mockLoginService.Login.and.returnValue(of(authResponse));
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserInfo') return JSON.stringify(authResponse);
        return '';
      });

      await component.login();

      expect(mockToastr.success).toHaveBeenCalledWith('Login Successful');
      expect(mockCookieService.set).toHaveBeenCalledWith('UserId', 101 as any, jasmine.any(Object));
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to onboarding if daycare admin (role 3) is not onboarded', async () => {
      component.loginForm.patchValue({ email: 'daycare@bloomvie.com', password: 'password123' });
      const authResponse = {
        message: 'Success',
        refreshToken: 'refresh-token',
        result: {
          id: 102,
          centreID: 15,
          userRoleID: 3,
          firstName: 'Daycare',
          lastName: 'Admin',
          email: 'daycare@bloomvie.com',
          isOnBoarded: false,
        },
      };
      mockLoginService.Login.and.returnValue(of(authResponse));

      await component.login();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['onboarding']);
    });

    it('should navigate to parent-onboarding if parent (role 5) is not onboarded', async () => {
      component.loginForm.patchValue({ email: 'parent@bloomvie.com', password: 'password123' });
      const authResponse = {
        message: 'Success',
        refreshToken: 'refresh-token',
        result: {
          id: 105,
          centreID: 20,
          userRoleID: 5,
          firstName: 'Parent',
          lastName: 'User',
          email: 'parent@bloomvie.com',
          isOnBoarded: false,
          studentID: [{ id: 50, centreID: 20 }],
        },
      };
      mockLoginService.Login.and.returnValue(of(authResponse));

      await component.login();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['parent-onboarding']);
    });

    it('should handle Plan-Expired response by showing Swal alert', async () => {
      component.loginForm.patchValue({ email: 'user@test.com', password: 'password' });
      const authResponse = {
        message: 'Plan-Expired',
        result: { latestPlanId: 5, userId: 12 },
      };
      mockLoginService.Login.and.returnValue(of(authResponse));
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as any));

      await component.login();

      expect(Swal.fire).toHaveBeenCalled();
    });

    it('should handle subscription-not-found response by showing Swal alert', async () => {
      component.loginForm.patchValue({ email: 'user@test.com', password: 'password' });
      const authResponse = {
        message: 'subscription-not-found',
      };
      mockLoginService.Login.and.returnValue(of(authResponse));
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      await component.login();

      expect(Swal.fire).toHaveBeenCalled();
    });

    it('should handle Plan-Suspended response with warning dialog', async () => {
      component.loginForm.patchValue({ email: 'user@test.com', password: 'password' });
      const authResponse = {
        message: 'Plan-Suspended',
      };
      mockLoginService.Login.and.returnValue(of(authResponse));
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));

      await component.login();

      expect(Swal.fire).toHaveBeenCalled();
    });

    it('should display error toastr on login failure or exception', async () => {
      component.loginForm.patchValue({ email: 'user@test.com', password: 'password' });
      mockLoginService.Login.and.returnValue(throwError(() => new Error('Server error')));

      await component.login();

      expect(mockToastr.error).toHaveBeenCalledWith('An error occurred during login');
    });
  });

  describe('IsUserExit', () => {
    it('should stop if loginForm is invalid', async () => {
      component.loginForm.patchValue({ email: '', password: '' });
      await component.IsUserExit();
      expect(mockLoginService.IsUserExit).not.toHaveBeenCalled();
    });

    it('should handle role 8 TOC user correctly', async () => {
      component.loginForm.patchValue({ email: 'teacher@toc.com', password: 'secret' });
      component.selectedCentreId = null;
      mockLoginService.IsUserExit.and.returnValue(of({
        message: 'Success',
        result: {
          userRoleID: 8,
          isTOCprofilecompleted: true,
          id: 777,
          centreList: [{ id: 1, centreName: 'Centre 1' }],
          pinCode: 'V1V 1V1',
        },
      }));

      await component.IsUserExit();

      expect(component.isTocUser).toBeTrue();
      expect(component.UserId).toBe(777);
      expect(component.TOCUserCentreList.length).toBe(2);
    });
  });

  describe('Additional Methods', () => {
    it('should check TOC User Accepted Slot Request', () => {
      component.UserId = 10;
      component.selectedCentreId = 5;
      mockLoginService.checkTOCUserAcceptedSlotRequest.and.returnValue(of({ message: 'OK' }));

      component.checkTOCUserAcceptedSlotRequest();

      expect(mockLoginService.checkTOCUserAcceptedSlotRequest).toHaveBeenCalledWith(10, 5);
      expect(component.isSlotAccepted).toBeTrue();
    });

    it('should get TOC user centre list by id', () => {
      mockProfileService.getTOCUserCentreListById.and.returnValue(of({
        message: 'ok',
        result: { centreList: [{ id: 2, centreName: 'Centre 2' }] },
      }));

      component.getTOCUserCentreListById(10);

      expect(component.TOCUserCentreList.length).toBe(2);
    });

    it('should fetch student details for parent', () => {
      mockLoginService.getStudentPaymentDetailByParentID.and.returnValue(of({
        message: 'Success',
        result: [{ id: 1, name: 'Student 1' }],
      }));

      component.getStudent(99);

      expect(component.student).toEqual([{ id: 1, name: 'Student 1' }]);
    });

    it('should validate time rows correctly', () => {
      const rowValid = { startTime: '09:00', endTime: '10:00', isInvalid: false };
      component.validateTime(rowValid);
      expect(rowValid.isInvalid).toBeFalse();

      const rowInvalid = { startTime: '11:00', endTime: '10:00', isInvalid: false };
      component.validateTime(rowInvalid);
      expect(rowInvalid.isInvalid).toBeTrue();
    });

    it('should add and delete time rows', () => {
      component.timeRows = [];
      component.addRow();
      expect(component.timeRows.length).toBe(1);
      expect(component.timeRows[0].startTime).toBe('');
    });

    it('should select day and update available days and records', () => {
      component.availableWeeks = [
        {
          week: 'Week 1 (2026-01-01 - 2026-01-07)',
          days: [{ date: '2026-01-01', dayName: 'Monday' }],
        },
      ];
      component.currentWeekIndex = 0;
      component.onDaySelect('Monday');
      expect(component.selectedDay).toBe('Monday');
    });

    it('should toggle daycare selections with applyforParticularDC', () => {
      component.selectedDayCareIds = [];
      component.applyforParticularDC({ target: { checked: true } }, 101);
      expect(component.selectedDayCareIds).toContain(101);

      component.applyforParticularDC({ target: { checked: false } }, 101);
      expect(component.selectedDayCareIds).not.toContain(101);
    });

    it('should select all daycares with applyforAllDC', () => {
      component.NearbyDayCareList = [{ id: 1 }, { id: 2 }];
      component.applyforAllDC({ target: { checked: true } });
      expect(component.selectedDayCareIds).toEqual([1, 2]);

      component.applyforAllDC({ target: { checked: false } });
      expect(component.selectedDayCareIds).toEqual([]);
    });

    it('should format postal code using CommonService', () => {
      mockCommonService.formatPostalCode.and.returnValue('A1A 1A1');
      const event = { target: { value: 'a1a1a1' } };
      component.formatPostalCode(event);
      expect(event.target.value).toBe('A1A 1A1');
    });
  });
});
