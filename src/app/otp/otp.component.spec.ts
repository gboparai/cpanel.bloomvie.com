import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OTPComponent } from './otp.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OtpService } from './otp.service';
import { Router } from '@angular/router';
import { ForgotPasswordService } from '../forgot-password/forgot-password.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('OTPComponent', () => {
  let component: OTPComponent;
  let fixture: ComponentFixture<OTPComponent>;
  let mockOtpService: jasmine.SpyObj<OtpService>;
  let mockForgotPasswordService: jasmine.SpyObj<ForgotPasswordService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockOtpService = jasmine.createSpyObj('OtpService', ['verifyOTP']);
    mockForgotPasswordService = jasmine.createSpyObj('ForgotPasswordService', ['forgotPassword']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'delete']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    await TestBed.configureTestingModule({
      imports: [OTPComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: OtpService, useValue: mockOtpService },
        { provide: ForgotPasswordService, useValue: mockForgotPasswordService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(OTPComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OTPComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form validation', () => {
    it('should validate 6-digit length for otp', () => {
      const otpCtrl = component.otpForm.get('otp');
      otpCtrl?.setValue('');
      expect(otpCtrl?.valid).toBeFalse();

      otpCtrl?.setValue('12345');
      expect(otpCtrl?.valid).toBeFalse();

      otpCtrl?.setValue('1234567');
      expect(otpCtrl?.valid).toBeFalse();

      otpCtrl?.setValue('123456');
      expect(otpCtrl?.valid).toBeTrue();
    });
  });

  describe('ngOnInit & Email Masking', () => {
    it('should fetch email from cookie and set masked email on ngOnInit', () => {
      mockCookieService.get.and.returnValue('john.doe@example.com');
      component.ngOnInit();
      expect(component.gmail).toBe('john.doe@example.com');
      expect(component.email).toBe('joh***@example.com');
    });

    it('should mask email correctly with getMaskedEmail', () => {
      expect(component.getMaskedEmail('admin@domain.com')).toBe('adm***@domain.com');
      expect(component.getMaskedEmail('me@domain.com')).toBe('me***@domain.com');
      expect(component.getMaskedEmail(undefined as any)).toBe('');
    });

    it('should mask email with maskEmail helper', () => {
      expect(component.maskEmail('abcdef@domain.com')).toBe('cdef@domain.com');
      expect(component.maskEmail('abc@domain.com')).toBe('abc@domain.com');
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP successfully and show password change', () => {
      component.gmail = 'user@test.com';
      component.otpForm.patchValue({ otp: '123456' });
      mockOtpService.verifyOTP.and.returnValue(of({ message: 'Success' }));

      component.verifyOTP();

      expect(mockOtpService.verifyOTP).toHaveBeenCalledWith('123456', 'user@test.com');
      expect(mockToastr.success).toHaveBeenCalledWith('OTP Verified');
      expect(component.showPasswordChange).toBeTrue();
    });

    it('should handle expired OTP', () => {
      component.gmail = 'user@test.com';
      component.otpForm.patchValue({ otp: '123456' });
      mockOtpService.verifyOTP.and.returnValue(of({ message: 'OTP has expired!' }));
      spyOn(component, 'resetOtpInput');

      component.verifyOTP();

      expect(mockToastr.error).toHaveBeenCalledWith('OTP has been expired', 'Error');
      expect(component.resetOtpInput).toHaveBeenCalled();
    });

    it('should handle invalid OTP response', () => {
      component.gmail = 'user@test.com';
      component.otpForm.patchValue({ otp: '123456' });
      mockOtpService.verifyOTP.and.returnValue(of({ message: 'Invalid' }));
      spyOn(component, 'resetOtpInput');

      component.verifyOTP();

      expect(mockToastr.error).toHaveBeenCalledWith('Invalid OTP');
      expect(component.resetOtpInput).toHaveBeenCalled();
    });

    it('should show error and mark touched when form is invalid', () => {
      component.otpForm.patchValue({ otp: '123' });
      spyOn(component, 'resetOtpInput');

      component.verifyOTP();

      expect(mockToastr.error).toHaveBeenCalledWith('Invalid OTP');
      expect(component.resetOtpInput).toHaveBeenCalled();
      expect(component.otpForm.touched).toBeTrue();
    });
  });

  describe('resetOtpInput', () => {
    it('should reset otp form control and otpInput component if present', () => {
      component.otpForm.patchValue({ otp: '999999' });
      const mockOtpComp = jasmine.createSpyObj('NgOtpInputComponent', ['setValue']);
      component.otpInput = mockOtpComp;

      component.resetOtpInput();

      expect(component.otpForm.get('otp')?.value).toBeNull();
      expect(mockOtpComp.setValue).toHaveBeenCalledWith('');
    });
  });

  describe('resendOtp', () => {
    it('should start countdown timer and trigger forgotPassword', fakeAsync(() => {
      component.gmail = 'user@test.com';
      mockForgotPasswordService.forgotPassword.and.returnValue(of({}));

      component.resendOtp();

      expect(component.IsAbleToShowButton).toBeFalse();
      expect(component.resendTimer).toBe(30);
      expect(mockToastr.success).toHaveBeenCalledWith('OTP sent successfully');

      tick(15000);
      expect(component.resendTimer).toBe(15);
      expect(component.IsAbleToShowButton).toBeFalse();

      tick(16000);
      expect(component.IsAbleToShowButton).toBeTrue();
    }));

    it('should handle error when resending OTP', () => {
      component.gmail = 'user@test.com';
      mockForgotPasswordService.forgotPassword.and.returnValue(throwError(() => new Error('Failed')));

      component.resendOtp();

      expect(mockToastr.error).toHaveBeenCalledWith('Error sending OTP');
      clearInterval(component.countdownInterval);
    });
  });
});
