import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageClassroomComponent } from './manage-classroom.component';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ManageClassroomService } from './manage-classroom.service';
import { ToastrService } from 'ngx-toastr';
import { AddAgeGroupService } from '../../../master-settings/age-group/add-age-group/add-age-group.service';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../common-component/common.service';
import { ManageStudentService } from '../../student-management/manage-student/manage-student.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ManageClassroomComponent', () => {
  let component: ManageClassroomComponent;
  let fixture: ComponentFixture<ManageClassroomComponent>;

  let mockClassService: jasmine.SpyObj<ManageClassroomService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockAgeGpService: jasmine.SpyObj<AddAgeGroupService>;
  let mockOnboardingService: jasmine.SpyObj<OnboardingService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockManageStudentService: jasmine.SpyObj<ManageStudentService>;

  beforeEach(async () => {
    mockClassService = jasmine.createSpyObj('ManageClassroomService', [
      'GetAllAgeGroup',
      'getAllDays',
      'getCentreWorkingDaysByCentreID',
      'checkSectionExists',
      'checkSlotExists',
      'ManageClasses',
      'ActiveInactiveClassroom',
      'onClassDuplicateCheck',
      'getClassroomCapacityByClassID',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockAgeGpService = jasmine.createSpyObj('AddAgeGroupService', ['getAgeGroups']);
    mockOnboardingService = jasmine.createSpyObj('OnboardingService', ['handleNext', 'getCurrentTab'], {
      onBoardingData: { isCompleteStep4: false },
    });
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'decrypt',
      'convertTimeStringToDate',
      'duplicateRecordWarn',
      'manageDaycareOnBoarding',
    ]);
    mockManageStudentService = jasmine.createSpyObj('ManageStudentService', ['getDayCareCentreDetails']);

    mockCookieService.check.and.returnValue(true);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '5';
      return '';
    });

    mockClassService.GetAllAgeGroup.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, ageGroupTitle: 'Infants', minAge: 6, maxAge: 12, isMonthly: true, isActive: true },
        ],
      })
    );
    mockClassService.getAllDays.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, day: 'Monday' },
          { id: 2, day: 'Tuesday' },
        ],
      })
    );
    mockClassService.getCentreWorkingDaysByCentreID.and.returnValue(
      of({
        message: 'Success',
        result: {
          sun: false,
          mon: true,
          tues: true,
          wed: true,
          thu: true,
          fri: true,
          sat: false,
          monStartTime: '08:00:00',
          monEndTime: '17:00:00',
        },
      })
    );
    mockManageStudentService.getDayCareCentreDetails.and.returnValue(
      of({
        message: 'OK',
        result: { remainingCapacity: 20, enrollmentCapacity: 50 },
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      val: jasmine.createSpy('val'),
      text: jasmine.createSpy('text'),
      prop: jasmine.createSpy('prop'),
    });
    spyOn(window, 'scrollTo');

    await TestBed.configureTestingModule({
      imports: [ManageClassroomComponent, ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        { provide: ManageClassroomService, useValue: mockClassService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: AddAgeGroupService, useValue: mockAgeGpService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CommonService, useValue: mockCommonService },
        { provide: ManageStudentService, useValue: mockManageStudentService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({
              get: (k: string) => null,
            }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageClassroomComponent, {
        set: {
          imports: [ReactiveFormsModule, FormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageClassroomComponent);
    component = fixture.componentInstance;
  });

  it('should create ManageClassroomComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization and Validation', () => {
    it('should initialize classForm with default controls', () => {
      expect(component.classForm.contains('className')).toBeTrue();
      expect(component.classForm.contains('ageGroupID')).toBeTrue();
      expect(component.classForm.contains('maxCapacity')).toBeTrue();
      expect(component.classForm.contains('staff')).toBeTrue();
      expect(component.classForm.contains('studentRatio')).toBeTrue();
      expect(component.classForm.contains('classSlot')).toBeTrue();
    });

    it('should convert year to month and month to year correctly', () => {
      expect(component.convertYearToMonth(2)).toBe(24);
      expect(component.convertMonthToYear(24)).toBe(2);
    });
  });

  describe('Lifecycle & Initial Data Loading', () => {
    it('should load initial data on ngOnInit', () => {
      component.ngOnInit();
      expect(component.centreID).toBe(10);
      expect(mockClassService.GetAllAgeGroup).toHaveBeenCalledWith(10);
      expect(mockClassService.getAllDays).toHaveBeenCalled();
      expect(mockClassService.getCentreWorkingDaysByCentreID).toHaveBeenCalledWith(10);
      expect(mockManageStudentService.getDayCareCentreDetails).toHaveBeenCalledWith(10);
      expect(component.workCalendarOfWeek.monday).toBeTrue();
      expect(component.workCalendarOfWeek.sunday).toBeFalse();
    });

    it('should correctly check isDisabledDays', () => {
      component.workCalendarOfWeek.sunday = false;
      component.workCalendarOfWeek.monday = true;

      expect(component.isDisabledDays({ day: 'Sunday' })).toBeTrue();
      expect(component.isDisabledDays({ day: 'Monday' })).toBeFalse();
      expect(component.isDisabledDays({ day: 'Unknown' })).toBeFalse();
    });
  });

  describe('Section and Day Management', () => {
    it('should create section and days form groups', () => {
      const section = component.createSection();
      expect(section.contains('startTime')).toBeTrue();
      expect(section.contains('endTime')).toBeTrue();
      expect(section.contains('days')).toBeTrue();

      const day = component.createdays();
      expect(day.contains('dayID')).toBeTrue();
    });

    it('should map day name to day ID correctly', () => {
      expect(component.getDayID('Monday')).toBe(1);
      expect(component.getDayID('Friday')).toBe(5);
      expect(component.getDayID('Sunday')).toBe(7);
    });

    it('should add and remove days with onDayChange', () => {
      mockCommonService.convertTimeStringToDate.and.returnValue(new Date() as any);
      component.startTimeOrEndTimeWorkCalendar = { monStartTime: '08:00', monEndTime: '17:00' };

      const eventChecked = { target: { checked: true } } as any;
      component.onDayChange(eventChecked, 'Monday', 1);

      expect(component.displayDayName).toContain('Monday');
      expect(component.sections.length).toBe(1);

      const eventUnchecked = { target: { checked: false } } as any;
      component.onDayChange(eventUnchecked, 'Monday', 1);

      expect(component.displayDayName).not.toContain('Monday');
      expect(component.sections.length).toBe(0);
    });

    it('should remove section by index', () => {
      component.displayDayName = ['Monday', 'Tuesday'];
      component.displayDayCareTiming = [{}, {}];
      component.sections.push(component.createSection());
      component.sections.push(component.createSection());

      component.removeSection(0);

      expect(component.displayDayName).toEqual(['Tuesday']);
      expect(component.sections.length).toBe(1);
    });
  });

  describe('Form Submission', () => {
    it('should mark all touched and show error toastr if form is invalid or slots are empty', () => {
      component.classForm.patchValue({ className: '' });
      component.onsubmit();
      expect(mockClassService.ManageClasses).not.toHaveBeenCalled();
    });

    it('should submit valid classroom data successfully', () => {
      component.childComponent = {
        classList: [],
        getAllClasses: jasmine.createSpy('getAllClasses'),
      } as any;

      component.classForm.patchValue({
        className: 'Toddler Room',
        ageGroupID: 1,
        maxCapacity: '15',
        staff: '2',
        studentRatio: '1:5',
      });

      const sectionGroup = component.createSection();
      sectionGroup.patchValue({ startTime: '09:00', endTime: '16:00' });
      component.sections.push(sectionGroup);

      mockClassService.ManageClasses.and.returnValue(
        of({ message: 'OK', activity: 'Classroom added successfully' })
      );

      component.onsubmit();

      expect(mockClassService.ManageClasses).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Classroom added successfully');
      expect(component.childComponent.getAllClasses).toHaveBeenCalled();
    });
  });

  describe('Capacity and Duplicate Checks', () => {
    it('should validate capacity count between 1 and 100', () => {
      const eventValid = { target: { value: '25' } };
      component.ValidateClassCapacityInputNumber(eventValid);
      expect(component.classLimit).toBeFalse();

      const eventInvalid = { target: { value: '150' } };
      component.ValidateClassCapacityInputNumber(eventInvalid);
      expect(component.classLimit).toBeTrue();
      expect(eventInvalid.target.value).toBeNull();
    });

    it('should check duplicate classroom name with onClassDuplicateCheck', () => {
      component.centreID = 10;
      mockClassService.onClassDuplicateCheck.and.returnValue(
        of({ message: 'duplicate classroom' })
      );

      component.onClassDuplicateCheck({ target: { value: 'Room A' } });

      expect(component.isClassroomDuplicate).toBeTrue();
      expect(component.classForm.value.className).toBe('');
    });

    it('should validate classroom capacity against daycare limit', () => {
      component.centreID = 10;
      mockClassService.getClassroomCapacityByClassID.and.returnValue(
        of({ message: 'Invalid' })
      );

      component.validateClassRoomCapacity({ target: { value: '50' } });

      expect(mockToastr.error).toHaveBeenCalledWith('Classroom capacity exceeded');
      expect(component.classForm.value.maxCapacity).toBe('');
    });
  });

  describe('Active/Inactive & Onboarding', () => {
    it('should handle activeInactive confirmation', async () => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true } as any)
      );
      mockClassService.ActiveInactiveClassroom.and.returnValue(of({ message: 'OK' }));

      component.activeInactive(5, true);
      await fixture.whenStable();

      expect(mockClassService.ActiveInactiveClassroom).toHaveBeenCalledWith(5);
    });

    it('should proceed onboarding step successfully', () => {
      component.centreID = 10;
      mockCommonService.manageDaycareOnBoarding.and.returnValue(
        of({ message: 'Success', activity: 'Onboarding Step Complete' })
      );

      component.proceededOnBoarding();

      expect(mockCommonService.manageDaycareOnBoarding).toHaveBeenCalledWith(10, 'ManageDaycareCentreClasses');
      expect(mockOnboardingService.handleNext).toHaveBeenCalledWith('Tab-4');
    });
  });
});
