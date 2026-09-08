import { Component, ViewChild, ElementRef } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormsModule,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AddDiscountService } from './add-discount.service';
import { ManageClassroomService } from '../classroom-management/manage-classroom/manage-classroom.service';
import { DayCareDashboardService } from '../daycare-dashboard/day-care-dashboard.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { SkeletonLoaderComponent } from '../../common-component/skeleton-loader/skeleton-loader.component';
import { TooltipComponent } from '../../common-component/tooltip/tooltip.component';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
declare var $: any;

@Component({
  selector: 'app-add-discount',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NgxPaginationModule,
    CommonModule,
    SkeletonLoaderComponent,
    TooltipComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './add-discount.component.html',
  styleUrl: './add-discount.component.css',
})
export class AddDiscountComponent {
  parentDiscountForm: any;
  public customPlanList: any[] = [];
  public discountedPlanList: any[] = [];
  public ageGroupList: any[] = [];
  public centreID: number = 0;
  public userID: number = 0;
  public parentDiscountList: any[] = [];
  public currentPageCount: number = 1;
  public itemPerPage: number = 5;
  public studentList: any[] = [];
  public studentRecord: any[] = [];
  public planList: any[] = [];
  public planDetails: any;
  public giveDiscountForm: any;
  public frontendPlanList: any[] = [];
  public searchItem: string = '';
  public loading: boolean = false;
  public EnrolledParentRecord: any[] = [];
  public parentList: any[] = [];
  public activeTab: string = 'Request';
  private request: boolean = true;
  public selectedParent: number = 0;
  public enrolledItemPerPage: number = 5;
  public enrolledCurrentPage: number = 1;
  public discountTypeList: any[] = [
    { label: 'Amount ($)', value: 'amount' },
    { label: 'Percentage (%)', value: 'percentage' },
  ];
  skeletonShow = 'Skelton';
  skeletonShow2: string = 'Skelton2';
  hoveredRow: any = null;

  public enrolledStudentList: any[] = [];
  discountType: string = 'amount';

  @ViewChild('discountToggle', { static: false })
  discountToggle!: ElementRef<HTMLInputElement>;

  constructor(
    private cookie: CookieService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private discountService: AddDiscountService,
    private classService: ManageClassroomService,
    private daycaredashboardService: DayCareDashboardService
  ) {
    this.parentDiscountForm = this.fb.group({
      parentID: [null, Validators.required],
      email: ['', Validators.required],
      studentID: [null, Validators.required],
      PlanID: [null, Validators.required],
      discount: ['', Validators.required],
      discountType: ['amount'],
      centreID: [''],
      parentType: ['new', Validators.required],
      isNewDiscount: [],
    });

    this.giveDiscountForm = this.fb.group({
      name: ['', Validators.required],
      ageGroup: ['', Validators.required],
      email: ['', Validators.required],
      planID: ['', Validators.required],
      centreID: [''],
      tempOrderNumber: [''],
    });
  }

  ngOnInit() {
    this.getCookieData();

    this.getDiscountAppliedRequest();
  }

  convertMonthsToYears(months: number): number {
    if (months < 0) {
      throw new Error('Invalid input: months cannot be negative.');
    }
    return Math.floor(months / 12);
  }

  convertYearsToMonths(years: number): number {
    if (years < 0) {
      throw new Error('Invalid input: years cannot be negative.');
    }
    return years * 12;
  }

  getStudentRecords(discount: any) {
    this.skeletonShow = "Skeleton";
    this.studentList = [];

    this.studentList = discount.students.map((item: any) => {
      if (item.isMonthlyAge == true) {
        let minYear = this.convertMonthsToYears(item.minAge);
        let maxYear = this.convertMonthsToYears(item.maxAge);
        this.skeletonShow = "";

        return {
          ...item,
          ageGroup: `${item.minAge} - ${item.maxAge} Months ( ${minYear} - ${maxYear} Years)`,
        };

      } else {
        let minMonth = this.convertYearsToMonths(item.minAge);
        let maxMonth = this.convertYearsToMonths(item.maxAge);
        this.skeletonShow = "";

        return {
          ...item,
          ageGroup: `${minMonth} - ${maxMonth} Months ( ${item.minAge} - ${item.maxAge} Years)`,
        };
      }
    });

    // $('#viewStudentListModal').modal('show');
  }

