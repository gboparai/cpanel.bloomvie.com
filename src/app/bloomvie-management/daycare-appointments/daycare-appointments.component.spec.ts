import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { DaycareAppointmentsComponent } from './daycare-appointments.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DaycareAppointmentsService } from './daycare-appointments.service';
import { CommonService } from '../../common-component/common.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

describe('DaycareAppointmentsComponent', () => {
  let component: DaycareAppointmentsComponent;
  let fixture: ComponentFixture<DaycareAppointmentsComponent>;

  let spinnerSpy: jasmine.SpyObj<NgxSpinnerService>;
  let daycareAppointmentsServiceSpy: jasmine.SpyObj<DaycareAppointmentsService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    daycareAppointmentsServiceSpy = jasmine.createSpyObj('DaycareAppointmentsService', [
      'manageSlots',
      'getSlotTime',
    ]);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['getUtcTime']);

    // Set region signal
    (commonServiceSpy as any).regionResponseSignal = signal({
      offsetHours: '0',
      offsetMinutes: '0',
      offsetString: '+00:00',
    });

    cookieServiceSpy.get.and.callFake((key: string) => {
      if (key === 'UserInfo') {
        return JSON.stringify({
          result: {
            userRoleID: 1,
            id: 25,
          },
        });
      }
      return '';
    });

    daycareAppointmentsServiceSpy.getSlotTime.and.returnValue(
      of({ result: [{ slotDate: '2026-10-25', counsellorCount: 0 }] })
    );
    daycareAppointmentsServiceSpy.manageSlots.and.returnValue(
      of({ message: 'ok', result: { id: 1 } })
    );

    await TestBed.configureTestingModule({
      imports: [DaycareAppointmentsComponent, ReactiveFormsModule],
      providers: [
        DatePipe,
        FormBuilder,
        { provide: NgxSpinnerService, useValue: spinnerSpy },
        { provide: DaycareAppointmentsService, useValue: daycareAppointmentsServiceSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DaycareAppointmentsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and initialize SlotForm', () => {
    expect(component).toBeTruthy();
    expect(component.SlotForm).toBeDefined();
    expect(component.SlotFormControls.startTime).toBeDefined();
    expect(component.SlotFormControls.endTime).toBeDefined();
  });

  describe('ngOnInit and defaults', () => {
    it('should parse UserInfo cookie and initialize defaults on ngOnInit', () => {
      component.ngOnInit();

      expect(cookieServiceSpy.get).toHaveBeenCalledWith('UserInfo');
      expect(component.RoleID).toBe(1);
      expect(component.UserID).toBe(25);
      expect(component.SlotForm.value.startTime).toBe('08:00');
      expect(component.SlotForm.value.endTime).toBe('17:00');
    });

    it('should set default times with setDefaultTimes()', () => {
      component.SlotForm.patchValue({ startTime: '', endTime: '' });
      component.setDefaultTimes();

      expect(component.SlotForm.value.startTime).toBe('08:00');
      expect(component.SlotForm.value.endTime).toBe('17:00');
    });

    it('should return GMT offset string format', () => {
      const offset = component.getGMTOffsetString();
      expect(offset).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('should format time string correctly', () => {
      expect(component.formatTime('14:30:00')).toBe('14:30');
    });
  });

  describe('timeValidator', () => {
    it('should return null when endTime is after startTime', () => {
      const group = new FormBuilder().group({
        startTime: ['09:00'],
        endTime: ['10:00'],
      });

      const result = component.timeValidator(group);
      expect(result).toBeNull();
    });

    it('should invalidate and clear endTime when endTime is before or equal to startTime', () => {
      const group = new FormBuilder().group({
        startTime: ['10:00'],
        endTime: ['09:00'],
      });

      const result = component.timeValidator(group);
      expect(result).toEqual({ invalidTime: true });
      expect(group.get('endTime')?.value).toBe('');
    });

    it('should return null if either start or end time is missing', () => {
      const group = new FormBuilder().group({
        startTime: [''],
        endTime: ['10:00'],
      });

      const result = component.timeValidator(group);
      expect(result).toBeNull();
    });
  });

  describe('hasBookedSlots', () => {
    it('should return true if any slot has counsellorCount === 0', () => {
      component.slotDate = [
        { counsellorCount: 2 },
        { counsellorCount: 0 },
      ];
      expect(component.hasBookedSlots).toBe(true);
    });

    it('should return false if no slots have counsellorCount === 0', () => {
      component.slotDate = [
        { counsellorCount: 1 },
        { counsellorCount: 3 },
      ];
      expect(component.hasBookedSlots).toBe(false);
    });

    it('should return false if slotDate is null', () => {
      component.slotDate = null;
      expect(component.hasBookedSlots).toBe(false);
    });
  });

  describe('getSlotDate', () => {
    it('should call getSlotTime and commonService.getUtcTime', () => {
      component.getSlotDate();

      expect(daycareAppointmentsServiceSpy.getSlotTime).toHaveBeenCalled();
      expect(component.slotDate).toEqual([{ slotDate: '2026-10-25', counsellorCount: 0 }]);
      expect(commonServiceSpy.getUtcTime).toHaveBeenCalledWith(component.slotDate);
    });
  });

  describe('SlotSubmit', () => {
    beforeEach(() => {
      component.UserID = 25;
    });

    it('should mark all controls as touched if SlotForm is invalid', () => {
      component.SlotForm.patchValue({
        dateRange: '',
        startDate: null,
      });

      component.SlotSubmit();

      expect(component.SlotForm.invalid).toBe(true);
      expect(daycareAppointmentsServiceSpy.manageSlots).not.toHaveBeenCalled();
    });

    it('should submit successfully when form is valid and dates are correct', () => {
      component.SlotForm.patchValue({
        dateRange: '2026-11-01 to 2026-11-05',
        startDate: '2026-11-01',
        endDate: '2026-11-05',
        startTime: '09:00',
        endTime: '12:00',
        duration: 30,
        createdBy: 25,
      });

      spyOn(component, 'getSlotDate');

      component.SlotSubmit();

      expect(spinnerSpy.show).toHaveBeenCalled();
      expect(daycareAppointmentsServiceSpy.manageSlots).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 0,
          startTime: '09:00:00',
          endTime: '12:00:00',
          createdBy: 25,
        })
      );
      expect(spinnerSpy.hide).toHaveBeenCalled();
      expect(component.getSlotDate).toHaveBeenCalled();
      expect(toastrSpy.success).toHaveBeenCalledWith('Slots Create Successfully');
    });

    it('should handle non-ok message from manageSlots API', () => {
      daycareAppointmentsServiceSpy.manageSlots.and.returnValue(
        of({ message: 'fail', result: null })
      );

      component.SlotForm.patchValue({
        dateRange: '2026-11-01 to 2026-11-05',
        startDate: '2026-11-01',
        endDate: '2026-11-05',
        startTime: '09:00',
        endTime: '12:00',
        duration: 30,
        createdBy: 25,
      });

      component.SlotSubmit();

      expect(spinnerSpy.hide).toHaveBeenCalled();
      expect(toastrSpy.success).not.toHaveBeenCalled();
    });

    it('should return early and log error if endDate < startDate in dateRange', () => {
      spyOn(console, 'error');

      component.SlotForm.patchValue({
        dateRange: '2026-11-10 to 2026-11-05',
        startDate: '2026-11-10',
        endDate: '2026-11-05',
        startTime: '09:00',
        endTime: '12:00',
        duration: 30,
        createdBy: 25,
      });

      component.SlotSubmit();

      expect(console.error).toHaveBeenCalledWith(
        'End date must be greater than or equal to the start date.'
      );
      expect(daycareAppointmentsServiceSpy.manageSlots).not.toHaveBeenCalled();
    });
  });

  it('should call initDateRangePicker on ngAfterViewInit', () => {
    spyOn(component, 'initDateRangePicker');
    component.ngAfterViewInit();
    expect(component.initDateRangePicker).toHaveBeenCalled();
  });
});
