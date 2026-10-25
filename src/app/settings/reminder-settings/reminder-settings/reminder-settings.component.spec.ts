import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReminderSettingsComponent } from './reminder-settings.component';
import { RemidnerSettingsService } from './remidner-settings.service';
import { UserRoleService } from '../../Permission/user-role/user-role.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('ReminderSettingsComponent', () => {
  let component: ReminderSettingsComponent;
  let fixture: ComponentFixture<ReminderSettingsComponent>;
  let mockReminderService: jasmine.SpyObj<RemidnerSettingsService>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockReminderService = jasmine.createSpyObj('RemidnerSettingsService', [
      'addReminderSettings',
      'getAllReminderByCenterID',
      'getReminderType',
    ]);
    mockUserRoleService = jasmine.createSpyObj('UserRoleService', ['getAllUserRoles']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'UserRoleId') return '3';
      if (key === 'UserId') return '10';
      if (key === 'CentreID') return '5';
      return '';
    });

    mockReminderService.getReminderType.and.returnValue(
      of({
        message: 'Success',
        result: [{ id: 1, reminderType: 'Fee Payment' }],
      })
    );

    mockUserRoleService.getAllUserRoles.and.returnValue(
      of({
        message: 'OK',
        result: [
          { id: 1, userRole: 'Admin', isActive: true },
          { id: 2, userRole: 'Superadmin', isActive: true },
          { id: 3, userRole: 'Center Admin', isActive: true },
          { id: 4, userRole: 'Teacher', isActive: true },
          { id: 5, userRole: 'Inactive', isActive: false },
        ],
      })
    );

    mockReminderService.getAllReminderByCenterID.and.returnValue(
      of({
        message: 'Success',
        result: [
          {
            id: 100,
            toUserTypeID: 3,
            ccUserTypeID: 4,
            reminderTypeID: 1,
            reminderSubject1: 'Sub 1',
            reminderBody1: 'Body 1',
            reminder1DaysBefore: 3,
            reminderSubject2: 'Sub 2',
            reminderBody2: 'Body 2',
            reminder2DaysBefore: 2,
            reminderSubject3: 'Sub 3',
            reminderBody3: 'Body 3',
            reminder3DaysBefore: 1,
            isMonthly_Yearly: 'Monthly',
          },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [ReminderSettingsComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: RemidnerSettingsService, useValue: mockReminderService },
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: CookieService, useValue: mockCookie },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ReminderSettingsComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReminderSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize form defaults', () => {
    expect(component).toBeTruthy();
    expect(component.reminderForm).toBeDefined();
    expect(component.reminderForm.get('id')?.value).toBe(0);
    expect(component.reminderForm.get('isMonthly_Yearly')?.value).toBe('Monthly');
  });

  describe('ngOnInit', () => {
    it('should read cookies, load reminder types, user roles, and reminders list', async () => {
      await component.ngOnInit();

      expect(component.UserroleID).toBe('3');
      expect(component.UserID).toBe('10');
      expect(component.centreID).toBe('5');
      expect(mockReminderService.getReminderType).toHaveBeenCalledWith('3' as any);
      expect(component.ReminderTypeList.length).toBe(1);
      expect(mockUserRoleService.getAllUserRoles).toHaveBeenCalled();
      expect(component.UserRoleList.length).toBe(4); // active roles
      expect(component.ToUserRoleList.length).toBe(2); // active excluding 1 and 2
      expect(component.reminderList.length).toBe(1);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('getPatchedValue', () => {
    it('should patch reminder object values into reminderForm', () => {
      const mockReminder = {
        id: 77,
        toUserTypeID: 3,
        ccUserTypeID: 4,
        reminderTypeID: 2,
        reminder1DaysBefore: 5,
        reminderSubject1: 'Subject 1',
        reminderBody1: 'Body 1',
        reminder2DaysBefore: 3,
        reminderSubject2: 'Subject 2',
        reminderBody2: 'Body 2',
        reminder3DaysBefore: 1,
        reminderSubject3: 'Subject 3',
        reminderBody3: 'Body 3',
        isMonthly_Yearly: 'Yearly',
      };

      component.getPatchedValue(mockReminder);

      expect(component.reminderForm.value.id).toBe(77);
      expect(component.reminderForm.value.reminderSubject1).toBe('Subject 1');
      expect(component.reminderForm.value.isMonthly_Yearly).toBe('Yearly');
    });
  });

  describe('addreminderValues', () => {
    it('should mark form as touched if form is invalid', () => {
      spyOn(component.reminderForm, 'markAsTouched');
      component.reminderForm.patchValue({ toUserTypeID: null });

      component.addreminderValues();

      expect(component.reminderForm.markAsTouched).toHaveBeenCalled();
    });

    it('should add new reminder setting when id is 0', fakeAsync(() => {
      component.reminderForm.patchValue({
        id: 0,
        toUserTypeID: 3,
        ccUserTypeID: 4,
        reminderTypeID: 1,
        isMonthly_Yearly: 'Monthly',
      });
      component.selectedReminderID = 1;
      component.selectedToId = 3;
      component.selectedToCC = 4;
      component.UserID = 10;
      component.centreID = 5;

      mockReminderService.addReminderSettings.and.returnValue(of({ message: 'OK' }));

      component.addreminderValues();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockReminderService.addReminderSettings).toHaveBeenCalled();

      tick(150);

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Reminder Settings Added Succeessfully');
    }));

    it('should update existing reminder setting when id > 0', fakeAsync(() => {
      component.reminderForm.patchValue({
        id: 50,
        toUserTypeID: 3,
        ccUserTypeID: 4,
        reminderTypeID: 1,
        isMonthly_Yearly: 'Monthly',
      });
      component.UserID = 10;
      component.centreID = 5;

      mockReminderService.addReminderSettings.and.returnValue(of({ message: 'OK' }));

      component.addreminderValues();

      expect(mockReminderService.addReminderSettings).toHaveBeenCalled();

      tick(150);

      expect(mockToastr.success).toHaveBeenCalledWith('Reminder Settings updated Succeessfully');
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));
  });

  describe('getOtherReminderList', () => {
    it('should parse reminder2 and reminder3 into reminderSubList', () => {
      const reminder = {
        id: 200,
        toUserTypeID: 3,
        ccUserTypeID: 4,
        reminderTypeID: 1,
        reminderType: 'Fee',
        ccUserType: 'Teacher',
        toUserType: 'Admin',
        reminderSubject2: 'Sub 2',
        reminderBody2: 'Body 2',
        reminder2DaysBefore: 2,
        reminderSubject3: 'Sub 3',
        reminderBody3: 'Body 3',
        reminder3DaysBefore: 1,
      };

      component.getOtherReminderList(reminder);

      expect(component.reminderSubList.length).toBe(2);
      expect(component.reminderSubList[0].type).toBe('reminder2');
      expect(component.reminderSubList[1].type).toBe('reminder3');
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('selection helper methods', () => {
    it('selectedToUser should update selectedToId', () => {
      component.selectedToUser(55);
      expect(component.selectedToId).toBe(55);
    });

    it('selectedCC should update selectedToCC', () => {
      component.selectedCC(66);
      expect(component.selectedToCC).toBe(66);
    });

    it('selectedReminder should update selectedReminderID', () => {
      component.selectedReminder(77);
      expect(component.selectedReminderID).toBe(77);
    });
  });
});
