import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { StudentServiceService } from './student-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ManageStudentService } from '../../../day-care-management/student-management/manage-student/manage-student.service';
import { BookKeepingService } from '../book-keeping.service';
import { environment } from '../../../../environments/environment.development';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ParentDashboardService } from '../../../parent-management/parent-dashboard/parent-dashboard.service';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
import { ViewChild, ElementRef } from '@angular/core';
import { SkeletonLoaderComponent } from "../../skeleton-loader/skeleton-loader.component";
import { TooltipComponent } from '../../tooltip/tooltip.component';

declare var $: any;

@Component({
  selector: 'app-student-fees',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    CommonModule,
    NgxPaginationModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    SkeletonLoaderComponent,
    TooltipComponent

  ],
  providers: [DatePipe],
  templateUrl: './student-fees.component.html',
  styleUrl: './student-fees.component.css',
})
export class StudentFeesComponent {
  readonly URL = environment.apiUrl.slice(
    0,
    environment.apiUrl.indexOf('/api')
  );
  centreID: number = 0;
  UserID: number = 0;
  UserRoleID: number = 0;
  studentFeeRecords: any[] = [];
  pastContentCurrentPage: number = 1;
  pastContentPerPage: number = 5;
  outstandingContentCurrentPage: number = 1;
  outstandingContentPerPage: number = 5;
  upcomingContentCurrentPage: number = 1;
  upcomingContentPerPage: number = 5;
  activeTab: string = '';
  searchText: string = '';
  typingTimeout: any;
  startDate: any;
  endDate: any;
  toDatePickerInstance: any;
  isOutStandingTab: boolean = false;
  pendingPaymentStudentList: any[] = [];
  StudentPendingPaymentRecord: any[] = [];
  selectedPendingPayment: any[] = [];
  parentID: number = 0;
  studentID: number = 0;
  selectStudentForm: any;
  skeletonShow = 'Skelton';
  hoveredRow: any = null;

  @ViewChild('totalPaidAmount') totalPaidAmount!: ElementRef;

  constructor(
    private studentFeeService: StudentServiceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cookie: CookieService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private mmanageStudentService: ManageStudentService,
    private bookKeepingService: BookKeepingService,
    private parentDashboardService: ParentDashboardService
  ) {
    this.selectStudentForm = this.fb.group({
      studentID: [null],
    });
  }

  ngOnInit() {
    this.centreID = parseInt(this.cookie.get('CentreID'));
    this.UserID = parseInt(this.cookie.get('UserId'));
    this.UserRoleID = parseInt(this.cookie.get('UserRoleId'));
    this.patchDates()
    this.getAllStudentFeesDetails('All', false);
    this.dateRangePicker();
  }

