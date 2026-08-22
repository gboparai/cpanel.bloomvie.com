import { DaycareInvoiceComponent } from './day-care-management/invoices/daycare-invoice/daycare-invoice.component';
import { BloomvieInvoiceComponent } from './day-care-management/invoices/bloomvie-invoice/bloomvie-invoice.component';

import { AddStudentComponent } from './day-care-management/student-management/add-student/add-student.component';
import { ManageBlogComponent } from './common-component/blog/manage-blog/manage-blog.component';
import { ViewBlogComponent } from './common-component/blog/view-blog/view-blog.component';
import { EditBlogComponent } from './common-component/blog/edit-blog/edit-blog.component';
import { AddBlogComponent } from './common-component/blog/add-blog/add-blog.component';
import { ViewInvoiceComponent } from './common-component/invoice/view-invoice/view-invoice.component';
import { AddInvoiceComponent } from './common-component/invoice/add-invoice/add-invoice.component';
import { AddClassComponent } from './master-settings/add-class/add-class.component';
import { AddMasterFacilityComponent } from './master-settings/add-master-facility/add-master-facility.component';
import { AddMasterActivityComponent } from './master-settings/add-master-activity/add-master-activity.component';
import { ManageInvoiceComponent } from './common-component/invoice/manage-invoice/manage-invoice.component';
import { PaymentManagementComponent } from './common-component/payment/payment-management/payment-management.component';

import { DayCareSettingsComponent } from './day-care-management/day-care-settings/day-care-settings.component';
import { MasterFeaturesComponent } from './master-settings/master-features/master-features.component';
import { SubscriptionActivitiesComponent } from './master-settings/subscription-activities/subscription-activities.component';
import { AddFacilityComponent } from './master-settings/facilities/add-facility/add-facility.component';
import { AddAgeGroupComponent } from './master-settings/age-group/add-age-group/add-age-group.component';
import { EditBusinessComponent } from './bloomvie-management/edit-business/edit-business.component';
import { ManageBusinessComponent } from './bloomvie-management/manage-business/manage-business.component';
import { ViewBusinessComponent } from './bloomvie-management/view-business/view-business.component';
import { AddBusinessComponent } from './bloomvie-management/add-business/add-business.component';
import { SubscriptionPlanJobsComponent } from './bloomvie-management/bloomvie-subscription-plan/subscription-plan-jobs/subscription-plan-jobs.component';
import { BloomvieSubscriptionPlansComponent } from './bloomvie-management/bloomvie-subscription-plan/bloomvie-subscription-plans/bloomvie-subscription-plans.component';
import { BloomvieJobPortalComponent } from './bloomvie-management/bloomvie-job-portal/bloomvie-job-portal.component';
import { BloomvieSubscriptionFeaturesComponent } from './bloomvie-management/bloomvie-subscription-features/bloomvie-subscription-features.component';

import { AttendanceReportComponent } from './common-component/report/attendance-report/attendance-report.component';
import { BillingReportComponent } from './common-component/report/billing-report/billing-report.component';

import { HealthReportComponent } from './common-component/report/health-report/health-report.component';

import { ManageActivityComponent } from './teachers-management/activities/manage-activity/manage-activity.component';
import { ViewActivityComponent } from './teachers-management/activities/view-activity/view-activity.component';
import { EditActivityComponent } from './teachers-management/activities/edit-activity/edit-activity.component';
import { AddActivityComponent } from './teachers-management/activities/add-activity/add-activity.component';
import { JobPortalComponent } from './day-care-management/job-portal/job-portal.component';
import { ManageClassRosterComponent } from './day-care-management/class-rosters/manage-class-roster/manage-class-roster.component';
import { SubscriptionFeaturesComponent } from './day-care-management/subscription-plans/subscription-features/subscription-features.component';
import { SubscriptionPlansComponent } from './day-care-management/subscription-plans/subscription-plans/subscription-plans.component';
import { SubscriptionDetailsComponent } from './day-care-management/subscription-plans/subscription-details/subscription-details.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './bloomvie-management/dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';

import { WorkTimingsComponent } from './day-care-management/work-timings/work-timings.component';

