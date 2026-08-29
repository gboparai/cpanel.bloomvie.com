import {
  Component,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  Input,
  Output,
  EventEmitter,
  effect,
} from '@angular/core';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../common-component/profile/profile.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginService } from '../../login/login.service';
import * as CryptoJS from 'crypto-js';
import { DayCareDashboardService } from './day-care-dashboard.service';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
// import { ViewStudentEnrollmentComponent } from '../student-management/view-student-enrollment/view-student-enrollment.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { JobPortalServiceService } from '../job-portal-details/job-portal-service.service';
import { ClassroomDetailsService } from '../classroom-management/classroom-details/classroom-details.service';
import { ViewStudentEnrollmentService } from '../student-management/view-student-enrollment/view-student-enrollment.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import flatpickr from 'flatpickr';
import { TocViewService } from '../../toc-view/toc-view.service';
import { TocViewComponent } from '../../toc-view/toc-view.component';
import { ViewSupplyRequestComponent } from '../../view-supply-request/view-supply-request.component';
import { WorkTimingService } from '../work-timings/work-timings.service';
import { ManageEventService } from '../../settings/manage-event/manage-event.service';
import { EventsComponent } from '../../common-component/events/events.component';
import { CommonService } from '../../common-component/common.service';
import { SkeletonLoaderComponent } from '../../common-component/skeleton-loader/skeleton-loader.component';
import { HeaderServiceService } from '../../layout/header/header-service.service';
import { TooltipComponent } from '../../common-component/tooltip/tooltip.component';

declare var $: any;
interface ChangeStatus {
  studentID: number;
  requestID: number;
  centreID: number;
  studentName: string;
}

@Component({
  selector: 'app-daycare-dashboard',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    // ViewStudentEnrollmentComponent,
    FullCalendarModule,
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    NgxPaginationModule,
    TocViewComponent,
    ViewSupplyRequestComponent,
    EventsComponent,
    SkeletonLoaderComponent,
    TooltipComponent,
  ],
  providers: [DatePipe],
  templateUrl: './daycare-dashboard.component.html',
  styleUrl: './daycare-dashboard.component.css',
})
export class DaycareDashboardComponent {
  @ViewChild('jobListContainer', { static: false }) jobListContainer:
    | ElementRef
    | undefined;
  readonly rootUrl = environment.apiUrl.slice(0, -3);

  @ViewChild('approvedDate') approvedDateInput!: ElementRef;

  secretKey = 'encrypt!135790';
  CentreID: any;
  FirstName: any;
  UserID: any;
  userRoleID: any;
  loginForm: any;
  token: any;
  DayCareCount: any;
  termsAndCondition: any;
  DayCareDetails: any;
  DayCareId: any;
  ActivityListForDayCare: any;
  unassignedTeachers: any[] = [];
  ContentP: number = 1;
  Contentsize: number = 5;
  ModalList: any[] = [];
  JobList: any;
  classList: any;
  selectedTeacherName: any;
  assignClassForm: any;
  transferRecordList: any[] = [];
  contentSizeCurrentManagement: number = 5;
  disabledStep1: boolean = false;
  disabledStep2: boolean = true;
  contentSizeCurrentManagementCurrentPage: number = 1;
  reason: any;
  teacherID: any;
  selectDate: any;
  reasonTransfer: any;
  date: any;
  StatusList: any[] = [];
  contentSizeRequest: number = 5;
  currentPageRequest: number = 1;
  public isDisabledCondition: boolean = true;
  public studentList: any[] = [];
  readonly ImageRootURL = environment.apiUrl.slice(0, -3);
  private pincode: string = '';
  public AppliedJobTocList: any[] = [];
  public contentTocViewPerPage: number = 5;
  public contentTocCurrentPage: number = 1;
  public TocDetail: any;
  public QualificationList: any[] = [];
  public documentTypeList: any;
  public expertise: any[] = [];
  public activeClassList: any[] = [];
  public isSelectAllActive: boolean = false;
  isDisabled: boolean = false;
  public holidayList: any[] = [];
  TOCUserDetail: any;
  isExpanded: boolean = true;
  selectedWorkingDays: any;
  currentExpandedDay: {
    slotIndex: number;
    dayName: string;
    weekName: string;
  } | null = null;
  uniqueWorkingDayNames: string[] | undefined;
  filteredSlotsByDay: any;
  public enrollmentRequest: any[] = [];
  public studentListItemPerPage: number = 5;
  public studentListCurrentPage: number = 1;

  private statusChangeBO: ChangeStatus[] = [];
  private parentID: number = 0;
  public paymentDetails: any = {};
  public acceptedStudent: any[] = [];
  public discountTypeList: any[] = [
    { label: 'Amount ($)', value: 'amount' },
    { label: 'Percentage (%)', value: 'percentage' },
  ];
  private parsedToken: any;
  public isUpdateCase: boolean = false;

  studentDiscountAppliedForm: any;

  appliedDiscountStudentList: any[] = [];
  skeletonShow = 'Skelton';
  skeletonShow2 = 'Skelton2';
  skeletonShowList = 'SkeltonList';
  skeletonShowCalenderCard = 'SkeltonCalenderCard';
  hoveredRow: any = null;
  skalatonShowCard = 'skalatonShowCard';
  centreName = 'centreName';
  private hasInitialized = false;
  public unassignedTeacherListCurrentPage: number = 1;
  public unassignedTeacherListItemPerPage: number = 5;

  constructor(
    private tocViewservice: TocViewService,
    private cookie: CookieService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private tocregistrationservice: TocRegistrationService,
    private profileService: ProfileService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private viewStudent: ViewStudentEnrollmentService,
    private route: ActivatedRoute,
    private Classroom: ClassroomDetailsService,
    private loginService: LoginService,
    private Toaster: ToastrService,
    private jobPortalservice: JobPortalServiceService,
    private DayCareDashBoard: DayCareDashboardService,
    private datePipe: DatePipe,
    private WorkTimingService: WorkTimingService,
    private service: ManageEventService,
    public onBoardingService: OnboardingService,
    private headerService: HeaderServiceService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.assignClassForm = this.fb.group({
      id: 0,
      classID: '',
      // sectionID: '',
      teacherID: '',
    });

    this.studentDiscountAppliedForm = this.fb.group({
      discountType: [null, Validators.required],
      discountValue: [null, Validators.required],
      studentID: [null, Validators.required],
    });
    effect(() => {
      // if (!this.hasInitialized) {
      //   this.hasInitialized = true;
      //   return;
      // }
      const triggerEffect = this.headerService.triggerEffect();
      const triggerModalValue = this.headerService.triggerModal();
      const accountID = this.onBoardingService.connectedAccountId();
      // const triggerTermsAndCondition =
      //   this.headerService.triggerTermsAndCondition();
      const stripeCount = this.onBoardingService.stripeOnboardingStepsCount();
      if (accountID != '') {
        this.getQueryParams();
      }
      if (triggerModalValue == true && stripeCount == 0) {
        this.stripeOnboardingSteps();
      }
      if (this.termsAndCondition == null) {
        this.isTermAndConditionModalOpen();
      }
    });
  }

