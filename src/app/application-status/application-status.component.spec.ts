import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ApplicationStatusComponent } from './application-status.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApplicationServiceService } from './application-service.service';
import { DaycareManualAppointmentService } from '../bloomvie-management/dc-appointments-list/daycare-manual-appointment/daycare-manual-appointment.service';
import { ApplicationsSettingsService } from '../settings/application-settings/applications-settings/applications-settings.service';
import { DcAppointmentsListService } from '../bloomvie-management/dc-appointments-list/dc-appointments-list.service';
import { CommonService } from '../common-component/common.service';
import { AddDiscountService } from '../day-care-management/add-discount/add-discount.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('ApplicationStatusComponent', () => {
  let component: ApplicationStatusComponent;
  let fixture: ComponentFixture<ApplicationStatusComponent>;
  let mockAppService: jasmine.SpyObj<ApplicationServiceService>;
  let mockDcManualService: jasmine.SpyObj<DaycareManualAppointmentService>;
  let mockAppSettingsService: jasmine.SpyObj<ApplicationsSettingsService>;
  let mockDcAppointmentsService: jasmine.SpyObj<DcAppointmentsListService>;
  let mockCommonService: any;
  let mockDiscountService: jasmine.SpyObj<AddDiscountService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      prop: jasmine.createSpy('prop'),
      val: jasmine.createSpy('val').and.returnValue('7'),
      modal: jasmine.createSpy('modal'),
    });

    mockAppService = jasmine.createSpyObj('ApplicationServiceService', [
      'getAppointmentList',
      'rescheduleMeeting',
      'activateTrial',
      'getPlansForDaycare',
      'getSubscriptionPlansByID',
    ]);
    mockDcManualService = jasmine.createSpyObj('DaycareManualAppointmentService', ['getAvailableSlots']);
    mockAppSettingsService = jasmine.createSpyObj('ApplicationsSettingsService', ['GetNofications']);
    mockDcAppointmentsService = jasmine.createSpyObj('DcAppointmentsListService', [
      'getZoomMeetingLink',
      'SendEmailAfterMeeting',
      'completeDaycareMeeting',
      'getIntersetedUserByID',
      'getSubscriptionPlanByUserId',
    ]);

    mockCommonService = {
      regionResponseSignal: signal({ offsetString: '+05:30', offsetHours: 5, offsetMinutes: 30 }),
      encrypt: jasmine.createSpy('encrypt').and.returnValue('encrypted-string'),
    };

    mockDiscountService = jasmine.createSpyObj('AddDiscountService', ['geDiscountByPlanID']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['get']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '50';
      if (key === 'UserRoleId') return '1';
      if (key === 'UserInfo') {
        return JSON.stringify({
          result: { firstName: 'Alice', middleName: 'M.', lastName: 'Smith' },
        });
      }
      return '';
    });

    mockAppService.getAppointmentList.and.returnValue(
      of({
        result: [
          { id: 1, counsellorID: 50, name: 'Daycare 1', email: 'dc1@test.com', centreName: 'Center A' },
          { id: 2, counsellorID: 99, name: 'Daycare 2', email: 'dc2@test.com', centreName: 'Center B' },
        ],
      })
    );
    mockAppSettingsService.GetNofications.and.returnValue(of({ message: 'ok', result: [] }));

    await TestBed.configureTestingModule({
      imports: [ApplicationStatusComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ApplicationServiceService, useValue: mockAppService },
        { provide: DaycareManualAppointmentService, useValue: mockDcManualService },
        { provide: ApplicationsSettingsService, useValue: mockAppSettingsService },
        { provide: DcAppointmentsListService, useValue: mockDcAppointmentsService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: AddDiscountService, useValue: mockDiscountService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ApplicationStatusComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ApplicationStatusComponent);
    component = fixture.componentInstance;
  });

  it('should create the ApplicationStatusComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize rescheduleForm and zoomMeetingForm', () => {
      expect(component.rescheduleForm.contains('dayCareId')).toBeTrue();
      expect(component.rescheduleForm.contains('slotId')).toBeTrue();
      expect(component.rescheduleForm.contains('link')).toBeTrue();
      expect(component.zoomMeetingForm.get('topic')?.value).toBe('Daycare plan discussion');
    });
  });

  describe('validateTrailDays', () => {
    it('should clamp values below 1 to 1', () => {
      component.trailDays = 0;
      component.validateTrailDays();
      expect(component.trailDays).toBe(1);
      expect(component.errorMessage).toBe('Value cannot be less than 1.');
    });

    it('should clamp values above 15 to 15', () => {
      component.trailDays = 20;
      component.validateTrailDays();
      expect(component.trailDays).toBe(15);
      expect(component.errorMessage).toBe('Value cannot be more than 15.');
    });

    it('should clear error message when valid', () => {
      component.trailDays = 7;
      component.validateTrailDays();
      expect(component.errorMessage).toBe('');
    });
  });

  describe('ngOnInit & User Setup', () => {
    it('should parse UserID and construct fullName', () => {
      component.ngOnInit();
      expect(component.UserID).toBe(50);
      expect(component.fullName).toBe('Alice M. Smith');
      expect(component.viewAction).toBeTrue();
    });
  });

  describe('getAllDayCareAppointments', () => {
    it('should fetch appointments for Reschedule and filter by counsellorID', () => {
      component.getAllDayCareAppointments('Reschedule');

      expect(component.statusId).toBe(7);
      expect(mockAppService.getAppointmentList).toHaveBeenCalledWith(7, '', 5, 30);
      expect(component.isMeetAttempList.length).toBe(2);
      expect(component.filteredAcceptbyCounsellor.length).toBe(1);
      expect(component.filteredAcceptbyCounsellor[0].id).toBe(1);
    });

    it('should fetch appointments for Completed', () => {
      component.getAllDayCareAppointments('Completed');

      expect(component.statusId).toBe(8);
      expect(mockAppService.getAppointmentList).toHaveBeenCalledWith(8, '', 5, 30);
      expect(component.completeList.length).toBe(2);
    });
  });

  describe('Time Calculation Helpers', () => {
    it('should calculate duration in minutes', () => {
      const minutes = component.calculateDuration('09:00:00', '10:00:00');
      expect(minutes).toBe('60');
    });

    it('should format slot labels', () => {
      expect(component.formatLabel({ slotStartTime: '09:00', slotEndTime: '10:00' })).toBe('09:00 - 10:00');
    });
  });

  describe('Filter methods', () => {
    it('should filter displayedcompleteList by search text', () => {
      component.completeList = [
        { name: 'Apple Daycare', email: 'apple@test.com', centreName: 'Centre 1' },
        { name: 'Banana Center', email: 'banana@test.com', centreName: 'Centre 2' },
      ];
      component.searchText = 'apple';
      component.applyFilter();

      expect(component.displayedcompleteList.length).toBe(1);
      expect(component.displayedcompleteList[0].name).toBe('Apple Daycare');
    });

    it('should filter displayedMeetAttempList by search text', () => {
      component.isMeetAttempList = [
        { name: 'Apple Daycare', email: 'apple@test.com', centreName: 'Centre 1' },
        { name: 'Banana Center', email: 'banana@test.com', centreName: 'Centre 2' },
      ];
      component.searchText = 'banana';
      component.getRescheduleSearchItem();

      expect(component.displayedMeetAttempList.length).toBe(1);
      expect(component.displayedMeetAttempList[0].name).toBe('Banana Center');
    });
  });

  describe('completeMeeting', () => {
    it('should show confirm alert and complete meeting upon confirmation', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockDcAppointmentsService.completeDaycareMeeting.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getAllDayCareAppointments');

      component.completeMeeting(101);

      expect(Swal.fire).toHaveBeenCalled();
    });
  });

  describe('Plans & Discounts', () => {
    it('should separate default and non-default plans in getPlansForDaycare', () => {
      mockAppService.getPlansForDaycare.and.returnValue(
        of({
          message: 'OK',
          result: [
            { id: 1, isDefault: true, name: 'Default Plan' },
            { id: 2, isDefault: false, name: 'Custom Plan' },
          ],
        })
      );

      component.getPlansForDaycare({ id: 99 });

      expect(component.defaultPlanList.length).toBe(1);
      expect(component.getPlansForDayCareList.length).toBe(1);
      expect(component.DayCareUserID).toBe(99);
    });

    it('should compute discount and final amount in getDiscountAmount', () => {
      component.planDescriptionDetails = { price: 200 };
      component.discountPercantage = '10 %';

      component.getDiscountAmount();

      expect(component.calculatedDisCountValue.discountAmount).toBe('20.00');
      expect(component.calculatedDisCountValue.finalAmount).toBe('180.00');
      expect(component.viewDiscountSheet).toBeTrue();
    });

    it('should reset data properly', () => {
      component.planInformation = {};
      component.resetData();
      expect(component.planInformation).toBeNull();
      expect(component.calculatedDisCountValue.planAmount).toBe('');
    });
  });

  describe('SendEmailAfterMeeting', () => {
    it('should send email and handle success', () => {
      component.DayCareUserID = 12;
      component.PlanID = 3;
      mockDcAppointmentsService.SendEmailAfterMeeting.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getAllDayCareAppointments');

      component.SendEmailAfterMeeting();

      expect(mockDcAppointmentsService.SendEmailAfterMeeting).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Email Sent Successfully');
    });
  });
});
