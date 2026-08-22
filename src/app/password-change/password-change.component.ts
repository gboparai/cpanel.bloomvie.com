import { Component, OnInit } from '@angular/core';
import { RouterLink ,Router, ActivatedRoute} from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PasswordChangeService } from './password-change.service';
import { ForgotPasswordService } from '../forgot-password/forgot-password.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.css']
})
export class PasswordChangeComponent implements OnInit {
  passwordForm: FormGroup;
   showNewPassword = false;
showConfirmPassword = false;


  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private passwordChangeService: PasswordChangeService,
    private forgotPassword: ForgotPasswordService,
    private toastr:ToastrService,
    private router:Router,
    private route: ActivatedRoute,
  ) {
    this.passwordForm = this.fb.group({
      email: ['', [Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      token:['']
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.forgotPassword.breadcrumb$.subscribe((email) => {
      this.passwordForm.patchValue({ email }); 
    });

  
  }

  // passwordMatchValidator(form: FormGroup) {
  //   return form.get('newPassword')?.value === form.get('confirmPassword')?.value 
  //     ? null : { mismatch: true };
  // }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) { 
     
      this.passwordChangeService.ResetPassword(this.passwordForm.value).subscribe({
        next: (response: any) => {
          if(response.message=="Success"){
          this.toastr.success("Passowrd changed successfully")
          this.router.navigate(['/login'])
        }
        },
        error: (error: any) => {
          // console.error('Error changing password', error);
          // this.toastr.error("Error occur")
        }
      });
    } else {
      
    }
  }





  // onSubmit() {
  //   if (this.passwordForm.valid) {
  //   } else {
  //     this.passwordForm.markAllAsTouched();
  //   }
  // }




toggleNewPassword() {
  this.showNewPassword = !this.showNewPassword;
}

toggleConfirmPassword() {
  this.showConfirmPassword = !this.showConfirmPassword;
}

}