  getEnrolledStudentRecords(enrollmentRecord: any) {
    this.enrolledStudentList = [];
    this.enrolledStudentList = enrollmentRecord.student.map((item: any) => {
      if (item.isMonthlyAge == true) {
        let minYear = this.convertMonthsToYears(item.minAge);
        let maxYear = this.convertMonthsToYears(item.maxAge);
        return {
          ...item,
          ageGroup: `${item.minAge} - ${item.maxAge} Months ( ${minYear} - ${maxYear} Years)`,
        };
      } else {
        let minMonth = this.convertYearsToMonths(item.minAge);
        let maxMonth = this.convertYearsToMonths(item.maxAge);

        return {
          ...item,
          ageGroup: `${minMonth} - ${maxMonth} Months ( ${item.minAge} - ${item.maxAge} Years)`,
        };
      }
    });
    // $('#viewEnrolledStudent').modal('show');
  }

  setDiscountType(discountType: any) {
    this.parentDiscountForm.patchValue({
      discountType: discountType,
    });
  }

  openDiscountModal() {
    this.getAgeGroupsList();
    $('#giveDiscount').modal('show');
  }

  getDiscountAppliedRequest() {
    this.reset();
    // this.spinner.show();
    this.skeletonShow = 'Skelton';

    this.activeTab = 'Request';
    this.parentList = [];
    this.currentPageCount = 1;
    let searchItem = this.searchItem ? this.searchItem : '';
    this.daycaredashboardService
      .getAllEnrollmentRequestByCentreID(this.centreID, true, searchItem)
      .subscribe((data: any) => {
        if (data.message == 'Success') {
          this.request = true;
          setTimeout(() => {
            this.spinner.hide();
          }, 500);
          this.parentDiscountList = data.result;
          this.parentList = this.parentDiscountList;
          this.skeletonShow = '';
        } else {
          this.parentDiscountList = [];
          this.skeletonShow = '';
        }
      });
  }

  validateDiscount(event: any) {
    let inputValue = parseInt(event.target.value);
    if (this.parentDiscountForm.value.discountType == 'percentage') {
      if (isNaN(inputValue) || inputValue < 0 || inputValue > 100) {
        this.parentDiscountForm.patchValue({
          discount: '',
        });
      }
    } else {
      if (
        this.planDetails.PlanPrice < inputValue &&
        (isNaN(inputValue) || inputValue < 0)
      ) {
        this.parentDiscountForm.patchValue({
          discount: '',
        });
      }
    }
  }


  getAllEnrolledParentRecord() {
    this.skeletonShow2 = 'Skelton2'
    this.reset();
    this.activeTab = 'Enrollment';
    this.request = false;
    this.enrolledCurrentPage = 1;
    this.parentList = [];
    this.discountService
      .getAllEnrolledStudentsRecord(this.centreID)
      .subscribe((data: any) => {
        if (data.message == 'Success') {
          this.EnrolledParentRecord = data.result;
          this.parentList = this.EnrolledParentRecord;
          this.skeletonShow2 = '';
        } else {
          this.EnrolledParentRecord = [];
          this.skeletonShow2 = '';
        }
      });
  }

  sendDiscountFormToParent() {
    if (this.giveDiscountForm.valid) {
      this.spinner.show();
      this.giveDiscountForm.patchValue({
        centreID: this.centreID,
        tempOrderNumber: this.generateTempOrderNumber(),
      });

      // TODO: (Discount) Currently, this only sends an email. We need to save the generated discount 
      // invitation (with tempOrderNumber) to the database here, so Daycare Owners can see a 
      // "Pending Invites" list before the parent actually responds and creates a formal enrollment request.

      this.discountService
        .sendDiscountFormMail(this.giveDiscountForm.value)
        .subscribe((response: any) => {
          if (response.message == 'Success') {
            setTimeout(() => {
              this.spinner.hide();
            }, 100);
            $('#giveDiscount').modal('hide');
            this.toastr.success('Discount form email send successfully.');
            this.resetGiveDiscountForm();
          }
        });
    } else {
      this.giveDiscountForm.markAllAsTouched();
    }
  }

