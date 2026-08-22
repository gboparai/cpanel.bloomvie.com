import { CommonModule, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PasswordChangeService } from '../password-change/password-change.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.css'
})
export class SetPasswordComponent implements OnInit {
  passwordForm: any;
  token: any;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private passwordChangeService: PasswordChangeService,
    private spinner:NgxSpinnerService
  ) {
    this.passwordForm = this.fb.group({
      newpassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      token: ['']
    },
      { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.passwordChangeService.tokenCheck(this.token).subscribe({
          next: (response: any) => {
            if (response.message === 'Success') {
              this.passwordForm.patchValue({ token: this.token });
            }
            else{
              // ojanvoj
            }


          },
        });
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newpassword')?.value === form.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }



  onSubmit() {
    if (this.passwordForm.valid) {
      this.spinner.show()
      this.passwordChangeService.ResetPassword(this.passwordForm.value).subscribe({
        next: (response: any) => {
          if (response.message == "Success") {
            this.toastr.success(response.activity);
            this.router.navigate(['/welcome'])
            this.spinner.hide()
          }
          else{
            this.toastr.error(response.message);
          }
        },
      });
    }
  }

  hide = true;
  show = true;



  toggleVisibility1(): void {
    this.hide = !this.hide;
  }
  toggleVisibility2(): void {
    this.show = !this.show;
  }
}
