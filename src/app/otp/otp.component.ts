import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OtpService } from './otp.service';
import { NgOtpInputComponent, NgOtpInputModule } from 'ng-otp-input';
import { ForgotPasswordService } from '../forgot-password/forgot-password.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgClass, NgIf } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { PasswordChangeComponent } from "../password-change/password-change.component";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, NgOtpInputModule, ToastrModule, NgIf, NgClass, PasswordChangeComponent],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
})

export class OTPComponent implements OnInit {
  otpForm: any;
  @Input() email: any;
  storeEmail: any
  cookieValue: any;
  gmail: any;
  otpinput: any;
  otpOptions: any;
  @ViewChild('otpinput', { static: false }) otpInput: NgOtpInputComponent | undefined;

  showPasswordChange: boolean = false;
  IsAbleToShowButton: boolean = true;
  countdownInterval: any;
  resendTimer = 30;
  intervalId: any;


  constructor(
    private fb: FormBuilder,
    private otpService: OtpService,
    private router: Router,
    private forgotPasswordService: ForgotPasswordService,
    private toastr: ToastrService,
    public cookie: CookieService, private spinner: NgxSpinnerService
  ) {
    this.otpForm = this.fb.group({
      // otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],

    });
  }
  ngOnInit(): void {
    this.gmail = this.cookie.get("email")
    // this.email = this.maskEmail(this.gmail);
    this.email = this.getMaskedEmail(this.gmail);
  }

  maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername = username.length >= 5 ? username.slice(-4) : username;
    return `${maskedUsername}@${domain}`;
  }


  getMaskedEmail(email: string): string {
    {
      if (email !== undefined) {
        const emailParts = email.split('@');
        const username = emailParts[0];
        const domain = emailParts[1];
        // Mask the part of the username after the first 3 characters
        const maskedUsername = username.length > 3
          ? username.slice(0, 3) + '***'
          : username + '***';

        return maskedUsername + '@' + domain;
      }
      else {
        return "";
      }
    }
  }








  verifyOTP() {
    if (this.otpForm.valid) {

      const otp = this.otpForm.get('otp')?.value;
      this.otpService.verifyOTP(otp, this.gmail).subscribe(response => {
        if (response.message == "Success") {
          this.toastr.success("OTP Verified")
          this.showPasswordChange = true;
          // this.router.navigate(["/password-change"]);
          // this.cookie.delete('email')
        } else if (response.message == "OTP has expired!") {
          this.toastr.error("OTP has been expired", "Error")
          this.resetOtpInput();
        }
        else {
          this.toastr.error("Invalid OTP")
          this.resetOtpInput();
        }
      });
    } else {
      this.toastr.error("Invalid OTP")
      this.resetOtpInput();
      this.otpForm.markAllAsTouched();
    }

  }

  resetOtpInput(): void {
    this.otpForm.get('otp')?.reset();

    // Check if otpInput is defined before using it
    if (this.otpInput) {
      this.otpInput.setValue('');
    }
  }

  resendOtp() {
    this.IsAbleToShowButton = false;
    this.resendTimer = 30; // reset timer

    // Start countdown
    this.countdownInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(this.countdownInterval);
        this.IsAbleToShowButton = true;
      }
    }, 1000);

    this.forgotPasswordService.forgotPassword(this.gmail).subscribe({
      next: () => {
        this.toastr.success("OTP sent successfully");
        this.otpForm.reset();
      },
      error: () => {
        this.toastr.error("Error sending OTP");
      }
    });
  }




}