import { ChatboxComponent } from './common-component/chatbox/chatbox.component';
import { MailboxComponent } from './common-component/mailbox/mailbox.component';
import { UserRoleComponent } from './settings/Permission/user-role/user-role.component';
import { UserPermissionComponent } from './settings/Permission/user-permission/user-permission.component';
import { RoleBasedPermissionComponent } from './settings/Permission/role-based-permission/role-based-permission.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { OTPComponent } from './otp/otp.component';
import { PassThrough } from 'stream';
import { PasswordChangeComponent } from './password-change/password-change.component';
import { LocalizationDetailsComponent } from './settings/application-settings/localization-details/localization-details.component';
import { SocialLinksComponent } from './settings/application-settings/social-links/social-links.component';

import { ApplicationsSettingsComponent } from './settings/application-settings/applications-settings/applications-settings.component';
import { AddDaycareComponent } from './day-care-management/add-daycare/add-daycare.component';
import { ViewDaycareComponent } from './day-care-management/view-daycare/view-daycare.component';
import { EditDaycareComponent } from './day-care-management/edit-daycare/edit-daycare.component';
import { ManageDaycareComponent } from './day-care-management/manage-daycare/manage-daycare.component';
import { DaycareDashboardComponent } from './day-care-management/daycare-dashboard/daycare-dashboard.component';
import { SmtpComponent } from './settings/smtp/smtp.component';
import { TeachersDashboardComponent } from './teachers-management/teachers-dashboard/teachers-dashboard.component';
import { ParentDashboardComponent } from './parent-management/parent-dashboard/parent-dashboard.component';
import { AddParentComponent } from './parent-management/add-parent/add-parent.component';
import { ViewParentComponent } from './parent-management/view-parent/view-parent.component';
import { EditParentComponent } from './parent-management/edit-parent/edit-parent.component';
import { ManageParentComponent } from './parent-management/manage-parent/manage-parent.component';
import { AddTeacherComponent } from './teachers-management/add-teacher/add-teacher.component';
import { ViewTeacherComponent } from './teachers-management/view-teacher/view-teacher.component';
import { EditTeacherComponent } from './teachers-management/edit-teacher/edit-teacher.component';
import { ManageTeacherComponent } from './teachers-management/manage-teacher/manage-teacher.component';
import { AddClassroomComponent } from './day-care-management/classroom-management/add-classroom/add-classroom.component';
import { ViewClassroomComponent } from './day-care-management/classroom-management/view-classroom/view-classroom.component';
import { ManageClassroomComponent } from './day-care-management/classroom-management/manage-classroom/manage-classroom.component';
import { EditClassroomComponent } from './day-care-management/classroom-management/edit-classroom/edit-classroom.component';
import { SmtpListComponent } from './settings/smtp/smtp-list/smtp-list.component';
import { ProfileComponent } from './common-component/profile/profile.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { PaymentDashboardComponent } from './day-care-management/payment-dashboard/payment-dashboard.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ContentManagementComponent } from './content-management/content-management.component';

import { JobPortalDetailsComponent } from './day-care-management/job-portal-details/job-portal-details.component';
import { JobsAppliedComponent } from './day-care-management/jobs-applied/jobs-applied.component';
import { AddClassEnrollmentComponent } from './day-care-management/classroom-management/class-enrollment/add-class-enrollment/add-class-enrollment.component';
import { ViewClassEnrollmentComponent } from './day-care-management/classroom-management/class-enrollment/view-class-enrollment/view-class-enrollment.component';
import { EditClassEnrollmentComponent } from './day-care-management/classroom-management/class-enrollment/edit-class-enrollment/edit-class-enrollment.component';
import { ManageClassEnrollmentComponent } from './day-care-management/classroom-management/class-enrollment/manage-class-enrollment/manage-class-enrollment.component';
import { ViewStudentComponent } from './day-care-management/student-management/view-student/view-student.component';
import { EditStudentComponent } from './day-care-management/student-management/edit-student/edit-student.component';
import { ManageStudentComponent } from './day-care-management/student-management/manage-student/manage-student.component';
import { JobStatusComponent } from './bloomvie-management/job-status/job-status.component';
import { ParentOnboardingComponent } from './parent-management/parent-onboarding/parent-onboarding.component';
import { ViewStudentEnrollmentComponent } from './day-care-management/student-management/view-student-enrollment/view-student-enrollment.component';
import { StaffEnrollmentComponent } from './day-care-management/staff-enrollment/staff-enrollment.component';
import { ClassroomDetailsComponent } from './day-care-management/classroom-management/classroom-details/classroom-details.component';
import { RoleSpecializationComponent } from './master-settings/role-specialization/role-specialization.component';
import { AddClassRosterComponent } from './day-care-management/class-rosters/add-class-roster/add-class-roster.component';
import { ViewClassRosterComponent } from './day-care-management/class-rosters/view-class-roster/view-class-roster.component';
import { GeneralSettingComponent } from './settings/general-setting/general-setting.component';
import { ViewStudentDetailComponent } from './day-care-management/classroom-management/view-student-detail/view-student-detail.component';
import { ViewStaffComponent } from './day-care-management/staff-management/view-staff/view-staff.component';
import { ManageStaffComponent } from './day-care-management/staff-management/add-staff/manage-staff.component';
import { ChildReportComponent } from './common-component/report/child-report/child-report.component';
import { ManageExpenseComponent } from './day-care-management/manage-expense/manage-expense.component';
import { CustomFormComponent } from './custom-form/custom-form.component';
import { DaycareAppointmentsComponent } from './bloomvie-management/daycare-appointments/daycare-appointments.component';

