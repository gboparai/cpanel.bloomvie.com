import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManageSchedulerComponent } from './manage-scheduler.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common-component/common.service';
import { ToastrService } from 'ngx-toastr';
import { ManageSchedulerService } from './manage-scheduler.service';
import { SchedulerService } from '../../common-component/scheduler/scheduler.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ManageSchedulerComponent', () => {
  let component: ManageSchedulerComponent;
  let fixture: ComponentFixture<ManageSchedulerComponent>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockManageScheduler: any;
  let mockSchedulerService: jasmine.SpyObj<SchedulerService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'check']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'encrypt', 'trigger']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockManageScheduler = jasmine.createSpyObj('ManageSchedulerService', [
      'getDaycareClasses',
      'GetAllDays',
      'getCentreWorkingDaysByCentreID',
      'getAllAvailableTeachersByCentreID',
      'BulkClassAssignment',
    ]);
    mockSchedulerService = jasmine.createSpyObj('SchedulerService', [
      'getCentreStaffList',
      'getStudentList',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockCookie.get.and.returnValue('1');
    mockCommonService.decrypt.and.returnValue('staff');
    mockManageScheduler.getDaycareClasses.and.returnValue(of({ message: 'Success', result: [] }));
    mockManageScheduler.GetAllDays.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, day: 'Monday' },
        { id: 2, day: 'Tuesday' },
      ],
    }));
    mockManageScheduler.getCentreWorkingDaysByCentreID.and.returnValue(of({
      message: 'Success',
      result: { sun: false, mon: true, tues: true, wed: false, thu: false, fri: false, sat: false },
    }));
    mockSchedulerService.getCentreStaffList.and.returnValue(of({ message: 'Success', result: [] }));
    mockSchedulerService.getStudentList.and.returnValue(of({ message: 'Success', result: [] }));

    // Mock jQuery
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val'),
    });

    await TestBed.configureTestingModule({
      imports: [ManageSchedulerComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
        { provide: CommonService, useValue: mockCommonService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: ManageSchedulerService, useValue: mockManageScheduler },
        { provide: SchedulerService, useValue: mockSchedulerService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ type: 'encrypted-staff' }),
            snapshot: { queryParamMap: { get: () => null } },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageSchedulerComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageSchedulerComponent);
    component = fixture.componentInstance;
    spyOn(component, 'startTour').and.stub();
    spyOn(component, 'InitDatePicker').and.stub();
  });

  it('should create ManageSchedulerComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize scheduleType, GetAllDays, getClassList, and staff list', fakeAsync(() => {
      component.type = undefined;
      component.scheduleType = undefined;

      component.ngOnInit();
      tick(150);

      expect(mockCommonService.decrypt).toHaveBeenCalledWith('encrypted-staff');
      expect(component.scheduleType).toBe('staff');
      expect(mockManageScheduler.GetAllDays).toHaveBeenCalled();
      expect(mockManageScheduler.getDaycareClasses).toHaveBeenCalled();
      expect(mockSchedulerService.getCentreStaffList).toHaveBeenCalled();
    }));

    it('should call getStudentList if scheduleType is not staff', fakeAsync(() => {
      component.type = 'student';
      component.ngOnInit();
      tick(150);

      expect(mockSchedulerService.getStudentList).toHaveBeenCalled();
    }));
  });

  describe('Navigation and Class/Staff retrieval', () => {
    it('should navigate to scheduler on goToScheduler()', () => {
      component.goToScheduler();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['scheduler']);
    });

    it('should retrieve working days and populate filteredDaysWithIds', () => {
      component.DayList = [
        { id: 1, day: 'Monday' },
        { id: 2, day: 'Tuesday' },
      ];
      component.getCentreWorkingDaysByCentreID();

      expect(component.filteredDays).toContain('Monday');
      expect(component.filteredDays).toContain('Tuesday');
      expect(component.filteredDaysWithIds.length).toBe(2);
    });

    it('should toggle day in onDayToggle', () => {
      component.classList = [
        { id: 10, dayID: [{ dayID: 1 }] },
        { id: 20, dayID: [{ dayID: 2 }] },
      ];
      const day = { id: 1, isActive: false };

      component.onDayToggle(day);

      expect(day.isActive).toBeTrue();
      expect(component.selectedDayIds).toContain(1);
      expect(component.filteredClassList.length).toBe(1);

      component.onDayToggle(day);
      expect(day.isActive).toBeFalse();
      expect(component.selectedDayIds).not.toContain(1);
    });
  });

  describe('assignClass', () => {
    it('should populate class details and call getAllAvailableTeachersByCentreID with event', () => {
      component.masterDays = [
        { id: 1, day: 'Monday' },
        { id: 2, day: 'Tuesday' },
      ];
      component.staffList = [
        { id: 10, teacherAvailability: [{ dayID: 1 }] },
      ];
      component.scheduleType = 'staff';
      spyOn(component, 'getAllAvailableTeachersByCentreID');

      const mockEvent = {
        id: 5,
        name: 'Preschool',
        staffRatio: 2,
        studentRatio: 10,
        dayID: [{ dayID: 1 }],
      };

      component.assignClass(mockEvent);

      expect(component.classID).toBe(5);
      expect(component.className).toBe('Preschool');
      expect(component.classDaysID).toEqual([1]);
      expect(component.getAllAvailableTeachersByCentreID).toHaveBeenCalledWith(5, [{ dayID: 1 }]);
    });

    it('should clear fields when event is null or falsy', () => {
      component.assignClass(null);

      expect(component.classID).toBe(0);
      expect(component.className).toBe('');
      expect(component.classDaysSlot).toEqual([]);
      expect(component.filteredStaffList).toEqual([]);
    });
  });

  describe('Track and Helpers', () => {
    it('should track items by id', () => {
      expect(component.trackById(0, { id: 77 })).toBe(77);
    });

    it('should return availability for matching classDaysID', () => {
      component.classDaysID = [2, 3];
      const availabilities = [{ dayID: 1 }, { dayID: 3 }];
      expect(component.getAvailabilityByDay(availabilities)).toEqual({ dayID: 3 });
    });

    it('should return null when availabilityList or classDaysID is not an array', () => {
      expect(component.getAvailabilityByDay(null as any)).toBeNull();
    });

    it('should get day name from masterDays', () => {
      component.masterDays = [{ id: 1, day: 'Monday' }];
      expect(component.getDayName(1)).toBe('Monday');
    });

    it('should toggle repeat flag in onRepeatToggle', () => {
      component.tocFilterAvailabilityDays = [];
      const event = { target: { value: 'false' } } as any;
      component.onRepeatToggle(event);
      expect(component.isRepeating).toBeFalse();
    });
  });

  describe('Staff and Student Management', () => {
    it('should get name by id for staff and student', () => {
      component.scheduleType = 'staff';
      component.staffList = [{ id: 1, firstName: 'John', lastName: 'Smith' }];
      expect(component.getNameById(1)).toBe('John Smith');

      component.scheduleType = 'student';
      component.studentList = [{ studentID: 2, studentFirstName: 'Tommy', studentLastName: 'Lee' }];
      expect(component.getNameById(2)).toBe('Tommy Lee');
    });

    it('should remove user id from staff list and AssignmentBO', () => {
      component.scheduleType = 'staff';
      component.selectedStaffIds = [1, 2];
      component.filteredStaffList = [{ id: 1 }, { id: 2 }];
      component.AssignmentBO = [
        {
          classID: 10,
          slots: [
            { slotID: 1, dayID: 1, dayName: 'Mon', classSlotID: 1, teacherID: 1, startTime: '09:00', endTime: '10:00', startDate: '', endDate: '', isRepeating: true },
          ],
        },
      ];

      component.removeUserId(1);

      expect(component.selectedStaffIds).toEqual([2]);
      expect(component.AssignmentBO.length).toBe(0);
    });

    it('should toggle staff selection in onStaffToggle', () => {
      component.classDaysID = [1];
      component.selectedDayIds = [1];
      const staff = {
        id: 10,
        isChecked: true,
        userRoleID: 8,
        teacherAvailability: [{ dayID: 1 }],
        tocTeacherAvailableRange: [{ id: 1 }],
      };

      component.onStaffToggle(staff);

      expect(component.selectedTeacherId).toBe(10);
      expect(component.filterTeacherDays.length).toBe(1);
      expect(component.tocFilterAvailabilityDays.length).toBe(1);
    });

    it('should view user slots in viewUserSlots', () => {
      component.scheduleType = 'staff';
      component.AssignmentBO = [
        {
          classID: 1,
          slots: [
            { slotID: 1, dayID: 1, dayName: 'Mon', classSlotID: 1, teacherID: 5, startTime: '09:00', endTime: '10:00', startDate: '', endDate: '', isRepeating: true },
          ],
        },
      ];

      component.viewUserSlots({ id: 5 });

      expect(component.selectedTeacherId).toBe(5);
      expect(component.TempAssignmentList.length).toBe(1);
    });
  });

  describe('Date and Day Selection', () => {
    it('should update day selection and times on onDayRadioChange for student', () => {
      component.scheduleType = 'student';
      component.dayNameArray = [
        { dayID: 2, startTime: '08:00:00', endTime: '12:00:00' },
      ];

      component.onDayRadioChange(2);

      expect(component.selectedDayId).toBe(2);
      expect(component.assignClassForm.value.startTime).toBe('08:00');
      expect(component.assignClassForm.value.endTime).toBe('12:00');
    });

    it('should format date string locally', () => {
      const date = new Date(2026, 0, 15, 9, 30, 0);
      const formatted = component.formatDateLocal(date);
      expect(formatted).toContain('2026-01-15T09:30:00');
    });

    it('should format date to ISO', () => {
      const iso = component.formatToISODate('01-15-2026');
      expect(iso).toContain('2026-01-15');
    });
  });

  describe('Assignment List Operations', () => {
    it('should reset form on resetForm()', () => {
      component.assignClassForm.patchValue({
        dayID: 3,
        teacherID: 5,
        startTime: '10:00',
      });

      component.resetForm();

      expect(component.assignClassForm.value.dayID).toBe(0);
      expect(component.assignClassForm.value.teacherID).toBe(0);
      expect(component.assignClassForm.value.startTime).toBeNull();
    });

    it('should check hasSlots for staffId', () => {
      component.scheduleType = 'staff';
      component.AssignmentBO = [
        {
          classID: 1,
          slots: [
            { slotID: 1, dayID: 1, dayName: 'Mon', classSlotID: 1, teacherID: 15, startTime: '09:00', endTime: '10:00', startDate: '', endDate: '', isRepeating: true },
          ],
        },
      ];

      expect(component.hasSlots(15)).toBeTrue();
      expect(component.hasSlots(99)).toBeFalse();
    });

    it('should edit slot and patch assignClassForm', () => {
      component.TempAssignmentList = [
        {
          slotID: 1,
          dayID: 2,
          dayName: 'Tuesday',
          classSlotID: 1,
          teacherID: 10,
          startTime: '09:00',
          endTime: '11:00',
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          isRepeating: true,
        },
      ];

      component.editSlot(0);

      expect(component.isUpdate).toBeTrue();
      expect(component.assignClassForm.value.startTime).toBe('09:00');
      expect(component.assignClassForm.value.endTime).toBe('11:00');
    });

    it('should remove item from TempAssignmentList in removeList', () => {
      component.TempAssignmentList = [
        { slotID: 1 } as any,
        { slotID: 2 } as any,
      ];

      component.removeList(0);

      expect(component.TempAssignmentList.length).toBe(1);
      expect(component.TempAssignmentList[0].slotID).toBe(2);
    });

    it('should submit bulk assignment via service', () => {
      component.AssignmentBO = [
        {
          classID: 1,
          slots: [
            { slotID: 1, dayID: 1, dayName: 'Mon', classSlotID: 1, teacherID: 10, startTime: '09:00', endTime: '10:00', startDate: '2026-01-01', endDate: '2026-01-10', isRepeating: true },
          ],
        },
      ];
      component.isOnboarding = true;
      mockManageScheduler.BulkClassAssignment.and.returnValue(of({
        message: 'Success',
        activity: 'Assigned successfully',
      }));
      spyOn(component.onBulkAssignmentSuccess, 'emit');

      component.manageBulkAssignment();

      expect(mockManageScheduler.BulkClassAssignment).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Assigned successfully');
      expect(component.onBulkAssignmentSuccess.emit).toHaveBeenCalled();
    });
  });
});
