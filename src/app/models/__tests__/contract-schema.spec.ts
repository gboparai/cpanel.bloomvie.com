import { components } from '../api-contracts';
import {
  ApiResponse,
  AddStaffRequest,
  StaffInfo,
  StaffListResponse,
  RoleDropdownItem,
  AddStudentEnrollmentRequest,
  AddStudentRegistrationRequest,
  StudentInfo,
  StudentListResponse,
  ClassroomDropdownItem,
  AddClassroomRequest,
  ClassroomListResponse,
  DaycareSectionItem,
  StudentActivityItem,
  ManageStudentRequestItem,
  NapTimeItem,
  ClearStudentPaymentItem,
  ChildDailyRoutineItem,
  ForInterestedAppliedJobTOCItem,
  SubscriptionPlanItem,
  SubscriptionFeatureItem,
  UserRoleItem,
  MasterAgeGroupItem,
} from '../api.types';

type CentreSettings = components['schemas']['CentreSettingsBO'];
type AttendanceSummary = components['schemas']['AttendanceSummaryDto'];
type AnnouncementItem = components['schemas']['AnnouncementHistoryItemBO'];

describe('OpenAPI Contract & Schema Validation Tests (cpanel.bloomvie.com)', () => {
  it('validates CentreSettingsBO schema structure and externalBillingEnabled type contract', () => {
    const centreResponse: ApiResponse<CentreSettings> = {
      message: 'Success',
      statusCode: 200,
      success: true,
      result: {
        centreID: 101,
        centreName: 'Metropolitan Academy',
        externalBillingEnabled: false,
        isActive: true,
        isOnboarded: true,
        planAdd: true,
        studentAdd: true,
      },
    };

    expect(centreResponse.result).toBeDefined();
    expect(typeof centreResponse.result?.centreID).toBe('number');
    expect(typeof centreResponse.result?.externalBillingEnabled).toBe('boolean');
    expect(centreResponse.result?.externalBillingEnabled).toBe(false);
  });

  it('validates AttendanceSummaryDto schema structure against backend contract', () => {
    const summaryResponse: ApiResponse<AttendanceSummary> = {
      message: 'Success',
      statusCode: 200,
      success: true,
      result: {
        totalStaff: 25,
        presentCount: 20,
        absentCount: 3,
        leaveCount: 2,
      },
    };

    expect(summaryResponse.result?.totalStaff).toBe(25);
    expect(summaryResponse.result?.presentCount).toBe(20);
    expect(summaryResponse.result?.absentCount).toBe(3);
    expect(summaryResponse.result?.leaveCount).toBe(2);
  });

  it('validates AnnouncementHistoryItemBO list contract structure', () => {
    const listResponse: ApiResponse<AnnouncementItem[]> = {
      message: 'Success',
      count: 1,
      statusCode: 200,
      success: true,
      result: [
        {
          id: 10,
          classID: 4,
          className: 'Infants A',
          title: 'Holiday Closure',
          message: 'The center will be closed this Friday.',
          targetAudience: 'Students',
          sentDate: '2026-10-25T12:00:00Z',
        },
      ],
    };

    expect(Array.isArray(listResponse.result)).toBe(true);
    expect(listResponse.result?.[0].title).toBe('Holiday Closure');
    expect(listResponse.result?.[0].classID).toBe(4);
  });

  it('validates AddStaffRequest and StaffInfo models contract structure', () => {
    const staffRequest: AddStaffRequest = {
      id: 0,
      firstName: 'Emily',
      lastName: 'Clark',
      email: 'emily.clark@example.com',
      centreID: 101,
      userRoleID: 4,
      salary: 45000,
      wages: null,
      workingHours: 40,
      jobType: 1,
      assignDaycare: [101, 102],
      teacherAvailabiltyList: [
        { dayID: 1, dayName: 'Monday', startTime: '08:00', endTime: '16:00' },
      ],
    };

    expect(staffRequest.firstName).toBe('Emily');
    expect(staffRequest.jobType).toBe(1);
    expect(staffRequest.assignDaycare?.length).toBe(2);

    const staffListResponse: StaffListResponse = {
      message: 'Success',
      statusCode: 200,
      success: true,
      result: [
        {
          id: 1,
          firstName: 'Emily',
          lastName: 'Clark',
          email: 'emily.clark@example.com',
          userRole: 'Teacher',
          userRoleID: 4,
          isActive: true,
          centreID: 101,
          staffProfile: 'profile-1.jpg',
          dayName: 'Monday, Tuesday',
        },
      ],
    };

    expect(staffListResponse.result?.[0].firstName).toBe('Emily');
    expect(staffListResponse.result?.[0].userRole).toBe('Teacher');
  });

  it('validates RoleDropdownItem model contract structure', () => {
    const roles: RoleDropdownItem[] = [
      { id: 4, name: 'Teacher', userRole: 'TEACHER' },
      { id: 8, name: 'TOC Teacher', userRole: 'TOC_TEACHER' },
    ];

    expect(roles.length).toBe(2);
    expect(roles[0].name).toBe('Teacher');
    expect(roles[1].id).toBe(8);
  });

  it('validates AddStudentEnrollmentRequest and StudentInfo models contract structure', () => {
    const enrollRequest: AddStudentEnrollmentRequest = {
      id: 0,
      firstName: 'Lucas',
      lastName: 'Brown',
      centreID: 101,
      ageGroupID: 2,
      gender: 'Male',
      dob: '2022-04-15',
      parent: {
        id: 0,
        firstName: 'Sarah',
        lastName: 'Brown',
        email: 'sarah.brown@example.com',
        mobile: '5551234567',
        relation: 'Mother',
        address: '123 Main St',
        pinCode: 'V6B 1A1',
      },
    };

    expect(enrollRequest.firstName).toBe('Lucas');
    expect(enrollRequest.parent?.firstName).toBe('Sarah');

    const regRequest: AddStudentRegistrationRequest = {
      firstName: 'Maya',
      lastName: 'Lin',
      ageGroup: 1,
      gender: 'Female',
      planID: 10,
      planPrice: 850,
      centreID: 101,
    };

    expect(regRequest.firstName).toBe('Maya');
    expect(regRequest.planPrice).toBe(850);

    const studentListResponse: StudentListResponse = {
      message: 'Success',
      statusCode: 200,
      success: true,
      result: [
        {
          id: 50,
          firstName: 'Lucas',
          lastName: 'Brown',
          centreID: 101,
          ageGroupID: 2,
          isMonthly: true,
          minAge: 12,
          maxAge: 24,
          label: '12 - 24 Months',
          isActive: true,
        },
      ],
    };

    expect(studentListResponse.result?.[0].firstName).toBe('Lucas');
    expect(studentListResponse.result?.[0].label).toContain('Months');
  });

  it('validates ClassroomDropdownItem and AddClassroomRequest models contract structure', () => {
    const dropdownItem: ClassroomDropdownItem = {
      id: 15,
      classroomID: 15,
      className: 'Toddlers Room',
      name: 'Toddlers Room',
      studentRatio: 4,
      staff: 1,
      maxCapacity: 12,
    };

    expect(dropdownItem.classroomID).toBe(15);
    expect(dropdownItem.className).toBe('Toddlers Room');

    const classroomRequest: AddClassroomRequest = {
      id: 0,
      className: 'Preschool Alpha',
      studentRatio: 8,
      staff: 2,
      daycareCentreID: 101,
      ageGroupID: 3,
      maxCapacity: 16,
    };

    expect(classroomRequest.className).toBe('Preschool Alpha');
    expect(classroomRequest.maxCapacity).toBe(16);

    const listResp: ClassroomListResponse = {
      message: 'Success',
      statusCode: 200,
      success: true,
      result: [classroomRequest],
    };

    expect(listResp.result?.length).toBe(1);
  });

  it('validates Classroom domain models (DaycareSectionItem, StudentActivityItem, NapTimeItem)', () => {
    const section: DaycareSectionItem = {
      id: 1,
      classID: 10,
      startTime: '08:00:00',
      endTime: '12:00:00',
      centreID: 101,
      days: [{ dayID: 1, dayName: 'Monday' }],
    };
    expect(section.classID).toBe(10);
    expect(section.days?.length).toBe(1);

    const activity: StudentActivityItem = {
      id: 201,
      studentID: 55,
      note: 'Finished artwork',
      foodType: 1,
      mealType: 2,
    };
    expect(activity.studentID).toBe(55);
    expect(activity.note).toBe('Finished artwork');

    const nap: NapTimeItem = {
      id: 12,
      note: 'Slept peacefully',
    };
    expect(nap.id).toBe(12);
  });

  it('validates Parent & Bookkeeping domain models (ClearStudentPaymentItem, ChildDailyRoutineItem)', () => {
    const payment: ClearStudentPaymentItem = {
      planID: 5,
      studentID: 101,
      parentID: 202,
      totalPlanAmount: 600,
      totalPaidAmount: 600,
      paymentType: 'CreditCard',
    };
    expect(payment.studentID).toBe(101);
    expect(payment.totalPaidAmount).toBe(600);

    const routine: ChildDailyRoutineItem = {
      id: 1,
      studentID: 101,
      description: 'Morning reading and outdoor play',
    };
    expect(routine.studentID).toBe(101);
  });

  it('validates TOC, Subscription & Setting domain models', () => {
    const tocJob: ForInterestedAppliedJobTOCItem = {
      id: 50,
      jobPostingID: 12,
      centreID: 101,
      isAccept: true,
    };
    expect(tocJob.jobPostingID).toBe(12);

    const plan: SubscriptionPlanItem = {
      id: 1,
      planName: 'Enterprise Daycare',
      price: 199.99,
      isActive: true,
    };
    expect(plan.planName).toBe('Enterprise Daycare');

    const feature: SubscriptionFeatureItem = {
      id: 10,
      featureName: 'Automated Billing',
    };
    expect(feature.featureName).toBe('Automated Billing');

    const role: UserRoleItem = {
      id: 3,
      roleName: 'Teacher',
    };
    expect(role.roleName).toBe('Teacher');

    const ageGroup: MasterAgeGroupItem = {
      id: 2,
      groupName: 'Toddler',
      minAgeMonth: 12,
      maxAgeMonth: 24,
    };
    expect(ageGroup.groupName).toBe('Toddler');
  });
});
