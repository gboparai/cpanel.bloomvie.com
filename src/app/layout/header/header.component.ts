import {
  ChangeDetectorRef,
  Component,
  OnInit,
  effect,
  Output,
  EventEmitter,
  NgZone,
} from '@angular/core'; // Import OnInit lifecycle hook
import { Router, RouterLink } from '@angular/router';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
import { environment } from '../../../environments/environment.development';
import { UserRoleService } from '../../settings/Permission/user-role/user-role.service';
import { ProfileService } from '../../common-component/profile/profile.service';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { HeaderServiceService } from './header-service.service';
import { TimeDifferencePipe } from '../../custom-pipes/time-difference.pipe';
import { ProfileComponent } from '../../common-component/profile/profile.component';
import * as CryptoJS from 'crypto-js';
import { WelcomeService } from '../../welcome/welcome.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { CommonService } from '../../common-component/common.service';
import { LoginService } from '../../login/login.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { finalize } from 'rxjs/operators';
import { SkeletonLoaderComponent } from '../../common-component/skeleton-loader/skeleton-loader.component';
import { BloomvieSettingsComponent } from '../../bloomvie-management/bloomvie-settings/bloomvie-settings.component';
declare var $: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    TimeDifferencePipe,
    ProfileComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  loginUserEmail: string = '';
  loginUserName: string = '';
  loginUserId: number = 0;
  loginUserRoleId: number = 0;
  expressLoginLink: string = '';

  // Implements OnInit
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  frontendWebUrl: string = environment.frontEndWebUrl;
  imageurl: string = ''; // Declare and initialize 'imageurl'
  bloomvie: any;
  headerlogo: any;
  imageMain: any;
  role: any;
  header: any;
  data: any;
  username: any;
  notification: any = [];
  Appointment: any;
  hideButton = false;
  teacherNotification: any;
  centreId: number = 0;
  notificationCount = 0;
  Notification: any;
  commentNotification: any;
  type: any;
  parentNotification: any;
  notificationID: any;
  DaycareLogo: any;
  allStudents: any = [];
  studentID: any = 0;
  plan: any[] = [];
  centreName: any;
  headerImage: string = '';
  studentId = 0;
  private refreshInterval: any;
  @Output() headerLoad = new EventEmitter<any>();
  skeletonShow = 'Skelton';

  isDataFullyLoad: boolean = false;
  isHeaderInitialized: boolean = false;
  constructor(
    private ngZone: NgZone,
    private headerService: HeaderServiceService,
    private Appservice: ApplicationsSettingsService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private welcome: WelcomeService,
    private roleservice: UserRoleService,
    private spinner: NgxSpinnerService,
    private cookie: CookieService,
    private profileService: ProfileService,
    private router: Router,
    private toastr: ToastrService,
    private commonService: CommonService,
    public loginService: LoginService,
    public onBoardingService: OnboardingService
  ) {
    effect(() => {
      this.headerService.newStudent();
      this.getAllStudentsForParent();

      this.commonService.headerImage();
      this.getProfileDetailsHeaderComponent();

      this.commonService.triggerSignal();
      this.getNotifications();

      this.commonService.triggerLogoSignal();
      if (
        this.centreId &&
        this.loginUserRoleId != 5 &&
        this.loginUserRoleId != 6
      ) {
        this.getLogos();
      }
    });
  }

  async ngOnInit() {
    this.getCookies();
    this.subscribeToBreadcrumbs();
    this.subscribeToNotifications();
    this.setUserDetails();
    if (
      this.centreId &&
      this.loginUserRoleId != 5 &&
      this.loginUserRoleId != 6
    ) {
      this.getLogos();
    }

    if (this.loginUserRoleId === 5) {
      await this.handleParentUser();
    }

    // if (this.loginUserRoleId === 3 || this.loginUserRoleId === 5) {
    //   this.getPlanDetail();
    // }

    if (this.loginUserRoleId === 3) {
      this.getPlanDetail();
    }
    this.getNotifications(); // Initial fetch

    if ([3, 4].includes(this.loginUserRoleId)) {
      this.getAccontDeatils();
    }
    this.getPlatFormFeePercent();
    this.getProfileDetailsHeaderComponent();
  }

  private getCookies() {
    this.loginService.loadUserFromStorage();
    this.studentID = this.cookie.get('StudentID');
  }

  getPlatFormFeePercent() {
    this.commonService.getBloomvieSettings(1).subscribe({
      next: (response) => {
        this.commonService.setPlatFormFee(
          response?.result?.platformFeePercentage || 0
        );
      },
    });
  }

  private setUserDetails() {
    const authData = this.loginService.authData;
    this.centreId = authData?.centreId || 0;
    this.loginUserRoleId = authData?.userRoleId || 0;
    this.loginUserId = authData?.userId || 0;
    this.loginUserEmail = authData?.email || '';
    this.loginUserName = authData?.name || '';
  }

  private subscribeToBreadcrumbs() {
    this.Appservice.breadcrumb$.subscribe((data) => {
      this.imageMain = data;
    });
  }

  private subscribeToNotifications() {
    this.headerService.notification?.subscribe({
      next: (hasNotification) => {
        if (hasNotification) {
          this.getNotifications();
        }
      },
    });
  }

  private async handleParentUser() {
    await this.getAllStudentsForParent();
    this.studentID = this.cookie.get('StudentID')
      ? parseInt(this.cookie.get('StudentID'), 10)
      : 0;

    this.CheckParentOnboarding(this.loginUserId);
  }

  loadHeader() {
    if (this.isDataFullyLoad) {
      this.headerLoad.emit(true);
    }
  }

  // ngOnDestroy(): void {
  //   if (this.refreshInterval) {
  //     clearInterval(this.refreshInterval);
  //   }
  // }

  getPlanDetail() {
    this.profileService
      .getSubscriptionPlanByUserId(
        this.loginUserId,
        this.loginUserRoleId,
        'Active',
        ''
      )
      .subscribe((data) => {
        if (data.message != 'OK') {
          // this.toastr.error('Error Fetching Details!');
          return;
        }
        if (data.message === 'OK') {
          data.result.forEach((item: any) => {
            const isPlanExists = this.plan.find(
              (planInfo: any) => planInfo.planID == item.planID
            );
            if (!isPlanExists) {
              this.plan.push(item);
            }
          });

          // Sort plans by ID (latest first)
          this.plan.sort((a: any, b: any) => b.id - a.id);
          if (this.plan.length > 0) {
            const latestPlan = this.plan[0]; // Get the latest plan
            // Check if the latest plan has planOwnerID == 3
            if (latestPlan.planOwnerID == 3) {
              this.plan.slice(1).forEach((oldPlan: any) => {
                // Modify older plans
                oldPlan.featureList.forEach((feature: any) => {
                  if (
                    feature.featureName.toLowerCase().includes('job posting')
                  ) {
                    feature.featureName = feature.featureName; // Keep the name
                    feature.isJobPostingDisabled = true; // Add flag for strikethrough
                  }
                });
              });
            }
          }

          // If loginUserRoleId == 3 or 5, store job posting counts in cookies
          // if (this.loginUserRoleId == 3 || this.loginUserRoleId == 5) {
          //   this.plan.forEach((val: any) => {
          //     if (val.planOwnerID === 3 || val.planOwnerID == 1) {
          //       // checking for job post feature
          //       val.featureList.forEach((item: any) => {
          //         // if the jobposttype of feature is true it is job post type feature of the plan
          //         if (item.jobPostType == true) {
          //           // storing the count of the feature
          //           const jobPostingCounts = item.capacity;
          //           this.cookie.set('jobPostCount', jobPostingCounts);
          //         }
          //         return;
          //       });
          //     }
          //   });
          // }

          if (this.loginUserRoleId == 3 || this.loginUserRoleId == 5) {
            for (let i = 0; i < this.plan.length; i++) {
              let checkJobPostCountInCookie = this.cookie.check('jobPostCount');
              if (!checkJobPostCountInCookie) {
                if (
                  this.plan[i].planOwnerID === 3 ||
                  this.plan[i].planOwnerID === 1
                ) {
                  // checking for job post feature
                  let featureList = this.plan[i].featureList;
                  for (let j = 0; j < featureList.length; j++) {
                    // if the jobposttype of feature is true it is job post type feature of the plan
                    if (featureList[j].jobPostType == true) {
                      const jobPostCount = featureList[j].capacity;
                      this.cookie.set('jobPostCount', jobPostCount);
                      break;
                    }
                  }
                }
              } else {
                break;
              }
            }
          }
        }
      });
  }

  getProfileDetailsHeaderComponent() {
    this.skeletonShow = 'Skelton';
    this.profileService
      .GetUserById(this.loginUserId, this.loginUserRoleId)
      .subscribe((data) => {
        if (data.message == 'Success') {
          this.data = data.result;
          if (this.loginUserRoleId == 3) {
            this.commonService.daycareCentreInformation.update(
              (currentValue: any) => ({
                ...currentValue,
                dayCareCentreName: this.data.centreName,
              })
            );
          }

          if (this.loginUserRoleId == 5) {
            this.studentID = this.cookie.get('StudentID')
              ? parseInt(this.cookie.get('StudentID'), 10)
              : 0;
            if (this.studentID > 0) {
              let fullStudentName = data.result.studentList.find(
                (item: any) => item.id == this.studentID
              );
              this.username = fullStudentName.lastName
                ? fullStudentName.firstName + ' ' + fullStudentName.lastName
                : fullStudentName.firstName;
              const student = this.allStudents.find(
                (x: { id: number }) => x.id === this.studentID
              );

              if (student) {
                // let studentLastName = student.lastName ? student.lastName : '';
                // this.username = student.firstName + ' ' + studentLastName;

                const imageFullPaths: any =
                  student.profilePhotoPath && student.profilePhoto
                    ? student.profilePhotoPath + '/' + student.profilePhoto
                    : '';

                if (imageFullPaths) {
                  this.getS3FileName(imageFullPaths);
                }
                this.centreName = student.centreName ?? '';
                this.skeletonShow = '';
              } else {
                // this.username = 'user not found';
                this.skeletonShow = '';
              }
            } else {
              let studentMiddleName = data.result.studentList[0].middleName
                ? data.result.studentList[0].middleName
                : '';
              let studentLastName = data.result.studentList[0].lastName
                ? data.result.studentList[0].lastName
                : '';

              this.username =
                data.result.studentList[0].firstName +
                ' ' +
                studentMiddleName +
                ' ' +
                studentLastName;
              this.cookie.set(
                'StudentID',
                data.result.studentList[0].id.toString()
              );

              //Added on 15/04/25 Arsh
              const today = new Date();
              var studentID = this.cookie.get('StudentID');

              if (studentID == '') {
                const matchingStudents = data.result.studentList.filter(
                  (student: { id: string; dueDate: string | number | Date }) =>
                    new Date(student.dueDate) >= today
                );

                if (matchingStudents.length > 0) {
                  const studentId = matchingStudents[0].id;
                  this.cookie.set('StudentID', studentId.toString());
                  let studentMiddleName = matchingStudents[0].middleName
                    ? matchingStudents[0].middleName
                    : '';
                  let studentLastName = matchingStudents[0].lastName
                    ? matchingStudents[0].lastName
                    : '';
                  this.username =
                    matchingStudents[0].firstName +
                    ' ' +
                    studentMiddleName +
                    ' ' +
                    studentLastName;

                  this.skeletonShow = '';
                } else {

                }
              } else {
                const matchingStudents = data.result.studentList.filter(
                  (student: { id: any; dueDate: string | number | Date }) =>
                    new Date(student.dueDate) >= today &&
                    student.id == studentID
                );

                if (matchingStudents.length > 0) {
                  const studentId = matchingStudents[0].id;
                  this.cookie.set('StudentID', studentId.toString());
                  let studentMiddleName = matchingStudents[0].middleName
                    ? matchingStudents[0].middleName
                    : '';
                  let studentLastName = matchingStudents[0].lastName
                    ? matchingStudents[0].lastName
                    : '';
                  this.username =
                    matchingStudents[0].firstName +
                    ' ' +
                    studentMiddleName +
                    ' ' +
                    studentLastName;
                } else {

                }
              }
              this.cookie.set(
                'CentreID',
                data.result.studentList[0].centreID.toString()
              );

              // this.cookie.set(
              //   'StudentID',
              //   data.result.studentList[0].id.toString()
              // );
            }
            this.skeletonShow = '';
          } else {
            const imageFullPaths: any = this.data.filePath
              ? this.data.filePath + '/' + this.data.fileName
              : null;

            if (imageFullPaths != null) {
              this.getS3FileName(imageFullPaths);
            }
            let MiddleName = data.result.middleName
              ? data.result.middleName
              : '';
            let LastName = data.result.lastName ? data.result.lastName : '';
            this.username =
              data.result.firstName + ' ' + MiddleName + ' ' + LastName;
          }
          this.skeletonShow = '';
        } else {
          this.data = data.message;
          this.skeletonShow = '';
        }
      });
  }

  getS3FileName(fileName: Blob) {
    this.commonService.getS3FileByName(fileName).subscribe(
      (blob: Blob) => {
        const imageUrl = URL.createObjectURL(blob);
        this.headerImage = imageUrl;
      },
      (error) => {
        console.error('Failed to fetch S3 image', error);
      }
    );
  }

  getRouterLink(): string {
    switch (this.loginUserRoleId) {
      case 1:
        return '/dashboard';
      case 3:
        return '/daycare-dashboard';
      case 4:
        return '/teachers-dashboard';
      case 5:
        return '/parent-dashboard';
      case 6:
        return '/counsellor-dashboard';
      default:
        return '/';
    }
  }

  // checking that onBoarding is complete or not
  CheckParentOnboarding(userId: number) {
    this.headerService
      .CheckParentOnboarding(userId)
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          this.hideButton = true;
        } else {
          this.hideButton = false;
        }
      });
  }
  //
  getApplicationSettings() {
    this.Appservice.GetApplicationSetting().subscribe((data) => {
      if (data.message === 'Success') {
        this.bloomvie = $('#businessname').text(data.result.businessName);
      }
    });
  }
  GetUserRoles() {
    this.roleservice
      .getUserRolesByID(this.loginUserRoleId)
      .subscribe((data) => {
        if (data.message == 'Ok') {
          this.role = data.result.userRole;
        } else {
          // console.error(data.message);
        }
      });
  }
  getLogos() {
    this.welcome.getDaycareLogos(this.centreId).subscribe((data) => {
      if (data.message == 'OK') {
        this.DaycareLogo = data.result
          ? this.commonService.convertS3File(data.result)
          : '';

        this.commonService.daycareCentreInformation.update(
          (currentValue: any) => ({
            ...currentValue,
            dayCareCentreLogo: this.DaycareLogo,
          })
        );
      } else {
        // this.DaycareLogo = data.message;
        this.DaycareLogo = [];
      }
    });
  }

  //Commented on 01/07/25
  // getNotifications() {
  //   let userId;
  //   if (this.loginUserRoleId === 5) {
  //     userId = this.studentID;
  //   } else {
  //     userId = this.loginUserId;
  //   }

  //   this.Appservice.GetNofications(userId).subscribe((data) => {
  //     if (data.message === 'ok') {
  //       this.notification = data.result;

  //       this.isDataFullyLoad = true;
  //       this.loadHeader();
  //     } else {
  //       this.isDataFullyLoad = true;
  //       this.loadHeader();
  //       this.notification = [];
  //     }
  //   });
  // }

  //Updated on 01/07/25
  getNotifications() {
    let userId;
    // if (this.loginUserRoleId === 5) {
    //   userId = this.studentID;
    // } else {
    //   userId = this.loginUserId;
    // }
    if (this.loginUserRoleId === 5) {
      userId = this.studentID;
    } else {
      userId = this.loginUserId;
    }

    this.Appservice.GetNofications(userId).subscribe((data) => {
      if (data.message === 'ok') {
        if (this.loginUserRoleId != 8) {
          this.notification = data.result;
          this.isDataFullyLoad = true;
          this.loadHeader();
        } else {
          const centreAdminID = this.cookie.get('CentreAdminID');
          this.notification = data.result.filter(
            (x: { assignBy: string }) => x.assignBy == centreAdminID
          );
          this.isDataFullyLoad = true;
          this.loadHeader();
        }
      } else {
        this.isDataFullyLoad = true;
        this.loadHeader();
        this.notification = [];
      }
    });
  }

  setBreadCrumb() {
    this.cookie.set('Component', 'Profile');
    this.getProfileDetailsHeaderComponent();
  }

  // clearNotifications(event: Event) {
  //   this.notification.forEach((item: { id: any }) => {
  //     this.navigateToAppointments(item.id, '');
  //   });

  //   this.notification = [];
  //   this.notificationCount = 0;
  // }

  clearNotifications(event: Event) {
    this.notification.forEach((item: { id: any }) => {
      this.navigateToAppointments(item.id, item);
    });

    this.notification = [];
    this.notificationCount = 0;
  }

  navigateToAppointments(id: any, item: any) {
    const type = [42, 43, 44, 45, 46].includes(item.notificationID)
      ? 'Chat'
      : '';
    // const appointmentData = {
    //   id: id,
    //   assignTo: this.loginUserId,
    //   isRead: true,
    //   Type: type,
    //   isDelete: false,
    //   isDisabled: false,
    // };

    const appointmentData = {
      id: id,
      assignTo: this.loginUserRoleId == 5 ? this.studentID : this.loginUserId,
      isRead: true,
      Type: type,
      isDelete: false,
      isDisabled: false,
    };
    const appointmentsToUpdate = [appointmentData];
    this.Appservice.AppintmentIsRead(appointmentsToUpdate).subscribe((data) => {
      if (data.message === 'ok') {
        this.Appointment = data.result;
        this.spinner.show();
        setTimeout(() => {
          switch (true) {
            case [10, 11, 8].includes(item.notificationID):
              this.router.navigate(['/transfer-staff']);
              break;
            case [9].includes(item.notificationID):
              this.router.navigate(['/view-class-teacher']);
              break;
            case [1, 2, 3, 7].includes(item.notificationID):
              this.router.navigate(['/jobs-applied']);
              break;
            case item.notificationID === 4:
              const secretKey = 'encrypt001100!?';
              const encryptedID = CryptoJS.AES.encrypt(
                this.data.studentID.toString(),
                secretKey
              ).toString();
              this.router.navigate(['/view-student-detail'], {
                queryParams: { ID: encryptedID, TYPE: 'detail' },
              });
              break;
            case item.notificationID === 5:
              this.router.navigate(['/student-edit-gallery']);
              break;
            case item.notificationID === 13:
              this.router.navigate(['/dc-appointments-list']);
              break;
            case item.notificationID === 15:
              this.router.navigate(['/manage-classroom']);
              break;
            case item.notificationID === 35:
              this.router.navigate(['/apply-leave']);
              break;
            case item.notificationID === 24:
              this.router.navigate(['/view-staff']);
              break;
            case item.notificationID === 21:
              this.router.navigate(['/view-supply-request']);
              break;

            case item.notificationID === 27:
              this.router.navigate(['/apply-leave']);
              break;

            case [42, 43, 44, 45, 46].includes(item.notificationID):
              this.router.navigate(['/chatbox']);
              break;

            //  case item.notificationID === 29:
            // this.router.navigate(['/apply-leave'])

            default:
              console.warn('Unhandled notification ID:', item.notificationID);
              break;
          }

          this.getNotifications();
          this.spinner.hide();
        }, 500);
      }
    });
  }

  //sg(03-03-2025)
  async getAllStudentsForParent() {
    try {
      // this.spinner.show();
      const response = await this.headerService
        .getAllStudentsByParentID(this.loginUserId)
        .toPromise();
      if (response.message === 'Success') {
        // setTimeout(() => {
        //   this.spinner.hide();
        // }, 100);
        this.allStudents = response.result.map((item: any) => {
          return {
            ...item,
            s3UrlImage: item.s3ImageUrl
              ? this.commonService.convertS3File(item.s3ImageUrl)
              : '',
          };
        });
      } else {
        this.spinner.hide();
        // console.error('No data found', response.message);
      }
    } catch (error) { }
  }

  //sg(06-03-2025)
  // switchStudentProfile(id: number) {
  //
  //   const student = this.allStudents.find((x: { id: number }) => x.id === id);
  //   if (student) {
  //     this.username = student.firstName + ' ' + student.lastName;
  //     this.data.parentFileName = student.profilePhoto;
  //     this.cookie.set('StudentID', student.id.toString());
  //     $('#switchAccountModal').modal('hide');
  //     this.headerService.switchProfile.set(
  //       this.headerService.switchProfile() + 1
  //     );
  //     // Trigger change detection

  //    this.cdr.detectChanges();
  //    this.getProfileDetailsHeaderComponent()
  //     this.toastr.success('Profile Switched Successfully.');
  //   } else {
  //   }
  // }

  async switchStudentProfile(id: number) {
    this.spinner.show();
    const student = this.allStudents.find((x: { id: number }) => x.id === id);
    if (student) {
      let studentOnboardingResult = await this.headerService
        .checkStudentOnboardingCompleteOrNotByStudentID(id)
        .toPromise();
      if (studentOnboardingResult.message == 'Success') {
        this.spinner.hide();
        Swal.fire({
          title: 'Pending Onboarding !!',
          text: 'Student onboarding is still pending. Please complete the onboarding process to proceed further. ',
          icon: 'warning',
          confirmButtonText: 'proceed Onboarding',
          cancelButtonText: 'Cancel',
          showConfirmButton: true,
          showCancelButton: true,
        }).then((response: any) => {
          if (response.isConfirmed) {
            const encryptedOrderNumber = this.commonService.encrypt(
              studentOnboardingResult.result.orderNumber.toString()
            );
            const encryptedStudentID = this.commonService.encrypt(
              studentOnboardingResult.result.studentID.toString()
            );
            const token = studentOnboardingResult.result.token;

            this.cookie.set(
              'StudentID',
              studentOnboardingResult.result.studentID
            );

            this.router.navigate(['/welcome'], {
              queryParams: {
                orderNumber: encryptedOrderNumber,
                StudentID: encryptedStudentID,
                token: token,
              },
            });
          }
        });
      } else {
        this.username = student.firstName + ' ' + student.lastName;
        this.data.parentFileName = student.profilePhoto;
        this.cookie.set('StudentID', student.id.toString());
        this.cookie.set('CentreAdminID', student.centreAdminID.toString());
        const studentID = this.cookie.get('StudentID');

        $('#switchAccountModal').modal('hide');
        this.headerService.switchProfile.set(
          this.headerService.switchProfile() + 1
        );
        //   // Trigger change detection

        this.cdr.detectChanges();

        this.getProfileDetailsHeaderComponent();
        this.toastr.success('Profile Switched Successfully.');
        this.spinner.hide();

        //commented on 05/02/2025 by sarthak.

        // this.headerService
        //   .CheckStudentSubscriptionPayment(
        //     student.parentID,
        //     this.loginUserRoleId,
        //     student.id,
        //     student.centreID
        //   )
        //   .subscribe({
        //     next: (authResponse: {
        //       result: any;
        //       message: string;
        //       activity: any;
        //     }) => {
        // if (authResponse.message === 'Success') {
        //   this.studentID = parseInt(student.id);
        //   this.cookie.set('StudentID', student.id.toString());
        //   this.cookie.set('CentreID', student.centreID.toString());
        //   // this.UserId = authResponse.result.id;
        //   const UserInfo = this.cookie.get('UserInfo');
        //   if (UserInfo) {
        //     const parsedInfo = JSON.parse(UserInfo);
        //     const firstName = parsedInfo.result.firstName;
        //     const lastName = parsedInfo.result.lastName;
        //     const email = parsedInfo.result.email;
        //   }
        // }
        // //Arsh
        // else if (authResponse.message === 'Plan-Expired for Parent') {
        //   this.spinner.hide();
        //   this.cdr.detectChanges();
        //   this.getProfileDetailsHeaderComponent();

        //   Swal.fire({
        //     title: 'Subscription Expired!',
        //     text: 'Your subscription has expired. Please renew your plan.',
        //     icon: 'warning',
        //     showCancelButton: true,
        //     confirmButtonText: 'Renew Same Plan',
        //     cancelButtonText: 'Cancel',
        //   }).then((result) => {
        //     if (result.isConfirmed) {
        //       const parentType =
        //         this.commonService.encrypt('Re-Subscribe');
        //       const planencryptID = this.commonService.encrypt(
        //         String(authResponse.result.latestPlanId)
        //       );
        //       const parentUserencryptID = this.commonService.encrypt(
        //         String(authResponse.result.userId)
        //       );

        //       const userroleencryptID = this.commonService.encrypt(
        //         String(authResponse.result.loginUserRoleId)
        //       );

        //       const dayCareUserencryptID = this.commonService.encrypt(
        //         String(authResponse.result.centreAdminId)
        //       );

        //       const studentencryptID = this.commonService.encrypt(
        //         String(authResponse.result.studentId)
        //       );

        //       this.cookie.deleteAll();

        //       let params = `Userid=${parentUserencryptID}&ParentType=${parentType}&planid=${planencryptID}&DayCareID=${dayCareUserencryptID}&Studentid=${studentencryptID}`;
        //       window.location.href =
        //         this.frontendWebUrl + 'payment-details?' + params;
        //     }
        //   });
        // }

        // },
        //   error: () => {
        //     this.toastr.error('An error occurred during login');
        //     this.spinner.hide();
        //   },
        // });
      }
    } else {
    }
  }

  //helper methods
  getTimeAgo(createdDate: string): string {
    const created = new Date(createdDate);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - created.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return `${diffInSeconds} secs ago`;
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    return `${Math.floor(diffInHours / 24)} days ago`;
  }
  formatTime(time: string): string {
    const timeParts = time.split(':');
    return `${timeParts[0]}:${timeParts[1]}`;
  }
  formatDate(dateString: string | number | Date) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  filteredNotifications() {
    if (!this.notification) return [];
    return this.notification.filter((item: { notificationID: number }) => {
      switch (this.loginUserRoleId) {
        case 6:
          return [13, 42, 46].includes(item.notificationID);
        case 4:
          return [5, 15, 42, 44].includes(item.notificationID);
        case 5:
          return [4, 6, 43, 47, 48, 49, 50, 51, 52, 53, 54].includes(
            item.notificationID
          );
        case 3:
          return [
            1, 2, 3, 7, 17, 18, 21, 23, 24, 25, 26, 27, 28, 29, 36, 38, 40, 41,
            43, 45,
          ].includes(item.notificationID);
        case 1:
          return [14, 13, 16, 39, 46].includes(item.notificationID);
        default:
          return true;
      }
    });
  }

  getAccontDeatils() {
    let stripeOnboarding: string = '';
    const encruptedValue =
      this.route.snapshot.queryParamMap.get('stripeOnboarding');
    if (encruptedValue) {
      stripeOnboarding = encruptedValue
        ? this.commonService.decrypt(encruptedValue) ?? ''
        : '';
    }

    this.onBoardingService
      .getAccountDetails(this.loginUserId, stripeOnboarding)
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            this.onBoardingService.connectedAccountId.set(
              response.result.accountId
            );

            this.onBoardingService.isOnboardedAccount.set(
              response.result.isOnboarded
            );

            this.onBoardingService.stripeOnboardingStepsCount.set(
              response.result.stripeStepsCount
            );

            this.onBoardingService.stripeOnboardingUrl.set(
              response.result.onBoardingUrl
            );

            if (response.result.isOnboarded) {
              this.generateExpressLoginLink();
            }

            this.headerService.updateTriggerModal(true);
          });
        },
        error: (err) => {
          this.toastr.error(err.message);
        },
      });
  }
  generateExpressLoginLink() {
    this.spinner.show();
    this.headerService
      .generateExpressLoginLink(
        this.onBoardingService.onboardingState().connectedAccountId
      )
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (response) => {
          this.expressLoginLink = response.result.url;
        },
        error: (err) => {
          this.toastr.error(err.message);
        },
      });
  }

  navigateToStripeDashboard() {
    if (this.expressLoginLink) {
      window.open(this.expressLoginLink, '_blank');
    } else {
      console.error('Express login link is not available.');
    }
  }
}
