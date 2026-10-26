import { components, paths } from './api-contracts';
import { Observable } from 'rxjs';

declare module 'rxjs' {
  interface Observable<T> {
    toPromise(): Promise<T>;
  }
}

/**
 * Standard API Response envelope returned by apis.bloomvie.com
 */
export interface ApiResponse<T = any> {
  message?: string | any;
  Message?: string | any;
  result?: T | any;
  Result?: T | any;
  activity?: any;
  Activity?: any;
  count?: number;
  token?: string | null;
  statusCode?: number;
  success?: boolean;
  refreshToken?: string | null;
  [key: string]: any;
}

/**
 * Utility type to extract any schema directly from components['schemas']
 */
export type Schema<K extends keyof components['schemas']> = components['schemas'][K];

/**
 * Type-level utility to infer the JSON request body for any OpenAPI path and HTTP method
 */
export type ApiRequestBody<
  P extends keyof paths,
  M extends keyof paths[P]
> = paths[P][M] extends { requestBody?: { content: { 'application/json': infer B } } }
  ? B
  : paths[P][M] extends { requestBody?: { content: { 'text/json': infer B } } }
  ? B
  : paths[P][M] extends { parameters?: { query?: infer Q } }
  ? Q
  : never;

/**
 * Type-level utility to infer the 200 response body for any OpenAPI path and HTTP method
 */
export type ApiResponseData<
  P extends keyof paths,
  M extends keyof paths[P]
> = paths[P][M] extends { responses: { 200: { content: { 'application/json': infer R } } } }
  ? R
  : paths[P][M] extends { responses: { 200: { content: { 'text/plain': infer R } } } }
  ? R
  : never;

// ==========================================
// Strongly-Typed Request & Response Models
// ==========================================

export interface StudentLoginInfo {
  id?: number;
  ID?: number;
  centreID?: number | null;
  CentreID?: number | null;
  adminID?: number;
  AdminID?: number;
}

// Authentication & Users
export type LoginRequest = Schema<'LoginBo'> & {
  rememberMe?: boolean;
  [key: string]: any;
};

export type LoginResult = Schema<'LoginResultDTO'> & {
  studentID?: StudentLoginInfo[] | null;
  StudentID?: StudentLoginInfo[] | null;
  centreAdminId?: number | null;
  latestPlanId?: number | null;
  userId?: number | null;
  isTOCprofilecompleted?: boolean | null;
  centreList?: Array<{ centreID?: number; centreName?: string; [key: string]: any }> | null;
};

export type VerifyOtpRequest = Schema<'VerifyOTPBO'>;
export type VerifyOtpResult = Schema<'VerifyOtpResultDTO'>;
export interface CheckLoginEmailParams {
  email: string;
}

// Daycare & Centre Settings
export type CentreSettings = Schema<'CentreSettingsBO'>;
export type UpdateCentreSettingsRequest = Schema<'UpdateCentreSettingsBO'>;
export type ActivityRequest = Schema<'ActivityBO'>;

// Announcements
export type CreateAnnouncementRequest = Schema<'CreateAnnouncementRequest'>;
export type AnnouncementItem = Schema<'AnnouncementHistoryItemBO'> & {
  senderRoleName?: string | null;
  [key: string]: any;
};
export type RecipientAnnouncementItem = Schema<'RecipientAnnouncementItemBO'> & {
  senderRoleName?: string | null;
  [key: string]: any;
};

// Attendance
export type AttendanceSummary = Schema<'AttendanceSummaryDto'>;
export type AttendanceDetail = Schema<'EmployeeAttendanceDto'>;

// ==========================================
// Staff Management Models
// ==========================================

export type TeacherAvailabilityItem = Schema<'TeacherAvailabilityBO'> & {
  dayName?: string | null;
  [key: string]: any;
};

export type AddStaffRequest = Omit<Schema<'StaffBO'>, 'jobType'> & {
  assignDaycare?: number[] | null;
  teacherAvailabiltyList?: TeacherAvailabilityItem[] | null;
  teacherAvailability?: string | null;
  jobType?: number | string | null;
  [key: string]: any;
};

