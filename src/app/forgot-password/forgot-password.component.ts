import { Component, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ForgotPasswordService } from './forgot-password.service';
import { OTPComponent } from '../otp/otp.component';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { LoginComponent } from '../login/login.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    OTPComponent,
    ToastrModule,
    CommonModule,
    LoginComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  email: any;
  storeEmail: any;
  cookieValue: any;

  @Output() backLogin = new EventEmitter();

  // showLoginForm: boolean= false;
  constructor(
    private fb: FormBuilder,
    private ForgotPasswordService: ForgotPasswordService,
    private router: Router,
    private toastr: ToastrService,
    private cookie: CookieService, private spinner: NgxSpinnerService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  backToLogin() {
    this.backLogin.emit();
  }

  forgotPassword() {
    this.spinner.show();
    if (this.forgotPasswordForm.valid) {
      this.email = this.forgotPasswordForm.value.email;
      this.ForgotPasswordService.setEmail(this.email);
      this.ForgotPasswordService.forgotPassword(this.email).subscribe({
        next: (response: any) => {
          if (response.message == 'Success') {
            this.toastr.success('OTP sent successfully');
            this.ForgotPasswordService.setEmail(this.email);
            this.router.navigate(['/otp']);
            this.cookie.set('email', this.email, 1);
            this.spinner.hide();
          }
          else {
            this.spinner.hide();
            this.forgotPasswordForm.reset({ email: '' });
            // this.toastr.error(response.message, 'Error');
            this.toastr.error(response.message);
          }
        },
        error: () => {
          // this.toastr.error('Please enter a valid email address.', 'Error');
          this.spinner.hide();
          this.toastr.error('Please enter a valid email address.');
        },
      });
    } else {
      this.forgotPasswordForm.reset({ email: '' });
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}
// showLoginPage(){
//   this.showLoginForm = false;
// }