  ngOnInit(): void {
    this.getCookie();
    // this.getQueryParams();
    if (this.DayCareId > 0) {
      this.getDayCareByID(this.DayCareId);
      this.getDayCareDashBoardCount(this.DayCareId);
      this.getActivitesByCenterId(this.DayCareId);
      this.getJobList(11);
    }
    this.getQualifications();
    this.getDocumentTypeList();
    this.getAllAreaOfExpertise();
    this.getAllMasterStatus();
    this.getStaffTransferedDetailsByCentreID();
    this.getAllHolidayList();
    this.getAllEnrollmentRequestByCentreID();
    if (this.termsAndCondition) {
      this.headerService.updateTriggerTermsAndCondition();
    }
    // this.isTermAndConditionModalOpen();
  }

  private getQueryParams() {
    const encruptedValue =
      this.route.snapshot.queryParamMap.get('stripeOnboarding');
    const stripeOnboarding = encruptedValue
      ? this.commonService.decrypt(encruptedValue)
      : '';

    const accountID = this.onBoardingService.connectedAccountId();
    const stripestepsCount =
      this.onBoardingService.stripeOnboardingStepsCount();

    if (
      (stripestepsCount == 0 && stripeOnboarding == 'Step1') ||
      (stripestepsCount == 1 && stripeOnboarding == 'Step2')
    ) {
      this.spinner.show();
      this.DayCareDashBoard.updateStripeStepCount(accountID).subscribe(
        (data: any) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
          if (data.success == true) {
            if (stripeOnboarding == 'Step1') {
              this.disabledStep1 = true;
              this.disabledStep2 = false;
              setTimeout(() => {
                this.stripeOnboardingSteps();
              }, 100);
            } else {
              !this.onBoardingService.isOnboardedAccount() &&
                $('#stripeProcessingModal').modal('show');
              // this.disabledStep1 = true;
              // this.disabledStep2 = true;
              // this.stripeOnboardingSteps();
            }
          }
        }
      );
    }
    // Else If Added on 30/07/25 to handle the case where Stripe step 1 is completed,
    // but the user logs in from another tab without completing the onboarding.
    else if (stripestepsCount == 1 && stripeOnboarding == '') {
      this.disabledStep1 = true;
      this.disabledStep2 = false;
      setTimeout(() => {
        this.stripeOnboardingSteps();
      }, 100);
    }
    //end
    else {
      if (
        !this.onBoardingService.isOnboardedAccount() &&
        stripestepsCount == 2
      ) {
        $('#stripeProcessingModal').modal('show');
      }
    }
  }

  private getCookie() {
    var UserDetails = this.cookie.get('UserInfo');
    this.parsedToken = JSON.parse(UserDetails);
    this.DayCareId = this.parsedToken.result.centreID;
    if (this.cookie.check('termAndCondition')) {
      this.termsAndCondition =
        this.cookie.get('termAndCondition') == 'Accepted' ? true : false;
    } else {
      this.termsAndCondition = this.parsedToken.result.termsAndCondition;
    }
    if (this.cookie.check('UserRoleId')) {
      this.userRoleID = this.cookie.get('UserRoleId');
    } else if (this.cookie.check('userRoleID')) {
      this.userRoleID = this.cookie.get('userRoleID');
    }
    this.UserID = this.cookie.get('UserId');
    this.pincode = this.parsedToken.result.pinCode;
  }

  getQualifications() {
    this.tocViewservice.getQualifications().subscribe((data: any) => {
      if (data.message === 'OK') {
        this.QualificationList = data.result;
      }
    });
  }

  AcceptTermsAndConditions(event: any) {
    let checked = event.target.checked;
    if (checked == true) {
      this.isDisabledCondition = false;
    } else {
      this.isDisabledCondition = true;
    }
  }

  stripeOnboardingSteps() {
    if (
      !this.onBoardingService.isOnboardedAccount() &&
      this.termsAndCondition == true
    ) {
      $('#exampleModal48').modal('show');
      this.headerService.updateTriggerModal(false);
    }
  }

  isTermAndConditionModalOpen() {
    // this.onBoardingService.isOnboardedAccount()
    if (
      parseInt(this.userRoleID) == 3 &&
      (this.termsAndCondition == null || this.termsAndCondition == false)
    ) {
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
      .AcceptOrRejectTermsAndCondition(this.UserID, statusID)
      .subscribe(
        (result: any) => {
          this.spinner.hide();
          if (result.message === 'Success') {
            $('#termsCondition').modal('hide');
            this.cookie.set('termAndCondition', result.activity);
            this.getCookie();
            if (result.activity == 'Accepted') {
              Swal.fire(`Terms and Conditions Accepted`, '', 'success').then(
                (next) => {
                  if (next.isConfirmed) {
                    this.headerService.triggerEffect.set(true);
                  }
                }
              );
            } else {
              Swal.fire(`Terms and Conditions Rejected.`, '', 'error').then(
                (next) => {
                  if (next.isConfirmed) {
                    this.loginService.logOut();
                  }
                }
              );
            }

            // Swal.fire(
            //   `Terms and Condition ${result.activity} Successfully`,
            //   '',
            //   'success'
            // ).then(() => {
            //   Swal.fire({
            //     title: 'Onboarding Completed!',
            //     text: 'Your onboarding process has been successfully completed. Create new features!',
            //     icon: 'success',
            //     confirmButtonText: 'Explore Features',
            //     showCancelButton: true,
            //     allowOutsideClick: false,
            //     cancelButtonText: 'Maybe Later',
            //   }).then((next) => {
            //     if (next.isConfirmed) {
            //       this.router.navigate(['/subscription-features']);
            //       this.commonService.updateLoadSideBar();
            //     }
            //   });
            // });
          } else {
            // Optional: Handle failure alert
            Swal.fire('Something went wrong', '', 'error');
          }
        },
        (error) => {
          this.spinner.hide();
          Swal.fire('Server error', '', 'error');
        }
      );
  }

  navigateToStripeOnboarding() {
    window.location.href =
      this.onBoardingService.onboardingState().stripeOnboardingUrl;
    // const adminID = parseInt(this.UserID)
    //   this.commonService.updateIsOnboarding(adminID).subscribe((response:any)=>{
    //     if(response.message=="Success"){

    //     }
    //   });
  }

  //Applying discount to Student
  // AddDiscount() {

  //   if (this.studentDiscountAppliedForm.valid) {
  //     let studentIndividualPlanPrice =
  //       this.paymentDetails.totalAmountPaid / this.acceptedStudent.length;
  //     let isRecordExists = this.appliedDiscountStudentList.some(
  //       (item: any) =>
  //         item.studentID == this.studentDiscountAppliedForm.value.studentID
  //     );

  //     if (!isRecordExists) {
  //       const discountListObj = this.studentDiscountAppliedForm.value;
  //       let studentName = this.acceptedStudent.find(
  //         (item: any) => item.studentID == discountListObj.studentID
  //       )?.studentFullName;

  //       discountListObj['planName'] = this.paymentDetails.planName;
  //       discountListObj['planPrice'] = this.paymentDetails.planPrice;
  //       discountListObj['studentName'] = studentName;

  //       let totalAmount: number = 0;

  //       if (discountListObj.discountType == 'amount') {
  //         let calDiscountPercentage = Math.round(
  //           (discountListObj.discountValue / studentIndividualPlanPrice) * 100
  //         );
  //         totalAmount =
  //           studentIndividualPlanPrice - discountListObj.discountValue;

  //         discountListObj['discountPercentage'] = calDiscountPercentage;

  //         discountListObj['discountAmount'] = discountListObj.discountValue;
  //       } else {
  //         let totalDiscountAmount = Math.round(
  //           (discountListObj.planPrice * discountListObj.discountValue) / 100
  //         );
  //         totalAmount = studentIndividualPlanPrice - totalDiscountAmount;

  //         discountListObj['discountAmount'] = totalDiscountAmount;
  //       }

  //       discountListObj['totalAmount'] = totalAmount;

  //       this.paymentDetails['totalDiscountAmount'] = this.paymentDetails[
  //         'totalDiscountAmount'
  //       ]
  //         ? totalAmount + this.paymentDetails['totalDiscountAmount']
  //         : totalAmount;

  //       this.appliedDiscountStudentList.push(discountListObj);

  //       this.studentDiscountAppliedForm.reset();
  //     } else {
  //       if (this.isUpdateCase == true) {
  //         let studentRecord = this.appliedDiscountStudentList.find(
  //           (item: any) =>
  //             item.studentID == this.studentDiscountAppliedForm.value.studentID
  //         );
  //         studentRecord['discountType'] =
  //           this.studentDiscountAppliedForm.value.discountType;
  //         studentRecord['discountValue'] =
  //           this.studentDiscountAppliedForm.value.discountValue;

  //         let previousTotalAmount =
  //           this.paymentDetails['totalDiscountAmount'] -
  //           studentRecord.totalAmount;

  //         let totalAmount = 0;
  //         if (studentRecord.discountType == 'amount') {
  //           totalAmount =
  //             studentIndividualPlanPrice - studentRecord.discountValue;

  //           let calDiscountPercentage = Math.round(
  //             (studentRecord.discountValue / studentIndividualPlanPrice) * 100
  //           );
  //           studentRecord['discountPercentage'] = calDiscountPercentage;
  //         } else {
  //           let totalDiscountAmount = Math.round(
  //             (studentRecord.planPrice * studentRecord.discountValue) / 100
  //           );
  //           totalAmount = studentIndividualPlanPrice - totalDiscountAmount;
  //         }

  //         studentRecord['totalAmount'] = totalAmount;

  //         previousTotalAmount = previousTotalAmount + totalAmount;

  //         this.paymentDetails['totalDiscountAmount'] = previousTotalAmount;

  //         this.isDisabled = false;
  //         this.isUpdateCase = false;
  //         this.studentDiscountAppliedForm.reset();
  //       } else {
  //         this.studentDiscountAppliedForm.reset();
  //         Swal.fire('Record Already Exists !!', '', 'error');
  //       }
  //     }
  //   } else {
  //     this.studentDiscountAppliedForm.markAllAsTouched();
  //   }
  // }

  AddDiscount() {
    if (this.studentDiscountAppliedForm.valid) {
      let studentIndividualPlanPrice =
        this.paymentDetails.totalAmountPaid / this.acceptedStudent.length;
      let isRecordExists = this.appliedDiscountStudentList.some(
        (item: any) =>
          item.studentID == this.studentDiscountAppliedForm.value.studentID
      );

      if (!isRecordExists) {
        const discountListObj = this.studentDiscountAppliedForm.value;
        let studentName = this.acceptedStudent.find(
          (item: any) => item.studentID == discountListObj.studentID
        )?.studentFullName;

        discountListObj['planName'] = this.paymentDetails.planName;
        discountListObj['planPrice'] = this.paymentDetails.planPrice;
        discountListObj['studentName'] = studentName;

        let totalAmount: number = 0;

        if (discountListObj.discountType == 'amount') {
          //Commented on 16/06/25
          // let calDiscountPercentage = Math.round((discountListObj.discountValue / studentIndividualPlanPrice) * 100 );
          let calDiscountPercentage =
            (discountListObj.discountValue.toFixed(2) /
              studentIndividualPlanPrice) *
            100;
          totalAmount =
            studentIndividualPlanPrice - discountListObj.discountValue;
          discountListObj['discountPercentage'] = calDiscountPercentage;
          discountListObj['discountAmount'] =
            discountListObj.discountValue.toFixed(2);
        } else {
          //Commented on 16/06/25
          // let totalDiscountAmount = Math.round((discountListObj.planPrice * discountListObj.discountValue) / 100 );
          const totalDiscountAmount =
            (discountListObj.planPrice * discountListObj.discountValue) / 100;
          totalAmount = studentIndividualPlanPrice - totalDiscountAmount;
          discountListObj['discountAmount'] = totalDiscountAmount.toFixed(2);
        }
        discountListObj['totalAmount'] = totalAmount.toFixed(2);

        this.paymentDetails['totalDiscountAmount'] = this.paymentDetails[
          'totalDiscountAmount'
        ]
          ? totalAmount.toFixed(2) + this.paymentDetails['totalDiscountAmount']
          : totalAmount.toFixed(2);
        this.appliedDiscountStudentList.push(discountListObj);
        this.studentDiscountAppliedForm.reset();
      } else {
        if (this.isUpdateCase == true) {
          let studentRecord = this.appliedDiscountStudentList.find(
            (item: any) =>
              item.studentID == this.studentDiscountAppliedForm.value.studentID
          );
          studentRecord['discountType'] =
            this.studentDiscountAppliedForm.value.discountType;
          studentRecord['discountValue'] =
            this.studentDiscountAppliedForm.value.discountValue;

          let previousTotalAmount =
            this.paymentDetails['totalDiscountAmount'] -
            studentRecord.totalAmount;

          let totalAmount = 0;
          if (studentRecord.discountType == 'amount') {
            totalAmount =
              studentIndividualPlanPrice - studentRecord.discountValue;

            let calDiscountPercentage = Math.round(
              (studentRecord.discountValue / studentIndividualPlanPrice) * 100
            );
            studentRecord['discountPercentage'] = calDiscountPercentage;
          } else {
            let totalDiscountAmount = Math.round(
              (studentRecord.planPrice * studentRecord.discountValue) / 100
            );
            totalAmount = studentIndividualPlanPrice - totalDiscountAmount;
          }

          studentRecord['totalAmount'] = totalAmount;

          previousTotalAmount = previousTotalAmount + totalAmount;
          this.paymentDetails['totalDiscountAmount'] = previousTotalAmount;

          this.isDisabled = false;
          this.isUpdateCase = false;
          this.studentDiscountAppliedForm.reset();
        } else {
          this.studentDiscountAppliedForm.reset();
          Swal.fire('Record Already Exists !!', '', 'error');
        }
      }
    } else {
      this.studentDiscountAppliedForm.markAllAsTouched();
    }
  }

  updateDiscountRecord(index: number) {
    this.isUpdateCase = true;
    this.isDisabled = true;
    let studentDiscountRecord = this.appliedDiscountStudentList[index];
    this.studentDiscountAppliedForm.patchValue({
      studentID: studentDiscountRecord.studentID,
      discountValue: studentDiscountRecord.discountValue,
      discountType: studentDiscountRecord.discountType,
    });
  }

  deleteDiscountRecord(index: number) {
    let studentDiscount = this.appliedDiscountStudentList[index].totalAmount;

    this.paymentDetails['totalDiscountAmount'] =
      this.paymentDetails['totalDiscountAmount'] - studentDiscount;

    this.appliedDiscountStudentList.splice(index, 1);
  }

  getAllHolidayList() {
    this.skeletonShowCalenderCard = 'SkeltonCalenderCard';
    this.WorkTimingService.getCentreHolidayList(this.DayCareId).subscribe(
      (data: any) => {
        if (data.message == 'Success') {
          this.holidayList = data.result;
          this.skeletonShowCalenderCard = '';
        } else {
          this.holidayList = [];
          this.skeletonShowCalenderCard = '';
        }
      }
    );
  }

  getAllAreaOfExpertise() {
    this.tocregistrationservice
      .getAllAreaOfExpertise()
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          this.expertise = result.result.filter(
            (item: any) => item.isActive == true
          );
        }
      });
  }

  getByIDForView(id: any) {
    // this.spinner.show();
    this.TocDetail = {};
    this.tocViewservice.getAppliedJobTOByID(id, this.DayCareId).subscribe(
      (data: any) => {
        if (data.message === 'ok' && data.result && data.result.length > 0) {
          this.TocDetail = data.result[0];
          // ✅ Convert S3 file paths
          this.TocDetail.Educational_Credentails = this.TocDetail
            .educational_Credentails
            ? this.commonService.convertS3File(
              this.TocDetail.educational_Credentails
            )
            : '';

          this.TocDetail.DocumentResumes = this.TocDetail.documentResumes
            ? this.commonService.convertS3File(this.TocDetail.documentResumes)
            : '';

          this.TocDetail.UploadedDocument = this.TocDetail.uploadedDocument
            ? this.commonService.convertS3File(this.TocDetail.uploadedDocument)
            : '';

          // ✅ Qualification handling
          if (this.QualificationList && this.TocDetail.qualification) {
            const qualificationIds = this.TocDetail.qualification
              .split(',')
              .map((id: string) => parseInt(id, 10));
            this.TocDetail.qualificationNames = this.QualificationList.filter(
              (item: any) => qualificationIds.includes(item.id)
            )
              .map((item: any) => item.name)
              .join(', ');
          } else {
            this.TocDetail.qualificationNames = 'No qualifications listed';
          }

          // ✅ Working days
          if (this.TocDetail.workingDays) {
            const workingDayIds = this.TocDetail.workingDays
              .split(',')
              .map((day: string) => parseInt(day, 10));
            const daysOfWeekMapping: any = {
              1: 'Monday',
              2: 'Tuesday',
              3: 'Wednesday',
              4: 'Thursday',
              5: 'Friday',
              6: 'Saturday',
              7: 'Sunday',
            };

            this.TocDetail.workingDaysNames = workingDayIds
              .map((id: number) => daysOfWeekMapping[id])
              .filter((day: string | undefined) => day)
              .join(', ');
          } else {
            this.TocDetail.workingDaysNames = 'No working days listed';
          }

          // ✅ Document type
          if (
            this.TocDetail.uploadedDocumentType &&
            this.TocDetail.uploadedDocumentType.length > 0
          ) {
            const documentTypeIds = this.TocDetail.uploadedDocumentType[0];
            this.TocDetail.documentTypeNames =
              this.documentTypeList && Array.isArray(this.documentTypeList)
                ? this.documentTypeList.find(
                  (item) => item.id === documentTypeIds
                )?.documentType || 'Unknown Document Type'
                : 'Unknown Document Type';
          } else {
            this.TocDetail.documentTypeNames = 'No document types listed';
          }

          // ✅ Expertise
          if (this.TocDetail.expertise) {
            let expertiseIds: number[] = [];

            if (typeof this.TocDetail.expertise === 'string') {
              expertiseIds = this.TocDetail.expertise
                .split(',')
                .map((id: string) => parseInt(id, 10));
            } else if (typeof this.TocDetail.expertise === 'number') {
              expertiseIds = [this.TocDetail.expertise];
            } else if (Array.isArray(this.TocDetail.expertise)) {
              expertiseIds = this.TocDetail.expertise.map((id: any) =>
                Number(id)
              );
            }

            if (
              this.expertise &&
              Array.isArray(this.expertise) &&
              expertiseIds.length > 0
            ) {
              this.TocDetail.expertiseNames = this.expertise
                .filter((item: any) => expertiseIds.includes(item.id))
                .map((item: any) => item.name)
                .join(', ');
            } else {
              this.TocDetail.expertiseNames = 'No expertise listed';
            }
          } else {
            this.TocDetail.expertiseNames = 'No expertise listed';
          }

          this.spinner.hide();
        } else {
          this.TocDetail = [];
          this.spinner.hide();
        }
      },
      (error) => {
        this.spinner.hide();
        this.TocDetail = [];
      }
    );
  }

  rejectStudentList() {
    if (this.statusChangeBO.length > 0) {
      Swal.fire({
        title: 'Do you want to Reject the Enrollment Request !!',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: 'No',
        confirmButtonText: 'Yes',
      }).then((result: any) => {
        if (result.isConfirmed) {
          $('#viewStudentListModal').modal('hide');
          Swal.fire({
            title: 'Enter Reason for Rejection',
            input: 'textarea',
            inputPlaceholder: 'Type your reason here...',
            inputAttributes: {
              'aria-label': 'Type your reason here',
            },
            showDenyButton: true,
            denyButtonColor: '#6c757d',
            denyButtonText: 'Cancel',
            preConfirm: (inputValue: string) => {
              if (!inputValue || inputValue.trim() === '') {
                Swal.showValidationMessage(
                  'Reason for rejection cannot be empty!'
                );
                return false;
              }
              return inputValue;
            },
          }).then(async (reasonResult: any) => {
            if (reasonResult.isConfirmed && reasonResult.value) {
              let StatusID = 2;
              let reason = reasonResult.value;
              let response =
                await this.DayCareDashBoard.AcceptOrRejectEnrollmentRequest(
                  this.statusChangeBO,
                  StatusID,
                  reason,
                  this.parentID
                ).toPromise();
              if (response.message == 'Success') {
                setTimeout(() => {
                  this.spinner.hide();
                }, 100);
                $('#viewStudentListModal').modal('hide');
                Swal.fire('Students Rejected Successfully', '', 'success');
                this.getAllEnrollmentRequestByCentreID();
              } else {
                this.spinner.hide();
                this.Toaster.error(response.message);
              }
            } else if (reasonResult.isDenied) {
              $('#viewStudentListModal').modal('show');
            }
          });
        }
      });
    } else {
      this.Toaster.warning('Please select At Least one Student!!');
    }
  }

  isActivePaymentDetails(enrollment: any): boolean {
    let isStudentAccepted = enrollment.students.find(
      (item: any) => item.statusID == 6 && item.isPaymentSend == false
    );
    return isStudentAccepted ? true : false;
  }

  AcceptStudentList() {
    if (this.statusChangeBO.length > 0) {
      Swal.fire({
        title: 'Do you want to Accept the Enrollment Request !!',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: 'No',
        confirmButtonText: 'Yes',
      }).then(async (result: any) => {
        if (result.isConfirmed) {
          this.spinner.show();
          let StatusID = 6;
          let reason = '';
          let response =
            await this.DayCareDashBoard.AcceptOrRejectEnrollmentRequest(
              this.statusChangeBO,
              StatusID,
              reason,
              this.parentID
            ).toPromise();
          if (response.message == 'Success') {
            setTimeout(() => {
              this.spinner.hide();
            }, 100);
            $('#viewStudentListModal').modal('hide');
            Swal.fire('Students Accepted Successfully', '', 'success');
            this.getAllEnrollmentRequestByCentreID();
          } else {
            this.spinner.hide();
            this.Toaster.error(response.message);
          }
        }
      });
    } else {
      this.Toaster.warning('Please select At Least one Student!!');
    }
  }

  async getClassList(ageGroupID: number) {
    this.skeletonShow2 = 'Skelton2';
    this.activeClassList = [];

    let data = await this.DayCareDashBoard.getClassListDropdownByAgeGroup(
      this.DayCareId,
      ageGroupID
    ).toPromise();
    if (data.message == 'Success') {
      this.activeClassList = data.result;
      this.skeletonShow2 = '';
    } else {
      this.skeletonShow2 = '';
    }
  }

  // getStudentRecords(enrollment: any) {

  //   this.studentList = [];
  //   this.statusChangeBO = [];
  //   this.parentID = enrollment.parentID;
  //   this.studentList = enrollment.students;

  //   let isSelectAll = this.studentList.find((item: any) => item.statusID == 3);
  //   this.isSelectAllActive = isSelectAll ? true : false;
  //   $('#viewStudentListModal').modal('show');
  // }

  getStudentRecords(enrollment: any) {
    this.studentList = [];
    this.statusChangeBO = [];
    this.parentID = enrollment.parentID;
    this.studentList = enrollment.students;

    this.studentList = this.studentList.map((item: any) => {
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

    let isSelectAll = this.studentList.find((item: any) => item.statusID == 3);
    this.isSelectAllActive = isSelectAll ? true : false;
    $('#viewStudentListModal').modal('show');
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

  getDocumentTypeList() {
    this.tocViewservice.getDocumentTypeList().subscribe({
      next: (response: any) => {
        if (response.message === 'OK') {
          this.documentTypeList = response.result;
        }
        setTimeout(() => { }, 300);
      },
      error: (err: any) => {
        this.Toaster.error(err.message);
      },
    });
  }

  downloadFile(fileUrl: any) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    link.click();
  }

  isCentreIdInRequest(requestByDayCare: string | null | undefined): boolean {
    return (
      requestByDayCare?.split(',').includes(this.CentreID?.toString() || '') ??
      false
    );
  }

  isCentreIdRejected(rejectedByUser: string | null | undefined): boolean {
    return (
      rejectedByUser?.split(',').includes(this.CentreID?.toString() || '') ??
      false
    );
  }

  bindGridClick(
    slotDetail: any,
    dayName: string,
    slotIndex: number,
    weekName: string
  ) {
    // this.isExpanded = false;
    if (
      this.currentExpandedDay &&
      this.currentExpandedDay.slotIndex === slotIndex &&
      this.currentExpandedDay.dayName === dayName
    ) {
      //Commnented on 04/02/25
      // this.currentExpandedDay = null;
    } else {
      this.currentExpandedDay = { slotIndex, dayName, weekName };
    }
    this.filteredSlotsByDay = this.getFilteredSlots(slotDetail, dayName);
    for (let i = 0; i < this.filteredSlotsByDay.length; i++) {
      this.filteredSlotsByDay[i].StatusName = this.filterStatus(
        this.filteredSlotsByDay[i].statusId
      );
    }
  }

  onPlusClick(slotDetail: any, index: number) {
    if (
      this.currentExpandedDay?.slotIndex === index &&
      this.currentExpandedDay?.weekName === slotDetail.weekName
    ) {
      this.currentExpandedDay = null;
    } else {
      this.currentExpandedDay = {
        slotIndex: index,
        weekName: slotDetail.weekName,
        dayName: '',
      };
      this.uniqueWorkingDayNames = Array.from(
        new Set(slotDetail?.slots?.map((slot: any) => slot.workingDayName))
      );

      const slotsByDay: { [key: string]: any[] } = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };

      slotDetail.slots.forEach((slot: any) => {
        const dayName = slot.workingDayName;
        if (slotsByDay[dayName]) {
          slotsByDay[dayName].push(slot);
        }
      });
    }
  }

  reset() {
    this.paymentDetails = {};
    $('#plan-details').modal('hide');
  }

  daysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
  }

  setPaymentDetails(enrollment: any) {
    this.paymentDetails = enrollment;
    this.acceptedStudent = enrollment.students.filter(
      (item: any) => item.statusID == 6
    );
    this.paymentDetails['studentCount'] = this.acceptedStudent.length;

    let date = new Date();
    let startDate = this.datePipe.transform(date, 'MM/dd/YYYY');

    let daysInMonth: number = this.daysInMonth(
      date.getFullYear(),
      date.getMonth() + 1
    );

    let perDayPrice = Math.trunc(enrollment.planPrice / daysInMonth);

    let numberOfDaysLeft = daysInMonth - date.getDate();

    let endDate = new Date();
    endDate.setDate(endDate.getDate() + numberOfDaysLeft);

    let formattedEndDate = this.datePipe.transform(endDate, 'MM/dd/YYYY');

    this.paymentDetails['startDate'] = startDate;
    this.paymentDetails['endDate'] = formattedEndDate;

    let totalAmountForOneChild = (numberOfDaysLeft + 1) * perDayPrice;
    this.paymentDetails['totalAmountPaid'] =
      totalAmountForOneChild * this.acceptedStudent.length;

    this.paymentDetails['amountPerStudent'] = totalAmountForOneChild;
    setTimeout(() => {
      $('#plan-details').modal('show');
    }, 0);
  }

  resetDiscountButton() {
    this.isUpdateCase = false;
    this.studentDiscountAppliedForm.reset();
  }

  sendPaymentMail() {
    this.spinner.show();

    let studentList: any[] = [];
    let totalDiscountAmount = 0;
    let acceptedStudentList: any[] = this.paymentDetails.students
      .filter((item: any) => item.statusID == 6)
      .map((data: any) => {
        return {
          studentID: data.studentID,
          studentName: data.studentLastName
            ? data.studentFirstName + ' ' + data.studentLastName
            : data.studentFirstName,
          totalPaidAmount: this.paymentDetails.amountPerStudent,
        };
      });

    this.appliedDiscountStudentList.forEach((item: any) => {
      totalDiscountAmount = item.discountAmount + totalDiscountAmount;

      let isExists = acceptedStudentList.some(
        (record: any) => record.studentID == item.studentID
      );

      if (isExists) {
        acceptedStudentList = acceptedStudentList.filter(
          (record: any) => record.studentID != item.studentID
        );
      }

      const obj = {
        studentID: item.studentID,
        studentName: item.studentName,
        discountPercentage:
          item.discountType == 'amount'
            ? item.discountPercentage
            : item.discountValue,
        discountValue: item.discountValue,
        discountType: item.discountType,
        totalPaidAmount: item.totalAmount,
      };

      studentList.push(obj);
    });

    studentList.push(...acceptedStudentList);

    let paymentEmailBO = {
      centreID: this.DayCareId,
      parentID: this.paymentDetails.parentID,
      planID: this.paymentDetails.planID,
      daycareID: this.UserID,
      startDate: this.paymentDetails.startDate,
      endDate: this.paymentDetails.endDate,
      totalAmountPaid: this.paymentDetails.totalDiscountAmount
        ? this.paymentDetails.totalDiscountAmount +
        this.paymentDetails.amountPerStudent * acceptedStudentList.length
        : this.paymentDetails.totalAmountPaid,
      isDiscountApplied:
        this.appliedDiscountStudentList.length > 0 ? true : false,
      TotalDiscountAmount: totalDiscountAmount,
      studentList:
        studentList.length > 0
          ? studentList
          : this.paymentDetails.students
            .filter((item: any) => item.statusID == 6)
            .map((data: any) => {
              return {
                studentID: data.studentID,
                studentName: data.studentLastName
                  ? data.studentFirstName + ' ' + data.studentLastName
                  : data.studentFirstName,
              };
            }),
    };

    this.DayCareDashBoard.sendPaymentEmailToParent(paymentEmailBO).subscribe(
      (response: any) => {
        if (response.message == 'Success') {
          this.getAllEnrollmentRequestByCentreID();
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
          this.resetDiscountButton();
          this.appliedDiscountStudentList = [];
          $('#plan-details').modal('hide');
          Swal.fire('Email Send Successfully', '', 'success');
        } else {
          this.spinner.hide();
          this.Toaster.error(response.message);
        }
      }
    );
  }

  SendTOCRequestToUser(slotid: any) {
    this.tocViewservice
      .SendTOCRequestToUser(slotid, this.UserID)
      .subscribe((data) => {
        if (data.message == 'OK') {
          this.Toaster.success(data.activity);
          $('#staticBackdropEdit').modal('hide');
        } else {
          this.Toaster.success(data.activity);
        }
      });
  }

  getTOCUserDetailByID(userid: any) {
    // this.spinner.show();
    this.tocregistrationservice
      .getTOCUserDetailByID(userid, this.DayCareId)
      .subscribe(
        (data) => {
          if (data.message === 'ok') {
            this.TOCUserDetail = data.result.slotsGroupedByWeek;
            if (this.isExpanded) {
              if (data.result.workingDays) {
                const daysOfWeekMapping: { [key: string]: string } = {
                  // 0: 'Sunday',
                  1: 'Monday',
                  2: 'Tuesday',
                  3: 'Wednesday',
                  4: 'Thursday',
                  5: 'Friday',
                  6: 'Saturday',
                  7: 'Sunday',
                };
                this.selectedWorkingDays = data.result.workingDays
                  .split(',')
                  .map((day: string | number) => daysOfWeekMapping[+day]);
              }
              this.expandFirstRecord();
            }
            // this.spinner.hide();
          } else {
            this.TOCUserDetail = [];
            // this.spinner.hide();
          }
        },
        (error: any) => {
          // console.error('Error occurred while checking email:', error);
        }
      );
  }

  selectSingleRecord(studentRecord: any, event: any, index: number) {
    let checked = event.target.checked;
    if (checked == true) {
      let fullName = studentRecord.studentLastName
        ? (studentRecord.studentFirstName || '') +
        ' ' +
        studentRecord.studentLastName
        : '';
      let statusChangeObj: ChangeStatus = {
        studentID: studentRecord.studentID,
        requestID: studentRecord.requestID,
        studentName: fullName,
        centreID: this.DayCareId,
      };

      this.statusChangeBO.push(statusChangeObj);
    } else {
      this.statusChangeBO.splice(index, 1);
    }
  }

  selectAll(event: any) {
    let checked = event.target.checked;
    if (checked == true) {
      this.statusChangeBO = [];
      this.statusChangeBO = this.studentList.map((item: any) => {
        let fullName = item.studentLastName
          ? (item.studentFirstName || '') + ' ' + item.studentLastName
          : '';
        return {
          studentID: item.studentID,
          requestID: item.requestID,
          studentName: fullName,
          centreID: this.DayCareId,
        };
      });
    } else {
      this.statusChangeBO = [];
    }
  }

  isSelectAllChecked(): boolean {
    if (this.statusChangeBO.length == this.studentList.length) {
      return true;
    } else {
      return false;
    }
  }

  isChecked(studentRecord: any): boolean {
    let isExists = this.statusChangeBO.find(
      (item: any) => item.studentID == studentRecord.studentID
    );
    if (isExists) {
      return true;
    } else {
      return false;
    }
  }

  async getAllEnrollmentRequestByCentreID() {
    this.skeletonShow = 'Skelton';
    this.enrollmentRequest = [];
    let data = await this.DayCareDashBoard.getAllEnrollmentRequestByCentreID(
      this.DayCareId,
      false,
      ''
    ).toPromise();
    if (data.message == 'Success') {
      this.enrollmentRequest = data.result;
      this.skeletonShow = '';
    } else {
      this.skeletonShow = '';
    }
  }

  expandFirstRecord() {
    if (this.TOCUserDetail && this.TOCUserDetail.length > 0) {
      const firstSlot = this.TOCUserDetail[0];
      if (
        firstSlot &&
        this.selectedWorkingDays &&
        this.selectedWorkingDays.length > 0
      ) {
        this.currentExpandedDay = {
          slotIndex: 0,
          dayName: this.selectedWorkingDays[0],
          weekName: firstSlot.weekName,
        };
        this.uniqueWorkingDayNames = Array.from(
          new Set(
            this.TOCUserDetail[0]?.slots?.map(
              (slot: any) => slot.workingDayName
            )
          )
        );
        this.filteredSlotsByDay = this.getFilteredSlots(
          this.TOCUserDetail[0],
          this.currentExpandedDay.dayName
        );
        for (let i = 0; i < this.filteredSlotsByDay.length; i++) {
          this.filteredSlotsByDay[i].StatusName = this.filterStatus(
            this.filteredSlotsByDay[i].statusId
          );
        }
      }
    }
  }

  getAllMasterStatus() {
    this.tocregistrationservice.getAllMasterStatus().subscribe((data) => {
      if (data.message == 'OK') this.StatusList = data.result;
    });
  }

  filterStatus(StatusId: any): string | null {
    const status = this.StatusList.find(
      (data: { id: any }) => data.id === StatusId
    );
    return status ? status.status : null;
  }

  getFilteredSlots(slotDetail: any, dayName: string) {
    return slotDetail.slots.filter(
      (slot: any) => slot.workingDayName === dayName
    );
  }

  getDayCareByID(DayCareId: any) {
    this.centreName = 'centreName';
    this.DayCareDashBoard.getDayCareByID(DayCareId).subscribe((data: any) => {
      if (data.message == 'Success') {
        this.DayCareDetails = data.result;
        this.centreName = '';
      }
    });
  }

  getStaffTransferedDetailsByCentreID() {
    this.skeletonShow = 'Skelton';
    var status = 'pending';
    var type = 'transferedStaff';
    this.DayCareDashBoard.getStaffTransferedDetailsByCentreID(
      parseInt(this.DayCareId),
      parseInt(this.userRoleID),
      status,
      type
    ).subscribe((response: any) => {
      if (response.message == 'Success') {
        this.transferRecordList = response.result;
        this.skeletonShow = '';
      } else {
        this.transferRecordList = [];
        this.skeletonShow = '';
      }
    });
  }

  getAppliedJobTOCList(status: string) {
    let statusID = status == 'Accepted' ? 6 : 0;
    this.tocViewservice
      .getAppliedJobTOCList('', statusID, this.DayCareId)
      .subscribe((data: any) => {
        if (data.message == 'ok') {
          this.AppliedJobTocList = data.result;
        }
      });
  }

  getDayCareDashBoardCount(DayCareId: any) {
    this.skalatonShowCard = 'skalatonShowCard';

    this.DayCareDashBoard.getDayCareDashBoardCount(DayCareId).subscribe(
      (data: any) => {
        if (data.message == 'OK') {
          this.DayCareCount = data.result;
          this.unassignedTeachers = data.result.unassignedTeachers;
          this.skalatonShowCard = '';
        } else {
          this.skalatonShowCard = '';
        }
      }
    );
  }

  getJobList(status: any) {
    status = parseInt(status);
    this.jobPortalservice
      .getAppliedJobPosting(this.DayCareId, '', '', 'shortlisted')
      .subscribe((data) => {
        if (data.message == 'ok') {
          this.JobList = data.result;
        } else if (data.message == 'No records found') {
          this.JobList = [];
        }
      });
  }

  async ApprovedTransferEmployee() {
    Swal.fire({
      html: `
        <div class="swal-static-container">
          <div class="swal2-icon swal2-question " style="display: flex;  !important;">
            <div class="swal2-icon-content">?</div> 
          </div>
          <div class="swal-static-content">
            <h2 class="swal-static-title">Confirmation</h2>
            <p class="swal-static-text">Please confirm if you would like to approve this candidate.</p>
          </div>
        </div>
      `,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
    }).then((result) => {
      if (result.isConfirmed) {
        setTimeout(() => {
          this.ApprovedRejectTransferEmployee(1);
          $('#modalOpen').modal('hide');
          this.approvedDateInput.nativeElement.value = '';
        }, 500);
      }
    });
  }

  clearSelectDate() {
    this.selectDate = '';
    this.approvedDateInput.nativeElement.value = '';
    this.teacherID = [];
    this.DayCareId = [];
    this.reason = [];
    this.selectDate = [];
  }

  RejectTransferEmployee() {
    $('#modalOpen').modal('hide');

    Swal.fire({
      title: 'Reject Transfer Request',
      input: 'textarea',
      inputPlaceholder: 'Enter reason for rejection...',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.reasonTransfer = result.value;

        this.ApprovedRejectTransferEmployee(2);

        setTimeout(() => {
          $('#modalOpen').modal('hide');
          if (this.approvedDateInput) {
            this.approvedDateInput.nativeElement.value = '';
          }
        }, 300);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // If the user clicks cancel, reopen the modal
        $('#modalOpen').modal('show');
      }
    });
  }

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.isTermAndConditionModalOpen();
    // }, 100);
    const currentDate = new Date();
    flatpickr('#approvedDate', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: currentDate,
    });
  }

  onSelectDate(event: any) {
    this.selectDate = event.target.value;
  }

  teacherApproved(data: any) {
    this.teacherID = data;
    $('#modalOpen').modal('show');
  }

  ApprovedRejectTransferEmployee(statusID: any) {
    this.spinner.show();
    if (statusID == 2) {
      this.date = '';
    }

    if (statusID == 1) {
      this.date = this.selectDate;
    }

    this.DayCareDashBoard.manageTransferApprovedEmployee(
      this.teacherID,
      this.DayCareId,
      statusID,
      this.reasonTransfer,
      this.date
    ).subscribe((response: any) => {
      if (response.message == 'Success') {
        this.getStaffTransferedDetailsByCentreID();
        this.spinner.hide();
        const statusMessages: any = {
          1: {
            icon: 'success',
            title: 'Employee Approved',
            text: 'The employee transfer request has been approved successfully.',
            color: '#3085d6',
          },
          2: {
            icon: 'error',
            title: 'Employee Rejected',
            text: 'The employee transfer request has been rejected.',
            color: '#d33',
          },
        };
        if (statusMessages[statusID]) {
          Swal.fire({
            icon: statusMessages[statusID].icon,
            title: statusMessages[statusID].title,
            text: statusMessages[statusID].text,
            confirmButtonColor: statusMessages[statusID].color,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => { });
        }
      } else {
        this.spinner.hide();
      }
    });
  }

  setDefaultValue(teacher: any) {
    this.selectedTeacherName = teacher.name;

    // Patch the teacher ID to the form
    this.assignClassForm.patchValue({
      teacherID: teacher.id,
      // sectionID: this.selecteedSection
    });

    //get class List

    this.Classroom.getClassListByCentreId(this.DayCareId).subscribe((data) => {
      this.classList = data.result;
    });
  }

  resetDropdown() {
    this.classList = [];
    this.selectedTeacherName = '';
  }

  onSubmit() {
    // this.assignClassForm.patchValue({
    //   sectionID: this.selecteedSection
    // });

    this.viewStudent
      .assignTeacherForClass(this.assignClassForm.value)
      .subscribe((response) => {
        if (response.message == 'OK') {
          this.Toaster.success('Class Assigned Successfully !', 'Success');
          this.SelectedTeacher(this.assignClassForm.teacherID);
          this.assignClassForm.patchValue({
            classID: '',
          });
          $('#exampleModal45').modal('hide');
          $('#exampleModal2').modal('hide');
          // this.getStudentDetails(this.daycareID);
        } else if (response.message == 'Duplicate entry exists') {
          this.Toaster.warning('Teacher is already Assigned to this section');
          this.assignClassForm.patchValue({
            classID: '',
          });
          $('#exampleModal45').modal('hide');

          $('#exampleModal2').modal('hide');
        } else {
          this.Toaster.error(response.message, 'Error');
        }
      });
  }

  SelectedTeacher(teacherId: any) {
    this.ModalList = this.JobList.filter((x: any) => x.teacherId === teacherId);
  }

  getActivitesByCenterId(DayCareId: any) {
    this.skeletonShowList = 'SkeltonList';
    this.DayCareDashBoard.getActivitesByCenterId(DayCareId).subscribe(
      (data) => {
        if (data.message == 'OK') {
          this.ActivityListForDayCare = data.result;
          this.skeletonShowList = '';
        }
        this.skeletonShowList = '';
      }
    );
  }

  scrollToPendingApproval(): void {
    if (this.jobListContainer) {
      this.jobListContainer.nativeElement.scrollIntoView({
        behavior: 'smooth', // Enables smooth scrolling
        block: 'start', // Scroll to the top of the element
      });
    }
  }
}
