import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordChangeComponent } from './password-change.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PasswordChangeService } from './password-change.service';
import { ForgotPasswordService } from '../forgot-password/forgot-password.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';

describe('PasswordChangeComponent', () => {
  let component: PasswordChangeComponent;
  let fixture: ComponentFixture<PasswordChangeComponent>;
  let mockPasswordChangeService: jasmine.SpyObj<PasswordChangeService>;
  let mockForgotPasswordService: any;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let breadcrumbSubject: BehaviorSubject<string>;

  beforeEach(async () => {
    breadcrumbSubject = new BehaviorSubject<string>('test@bloomvie.com');
    mockPasswordChangeService = jasmine.createSpyObj('PasswordChangeService', ['ResetPassword']);
    mockForgotPasswordService = {
      breadcrumb$: breadcrumbSubject.asObservable(),
    };
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PasswordChangeComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: HttpClient, useValue: {} },
        { provide: PasswordChangeService, useValue: mockPasswordChangeService },
        { provide: ForgotPasswordService, useValue: mockForgotPasswordService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => null } },
            queryParams: of({}),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PasswordChangeComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PasswordChangeComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form setup and validation', () => {
    it('should initialize form controls and defaults', () => {
      expect(component.passwordForm.contains('email')).toBeTrue();
      expect(component.passwordForm.contains('newPassword')).toBeTrue();
      expect(component.passwordForm.contains('confirmPassword')).toBeTrue();
      expect(component.passwordForm.contains('token')).toBeTrue();
      expect(component.showNewPassword).toBeFalse();
      expect(component.showConfirmPassword).toBeFalse();
    });

    it('should validate password matching', () => {
      component.passwordForm.patchValue({
        newPassword: 'Password123!',
        confirmPassword: 'MismatchPassword',
      });
      expect(component.passwordForm.errors?.['mismatch']).toBeTrue();

      component.passwordForm.patchValue({
        confirmPassword: 'Password123!',
      });
      expect(component.passwordForm.errors).toBeNull();
    });
  });

  describe('ngOnInit', () => {
    it('should patch email from breadcrumb$ observable', () => {
      component.ngOnInit();
      expect(component.passwordForm.get('email')?.value).toBe('test@bloomvie.com');
    });
  });

  describe('Password visibility toggling', () => {
    it('should toggle showNewPassword', () => {
      expect(component.showNewPassword).toBeFalse();
      component.toggleNewPassword();
      expect(component.showNewPassword).toBeTrue();
      component.toggleNewPassword();
      expect(component.showNewPassword).toBeFalse();
    });

    it('should toggle showConfirmPassword', () => {
      expect(component.showConfirmPassword).toBeFalse();
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword).toBeTrue();
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword).toBeFalse();
    });
  });

  describe('onSubmit', () => {
    it('should reset password and navigate to login on Success', () => {
      component.passwordForm.patchValue({
        email: 'user@test.com',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      });
      mockPasswordChangeService.ResetPassword.and.returnValue(of({ message: 'Success' }));

      component.onSubmit();

      expect(mockPasswordChangeService.ResetPassword).toHaveBeenCalledWith(component.passwordForm.value);
      expect(mockToastr.success).toHaveBeenCalledWith('Passowrd changed successfully');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should not navigate if response is not Success', () => {
      component.passwordForm.patchValue({
        email: 'user@test.com',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      });
      mockPasswordChangeService.ResetPassword.and.returnValue(of({ message: 'Failed' }));

      component.onSubmit();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle service error gracefully', () => {
      component.passwordForm.patchValue({
        email: 'user@test.com',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      });
      mockPasswordChangeService.ResetPassword.and.returnValue(throwError(() => new Error('Error')));

      expect(() => component.onSubmit()).not.toThrow();
    });

    it('should do nothing if form is invalid', () => {
      component.passwordForm.patchValue({
        newPassword: 'short',
        confirmPassword: 'different',
      });

      component.onSubmit();

      expect(mockPasswordChangeService.ResetPassword).not.toHaveBeenCalled();
    });
  });
});
