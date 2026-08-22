import { Component, ElementRef } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { JobPortalDetailsComponent } from '../job-portal-details/job-portal-details.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { JobPortalService } from './job-portal.service';
import { ProfileService } from '../../common-component/profile/profile.service';
import { ToastrService } from 'ngx-toastr';
import { ViewChild } from '@angular/core';
import { JobPortalServiceService } from '../job-portal-details/job-portal-service.service';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { debug } from 'node:console';
import flatpickr from 'flatpickr';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, ValidatorFn } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-job-portal',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    JobPortalDetailsComponent,
    ReactiveFormsModule,
    NgIf,
    CommonModule,
    FullCalendarModule,
    NgSelectModule,
    RouterLink,
  ],
  providers: [DatePipe],
  templateUrl: './job-portal.component.html',
  styleUrl: './job-portal.component.css',
})
export class JobPortalComponent {
  InvalidJobPostingNumber: boolean = false;
  limitCrossOfJobPostingCount: boolean = false;
  jobsForm: FormGroup;
  UpgradeJobPostingsPaymentForm: FormGroup;
  dayCare: number = 0;
  userId: number = 0;
  isEditMode: boolean = false;
  selectedDate: any;
  jobPostCount: any;
  availableJobPostCount: any;
  jobTypeList: any[] = [];
  JobPostPlansList: any;
  @ViewChild(JobPortalDetailsComponent)
  JobPortalDetailsComponent!: JobPortalDetailsComponent;
  userInfo: any;
  centerID: any;
  selectedFromDate: any;
  selectedToDate: any;
  selectedType: string = 'TOC';
  isSwalShown = false;
  paymentAmountFieldIsValid: boolean = true;
  AmountToPayForUpgradingJobPostings: number = 0;
  ShowAmountField: boolean = false;
  TotalAmountToShow: number = 0;
  UpgradeJobPostPlanForm: FormGroup;
  isTOC: boolean = true;
  expandedDescriptionIndex: number | null = null;

  @ViewChild('jobType', { static: false })
  jobType!: ElementRef<HTMLInputElement>;

  constructor(
    private formBuilder: FormBuilder,
    private cookie: CookieService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private jobPortalService: JobPortalService,
    private toastr: ToastrService,
    private jobPortalDetailservice: JobPortalServiceService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.jobsForm = this.formBuilder.group({
      id: [0],
      daycareID: [0],
      jobTitle: ['', [Validators.required, this.noWhitespaceValidator(), Validators.pattern('^[a-zA-Z_][a-zA-Z0-9_ ]*$')]],
      jobDescription: ['', [Validators.required, this.noWhitespaceValidator(), Validators.pattern('^[a-zA-Z_][a-zA-Z0-9_ ]*$'), Validators.maxLength(500)]],
      jobLocation: ['', [Validators.required, this.noWhitespaceValidator()]],



      // jobRequirements: ['', [Validators.required]],
      employmentType: [null, Validators.required],
      wages: [null, [Validators.min(1)]],
      salary: [null, [Validators.min(1)]],
      applicationDeadline: ['', [Validators.required]],
      vacancyCount: ['', [Validators.required, Validators.min(1)]],
      loginUserID: [0],
      isActive: true,
      statusID: [3],
      isToc: [true],
      salaryUnit: ['Monthly', Validators.required],
      workingHours: ['', [Validators.min(1), Validators.required]],
    });
    this.UpgradeJobPostingsPaymentForm = this.formBuilder.group({
      centreID: [0],
      jobPostingCount: [0, [Validators.required]],
      AmountToPay: [0],
    });
    this.UpgradeJobPostPlanForm = this.formBuilder.group({
      jobPostPlanID: [0, [Validators.required]],
      jobPostPlanPrice: [null],
    });
  }

  //  ngOnInit() {
  //   const JobPostCount = parseInt(this.cookie.get("jobPostCount"));
  //   this.jobPostCount = JobPostCount;
  //   this.userInfo=JSON.parse(this.cookie.get('UserInfo'))
  //   const parsedInfo = JSON.parse( this.userInfo);

