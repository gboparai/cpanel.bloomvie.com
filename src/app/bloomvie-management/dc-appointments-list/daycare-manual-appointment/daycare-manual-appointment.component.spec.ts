import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { DaycareManualAppointmentComponent } from './daycare-manual-appointment.component';
import { CommonService } from '../../../common-component/common.service';
import { DcAppointmentsListService } from '../dc-appointments-list.service';
import { ToastrService } from 'ngx-toastr';
import { DaycareManualAppointmentService } from './daycare-manual-appointment.service';
import { CookieService } from 'ngx-cookie-service';
import { AssignUserPermissionService } from '../../../settings/Permission/assign-user-permission/assign-user-permission.service';
import { NgxSpinnerService } from 'ngx-spinner';

describe('DaycareManualAppointmentComponent', () => {
  let component: DaycareManualAppointmentComponent;
  let fixture: ComponentFixture<DaycareManualAppointmentComponent>;

  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let dcServiceSpy: jasmine.SpyObj<DcAppointmentsListService>;
  let daycareManualAppointmentServiceSpy: jasmine.SpyObj<DaycareManualAppointmentService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let assignUserPermissionServiceSpy: jasmine.SpyObj<AssignUserPermissionService>;
  let spinnerSpy: jasmine.SpyObj<NgxSpinnerService>;

  beforeEach(async () => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'getCountriesFlag',
      'getDefaultCountryFlag',
      'formatPhoneNumber',
      'formatPostalCode',
    ]);
    dcServiceSpy = jasmine.createSpyObj('DcAppointmentsListService', [
      'CheckInterestedEmailExist',
      'dayCareAssignmentToCounsellor',
    ]);
    daycareManualAppointmentServiceSpy = jasmine.createSpyObj('DaycareManualAppointmentService', [
      'getAllCentreTypes',
      'manageForDayCareInterestedUsers',
      'getAvailableSlots',
    ]);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);
    assignUserPermissionServiceSpy = jasmine.createSpyObj('AssignUserPermissionService', [
      'getEmployeeRole',
    ]);
    spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    (commonServiceSpy as any).regionResponseSignal = signal({
      offsetHours: 0,
      offsetMinutes: 0,
      offsetString: '+00:00',
    });

    commonServiceSpy.getCountriesFlag.and.returnValue([
      { id: 1, name: 'Canada', code: '+1', flag: 'https://flagcdn.com/ca.svg' },
    ]);
    commonServiceSpy.getDefaultCountryFlag.and.returnValue({
      id: 1,
      name: 'Canada',
      code: '+1',
      flag: 'https://flagcdn.com/ca.svg',
    });
    commonServiceSpy.formatPhoneNumber.and.callFake((val: string) => `123 456 7890`);
    commonServiceSpy.formatPostalCode.and.callFake((val: string) => `K1A 0B1`);

    cookieServiceSpy.get.and.callFake((key: string) => {
      if (key === 'UserId') return '50';
      if (key === 'UserRoleId') return '1';
      return '';
    });

    daycareManualAppointmentServiceSpy.getAllCentreTypes.and.returnValue(
      of({ message: 'OK', result: [{ id: 1, type: 'Montessori' }] })
    );
    assignUserPermissionServiceSpy.getEmployeeRole.and.returnValue(
      of({ message: 'OK', result: [{ id: 10, name: 'Counsellor 1' }] })
    );
    daycareManualAppointmentServiceSpy.getAvailableSlots.and.returnValue(
      of({ message: 'OK', result: [{ id: 100, startTime: '09:00', endTime: '10:00' }] })
    );
    dcServiceSpy.dayCareAssignmentToCounsellor.and.returnValue(of({ message: 'Success' }));

    // Mock window.$
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide'),
    });

    await TestBed.configureTestingModule({
      imports: [DaycareManualAppointmentComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        ChangeDetectorRef,
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: DcAppointmentsListService, useValue: dcServiceSpy },
        { provide: DaycareManualAppointmentService, useValue: daycareManualAppointmentServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: AssignUserPermissionService, useValue: assignUserPermissionServiceSpy },
        { provide: NgxSpinnerService, useValue: spinnerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DaycareManualAppointmentComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and initialize addAppointmentForm', () => {
    expect(component).toBeTruthy();
    expect(component.addAppointmentForm).toBeDefined();
    expect(component.addAppointmentForm.controls['name']).toBeDefined();
    expect(component.addAppointmentForm.controls['email']).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should set countries, cookies, and call initial fetch methods', () => {
      component.ngOnInit();

      expect(commonServiceSpy.getCountriesFlag).toHaveBeenCalled();
      expect(commonServiceSpy.getDefaultCountryFlag).toHaveBeenCalledWith(1);
      expect(component.UserID).toBe(50);
      expect(component.UserRoleID).toBe(1);
      expect(daycareManualAppointmentServiceSpy.getAllCentreTypes).toHaveBeenCalled();
      expect(assignUserPermissionServiceSpy.getEmployeeRole).toHaveBeenCalledWith(6, 'True');
      expect(component.AllCenterTypes).toEqual([{ id: 1, type: 'Montessori' }]);
      expect(component.ActiveCounsellorsList).toEqual([{ id: 10, name: 'Counsellor 1' }]);
    });
  });

  describe('Slot and Date selections', () => {
    it('should toggle slot date and slot dropdown on checkbox change (checked)', () => {
      component.addAppointmentForm.patchValue({ date: '10-25-2026', slotID: 1 });
      const event = { target: { checked: true } };

      component.onCheckOrUncheckToHideSlotDateAndSlotsDropdown(event);

      expect(component.addAppointmentForm.value.date).toBe('');
      expect(component.addAppointmentForm.get('date')?.validator).toBeNull();
      expect(component.addAppointmentForm.get('slotID')?.validator).toBeNull();
    });

    it('should restore validators on checkbox change (unchecked)', () => {
      const event = { target: { checked: false } };

      component.onCheckOrUncheckToHideSlotDateAndSlotsDropdown(event);

      expect(component.addAppointmentForm.get('date')?.validator).not.toBeNull();
      expect(component.addAppointmentForm.get('slotID')?.validator).not.toBeNull();
    });

    it('should select slot and update form in onSlotSelect', async () => {
      await component.onSlotSelect(105);

      expect(component.slotID).toBe(105);
      expect(component.addAppointmentForm.value.slotID).toBe(105);
    });

    it('should handle date selection and fetch slots if role is 1 or 6', async () => {
      component.UserRoleID = 1;
      component.UserID = 50;
      component.regionResponse = { offsetHours: 0, offsetMinutes: 0 };
      spyOn(component, 'getAvailableSlots').and.callThrough();

      const event = { target: { value: '10-25-2026' } };
      await component.date(event);

      expect(component.selectedDate).toBe('10-25-2026');
      expect(component.getAvailableSlots).toHaveBeenCalled();
      expect(daycareManualAppointmentServiceSpy.getAvailableSlots).toHaveBeenCalledWith(
        50,
        '10-25-2026',
        0,
        0
      );
      expect(component.availableSlots.length).toBe(1);
    });

    it('should update counsellor ID and fetch available slots if date selected', async () => {
      component.selectedDate = '10-25-2026';
      spyOn(component, 'getAvailableSlots');

      await component.getCounsellorId(77);

      expect(component.UserID).toBe(77);
      expect(component.getAvailableSlots).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    it('should mark all controls as touched if form is invalid', async () => {
      component.addAppointmentForm.patchValue({ name: '' });

      await component.onSubmit();

      expect(component.addAppointmentForm.invalid).toBe(true);
      expect(daycareManualAppointmentServiceSpy.manageForDayCareInterestedUsers).not.toHaveBeenCalled();
    });

    it('should submit successfully when form is valid', async () => {
      component.regionResponse = { offsetHours: 0, offsetMinutes: 0 };
      component.UserID = 50;
      component.slotID = 100;

      component.addAppointmentForm.patchValue({
        id: 0,
        name: 'John Doe',
        email: 'john@example.com',
        enrollmentCapacity: '1-9',
        centreName: 'Kids Corner',
        mobile: '123 456 7890',
        pinCode: 'K1A 0B1',
        date: '10-25-2026',
        slotID: 100,
        DaycareTypeID: 1,
      });

      daycareManualAppointmentServiceSpy.manageForDayCareInterestedUsers.and.returnValue(
        of({ message: 'Success', result: {} })
      );
      spyOn(component.Update, 'emit');

      await component.onSubmit();

      expect(spinnerSpy.show).toHaveBeenCalled();
      expect(daycareManualAppointmentServiceSpy.manageForDayCareInterestedUsers).toHaveBeenCalled();
      expect(toastrSpy.success).toHaveBeenCalledWith('Form submitted successfully!');
      expect(dcServiceSpy.dayCareAssignmentToCounsellor).toHaveBeenCalledWith(50, 0);
      expect(component.Update.emit).toHaveBeenCalled();
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });

    it('should show toastr error on unsuccessful submission response', async () => {
      component.regionResponse = { offsetHours: 0, offsetMinutes: 0 };
      component.slotID = 100;
      component.addAppointmentForm.patchValue({
        id: 0,
        name: 'Jane Doe',
        email: 'jane@example.com',
        enrollmentCapacity: '1-9',
        centreName: 'Kids Corner',
        mobile: '123 456 7890',
        pinCode: 'K1A 0B1',
        date: '10-25-2026',
        slotID: 100,
        DaycareTypeID: 1,
      });

      daycareManualAppointmentServiceSpy.manageForDayCareInterestedUsers.and.returnValue(
        of({ message: 'Failed to create appointment', result: null })
      );

      await component.onSubmit();

      expect(toastrSpy.error).toHaveBeenCalledWith('Failed to create appointment');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });

    it('should show toastr error on submission failure', async () => {
      component.regionResponse = { offsetHours: 0, offsetMinutes: 0 };
      component.slotID = 100;
      component.addAppointmentForm.patchValue({
        id: 0,
        name: 'Jane Doe',
        email: 'jane@example.com',
        enrollmentCapacity: '1-9',
        centreName: 'Kids Corner',
        mobile: '123 456 7890',
        pinCode: 'K1A 0B1',
        date: '10-25-2026',
        slotID: 100,
        DaycareTypeID: 1,
      });

      daycareManualAppointmentServiceSpy.manageForDayCareInterestedUsers.and.returnValue(
        throwError(() => new Error('Network error'))
      );
      spyOn(console, 'error');

      await component.onSubmit();

      expect(toastrSpy.error).toHaveBeenCalledWith('An error occurred while submitting the form.');
      expect(spinnerSpy.hide).toHaveBeenCalled();
    });
  });

  describe('Form resets and validation helpers', () => {
    it('should reset form on ResetForm()', () => {
      component.selectDateFlatPicker = { clear: jasmine.createSpy('clear') };
      component.ResetForm();

      expect(component.selectDateFlatPicker.clear).toHaveBeenCalled();
    });

    it('should emit Update and clear picker on closeModal()', () => {
      spyOn(component.Update, 'emit');
      component.selectDateFlatPicker = { clear: jasmine.createSpy('clear') };

      component.closeModal();

      expect(component.selectDateFlatPicker.clear).toHaveBeenCalled();
      expect(component.Update.emit).toHaveBeenCalled();
    });

    it('should validate email uniqueness in CheckInterestedEmailExist()', () => {
      component.addAppointmentForm.patchValue({ email: 'existing@email.com' });
      dcServiceSpy.CheckInterestedEmailExist.and.returnValue(
        of({ message: 'Email already exists' })
      );

      component.CheckInterestedEmailExist();

      expect(toastrSpy.warning).toHaveBeenCalledWith('Email already exists');
      expect(component.addAppointmentForm.get('email').value).toBeNull();
    });

    it('should check mobile length in onEnterMobileNumber', () => {
      component.onEnterMobileNumber({ target: { value: '1234567890123' } });
      expect(component.IncorrectMobileNumberFormat).toBe(true);

      component.onEnterMobileNumber({ target: { value: '1234567890' } });
      expect(component.IncorrectMobileNumberFormat).toBe(false);
    });

    it('should format phone number and postal code', () => {
      const phoneEvent = { target: { value: '1234567890' } };
      component.formatPhoneNumber(phoneEvent);
      expect(commonServiceSpy.formatPhoneNumber).toHaveBeenCalledWith('1234567890');
      expect(component.addAppointmentForm.controls['mobile'].value).toBe('123 456 7890');

      const postalEvent = { target: { value: 'k1a0b1' } };
      component.formatPostalCode(postalEvent);
      expect(commonServiceSpy.formatPostalCode).toHaveBeenCalledWith('k1a0b1');
      expect(component.addAppointmentForm.controls['pinCode'].value).toBe('K1A 0B1');
    });

    it('should toggle and select country dropdown', () => {
      expect(component.dropdownOpen).toBe(false);
      component.toggleDropdown();
      expect(component.dropdownOpen).toBe(true);

      const country = { id: 2, name: 'USA' };
      component.selectCountry(country);
      expect(component.selectedCountry).toEqual(country);
      expect(component.dropdownOpen).toBe(true);
    });

    it('should initialize flatpickr in ngAfterViewInit', () => {
      component.ngAfterViewInit();
      expect(component.selectDateFlatPicker).toBeDefined();
    });
  });
});
