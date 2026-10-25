import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchedulerComponent } from './scheduler.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SchedulerService } from './scheduler.service';
import { CommonService } from '../common.service';
import { ManageSchedulerService } from '../../day-care-management/manage-scheduler/manage-scheduler.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { of } from 'rxjs';

describe('SchedulerComponent', () => {
  let component: SchedulerComponent;
  let fixture: ComponentFixture<SchedulerComponent>;

  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockRouter: any;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSchedulerService: jasmine.SpyObj<SchedulerService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockManageScheduler: jasmine.SpyObj<ManageSchedulerService>;
  let mockOnboardingService: any;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      val: jasmine.createSpy('val')
    });

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      return '';
    });

    mockRouter = {
      url: '/daycare/scheduler',
      navigate: jasmine.createSpy('navigate'),
      events: of()
    };

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);

    mockSchedulerService = jasmine.createSpyObj('SchedulerService', [
      'getCentreStaffList',
      'getStudentList',
      'deleteClassAssignment',
      'editAssignment'
    ]);
    mockSchedulerService.getCentreStaffList.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, name: 'Alice Teacher', s3ImageUrl: null }]
    }));
    mockSchedulerService.getStudentList.and.returnValue(of({
      message: 'Success',
      result: [{ studentID: 1, studentName: 'Bobby' }]
    }));

    mockCommonService = jasmine.createSpyObj('CommonService', ['transform', 'encrypt']);
    mockCommonService.transform.and.callFake((time: string) => time);
    mockCommonService.encrypt.and.callFake((val: string) => `enc_${val}`);

    mockManageScheduler = jasmine.createSpyObj('ManageSchedulerService', [
      'getDaycareClasses',
      'GetAllDays',
      'getCentreWorkingDaysByCentreID',
      'getAllAvailableTeachersByCentreID',
      'BulkClassAssignment'
    ]);
    mockManageScheduler.getDaycareClasses.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, name: 'Infants' }]
    }));
    mockManageScheduler.GetAllDays.and.returnValue(of({
      message: 'Success',
      result: [
        { id: 1, day: 'Monday' },
        { id: 2, day: 'Tuesday' },
        { id: 3, day: 'Wednesday' },
        { id: 4, day: 'Thursday' },
        { id: 5, day: 'Friday' }
      ]
    }));
    mockManageScheduler.getCentreWorkingDaysByCentreID.and.returnValue(of({
      message: 'Success',
      result: {
        mon: true,
        tues: true,
        wed: true,
        thu: true,
        fri: true,
        sat: false,
        sun: false
      }
    }));

    mockOnboardingService = {
      onBoardingData: { isCompleteStep6: false },
      handleNext: jasmine.createSpy('handleNext'),
      getCurrentTab: jasmine.createSpy('getCurrentTab')
    };

    await TestBed.configureTestingModule({
      imports: [SchedulerComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        ChangeDetectorRef,
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookieService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastrService, useValue: mockToastr },
        { provide: SchedulerService, useValue: mockSchedulerService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: ManageSchedulerService, useValue: mockManageScheduler },
        { provide: OnboardingService, useValue: mockOnboardingService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(SchedulerComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulerComponent);
    component = fixture.componentInstance;
  });

  it('should create the SchedulerComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize assignmentForm controls with validators', () => {
      expect(component.assignmentForm).toBeDefined();
      expect(component.assignmentForm.get('startDate')).toBeDefined();
      expect(component.assignmentForm.get('startTime')).toBeDefined();
      expect(component.assignmentForm.get('endTime')).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should initialize centreID and trigger initial fetches', () => {
      component.ngOnInit();

      expect(component.centreID).toBe(10);
      expect(mockManageScheduler.getDaycareClasses).toHaveBeenCalledWith(10);
      expect(mockManageScheduler.GetAllDays).toHaveBeenCalled();
      expect(mockSchedulerService.getCentreStaffList).toHaveBeenCalled();
      expect(mockSchedulerService.getStudentList).toHaveBeenCalledWith(10);
    });

    it('should detect onboarding route', () => {
      mockRouter.url = '/onboarding/scheduler';
      component.ngOnInit();
      expect(component.isOnboarding).toBeTrue();
    });
  });

  describe('Week and Day Navigation', () => {
    it('should generate week days on setCurrentWeek', () => {
      component.setCurrentWeek();
      expect(component.weekDays.length).toBe(7);
      expect(component.weekRangeDisplay).toContain('-');
    });

    it('should toggle view between week and day', () => {
      component.onToggleView('day');
      expect(component.viewMode).toBe('day');

      component.onToggleView('week');
      expect(component.viewMode).toBe('week');
    });

    it('should advance and regress weeks with goToNextWeek and goToPreviousWeek', () => {
      const initial = new Date(component.currentStartOfWeek);

      component.goToNextWeek();
      expect(component.currentStartOfWeek.getTime()).toBeGreaterThan(initial.getTime());

      component.goToPreviousWeek();
      expect(component.currentStartOfWeek.getTime()).toBe(initial.getTime());
    });
  });

  describe('Time conversion utilities', () => {
    it('should convert time string to total minutes', () => {
      expect(component.convertToMinutes('08:30')).toBe(510);
      expect(component.convertToMinutes('14:15')).toBe(855);
      expect(component.convertToMinutes('')).toBe(0);
    });

    it('should calculate class span correctly', () => {
      component.currentDayHours = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];
      component.calculateClassSpan('09:00', '11:00');
      expect(component.totalSpan).toBeGreaterThan(0);
    });
  });

  describe('resetForm', () => {
    it('should reset assignment form controls', () => {
      component.assignmentForm.patchValue({
        selectedScheduleType: 'Weekly',
        startTime: '08:00'
      });
      component.resetForm();

      expect(component.assignmentForm.value.selectedScheduleType).toBe('');
      expect(component.assignmentForm.value.startTime).toBeNull();
      expect(component.submitted).toBeFalse();
    });
  });

  describe('proceededOnBoarding', () => {
    it('should complete step 6 and call handleNext', () => {
      component.proceededOnBoarding();

      expect(mockOnboardingService.onBoardingData.isCompleteStep6).toBeTrue();
      expect(mockOnboardingService.handleNext).toHaveBeenCalledWith('Tab-6');
      expect(mockOnboardingService.getCurrentTab).toHaveBeenCalled();
    });
  });
});