  getCookieData() {
    this.centreID = this.cookie.get('CentreID')
      ? parseInt(this.cookie.get('CentreID'))
      : 0;
    this.userID = this.cookie.get('UserId')
      ? parseInt(this.cookie.get('UserId'))
      : 0;
  }

  // getAllCustomPlanList(ageGroupID: number) {
  //   this.spinner.show();
  //   this.customPlanList = [];
  //   this.discountService
  //     .getCustomPlanByUserID(this.userID, ageGroupID)
  //     .subscribe((data: any) => {
  //       if ((data.message = 'Success')) {
  //         this.customPlanList = data.result;
  //         this.spinner.hide();
  //       } else {
  //         this.spinner.hide();
  //       }
  //     });
  // }

  getStudentList(event: any, action: string) {
    this.studentRecord = [];
    this.planList = [];
    this.planDetails = null;
    this.selectedParent = event.parentID;
    this.setDiscountType('amount');

    this.parentDiscountForm.patchValue({
      studentID: null,
      planID: null,
      discount: null,
      PlanID: null,
    });

    if (this.request == true) {
      this.planDetails = {
        PlanPrice: event.planPrice,
        planName: event.planName,
      };

      this.parentDiscountForm.patchValue({
        studentID: null,
        planID: null,
      });
      if (event) {
        const planObject = {
          planID: event.planID,
          planName: event.planName,
        };

        this.planList.push(planObject);
        this.parentDiscountForm.patchValue({
          PlanID: event.planID,
          email: event.email,
        });
        this.studentRecord = event.students;
      }
    } else {
      if (event) {
        this.studentRecord = event.student;
        this.parentDiscountForm.patchValue({
          email: event.email,
        });
      }
    }
    if (action == 'edit') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  reset() {
    // setTimeout(() => {
    //   this.discountToggle.nativeElement.checked = false;
    //   this.setDiscountType('amount');
    // }, 0);
    this.discountType = '';
    this.parentDiscountForm.reset();
    this.parentDiscountForm.patchValue({
      discountType: 'amount',
      parentType: 'new',
    });
  }

  getDiscountsForSelectedPlan(event: any) {
    this.spinner.show();
    const selectedPlanId = event.subscriptionPlanID;
    this.discountedPlanList = [];
    this.discountService
      .geDiscountByPlanID(selectedPlanId)
      .subscribe((data: any) => {
        if ((data.message = 'Success')) {
          this.discountedPlanList = data.result.map((plan: any) => {
            return {
              value: plan.id,
              label: `${plan.discountPlan} - ${plan.discountValue}% OFF`,
            };
          });
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.toastr.error('Discount Not Found!');
        }
      });
  }

  generateTempOrderNumber(): string {
    const timestamp = Date.now();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${timestamp}-${randomNum}`;
  }

  searchParentDetails(event: any) {
    let inputValue = event.target.value;
    this.searchItem = inputValue.toLowerCase().trim();

    if (this.searchItem.length > 3) {
      this.getDiscountAppliedRequest();
    } else if (this.searchItem == '') {
      this.searchItem = '';
      this.getDiscountAppliedRequest();
    }
  }

  sendDiscountPlanEmail() {
    this.spinner.show();
    if (this.parentDiscountForm.valid) {
      // const obj = {
      //   firstName: this.parentDiscountForm.value.firstName,
      //   lastName: this.parentDiscountForm.value.lastName,
      //   planID: this.parentDiscountForm.value.selectPlan,
      //   email: this.parentDiscountForm.value.email,
      //   centreID: this.cookie.get('CentreID')
      //     ? this.cookie.get('CentreID')
      //     : '0',
      //   tempOrderNumber: orderNumber,
      //   discountPlanID: this.parentDiscountForm.value.selectDiscount,
      //   parentType: this.parentDiscountForm.value.parentType,
      // };

      let isNewDiscount = this.request == true ? true : false;

      this.parentDiscountForm.patchValue({
        centreID: this.centreID,
        isNewDiscount: isNewDiscount,
      });

      this.discountService
        .sendPaymentMailToParent(this.parentDiscountForm.value)
        .subscribe((res: any) => {
          if (res.message == 'Success') {
            this.getDiscountAppliedRequest();
            this.planDetails = null;

            setTimeout(() => {
              this.spinner.hide();
            }, 100);

            $('#editModal').modal('hide');
            this.toastr.success('Payment Email Send Successfully');
            this.reset();
          } else if (res.message == 'Plan Assignment Succesfull') {
            this.planDetails = null;
            this.spinner.hide();
            $('#editModal').modal('hide');
            this.toastr.success('Plan Assigned Successfully');
            this.reset();
          } else {
            this.planDetails = null;
            this.spinner.hide();
            this.toastr.warning(res.message);
            this.reset();
          }
        });
    } else {
      this.spinner.hide();
      this.parentDiscountForm.markAllAsTouched();
    }
  }

  getAgeGroupsList() {
    this.spinner.show();
    this.classService.GetAllAgeGroup(this.centreID).subscribe((data) => {
      if (data.message == 'Success') {
        const activeAgeGroups = data.result.filter(
          (item: { isActive: boolean }) => item.isActive
        );
        // this.ageGroupList = activeAgeGroups.map(
        //   (item: {
        //     id: any;
        //     ageGroupTitle: string;
        //     minAge: any;
        //     maxAge: any;
        //     isMonthly: boolean;
        //   }) => ({
        //     value: item.id,
        //     label: `(${item.minAge} - ${item.maxAge}) Months`,
        //   })
        // );

        this.ageGroupList = activeAgeGroups.map((item: any) => {
          if (item.isMonthly == true) {
            let minYear = this.convertMonthsToYears(item.minAge);
            let maxYear = this.convertMonthsToYears(item.maxAge);
            return {
              value: item.id,
              label: `${item.minAge} - ${item.maxAge} Months ( ${minYear} - ${maxYear} Years)`,
            };
          } else {
            let minMonth = this.convertYearsToMonths(item.minAge);
            let maxMonth = this.convertYearsToMonths(item.maxAge);

            return {
              value: item.id,
              label: `${minMonth} - ${maxMonth} Months ( ${item.minAge} - ${item.maxAge} Years)`,
            };
          }
        });

        setTimeout(() => {
          this.spinner.hide();
        }, 300);
      } else {
        this.spinner.hide();
      }
    });
  }

  getPlan(event: any) {
    if (event) {
      this.getPlanList(event.value);
    } else {
      this.giveDiscountForm.patchValue({
        planID: null,
      });
    }
  }

  resetGiveDiscountForm() {
    this.giveDiscountForm.reset();
  }

  async getPlanAccToAgeGroup(event: any) {
    if (this.request == false) {
      if (event) {
        let discountType = event.paymentRecord.discount
          ? event.paymentRecord.discount.discountType
          : 'amount';
        // this.discountType = discountType;

        await this.getPlanList(event.ageGroupID);

        let planID = this.planList.find(
          (item: any) => item.planID == event.paymentRecord.planID
        );

        let discount = event.paymentRecord.discount
          ? event.paymentRecord.discount.discount
          : 0;

        this.parentDiscountForm.patchValue({
          PlanID: planID.planID,
          discount: discount,
          discountType: discountType,
        });
      } else {
        this.studentRecord = [];
        this.planList = [];
        this.planDetails = null;

        this.setDiscountType('amount');

        this.parentDiscountForm.patchValue({
          studentID: null,
          planID: null,
          discount: null,
          PlanID: null,
          email: null,
        });
      }
    }
  }

  async getPlanList(ageGroupID: number) {
    this.spinner.show();
    const obj = {
      loginUserID: this.userID,
      ageID: ageGroupID,
    };

    let data = await this.discountService
      .getAllSubscriptionPlansForFrontEnd(obj)
      .toPromise();
    if (data.message == 'Ok') {
      this.spinner.hide();
      this.frontendPlanList = data.result;
      this.planList = data.result.map((item: any) => {
        return {
          planID: item.id,
          planName: item.planName,
        };
      });
    } else {
      this.spinner.hide();
    }
  }

  // convertYearToMonth(year: number): number {
  //   return year * 12;
  // }

  // convertMonthToYear(month: number): number {
  //   return parseFloat((month / 12).toFixed(1));
  // }
  showBanner: boolean = true;

  closeBanner() {
    this.showBanner = false;
  }

  onDiscountTypeChange(type: any) {
    this.setDiscountType(type.value);
  }
}
