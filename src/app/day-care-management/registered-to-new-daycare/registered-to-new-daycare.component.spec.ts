import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisteredToNewDaycareComponent } from './registered-to-new-daycare.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApplicationServiceService } from '../../application-status/application-service.service';
import { DcAppointmentsListService } from '../../bloomvie-management/dc-appointments-list/dc-appointments-list.service';
import { ToastrService } from 'ngx-toastr';
import { DaycareManualAppointmentService } from '../../bloomvie-management/dc-appointments-list/daycare-manual-appointment/daycare-manual-appointment.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../common-component/common.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('RegisteredToNewDaycareComponent', () => {
  let component: RegisteredToNewDaycareComponent;
  let fixture: ComponentFixture<RegisteredToNewDaycareComponent>;
  let mockAppService: jasmine.SpyObj<ApplicationServiceService>;
  let mockDcService: jasmine.SpyObj<DcAppointmentsListService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockManualApptService: jasmine.SpyObj<DaycareManualAppointmentService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    mockAppService = jasmine.createSpyObj('ApplicationServiceService', [
      'getSubscriptionPlansByID',
      'getPlansForDaycare',
      'getPrimaryDayCareList',
      'primaryDaycareCentreRegistration',
      'getPrimaryDayCareID',
      'sendMailPrimaryDaycareCentre',
    ]);
    mockDcService = jasmine.createSpyObj('DcAppointmentsListService', ['CheckInterestedEmailExist']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockManualApptService = jasmine.createSpyObj('DaycareManualAppointmentService', ['getAllCentreTypes']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['formatPhoneNumber', 'formatPostalCode']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'UserId') return '10';
      if (key === 'UserRoleId') return '3';
      if (key === 'CentreID') return '15';
      return '';
    });

    mockManualApptService.getAllCentreTypes.and.returnValue(of({ message: 'OK', result: [{ id: 1, type: 'Type 1' }] }));
    mockAppService.getPlansForDaycare.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, isDefault: false, name: 'Plan A' }],
    }));
    mockAppService.getPrimaryDayCareList.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, centreName: 'Main Daycare' }],
    }));

    await TestBed.configureTestingModule({
      imports: [RegisteredToNewDaycareComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ApplicationServiceService, useValue: mockAppService },
        { provide: DcAppointmentsListService, useValue: mockDcService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: DaycareManualAppointmentService, useValue: mockManualApptService },
        { provide: CookieService, useValue: mockCookie },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CommonService, useValue: mockCommonService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(RegisteredToNewDaycareComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RegisteredToNewDaycareComponent);
    component = fixture.componentInstance;
  });

  it('should create RegisteredToNewDaycareComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization and ngOnInit', () => {
    it('should initialize addAppointmentForm with required fields', () => {
      expect(component.addAppointmentForm.contains('centreEmail')).toBeTrue();
      expect(component.addAppointmentForm.contains('centreName')).toBeTrue();
      expect(component.addAppointmentForm.contains('centreMobile')).toBeTrue();
      expect(component.addAppointmentForm.contains('pinCode')).toBeTrue();
      expect(component.addAppointmentForm.contains('DaycareTypeID')).toBeTrue();
    });

    it('should load initial data in ngOnInit', () => {
      component.ngOnInit();

      expect(component.UserID).toBe(10);
      expect(component.UserRoleID).toBe(3);
      expect(component.daycareID).toBe(15);
      expect(mockManualApptService.getAllCentreTypes).toHaveBeenCalled();
      expect(mockAppService.getPlansForDaycare).toHaveBeenCalledWith(6);
      expect(mockAppService.getPrimaryDayCareList).toHaveBeenCalledWith(15, 'registeredNewDaycare');
    });
  });

  describe('Plans and Subscriptions', () => {
    it('should fetch subscription plan details on getPlanId', () => {
      mockAppService.getSubscriptionPlansByID.and.returnValue(of({
        message: 'Success',
        result: { description: 'Full feature plan' },
      }));

      component.getPlanId({ id: 5 });

      expect(component.PlanID).toBe(5);
      expect(mockAppService.getSubscriptionPlansByID).toHaveBeenCalledWith(5);
      expect(component.planDescriptionDetails).toEqual({ description: 'Full feature plan' });
    });
  });

  describe('Form Submission', () => {
    it('should mark all controls as touched if form is invalid on onSubmit', async () => {
      component.addAppointmentForm.patchValue({ centreEmail: '' });
      await component.onSubmit();

      expect(mockAppService.primaryDaycareCentreRegistration).not.toHaveBeenCalled();
    });

    it('should call primaryDaycareCentreRegistration on valid form', async () => {
      component.daycareID = 15;
      component.PlanID = 5;
      component.addAppointmentForm.patchValue({
        centreEmail: 'centre@test.com',
        enrollmentCapacity: '1-9',
        centreName: 'Happy Kids',
        centreMobile: '123 456 7890',
        name: 'Manager',
        pinCode: 'A1A 1A1',
        DaycareTypeID: 1,
        plan: 5,
      });

      mockAppService.primaryDaycareCentreRegistration.and.returnValue(of({
        message: 'Success',
        result: 99,
      }));
      mockAppService.getPrimaryDayCareID.and.returnValue(of({
        message: 'OK',
        result: { id: 99 },
      }));
      mockAppService.sendMailPrimaryDaycareCentre.and.returnValue(of({ message: 'OK' }));

      await component.onSubmit();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockAppService.primaryDaycareCentreRegistration).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Success');
      expect(mockAppService.getPrimaryDayCareID).toHaveBeenCalledWith('centre@test.com');
    });

    it('should handle error when submission fails', async () => {
      component.daycareID = 15;
      component.addAppointmentForm.patchValue({
        centreEmail: 'centre@test.com',
        enrollmentCapacity: '1-9',
        centreName: 'Happy Kids',
        centreMobile: '123 456 7890',
        name: 'Manager',
        pinCode: 'A1A 1A1',
        DaycareTypeID: 1,
        plan: 5,
      });
      mockAppService.primaryDaycareCentreRegistration.and.returnValue(throwError(() => ({
        error: { message: 'Registration failed' },
      })));

      await component.onSubmit();

      expect(mockToastr.error).toHaveBeenCalledWith('Registration failed');
    });
  });

  describe('Helper methods and Reset', () => {
    it('should reset form in ResetForm()', () => {
      spyOn(component.addAppointmentForm, 'reset');
      spyOn(component.addAppointmentForm, 'markAsUntouched');

      component.ResetForm();

      expect(component.addAppointmentForm.reset).toHaveBeenCalled();
      expect(component.addAppointmentForm.markAsUntouched).toHaveBeenCalled();
    });

    it('should validate mobile length in onEnterMobileNumber', () => {
      component.onEnterMobileNumber({ target: { value: '1234567890123' } });
      expect(component.IncorrectMobileNumberFormat).toBeTrue();

      component.onEnterMobileNumber({ target: { value: '1234567890' } });
      expect(component.IncorrectMobileNumberFormat).toBeFalse();
    });

    it('should format postal code using CommonService', () => {
      mockCommonService.formatPostalCode.and.returnValue('M5V 2T6');
      const event = { target: { value: 'm5v2t6' } };

      component.formatPostalCode(event);

      expect(mockCommonService.formatPostalCode).toHaveBeenCalledWith('m5v2t6');
      expect(component.addAppointmentForm.controls['pinCode'].value).toBe('M5V 2T6');
    });
  });
});
