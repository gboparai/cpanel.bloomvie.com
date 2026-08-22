import { Component, effect, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { CookieService } from 'ngx-cookie-service';
import { ParentDashboardService } from './parent-dashboard.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header.component';
import { ClassroomDetailsService } from '../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { environment } from '../../../environments/environment.development';
import { CommonModule, DatePipe } from '@angular/common';
import { HeaderServiceService } from '../../layout/header/header-service.service';
import { ViewTeacherService } from '../../teachers-management/view-teacher/view-teacher.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MyAttendanceService } from '../../common-component/my-attendance/my-attendance.service';
import { ToastrService } from 'ngx-toastr';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, {
  ThirdPartyDraggable,
} from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EventsComponent } from '../../common-component/events/events.component';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, firstValueFrom, lastValueFrom } from 'rxjs';
import { CommonService } from '../../common-component/common.service';
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { LoginService } from '../../login/login.service';
import { SkeletonLoaderComponent } from '../../common-component/skeleton-loader/skeleton-loader.component';
import { ManageStudentService } from '../../day-care-management/student-management/manage-student/manage-student.service';

declare var $: any;
@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    RouterModule,
    CommonModule,
    FullCalendarModule,
    EventsComponent,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    StripeCardComponent,
    SkeletonLoaderComponent,
  ],
  providers: [DatePipe],
  templateUrl: './parent-dashboard.component.html',
  styleUrl: './parent-dashboard.component.css',
})
export class ParentDashboardComponent {
  @ViewChild('cardElem') cardElement!: StripeCardComponent;

  readonly ImageRootURL = environment.apiUrl.slice(0, -3);
  loginUserId: any;
  teacherCount: any;
  teacherDetailslList: any[] = [];
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  studentID: any;
  startDate: any;
  endDate: any;
  studentData: any;
  flattenedActivities: any[] = [];
  flattenedActivitiesByDay: any[] = [];
  userroleID: string | undefined;
  allStudents: any;
  paymentDetail: any;
  parentName: string = '';
  attendanceCount: any;
  today: any;
  fullName: any;
  TodayAttendanceStatus: any;
  centreID: number = 0;
  pendingPaymentRecord: any[] = [];
  currentPage: number = 1;
  itemPerPage: number = 5;
  totalAmount: number = 0;
  selectedPendingPayments: any[] = [];
  parsedToken: any;
  isDisabledCondition: boolean = true;
  public paymentForm!: FormGroup;
  public submitted: boolean = false;
  private connectedAccountId: string = '';
  private centreAdminId: number = 0;
  skeletonShowList2 = 'SkeltonList2';
  planName = 'planName';
  teacherCountShow = 'teacherCount';
  presentCount = 'presentCount';
  AttendanceStatusShow = 'show';
  skeletonShowList = 'SkeltonList';

  skeletonShow = 'Skelton';
  daycarecentreDetails:any;

  cardOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
      },
    },
  };

  //private loginUserID: number = 0;
  constructor(
    private cookies: CookieService,
    private parentDashboardservice: ParentDashboardService,
    private router: Router,
    private classroomdetailService: ClassroomDetailsService,
    private headerService: HeaderServiceService,
    private viewTeacherService: ViewTeacherService,
    private spinner: NgxSpinnerService,
    private service: MyAttendanceService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private stripeService: StripeService,
    private fb: FormBuilder,
    private onBoardingService: OnboardingService,
    private authService: LoginService,
    
 private manageStudentService:ManageStudentService
  ) {
    this.paymentForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^\\+?[0-9]{10,12}$')],
      ],
    });

    effect(() => {
      this.headerService.switchProfile();
      this.ngOnInit();
    });
  }

  async ngOnInit() {
    const authData = this.authService.authData;
    this.centreAdminId = authData?.centreAdminId || 0;
    this.centreID = authData?.centreId || 0;

    this.today = new Date();
    this.loginUserId = this.cookies.get('UserId');
    this.studentID = this.cookies.get('StudentID');
    this.userroleID = this.cookies.get('UserRoleId') || this.cookies.get('userRoleID');
    let userInfo = this.cookies.get('UserInfo');
    if (userInfo) {
      let parsedUserInfo = JSON.parse(userInfo);
      this.parsedToken = parsedUserInfo;
      this.parentName = parsedUserInfo.result.lastName
        ? parsedUserInfo.result.firstName + ' ' + parsedUserInfo.result.lastName
        : parsedUserInfo.result.firstName;
    }
    this.CheckParentOnboarding(this.studentID);
    // this.getTeacherCount(this.loginUserId);

    await this.getTeacherDetailByStudentParentId();
    this.getStudentData();
    this.getAllStudentsForParent();
    this.checkTodayAttandanceStatusById();
    await this.getAllPendingPaymentsByStudentID();
    this.getCurrentMonthAttendanceSummaryByID();
    // this.getStudentDetailByStudentId();
    // this.getStudentPlanDetail();

    this.isTermAndConditionModalOpen();
    this.getAccountDetails();
    
  this.getDayCareCentreDetails();

  }

  getAccountDetails() {
    this.onBoardingService.getAccountDetails(this.centreAdminId).subscribe({
      next: (response) => {
        this.connectedAccountId = response.result.accountId;
      },
      error: (err) => {
        // this.toastr.error(err.message);
       
      },
    });
  }

  checkTodayAttandanceStatusById() {
    let userId = this.studentID;
    this.AttendanceStatusShow = 'show';
    this.service.checkTodayAttandanceStatusById(Number(userId), Number(this.userroleID),0)
      .subscribe((data) => {
        if (data.message == 'ok') {
          this.TodayAttendanceStatus = data.result;
          this.AttendanceStatusShow = '';
        } else {
          this.TodayAttendanceStatus = false;
          this.AttendanceStatusShow = '';
        }
      });
  }

  CheckParentOnboarding(studentID: number) {
    this.parentDashboardservice
      .CheckParentOnboarding(studentID)
      .subscribe((data) => {
        if (data.message == 'Success') {
               this.commonService.updateDisplaySpinner(false);
        } else {
     
          this.router.navigate(['parent-onboarding']);
        }
      });
  }

  // getStudentDetailByStudentId() {
  //   this.service
  //     .getStudentDetailByStudentId(Number(this.studentID))
  //     .subscribe((data) => {
  //       if (data.message == 'OK') {
  //         this.fullName =
  //           data.result.studentFirstName +
  //           (data.result.studentLastName != null
  //             ? data.result.studentLastName
  //             : '');
  //       } else {
  //       }
  //     });
  // }

  //Commented on 10/04/25
  // getTeacherCount(UserID: any) {
  //   this.parentDashboardservice.getTeacherCount(UserID).subscribe((data) => {
  //     if (data.message === 'OK') {
  //       this.teacherCount = data.result || 0;
  //     }
  //   });
  // }

  AcceptTermsAndConditions(event: any) {
    let checked = event.target.checked;
    if (checked == true) {
      this.isDisabledCondition = false;
    } else {
      this.isDisabledCondition = true;
    }
  }

  isTermAndConditionModalOpen() {
    let termsAndCondition;
    if (this.cookies.check('termAndCondition')) {
      termsAndCondition =
        this.cookies.get('termAndCondition') == 'Accepted' ? true : false;
    } else {
      termsAndCondition = this.parsedToken.result.termsAndCondition;
    }
    if (termsAndCondition == null) {
      $('#termsCondition').modal('show');
    } else {
      $('#termsCondition').modal('hide');
    }
  }

  TermsAndConditionAction(statusID: number) {
    let activityName = statusID == 6 ? 'Accept' : 'Reject';
    Swal.fire({
      title: `Do you want to ${activityName} the Terms and Conditions !!`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'No',
      confirmButtonText: 'Yes',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.AcceptOrRejectTermsAndCondition(statusID);
      }
    });
  }

  AcceptOrRejectTermsAndCondition(statusID: number) {
    this.spinner.show();
    this.commonService
      .AcceptOrRejectTermsAndCondition(this.loginUserId, statusID)
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          this.cookies.set('termAndCondition', result.activity);
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
          if (result.activity == 'Accepted') {
            Swal.fire(`Terms and Conditions Accepted`, '', 'success');
          } else {
            Swal.fire(`Terms and Conditions Rejected.`, '', 'error').then(
              (next) => {
                if (next.isConfirmed) {
                  this.authService.logOut();
                }
              }
            );
          }
          $('#termsCondition').modal('hide');
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
  }

  async getTeacherDetailByStudentParentId() {
    let parentId = Number(this.loginUserId);
    let studentId = Number(this.studentID);
    this.teacherCountShow = 'teacherCount';
    if (!studentId) {
      studentId = parseInt(this.cookies.get('StudentID'));
    }
    let data = await this.viewTeacherService
      .getTeacherDetailByStudentParentId(parentId, studentId)
      .toPromise();
    if (data.message == 'OK') {
      this.teacherCount = data.count || 0;
      this.teacherCountShow = '';
    } else {
      this.teacherCount = 0;
      this.teacherCountShow = '';
    }
  }

  async getAllPendingPaymentsByStudentID() {
    this.skeletonShow = 'Skelton';

    let data = await this.parentDashboardservice
      .getAllPendingPaymentsByStudentID(this.studentID)
      .toPromise();
    if (data.message == 'Success') {
      this.pendingPaymentRecord = data.result.map((item: any) => {
        return {
          ...item,
          check: false,
        };
      });

      this.skeletonShow = '';
    } else {
      this.pendingPaymentRecord = [];
      this.skeletonShow = '';
    }
  }

  selectAllPendingPayment(event: any) {
    let checked = event.target.checked;
    if (checked == true) {
      this.selectedPendingPayments = this.pendingPaymentRecord;
      this.pendingPaymentRecord = this.pendingPaymentRecord.map((item: any) => {
        return {
          ...item,
          check: true,
        };
      });
    } else {
      this.selectedPendingPayments = [];
      this.pendingPaymentRecord = this.pendingPaymentRecord.map((item: any) => {
        return {
          ...item,
          check: false,
        };
      });
    }
  }

  validateSelection(isPreviousRecord: boolean, pendingRecord: any) {
    if (isPreviousRecord) {
      Swal.fire({
        title: 'Clear previous month payment first !!',
        icon: 'error',
        allowOutsideClick: false,
      }).then((res) => {
        if (res.isConfirmed) {
          this.pendingPaymentRecord = this.pendingPaymentRecord.map(
            (item: any) => {
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
            }
          );
        }
      });
    } else {
      this.selectedPendingPayments.push(pendingRecord);
      this.pendingPaymentRecord = this.pendingPaymentRecord.map((item: any) => {
        let isExists = item.uniqueID == pendingRecord.uniqueID ? true : false;
        return {
          ...item,
          check: isExists == true || item.check == true ? true : false,
        };
      });
    }
  }

  selectSpecificRecord(event: any, pendingRecord: any) {
    let checked = event.target.checked;
    if (checked == true) {
      if (this.selectedPendingPayments.length > 0) {
        let isPreviousDateExists = this.selectedPendingPayments.some(
          (item: any) => item.monthDueDate > pendingRecord.monthDueDate
        );

        this.validateSelection(isPreviousDateExists, pendingRecord);
      } else {
        let isPreviousDateExists = this.pendingPaymentRecord.some(
          (item: any) => item.monthDueDate < pendingRecord.monthDueDate
        );

        this.validateSelection(isPreviousDateExists, pendingRecord);
      }
    } else {
      // let index = 0;
      // this.selectedPendingPayments.forEach((item: any, i: number) => {
      //   if (item.uniqueID == pendingRecord.uniqueID) {
      //     index = i;
      //     return;
      //   }
      // });

      let removedItems: any[] = [];

      this.selectedPendingPayments.forEach((item: any, index: number) => {
        if (item.uniqueID == pendingRecord.uniqueID) {
          removedItems.push(item);
        } else if (item.monthDueDate > pendingRecord.monthDueDate) {
          removedItems.push(item);
        }
      });

      this.selectedPendingPayments = this.selectedPendingPayments.filter(
        (value: any) => !removedItems.includes(value)
      );

      this.pendingPaymentRecord = this.pendingPaymentRecord.map((item: any) => {
        // let isExists = item.uniqueID == pendingRecord.uniqueID ? false : true;

        let isExists = removedItems.some(
          (value: any) => value.uniqueID == item.uniqueID
        );

        return {
          ...item,
          check: isExists == true ? false : item.check,
        };
      });
    }
  }

  payNow() {
    this.totalAmount = 0;
    if (this.selectedPendingPayments.length > 0) {
      let totalPaidAmount: number = 0;
      this.selectedPendingPayments.forEach((item: any) => {
        totalPaidAmount = totalPaidAmount + item.totalPaidAmount;
      });

      this.totalAmount = totalPaidAmount;
      $('#staticBackdrop').modal('show');
    } else {
      Swal.fire('Select Atleast one Record !!', '', 'error');
    }
  }

  async onSubmitPayment() {
    try {
      if (this.paymentForm.invalid) {
        this.paymentForm.markAllAsTouched();
        return;
      }
      this.spinner.show();
      this.submitted = true;
      // stripe apis
      const clientSecret = await this.createPaymentIntent();
      const {
        paymentIntentId,
        status,
        payment_method,
        currency,
        amountInCents,
      } = await this.confirmPayment(clientSecret);
      if (!paymentIntentId || !status) {
        console.warn('Payment was not successful. Status:', status);
        return;
      }
      if (status === 'succeeded') {
        const subscriptionPaymentResponse = await this.proceedToPay();
        if (subscriptionPaymentResponse) {
          await this.transferToConnectedAccount(paymentIntentId, amountInCents);
          const subscriptionPalnPaymentId =
            subscriptionPaymentResponse.result.subscriptionPlanPaymentIdList;
          await this.handlePayment(
            subscriptionPalnPaymentId,
            paymentIntentId,
            status,
            payment_method,
            currency
          );
          await this.handlePaymentResponse();
          this.paymentForm.reset();
        }
      } else if (status === 'requires_payment_method') {
        Swal.fire({
          icon: 'warning',
          title: 'Payment Incomplete',
          text: 'Payment requires a valid payment method.',
          confirmButtonText: 'Update Payment Method',
        });
      } else if (status === 'canceled') {
        Swal.fire({
          icon: 'info',
          title: 'Payment Cancelled',
          text: 'You have cancelled the payment process.',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: `The payment status is "${status}". Please try again.`,
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Payment Process Error:', error);
    } finally {
      this.spinner.hide();
      this.submitted = false;
    }
  }

  async handlePayment(
    subscriptionPlanPaymentId: number[],
    transactionId: string,
    paymentStatus: string,
    paymentMethod: string,
    currency: string
  ): Promise<any | null> {
    try {
      const formValues = this.paymentForm.value;
      const payload = {
        firstName: formValues.firstName?.trim() || '',
        lastName: formValues.lastName?.trim() || '',
        email: formValues.email?.toLowerCase() || '',
        phoneNumber: formValues.phoneNumber?.toLowerCase() || '',
        subscriptionPlanPaymentId,
        paymentStatus: paymentStatus,
        paymentIntentId: transactionId,
        currency: currency,
        paymentMethod: paymentMethod,
        amount: this.calculateTotal(),
      };

      const paymentResponse = await this.commonService
        .createPayment(payload)
        .toPromise();
      return paymentResponse.result;
    } catch (error) {
      throw error;
    }
  }

  async handlePaymentResponse() {
    $('#staticBackdrop').modal('hide');
    Swal.fire({
      title: 'Success',
      text: 'The payment has been completed successfully.',
      icon: 'success',
      confirmButtonText: 'OK',
    });
    await this.getAllPendingPaymentsByStudentID();
  }

  async createPaymentIntent(): Promise<string> {
    const payload = {
      amount: this.calculateTotal(),
      connectedAccountId: this.connectedAccountId,
    };
    const response = await lastValueFrom(
      this.commonService.createPaymentIntent(payload)
    );
    return response.clientSecret;
  }

  async confirmPayment(clientSecret: string): Promise<{
    paymentIntentId: string | null;
    status: string | null;
    payment_method: string | any;
    currency: string | any;
    amountInCents: number | any;
  }> {
    try {
      const { firstName, lastName, email, phoneNumber } =
        this.paymentForm.value;
      const result = await this.stripeService
        .confirmCardPayment(clientSecret, {
          payment_method: {
            card: this.cardElement.element,
            billing_details: {
              name: `${firstName} ${lastName}`,
              email,
              phone: phoneNumber,
            },
          },
        })
        .toPromise();

      if (result?.error) {
        console.error('Stripe Error:', result.error.message);
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: result.error.message,
        });
        return {
          paymentIntentId: null,
          status: 'failed',
          payment_method: null,
          currency: null,
          amountInCents: 0,
        };
      }

      const paymentIntentId = result?.paymentIntent?.id || null;
      const paymentStatus = result?.paymentIntent?.status || null;
      const totalAmountInCents = result?.paymentIntent?.amount || 0;

      if (!paymentIntentId) {
        console.warn('Payment Intent ID not received.');
        Swal.fire({
          icon: 'warning',
          title: 'Payment Incomplete',
          text: 'We could not confirm your payment. Please try again.',
        });

        return {
          paymentIntentId: null,
          status: paymentStatus,
          payment_method: null,
          currency: null,
          amountInCents: 0,
        };
      }
      return {
        paymentIntentId,
        status: paymentStatus,
        payment_method: result?.paymentIntent?.payment_method,
        currency: result?.paymentIntent.currency,
        amountInCents: totalAmountInCents,
      };
    } catch (error) {
      console.error('Payment Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An error occurred while confirming the payment.',
      });
      return {
        paymentIntentId: null,
        status: null,
        payment_method: null,
        currency: null,
        amountInCents: 0,
      };
    }
  }

  async transferToConnectedAccount(
    paymentIntentId: string,
    totalAmountInCents: number
  ): Promise<any> {
    try {
      const platformFeeInCents = Math.round(
        totalAmountInCents * (this.commonService.platFormFee() / 100)
      );
      const payload = {
        connectAccountId: this.connectedAccountId,
        totalAmountInCents,
        platformFeeInCents,
        paymentIntentId,
      };
      const response = await this.commonService
        .transferToConnectedAccount(payload)
        .toPromise();

      if (response.message == 'Success') {
        return response;
      } else {
        this.toastr.error('Something wents wrong !!');
      }
    } catch (error) {
      throw error;
    }
  }

  calculateTotal(): number {
    return this.selectedPendingPayments
      .map((item: { totalPaidAmount: number }) => item.totalPaidAmount)
      .reduce((acc, val) => acc + val, 0);
  }

  async proceedToPay(): Promise<any> {
    const clearBO = this.selectedPendingPayments.map((item: any) => ({
      planID: item.planID,
      dueDate: item.monthDueDate,
      paymentDate: item.paymentDate,
      parentID: this.loginUserId,
      totalPlanAmount: item.planAmount,
      totalPaidAmount: item.totalPaidAmount,
      studentID: this.studentID,
      discount: item.discount,
      paymentType: 'Online',
    }));

    try {
      const response = await lastValueFrom(
        this.parentDashboardservice.ClearStudentPendingPayments(
          clearBO,
          this.centreID
        )
      );
      return response;
    } catch (error: any) {
      this.toastr.error(error.message || '');
      return null;
    }
  }

  getCurrentMonthAttendanceSummaryByID() {
    let userId = this.studentID;
    this.presentCount = 'presentCount';
    this.service.getCurrentMonthAttendanceSummaryByID(Number(userId),Number(this.userroleID),0)
      .subscribe((response) => {
        if (response.message === 'Success') {
          this.attendanceCount = response.result;
          this.presentCount = '';
        }
        this.attendanceCount = [];
        this.presentCount = '';
      });
  }

  // getTeacherDetail(UserID :any){
  //   this.parentDashboardservice.getAttendingTeachersInfo(UserID).subscribe(data=>{
  //     if(data.message==="OK"){
  //       this.teacherDetailslList = data.result;
  //     }
  //   })
  // }

  getStudentData(): void {
    this.skeletonShowList = 'SkeltonList';

    if (this.studentID) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
      };

      this.startDate = formatDate(yesterday);
      this.endDate = formatDate(today);
      this.classroomdetailService
        .getStudentDetails(this.studentID, this.startDate, this.endDate)
        .subscribe({
          next: (data: any) => {
            if (data.message === 'OK') {
              this.studentData = data.result;
              this.processStudentData(this.studentData);
              this.groupActivitiesByDay();
              this.skeletonShowList = '';
            } else {
              this.studentData = [];
              this.flattenedActivitiesByDay = [];
              this.skeletonShowList = '';
            }
          },
          error: () => {
            console.error('Error fetching student data.');
            this.spinner.hide();
          },
        });
    }
  }

  //For Single image
  // processStudentData(data: any) {
  //   if (!Array.isArray(data)) {
  //     console.warn('Expected data to be an array.');
  //     this.imageList = [];
  //     return;
  //   }

  //   const today = new Date().toISOString().split('T')[0];
  //   let allImages: any[] = [];

  //   data.forEach((entry: any) => {
  //     if (Array.isArray(entry.days)) {
  //       entry.days.forEach((day: any) => {
  //         const dateOnly = new Date(day.date).toISOString().split('T')[0];
  //         if (Array.isArray(day.studentData) && day.studentData.length) {
  //           day.studentData.forEach((activity: any) => {
  //             if (activity.activityImage) {
  //               allImages.push({
  //                 fullPath: `${this.ImageRootURL}${activity.activityPath}${activity.activityImage}`,
  //                 date: dateOnly,
  //               });
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });
  //   this.imageList = allImages.sort((a, b) => {
  //     if (a.date === today && b.date !== today) return -1;
  //     if (a.date !== today && b.date === today) return 1;
  //     return new Date(b.date).getTime() - new Date(a.date).getTime();
  //   });

  // }

  processStudentData(data: any) {
    const today = new Date().toISOString().split('T')[0];
    let allImages: any[] = [];

    // data.forEach((entry: any) => {
    //   if (Array.isArray(entry.days)) {
    //     entry.days.forEach((day: any) => {
    //       const dateOnly = new Date(day.date).toISOString().split('T')[0];

    //       if (Array.isArray(day.studentData) && day.studentData.length) {
    //         day.studentData.forEach((activity: any) => {
    //           if (activity.activityImage) {
    //             const imageArray = activity.activityImage.split(',');

    //             imageArray.forEach((img: string) => {
    //               allImages.push({
    //                 fullPath: `${this.ImageRootURL}${activity.activityPath}${img.trim()}`,
    //                 date: dateOnly,
    //               });
    //             });
    //           }
    //         });
    //       }
    //     });
    //   }
    // });

    data.forEach((entry: any) => {
      if (Array.isArray(entry.days) && entry.days.length > 0) {
        const rawDate = new Date(entry.days[0].date);
        const dateOnly = `${String(rawDate.getDate()).padStart(
          2,
          '0'
        )}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(
          rawDate.getFullYear()
        ).slice(2)}`;
        entry.days.forEach((day: any) => {
          if (Array.isArray(day.studentData) && day.studentData.length) {
            day.studentData.forEach((activity: any) => {
              if (activity.activityImage) {
                const imageArray = activity.activityImage.split(',');

                imageArray.forEach((img: string) => {
                  allImages.push({
                    fullPath: `${this.ImageRootURL}${
                      activity.activityPath
                    }${img.trim()}`,
                    date: dateOnly,
                  });
                });
              }
            });
          }
        });
      }
    });
  }

  groupActivitiesByDay(): void {
    this.flattenedActivitiesByDay = [];
    if (this.studentData[0]?.days?.length) {
      const allDays = this.studentData[0].days;
      const today = new Date().toISOString().split('T')[0];

      let selectedDay = allDays.find((day: any) => {
        const recordDate = new Date(day.date).toISOString().split('T')[0];
        return recordDate === today;
      });
      if (!selectedDay) {
        const sortedDays = allDays
          .map((day: any) => ({
            ...day,
            parsedDate: new Date(day.date),
          }))
          .sort(
            (a: any, b: any) => b.parsedDate.getTime() - a.parsedDate.getTime()
          );
        selectedDay = sortedDays[0];
      }

      // if (selectedDay) {
      //   this.flattenedActivitiesByDay = [{
      //     fullDate: selectedDay.date,
      //     month: selectedDay.month,
      //     date: selectedDay.date,
      //     studentData: selectedDay.studentData || []
      //   }];
      // }

      if (selectedDay) {
        const sortedStudentData = (selectedDay.studentData || []).sort(
          (a: any, b: any) => {
            return b.activityStartTime.localeCompare(a.activityStartTime);
          }
        );

        this.flattenedActivitiesByDay = [
          {
            fullDate: selectedDay.date,
            month: selectedDay.month,
            date: selectedDay.date,
            studentData: sortedStudentData,
          },
        ];
      }
    }
  }

  async getAllStudentsForParent() {
    try {
      this.planName = 'planName';
      const response = await this.headerService
        .getAllStudentsByParentID(this.loginUserId)
        .toPromise();
      if (response.message === 'Success') {
        this.allStudents = response.result.studentList;
        let studentId: number = Number(this.studentID);
        const student = this.allStudents.find(
          (x: { id: number }) => x.id === studentId
        );
        this.headerService
          .CheckStudentSubscriptionPayment(
            student.parentID,
            this.userroleID,
            student.id,
            student.centreID
          )
          .subscribe({
            next: (authResponse: {
              result: any;
              message: string;
              activity: any;
            }) => {
              if (authResponse.message === 'Success') {
                this.paymentDetail = authResponse.result;
                this.planName = '';
              } else {
                this.paymentDetail = [];
                this.planName = '';
              }
            },
            error: () => {
              // this.toastr.error('An error occurred during login');
              this.planName = '';
            },
          });
      } else {
        // console.error('No data found', response.message);
        this.paymentDetail = [];
        this.planName = '';
      }
    } catch (error) {
      this.planName = '';
    }
  }

  
  getDayCareCentreDetails() {
    this.manageStudentService.getDayCareCentreDetails(this.centreID).subscribe({
      next: (response) => {
        if (response.message === 'OK') {
          this.daycarecentreDetails = response.result;
        }
      },
      error: (err) => { },
    });
  }


}