import { AssignUserPermissionComponent } from './settings/Permission/assign-user-permission/assign-user-permission.component';
import { DcAppointmentsListComponent } from './bloomvie-management/dc-appointments-list/dc-appointments-list.component';
import { BookKeepingComponent } from './common-component/book-keeping/book-keeping.component';
import { StudentProfileComponent } from './day-care-management/student-management/student-profile/student-profile.component';
import { StudentAdditionalInformationComponent } from './day-care-management/student-management/student-profile/student-additional-information/student-additional-information.component';
import { CounsellorDashboardComponent } from './counsellor-dashboard/counsellor-dashboard.component';
import { DaycareQuestionnaireComponent } from './daycare-questionnaire/daycare-questionnaire.component';
import { ApplicationStatusComponent } from './application-status/application-status.component';
import { TocViewComponent } from './toc-view/toc-view.component';
import { PlanCreationComponent } from './onboarding/plan-creation/plan-creation.component';

import { DaycareAppointmentsSlotComponent } from './bloomvie-management/daycare-appointments-slot/daycare-appointments-slot.component';
import { Component } from '@angular/core';
import { ManageStudentGalleryComponent } from './day-care-management/manage-student-gallery/manage-student-gallery.component';
import { StudentViewGalleryComponent } from './day-care-management/student-view-gallery/student-view-gallery.component';
import { ViewClassTeacherComponent } from './view-class-teacher/view-class-teacher.component';
import { AllJobPostingPlansComponent } from './all-job-posting-plans/all-job-posting-plans.component';
import { TocDashboardComponent } from './toc-dashboard/toc-dashboard.component';
import { TocScheduleComponent } from './toc-schedule/toc-schedule.component';
import { AddBulkActivitesComponent } from './day-care-management/add-bulk-activites/add-bulk-activites.component';
import { StudentEditGalleryComponent } from './day-care-management/manage-student-gallery/student-edit-gallery/student-edit-gallery.component';
import { JobPostTeacherApprovalComponent } from './day-care-management/jobs-applied/job-post-teacher-approval/job-post-teacher-approval.component';
import { DaycareAssignmentCounsellorComponent } from './bloomvie-management/daycare-assignment-counsellor/daycare-assignment-counsellor.component';
import { DaycareAssignedCounsellorOrganogramComponent } from './bloomvie-management/daycare-assigned-counsellor-organogram/daycare-assigned-counsellor-organogram.component';
import { WelcometocComponent } from './welcometoc/welcometoc.component';
import { TOCRegistrationComponent } from './toc-registration/toc-registration.component';
import { CalculatorComponent } from './common-component/calculator/calculator.component';
import { AddDiscountComponent } from './day-care-management/add-discount/add-discount.component';
import { RegisteredToNewDaycareComponent } from './day-care-management/registered-to-new-daycare/registered-to-new-daycare.component';
import { TransferStaffComponent } from './day-care-management/staff-management/transfer-staff/transfer-staff.component';
import { ReminderSettingsComponent } from './settings/reminder-settings/reminder-settings/reminder-settings.component';
import { TeachersJourneyComponent } from './teachers-management/teachers-journey/teachers-journey.component';
import { CreateReminderTypeComponent } from './settings/create-reminder-type/create-reminder-type.component';
import { AssignClassComponent } from './day-care-management/staff-management/assign-class/assign-class.component';
import { BloomviePlansComponent } from './bloomvie-plans/bloomvie-plans.component';
import { TeacherAreaOfExpertiseComponent } from './settings/teacher-area-of-expertise/teacher-area-of-expertise.component';
import { SwitcherComponentComponent } from './common-component/switcher-component/switcher-component.component';
import { StudentRegistrationComponent } from './student-registration/student-registration.component';
import { TocSlotRequestsComponent } from './toc-slot-requests/toc-slot-requests.component';
import { TocTeacherViewComponent } from './day-care-management/toc-teacher-view/toc-teacher-view.component';
import { BloomvieSettingsComponent } from './bloomvie-management/bloomvie-settings/bloomvie-settings.component';
import { AttendanceDashboardComponent } from './common-component/attendance-dashboard/attendance-dashboard.component';
import { MyAttendanceComponent } from './common-component/my-attendance/my-attendance.component';
import { SupplyRequestComponent } from './supply-request/supply-request.component';
import { ViewSupplyRequestComponent } from './view-supply-request/view-supply-request.component';
import { MyScheduleComponent } from './teachers-management/my-schedule/my-schedule.component';
import { ManageStudentActivitiesComponent } from './day-care-management/classroom-management/manage-student-activities/manage-student-activities.component';
import { ManageQualificationComponent } from
  './settings/manage-qualification/manage-qualification.component';