export interface StaffInfo {
  id?: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  userRole?: string | null;
  userRoleID?: number | null;
  roleSpecialization?: string | null;
  roleSpecializationID?: number | null;
  centreID?: number | null;
  isActive?: boolean | null;
  s3ImageUrl?: string | null;
  staffProfile?: string | null;
  dayName?: string | null;
  salary?: number | null;
  wages?: number | null;
  workingHours?: number | null;
  salaryUnit?: string | null;
  qualification?: string | null;
  jobType?: number | string | null;
  joiningDate?: string | null;
  teacherAvailability?: TeacherAvailabilityItem[] | null;
  assignmentList?: Array<{ className?: string; classID?: number; [key: string]: any }> | null;
  [key: string]: any;
}

export type StaffListResponse = ApiResponse<StaffInfo[]>;

export interface RoleDropdownItem {
  id: number;
  name: string;
  userRole?: string;
  [key: string]: any;
}

// ==========================================
// Student Management Models
// ==========================================

export type ParentEnrollmentItem = Schema<'ParentEnrollmentBO'>;

export type AddStudentEnrollmentRequest = Omit<Schema<'StudentEnrollmentBO'>, 'parent'> & {
  parent?: ParentEnrollmentItem | Record<string, any> | null;
  relation?: string | null;
  [key: string]: any;
};

export type AddStudentRegistrationRequest = Schema<'StudentRegistrationsBO'> & {
  [key: string]: any;
};

export type AddStudentRequest = AddStudentEnrollmentRequest | AddStudentRegistrationRequest;

export interface StudentInfo {
  id?: number;
  firstName?: string | null;
  lastName?: string | null;
  centreID?: number | null;
  ageGroupID?: number | null;
  dob?: string | null;
  gender?: string | null;
  isActive?: boolean | null;
  isMonthly?: boolean | null;
  minAge?: number | null;
  maxAge?: number | null;
  studentProfileUrl?: string | null;
  studentProfileImage?: string | null;
  label?: string | null;
  className?: string | null;
  classID?: number | null;
  parentList?: Array<ParentEnrollmentItem | Record<string, any>> | null;
  parent?: ParentEnrollmentItem | null;
  [key: string]: any;
}

export type StudentListResponse = ApiResponse<StudentInfo[]>;

export type ParentStudentsResponse = StudentInfo[] & {
  studentList?: StudentInfo[];
  [key: string]: any;
};

// ==========================================
// Classroom Management Models
// ==========================================

export interface ClassroomDropdownItem {
  id?: number | null;
  ID?: number | null;
  name?: string | null;
  className?: string | null;
  classroomID?: number | null;
  classID?: number | null;
  studentRatio?: number | null;
  staff?: number | null;
  daycareCentreID?: number | null;
  ageGroupID?: number | null;
  maxCapacity?: number | null;
  [key: string]: any;
}

export type AddClassroomRequest = Schema<'DaycareClassBO'> & {
  [key: string]: any;
};

export type ClassroomListResponse = ApiResponse<Schema<'DaycareClassBO'>[]>;

export type DaycareSectionItem = Schema<'DaycareSectionBO'> & {
  [key: string]: any;
};

export type DaycareDaysItem = Schema<'DaycareDaysBO'> & {
  [key: string]: any;
};

export type StudentActivityItem = Schema<'StudentActivitiesBO'> & {
  activity?: any;
  activityImages?: any[];
  [key: string]: any;
};

export type ManageStudentRequestItem = Schema<'ManageStudentRequestBO'> & {
  [key: string]: any;
};

export type StudentActivityImageItem = Schema<'studentActivityImageBO'> & {
  [key: string]: any;
};

export type NapTimeItem = Schema<'NapTimeBO'> & {
  [key: string]: any;
};

export type FoodItem = Schema<'FoodBO'> & {
  [key: string]: any;
};

// ==========================================
// Parent Management Models
// ==========================================

export type ClearStudentPaymentItem = Schema<'ClearStudentPaymentBO'> & {
  [key: string]: any;
};

export type ChildDailyRoutineItem = Schema<'ChildDailyRoutineBO'> & {
  [key: string]: any;
};

