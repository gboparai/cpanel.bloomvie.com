import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CreateReminderTypeComponent } from './create-reminder-type.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ReminderTypeServiceService } from './reminder-type-service.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('CreateReminderTypeComponent', () => {
  let component: CreateReminderTypeComponent;
  let fixture: ComponentFixture<CreateReminderTypeComponent>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockReminderTypeService: jasmine.SpyObj<ReminderTypeServiceService>;

  beforeEach(async () => {
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['warning', 'success', 'error']);
    mockReminderTypeService = jasmine.createSpyObj('ReminderTypeServiceService', [
      'getAllReminderType',
      'manageReminderTypes',
      'activeInActiveReminderType',
    ]);

    mockReminderTypeService.getAllReminderType.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, reminderType: 'Payment', isBloomvie: true, isDaycare: false, isActive: true },
          { id: 2, reminderType: 'Event', isBloomvie: false, isDaycare: true, isActive: false },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [CreateReminderTypeComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: ReminderTypeServiceService, useValue: mockReminderTypeService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CreateReminderTypeComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CreateReminderTypeComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize form defaults', () => {
    expect(component).toBeTruthy();
    expect(component.createReminderForm.value).toEqual({
      id: 0,
      reminderType: '',
      isBloomvie: false,
      isDaycare: false,
      isActive: true,
    });
    expect(component.overallCount).toBe(5);
    expect(component.currentPage).toBe(1);
  });

  describe('ngOnInit and getAllReminderTypeList', () => {
    it('should fetch all reminder types and populate list on Success', () => {
      component.ngOnInit();

      expect(mockReminderTypeService.getAllReminderType).toHaveBeenCalled();
      expect(component.reminderTypeList.length).toBe(2);
      expect(component.skeletonShow).toBe('');
    });

    it('should clear skeletonShow even when response message is not Success', () => {
      mockReminderTypeService.getAllReminderType.and.returnValue(
        of({ message: 'Error', result: [] })
      );

      component.getAllReminderTypeList();

      expect(component.reminderTypeList.length).toBe(0);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('resetForm', () => {
    it('should reset createReminderForm to initial state', () => {
      component.createReminderForm.patchValue({
        id: 15,
        reminderType: 'Custom Reminder',
        isBloomvie: true,
        isDaycare: true,
        isActive: false,
      });

      component.resetForm();

      expect(component.createReminderForm.value).toEqual({
        id: 0,
        reminderType: null,
        isBloomvie: false,
        isDaycare: false,
        isActive: true,
      });
    });
  });

  describe('editReminderType', () => {
    it('should patch item data into createReminderForm', () => {
      const item = {
        id: 5,
        reminderType: 'Health Check',
        isBloomvie: true,
        isDaycare: false,
        isActive: true,
      };

      component.editReminderType(item);

      expect(component.createReminderForm.value).toEqual(item);
    });
  });

  describe('manageReminderType', () => {
    it('should mark all controls as touched when form is invalid', async () => {
      spyOn(component.createReminderForm, 'markAllAsTouched');
      component.createReminderForm.patchValue({ reminderType: '' });

      await component.manageReminderType();

      expect(component.createReminderForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should warn when neither Bloomvie nor Daycare is selected', async () => {
      component.createReminderForm.patchValue({
        reminderType: 'Valid Type',
        isBloomvie: false,
        isDaycare: false,
      });

      await component.manageReminderType();

      expect(mockToastr.warning).toHaveBeenCalledWith(
        'Kindly choose a reminder type: Bloomvie or Daycare.'
      );
      expect(mockSpinner.show).not.toHaveBeenCalled();
    });

    it('should submit successfully, refresh list, reset form, and show success toastr', async () => {
      component.createReminderForm.patchValue({
        reminderType: 'Fee Payment',
        isBloomvie: true,
        isDaycare: false,
      });

      mockReminderTypeService.manageReminderTypes.and.returnValue(
        of({ message: 'Success', activity: 'Reminder saved' })
      );

      await component.manageReminderType();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockReminderTypeService.manageReminderTypes).toHaveBeenCalled();
      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Reminder saved');
    });

    it('should show error toastr when manageReminderTypes returns failure', async () => {
      component.createReminderForm.patchValue({
        reminderType: 'Fee Payment',
        isBloomvie: false,
        isDaycare: true,
      });

      mockReminderTypeService.manageReminderTypes.and.returnValue(
        of({ message: 'Failed to save', activity: '' })
      );

      await component.manageReminderType();

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalledWith('Failed to save');
    });
  });

  describe('activeInActiveReminderType', () => {
    let mockCheckbox: HTMLInputElement;

    beforeEach(() => {
      mockCheckbox = document.createElement('input');
      mockCheckbox.type = 'checkbox';
      mockCheckbox.id = 'check10';
      document.body.appendChild(mockCheckbox);
    });

    afterEach(() => {
      if (mockCheckbox.parentElement) {
        mockCheckbox.parentElement.removeChild(mockCheckbox);
      }
    });

    it('should call service and update list when user confirms activate/deactivate', fakeAsync(() => {
      const item = { id: 10, isActive: true };
      const event = { target: { checked: false } };

      spyOn(Swal, 'fire').and.callFake((config: any) => {
        if (typeof config === 'object' && config.showCancelButton) {
          return Promise.resolve({ isConfirmed: true } as any);
        }
        return Promise.resolve({} as any);
      });

      mockReminderTypeService.activeInActiveReminderType.and.returnValue(
        of({ message: 'Success' })
      );

      component.activeInActiveReminderType(item, event);
      tick();

      expect(mockReminderTypeService.activeInActiveReminderType).toHaveBeenCalledWith(10, false);
      expect(mockReminderTypeService.getAllReminderType).toHaveBeenCalled();
    }));

    it('should revert checkbox if user cancels confirmation', fakeAsync(() => {
      const item = { id: 10, isActive: true };
      const event = { target: { checked: false } };

      mockCheckbox.checked = false;

      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.activeInActiveReminderType(item, event);
      tick();

      expect(mockCheckbox.checked).toBeTrue();
      expect(mockReminderTypeService.activeInActiveReminderType).not.toHaveBeenCalled();
    }));

    it('should revert checkbox if service returns error', fakeAsync(() => {
      const item = { id: 10, isActive: false };
      const event = { target: { checked: true } };

      mockCheckbox.checked = true;

      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockReminderTypeService.activeInActiveReminderType.and.returnValue(
        of({ message: 'Failure' })
      );

      component.activeInActiveReminderType(item, event);
      tick();

      expect(mockCheckbox.checked).toBeFalse();
    }));
  });
});
