import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManageEventComponent } from './manage-event.component';
import { ManageEventService } from './manage-event.service';
import { UserRoleService } from '../Permission/user-role/user-role.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ManageEventComponent', () => {
  let component: ManageEventComponent;
  let fixture: ComponentFixture<ManageEventComponent>;
  let mockManageEventService: jasmine.SpyObj<ManageEventService>;
  let mockUserRoleService: jasmine.SpyObj<UserRoleService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockManageEventService = jasmine.createSpyObj('ManageEventService', [
      'manageMasterEvent',
      'getMasterEvent',
      'activeInActiveEventID',
    ]);
    mockUserRoleService = jasmine.createSpyObj('UserRoleService', ['getAllUserRoles']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set', 'check']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'CentreID') return '10';
      if (key === 'UserId') return '5';
      if (key === 'UserRoleId') return '3';
      return '';
    });

    mockManageEventService.getMasterEvent.and.returnValue(
      of({
        message: 'OK',
        result: [
          { id: 1, name: 'Sports Day', isActive: true, centreID: 10, userRoleID: 3 },
          { id: 2, name: 'Music Festival', isActive: false, centreID: 10, userRoleID: 3 },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [ManageEventComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ManageEventService, useValue: mockManageEventService },
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageEventComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageEventComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize default form values', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.get('id')?.value).toBe(0);
    expect(component.isEditMode).toBeFalse();
    expect(component.ContentP).toBe(1);
    expect(component.Contentsize).toBe(5);
    expect(component.input).toBe(component.form.controls);
  });

  describe('ngOnInit & getMasterEvent', () => {
    it('should set cookies and call getMasterEvent with Day Care Admin when userRoleID is 3', () => {
      component.ngOnInit();

      expect(component.centreID).toBe('10');
      expect(component.userID).toBe(5);
      expect(component.userRoleID).toBe(3);
      expect(mockManageEventService.getMasterEvent).toHaveBeenCalledWith(5, 3, 'Day Care Admin');
      expect(component.MasterAllEvents.length).toBe(2);
    });

    it('should pass Bloomvie Owner when userRoleID is not 3', () => {
      component.userRoleID = 1;
      component.userID = 5;

      component.getMasterEvent();

      expect(mockManageEventService.getMasterEvent).toHaveBeenCalledWith(5, 1, 'Bloomvie Owner');
    });

    it('should log error when getMasterEvent returns non-OK or throws error', () => {
      spyOn(console, 'error');
      mockManageEventService.getMasterEvent.and.returnValue(
        of({ message: 'Error', result: [] })
      );

      component.getMasterEvent();
      expect(console.error).toHaveBeenCalledWith('Error:', 'Error');

      mockManageEventService.getMasterEvent.and.returnValue(
        throwError(() => new Error('API failure'))
      );
      component.getMasterEvent();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('manageMasterEvent', () => {
    it('should mark all fields as touched if form is invalid', () => {
      spyOn(component.form, 'markAllAsTouched');
      component.form.patchValue({ name: '' });

      component.manageMasterEvent();

      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('should show success when event is added (message: OK)', () => {
      component.form.patchValue({ name: 'Annual Day', userRoleID: 3 });
      mockManageEventService.manageMasterEvent.and.returnValue(
        of({ message: 'OK' })
      );

      component.manageMasterEvent();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockManageEventService.manageMasterEvent).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Events has been added successfully');
      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(component.isEditMode).toBeFalse();
    });

    it('should show success when event is updated (message: Updated successfully)', () => {
      component.form.patchValue({ id: 1, name: 'Sports Day 2026', userRoleID: 3 });
      mockManageEventService.manageMasterEvent.and.returnValue(
        of({ message: 'Updated successfully' })
      );

      component.manageMasterEvent();

      expect(mockToastr.success).toHaveBeenCalledWith('Events has been  updated successfully');
      expect(component.isEditMode).toBeFalse();
    });

    it('should show error when manageMasterEvent returns unexpected message', () => {
      component.form.patchValue({ name: 'Sports Day', userRoleID: 3 });
      mockManageEventService.manageMasterEvent.and.returnValue(
        of({ message: 'Failure', Message: 'Duplicate record' })
      );

      component.manageMasterEvent();

      expect(mockToastr.error).toHaveBeenCalledWith('', 'Duplicate record');
    });
  });

  describe('applyFilter & displayedEvent', () => {
    it('should filter events by searchText and reset ContentP to 1', () => {
      component.MasterAllEvents = [
        { id: 1, name: 'Sports Day' },
        { id: 2, name: 'Art Day' },
      ];

      component.searchText = 'art';
      component.applyFilter();

      expect(component.filteredEvent.length).toBe(1);
      expect(component.filteredEvent[0].name).toBe('Art Day');
      expect(component.displayedEvent.length).toBe(1);
      expect(component.ContentP).toBe(1);
    });

    it('displayedEvent should return MasterAllEvents when searchText is empty', () => {
      component.MasterAllEvents = [{ id: 1, name: 'Sports Day' }];
      component.searchText = '';

      expect(component.displayedEvent).toEqual(component.MasterAllEvents);
    });
  });

  describe('onEdit, Reset, cancel', () => {
    it('onEdit should populate form and set isEditMode true', () => {
      const item = { id: 7, centreID: 10, userRoleID: 3, name: 'Science Fair', isActive: true };

      component.onEdit(item);

      expect(component.isEditMode).toBeTrue();
      expect(component.form.value.name).toBe('Science Fair');
      expect(component.form.value.id).toBe(7);
    });

    it('Reset should reset form id and name', () => {
      component.form.patchValue({ id: 5, name: 'Carnival' });
      component.Reset();

      expect(component.form.value.id).toBe(0);
      expect(component.form.value.name).toBe('');
    });

    it('cancel should set isEditMode to false and call Reset', () => {
      spyOn(component, 'Reset');
      component.isEditMode = true;

      component.cancel();

      expect(component.isEditMode).toBeFalse();
      expect(component.Reset).toHaveBeenCalled();
    });
  });

  describe('ActiveInactiveEvent', () => {
    it('should deactivate event when isActive is true and user confirms', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockManageEventService.activeInActiveEventID.and.returnValue(of({ message: 'Success' }));

      component.ActiveInactiveEvent(1, true);
      tick();

      expect(mockManageEventService.activeInActiveEventID).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith('Event has been deactivated successfully.');
    }));

    it('should activate event when isActive is false and user confirms', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockManageEventService.activeInActiveEventID.and.returnValue(of({ message: 'Success' }));

      component.ActiveInactiveEvent(2, false);
      tick();

      expect(mockManageEventService.activeInActiveEventID).toHaveBeenCalledWith(2);
      expect(mockToastr.success).toHaveBeenCalledWith('Event has been activated successfully.');
    }));

    it('should do nothing when user cancels Swal confirmation', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.ActiveInactiveEvent(1, true);
      tick();

      expect(mockManageEventService.activeInActiveEventID).not.toHaveBeenCalled();
    }));
  });
});
