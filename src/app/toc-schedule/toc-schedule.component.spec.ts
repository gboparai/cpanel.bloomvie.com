import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TocScheduleComponent } from './toc-schedule.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { TeacherDashboardServiceService } from '../teachers-management/teachers-dashboard/teacher-dashboard-service.service';
import { CookieService } from 'ngx-cookie-service';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('TocScheduleComponent', () => {
  let component: TocScheduleComponent;
  let fixture: ComponentFixture<TocScheduleComponent>;
  let mockTeacherService: jasmine.SpyObj<TeacherDashboardServiceService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockTocService: any;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let modalSpy: jasmine.Spy;

  beforeEach(async () => {
    mockTeacherService = jasmine.createSpyObj('TeacherDashboardServiceService', ['getDayCareEventsByID']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'CentreID') return '5';
      return '';
    });

    mockTocService = jasmine.createSpyObj('TocRegistrationService', [
      'getAllMasterStatus',
      'getTOCUserDetailByID',
      'getTOCUserSlotById',
      'updateTOCUserSlot',
      'deleteTOCUserSlot',
      'deleteTOCUserAvailableSlots',
      'ManageTOCMoreCentre'
    ]);

    mockTocService.getAllMasterStatus.and.returnValue(of({
      message: 'OK',
      result: [
        { id: 1, status: 'Pending' },
        { id: 2, status: 'Approved' }
      ]
    }));

    mockTocService.getTOCUserDetailByID.and.returnValue(of({
      message: 'ok',
      result: {
        workingDays: '1,2',
        partTimeStartDate: '2025-01-01',
        partTimeEndDate: '2025-01-31',
        slotsGroupedByWeek: [
          {
            weekName: 'Week 1',
            slots: [
              { workingDayName: 'Monday', startTime: '09:00', endTime: '12:00', statusId: 1 },
              { workingDayName: 'Tuesday', startTime: '13:00', endTime: '17:00', statusId: 2 }
            ]
          }
        ]
      }
    }));

    modalSpy = jasmine.createSpy('modal');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: modalSpy,
      html: jasmine.createSpy('html'),
    });

    await TestBed.configureTestingModule({
      imports: [TocScheduleComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        ChangeDetectorRef,
        { provide: TeacherDashboardServiceService, useValue: mockTeacherService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: TocRegistrationService, useValue: mockTocService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(TocScheduleComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TocScheduleComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.TOCSlotForm).toBeDefined();
  });

  describe('Form & Time Validation', () => {
    it('should invalidate when starttime is greater than or equal to endTime', () => {
      component.TOCSlotForm.patchValue({
        starttime: '14:00',
        endTime: '12:00'
      });
      expect(component.TOCSlotForm.errors).toEqual({ endTimeInvalid: true });

      component.TOCSlotForm.patchValue({
        starttime: '10:00',
        endTime: '10:00'
      });
      expect(component.TOCSlotForm.errors).toEqual({ endTimeInvalid: true });
    });

    it('should validate successfully when starttime is earlier than endTime', () => {
      component.TOCSlotForm.patchValue({
        starttime: '09:00',
        endTime: '12:00'
      });
      expect(component.TOCSlotForm.errors).toBeNull();
    });
  });

  describe('ngOnInit and Data Fetching', () => {
    it('should read cookies and call getTOCUserDetailByID and getAllMasterStatus', () => {
      component.ngOnInit();
      expect(component.UserID).toBe(101);
      expect(component.centreID).toBe(5);
      expect(mockTocService.getAllMasterStatus).toHaveBeenCalled();
      expect(mockTocService.getTOCUserDetailByID).toHaveBeenCalledWith(101, 5);
      expect(component.StatusList.length).toBe(2);
      expect(component.TOCUserDetail.length).toBe(1);
    });

    it('should handle getTOCUserDetailByID error or empty response', () => {
      mockTocService.getTOCUserDetailByID.and.returnValue(of({ message: 'Error', result: null }));
      component.getTOCUserDetailByID(101);
      expect(component.TOCUserDetail).toEqual([]);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('Slot Expansion and Filtering', () => {
    it('should filter status correctly using filterStatus', () => {
      component.StatusList = [
        { id: 1, status: 'Pending' },
        { id: 2, status: 'Approved' }
      ];
      expect(component.filterStatus(1)).toBe('Pending');
      expect(component.filterStatus(2)).toBe('Approved');
      expect(component.filterStatus(999)).toBeNull();
    });

    it('should filter slots by day in getFilteredSlots', () => {
      const slotDetail = {
        slots: [
          { workingDayName: 'Monday', startTime: '09:00' },
          { workingDayName: 'Tuesday', startTime: '10:00' }
        ]
      };
      const filtered = component.getFilteredSlots(slotDetail, 'Monday');
      expect(filtered.length).toBe(1);
      expect(filtered[0].workingDayName).toBe('Monday');
    });

    it('should toggle expanded week on onPlusClick', () => {
      const slotDetail = {
        weekName: 'Week 1',
        slots: [{ workingDayName: 'Monday' }]
      };

      // Expand
      component.onPlusClick(slotDetail, 0);
      expect(component.currentExpandedDay).toEqual({
        slotIndex: 0,
        weekName: 'Week 1',
        dayName: ''
      });
      expect(component.uniqueWorkingDayNames).toContain('Monday');

      // Collapse same
      component.onPlusClick(slotDetail, 0);
      expect(component.currentExpandedDay).toBeNull();
    });

    it('should bind grid click and populate filteredSlotsByDay', () => {
      component.StatusList = [{ id: 1, status: 'Pending' }];
      const slotDetail = {
        slots: [{ workingDayName: 'Monday', statusId: 1 }]
      };

      component.bindGridClick(slotDetail, 'Monday', 0, 'Week 1');
      expect(component.currentExpandedDay).toEqual({ slotIndex: 0, dayName: 'Monday', weekName: 'Week 1' });
      expect(component.filteredSlotsByDay.length).toBe(1);
      expect(component.filteredSlotsByDay[0].StatusName).toBe('Pending');
    });
  });

  describe('Modal Actions (Edit & Delete)', () => {
    it('should open edit modal and patch form in OpenModal', () => {
      mockTocService.getTOCUserSlotById.and.returnValue(of({
        message: 'ok',
        result: {
          id: 50,
          startTime: '09:00',
          endTime: '12:00',
          option: 'None'
        }
      }));

      component.OpenModal(50);

      expect(component.IsEditable).toBeTrue();
      expect(mockTocService.getTOCUserSlotById).toHaveBeenCalledWith(50);
      expect(component.TOCSlotForm.value.id).toBe(50);
      expect(component.TOCSlotForm.value.starttime).toBe('09:00');
      expect((window as any).$).toHaveBeenCalledWith('#TimeSlotModal');
      expect(modalSpy).toHaveBeenCalledWith('show');
    });

    it('should open delete modal in deleteModal', () => {
      mockTocService.getTOCUserSlotById.and.returnValue(of({
        message: 'ok',
        result: {
          id: 60,
          startTime: '10:00',
          endTime: '14:00',
          option: 'None'
        }
      }));

      component.deleteModal(60);

      expect(component.IsEditable).toBeFalse();
      expect(component.TOCSlotForm.value.id).toBe(60);
      expect(modalSpy).toHaveBeenCalledWith('show');
    });

    it('should call updateTOCUserSlot and handle success', () => {
      mockTocService.updateTOCUserSlot.and.returnValue(of({ message: 'ok' }));
      spyOn(component, 'getTOCUserDetailByID');

      component.updateTOCUserSlot();

      expect(mockTocService.updateTOCUserSlot).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Slot update Successfully');
      expect(component.getTOCUserDetailByID).toHaveBeenCalled();
    });

    it('should call deleteTOCUserSlot and handle success', () => {
      mockTocService.deleteTOCUserSlot.and.returnValue(of({ message: 'ok' }));
      spyOn(component, 'getTOCUserDetailByID');

      component.deleteTOCUserSlot();

      expect(mockTocService.deleteTOCUserSlot).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Slot deleted Successfully');
      expect(component.getTOCUserDetailByID).toHaveBeenCalled();
    });

    it('should call deleteTOCUserAvailableSlots for a day', () => {
      mockTocService.deleteTOCUserAvailableSlots.and.returnValue(of({ message: 'ok' }));
      spyOn(component, 'getTOCUserDetailByID');

      component.deleteTOCUserAvailableSlots('Monday');

      expect(mockTocService.deleteTOCUserAvailableSlots).toHaveBeenCalledWith(101, 'Monday', 5);
      expect(mockToastr.success).toHaveBeenCalledWith('Slots deleted Successfully');
    });
  });

  describe('Reset and Modal Close', () => {
    it('should reset form and hide modals in resetForm', () => {
      component.resetForm();
      expect(modalSpy).toHaveBeenCalledWith('hide');
    });

    it('should reset state and update working days in CloseModal', () => {
      component.CloseModal();
      expect(component.IsAddMoreSlots).toBeFalse();
      expect(component.selectedWorkingDaysForAddingSlots).toEqual([]);
      expect(modalSpy).toHaveBeenCalledWith('hide');
    });
  });
});
