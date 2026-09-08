import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StudentRegistrationService } from './student-registration.service';
import flatpickr from 'flatpickr';
import { CookieService } from 'ngx-cookie-service';
import { HeaderServiceService } from '../layout/header/header-service.service';

@Component({
  selector: 'app-student-registration',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    NgSelectModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [DatePipe],
  templateUrl: './student-registration.component.html',
  styleUrl: './student-registration.component.css',
})
export class StudentRegistrationComponent {
  studentRegistrationForm: any;
  datePickerStartDate: any;
  UserID: number = 0;
  StudentID: number = 0;
  ageGroupList: any[] = [];
  planInfo: any;
  datePickerDOB: any;
  selectedAge: number | null = null;
  centreID: number = 0;
  filteredageGroupList: any[] = [];
  planList: any[] = [];
  selectedPlan: any;
  constructor(
    private datePipe: DatePipe,
    private cookie: CookieService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private studentRegistrationService: StudentRegistrationService,
    private headerService: HeaderServiceService
  ) {
    this.studentRegistrationForm = this.fb.group({
      id: [0],
      firstName: ['', Validators.required],
      lastName: [''],
      ageGroup: [0],
      gender: ['Male', Validators.required],
      billingDate: [new Date()],
    });
  }

  ngOnInit(): void {
    this.UserID = parseInt(this.cookie.get('UserId'));
    this.StudentID = parseInt(this.cookie.get('StudentID'));
    const centreID = this.cookie.get('CentreID');
    if (centreID) {
      this.centreID = parseInt(centreID);
    }
    this.getAgeGroupList();
    this.getPlanDetailsByUserID(this.UserID);
  }

  ngAfterViewInit(): void {
    const currentDate = new Date();
    this.datePickerStartDate = flatpickr('#billingDate', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: currentDate,
    });

    this.datePickerDOB = flatpickr('#DateofBirth', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: currentDate,
    });
  }

  resetForm() {
    // this.datePickerDOB.clear();
    this.studentRegistrationForm.reset();
    // this.selectedAge = null;
    this.studentRegistrationForm.patchValue({
      id: 0,
      gender: 'Male',
    });
  }

  getPlanDetailsByUserID(ID: number) {
    this.studentRegistrationService
      .getPlanDetailsByUserID(ID)
      .subscribe((res: any) => {
        if (res.message == 'Success') {
          this.planInfo = res.result;
          // this.studentRegistrationForm.patchValue({
          //   ageGroup: this.planInfo.agegroupID,
          // });
        }
      });
  }

  getAgeGroupList() {
    this.spinner.show();
    this.studentRegistrationService.GetAllAgeGroup(this.centreID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.ageGroupList = response.result;
          this.filteredageGroupList = this.ageGroupList.map((item) => ({
            id: item.id,
            // name: `(${item.minAge}-${item.maxAge} ) Months`,
            
             //Added on 25/04/25
             name: `${item.minAge} - ${item.maxAge} ${item.isMonthly ? 'Month' : 'Year'} (${item.isMonthly ? this.convertMonthToYear(item.minAge) + ' - ' + this.convertMonthToYear(item.maxAge) + ' Year' : this.convertYearToMonth(item.minAge) + ' - ' + this.convertYearToMonth(item.maxAge) + ' Month'})`

          }));
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

  convertYearToMonth(year: number): number {
    return year * 12;
  }

  convertMonthToYear(month: number): number {
    return parseFloat((month / 12).toFixed(1));
  }

  manageStudentRegistration() {
    if (this.studentRegistrationForm.valid) {
      this.spinner.show();
      let formObject = this.studentRegistrationForm.value;
      let originalDate = new Date(formObject.billingDate);
      let formattedDate = this.datePipe.transform(originalDate, 'yyyy-MM-dd');
      formObject['billingDate'] = formattedDate;
      formObject['centreID'] = this.centreID;
      formObject['parentID'] = this.UserID;
                  if (this.planInfo != null) {
        formObject['ageGroup'] = 0;
        formObject['planID'] = this.planInfo.planID;
        formObject['planPrice'] = this.planInfo.planPrice;
        formObject['centreAdminID'] = this.planInfo.centreAdminID;
        formObject['discount'] = this.planInfo.discountValue;
        formObject['discountType'] = this.planInfo.discountType;
      } else {
        formObject['ageGroup'] = 0;
        formObject['planID'] = this.selectedPlan.id;
        formObject['planPrice'] = this.selectedPlan.price;
        formObject['centreAdminID'] = this.selectedPlan.planAdminID;
        formObject['discount'] = 0;
        formObject['discountType'] = null;
      }

      this.studentRegistrationService
        .manageStudentRegistration(formObject)
        .subscribe((result: any) => {
          if (result.message == 'Success') {
            this.spinner.hide();
            this.toastr.success(result.activity);
            this.resetForm();
            this.headerService.newStudent.set(
              this.headerService.newStudent() + 1
            );
          } else {
            this.spinner.hide();
            this.toastr.warning(result.message);
          }
        });
    } else {
      this.studentRegistrationForm.markAllAsTouched();
    }
  }

  // getDateOfBirth(event: any) {
  //   let currentDate = new Date();
  //   let birthDate = new Date(event.target.value);
  //   if (isNaN(birthDate.getTime())) {
  //     console.error('Invalid date format');
  //     return;
  //   }

  //   let age = currentDate.getFullYear() - birthDate.getFullYear();
  //   let monthDiff = currentDate.getMonth() - birthDate.getMonth();
  //   let dayDiff = currentDate.getDate() - birthDate.getDate();

  //   if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
  //     age--;
  //   }

  //   if (age > 0) {
  //     let count = 0;
  //     this.ageGroupList.forEach((item: any, i: number) => {
  //       if (age >= item.minAge && age <= item.maxAge) {
  //         this.selectedAge = item.id;
  //         count = count + 1;
  //         this.getPlanListByAge(item.id);
  //         return;
  //       } else if (i == this.ageGroupList.length - 1 && count == 0) {
  //         this.toastr.error('Age group does not exists');
  //         this.datePickerDOB.clear();
  //         this.selectedAge = null;
  //       }
  //     });
  //   } else {
  //     this.toastr.error('Age group does not exists');
  //     this.datePickerDOB.clear();
  //     this.selectedAge = null;
  //   }
  // }

  getPlanListByAge(ageID: number): void {
    this.spinner.show();
    this.planList = [];
    // this.datePickerDOB.clear();
    if (this.planInfo == null) {
      this.studentRegistrationService
        .getSubscriptionPlansByCentreAndAgeID(this.centreID, ageID)
        .subscribe({
          next: (data: any) => {
            if (data?.message === 'Success') {
              this.spinner.hide();
              this.planList = data.result ?? [];
            } else {
              this.spinner.hide();
              console.warn('Unexpected response message:', data.message);
              this.planList = [];
            }
            this.spinner.hide();
          },
          error: (err: any) => {
            console.error('Error fetching subscription plans:', err);
            this.spinner.hide();
          },
        });
    }
  }
  getSelectedPlan(event: any) {
    this.selectedPlan = event;
  }
}



