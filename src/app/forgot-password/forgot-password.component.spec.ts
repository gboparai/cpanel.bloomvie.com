import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordService } from './forgot-password.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let mockForgotPasswordService: jasmine.SpyObj<ForgotPasswordService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockForgotPasswordService = jasmine.createSpyObj('ForgotPasswordService', ['setEmail', 'forgotPassword']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['set']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ForgotPasswordService, useValue: mockForgotPasswordService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ForgotPasswordComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should validate email requirement and format', () => {
      const emailCtrl = component.forgotPasswordForm.get('email');
      emailCtrl?.setValue('');
      expect(emailCtrl?.valid).toBeFalse();

      emailCtrl?.setValue('invalid');
      expect(emailCtrl?.valid).toBeFalse();

      emailCtrl?.setValue('valid.user@bloomvie.com');
      expect(emailCtrl?.valid).toBeTrue();
    });
  });

  describe('backToLogin', () => {
    it('should emit backLogin event', () => {
      spyOn(component.backLogin, 'emit');
      component.backToLogin();
      expect(component.backLogin.emit).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should send OTP and navigate to /otp on success', () => {
      component.forgotPasswordForm.patchValue({ email: 'user@test.com' });
      mockForgotPasswordService.forgotPassword.and.returnValue(of({ message: 'Success' }));

      component.forgotPassword();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockForgotPasswordService.setEmail).toHaveBeenCalledWith('user@test.com');
      expect(mockForgotPasswordService.forgotPassword).toHaveBeenCalledWith('user@test.com');
      expect(mockToastr.success).toHaveBeenCalledWith('OTP sent successfully');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/otp']);
      expect(mockCookieService.set).toHaveBeenCalledWith('email', 'user@test.com', jasmine.anything());
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should show error toastr and reset form on API response other than Success', () => {
      component.forgotPasswordForm.patchValue({ email: 'user@test.com' });
      mockForgotPasswordService.forgotPassword.and.returnValue(of({ message: 'User not found' }));

      component.forgotPassword();

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalledWith('User not found');
      expect(component.forgotPasswordForm.value.email).toBe('');
    });

    it('should handle HTTP error when requesting OTP', () => {
      component.forgotPasswordForm.patchValue({ email: 'user@test.com' });
      mockForgotPasswordService.forgotPassword.and.returnValue(throwError(() => new Error('Network error')));

      component.forgotPassword();

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalledWith('Please enter a valid email address.');
    });

    it('should reset form and mark touched if form is invalid', () => {
      component.forgotPasswordForm.patchValue({ email: 'invalid-email' });

      component.forgotPassword();

      expect(mockForgotPasswordService.forgotPassword).not.toHaveBeenCalled();
      expect(component.forgotPasswordForm.touched).toBeTrue();
      expect(component.forgotPasswordForm.value.email).toBe('');
    });
  });
});
