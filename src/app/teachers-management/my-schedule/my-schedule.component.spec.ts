import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MyScheduleComponent } from './my-schedule.component';
import { AddBulkActivityService } from '../../day-care-management/add-bulk-activites/add-bulk-activity.service';
import { ManageTeacherService } from '../manage-teacher/manage-teacher.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TimeFormatAmPmPipe, TimeFormatPipe } from '../../bloomvie-management/dc-appointments-list/time-format.pipe';

describe('MyScheduleComponent', () => {
  let component: MyScheduleComponent;
  let fixture: ComponentFixture<MyScheduleComponent>;

  let mockAddBulkService: jasmine.SpyObj<AddBulkActivityService>;
  let mockTeacherService: jasmine.SpyObj<ManageTeacherService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    mockAddBulkService = jasmine.createSpyObj('AddBulkActivityService', ['someMethod']);
    mockTeacherService = jasmine.createSpyObj('ManageTeacherService', ['getPendingStudentAttendance']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'CentreID') return '5';
      return '';
    });

    mockTeacherService.getPendingStudentAttendance.and.returnValue(
      of({
        message: 'Data fetched successfully.',
        result: {
          classInfo: [
            { className: 'Infant A', startTime: '09:00', endTime: '12:00' }
          ]
        }
      })
    );

    await TestBed.configureTestingModule({
      imports: [MyScheduleComponent, TimeFormatAmPmPipe, TimeFormatPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AddBulkActivityService, useValue: mockAddBulkService },
        { provide: ManageTeacherService, useValue: mockTeacherService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner }
      ]
    })
    .overrideComponent(MyScheduleComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize properties from cookies', () => {
    expect(component).toBeTruthy();
    expect(component.loginUserID).toBe(101);
    expect(component.centreID).toBe(5);
    expect(component.daysList.length).toBe(7);
  });

  it('should update ContentAcceptedList on onPageChangeToc', () => {
    component.onPageChangeToc(3);
    expect(component.ContentAcceptedList).toBe(3);
  });

  describe('getNumberOfDays', () => {
    it('should select all days when "Select All" is in the selection event', () => {
      spyOn(component, 'onSearch');
      component.getNumberOfDays(['Select All', 'Monday']);

      expect(component.selectedDaysModel.length).toBe(6);
      expect(component.selectedDaysModel).toContain('Monday');
      expect(component.selectedDaysModel).toContain('Saturday');
      expect(component.dayCount.length).toBe(6);
      expect(component.onSearch).toHaveBeenCalled();
    });

    it('should select specific days when individual items are selected', () => {
      spyOn(component, 'onSearch');
      const selected = [{ label: 'Monday' }, { label: 'Wednesday' }];
      component.getNumberOfDays(selected);

      expect(component.dayCount).toEqual(selected);
      expect(component.onSearch).toHaveBeenCalled();
    });
  });

  describe('clearSelectedDays', () => {
    it('should reset selectedDaysModel, dayCount, and TeacherSectionRecord', () => {
      component.selectedDaysModel = ['Monday'];
      component.dayCount = [{ label: 'Monday' }];
      component.TeacherSectionRecord = [{ id: 1 }];
      component.skeletonShow = 'Skelton';

      component.clearSelectedDays();

      expect(component.selectedDaysModel.length).toBe(0);
      expect(component.dayCount.length).toBe(0);
      expect(component.TeacherSectionRecord.length).toBe(0);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('onSearch', () => {
    it('should call getPendingStudentAttendance and update TeacherSectionRecord on success', () => {
      component.loginUserID = 101;
      component.dayCount = [{ label: 'Monday' }, { label: 'Tuesday' }];

      component.onSearch();

      expect(mockTeacherService.getPendingStudentAttendance).toHaveBeenCalledWith(101, 'Monday,Tuesday');
      expect(component.TeacherSectionRecord.length).toBe(1);
      expect(component.TeacherSectionRecord[0].className).toBe('Infant A');
      expect(component.skeletonShow).toBe('');
    });

    it('should handle API response with unexpected message', () => {
      mockTeacherService.getPendingStudentAttendance.and.returnValue(
        of({ message: 'No records found', result: null })
      );
      component.loginUserID = 101;
      component.dayCount = [{ label: 'Monday' }];

      component.onSearch();

      expect(component.TeacherSectionRecord.length).toBe(0);
      expect(component.skeletonShow).toBe('');
    });

    it('should handle API error gracefully', () => {
      mockTeacherService.getPendingStudentAttendance.and.returnValue(
        throwError(() => new Error('Network error'))
      );
      component.loginUserID = 101;
      component.dayCount = [{ label: 'Monday' }];

      component.onSearch();

      expect(component.TeacherSectionRecord.length).toBe(0);
      expect(component.skeletonShow).toBe('');
    });

    it('should clear TeacherSectionRecord if no days are selected', () => {
      component.dayCount = [];
      component.TeacherSectionRecord = [{ id: 1 }];

      component.onSearch();

      expect(mockTeacherService.getPendingStudentAttendance).not.toHaveBeenCalled();
      expect(component.TeacherSectionRecord.length).toBe(0);
      expect(component.skeletonShow).toBe('');
    });
  });
});