  onSearchInput() {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.getAllStudentFeesDetails(this.activeTab, false);
    }, 1500);
  }

  dateRangePicker() {
    const today = new Date();
    let toDatePickerInstance: flatpickr.Instance;

    // Start Date Picker
    flatpickr('#selectFromDate', {
      mode: 'single',
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: today,
      onChange: (selectedDates: Date[]) => {
        if (selectedDates.length) {
          const startDate = selectedDates[0];
          this.startDate = this.datePipe.transform(startDate, 'MM-dd-yyyy');
          this.endDate = '';
          // Dynamically update minDate for To Date Picker
          if (this.toDatePickerInstance) {
            this.toDatePickerInstance.set('minDate', startDate);
          }
        }
      },
    });

    // End Date Picker (To Date)
    this.toDatePickerInstance = flatpickr('#selectToDate', {
      mode: 'single',
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: today,
      onChange: (selectedDates: Date[]) => {
        if (selectedDates.length) {
          this.endDate = this.datePipe.transform(
            selectedDates[0],
            'MM-dd-yyyy'
          );
          this.getAllStudentFeesDetails(this.activeTab, false);
        }
      },
    });
  }
  // dateRangePicker() {
  //   let self = this;
  //   flatpickr('#dateRangePicker', {
  //     mode: 'range',
  //     dateFormat: 'm/d/y',
  //     allowInput: false,

  //     onClose(selectedDates: Date[]) {
  //       if (selectedDates.length == 2) {
  //         const formatDate = (date: any) => {
  //           const year = date.getFullYear();
  //           const month = String(date.getMonth() + 1).padStart(2, '0');
  //           const day = String(date.getDate()).padStart(2, '0');
  //           return `${year}/${month}/${day}`;
  //         };
  //         self.startDate = formatDate(selectedDates[0]);
  //         self.endDate = formatDate(selectedDates[1]);
  //       } else {
  //         self.startDate = null;
  //         self.endDate = null;
  //       }
  //     },
  //   });

  getAllPendingPayment(event: any) {
    let checked = event.target.checked;
    this.selectedPendingPayment = [];
    let totalAmount = 0;
    this.totalPaidAmount.nativeElement.value = '';
    if (checked == true) {
      this.selectedPendingPayment = this.StudentPendingPaymentRecord;
      this.StudentPendingPaymentRecord = this.StudentPendingPaymentRecord.map(
        (item: any) => {
          totalAmount = totalAmount + item.totalPaidAmount;
          return {
            ...item,
            check: true,
          };
        }
      );

      this.totalPaidAmount.nativeElement.value = totalAmount;
    } else {
      this.StudentPendingPaymentRecord = this.StudentPendingPaymentRecord.map(
        (item: any) => {
          return {
            ...item,
            check: false,
          };
        }
      );
    }
  }

  proceedToPay() {
    this.spinner.show();
    let clearBO: any = [];

    this.selectedPendingPayment.forEach((item: any) => {
      let clearPaymentObject = {
        planID: item.planID,
        dueDate: item.monthDueDate,
        paymentDate: item.paymentDate,
        parentID: this.parentID,
        totalPlanAmount: item.planAmount,
        totalPaidAmount: item.totalPaidAmount,
        studentID: this.studentID,
        discount: item.discount,
        paymentType: 'Cash',
      };

      clearBO.push(clearPaymentObject);
    });

    this.parentDashboardService
      .ClearStudentPendingPayments(clearBO, this.centreID)
      .subscribe(async (response: any) => {
        if (response.message == 'Success') {
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
          Swal.fire('Payment Completed Successfully !!', '', 'success');
          await this.getStudentRecord(this.studentID, this.parentID);
        } else {
          this.spinner.hide();
          Swal.fire(response.message, '', 'error');
        }
      });
  }

  validateRecordSelection(isPreviousRecord: boolean, pendingRecord: any) {
    let totalAmount =
      this.totalPaidAmount.nativeElement.value == ''
        ? 0
        : parseInt(this.totalPaidAmount.nativeElement.value);

    if (isPreviousRecord) {
      Swal.fire({
        title: 'Clear previous month payment first !!',
        icon: 'error',
        allowOutsideClick: false,
      }).then((res) => {
        if (res.isConfirmed) {
          this.StudentPendingPaymentRecord =
            this.StudentPendingPaymentRecord.map((item: any) => {
              let isExists =
                item.uniqueID == pendingRecord.uniqueID ? false : true;
              return {
                ...item,
                check:
                  isExists == true
                    ? item.check == true
                      ? true
                      : false
                    : false,
              };
            });
        }
      });
    } else {
      this.selectedPendingPayment.push(pendingRecord);
      this.StudentPendingPaymentRecord = this.StudentPendingPaymentRecord.map(
        (item: any) => {
          let isExists = item.uniqueID == pendingRecord.uniqueID ? true : false;
          if (isExists) {
            totalAmount = totalAmount + item.totalPaidAmount;
          }
          return {
            ...item,
            check: isExists == true || item.check == true ? true : false,
          };
        }
      );

      this.totalPaidAmount.nativeElement.value = totalAmount;
    }
  }

  selectSpecificRecord(event: any, pendingRecord: any) {
    let checked = event.target.checked;
    // let totalAmount = 0;
    if (checked == true) {
      if (this.selectedPendingPayment.length > 0) {
        let isPreviousRecordExists = this.selectedPendingPayment.some(
          (item: any) => item.monthDueDate > pendingRecord.monthDueDate
        );

        this.validateRecordSelection(isPreviousRecordExists, pendingRecord);
      } else {
        let isPreviousRecordExists = this.StudentPendingPaymentRecord.some(
          (item: any) => item.monthDueDate < pendingRecord.monthDueDate
        );

        this.validateRecordSelection(isPreviousRecordExists, pendingRecord);
      }
    } else {
      // let pendingPayment =
      //   parseInt(this.totalPaidAmount.nativeElement.value) -
      //   pendingRecord.totalPaidAmount;

      // this.totalPaidAmount.nativeElement.value =
      //   pendingPayment == 0 ? '' : pendingPayment;

      let removedItems: any[] = [];

      this.selectedPendingPayment.forEach((item: any, index: number) => {
        if (item.uniqueID == pendingRecord.uniqueID) {
          let pendingPayment =
            parseInt(this.totalPaidAmount.nativeElement.value) -
            item.totalPaidAmount;
          this.totalPaidAmount.nativeElement.value =
            pendingPayment == 0 ? '' : pendingPayment;
          removedItems.push(item);
        } else if (item.monthDueDate > pendingRecord.monthDueDate) {
          let pendingPayment =
            parseInt(this.totalPaidAmount.nativeElement.value) -
            item.totalPaidAmount;
          this.totalPaidAmount.nativeElement.value =
            pendingPayment == 0 ? '' : pendingPayment;
          removedItems.push(item);
        }
      });

      this.selectedPendingPayment = this.selectedPendingPayment.filter(
        (value: any) => !removedItems.includes(value)
      );

      this.StudentPendingPaymentRecord = this.StudentPendingPaymentRecord.map(
        (item: any) => {
          // let isExists = item.uniqueID == pendingRecord.uniqueID ? false : true;
          let isExists = removedItems.some(
            (value: any) => value.uniqueID == item.uniqueID
          );

          // return {
          //   ...item,
          //   check:
          //     isExists == true
          //       ? removedItems.includes(item) == true
          //         ? false
          //         : item.check == true
          //         ? true
          //         : false
          //       : false,
          // };

          return {
            ...item,
            check: isExists == true ? false : item.check,
          };
        }
      );
    }
  }

  async getStudentRecord(studentID: number, parentID: number) {
    this.spinner.show();

    let data = await this.parentDashboardService
      .getAllPendingPaymentsByStudentID(studentID)
      .toPromise();
    if (data.message == 'Success') {
      this.parentID = parentID;
      this.studentID = studentID;
      setTimeout(() => {
        this.spinner.hide();
      }, 100);
      this.StudentPendingPaymentRecord = data.result.map((item: any) => {
        return {
          ...item,
          check: false,
        };
      });
    } else {
      this.StudentPendingPaymentRecord = [];
      this.totalPaidAmount.nativeElement.value = '';
      this.spinner.hide();
    }
  }

  async getStudentPendingPayment(event: any) {
    this.totalPaidAmount.nativeElement.value = '';
    if (event) {
      await this.getStudentRecord(event.studentID, event.parentID);

      // let data = await this.parentDashboardService
      //   .getAllPendingPaymentsByStudentID(event.studentID)
      //   .toPromise();
      // if (data.message == 'Success') {
      //   this.parentID = event.parentID;
      //   this.studentID = event.studentID;
      //   setTimeout(() => {
      //     this.spinner.hide();
      //   }, 100);
      //   this.StudentPendingPaymentRecord = data.result.map((item: any) => {
      //     return {
      //       ...item,
      //       check: false,
      //     };
      //   });
      // } else {
      //   this.spinner.hide();
      // }
    } else {
      this.spinner.hide();
      this.StudentPendingPaymentRecord = [];
    }
  }

  getAllStudentPendingPaymentRecordByDaycareAdminID() {
    this.spinner.show();
    this.pendingPaymentStudentList = [];
    this.selectedPendingPayment = [];
    this.pendingPaymentStudentList = [];
    this.StudentPendingPaymentRecord = [];
    this.totalPaidAmount.nativeElement.value = '';
    this.parentID = 0;
    this.studentID = 0;
    this.selectStudentForm.patchValue({
      studentID: null,
    });
    this.studentFeeService
      .getAllStudentPendingPaymentRecordByDaycareAdminID(this.UserID)
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
          this.pendingPaymentStudentList = result.result;
          $('#feeModal').modal('show');
        } else {
          this.spinner.hide();
          Swal.fire('No record found !!', '', 'error');
        }
      });
  }

  getAllStudentFeesDetails(PaymentType: string, TabClick: boolean) {


    this.skeletonShow = 'Skelton'
    if (TabClick) {
      this.searchText = '';
      this.startDate = '';
      this.endDate = '';
      this.patchDates()
    }

    if (PaymentType == 'Outstanding') {
      this.isOutStandingTab = true;
    } else {
      this.isOutStandingTab = false;
    }

    var formattedstartDate: any = '';
    var endstartDate: any = '';
    if (this.startDate && this.endDate) {
      formattedstartDate = this.datePipe.transform(
        this.startDate,
        'YYYY-MM-dd'
      );
      endstartDate = this.datePipe.transform(this.endDate, 'YYYY-MM-dd');
    }
    this.activeTab = PaymentType;
    this.studentFeeRecords = [];
    this.studentFeeService
      .getStudentsTransactionDetailsByCentreAdminID(
        this.UserID,
        PaymentType,
        this.searchText,
        formattedstartDate,
        endstartDate
      )
      .subscribe((response: any) => {
        if (response.message == 'Success') {
          this.studentFeeRecords = response.result;

          //Added on 08/07/25 Arsh
          this.studentFeeRecords.forEach(item => {
            if (item?.planAmount != null) {
              const costNum = Number(item.planAmount);
              item.planAmount = costNum.toLocaleString('en-CA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
            }

            if (item?.totalPaidAmount != null) {
              const costNum = Number(item.totalPaidAmount);
              item.totalPaidAmount = costNum.toLocaleString('en-CA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
            }

          });


          this.skeletonShow = '';

        } else {
          this.skeletonShow = '';

        }
      });
  }

  sendActions(actionType: string, event: any): void {
    const paymentID = event.paymentID;
    if (!actionType || !paymentID) {
      this.toastr.error('Invalid action or missing payment ID');
      return;
    }

    if (actionType === 'chat') {
      this.router.navigate(['/chatbox']);
      return;
    }

    this.spinner.show();

    if (actionType === 'notification' || actionType === 'mail') {
      this.studentFeeService
        .sendActions(actionType, paymentID, this.UserID, event.studentID)
        .subscribe({
          next: (response: any) => {
            if (response.message === 'Success') {
              const successMsg =
                actionType === 'notification'
                  ? 'Notification sent successfully!'
                  : 'Mail sent successfully!';
              this.toastr.success(successMsg);
            } else {
              this.toastr.error('Action failed: ' + response.message);
            }
          },
          error: (err) => {
            this.toastr.error('An error occurred while sending action');
            console.error(err);
          },
          complete: () => {
            this.spinner.hide();
          },
        });
    } else {
      this.toastr.warning('Unsupported action type!');
      this.spinner.hide();
    }
  }

  downloadInvoice(orderID: string) {
    this.spinner.show();
    this.bookKeepingService.getInvoice(orderID).subscribe({
      next: (response: any) => {
        if (response.message == 'OK') {
          const fileUrl = `${this.URL}/Content/Invoice/${response.result}`;
          const link = document.createElement('a');
          link.href = fileUrl;
          link.target = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
          link.click();
        } else {
          this.spinner.hide();
          this.toastr.error('Invoice Not Found.');
        }
      },
      error: (err) => {
        this.toastr.error('An error occurred while sending action');
        console.error(err);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  patchDates() {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    this.startDate = this.datePipe.transform(oneMonthAgo, 'MM-dd-YYYY');
    this.endDate = this.datePipe.transform(today, 'MM-dd-YYYY');
  }
}