// ==========================================
// Teacher on Call (TOC) Models
// ==========================================

export type ForInterestedAppliedJobTOCItem = Schema<'ForInterestedAppliedJobTOCBO'> & {
  [key: string]: any;
};

export type ForInterestedAppliedJobPostingItem = Schema<'ForInterestedAppliedJobPostingBO'> & {
  [key: string]: any;
};

export type TocUserItem = Schema<'getTocUserForDaycareBO'> & {
  [key: string]: any;
};

// ==========================================
// Subscription Models
// ==========================================

export type SubscriptionPlanItem = Schema<'SubscriptionPlansBO'> & {
  [key: string]: any;
};

export type SubscriptionFeatureItem = Schema<'SubscriptionFeaturesBO'> & {
  [key: string]: any;
};

// ==========================================
// Settings & Administration Models
// ==========================================

export type ApplicationSettingItem = Schema<'ApplicationSettingBO'> & {
  breadcrumbText?: string | null;
  [key: string]: any;
};

export type SocialLinkItem = Schema<'SocialMediaLinkBO'> & {
  id?: number | any;
  ID?: number | any;
  twitter?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedIn?: string | null;
  [key: string]: any;
};

export type SMTPSettingItem = Schema<'SmtpBO'> & {
  [key: string]: any;
};

export type ReminderSettingItem = Schema<'DayCareReminderSettingsB0'> & {
  [key: string]: any;
};

export type MasterEventItem = Schema<'ManageMasterEventBO'> & {
  [key: string]: any;
};

export interface UserRoleItem {
  id?: number | any;
  ID?: number | any;
  userRoleID?: number | any;
  userRole?: string | any;
  isActive?: boolean | any;
  name?: string | any;
  [key: string]: any;
}

export type UserPermissionItem = {
  [key: string]: any;
};

export type AreaOfExpertiseItem = Schema<'ManageAreaOfExpertiseBO'> & {
  [key: string]: any;
};

// ==========================================
// Master & Daycare Models
// ==========================================

export type MasterActivityItem = Schema<'MasterActivitiesBO'> & {
  [key: string]: any;
};

export interface MasterAgeGroupItem {
  id: number | any;
  ageGroupID?: number | any;
  ageGroupTitle?: string | any;
  minAge: number | any;
  maxAge: number | any;
  isMonthly: boolean | any;
  isActive: boolean | any;
  [key: string]: any;
}

export type MasterRoleSpecializationItem = Schema<'MasterRoleSpecializationBO'> & {
  [key: string]: any;
};

export type DaycareHolidayItem = Schema<'DaycareCentreHolidayBO'> & {
  id: number | any;
  holidayName: string | any;
  holidayDate: string | any;
  isActive: boolean | any;
  isDefaultHoliday: boolean | any;
  [key: string]: any;
};

export type DaycareEventItem = Schema<'DaycareCentreEventManagmentBO'> & {
  [key: string]: any;
};

export type StudentGalleryItem = Schema<'DayCareCentreStudentGalleryBO'> & {
  days?: any[];
  [key: string]: any;
};

export type JobPostingItem = (Schema<'JobPostBO'> | Schema<'JobPostingBO'>) & {
  [key: string]: any;
};

// ==========================================
// Common & User Profile Models
// ==========================================

export type ProfileItem = {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  documentImage?: string | null;
  dob?: string | null;
  s3ImageUrl?: string | null;
  studentList: any[];
  [key: string]: any;
};

export type PasswordChangeItem = Schema<'managePasswordChangeBO'> & {
  [key: string]: any;
};

// ==========================================
// Type Guards & Assertion Utilities
// ==========================================

/**
 * Type guard to check if an API response succeeded and contains a valid result
 */
export function isApiSuccess<T>(response: ApiResponse<T> | null | undefined): response is ApiResponse<T> & { result: NonNullable<T> } {
  if (!response) return false;
  const isMessageSuccess = response.message === 'Success' || response.message === 'Ok' || response.message === 'OK';
  return (isMessageSuccess || response.success === true) && response.result !== null && response.result !== undefined;
}
