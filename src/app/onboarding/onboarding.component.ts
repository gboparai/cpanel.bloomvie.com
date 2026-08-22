import {
  Component,
  effect,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HeaderComponent } from '../layout/header/header.component';
import { ManageDaycareComponent } from '../day-care-management/manage-daycare/manage-daycare.component';
import { WorkTimingsComponent } from '../day-care-management/work-timings/work-timings.component';
import { SmtpComponent } from '../settings/smtp/smtp.component';
import { OnboardingService } from './onboarding.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../common-component/common.service';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DaycareService } from '../day-care-management/day-care-settings/daycare.service';
import { ManageDaycareService } from '../day-care-management/manage-daycare/manage-daycare.service';
import { CookieService } from 'ngx-cookie-service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ManageClassroomComponent } from '../day-care-management/classroom-management/manage-classroom/manage-classroom.component';
import { ManageStaffComponent } from '../day-care-management/staff-management/add-staff/manage-staff.component';
import { SocialLinksComponent } from '../settings/application-settings/social-links/social-links.component';
import { AddStudentComponent } from '../day-care-management/student-management/add-student/add-student.component';
import { ManageStudentComponent } from '../day-care-management/student-management/manage-student/manage-student.component';
import { GeneralSettingComponent } from '../settings/general-setting/general-setting.component';
import { CommonModule } from '@angular/common';
import { PlanCreationComponent } from './plan-creation/plan-creation.component';
import { AssignClassComponent } from '../day-care-management/staff-management/assign-class/assign-class.component';
import { ProfileService } from '../common-component/profile/profile.service';
import { LeaveManagementComponent } from '../day-care-management/leave-management/leave-management.component';
import { ManageMasterLeaveComponent } from '../bloomvie-management/manage-master-leave/manage-master-leave.component';
import { LoginService } from '../login/login.service';
import { finalize } from 'rxjs/operators';
import { SchedulerComponent } from '../common-component/scheduler/scheduler.component';

declare var $: any;

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    HeaderComponent,
    ManageDaycareComponent,
    WorkTimingsComponent,
    SmtpComponent,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    ManageClassroomComponent,
    ManageStaffComponent,
    SocialLinksComponent,
    AddStudentComponent,
    ManageStudentComponent,
    GeneralSettingComponent,
    CommonModule,
    PlanCreationComponent,
    AssignClassComponent,
    LeaveManagementComponent,
    ManageMasterLeaveComponent,
    SchedulerComponent,
  ],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent implements OnInit, OnDestroy {
  public dayCareID: number = 0;
  public classSetupForm: any;
  public studentForm: any;
  private loginUserID: number = 0;
  public classList: any[] = [];
  public ageGroupList: any[] = [];
  public arrayIndex: any;
  public studentList: any[] = [];
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;
  UserIDByfrontend: any;
  daycare: any;
  public plan: any;
  public userRoleID: number = 0;
  public planName: string = '';

  constructor(
    public onBoardingService: OnboardingService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private commonservice: CommonService,
    private cookie: CookieService,
    private profileService: ProfileService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.onBoardingService.isOnboarding = true;
    this.route.queryParamMap.subscribe((params) => {
      const enc_id = params.get('enc_id');
      if (enc_id) {
        const decryptedId = this.commonservice.decrypt(enc_id);
        this.dayCareID =
          decryptedId && !isNaN(Number(decryptedId))
            ? parseInt(decryptedId, 10)
            : 0;
        if (this.cookie.check('UserId')) {
          this.loginUserID = parseInt(this.cookie.get('UserId'));
          this.userRoleID = parseInt(this.cookie.get('userRoleID'));
        }
      } else {
        if (
          this.loginService.authData?.centreId &&
          this.loginService.authData.userId &&
          this.loginService.authData.userRoleId
        ) {
          this.dayCareID = this.loginService.authData?.centreId;
          this.loginUserID = this.loginService.authData?.userId;
          this.userRoleID = this.loginService.authData?.userRoleId;
        }
      }
    });
    if (this.dayCareID) {
      this.getDayCareOnBoardingCurrentTab();
      this.getPlanDetail();
    }
  }

  ngOnDestroy(): void {
    this.onBoardingService.isOnboarding = false;
  }

  getDayCareOnBoardingCurrentTab() {
    this.spinner.show();
    this.onBoardingService
      .getDayCareOnBoardingCurrentTab(this.dayCareID)
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.onBoardingService.onBoardingData = response.result;
            this.onBoardingService.getCurrentTab();
          }
          this.spinner.hide();
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
  }

  getPlanDetail() {
    this.spinner.show();
    this.profileService
      .getSubscriptionPlanByUserId(
        this.loginUserID,
        this.userRoleID,
        'Active',
        ''
      )
      .subscribe((data) => {
        if (data.message == 'OK') {
          this.plan = data.result;
          this.planName = this.plan[0].planName;
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
  }
}
