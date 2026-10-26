import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { AttendanceDashboardComponent } from './attendance-dashboard.component';
import { AttendanceDashboardService } from './attendance-dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { ManageStaffService } from '../../day-care-management/staff-management/add-staff/manage-staff.service';
import { CookieService } from 'ngx-cookie-service';
import { ApplyleaveService } from '../apply-leave/applyleave.service';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('AttendanceDashboardComponent', () => {
  let component: AttendanceDashboardComponent;
  let fixture: ComponentFixture<AttendanceDashboardComponent>;

  let mockAttendanceService: any;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockDatePipe: jasmine.SpyObj<DatePipe>;
  let mockManageStaffService: any;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockApplyService: jasmine.SpyObj<ApplyleaveService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val'),
      text: jasmine.createSpy('text'),
      remove: jasmine.createSpy('remove')
    });

    mockAttendanceService = jasmine.createSpyObj('AttendanceDashboardService', [
      'getstaffAttendanceByCentreID',
      'getTodayAttendanceSummaryByCentreID',
      'getDayCareByID'
    ]);
    mockAttendanceService.getDayCareByID.and.returnValue(of({
      message: 'Success',
      result: { centreName: 'Sunshine Daycare', daycareAddress: '123 Main St' }
    }));
    mockAttendanceService.getstaffAttendanceByCentreID.and.returnValue(of({
      message: 'OK',
      result: [
        {
          fullName: 'Jane Doe',
          checkInDate: '2026-05-01',
          checkInTime: '08:00 AM',
          checkOutTime: '04:00 PM',
          attendanceStatus: 'Present'
        }
      ]
    }));
    mockAttendanceService.getTodayAttendanceSummaryByCentreID.and.returnValue(of({
      message: 'OK',
      result: {
        totalStaff: 10,
        presentStaff: 8,
        absentStaff: 2,
        totalStudent: 20,
        presentStudent: 18,
        absentStudent: 2
      }
    }));

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('2026-05-15');

    mockManageStaffService = jasmine.createSpyObj('ManageStaffService', ['getClassListByuserRoleID']);
    mockManageStaffService.getClassListByuserRoleID.and.returnValue(of({
      message: 'Success',
      result: [{ classID: 1, className: 'Toddlers' }]
    }));

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'CentreID') return '5';
      if (key === 'UserRoleId') return '3';
      if (key === 'ChildComponent') return 'Staff Attendance';
      if (key === 'UserInfo') return JSON.stringify({ result: { firstName: 'Alice', middleName: 'M', lastName: 'Smith' } });
      return '';
    });

    mockApplyService = jasmine.createSpyObj('ApplyleaveService', ['getEmployeeLeave']);
    mockApplyService.getEmployeeLeave.and.returnValue(of({
      message: 'OK',
      result: { records: [{ startDate: '2026-05-01', endDate: '2026-05-02' }] }
    }));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AttendanceDashboardComponent],
      providers: [
        { provide: AttendanceDashboardService, useValue: mockAttendanceService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: ManageStaffService, useValue: mockManageStaffService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ApplyleaveService, useValue: mockApplyService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(AttendanceDashboardComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create the AttendanceDashboardComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize calendarOptions and parse user cookie info for admin role', fakeAsync(() => {
      spyOn(component, 'initDatePicker').and.callFake(() => {});
      spyOn(component, 'initDateRangePicker').and.callFake(() => {});

      component.ngOnInit();
      flush();

      expect(component.calendarOptions).toBeDefined();
      expect(component.userID).toBe('101');
      expect(component.centreID).toBe('5');
      expect(component.userRoleID).toBe('3');
      expect(component.fullName).toBe('Alice M Smith');
      expect(mockAttendanceService.getstaffAttendanceByCentreID).toHaveBeenCalled();
      expect(mockAttendanceService.getTodayAttendanceSummaryByCentreID).toHaveBeenCalled();
      expect(mockAttendanceService.getDayCareByID).toHaveBeenCalled();
    }));

    it('should initialize for student attendance when ChildComponent is Student Attendance', fakeAsync(() => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserId') return '101';
        if (key === 'CentreID') return '5';
        if (key === 'UserRoleId') return '3';
        if (key === 'ChildComponent') return 'Student Attendance';
        return '';
      });

      component.ngOnInit();
      flush();

      expect(component.isStudentAttendance).toBeTrue();
      expect(component.displayRole).toBe('4');
    }));

    it('should load class list when displayRole is 4 (teacher view)', fakeAsync(() => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserId') return '101';
        if (key === 'CentreID') return '5';
        if (key === 'UserRoleId') return '4';
        return '';
      });

      component.ngOnInit();
      flush();

      expect(mockManageStaffService.getClassListByuserRoleID).toHaveBeenCalledWith(101, 5, 4);
      expect(component.AllClassList.length).toBe(1);
    }));
  });

  describe('selectedClass', () => {
    it('should update selectedClassID and re-fetch attendance', () => {
      const spy = spyOn(component, 'getstaffAttendanceByCentreID').and.callThrough();
      component.selectedClass({ classroomID: 2, classroomName: 'Infants' });

      expect(component.selectedClassID).toBe(2);
      expect(component.selectedClassName).toBe('Infants');
      expect(spy).toHaveBeenCalled();
    });

    it('should handle deselection of class', () => {
      const spy = spyOn(component, 'getstaffAttendanceByCentreID').and.callThrough();
      component.selectedClass(null);

      expect(component.selectedClassID).toBeNull();
      expect(component.selectedClassName).toBeNull();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('formatDate', () => {
    it('should format date to mm-dd-yyyy', () => {
      const d = new Date(2026, 4, 10);
      const res = component.formatDate(d);
      expect(res).toBe('05-10-2026');
    });
  });

  describe('resetfilter', () => {
    it('should call initDatePicker and search attendance', () => {
      spyOn(component, 'initDatePicker').and.callFake(() => {});
      const spy = spyOn(component, 'getstaffAttendanceByCentreID').and.callFake(() => {});

      component.resetfilter();

      expect(component.initDatePicker).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update ContentP', () => {
      component.onPageChange(4);
      expect(component.ContentP).toBe(4);
    });
  });

  describe('viewDetail', () => {
    it('should set image paths', async () => {
      await component.viewDetail('in.jpg', 'out.jpg');
      expect(component.inFullPath).toBe('in.jpg');
      expect(component.outFullPath).toBe('out.jpg');
    });
  });

  describe('openMapPopup', () => {
    it('should set coordinates and call initMap when valid numbers are provided', fakeAsync(() => {
      const spy = spyOn(component, 'initMap').and.callFake(() => {});
      component.openMapPopup(77.1025, 28.7041);
      tick(100);

      expect(component.IsnotLatandLong).toBeFalse();
      expect(spy).toHaveBeenCalledWith(77.1025, 28.7041);
    }));

    it('should set IsnotLatandLong true when coordinates are null', () => {
      const spy = spyOn(component, 'initMap').and.callFake(() => {});
      component.openMapPopup(null as any, null as any);

      expect(component.IsnotLatandLong).toBeTrue();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('goToApplyLeave', () => {
    it('should navigate to apply-leave route', () => {
      component.goToApplyLeave();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/apply-leave']);
    });
  });

  describe('getstaffAttendanceByCentreID error handling', () => {
    it('should handle API error gracefully', () => {
      mockAttendanceService.getstaffAttendanceByCentreID.and.returnValue(throwError(() => new Error('Error')));
      component.getstaffAttendanceByCentreID();
      expect(component.attendanceList).toEqual([]);
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('getTodayAttendanceSummaryByCentreID error handling', () => {
    it('should handle API error gracefully in summary call', () => {
      mockAttendanceService.getTodayAttendanceSummaryByCentreID.and.returnValue(throwError(() => new Error('Error')));
      component.getTodayAttendanceSummaryByCentreID();
      expect(component.isChartVisible).toBeFalse();
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });
});
