import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../../common-component/common.service';
import { json } from 'stream/consumers';
import { SocialLinksService } from './social-links.service';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { SwitcherComponentComponent } from '../../../common-component/switcher-component/switcher-component.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-social-links',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BreadcrumbComponent,
    BreadcrumbComponent,
    BreadcrumbComponent,
    SwitcherComponentComponent,
    NgSelectModule,
  ],
  templateUrl: './social-links.component.html',
  styleUrl: './social-links.component.css',
})
export class SocialLinksComponent implements OnInit {
  public socialLinksForm: any;
  private loginUserID: number = 0;
  private centreID: number = 0;
  public disableFeature: boolean = true;

  payrollFrequencies = ['Weekly', 'BiWeekly', 'Monthly'];
  payrollFrequencyForm!: FormGroup;
  isPayrollFilled: boolean = false;
  IsOnboarding: boolean = true;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute, private router: Router,
    private cookie: CookieService,
    private commonservice: CommonService,
    public onBoardingService: OnboardingService,
    private socialLinksService: SocialLinksService
  ) {
    this.socialLinksForm = fb.group({
      id: [0],
      // twitter: [null, Validators.required],
      // instagram: [null, Validators.required],
      // facebook: [null, Validators.required],
      // linkedIn: [null, Validators.required],
      twitter: [null],
      instagram: [null],
      facebook: [null],
      linkedIn: [null],
    });

    this.payrollFrequencyForm = this.fb.group({
      payrollFrequency: [''],
      centreID: [null],
    });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const enc_id = params.get('enc_id');
      if (enc_id) {
        const decryptedId = this.commonservice.decrypt(enc_id);
        this.centreID =
          decryptedId && !isNaN(Number(decryptedId))
            ? parseInt(decryptedId, 10)
            : 0;
        this.getSocialMediaLinks();
        if (this.cookie.check('UserId')) {
          this.loginUserID = parseInt(this.cookie.get('UserId'));
        }
        this.IsOnboarding = true;
      } 
      else {
        this.IsOnboarding = false;
        this.loginUserID = parseInt(this.cookie.get('UserId'));
        this.centreID = parseInt(this.cookie.get('CentreID'));
        this.getSocialMediaLinks();
        this.getPayrollFrequencyByDaycareID();
      }
    });

    //Added on 17/07/25
    if (this.router.url.includes('onboarding')) {
      this.IsOnboarding = true;
    }
    else{
      this.IsOnboarding = false;
    }
  }

  get socialLinksFormControls() {
    return this.socialLinksForm.controls;
  }

  getSocialMediaLinks() {
    this.socialLinksService.getSocialMediaLinks(this.centreID)
      .subscribe((response) => {
        if (response.message === 'Success') {
          this.socialLinksForm.patchValue({
            id: response.result.id,
            twitter: response.result.twitter,
            instagram: response.result.instagram,
            facebook: response.result.facebook,
            linkedIn: response.result.linkedIn,
            loginUserID: this.loginUserID,
          });
        }
        setTimeout(() => {
          this.spinner.hide();
        }, 300);
      });
  }

  // getTrackValue() {
  //   if (this.socialLinksForm.valid && this.isPayrollFilled) {
  //     this.disableFeature = false;
  //   } else {
  //     this.disableFeature = true;
  //   }
  // }

    getTrackValue() {
    if (this.socialLinksForm.valid) {
      this.disableFeature = false;
    } else {
      this.disableFeature = true;
    }
  }

  // onSubmitLinks() {
  //   if (this.socialLinksForm.valid) {
  //     const JsonData = this.socialLinksForm.value;
  //     JsonData['id'] = JsonData.id > 0 ? JsonData.id : 0;
  //     JsonData['loginUserID'] = this.loginUserID;
  //     JsonData['daycareID'] = this.centreID;


  //     this.socialLinksService.manageDaycareSocailLinks(this.socialLinksForm.value).subscribe({
  //         next: (response) => {
  //           if (response.message === 'Success') {
  //             const activityMessage = response.activity.split(' ');
  //             if (activityMessage[2] == 'updated') {
  //               this.toastr.success(response.activity);
  //               this.getSocialMediaLinks();
  //             } 
  //             else {
  //               this.commonservice.manageDaycareOnBoarding(this.centreID,'ManageSocialMediaLinks').subscribe((result: any) => {
  //                   if (result.message == 'Success') {
  //                     if (!this.onBoardingService.onBoardingData.isCompleteStep7) {
  //                       this.onBoardingService.onBoardingData.isCompleteStep7 = true;
  //                       this.onBoardingService.handleNext('Tab-7');
  //                     } else {
  //                       this.toastr.success(response.activity);
  //                       this.onBoardingService.getCurrentTab();
  //                     }
  //                   }
  //                 });
  //               this.socialLinksForm.get('id').setValue(response.result);
  //             }
  //           } else {
  //             this.toastr.warning(response.message);
  //           }
  //           setTimeout(() => {
  //             this.spinner.hide();
  //           }, 300);
  //         },
  //         error: (err) => {
  //           this.toastr.error(err.message);
  //           this.spinner.hide();
  //         },
  //       });
  //   } else {
  //     this.socialLinksForm.markAllAsTouched();
  //   }
  // }

   //Updated on 17/07/25
  onSubmitLinks() {
    if (this.socialLinksForm.valid) {
      const JsonData = this.socialLinksForm.value;
      JsonData['id'] = JsonData.id > 0 ? JsonData.id : 0;
      JsonData['loginUserID'] = this.loginUserID;
      JsonData['daycareID'] = this.centreID;

      if (this.socialLinksForm.value.facebook == null && this.socialLinksForm.value.instagram == null && this.socialLinksForm.value.linkedIn == null && this.socialLinksForm.value.twitter == null) {
        this.commonservice.manageDaycareOnBoarding(this.centreID, 'ManageSocialMediaLinks').subscribe((result: any) => {
          if (result.message == 'Success') {
            if (!this.onBoardingService.onBoardingData.isCompleteStep7) {
              this.onBoardingService.onBoardingData.isCompleteStep7 = true;
              this.onBoardingService.handleNext('Tab-7');
            } else {
              this.toastr.success(result.activity);
              this.onBoardingService.getCurrentTab();
            }
          }
        });
        // this.socialLinksForm.get('id').setValue(response.result);
      }
      else {
        this.socialLinksService.manageDaycareSocailLinks(this.socialLinksForm.value).subscribe({
          next: (response) => {
            if (response.message === 'Success') {
              const activityMessage = response.activity.split(' ');
              if (activityMessage[2] == 'updated') {
                this.toastr.success(response.activity);
                this.getSocialMediaLinks();
              }
              else {
                this.commonservice.manageDaycareOnBoarding(this.centreID, 'ManageSocialMediaLinks').subscribe((result: any) => {
                  if (result.message == 'Success') {
                    if (!this.onBoardingService.onBoardingData.isCompleteStep7 && this.IsOnboarding) {
                      this.onBoardingService.onBoardingData.isCompleteStep7 = true;
                      this.onBoardingService.handleNext('Tab-7');
                    } 
                    else if(this.IsOnboarding){
                       this.toastr.success(response.activity);
                       this.onBoardingService.getCurrentTab();
                    }
                    else {
                      this.toastr.success(response.activity);
                      this.getSocialMediaLinks();
                    }
                  }
                });
                this.socialLinksForm.get('id').setValue(response.result);
              }
            } else {
              this.toastr.warning(response.message);
            }
            setTimeout(() => {
              this.spinner.hide();
            }, 300);
          },
          error: (err) => {
            this.toastr.error(err.message);
            this.spinner.hide();
          },
        });
      }
    } else {
      this.socialLinksForm.markAllAsTouched();
    }
  }

  async submitForm() {
    this.spinner.show();
    const selectedFrequency = this.payrollFrequencyForm.get('payrollFrequency')?.value;
    if (this.payrollFrequencyForm.valid) {
      this.payrollFrequencyForm.patchValue({
        centreID: this.centreID,
        payrollFrequency: selectedFrequency,
      });

      this.socialLinksService.managePayrollFrequency(this.payrollFrequencyForm.value).subscribe({
        next: (data: any) => {
          this.spinner.hide();
          if (data.message === 'OK') {
            this.isPayrollFilled = true;
            // localStorage.setItem('isPayrollFilled', 'true');
            this.toastr.success('Payroll Frequency Saved Successfully');
          } else {
            localStorage.setItem('isPayrollFilled', 'false');
            this.isPayrollFilled = false;
            this.toastr.warning('Unexpected response');
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error('An error occurred while processing the request');
          console.error(err);
        },
      });
    } else {
      this.spinner.hide();
      this.payrollFrequencyForm.markAllAsTouched();
    }
  }

  getPayrollFrequencyByDaycareID() {
    var payRollFrequency: any;
    this.socialLinksService.getPayrollFrequencyByDaycareID(this.centreID).subscribe({
      next: (data: any) => {
        if (data.message = "Success") {
          payRollFrequency = data.result.payrollFrequency;
          this.payrollFrequencyForm.patchValue({ payrollFrequency: payRollFrequency });
        } else {
          
        }

      }
    })
  }
}
