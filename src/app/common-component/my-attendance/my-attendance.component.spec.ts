import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MyAttendanceComponent } from './my-attendance.component';
import { MyAttendanceService } from './my-attendance.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ClassroomDetailsService } from '../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { of, throwError } from 'rxjs';

describe('MyAttendanceComponent', () => {
  let component: MyAttendanceComponent;
  let fixture: ComponentFixture<MyAttendanceComponent>;

  let mockService: jasmine.SpyObj<MyAttendanceService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockDatePipe: jasmine.SpyObj<DatePipe>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockClassroomService: jasmine.SpyObj<ClassroomDetailsService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val')
    });

    mockService = jasmine.createSpyObj('MyAttendanceService', [
      'getMyAttendanceByID',
      'getCurrentMonthAttendanceSummaryByID',
      'getDaycareSeasonalHolidayList',
      'getStudentDetailByStudentId',
      'checkTodayAttandanceStatusById'
    ]);
    mockService.getMyAttendanceByID.and.returnValue(of({
      message: 'ok',
      result: [
        {
          date: '2026-05-10',
          checkInTime: '08:00 AM',
          checkOutTime: '04:00 PM',
          attendanceStatus: 'Present'
        }
      ]
    }));
    mockService.getCurrentMonthAttendanceSummaryByID.and.returnValue(of({
      message: 'ok',
      result: { totalDays: 20, presentDays: 18, absentDays: 2 }
    }));
    mockService.getDaycareSeasonalHolidayList.and.returnValue(of({
      message: 'ok',
      result: [{ holidayName: 'Victoria Day', holidayDate: '2026-05-18' }]
    }));
    mockService.getStudentDetailByStudentId.and.returnValue(of({
      message: 'OK',
      result: { studentFirstName: 'Tommy', studentLastName: 'Lee' }
    }));
    mockService.checkTodayAttandanceStatusById.and.returnValue(of({
      message: 'ok',
      result: true
    }));

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('2026-05-15');

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'CentreID') return '10';
      if (key === 'UserRoleId') return '4';
      if (key === 'StudentID') return '5';
      if (key === 'UserInfo') return JSON.stringify({ result: { firstName: 'Sarah', middleName: '', lastName: 'Connor' } });
      return '';
    });

    mockClassroomService = jasmine.createSpyObj('ClassroomDetailsService', ['getTeacherAvailability']);
    mockClassroomService.getTeacherAvailability.and.returnValue(of({ message: 'Ok', result: [{ dayNumber: 1 }] }));

    await TestBed.configureTestingModule({
      imports: [MyAttendanceComponent],
      providers: [
        { provide: MyAttendanceService, useValue: mockService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ClassroomDetailsService, useValue: mockClassroomService },
        ChangeDetectorRef
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(MyAttendanceComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAttendanceComponent);
    component = fixture.componentInstance;
  });

  it('should create the MyAttendanceComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize properties and load attendance for teacher role', () => {
      component.ngOnInit();

      expect(component.userID).toBe('101');
      expect(component.centreID).toBe('10');
      expect(component.userRoleID).toBe('4');
      expect(component.fullName).toBe('Sarah Connor');
      expect(mockService.checkTodayAttandanceStatusById).toHaveBeenCalled();
      expect(mockService.getCurrentMonthAttendanceSummaryByID).toHaveBeenCalled();
      expect(mockService.getDaycareSeasonalHolidayList).toHaveBeenCalled();
      expect(mockService.getMyAttendanceByID).toHaveBeenCalled();
    });

    it('should load student detail when role is parent (role 5)', () => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserId') return '200';
        if (key === 'UserRoleId') return '5';
        if (key === 'StudentID') return '5';
        return '';
      });

      component.ngOnInit();

      expect(mockService.getStudentDetailByStudentId).toHaveBeenCalledWith(5);
      expect(component.fullName).toBe('TommyLee');
    });
  });

  describe('formatDate', () => {
    it('should format date to mm-dd-yyyy', () => {
      const d = new Date(2026, 4, 15); // May 15, 2026
      const res = component.formatDate(d);
      expect(res).toBe('05-15-2026');
    });
  });

  describe('onPageChange', () => {
    it('should update ContentP', () => {
      component.onPageChange(3);
      expect(component.ContentP).toBe(3);
    });
  });

  describe('viewDetail', () => {
    it('should set inFullPath and outFullPath', async () => {
      await component.viewDetail('in.png', 'out.png');
      expect(component.inFullPath).toBe('in.png');
      expect(component.outFullPath).toBe('out.png');
    });
  });

  describe('filterAttendance and resetFilter', () => {
    it('should trigger getMyAttendanceByID on filterAttendance', () => {
      const spy = spyOn(component, 'getMyAttendanceByID').and.callThrough();
      component.filterAttendance();
      expect(spy).toHaveBeenCalled();
    });

    it('should reset date filters and trigger getMyAttendanceByID on resetFilter', () => {
      const spy = spyOn(component, 'getMyAttendanceByID').and.callThrough();
      component.selectedStartDate = new Date();
      component.selectedEndDate = new Date();

      component.resetFilter();

      expect(component.selectedStartDate).toBeNull();
      expect(component.selectedEndDate).toBeNull();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('openMapPopup', () => {
    it('should initialize map when coordinates are valid', () => {
      const spy = spyOn(component, 'initMap').and.callFake(() => {});
      component.openMapPopup(-73.9857, 40.7484);

      expect(component.IsnotLatandLong).toBeFalse();
      expect(spy).toHaveBeenCalledWith(-73.9857, 40.7484);
    });

    it('should set IsnotLatandLong to true when coordinates are 0', () => {
      const spy = spyOn(component, 'initMap').and.callFake(() => {});
      component.openMapPopup(0, 0);

      expect(component.IsnotLatandLong).toBeTrue();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
