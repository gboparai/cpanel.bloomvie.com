import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { LoginService } from './login.service';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule, DatePipe } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ProfileService } from '../common-component/profile/profile.service';

import * as CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';
import { promises } from 'node:dns';
import { environment } from '../../environments/environment';
import { ApplicationServiceService } from '../application-status/application-service.service';
import { AppService } from '../app.service';
import { CommonService } from '../common-component/common.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { OnboardingService } from '../onboarding/onboarding.service';
import { lastValueFrom, firstValueFrom, finalize, catchError, of } from 'rxjs';
import { response } from 'express';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { NgxPaginationModule } from 'ngx-pagination';
import flatpickr from 'flatpickr';
import { TimeFormatAmPmPipe } from '../bloomvie-management/dc-appointments-list/time-format.pipe';
import { TooltipComponent } from '../common-component/tooltip/tooltip.component';
declare var $: any;

@Component({
  selector: 'app-login',
  providers: [provideAnimations(), DatePipe],
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule,
    NgxSpinnerModule,
    CommonModule,
    ForgotPasswordComponent,
    NgSelectModule,
    NgxPaginationModule,
    TimeFormatAmPmPipe,
    TooltipComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  frontendWebUrl: string = environment.frontEndWebUrl;

  loginForm: FormGroup;
  rememberMe: boolean = false;
  UserId: any;
  showForgotPassword: boolean = false;
  isEmailFocused: any;
  centreID: any;
  secretKey = 'encrypt!135790';
  firstName: any;
  lastName: any;
  token: string | null = '';
  UserEmail: any;
  Password: any;
  passwordField: any = 'password';
  student: any;
  selectedStudentId: number | null = null;
  IsshowValidation: boolean = false;
  TOCUserCentreList: any;
  isTocUser: boolean = false;
  selectedCentreId: number | null = null;
  isSlotAccepted: boolean = false;
  isCentreTouched: boolean = false;
  IsshowCentreValidation: boolean = false;
  selectedCentreAdminId: any;

  //Added on 18/07/25
  NearbyDayCareList: any;
  userLocationFromZipcode = { lat: 0, lon: 0 };
  radiusValue: any;
  isEnablelocation: boolean = false;
  userLocation = { lat: 0, lon: 0 };
  DayCaresForFilters: any;
  daysOfWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  daysOfWeekMapping: any = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };
  searchTerm: string = '';
  selectedDayCareIds: number[] = [];
  ContentP: number = 1;
  Contentsize: number = 10;
  TOCRegistration: any;
  TOCModalRegistration: any;
  SelectedWeekDays: any[] = [];
  timeRowsByDayForBoNew: any[] | undefined; // Holds processed slots for submission
  timeRowsByDayForBo: {
    [day: string]: { startTime: string; endTime: string }[];
  } = {};
  timeRowsByDay: { [day: string]: { startTime: string; endTime: string }[] } =
    {};
  SelectedDay: string | undefined;
  startDatePickerInstance: any;
  endDatePickerInstance: any;

  ValidatorForAvailability: boolean = false;
  timeRows: any[] = [];
  showBoxIndex: number | null = null; //
  selectedDay: string = '';
  availableDays: { date: string; dayName: string }[] = [];
  availableWeeks: {
    week: string;
    days: { date: string; dayName: string }[];
  }[] = [];
  isAddedSlot: boolean = true;
  isSelectDay: boolean = true;
  isSelectOption: boolean = true;
  filteredGroupedTimeSlots2:
    | {
      startTime: string;
      endTime: string;
      option: string;
      dayName: string;
      week: string;
    }[]
    | undefined;

  expertise: any[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;

  filteredContent: any[] = [];
  contentBySection: { [key: string]: any[] } = {};
  contentByFooter: { [key: string]: any[] } = {};
  IncorrectMobileNumberFormat: boolean = false;
  hoveredRow: any = null;

  documentTypeList2 = [
    { id: 1, documentType: 'Canadian Passport' },
    { id: 2, documentType: "Driver's License" },
    { id: 3, documentType: 'Provincial or Territorial Photo ID Card' },
    { id: 4, documentType: 'Permanent Resident (PR) Card' },
    { id: 5, documentType: 'Canadian Citizenship Certificate with Photo' },
    { id: 6, documentType: 'Indigenous Status Card' },
  ];

  QualificationList: any;
  formData = new FormData();
  selectedFile: File | null = null;
  selectedFileDocument: File | null = null;
  selectedFileEducationalDocument: File | null = null;

  documentTypeList: any;
  CheckedUserData: any;
  isDisabled = false;
  SelectedDayForSlot!: string;

  UserID: any;
  UserIDParam: any;
  UserDetail: any;
  selectedAvailableDay: string = '';
  daysCount: number | undefined;
  currentWeekIndex: number = 0;

  timeRowsByDayForList: any[] = [];
  groupedTimeSlots: {
    [key: string]: {
      dateRange: any;
      map(arg0: (record: { dayName: any }) => any): any;
      startTime: string;
      endTime: string;
      option: string;
      dayName: string;
      week: string;
    }[];
  } = {};
  editGroupIndex: number | null = null; // Index of the group being edited
  editRowIndex: number | null = null; // Index of the row being edited
  isEditMode: boolean = false; // Flag for edit mode
  filteredGroupedTimeSlots = {};

  SelectedWeek: string | undefined;
  dayIndex: number = 0;
  selectedWeekName: string = '';
  isCurrentMonthOptionVisible: boolean = false;
  isFilteredNotNull: boolean = false;
  labelTextForSlider: string = '';
  dateRange: string = '';
  isCurrentWeekOptionVisible: boolean = false;
  CheckEndDate: Date | null = null;
  TOCUserDetail: any;
  selectedWorkingDays1: any;
  selectedDayRadio: any;
  IsPatchedValues: boolean = false;
  newRecords: any[] = [];
  IsApplyForAllDaysChecked: boolean = false;
  filteredDayNameAfterAdded: string | undefined;
  filteredWeekAfterAdded: string | undefined;
  userRoleID: any;
  TocTeacherZipcode: any;
  isProfileCompelete: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private toastr: ToastrService,
    private cookie: CookieService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private profileService: ProfileService,
    private commonService: CommonService,
    private onBoardingService: OnboardingService,
    private tocservice: TocRegistrationService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
      loginType: 'Backend',
      centreId: 0, //Added on 06/08/25
    });

    this.TOCRegistration = this.fb.group({
      id: 0,
      loginUserID: [0],
      partTimeStartDate: [null],
      partTimeEndDate: [null],
      partTimeWorkingDays: ['', [Validators.required]],
      preferredArea: [''],
      radius: ['', Validators.required],
      isApplyforAllDays: false,
      pinCode: ['', Validators.required],
    });

    this.TOCModalRegistration = this.fb.group({
      partTimeStartDate: [null, [Validators.required]],
      partTimeEndDate: [null, [Validators.required]],
      option: [''],
    });
  }

  ngOnInit(): void {
    const rememberMeStorage = this.cookie.get('rememberMe');
    if (rememberMeStorage === 'true') {
      this.rememberMe = true;
      const storedEmail = this.cookie.get('Email');
      const storedPassword = this.cookie.get('Password');
      if (storedEmail && storedPassword) {
        this.loginForm.patchValue({
          email: storedEmail,
          password: storedPassword,
          rememberMe: true,
        });
      }
    }
    this.activateTOCModal();
  }

  async activateTOCModal() {
    const centreID = this.getQueryParams('CentreID');
    const userID = this.getQueryParams('UserID');
    const zipCode = this.getQueryParams('Zipcode');
    const tocCentreList = this.getQueryParams('TocCentreList');
    const encrytpedEmail = this.getQueryParams('email');

    if (centreID && userID && zipCode && tocCentreList && encrytpedEmail) {
      this.UserId = this.commonService.decrypt(userID);
      const decryptedCentreID = this.commonService.decrypt(centreID) ?? '0';
      this.selectedCentreId = parseInt(decryptedCentreID, 10);

      this.TocTeacherZipcode = this.commonService.decrypt(zipCode);

      const decryptedTocList = this.commonService.decrypt(tocCentreList);

      const email = this.commonService.decrypt(encrytpedEmail) ?? '';

      let parsedTOCcentreList: any[] = [];

      if (decryptedTocList) {
        try {
          parsedTOCcentreList = JSON.parse(decryptedTocList);
          this.TOCUserCentreList = parsedTOCcentreList;
          this.spinner.show();
          let response = await this.loginService
            .CheckLoginEmail(email)
            .toPromise();

          if (response.message == 'OK') {
            this.spinner.hide();
            this.loginForm.patchValue({
              email: email.trim(),
              password: response.result.password.trim(),
            });

            this.openModal();
          } else {
            this.spinner.hide();
            this.toastr.error(response.message);
          }
        } catch (err) {
          console.error('Invalid JSON:', decryptedTocList, err);
        }
      }
    }
  }

  getQueryParams(queryParameter: string) {
    return this.route.snapshot.queryParamMap.get(queryParameter);
  }

  openModal() {
    if (this.selectedCentreId?.toString() == '0') {
      setTimeout(() => {
        $('#addMoreCentre').modal('show');
      }, 1000);

      this.TOCRegistration.patchValue({
        pinCode: this.TocTeacherZipcode,
      });
      this.fetchLocationData();
    }
  }

  ngAfterViewInit(): void {
    this.initDatePickers();
  }

  onCentreChange(centreID: any): void {
    this.isCentreTouched = true;
    this.IsshowCentreValidation = false;
    this.selectedCentreId = centreID.id.toString();

    if (this.selectedCentreId?.toString() == '0') {
      $('#addMoreCentre').modal('show');
      this.TOCRegistration.patchValue({
        pinCode: this.TocTeacherZipcode,
      });
      this.fetchLocationData();
    }
    this.selectedCentreAdminId = centreID.centreAdminID.toString();
  }

  //Added on 30/06/25

  async IsUserExit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (
      this.TOCUserCentreList &&
      this.TOCUserCentreList.length > 0 &&
      !this.isCentreTouched
    ) {
      this.IsshowCentreValidation = true;
      return;
    }

    // this.spinner.show();
    this.loginForm.patchValue({
      email: this.loginForm.value.email.trim(),
      password: this.loginForm.value.password.trim(),
    });

    if (this.selectedCentreId == null) {
      await firstValueFrom(
        this.loginService.IsUserExit(this.loginForm.value).pipe(
          catchError((error) => {
            this.toastr.error('Something went wrong. Please try again.');
            console.error('API error:', error);
            return of(null);
          }),
          finalize(() => {
            this.spinner.hide();
          })
        )
      ).then((authResponse) => {
        if (!authResponse) return;

        if (authResponse.message === 'Success') {
          const userRoleId = authResponse.result.userRoleID;

          if (userRoleId == 8 && authResponse.result.isTOCprofilecompleted) {
            this.isTocUser = true;
            this.UserId = authResponse.result.id;
            this.TOCUserCentreList = authResponse.result.centreList;

            this.TOCUserCentreList.push({
              id: 0,
              centreName: 'Add more availability for new centres',
            });

            this.TocTeacherZipcode = authResponse.result.pinCode;
          } else if (
            this.selectedCentreId === 0 &&
            userRoleId == 8 &&
            authResponse.result.isTOCprofilecompleted
          ) {
            $('#addMoreCentre').modal('show');
          } else {
            this.isTocUser = false;
            this.login();
          }
        } else {
          this.toastr.error(authResponse.message);
        }
      });
    } else {
      this.spinner.hide();
      this.login();
    }
  }

  async login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.spinner.show();

    try {
      const trimmedEmail = this.loginForm.value.email.trim();
      const trimmedPassword = this.loginForm.value.password.trim();

      this.loginForm.patchValue({
        email: trimmedEmail,
        password: trimmedPassword,
        centreId: this.selectedCentreId != 0 ? this.selectedCentreId : 0, //Added on 06/08/25
      });

      const authResponse = await firstValueFrom(
        this.loginService.Login(this.loginForm.value)
      );

      if (authResponse.message === 'Success') {
        this.toastr.success('Login Successful');
        this.UserId = authResponse.result.id;

        //Added on 30/06/25
        if (authResponse.result.userRoleID == 8 && this.isTocUser) {
          this.centreID = this.selectedCentreId;
          this.cookie.set('CentreID', this.centreID);
          const centreAdminId = this.selectedCentreAdminId;
          this.cookie.set('CentreAdminID', centreAdminId);
          const data: any = await this.loginService
            .checkTOCUserAcceptedSlotRequest(this.UserId, this.selectedCentreId)
            .toPromise();
          this.isSlotAccepted = data?.message?.toLowerCase() === 'ok';
          this.cookie.set('isSlotAccepted', String(this.isSlotAccepted));
        } else {
          if (!this.cookie.check('CentreID')) {
            this.centreID = authResponse.result.centreID;
            this.cookie.set('CentreID', this.centreID);
          }
        }

        this.cookie.set('UserId', this.UserId);
        this.cookie.set('UserInfo', JSON.stringify(authResponse));
        this.cookie.set('RefreshToken',authResponse.refreshToken);
        this.cookie.set('UserRoleId', authResponse.result.userRoleID);
        this.loginService.loadUserFromStorage();

        const UserInfo = this.cookie.get('UserInfo');
        if (UserInfo) {
          const parsedInfo = JSON.parse(UserInfo);
          const firstName = parsedInfo.result.firstName;
          const lastName = parsedInfo.result.lastName;
          const email = parsedInfo.result.email;
          this.cookie.set('email', email);
          const adminName = `${firstName} ${lastName ?? ''}`;
          this.cookie.set('AdminName', adminName);
        }

        const userRoleId = authResponse.result.userRoleID;
        const roleRoutes: { [key: number]: string } = {
          1: '/dashboard',
          2: '/dashboard',
          3: '/daycare-dashboard',
          4: '/teachers-dashboard',
          5: '/parent-dashboard',
          6: '/counsellor-dashboard',
          // 8: '/toc-dashboard',
          //8: '/profile',
        };
        if (this.isTocUser && this.isSlotAccepted) {
          roleRoutes[8] = '/teachers-dashboard';
        } else {
          roleRoutes[8] = '/profile';
        }

        if (
          authResponse.result.userRoleID == 5 &&
          authResponse.result.studentID != null
        ) {
          const studentID = authResponse.result.studentID[0].id;
          const centreID = authResponse.result.studentID[0].centreID;
          this.cookie.set('StudentID', studentID);
          this.cookie.set('CentreID', centreID);

          if (!authResponse.result.isOnBoarded) {
            // this.spinner.hide();
            this.router.navigate(['parent-onboarding']);
            return;
          }
        }

        if (userRoleId === 3 && !authResponse.result.isOnBoarded) {
          this.router.navigate(['onboarding']);
        } else {
          this.router.navigate([roleRoutes[userRoleId] || '/dashboard']);
        }
      } else if (authResponse.message === 'Plan-Expired') {
        // Handle Plan-Expired scenario
        Swal.fire({
          title: 'Subscription Expired!',
          html: `<p>Your subscription has expired. Please renew your plan.</p>`,
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            confirmButton: 'custom-confirm-btn',
            cancelButton: 'custom-cancel-btn, swal2-confirm',
          },
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Renew Same Plan',
          cancelButtonText: 'Choose New Plan',
        }).then((result) => {
          const planencryptID = this.commonService.encrypt(
            String(authResponse.result.latestPlanId)
          );
          const dayCareUserencryptID = this.commonService.encrypt(
            String(authResponse.result.userId)
          );
          const encNewType = this.commonService.encrypt('encType');

          if (result.isConfirmed) {
            const daycareType = this.commonService.encrypt('Re-Subscribe');
            let params = `Userid=${dayCareUserencryptID}&daycareType=${daycareType}&planid=${planencryptID}&enc_type=${encNewType}`;
            window.location.href =
              this.frontendWebUrl + 'payment-details?' + params;
          } else {
            this.router.navigate(['bloomvie-plan'], {
              queryParams: {
                enc: dayCareUserencryptID,
                enc_plan: planencryptID,
              },
            });
          }
        });
      } else if (authResponse.message === 'subscription-not-found') {
        Swal.fire({
          title: 'No Active Subscription!',
          text: 'You do not have an active subscription. Please subscribe to access the portal.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Subscribe Now',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = this.frontendWebUrl;
          }
        });
      } else if (authResponse.message === 'Trial-Plan-Expired') {
        Swal.fire({
          title: 'Trial Plan Expired!',
          text: 'Your trial plan has expired. Please subscribe to a new plan to continue accessing the portal.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Subscribe Now',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            const planencryptID = this.commonService.encrypt(
              String(authResponse.result.latestPlanId)
            );
            const dayCareUserencryptID = this.commonService.encrypt(
              String(authResponse.result.userId)
            );
            const encryptType =
              this.commonService.encrypt('Trial-Plan-Expired');

            this.router.navigate(['bloomvie-plan'], {
              queryParams: {
                enc: dayCareUserencryptID,
                enc_plan: planencryptID,
                enc_type: encryptType,
              },
            });
          }
        });
      }
      //Added on 05/08/25
      else if (authResponse.message === 'Plan-Suspended') {
        Swal.fire({
          title: 'Subscription Suspended!',
          html: `<p>Your subscription has been suspended by Bloomvie.</p>`,
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
          },
          icon: 'warning',
          showCancelButton: false,
          showConfirmButton: false,
          allowOutsideClick: true,
          allowEscapeKey: true,
        });
      } else {
        if (authResponse.message === 'Payment has not been completed') {
          this.toastr.error('Complete the payment First!!');
        } else if (authResponse.message === 'Incorrect password') {
          this.toastr.error('Incorrect password. Please try again.');
        } else {
          this.toastr.error(authResponse.message);
        }
      }
    } catch (error) {
      this.toastr.error('An error occurred during login');
    } finally {
      this.spinner.hide();
      if (this.loginForm.value.rememberMe) {
        this.cookie.set('rememberMe', 'true');
        this.cookie.set('Email', this.loginForm.get('email')?.value);
        this.cookie.set('Password', this.loginForm.get('password')?.value);
      } else {
        this.cookie.delete('rememberMe');
        this.cookie.delete('Email');
        this.cookie.delete('Password');
      }
    }
  }

  checkTOCUserAcceptedSlotRequest() {
    if (!this.UserId || !this.selectedCentreId) {
      console.warn('UserId or selectedCentreId is missing.');
      return;
    }

    this.loginService
      .checkTOCUserAcceptedSlotRequest(this.UserId, this.selectedCentreId)
      .subscribe({
        next: (data) => {
          this.isSlotAccepted = data?.message?.toLowerCase() === 'ok';
          this.cookie.set('isSlotAccepted', String(this.isSlotAccepted));
        },
        error: (err) => {
          console.error('Error checking slot request:', err);
          this.isSlotAccepted = false;
          this.cookie.set('isSlotAccepted', 'false');
        },
      });
  }

  getTOCUserCentreListById(userid: any) {
    this.profileService.getTOCUserCentreListById(userid).subscribe(
      (data) => {
        if (data.message === 'ok') {
          // this.isTocUser = true;
          this.TOCUserCentreList = data.result.centreList;
          this.TOCUserCentreList.push({
            id: 0,
            centreName: 'Add more availability for new centres',
          });
        } else {
          this.TOCUserCentreList = [];
        }
      },
      (error) => {
        console.error('Error occurred while checking email:', error);
      }
    );
  }

  renewPlan() {
    if (!this.selectedStudentId) {
      // this.toastr.warning('Please select a student first.');
      this.IsshowValidation = true;
      return;
    }
    this.IsshowValidation = false;

    const selectedStudent = this.student.find(
      (s: { id: number | null }) => s.id === this.selectedStudentId
    );
    if (!selectedStudent) {
      this.toastr.error('Student not found.');
      return;
    }

    const subscriptionPlanId = selectedStudent.subscriptionPlanID;
    const userRoleId = selectedStudent.parentRoleId;
    const centreAdminId = selectedStudent.centreAdminID;
    const parentId = selectedStudent.parentID;

    const parentType = this.commonService.encrypt('Re-Subscribe');
    const planencryptID = this.commonService.encrypt(
      String(subscriptionPlanId)
    );
    const parentUserencryptID = this.commonService.encrypt(String(parentId));

    // const userroleencryptID = this.commonService.encrypt(
    //   String(userRoleId)
    // );

    const dayCareUserencryptID = this.commonService.encrypt(
      String(centreAdminId)
    );

    const studentencryptID = this.commonService.encrypt(
      String(this.selectedStudentId)
    );
    let params = `Userid=${parentUserencryptID}&ParentType=${parentType}&planid=${planencryptID}&DayCareID=${dayCareUserencryptID}&Studentid=${studentencryptID}`;
    window.location.href = this.frontendWebUrl + 'payment-details?' + params;
  }

  forgotPassword() {
    this.showForgotPassword = true;
  }

  backtoLoginScreen() {
    this.showForgotPassword = false;
  }

  //Added on 15/04/25 Arsh
  getStudent(parentId: number) {
    this.loginService.getStudentPaymentDetailByParentID(parentId).subscribe(
      (response: any) => {
        if (response.message === 'Success') {
          this.student = response.result;
        } else {
          console.error('Failed to fetch student list:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching student list:', error);
      }
    );
  }

  showPasswordIcon() {
    if (this.passwordField == 'password') {
      this.passwordField = 'text';
    } else {
      this.passwordField = 'password';
    }
  }

  // getPlanDetail() {
  //   this.profileService.getSubscriptionPlanByUserId(this.UserId).subscribe(data => {
  //     if (data.message === "OK") {
  //       const plan = data.result;

  //       plan.featureList.forEach((val: any) => {
  //         if (val.featureName.includes("Job Posting")) {
  //           const countFeature = val.featureName.split(" ");
  //           this.cookie.set("jobPostCount", countFeature[0]);
  //         }
  //       })

  //     }
  //   })
  // }

  // getPlanDetail() {
  //    const userRoleID = Number(this.cookie.get('UserRoleId'));
  //   this.profileService.getSubscriptionPlanByUserId(this.UserId,userRoleID).subscribe(data => {
  //     if (data.message === "OK") {
  //       const plan = data.result;
  //       if (userRoleID == 3) {
  //         // plan[0].featureList.forEach((val: any) => {
  //         //   if (val.planOwnerID === 3 || (val.jobPostType == true && val.planOwnerID == 1)) {
  //         //     const jobPostingCounts = val.capacity;
  //         //     this.cookie.set("jobPostCount", jobPostingCounts);
  //         //   }
  //         // })

  //         plan.featureList.forEach((val: any) => {
  //                   if (val.featureName.includes("Job Posting")) {
  //                     const countFeature = val.featureName.split(" ");
  //                     this.cookie.set("jobPostCount", countFeature[0]);
  //                   }
  //                 })

  //       // if (userRoleID === 3 && plan?.featureList && Array.isArray(plan.featureList)) {
  //       //   plan.featureList.forEach((val: any) => {
  //       //     if (val?.planOwnerID === 3 || (val?.jobPostType === true && val?.planOwnerID === 1)) {
  //       //       const jobPostingCounts = val.capacity ?? 0; // Ensure a valid number
  //       //       this.cookie.set("jobPostCount", jobPostingCounts.toString());
  //       //     }
  //       //   });
  //       // }
  //     }
  //   })
  // }

  getPlanDetail() {
    const userRoleID = Number(this.cookie.get('UserRoleId'));

    this.profileService
      .getSubscriptionPlanByUserId(this.UserId, userRoleID, '', '')
      .subscribe((data) => {
        if (data.message === 'OK' && data.result) {
          const plan = Array.isArray(data.result)
            ? data.result[0]
            : data.result; // Handle if it's an array
          if (!plan || !plan.featureList || !Array.isArray(plan.featureList)) {
            console.warn(
              'Plan or feature list is missing or not an array',
              plan
            );
            return;
          }

          if (userRoleID === 3) {
            // Using a safer approach to extract job posting count
            plan.featureList.forEach((val: any) => {
              if (
                typeof val.featureName === 'string' &&
                val.featureName.includes('Job Posting')
              ) {
                const countFeature = val.featureName.split(' ')[0]; // Extract first part (e.g., '2' from '2 Job Posting')
                this.cookie.set('jobPostCount', countFeature);
              }
            });
          }
        } else {
          console.warn('No valid plan data received', data);
        }
      });
  }

  getUserCurrentLocation(event: any) {
    if (event.target.checked) {
      if (confirm('Do you want to enable location access?')) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              };
              this.isEnablelocation = true;
              this.GetAllDayCaresNearBy({
                target: { value: this.radiusValue || 10 },
              });
            },
            (error) => {
              event.target.checked = false;
              this.isEnablelocation = false;
            }
          );
        } else {
          event.target.checked = false;
          this.isEnablelocation = false;
        }
      } else {
        event.target.checked = false;
        this.isEnablelocation = false;
      }
    } else {
      this.userLocation = { lat: 0, lon: 0 };
      this.isEnablelocation = false;
      this.GetAllDayCaresNearBy({ target: { value: this.radiusValue || 10 } });
    }
  }

  GetAllDayCaresNearBy(event: any) {
    this.spinner.show();
    var lat = 0;
    var lng = 0;
    this.NearbyDayCareList = [];
    this.radiusValue = event.target.value;

    if (this.radiusValue == '') {
      this.spinner.hide();
    }

    if (this.isEnablelocation == true) {
      lat = this.userLocation.lat;
      lng = this.userLocation.lon;
    } else {
      lat = this.userLocationFromZipcode.lat;
      lng = this.userLocationFromZipcode.lon;
    }

    //Zip code A1A 1A1
    // lat = 49.171896;
    // lng = -123.053605;

    this.tocservice
      .GetAllDayCareWithInRadius(lat, lng, this.radiusValue)
      .subscribe((data) => {
        if (data.message == 'ok') {
          this.NearbyDayCareList = data.result;
          this.NearbyDayCareList = data.result.filter(
            (nearby: { id: any }) =>
              !this.TOCUserCentreList.some(
                (existing: { id: any }) => existing.id === nearby.id
              )
          );
          this.DayCaresForFilters = data.result;
          this.spinner.hide();
        } else {
          this.NearbyDayCareList = [];
          this.spinner.hide();
        }
      });
  }

  filterNearbyDaycares() {
    if (this.searchTerm != '') {
      this.NearbyDayCareList = this.DayCaresForFilters;
      const term = this.searchTerm.toLowerCase();
      this.NearbyDayCareList = this.NearbyDayCareList.filter(
        (item: {
          centreName: string;
          centreEmail: string;
          centreMobile: string;
        }) =>
          item.centreName?.toLowerCase().includes(term) ||
          item.centreEmail?.toLowerCase().includes(term) ||
          item.centreMobile?.toLowerCase().includes(term)
      );
    } else {
      this.NearbyDayCareList = this.DayCaresForFilters;
    }
  }

  applyforParticularDC(event: any, id: number) {
    if (event.target.checked) {
      if (!this.selectedDayCareIds.includes(id)) {
        this.selectedDayCareIds.push(id);
      }
    } else {
      this.selectedDayCareIds = this.selectedDayCareIds.filter(
        (dcId) => dcId !== id
      );
    }
  }

  applyforAllDC(event: any) {
    if (event.target.checked) {
      if (this.NearbyDayCareList != null) {
        this.selectedDayCareIds = this.NearbyDayCareList.map(
          (dc: { id: any }) => dc.id
        );
      }
    } else {
      this.selectedDayCareIds = [];
    }

  }

  formatPostalCode(event: any): void {
    const formatted = this.commonService.formatPostalCode(event.target.value);
    event.target.value = formatted;

    // this.TOCRegistration.controls['pinCode'].setValue(formatted, {
    //   emitEvent: false,
    // });
  }

  fetchLocationData() {
    var postalCode = $('#zipcode').val();
    const postalCodePattern = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
    if (!postalCodePattern.test(postalCode)) {
      return;
    }

    const normalizedPostalCode = postalCode.split(' ')[0];
    if (normalizedPostalCode.length === 3) {
      let url = `https://api.zippopotam.us/ca/${normalizedPostalCode}`;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.places && response.places.length > 0) {
            const place = response.places[0];
            (this.userLocationFromZipcode.lat = place['latitude']),
              (this.userLocationFromZipcode.lon = place['longitude']);
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: '<h3>Error!</h3>',
            text: 'Unable to fetch data. Please try again later.',
          });
        }
      };
      xhr.send();
    }
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  onWorkingDaysChange(day: string, event: any): void {
    const workingDaysControl = this.TOCRegistration.get('partTimeWorkingDays');
    let currentWorkingDays = workingDaysControl.value || '';
    const dayId = this.daysOfWeekMapping[day].toString();

    if (event.target.checked) {
      if (!currentWorkingDays.includes(dayId)) {
        currentWorkingDays = currentWorkingDays
          ? `${currentWorkingDays},${dayId}`
          : dayId;
      }

      if (!this.SelectedWeekDays.includes(day)) {
        this.SelectedWeekDays.push(day);
      }
    } else {
      currentWorkingDays = currentWorkingDays
        .split(',')
        .filter((d: any) => d !== dayId)
        .join(',');
      delete this.timeRowsByDayForBo[dayId];
      delete this.timeRowsByDay[dayId];
      this.timeRowsByDay[day] = [{ startTime: '', endTime: '' }];

      this.SelectedWeekDays = this.SelectedWeekDays.filter(
        (selectedDay) => selectedDay !== day
      );
    }

    workingDaysControl.setValue(currentWorkingDays);
    this.SelectedDay = day;
  }

  showmodal() {
    //$('#TimeSlotModal').modal('show');
    if (this.TOCUserDetail == null) {
      if (this.TOCModalRegistration.value.partTimeStartDate == null) {
        if (this.TOCRegistration.value.partTimeWorkingDays == '') {
          Swal.fire({
            icon: 'warning',
            title: 'Attention',
            text: 'Select atleast one Working day',
          });
        }

        if (
          this.startDatePickerInstance &&
          typeof this.startDatePickerInstance.clear === 'function'
        ) {
          this.startDatePickerInstance.clear();
        }

        if (
          this.endDatePickerInstance &&
          typeof this.endDatePickerInstance.clear === 'function'
        ) {
          this.endDatePickerInstance.clear();
        }

        this.TOCModalRegistration.patchValue({
          partTimeStartDate: null,
          partTimeEndDate: null,
          option: '',
        });

        this.timeRows = [];
        this.showBoxIndex = null;
        this.selectedDay = '';
        this.availableDays = [];
        this.isAddedSlot = true;
        this.isSelectDay = true;
        this.isSelectOption = true;
        this.filteredDayNameAfterAdded = '';
        this.filteredWeekAfterAdded = '';
        this.addRow();
        if (this.TOCRegistration.value.partTimeWorkingDays == '') {
          $('#TimeSlotModal').modal('hide');
        } else {
          $('#TimeSlotModal').modal('show');
        }
      } else {
        $('#TimeSlotModal').modal('show');
      }
    } else {
      $('#TimeSlotModal').modal('show');
    }
  }

  ResetModalForm() {
    this.resetDatePickers();
    this.timeRowsByDay = {};
    this.timeRowsByDayForBo = {};
    this.ValidatorForAvailability = false;
    //forSlotmodal
    this.timeRows = [];
    this.showBoxIndex = null;
    this.selectedDay = '';
    this.availableDays = [];
    this.availableWeeks = [];
    this.isAddedSlot = true;
    this.isSelectDay = true;
    this.isSelectOption = true;
    this.filteredGroupedTimeSlots2 = [];
    this.TOCModalRegistration.reset();
    this.addRow();
    //Added on 04/02/25
    $('#TimeSlotModal').modal('hide');

    //Added on 25/07/25
    if (
      this.startDatePickerInstance &&
      typeof this.startDatePickerInstance.clear === 'function'
    ) {
      this.startDatePickerInstance.clear();
    }

    if (
      this.endDatePickerInstance &&
      typeof this.endDatePickerInstance.clear === 'function'
    ) {
      this.endDatePickerInstance.clear();
    }
    this.TOCModalRegistration.patchValue({
      partTimeStartDate: null,
      partTimeEndDate: null,
      option: '',
    });

    this.filteredDayNameAfterAdded = '';
    this.filteredWeekAfterAdded = '';
    //end
  }

  resetDatePickers(): void {
    if (
      this.startDatePickerInstance &&
      typeof this.startDatePickerInstance.clear === 'function'
    ) {
      this.startDatePickerInstance.clear();
    }

    if (
      this.endDatePickerInstance &&
      typeof this.endDatePickerInstance.clear === 'function'
    ) {
      this.endDatePickerInstance.clear();
    }

    this.TOCModalRegistration.patchValue({
      partTimeStartDate: null,
      partTimeEndDate: null,
    });
  }

  addRow() {
    this.timeRows.push({
      startTime: '',
      endTime: '',
      isInvalid: false,
    });
  }

  onDateChange(type: 'start' | 'end', event: any): void {
    this.isCurrentMonthOptionVisible = false;
    const value = event.target.value;

    //Added on 25/07/25
    this.availableWeeks = [];
    this.availableDays = [];
    this.filteredGroupedTimeSlots2 = [];
    this.timeRows = [];
    this.showBoxIndex = null;
    this.selectedDay = '';
    this.availableDays = [];
    this.isAddedSlot = true;
    this.isSelectDay = true;
    this.isSelectOption = true;
    this.filteredDayNameAfterAdded = '';
    this.filteredWeekAfterAdded = '';
    this.addRow();

    if (type === 'start') {
      this.startDate = value ? new Date(value) : null;
    } else if (type === 'end') {
      this.endDate = value ? new Date(value) : null;
    }

    if (this.CheckEndDate != this.endDate) {
      this.TOCModalRegistration.patchValue({
        option: '',
      });
    }

    this.CheckEndDate = this.endDate;

    if (this.startDate && this.endDate) {
      this.generateUniqueDays();
      const isEndOfMonthOrNextMonth = this.isEndOfMonthOrFutureMonth(
        this.startDate,
        this.endDate
      );
      const IsDayOfCurentWeek = this.isEndOfWeekOrEarlier(
        this.startDate,
        this.endDate
      );
      this.isCurrentMonthOptionVisible = isEndOfMonthOrNextMonth;
      this.isCurrentWeekOptionVisible = IsDayOfCurentWeek;

      //Added on 8/1/25
      if (this.labelTextForSlider === 'Apply For Current Month') {
        if (this.startDate != null && this.endDate != null) {
          const lastDayOfStartMonth = new Date(
            this.startDate.getFullYear(),
            this.startDate.getMonth() + 1,
            0
          );

          if (this.endDate > lastDayOfStartMonth) {
            const startDateString = this.startDate.toDateString();
            const lastDayOfStartMonthString =
              lastDayOfStartMonth.toDateString();
            this.dateRange = `${startDateString} - ${lastDayOfStartMonthString}`;
          } else {
            const startDateString = this.startDate.toDateString();
            const endDateString = this.endDate.toDateString();
            this.dateRange = `${startDateString} - ${endDateString}`;
          }
        }
      }
    }
  }

  getWeekDifference(startDate: Date, endDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.abs(
      (endDate.getTime() - startDate.getTime()) / oneDay
    );
    return Math.ceil(diffDays / 7); // Return difference in weeks
  }

  isEndOfMonthOrFutureMonth(startDate: Date, endDate: Date): boolean {
    const currentMonthEndDate = new Date(startDate);
    currentMonthEndDate.setMonth(startDate.getMonth() + 1);
    currentMonthEndDate.setDate(0);
    const isEndDateValid = endDate <= currentMonthEndDate;
    return isEndDateValid;
  }

  isEndOfWeekOrEarlier(startDate: Date, endDate: Date): boolean {
    const endOfWeek = new Date(startDate);
    const dayOfWeek = endOfWeek.getDay();
    const daysUntilEndOfWeek = 7 - dayOfWeek;
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilEndOfWeek);
    return endDate <= endOfWeek;
  }

  generateUniqueDays(): void {
    if (this.startDate && this.endDate) {
      const uniqueDays: { date: string; dayName: string }[] = [];
      const weeksMap = new Map<
        string,
        {
          week: string;
          days: { date: string; dayName: string }[];
          startDate: string;
          endDate: string;
        }
      >();
      let daysAdded: Set<string> = new Set();

      let currentDate = new Date(this.startDate);
      const endDate = new Date(this.endDate);

      while (currentDate <= endDate) {
        let weekNumber = this.getWeekNumberInMonth(currentDate);
        let month = currentDate.getMonth() + 1; // Get month (1-12)
        let year = currentDate.getFullYear(); // Get year
        const weekKey = `${year}-${month}-Week ${weekNumber}`; // Differentiate weeks by year-month-weekNumber
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
        });

        if (
          this.SelectedWeekDays.includes(dayName) &&
          !daysAdded.has(dateStr)
        ) {
          daysAdded.add(dateStr);
          uniqueDays.push({ date: dateStr, dayName });

          if (!weeksMap.has(weekKey)) {
            weeksMap.set(weekKey, {
              week: '',
              days: [],
              startDate: '',
              endDate: '',
            });
          }

          let weekData = weeksMap.get(weekKey)!;
          weekData.days.push({ date: dateStr, dayName });
          weekData.startDate = weekData.days[0].date;
          weekData.endDate = weekData.days[weekData.days.length - 1].date;
          weekData.week = `Week ${weekNumber} (${weekData.startDate} - ${weekData.endDate})`;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.availableWeeks = Array.from(weeksMap.values());
    }
  }

  getWeekNumberInMonth(date: Date): number {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstMonday = new Date(firstDayOfMonth);
    while (firstMonday.getDay() !== 1) {
      firstMonday.setDate(firstMonday.getDate() + 1);
    }
    return Math.ceil((date.getDate() - firstMonday.getDate() + 1) / 7) + 1;
  }

  navigateWeek(direction: string) {
    if (
      direction === 'next' &&
      this.currentWeekIndex < this.availableWeeks.length - 1
    ) {
      this.currentWeekIndex++;
    } else if (direction === 'prev' && this.currentWeekIndex > 0) {
      this.currentWeekIndex--;
    }

    this.selectedDay = '';
    this.updateAvailableDaysAndSlots();
  }

  updateAvailableDaysAndSlots() {
    const week = this.availableWeeks[this.currentWeekIndex];
    this.SelectedWeek = week.week;
    this.availableDays = week.days; // Set available days based on the new week

    this.selectedWeekName =
      this.SelectedWeek.split(' ')[0] + ' ' + this.SelectedWeek.split(' ')[1];
    this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);

    // Reset time rows if needed
    this.timeRows = [];
    this.addRow();
  }

  filterRecordsByWeekAndDay(weekk: string, selectedDay: string): void {

    if (weekk == '') {
      this.filteredGroupedTimeSlots2 = Object.entries(this.groupedTimeSlots)
        .filter(([week, days]) => week === weekk)
        .flatMap(([_, days]) =>
          Object.entries(days)
            .filter(([day]) => day === selectedDay)
            .flatMap(([_, records]) => records)
        );
      this.isFilteredNotNull =
        this.filteredGroupedTimeSlots2 !== undefined &&
        this.filteredGroupedTimeSlots2 !== null;
    } else {
      let [baseWeek, weekNumber] = weekk.split(' ');
      let incrementedWeek = weekk;
      if (
        this.labelTextForSlider == 'Apply For Whole Calendar' ||
        this.labelTextForSlider == 'Apply For Current Month'
      ) {
        for (let i = 0; i < this.availableDays.length; i++) {
          const DN = this.availableDays[i].dayName;
          while (
            !this.groupedTimeSlots[incrementedWeek] &&
            this.groupedTimeSlots[`Week ${parseInt(weekNumber) + 1}`] &&
            DN == selectedDay
          ) {
            weekNumber = (parseInt(weekNumber) + 1).toString();
            incrementedWeek = `${baseWeek} ${weekNumber}`;
          }
        }

        for (let i = 0; i < this.availableDays.length; i++) {
          const DN = this.availableDays[i].dayName;
          while (
            this.groupedTimeSlots[incrementedWeek] &&
            this.groupedTimeSlots[`Week ${parseInt(weekNumber) + 1}`] &&
            DN == selectedDay
          ) {
            weekNumber = (parseInt(weekNumber) + 1).toString();
            incrementedWeek = `${baseWeek} ${weekNumber}`;
          }
        }

        this.filteredGroupedTimeSlots2 = Object.entries(this.groupedTimeSlots)
          .filter(([week, _]) => week === incrementedWeek)
          .flatMap(([_, days]) =>
            Object.entries(days)
              .filter(([day]) => day === selectedDay)
              .flatMap(([_, records]) => records)
          );

        this.filteredGroupedTimeSlots2 = this.filteredGroupedTimeSlots2.filter(
          (slot, index, self) =>
            index ===
            self.findIndex(
              (s) =>
                s.week === slot.week &&
                s.dayName === slot.dayName &&
                s.startTime === slot.startTime &&
                s.endTime === slot.endTime
            )
        );
      } else {
        this.filteredGroupedTimeSlots2 = Object.entries(this.groupedTimeSlots)
          .filter(([week, _]) => week === incrementedWeek)
          .flatMap(([_, days]) =>
            Object.entries(days)
              .filter(([day]) => day === selectedDay)
              .flatMap(([_, records]) => records)
          );
      }

      //Added on 01/04/25
      this.filteredDayNameAfterAdded =
        this.filteredGroupedTimeSlots2[0].dayName;
      this.filteredWeekAfterAdded = this.filteredGroupedTimeSlots2[0].week;

      // this.filteredGroupedTimeSlots2 = this.groupedTimeSlots[incrementedWeek]?.filter(slot => slot.dayName === selectedDay) || [];=
      this.isFilteredNotNull =
        this.filteredGroupedTimeSlots2 !== undefined &&
        this.filteredGroupedTimeSlots2 !== null;
    }
  }

  isSelectedRadio() {
    this.ResetSlotDataModal();
    this.currentWeekIndex = 0;
    switch (this.TOCModalRegistration.value.option) {
      case 'Option 1':
        this.labelTextForSlider = 'Apply For Whole Calendar';
        break;
      case 'Option 2':
        this.labelTextForSlider = 'Apply For Current Month';
        break;
      case 'Option 3':
        this.labelTextForSlider = 'Apply For Current Week';
        break;
      case 'Option 4':
        this.labelTextForSlider = 'None';
        break;
      default:
        this.labelTextForSlider = 'Not Selected';
    }

    if (this.labelTextForSlider === 'Apply For Current Month') {
      if (this.startDate != null && this.endDate != null) {
        const lastDayOfStartMonth = new Date(
          this.startDate.getFullYear(),
          this.startDate.getMonth() + 1,
          0
        );
        if (this.endDate > lastDayOfStartMonth) {
          const startDateString = this.startDate.toDateString();
          const lastDayOfStartMonthString = lastDayOfStartMonth.toDateString();
          this.dateRange = `${startDateString} - ${lastDayOfStartMonthString}`;
        } else {
          const startDateString = this.startDate.toDateString();
          const endDateString = this.endDate.toDateString();
          this.dateRange = `${startDateString} - ${endDateString}`;
        }
      }
    }
    this.updateAvailableDays();
    this.isSelectOption = true;
  }

  ResetSlotDataModal() {
    this.filteredGroupedTimeSlots2 = [];
    this.groupedTimeSlots = {};
    this.timeRowsByDayForList = [];
  }

  updateAvailableDays(): void {

    const currentWeek = this.availableWeeks[this.currentWeekIndex]?.days || [];
    if (
      this.labelTextForSlider === 'Apply For Whole Calendar' ||
      this.labelTextForSlider == 'Apply For Current Month'
    ) {
      let allDays: { date: string; dayName: string }[] = [];
      let seenDays = new Set<string>();
      for (let i = 0; i < this.availableWeeks.length; i++) {
        const nextWeek = this.availableWeeks[i]?.days || [];
        nextWeek.forEach((day) => {
          if (
            this.SelectedWeekDays.includes(day.dayName) &&
            !seenDays.has(day.dayName)
          ) {
            seenDays.add(day.dayName);
            allDays.push(day);
          }
        });
      }
      this.availableDays = allDays;
      this.availableDays.forEach((day) => {
      });
    } else {
      this.availableDays = currentWeek.filter((day) =>
        this.SelectedWeekDays.includes(day.dayName)
      );
    }
  }

  saveTimeRows(SubmitVal: string) {

    $('#Addupdateslotbutton').html('Add Slot');
    if (SubmitVal == 'submit') {
      if (this.timeRows[0].isInvalid) {
        return;
      }
      $('#TimeSlotModal').modal('hide');
    }

    if (!this.TOCModalRegistration.valid) {
      this.TOCModalRegistration.markAllAsTouched();
      return;
    }

    if (!this.TOCModalRegistration.value.option) {
      this.isSelectOption = false;
      this.isAddedSlot = false;
      return;
    }

    if (!this.selectedDay) {
      this.isSelectDay = false;
      return;
    }

    if (!this.timeRows[0]?.startTime || !this.timeRows[0]?.endTime) {
      this.isAddedSlot = false;
      return;
    }

    if (this.timeRows[0].isInvalid) {
      return;
    }

    this.ValidatorForAvailability = false;
    this.selectedAvailableDay = this.selectedDay;

    let labelText = '';
    switch (this.TOCModalRegistration.value.option) {
      case 'Option 1':
        labelText = 'Apply For Whole Calendar';
        break;
      case 'Option 2':
        labelText = 'Apply For Current Month';
        break;
      case 'Option 3':
        labelText = 'Apply For Current Week';
        break;
      case 'Option 4':
        labelText = 'None';
        break;
      default:
        labelText = 'Not Selected';
    }

    const week = this.availableWeeks[this.currentWeekIndex];
    this.SelectedWeek = week.week;
    this.selectedWeekName =
      this.SelectedWeek.split(' ')[0] + ' ' + this.SelectedWeek.split(' ')[1];
    this.dateRange = this.SelectedWeek.split('(')[1].split(')')[0];

    if (this.availableWeeks.length > 0) {
      if (labelText == 'Apply For Whole Calendar') {
        for (let i = 0; i < this.availableWeeks.length; i++) {
          const week = this.availableWeeks[i];
          const weekDays = week.days.map((day) => day.dayName); // Extract day names from the current week's days
          const SelectedWeek = week.week;
          const WeekName = `${SelectedWeek.split(' ')[0]} ${SelectedWeek.split(' ')[1]
            }`;
          const dateRange = SelectedWeek.split('(')[1].split(')')[0];

          if (weekDays.includes(this.selectedAvailableDay)) {
            const timeRowsByDay = this.timeRows.map((row) => ({
              startTime: row.startTime,
              endTime: row.endTime,
              option: labelText,
              dayName: this.selectedAvailableDay,
              week: WeekName,
              dateRange: dateRange,
            }));
            this.timeRowsByDayForList.push(...timeRowsByDay);
          }
        }
      } else if (labelText == 'Apply For Current Month') {
        //Added on 03/02/25
        const startDateString = this.startDate;
        const endDateString = this.endDate;
        this.dateRange = `${startDateString} - ${endDateString}`;

        if (this.isCurrentMonthOptionVisible) {
          const Firstweek = this.availableWeeks[0];
          for (let i = 0; i < this.availableWeeks.length; i++) {
            const week = this.availableWeeks[i];
            const SelectedWeek = week.week;
            const WeekName =
              SelectedWeek.split(' ')[0] + ' ' + SelectedWeek.split(' ')[1];
            const dateRange = SelectedWeek.split('(')[1].split(')')[0];

            //Added on 14/02/25
            const isDayPresent = week.days.some(
              (day) => day.dayName === this.selectedAvailableDay
            );
            const isWeekPresent = week.week == Firstweek.week;

            // && isWeekPresent commented on 03/02/25
            if (isDayPresent) {
              const timeRowsByDay = this.timeRows.map((row) => ({
                startTime: row.startTime,
                endTime: row.endTime,
                option: labelText,
                dayName: this.selectedAvailableDay,
                week: WeekName,
                dateRange: dateRange,
              }));
              this.timeRowsByDayForList.push(...timeRowsByDay);
            }
          }
        } else {
          if (this.startDate && this.endDate) {
            let startDate = new Date(this.startDate);
            let endDate = new Date(this.endDate);

            let lastDayPrevMonth = new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              0
            );
            let weeks = [];
            let current = new Date(startDate);
            let weekCount = 1;

            while (current <= lastDayPrevMonth) {
              weeks.push(`Week ${weekCount}`);
              current.setDate(current.getDate() + 7);
              weekCount++;
            }

            //Added on 17/2/25
            if (this.labelTextForSlider == 'Apply For Current Month') {
              weeks.splice(2);
            }

            //Commented on 14/02/25
            this.availableWeeks = this.availableWeeks.filter(
              (item, index) => index < weeks.length
            );

            //Added on 14/02/25
            // this.availableWeeks = this.availableWeeks.filter((item, index) => index <= weeks.length);
            const Firstweek = this.availableWeeks[0];

            for (let i = 0; i < this.availableWeeks.length; i++) {
              const week = this.availableWeeks[i];
              const SelectedWeek = week.week;
              const WeekName =
                SelectedWeek.split(' ')[0] + ' ' + SelectedWeek.split(' ')[1];
              const dateRange = SelectedWeek.split('(')[1].split(')')[0];

              const isDayPresent = week.days.some(
                (day) => day.dayName === this.selectedAvailableDay
              );
              const isWeekPresent = week.week == Firstweek.week;

              // && isWeekPresent commented on 03/02/25
              if (isDayPresent) {
                const timeRowsByDay = this.timeRows.map((row) => ({
                  startTime: row.startTime,
                  endTime: row.endTime,
                  option: labelText,
                  dayName: this.selectedAvailableDay,
                  week: WeekName,
                  dateRange: dateRange,
                }));
                this.timeRowsByDayForList.push(...timeRowsByDay);
              }
            }
          }
        }
      } else if (labelText == 'Apply For Current Week') {
        if (this.isCurrentWeekOptionVisible) {
          for (let i = 0; i < this.availableWeeks.length; i++) {
            const week = this.availableWeeks[i];
            const SelectedWeek = week.week;
            const WeekName =
              SelectedWeek.split(' ')[0] + ' ' + SelectedWeek.split(' ')[1];
            const dateRange = SelectedWeek.split('(')[1].split(')')[0];

            const timeRowsByDay = this.timeRows.map((row) => ({
              startTime: row.startTime,
              endTime: row.endTime,
              option: labelText,
              dayName: this.selectedAvailableDay,
              week: WeekName,
              dateRange: dateRange,
            }));
            this.timeRowsByDayForList.push(...timeRowsByDay);
          }
        } else {
          if (this.startDate && this.endDate) {
            let startDate = new Date(this.startDate);
            let endDate = new Date(this.endDate);

            let currentDayOfWeek = startDate.getDay(); // Get the day of the week for startDate
            let daysUntilEndOfWeek = (7 - currentDayOfWeek) % 7; // Calculate days until the end of the week (Sunday)
            let lastDayOfCurrentWeek = new Date(startDate);
            lastDayOfCurrentWeek.setDate(
              startDate.getDate() + daysUntilEndOfWeek
            );

            let weeks = [];
            let current = new Date(startDate);
            let weekCount = 1;

            if (currentDayOfWeek !== 1) {
              current.setDate(current.getDate() + ((8 - currentDayOfWeek) % 7));
            }

            while (current <= endDate) {
              let weekEndDate = new Date(current);
              weekEndDate.setDate(current.getDate() + 6);
              weeks.push(`Week ${weekCount}`);
              current.setDate(current.getDate() + 7);
              weekCount++;
            }

            //Added on 14/2/25
            if (this.labelTextForSlider == 'Apply For Current Week') {
              weeks.splice(1);
            }

            this.availableWeeks = this.availableWeeks.filter(
              (item, index) => index < weeks.length
            );
            for (let i = 0; i < this.availableWeeks.length; i++) {
              const week = this.availableWeeks[i];
              const SelectedWeek = week.week;
              const WeekName =
                SelectedWeek.split(' ')[0] + ' ' + SelectedWeek.split(' ')[1];
              const dateRange = SelectedWeek.split('(')[1].split(')')[0];

              const timeRowsByDay = this.timeRows.map((row) => ({
                startTime: row.startTime,
                endTime: row.endTime,
                option: labelText,
                dayName: this.selectedAvailableDay,
                week: WeekName,
                dateRange: dateRange,
              }));
              this.timeRowsByDayForList.push(...timeRowsByDay);
            }
          }
        }
      } else {
        const timeRowsByDay = this.timeRows.map((row) => ({
          startTime: row.startTime,
          endTime: row.endTime,
          option: labelText,
          dayName: this.selectedAvailableDay,
          week: this.selectedWeekName,
          dateRange: this.dateRange,
        }));
        this.timeRowsByDayForList.push(...timeRowsByDay);
      }
    }

    if (this.isEditMode && this.editRowIndex !== null) {
      if (labelText == 'None') {
        const filteredEditRecord = Object.entries(this.groupedTimeSlots)
          .filter(([week, days]) => week === this.selectedWeekName)
          .flatMap(([_, days]) =>
            Object.entries(days)
              .filter(([day]) => day === this.selectedDay)
              .flatMap(([_, records]) => records)
          );

        const removedRecord = filteredEditRecord.splice(
          this.editRowIndex,
          1
        )[0];
        const indexInList = this.timeRowsByDayForList.findIndex(
          (item) =>
            item.startTime === removedRecord.startTime &&
            item.endTime === removedRecord.endTime &&
            item.option === removedRecord.option &&
            item.dayName === removedRecord.dayName
        );

        if (indexInList !== -1) {
          this.timeRowsByDayForList.splice(indexInList, 1);
        }
      } else if (
        this.labelTextForSlider == 'Apply For Current Month' ||
        this.labelTextForSlider == 'Apply For Whole Calendar'
      ) {
        const filteredEditRecord = Object.entries(
          this.groupedTimeSlots
        ).flatMap(([_, days]) =>
          Object.entries(days)
            .filter(([day]) => day === this.selectedDay)
            .flatMap(([_, records]) => records)
        );

        if (
          this.editRowIndex < 0 ||
          this.editRowIndex >= filteredEditRecord.length
        ) {
          // console.error("Invalid editRowIndex:", this.editRowIndex);
          return;
        }

        const editRecord = filteredEditRecord[this.editRowIndex];
        this.timeRowsByDayForList = this.timeRowsByDayForList.filter(
          (item) =>
            !(
              item.startTime === editRecord.startTime &&
              item.endTime === editRecord.endTime &&
              item.option === editRecord.option &&
              item.dayName === editRecord.dayName
            )
        );

      } else {
        const filteredEditRecord = Object.entries(
          this.groupedTimeSlots
        ).flatMap(([_, days]) =>
          Object.entries(days)
            .filter(([day]) => day === this.selectedDay)
            .flatMap(([_, records]) => records)
        );

        const weeksCount = Object.keys(this.groupedTimeSlots).length;
        // const removedRecords = filteredEditRecord.splice(0, weeksCount);
        //Added on 03/2/25
        const removedRecords = filteredEditRecord.splice(
          this.editRowIndex,
          weeksCount
        );
        removedRecords.forEach((removedRecord) => {
          const indexInList = this.timeRowsByDayForList.findIndex(
            (item) =>
              item.startTime === removedRecord.startTime &&
              item.endTime === removedRecord.endTime &&
              item.option === removedRecord.option &&
              item.dayName === removedRecord.dayName
          );

          if (indexInList !== -1) {
            this.timeRowsByDayForList.splice(indexInList, 1);
          }
        });
      }

      this.isEditMode = false;
      this.editRowIndex = null;

      const timeRowsByDay = this.timeRows.map((row) => ({
        startTime: row.startTime,
        endTime: row.endTime,
        option: labelText,
        dayName: this.selectedAvailableDay,
        week: this.selectedWeekName,
      }));
      // this.timeRowsByDayForList.push(...timeRowsByDay);
    }

    this.groupedTimeSlots = this.timeRowsByDayForList.reduce((acc, current) => {
      const week = current.week;
      const day = current.dayName;
      if (!acc[week]) {
        acc[week] = {};
      }
      if (!acc[week][day]) {
        acc[week][day] = [];
      }
      acc[week][day].push(current);
      return acc;
    }, {});

    //Commented on 31/01/25
    //this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);

    //Added on 31/01/25
    if (this.labelTextForSlider == 'Apply For Whole Calendar') {
      var WeekNames = this.timeRowsByDayForList
        .filter((x) => x.dayName === this.selectedDay)
        .map((x) => x.week);
      this.filterRecordsByWeekAndDay(WeekNames[0], this.selectedDay);
    } else {
      this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);
    }


    this.timeRows = [];
    this.isAddedSlot = true;
    this.addRow();
  }

  deleteRow(row: any, rowIndex: number) {

    // Remove from timeRowsByDayForList
    if (this.labelTextForSlider != 'None') {
      if (
        this.timeRowsByDayForList &&
        Array.isArray(this.timeRowsByDayForList)
      ) {
        let filteredRecords = this.timeRowsByDayForList.filter(
          (record) => record.dayName === row.dayName
        );
        if (rowIndex >= 0 && rowIndex < filteredRecords.length) {
          let recordToRemove = filteredRecords[rowIndex];
          this.timeRowsByDayForList = this.timeRowsByDayForList.filter(
            (record) =>
              !(
                record.startTime === recordToRemove.startTime &&
                record.endTime === recordToRemove.endTime &&
                record.dayName === recordToRemove.dayName &&
                record.option === recordToRemove.option
              )
          );

        } else {
          // console.warn(`Error: rowIndex ${rowIndex} out of bounds for dayName: ${row.dayName}`);
        }
      }

      if (this.groupedTimeSlots) {
        Object.keys(this.groupedTimeSlots).forEach((week: string) => {
          let weekSlots = this.groupedTimeSlots[week];
          if (weekSlots && typeof weekSlots === 'object') {
            let daySlots = weekSlots[row.dayName];
            if (
              Array.isArray(daySlots) &&
              rowIndex >= 0 &&
              rowIndex < daySlots.length
            ) {
              daySlots.splice(rowIndex, 1);
              if (daySlots.length === 0) {
                delete weekSlots[row.dayName];
              }

            }
          }
        });
      }
    } else {
      if (
        this.timeRowsByDayForList &&
        Array.isArray(this.timeRowsByDayForList)
      ) {
        let filteredRecords = this.timeRowsByDayForList.filter(
          (record) => record.dayName === row.dayName
        );
        if (rowIndex >= 0 && rowIndex < filteredRecords.length) {
          let recordToRemove = filteredRecords[rowIndex];
          let actualIndex = this.timeRowsByDayForList.findIndex(
            (record) =>
              record.startTime === recordToRemove.startTime &&
              record.endTime === recordToRemove.endTime &&
              record.dayName === recordToRemove.dayName &&
              record.week === recordToRemove.week
          );

          if (actualIndex !== -1) {
            this.timeRowsByDayForList.splice(actualIndex, 1);
          }
        } else {
          // console.error("Error: rowIndex out of bounds for dayName:", row.dayName);
        }
      }

      // Remove from groupedTimeSlots
      if (this.groupedTimeSlots && row.week in this.groupedTimeSlots) {
        let weekSlots = this.groupedTimeSlots[row.week];
        if (
          weekSlots &&
          weekSlots[row.dayName] &&
          Array.isArray(weekSlots[row.dayName])
        ) {
          let daySlots = weekSlots[row.dayName];
          if (
            Array.isArray(daySlots) &&
            rowIndex >= 0 &&
            rowIndex < daySlots.length
          ) {
            daySlots.splice(rowIndex, 1);
          }
        }
      }
    }

    this.filteredDayNameAfterAdded = '';
    this.filteredWeekAfterAdded = '';
    this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);
  }

  validateTime(row: any): void {
    if (row.startTime && row.endTime && row.startTime >= row.endTime) {
      row.isInvalid = true;
    } else {
      row.isInvalid = false;
    }
  }

  onDaySelect(day: string) {
    this.selectedDay = day;
    this.isSelectDay = true;

    if (this.selectedWeekName == '') {
      const week = this.availableWeeks[this.currentWeekIndex];
      this.SelectedWeek = week.week;
      this.selectedWeekName =
        this.SelectedWeek.split(' ')[0] + ' ' + this.SelectedWeek.split(' ')[1];
    }
    this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);
  }

  editRow(row: any, rowIndex: number) {
    this.timeRows = [
      {
        startTime: row.startTime,
        endTime: row.endTime,
      },
    ];
    this.selectedDay = row.dayName;
    this.editRowIndex = rowIndex;
    this.isEditMode = true;
    $('#Addupdateslotbutton').html('Update Slot');
  }

  initDatePickers(): void {
    const self = this;
    const currentDate = new Date();

    if (
      this.TOCModalRegistration &&
      this.TOCModalRegistration.get('partTimeStartDate') &&
      this.TOCModalRegistration.get('partTimeEndDate')
    ) {
      this.startDatePickerInstance = flatpickr('#startDate', {
        mode: 'single',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'F j, Y',
        allowInput: true,
        minDate: currentDate,
        onChange(selectedDates: any) {
          if (selectedDates.length === 1) {
            const selectedDate = selectedDates[0];
            const formattedStartDate = self.datePipe.transform(
              selectedDate,
              'yyyy-MM-dd'
            );
            if (formattedStartDate) {
              self.TOCModalRegistration.patchValue({
                partTimeStartDate: formattedStartDate,
              });
            }

            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            // self.endDatePickerInstance.set('minDate', nextDay);
            if (
              self.endDatePickerInstance &&
              typeof self.endDatePickerInstance.set === 'function'
            ) {
              self.endDatePickerInstance.set('minDate', nextDay);
            }
          }
        },
        locale: {
          firstDayOfWeek: 1,
        },
      });

      // End Date Picker
      this.endDatePickerInstance = flatpickr('#endDate', {
        mode: 'single',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'F j, Y',
        allowInput: true,
        minDate: currentDate,
        onChange(selectedDates: any) {
          if (selectedDates.length === 1) {
            const selectedDate = selectedDates[0];
            const formattedEndDate = self.datePipe.transform(
              selectedDate,
              'yyyy-MM-dd'
            );
            if (formattedEndDate) {
              self.TOCModalRegistration.patchValue({
                partTimeEndDate: formattedEndDate,
              });
            }
          }
        },
        locale: {
          firstDayOfWeek: 1,
        },
      });
    } else {
      // console.error("FormGroup or controls are not properly initialized.");
    }
  }

  async onSubmit() {
    this.spinner.show();
    if (this.TOCRegistration.valid) {
      if (
        this.TOCModalRegistration.value.partTimeStartDate == null ||
        this.TOCModalRegistration.value.partTimeStartDate == ''
      ) {
        this.ValidatorForAvailability = true;
        this.spinner.hide();
        return;
      }

      if (this.selectedDayCareIds.length == 0) {
        this.toastr.warning('Select atleast one day Care');
        this.spinner.hide();
        return;
      }

      this.TOCRegistration.patchValue({
        centerID: 0,
        jobPostID: 0,
        loginUserID: this.UserId,
        jobTypeID: 3,
        preferredArea: this.selectedDayCareIds.toString(),
      });

      try {
        this.TOCRegistration.patchValue({
          partTimeStartDate: this.TOCModalRegistration.value.partTimeStartDate,
          partTimeEndDate: this.TOCModalRegistration.value.partTimeEndDate,
        });

        //selected Day cares
        let commaSeparatedDaycares = this.selectedDayCareIds.join(',');
        this.TOCRegistration.patchValue({
          preferredArea: commaSeparatedDaycares,
        });

        const combinedData = {
          Data: this.TOCRegistration.value,
          SlotTime: this.groupedTimeSlots,
        };

        // Save the data to the server
        const data = await this.tocservice
          .ManageTOCMoreCentre(combinedData)
          .toPromise();

        if (data.message === 'ok') {
          this.isTocUser = true;
          this.spinner.hide();
          this.toastr.success('Data saved successfully');
          $('#addMoreCentre').modal('hide');
          this.resetForm();
          this.spinner.hide();
          this.getTOCUserCentreListById(this.UserId);
          // this.router.navigate(['/profile']);
        } else {
          this.spinner.hide();
          this.toastr.error(data.message);
        }
      } catch (error) {
        this.spinner.hide();
        this.toastr.error('An error occurred while saving data');
      }
    } else {
      this.spinner.hide();
      this.TOCRegistration.markAllAsTouched();
      if (
        this.TOCModalRegistration.value.partTimeStartDate == null ||
        this.TOCModalRegistration.value.partTimeStartDate == ''
      ) {
        this.ValidatorForAvailability = true;
      }
      this.spinner.hide();
    }
  }

  resetForm() {
    this.TOCRegistration.reset({
      id: 0,
      qualificationID: '',
      experience: null,
      message: '',
      isActive: true,
      jobPostID: 0,
      loginUserID: 0,
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      // partTimeStartDate: null,
      // partTimeEndDate: null,
      partTimeWorkingDays: '',
      expertise: '',
      uploadResume: '',
      documentImagePath: null,
      documentImage: null,
      jobTypeID: null,
      statusID: 3,
    });

    this.selectedDayCareIds = [];
    this.NearbyDayCareList = [];

    this.daysOfWeek.forEach((day) => {
      const checkbox = document.getElementById(day) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = false;
      }
    });

    this.cdr.detectChanges();
    this.resetDatePickers();

    this.timeRowsByDay = {};
    this.timeRowsByDayForBo = {};
    this.ValidatorForAvailability = false;

    //forSlotmodal
    this.timeRows = [];
    this.showBoxIndex = null;
    this.selectedDay = '';
    this.availableDays = [];
    this.isAddedSlot = true;
    this.isSelectDay = true;
    this.isSelectOption = true;
    this.TOCModalRegistration.reset();
    this.addRow();
  }

  get f() {
    return this.loginForm.controls;
  }
}
