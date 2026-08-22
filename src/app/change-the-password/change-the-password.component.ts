import { Component } from '@angular/core';
import { ChangeThePasswordService } from './change-the-password.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import {
  FormsModule,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-change-the-password',
  standalone: true,
  imports: [
    NgxSpinnerModule,
    FormsModule,
    CommonModule,
    NgIf,
    ReactiveFormsModule,
  ],
  templateUrl: './change-the-password.component.html',
  styleUrl: './change-the-password.component.css',
})
export class ChangeThePasswordComponent {
  userId: number = 0;
  changePasswordForm: any;
  verifyNewPassword: string = '';
  // passwordField: string = 'password';
  passwordFields: any = {
    passwordField1: 'password',
    passwordField2: 'password',
    passwordField3: 'password',
  };
  constructor(
    private service: ChangeThePasswordService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private cookie: CookieService,
    private toastr: ToastrService,
    private loginService: LoginService
  ) {
    this.changePasswordForm = this.fb.group(
      {
        userID: [0],
        currentPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        verifyPassword: ['', Validators.required],
      },
      { validator: this.confirmPasswordValidator }
    );
  }

  ngOnInit() {
    const userId = parseInt(this.cookie.get('UserId'));
    if (userId) {
      this.userId = userId;
    }
  }

  onSubmit() {
    this.spinner.show();
    this.changePasswordForm.patchValue({
      userID: this.userId,
    });

    if (!this.changePasswordForm.valid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }
    this.service.managePasswordChange(this.changePasswordForm.value).subscribe({
      next: (data) => {
        if (data.message == 'Success') {
          this.spinner.hide();
          this.toastr.success(data.message);
          this.loginService.logOut();
        } else {
          this.spinner.hide();
          this.toastr.warning(data.message);
        }
      },
    });
  }

  confirmPasswordValidator(form: AbstractControl) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('verifyPassword')?.value;

    if (newPassword !== confirmPassword) {
      form.get('verifyPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('verifyPassword')?.setErrors(null);
    }

    return null;
  }

  showPasswordIcon(field: number) {
    switch (field) {
      case 1:
        this.passwordFields.passwordField1 =
          this.passwordFields.passwordField1 === 'password'
            ? 'text'
            : 'password';
        break;
      case 2:
        this.passwordFields.passwordField2 =
          this.passwordFields.passwordField2 === 'password'
            ? 'text'
            : 'password';
        break;
      case 3:
        this.passwordFields.passwordField3 =
          this.passwordFields.passwordField3 === 'password'
            ? 'text'
            : 'password';
        break;
    }
  }
}
