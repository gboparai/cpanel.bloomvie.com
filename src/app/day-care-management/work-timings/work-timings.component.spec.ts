import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WorkTimingsComponent } from './work-timings.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { WorkTimingService } from './work-timings.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../common-component/common.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { ManageDaycareService } from '../manage-daycare/manage-daycare.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('WorkTimingsComponent', () => {
  let component: WorkTimingsComponent;
  let fixture: ComponentFixture<WorkTimingsComponent>;
  let mockWorkTimingsService: jasmine.SpyObj<WorkTimingService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockManageDaycareService: jasmine.SpyObj<ManageDaycareService>;
  let mockOnboardingService: any;

  beforeEach(async () => {
    mockWorkTimingsService = jasmine.createSpyObj('WorkTimingService', [
      'saveWorkTimings',
      'getCentreWorkingDaysByCentreID',
      'getCentreHolidayList',
      'manageDaycareCentreHoliday',
      'deleteHoliday',
      'getSeasonalHolidays',
      'manageSeasonalBreaks',
      'activeInactiveSeasonalHoliday',
      'activeInactiveHolidays',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'manageDaycareOnBoarding']);
    mockManageDaycareService = jasmine.createSpyObj('ManageDaycareService', ['getDayCareByCentreAdminID']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '5';
      return '';
    });
    mockCookie.check.and.returnValue(true);

    mockWorkTimingsService.getCentreWorkingDaysByCentreID.and.returnValue(of({
      message: 'Success',
      result: {
        mon: true,
        monStartTime: '08:00',
        monEndTime: '17:00',
        tues: true,
        tuesStartTime: '08:00',
        tuesEndTime: '17:00',
      },
    }));
    mockWorkTimingsService.getCentreHolidayList.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, holidayName: 'New Year', holidayDate: '01/01/2026' }],
    }));
    mockWorkTimingsService.getSeasonalHolidays.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, title: 'Winter Break', startDate: '12/24/2026', endDate: '01/02/2027' }],
    }));

    mockOnboardingService = {
      isOnboarding: false,
      onBoardingData: { isCompleteStep3: false },
      handleNext: jasmine.createSpy('handleNext'),
      getCurrentTab: jasmine.createSpy('getCurrentTab'),
    };

    await TestBed.configureTestingModule({
      imports: [WorkTimingsComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: WorkTimingService, useValue: mockWorkTimingsService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
        { provide: CommonService, useValue: mockCommonService },
        { provide: ManageDaycareService, useValue: mockManageDaycareService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({
              get: (k: string) => (k === 'enc_id' ? null : null),
            }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(WorkTimingsComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkTimingsComponent);
    component = fixture.componentInstance;
    spyOn(component, 'initDatePickers').and.stub();
  });

  it('should create WorkTimingsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and Forms', () => {
    it('should initialize ClientWorkingDaysForm, holidayForm, and seasonalBreakForm', () => {
      expect(component.ClientWorkingDaysForm.contains('mon')).toBeTrue();
      expect(component.ClientWorkingDaysForm.contains('fri')).toBeTrue();
      expect(component.holidayForm.contains('holidayName')).toBeTrue();
      expect(component.seasonalBreakForm.contains('title')).toBeTrue();
    });

    it('should load timings, holidays, and seasonal breaks on ngOnInit', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(mockWorkTimingsService.getCentreWorkingDaysByCentreID).toHaveBeenCalledWith(10);
      expect(mockWorkTimingsService.getCentreHolidayList).toHaveBeenCalledWith(10);
      expect(mockWorkTimingsService.getSeasonalHolidays).toHaveBeenCalledWith(10);
    }));
  });

  describe('Working days selection and timings', () => {
    it('should enable and disable input with time in enableInputWithTime', () => {
      const eventChecked = { target: { checked: true } };
      component.enableInputWithTime(eventChecked, 'mon');
      expect(component.isMonday).toBeFalse();

      const eventUnchecked = { target: { checked: false } };
      component.enableInputWithTime(eventUnchecked, 'mon');
      expect(component.isMonday).toBeTrue();
    });

    it('should submit working days form in onSubmit', async () => {
      component.ClientWorkingDaysForm.patchValue({
        workingDaysCount: 1,
        mon: true,
        monStartTime: '08:00',
        monEndTime: '17:00',
      });

      mockWorkTimingsService.saveWorkTimings.and.returnValue(of({
        message: 'ok',
      }));

      await component.onSubmit();

      expect(mockWorkTimingsService.saveWorkTimings).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Working days updated successfully');
    });
  });

  describe('Holidays management', () => {
    it('should submit holiday form successfully in onSubmitHoliday', () => {
      component.holidayForm.patchValue({
        holidayName: 'Labor Day',
        holidayDate: '09-07-2026',
      });
      mockWorkTimingsService.manageDaycareCentreHoliday.and.returnValue(of({
        message: 'Success',
      }));
      spyOn(component, 'getHolidayList');

      component.onSubmitHoliday();

      expect(mockWorkTimingsService.manageDaycareCentreHoliday).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalled();
      expect(component.getHolidayList).toHaveBeenCalled();
    });

    it('should delete holiday on confirmation', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockWorkTimingsService.deleteHoliday.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getHolidayList');

      component.deleteHoliday(1);
      await fixture.whenStable();

      expect(mockWorkTimingsService.deleteHoliday).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalled();
      expect(component.getHolidayList).toHaveBeenCalled();
    });
  });

  describe('Seasonal breaks', () => {
    it('should submit seasonal break form in manageSeasonalBreak', async () => {
      component.seasonalBreakList = [{
        title: 'Spring Break',
        startDate: '03-20-2026',
        endDate: '03-27-2026',
      }];
      mockWorkTimingsService.manageSeasonalBreaks.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getSeasonalHolidays');

      await component.manageSeasonalBreak();

      expect(mockWorkTimingsService.manageSeasonalBreaks).toHaveBeenCalled();
      expect(component.getSeasonalHolidays).toHaveBeenCalled();
    });

    it('should delete seasonal break on confirmation', async () => {
      component.seasonalBreakList = [{ title: 'Break 1' }];
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));

      component.onDeleteSessionalHoliday(0);
      await fixture.whenStable();

      expect(component.seasonalBreakList.length).toBe(0);
    });
  });

  describe('Date Helpers', () => {
    it('should format date with ordinal correctly', () => {
      const result = component.formatDateWithOrdinal('2026-01-01');
      expect(result).toBe('January 1st, 2026');
    });

    it('should check if holiday is expired', () => {
      const pastDate = '2020-01-01';
      expect(component.isExpiredHoliday(pastDate)).toBeTrue();

      const futureDate = '2099-01-01';
      expect(component.isExpiredHoliday(futureDate)).toBeFalse();
    });
  });
});