import { Error404Component } from './layout/error404/error404.component';
import { ManageEventComponent } from './settings/manage-event/manage-event.component';
import { StudentFeesComponent } from './common-component/book-keeping/student-fees/student-fees.component';
import { EventsComponent } from './common-component/events/events.component';
import { PayrollExpenseComponent } from './common-component/book-keeping/payroll-expense/payroll-expense.component';
import { OperatingExpenseComponent } from './common-component/book-keeping/operating-expense/operating-expense.component';
import { CapitalExpenseComponent } from './common-component/book-keeping/capital-expense/capital-expense.component';
import { SchedulerComponent } from './common-component/scheduler/scheduler.component';
import { LeaveManagementComponent } from './day-care-management/leave-management/leave-management.component';
import { ManageMasterLeaveComponent } from './bloomvie-management/manage-master-leave/manage-master-leave.component';
import { ManageSchedulerComponent } from './day-care-management/manage-scheduler/manage-scheduler.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';
import { ApplyLeaveComponent } from './common-component/apply-leave/apply-leave.component';
import { AuthGuard } from './auth/core/guards/auth.guard';
import { ChangeThePasswordComponent } from './change-the-password/change-the-password.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'otp', component: OTPComponent },
  { path: 'password-change', component: PasswordChangeComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'set-password', component: SetPasswordComponent },
  { path: 'bloomvie-plan', component: BloomviePlansComponent },

  {
    path: 'job-post-teacher-approval',
    component: JobPostTeacherApprovalComponent,
  },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'parent-onboarding', component: ParentOnboardingComponent },
  { path: 'welcome-toc', component: WelcometocComponent },
        {path: 'change-the-password', component: ChangeThePasswordComponent},
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      // Bloomvie
      { path: 'user-role', component: UserRoleComponent },
      { path: 'user-permission', component: UserPermissionComponent },
      {
        path: 'role-based-permission',
        component: RoleBasedPermissionComponent,
      },
      { path: 'view-staff', component: ViewStaffComponent },

      { path: 'application-Status', component: ApplicationStatusComponent },

      { path: 'manage-class-roster', component: ManageClassRosterComponent },
      { path: 'add-class-roster', component: AddClassRosterComponent },
      { path: 'view-class-roster', component: ViewClassRosterComponent },
      { path: 'attendance-report', component: AttendanceReportComponent },
      { path: 'billing-report', component: BillingReportComponent },
      { path: 'health-report', component: HealthReportComponent },
      { path: 'bloomvie-settings', component: BloomvieSettingsComponent },
      { path: 'manage-student-activity', component: ManageStudentActivitiesComponent },
      { path: 'manage-qualification', component: ManageQualificationComponent },
      { path: 'manage-event', component: ManageEventComponent },

      { path: 'chatbox', component: ChatboxComponent },
      // { path: 'mailbox', component: MailboxComponent },

      //Common
      {
        path: 'applications-settings',
        component: ApplicationsSettingsComponent,
      },

    
      { path: 'scheduler', component: SchedulerComponent },
      { path: 'add-bulk-activites', component: AddBulkActivitesComponent },

      { path: 'my-attendance', component: MyAttendanceComponent },
      { path: 'attendance-dashboard', component: AttendanceDashboardComponent },
      { path: 'localization-details', component: LocalizationDetailsComponent },
      { path: 'social-links', component: SocialLinksComponent },
      { path: 'work-calendar', component: WorkTimingsComponent },
      { path: 'plan-setup', component: PlanCreationComponent },
      { path: 'smtp', component: SmtpComponent },
      { path: 'smtp-list', component: SmtpListComponent },
      { path: 'subscription-details', component: SubscriptionDetailsComponent },
      { path: 'subscription-plans', component: SubscriptionPlansComponent },
      { path: 'calculator', component: CalculatorComponent },

      { path: 'switcher-component', component: SwitcherComponentComponent },

      {
        path: 'subscription-features',
        component: SubscriptionFeaturesComponent,
      },
      { path: 'job-portal', component: JobPortalComponent },

      { path: 'add-activity', component: AddActivityComponent },
      { path: 'edit-activity', component: EditActivityComponent },
      { path: 'view-activity', component: ViewActivityComponent },
      { path: 'manage-activity', component: ManageActivityComponent },
      { path: 'add-classroom', component: AddClassroomComponent },
      { path: 'view-classroom', component: ViewClassroomComponent },
      { path: 'manage-classroom', component: ManageClassroomComponent },
      { path: 'edit-classroom', component: EditClassroomComponent },

      //teacher
      { path: 'teachers-dashboard', component: TeachersDashboardComponent },
      { path: 'add-teacher', component: AddTeacherComponent },
      { path: 'view-teacher', component: ViewTeacherComponent },
      { path: 'edit-teacher', component: EditTeacherComponent },
      { path: 'manage-teacher', component: ManageTeacherComponent },
      {
        path: 'manage-student-gallery',
        component: ManageStudentGalleryComponent,
      },
      { path: 'student-edit-gallery', component: StudentEditGalleryComponent },

      { path: 'teachers-journey', component: TeachersJourneyComponent },

      //Daycare

      { path: 'manage-scheduler', component: ManageSchedulerComponent },
      { path: 'daycare-dashboard', component: DaycareDashboardComponent },
      { path: 'add-blog', component: AddBlogComponent },
      { path: 'edit-blog', component: EditBlogComponent },
      { path: 'view-blog', component: ViewBlogComponent },
      { path: 'manage-blog', component: ManageBlogComponent },

      { path: 'add-daycare', component: AddDaycareComponent },
      { path: 'view-daycare', component: ViewDaycareComponent },
      { path: 'edit-daycare', component: EditDaycareComponent },
      { path: 'manage-daycare', component: ManageDaycareComponent },
      { path: 'view-class-teacher', component: ViewClassTeacherComponent },
      { path: 'special-offer', component: AddDiscountComponent },
      { path: 'events', component: EventsComponent },
      { path: 'leave-management', component: LeaveManagementComponent },

      //Parent
      { path: 'student-registration', component: StudentRegistrationComponent },
      { path: 'parent-dashboard', component: ParentDashboardComponent },
      { path: 'add-parent', component: AddParentComponent },
      { path: 'student-detail', component: StudentDetailComponent },
      { path: 'view-parent', component: ViewParentComponent },
      { path: 'edit-parent', component: EditParentComponent },
      { path: 'manage-parent', component: ManageParentComponent },
      { path: 'student-view-gallery', component: StudentViewGalleryComponent },

      // {path:'bloomvie-subscription-plans', component:BloomvieSubscriptionPlansComponent},
      {
        path: 'subscription-plans-jobs',
        component: SubscriptionPlanJobsComponent,
      },
      { path: 'add-master-activity', component: AddMasterActivityComponent },
      { path: 'add-master-facility', component: AddMasterFacilityComponent },
      { path: 'add-invoice', component: AddInvoiceComponent },
      { path: 'jobs-applied', component: JobsAppliedComponent },

      { path: 'view-invoice', component: ViewInvoiceComponent },
      {
        path: 'bloomvie-subscription-features',
        component: BloomvieSubscriptionFeaturesComponent,
      }, //last edited
      {
        path: 'teacher-area-of-expertise',
        component: TeacherAreaOfExpertiseComponent,
      },
      { path: 'create-reminder', component: CreateReminderTypeComponent },
      { path: 'reminder-settings', component: ReminderSettingsComponent },
      { path: 'bloomvie-job-portal', component: BloomvieJobPortalComponent },
      { path: 'edit-business', component: AddBusinessComponent },
      { path: 'view-business', component: ViewBusinessComponent },
      { path: 'manage-business', component: ManageBusinessComponent },
      { path: 'edit-business', component: EditBusinessComponent },
      { path: 'add-age-group', component: AddAgeGroupComponent },
      { path: 'role-specialization', component: RoleSpecializationComponent },
      { path: 'add-facility', component: AddFacilityComponent },
      {
        path: 'subscription-activities',
        component: SubscriptionActivitiesComponent,
      },
      { path: 'master-features', component: MasterFeaturesComponent },
      { path: 'apply-leave', component: ApplyLeaveComponent },
      { path: 'day-care-settings', component: DayCareSettingsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'payment-management', component: PaymentManagementComponent },
      { path: 'manage-invoice', component: ManageInvoiceComponent },
      { path: 'payment-dashboard', component: PaymentDashboardComponent },
      { path: 'content-management', component: ContentManagementComponent },
      { path: 'job-portal-details', component: JobPortalDetailsComponent },
      { path: 'add-class-enrollment', component: AddClassEnrollmentComponent },
      {
        path: 'view-class-enrollment',
        component: ViewClassEnrollmentComponent,
      },
      {
        path: 'edit-class-enrollment',
        component: EditClassEnrollmentComponent,
      },
      {
        path: 'manage-class-enrollment',
        component: ManageClassEnrollmentComponent,
      },

      { path: 'student-enrollment', component: ManageStudentComponent },
      { path: 'view-student', component: ViewStudentComponent },
      { path: 'edit-student', component: EditStudentComponent },
      { path: 'job-status', component: JobStatusComponent },
      { path: 'view-student-enrollment', component: ViewStudentEnrollmentComponent },
      { path: 'staff-enrollment', component: ManageStaffComponent },
      { path: 'classroom-details', component: ClassroomDetailsComponent },
      { path: 'general-setting', component: GeneralSettingComponent },
      { path: 'view-student-detail', component: ViewStudentDetailComponent },
      { path: 'child-report', component: ChildReportComponent },
      { path: 'bloomvie-invoice', component: BloomvieInvoiceComponent },
      { path: 'daycare-invoice', component: DaycareInvoiceComponent },
      { path: 'manage-expense', component: ManageExpenseComponent },
      { path: 'custom-form', component: CustomFormComponent },
      { path: 'daycare-appointments', component: DaycareAppointmentsComponent },
      { path: 'dc-appointments-list', component: DcAppointmentsListComponent },
      { path: 'assign-user-roles', component: AssignUserPermissionComponent },
      { path: 'book-keeping', component: BookKeepingComponent },
      { path: 'student-profile', component: StudentProfileComponent },
      { path: 'student-additional-info', component: StudentAdditionalInformationComponent },
      { path: 'counsellor-dashboard', component: CounsellorDashboardComponent },
      { path: 'daycare-assignment-counsellor', component: DaycareAssignmentCounsellorComponent, },
      { path: 'assign-class', component: AssignClassComponent },
      { path: 'daycare-assigned-counsellor-organogram', component: DaycareAssignedCounsellorOrganogramComponent, },
      { path: 'daycare-questionnaire', component: DaycareQuestionnaireComponent },
      { path: 'toc-view', component: TocViewComponent },
      {
        path: 'daycare-appointments-slot',
        component: DaycareAppointmentsSlotComponent,
      },
      {
        path: 'all-job-posting-plans',
        component: AllJobPostingPlansComponent,
      },
      {
        path: 'registered-to-new-daycare',
        component: RegisteredToNewDaycareComponent,
      },
      {
        path: 'transfer-staff',
        component: TransferStaffComponent,
      },
      { path: 'toc-teacher-view', component: TocTeacherViewComponent },
      { path: 'toc-dashboard', component: TocDashboardComponent },
      { path: 'toc-schedule', component: TocScheduleComponent },
      { path: 'TOC-registration', component: TOCRegistrationComponent },
      { path: 'view-slot-requests', component: TocSlotRequestsComponent },
      { path: 'attendance-dashboard', component: AttendanceDashboardComponent },
      { path: 'my-attendance', component: MyAttendanceComponent },
      { path: 'suply-request', component: SupplyRequestComponent },
      { path: 'view-supply-request', component: ViewSupplyRequestComponent },
      { path: 'student-fees', component: StudentFeesComponent },
      { path: 'payroll-expense', component: PayrollExpenseComponent },
      { path: 'operating-expense', component: OperatingExpenseComponent },

      { path: 'capital-expense', component: CapitalExpenseComponent },
      { path: 'manage-master-leave', component: ManageMasterLeaveComponent },


      { path: 'my-schedule', component: MyScheduleComponent },
      { path: "**", component: Error404Component }
    ],
  },
];
