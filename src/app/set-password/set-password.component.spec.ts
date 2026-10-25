import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetPasswordComponent } from './set-password.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { PasswordChangeService } from '../password-change/password-change.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('SetPasswordComponent', () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockPasswordChangeService: jasmine.SpyObj<PasswordChangeService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockPasswordChangeService = jasmine.createSpyObj('PasswordChangeService', ['tokenCheck', 'ResetPassword']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    await TestBed.configureTestingModule({
      imports: [SetPasswordComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: HttpClient, useValue: {} },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter },
        { provide: PasswordChangeService, useValue: mockPasswordChangeService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ token: 'test-token-123' }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SetPasswordComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form validation', () => {
    it('should initialize form controls', () => {
      expect(component.passwordForm.contains('newpassword')).toBeTrue();
      expect(component.passwordForm.contains('confirmPassword')).toBeTrue();
      expect(component.passwordForm.contains('token')).toBeTrue();
    });

    it('should validate matching passwords', () => {
      component.passwordForm.patchValue({
        newpassword: 'Password123',
        confirmPassword: 'MismatchPassword',
      });
      expect(component.passwordForm.errors?.['mismatch']).toBeTrue();

      component.passwordForm.patchValue({
        confirmPassword: 'Password123',
      });
      expect(component.passwordForm.errors).toBeNull();
    });
  });

  describe('ngOnInit', () => {
    it('should verify token from queryParams and patch form on Success', () => {
      mockPasswordChangeService.tokenCheck.and.returnValue(of({ message: 'Success' }));

      component.ngOnInit();

      expect(mockPasswordChangeService.tokenCheck).toHaveBeenCalledWith('test-token-123');
      expect(component.passwordForm.get('token')?.value).toBe('test-token-123');
    });

    it('should not patch form if tokenCheck does not return Success', () => {
      mockPasswordChangeService.tokenCheck.and.returnValue(of({ message: 'Invalid' }));

      component.ngOnInit();

      expect(mockPasswordChangeService.tokenCheck).toHaveBeenCalledWith('test-token-123');
      expect(component.passwordForm.get('token')?.value).toBe('');
    });
  });

  describe('Toggling visibility', () => {
    it('should toggle hide flag with toggleVisibility1', () => {
      expect(component.hide).toBeTrue();
      component.toggleVisibility1();
      expect(component.hide).toBeFalse();
      component.toggleVisibility1();
      expect(component.hide).toBeTrue();
    });

    it('should toggle show flag with toggleVisibility2', () => {
      expect(component.show).toBeTrue();
      component.toggleVisibility2();
      expect(component.show).toBeFalse();
      component.toggleVisibility2();
      expect(component.show).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should submit successfully and navigate to /welcome when valid', () => {
      component.passwordForm.patchValue({
        newpassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
        token: 'token-abc',
      });
      mockPasswordChangeService.ResetPassword.and.returnValue(
        of({ message: 'Success', activity: 'Password set successfully' })
      );

      component.onSubmit();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockPasswordChangeService.ResetPassword).toHaveBeenCalledWith(component.passwordForm.value);
      expect(mockToastr.success).toHaveBeenCalledWith('Password set successfully');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/welcome']);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should show error toastr if ResetPassword fails', () => {
      component.passwordForm.patchValue({
        newpassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
        token: 'token-abc',
      });
      mockPasswordChangeService.ResetPassword.and.returnValue(of({ message: 'Token Expired' }));

      component.onSubmit();

      expect(mockToastr.error).toHaveBeenCalledWith('Token Expired');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should do nothing if form is invalid', () => {
      component.passwordForm.patchValue({
        newpassword: 'short',
        confirmPassword: 'mismatch',
      });

      component.onSubmit();

      expect(mockPasswordChangeService.ResetPassword).not.toHaveBeenCalled();
    });
  });
});
