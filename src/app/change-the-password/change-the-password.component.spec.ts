import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeThePasswordComponent } from './change-the-password.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChangeThePasswordService } from './change-the-password.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../login/login.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('ChangeThePasswordComponent', () => {
  let component: ChangeThePasswordComponent;
  let fixture: ComponentFixture<ChangeThePasswordComponent>;
  let mockChangeService: jasmine.SpyObj<ChangeThePasswordService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockLoginService: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    mockChangeService = jasmine.createSpyObj('ChangeThePasswordService', ['managePasswordChange']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);
    mockLoginService = jasmine.createSpyObj('LoginService', ['logOut']);

    await TestBed.configureTestingModule({
      imports: [ChangeThePasswordComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ChangeThePasswordService, useValue: mockChangeService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
        { provide: ToastrService, useValue: mockToastr },
        { provide: LoginService, useValue: mockLoginService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ChangeThePasswordComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ChangeThePasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization and validation', () => {
    it('should initialize changePasswordForm with required controls', () => {
      expect(component.changePasswordForm.contains('userID')).toBeTrue();
      expect(component.changePasswordForm.contains('currentPassword')).toBeTrue();
      expect(component.changePasswordForm.contains('newPassword')).toBeTrue();
      expect(component.changePasswordForm.contains('verifyPassword')).toBeTrue();
    });

    it('should flag mismatch when newPassword and verifyPassword differ', () => {
      component.changePasswordForm.patchValue({
        currentPassword: 'oldPass123',
        newPassword: 'passA',
        verifyPassword: 'passB',
      });
      component.confirmPasswordValidator(component.changePasswordForm);
      expect(component.changePasswordForm.get('verifyPassword')?.errors?.['mismatch']).toBeTrue();

      component.changePasswordForm.patchValue({
        verifyPassword: 'passA',
      });
      component.confirmPasswordValidator(component.changePasswordForm);
      expect(component.changePasswordForm.get('verifyPassword')?.errors).toBeNull();
    });
  });

  describe('ngOnInit', () => {
    it('should parse UserId from cookie if present', () => {
      mockCookie.get.and.returnValue('456');
      component.ngOnInit();
      expect(component.userId).toBe(456);
    });

    it('should retain default userId 0 if cookie absent', () => {
      mockCookie.get.and.returnValue('');
      component.ngOnInit();
      expect(component.userId).toBe(0);
    });
  });

  describe('Password visibility toggling', () => {
    it('should toggle field 1', () => {
      expect(component.passwordFields.passwordField1).toBe('password');
      component.showPasswordIcon(1);
      expect(component.passwordFields.passwordField1).toBe('text');
      component.showPasswordIcon(1);
      expect(component.passwordFields.passwordField1).toBe('password');
    });

    it('should toggle field 2', () => {
      expect(component.passwordFields.passwordField2).toBe('password');
      component.showPasswordIcon(2);
      expect(component.passwordFields.passwordField2).toBe('text');
      component.showPasswordIcon(2);
      expect(component.passwordFields.passwordField2).toBe('password');
    });

    it('should toggle field 3', () => {
      expect(component.passwordFields.passwordField3).toBe('password');
      component.showPasswordIcon(3);
      expect(component.passwordFields.passwordField3).toBe('text');
      component.showPasswordIcon(3);
      expect(component.passwordFields.passwordField3).toBe('password');
    });
  });

  describe('onSubmit', () => {
    it('should submit successfully and call logOut when response is Success', () => {
      component.userId = 456;
      component.changePasswordForm.patchValue({
        currentPassword: 'oldPassword1',
        newPassword: 'newPassword1',
        verifyPassword: 'newPassword1',
      });
      mockChangeService.managePasswordChange.and.returnValue(of({ message: 'Success' }));

      component.onSubmit();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockChangeService.managePasswordChange).toHaveBeenCalledWith({
        userID: 456,
        currentPassword: 'oldPassword1',
        newPassword: 'newPassword1',
        verifyPassword: 'newPassword1',
      });
      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Success');
      expect(mockLoginService.logOut).toHaveBeenCalled();
    });

    it('should show warning toastr when API returns non-Success message', () => {
      component.userId = 456;
      component.changePasswordForm.patchValue({
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword1',
        verifyPassword: 'newPassword1',
      });
      mockChangeService.managePasswordChange.and.returnValue(of({ message: 'Incorrect old password' }));

      component.onSubmit();

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(mockToastr.warning).toHaveBeenCalledWith('Incorrect old password');
      expect(mockLoginService.logOut).not.toHaveBeenCalled();
    });

    it('should stop and mark controls as touched when form is invalid', () => {
      component.changePasswordForm.patchValue({
        currentPassword: '',
        newPassword: '',
        verifyPassword: '',
      });

      component.onSubmit();

      expect(mockChangeService.managePasswordChange).not.toHaveBeenCalled();
      expect(component.changePasswordForm.touched).toBeTrue();
    });
  });
});