  //   this.centerID= parsedInfo.result.centreID;
  //   this.dayCare = this.centerID;
  //   const userID = parseInt(this.cookie.get("UserId"));
  //   this.userId = userID;
  // }

  async ngOnInit() {
    const JobPostCount = parseInt(this.cookie.get('jobPostCount'));
    this.jobPostCount = JobPostCount;
    const users = this.cookie.get('UserInfo');
    const paresedInfo = JSON.parse(users);
    this.centerID = paresedInfo.result.centreID;
    this.dayCare = this.centerID;
    const userID = parseInt(this.cookie.get('UserId'));
    this.userId = userID;
    this.getJobType();

    this.getAvaiableJobPostsCount(this.dayCare);
    this.setType('TOC');
  }
  onInputValidation(event: Event, type: any): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    let value = input.value;



    if (type === 'description') {
      value = value.replace(/[^a-zA-Z0-9_ ]/g, '');
      value = value.replace(/^[0-9]+/, '');
      if (value.length > 500) {
        value = value.substring(0, 500);
      }
    }

    // Update the input value and form control
    input.value = value;
    const controlName = type === 'feature' ? 'featureName' : 'jobDescription';
    this.jobsForm.get(controlName)?.setValue(value);
  }


  ngAfterViewInit(): void {
    // Initialize Flatpickr
    this.initDateRangePicker('single');
  }

  datePickerInstance: any; // Declare a variable to hold the flatpickr instance







  initDateRangePicker(mode: 'single' | 'range' = 'single', defaultDate?: any) {
    const self = this;
    const currentDate = new Date();
    const formattedDefaultDate = new Date(defaultDate);
    const minDate =
      formattedDefaultDate < currentDate ? defaultDate : currentDate;


    // Set maxDate to 1 year from today
    const maxDate = new Date();
    maxDate.setFullYear(currentDate.getFullYear() + 1);


    this.datePickerInstance = flatpickr('#dateRangePicker', {
      // Store the instance
      mode: mode,
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'F j, Y',
      allowInput: true,
      minDate: minDate,
      maxDate: maxDate, // 👈 limit to 1 year from today
      defaultDate: defaultDate,
      onChange(selectedDates) {
        if (mode === 'single' && selectedDates.length === 1) {
          const selectedDate = selectedDates[0];
          self.jobsForm.patchValue({
            applicationDeadline: self.datePipe.transform(
              selectedDate,
              'yyyy-MM-dd'
            ),
          });
        } else if (mode === 'range' && selectedDates.length === 2) {
          self.filterDateRange(selectedDates);
        }
      },
      locale: {
        firstDayOfWeek: 1,
      },
    });
  }

  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isWhitespace = (control.value || '').trim().length === 0;
      return isWhitespace ? { whitespace: true } : null;
    };
  }

  //Arsh Added on 26/05/25 
  blockMinusKey(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault(); // Prevent typing "-" or "e"
    }
  }

  setType(type: string) {
    this.selectedType = type;
    this.resetFormAgain();
    const employmentTypeControl = this.jobsForm.get('employmentType');

    if (type == 'TOC') {
      this.isTOC = true;
      // Remove validators when TOC is selected
      // employmentTypeControl?.clearValidators();
      this.jobsForm.patchValue({
        employmentType: 3,
      });
    } else {
      this.isTOC = false;
    }
    // else{
    //   this.jobsForm.patchValue({
    //     isToc:false
    //   })
    // }

    // employmentTypeControl?.updateValueAndValidity();
  }

  getAllJobPostPlans() {
    this.jobPortalService.getAllJobPostPlans().subscribe(
      (data) => { },
      (error) => { }
    );
  }

  filterDateRange(selectedDates: Date[]): void {
    if (selectedDates && selectedDates.length === 2) {
      const fromDate = selectedDates[0];
      const toDate = selectedDates[1];

      this.selectedFromDate = this.formatsDate(fromDate);
      this.selectedToDate = this.formatsDate(toDate);
    }
  }

  formatsDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    this.jobsForm.markAllAsTouched();

    if (this.jobsForm.invalid) return;

    this.userInfo = JSON.parse(this.cookie.get('UserInfo'));
    // const parsedInfo = JSON.parse( this.userInfo);
    this.centerID = this.userInfo.result.centreID;
    this.dayCare = this.centerID;

    if (this.jobsForm.value.wages || this.jobsForm.value.salary) {
      this.spinner.show();
      this.jobsForm.patchValue({
        id: this.isEditMode ? this.jobsForm.get('id')?.value : 0,
        loginUserID: this.userId,
        daycareID: this.dayCare,
        isActive: true,
      });

      let checkDate: boolean = this.checkingDate(
        this.jobsForm.value.applicationDeadline
      );

      if (!checkDate) {
        this.jobPortalService.manageJobsPosting(this.jobsForm.value).subscribe({
          next: (data) => {
            if (data.message === 'Success') {
              this.jobsForm.patchValue({
                applicationDeadline: '',
              });

              if (this.datePickerInstance) {
                this.datePickerInstance.clear();
              }
              if (this.isEditMode) {
                Swal.fire('Job Updated Successfully!', '', 'success');
              } else {
                Swal.fire('Job Added successfully!', '', 'success');
              }

              this.getAvaiableJobPostsCount(this.dayCare);
            } else {
              this.toastr.error('Error updating data');
            }
            this.isEditMode = false;
            this.cdr.detectChanges();
            this.resetForm();
            // this.JobPortalDetailsComponent.getAllJobPostings('expired');
            this.JobPortalDetailsComponent.getAllJobPostings('active');
          },
          error: () => this.toastr.error('Error updating data'),
          complete: () => this.spinner.hide(),
        });
      } else {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Validating Future Dates',
          text: 'Date is smaller than current Date',
          confirmButtonText: 'Ok',
        });
      }
    } else {
      this.toastr.error('Please select wages or salary first !!');
    }
  }

  async onEdit(id: any) {
    this.isEditMode = true;
    this.spinner.show();
    try {
      const response: any = await this.jobPortalDetailservice
        .getJobByID(id)
        .toPromise();

      if (response.message === 'OK') {
        const jobData = response.result[0];
        // Format the applicationDeadline
        const formattedDate = this.datePipe.transform(
          jobData.applicationDeadline,
          'yyyy-MM-dd'
        );

        if (jobData.employmentType == 3) {
          this.jobType.nativeElement.checked = false;
          this.setType('TOC');
        } else {
          this.jobType.nativeElement.checked = true;
          this.setType('Full Time');
        }

        this.jobsForm.patchValue({
          id: id,
          loginUserID: this.userId,
          daycareID: this.dayCare,
          jobTitle: jobData.jobTitle,
          jobDescription: jobData.jobDescription,
          jobLocation: jobData.jobLocation,
          jobRequirements: jobData.jobRequirement,
          employmentType: jobData.employmentType,
          salary: jobData.salary,
          applicationDeadline: formattedDate,
          vacancyCount: jobData.vacancyCount,
          wages: jobData.wages,
          workingHours: jobData.workingHours,
          salaryUnit:
            jobData.isMonthlySalary == true
              ? 'Monthly'
              : jobData.isDailySalary == true
                ? 'Daily'
                : jobData.isWeeklySalary == true,
        });

        this.initDateRangePicker('single', jobData.applicationDeadline);
        this.spinner.hide();
      } else {
        this.spinner.hide();
        // console.error('No job data found for the provided ID.');
      }
    } catch (error) {
      this.spinner.hide();
      // console.error('Error fetching job data:', error);
    }
  }

  formatDate(dateString: string): string | null {
    if (!dateString) {
      return null;
    }
    return dateString.split('T')[0];
  }

  cancel() {

    this.isEditMode = false;
    this.resetForm();
    window.location.reload();
    // this.jobsForm.reset();
  }

  resetForm() {
    this.jobType.nativeElement.checked = false;
    this.setType('TOC');

    this.jobsForm.reset({
      id: 0,
      daycareID: this.dayCare,
      jobTitle: '',
      jobDescription: '',
      jobLocation: '',
      jobRequirements: '',
      employmentType: '',
      salary: null,
      wages: null,
      applicationDeadline: null,
      loginUserID: this.userId,
      salaryUnit: 'Monthly',
    });
  }

  resetFormAgain() {
    this.jobsForm.reset({
      id: 0,
      daycareID: this.dayCare,
      jobTitle: '',
      jobDescription: '',
      jobLocation: '',
      jobRequirements: '',
      employmentType: '',
      salary: null,
      wages: null,
      applicationDeadline: null,
      loginUserID: this.userId,
      salaryUnit: 'Monthly',
    });
  }
  // reuse the expire job post
  async reUseJobPost(job: any) {
    this.spinner.show();
    if (this.availableJobPostCount.count > 0) {
      try {
        this.isEditMode = false;
        const response: any = await this.jobPortalDetailservice
          .getJobByID(job.id)
          .toPromise();

        if (response.message === 'OK') {
          const jobData = response.result[0];
          // Format the applicationDeadline
          const formattedDate = this.datePipe.transform(
            jobData.applicationDeadline,
            'yyyy-MM-dd'
          );

          if (jobData.employmentType == 3) {
            this.jobType.nativeElement.checked = false;
            this.setType('TOC');
          } else {
            this.jobType.nativeElement.checked = true;
            this.setType('Full Time');
          }

          this.jobsForm.patchValue({
            id: 0,
            loginUserID: this.userId,
            daycareID: this.dayCare,
            jobTitle: jobData.jobTitle,
            jobDescription: jobData.jobDescription,
            jobLocation: jobData.jobLocation,
            jobRequirements: jobData.jobRequirement,
            employmentType: jobData.employmentType,
            salary: jobData.salary,
            wages: jobData.wages,
            applicationDeadline: formattedDate,
            vacancyCount: jobData.vacancyCount,
            workingHours: jobData.workingHours,
            salaryUnit:
              jobData.isMonthlySalary == true
                ? 'Monthly'
                : jobData.isDailySalary == true
                  ? 'Daily'
                  : jobData.isWeeklySalary == true,
          });

          this.initDateRangePicker('single', jobData.applicationDeadline);
          this.spinner.hide();
        } else {
          this.spinner.hide();
          // console.error('No job data found for the provided ID.');
        }
      } catch (error) {
        // console.error('Error fetching job data:', error);
      }
    } else {
      this.spinner.hide();
      Swal.fire({
        icon: 'warning',
        title: 'Upgarde Required',
        text: 'Upgrade your plan to add new jobs',
        confirmButtonText: 'Buy Now',
        cancelButtonText: 'Cancel',
        showCancelButton: true,
        //cancelButtonText:'Buy Now'
      }).then((result) => {
        if (result.isDenied) {
          this.isSwalShown = true;
        } else if (result.isConfirmed) {
          this.router.navigate(['/all-job-posting-plans']);
        }
      });
    }
  }

  checkingDate(prividedDate: any): boolean {
    const givenDate = new Date(prividedDate);
    const currentDate = new Date();

    const givenDateOnly = new Date(
      givenDate.getFullYear(),
      givenDate.getMonth(),
      givenDate.getDate()
    );
    const currentDateOnly = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    if (givenDateOnly < currentDateOnly) {
      return true;
    } else {
      return false;
    }
  }

  traceChangeDate(event: any) {
    let date = event.target.value;
    let checkDate: boolean = this.checkingDate(date);
    if (checkDate) {
      Swal.fire({
        icon: 'error',
        title: 'Validating Future Dates',
        text: 'Date is smaller than current Date',
        confirmButtonText: 'Ok',
      });
    }
  }

  //new
  getAvaiableJobPostsCount(centreID: any) {

    this.jobPortalService
      .getAvaiableJobPostsCount(this.dayCare)
      .subscribe((data) => {
        if (data.message === 'Success') {
          this.availableJobPostCount = data.result;

          //Swal
          if (!this.isSwalShown && this.availableJobPostCount.count === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Upgarde Required',
              text: 'Upgrade your plan to add new jobs',
              confirmButtonText: 'Buy Now',
              cancelButtonText: 'Cancel',
              showCancelButton: true,
              //cancelButtonText:'Buy Now'
            }).then((result) => {
              if (result.isDenied) {
                this.isSwalShown = true;
              } else if (result.isConfirmed) {
                this.router.navigate(['/all-job-posting-plans']);
              }
            });
            //this.isSwalShown = true;
          }
        }
      });
  }

  getJobType() {

    this.jobPortalService.getJobType().subscribe((data) => {
      if (data.message === 'OK') {
        this.jobTypeList = data.result.filter(
          (type: any) => type.jobType != 'TOC'
        );
      }
    });
  }

  OpenPaymentUpgradeModal() {
    this.UpgradeJobPostingsPaymentForm.reset();
    this.limitCrossOfJobPostingCount = false;
    this.InvalidJobPostingNumber = false;
    this.TotalAmountToShow = 0;
    this.ShowAmountField = false;
    $('#paymentForJobPostingModal').modal('show');
    this.UpgradeJobPostingsPaymentForm.patchValue({
      // jobPostingCount:
      centerID: this.dayCare,
    });
  }

  CalculateJobPostingAmount() {
    $('#jobPostingUpgradeSubmitButton').prop('disabled', true);
    if (this.UpgradeJobPostingsPaymentForm.valid) {
      if (this.UpgradeJobPostingsPaymentForm.value.jobPostingCount > 0) {
        if (
          this.UpgradeJobPostingsPaymentForm.value.jobPostingCount >
          this.jobPostCount
        ) {
          this.limitCrossOfJobPostingCount = true;
          $('#jobPostingUpgradeSubmitButton').prop('disabled', false);
        } else {
          let upgradeJobPostingsPaymentModel = {
            jobPostingCount:
              this.UpgradeJobPostingsPaymentForm.value.jobPostingCount,
            centreID: this.dayCare,
            AmountToPay: this.UpgradeJobPostingsPaymentForm.value.AmountToPay,
          };
          this.jobPortalService
            .UpgradeJobPostingAfterPayment(upgradeJobPostingsPaymentModel)
            .subscribe(
              (data) => {
                if (data.message === 'Success') {
                  $('#jobPostingUpgradeSubmitButton').prop('disabled', false);
                  this.getAvaiableJobPostsCount(this.dayCare);
                  $('#paymentForJobPostingModal').modal('hide');
                  this.toastr.success('Job postings upgraded successfully');
                } else {
                  this.toastr.success('Something went wrong');
                }
              },
              (e) => { }
            );
        }
      } else {
        this.toastr.error('Please enter valid number');
        $('#jobPostingUpgradeSubmitButton').prop('disabled', false);
      }
    }
  }

  CancelButtonOfUpgradeJobPostingPaymentForm() {
    this.UpgradeJobPostingsPaymentForm.reset();
    this.ShowAmountField = false;
    $('#jobPostingUpgradeSubmitButton').prop('disabled', false);
  }

  onTypingJobPostingCount(event: any) {
    let jobPostingCount = event.target.value;
    // let jobPostingCount = $('#jobPostingCountInput').val();
    jobPostingCount = Number(jobPostingCount);
    if (jobPostingCount < 1) {
      event.target.value = null;
      this.InvalidJobPostingNumber = true;
    }
    // else if(jobPostingCount > this.jobPostCount){
    //   event.target.value = null;
    //   this.limitCrossOfJobPostingCount = true;
    // }
    else {
      let JobPostingCountNumber = Number.isInteger(jobPostingCount);
      if (JobPostingCountNumber === true) {
        if (jobPostingCount > this.jobPostCount) {
          this.limitCrossOfJobPostingCount = true;
          this.InvalidJobPostingNumber = false;
          this.ShowAmountField = false;
        } else if (jobPostingCount <= 0) {
          this.InvalidJobPostingNumber = true;
          this.ShowAmountField = false;
        } else {
          let amountToPay = jobPostingCount * 5;
          this.UpgradeJobPostingsPaymentForm.patchValue({
            AmountToPay: amountToPay,
          });

          this.TotalAmountToShow = amountToPay;
          this.ShowAmountField = true;
          this.limitCrossOfJobPostingCount = false;
          this.InvalidJobPostingNumber = false;
        }
      } else {
        this.InvalidJobPostingNumber = true;
        this.ShowAmountField = false;
      }
    }
  }

  UpgradeJobPostPlanSubmit() {

  }
}
