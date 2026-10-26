import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddMasterActivityComponent } from './add-master-activity.component';
import { AddMasterActivityService } from './add-master-activity.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('AddMasterActivityComponent', () => {
  let component: AddMasterActivityComponent;
  let fixture: ComponentFixture<AddMasterActivityComponent>;
  let mockActivityService: jasmine.SpyObj<AddMasterActivityService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockActivityService = jasmine.createSpyObj('AddMasterActivityService', [
      'ManageActivity',
      'GetAllActivities',
      'GetActivityById',
      'ActiveInactiveById',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);

    mockActivityService.GetAllActivities.and.returnValue(
      of({
        message: 'Ok',
        result: [
          {
            id: 1,
            activityName: 'Painting',
            activityDescription: 'Watercolors',
            activityDurationInMins: 30,
            isActive: true,
          },
        ],
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      prop: jasmine.createSpy('prop'),
    });

    await TestBed.configureTestingModule({
      imports: [AddMasterActivityComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AddMasterActivityService, useValue: mockActivityService },
        { provide: ToastrService, useValue: mockToastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddMasterActivityComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddMasterActivityComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize default form values', () => {
    expect(component).toBeTruthy();
    expect(component.activityForm).toBeDefined();
    expect(component.activityForm.value.id).toBe(0);
    expect(component.activityForm.value.isActive).toBeTrue();
    expect(component.isEditMode).toBeFalse();
    expect(component.contentP).toBe(1);
    expect(component.contentSize).toBe(5);
    expect(component.input).toBe(component.activityForm.controls);
  });

  describe('ngOnInit & GetActivityList', () => {
    it('should fetch activities list on init', () => {
      component.ngOnInit();

      expect(mockActivityService.GetAllActivities).toHaveBeenCalledWith({
        searchText: '',
        isActive: true,
      });
      expect(component.activityList.length).toBe(1);
      expect(component.activityList[0].activityName).toBe('Painting');
    });
  });

  describe('onSubmit', () => {
    it('should mark form controls as touched if invalid', () => {
      spyOn(component.activityForm, 'markAllAsTouched');
      component.activityForm.patchValue({ activityName: '' });

      component.onSubmit();

      expect(component.activityForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should save new activity and show success toastr when id is 0', () => {
      component.activityForm.patchValue({
        id: 0,
        activityName: 'Storytelling',
        activityDescription: 'Fairy tales',
        activityDurationInMins: 20,
        activityMaterial: 'Books',
        activityGroup: 'Toodlers',
      });

      mockActivityService.ManageActivity.and.returnValue(of({ message: 'Ok' }));
      spyOn(component, 'GetActivityList');

      component.onSubmit();

      expect(mockActivityService.ManageActivity).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Data saved successfully');
      expect(component.isEditMode).toBeFalse();
      expect(component.GetActivityList).toHaveBeenCalled();
    });

    it('should update activity and show success toastr when id > 0', () => {
      component.activityForm.patchValue({
        id: 10,
        activityName: 'Advanced Painting',
        activityDescription: 'Canvas',
        activityDurationInMins: 45,
        activityMaterial: 'Brushes',
        activityGroup: 'Preschool',
      });

      mockActivityService.ManageActivity.and.returnValue(of({ message: 'Ok' }));

      component.onSubmit();

      expect(mockToastr.success).toHaveBeenCalledWith('Data updated successfully');
    });

    it('should show warning toastr when activity group name already exists', () => {
      component.activityForm.patchValue({
        id: 0,
        activityName: 'Clay Modeling',
        activityDescription: 'Shapes',
        activityDurationInMins: 15,
        activityMaterial: 'Clay',
        activityGroup: 'ExistingGroup',
      });

      mockActivityService.ManageActivity.and.returnValue(
        of({ message: 'Activity group name already exists' })
      );

      component.onSubmit();

      expect(mockToastr.warning).toHaveBeenCalledWith('Activity group name already exists');
    });
  });

  describe('onEdit', () => {
    it('should load activity details and patch form on message OK', () => {
      mockActivityService.GetActivityById.and.returnValue(
        of({
          message: 'OK',
          result: {
            activityID: 5,
            activityName: 'Origami',
            activityDescription: 'Paper folding',
            activityDurationInMins: 25,
            activityMaterial: 'Paper',
            activityGroup: 'Kindergarten',
            isActive: true,
          },
        })
      );

      component.onEdit(5);

      expect(mockActivityService.GetActivityById).toHaveBeenCalledWith(5);
      expect(component.isEditMode).toBeTrue();
      expect(component.activityForm.value.id).toBe(5);
      expect(component.activityForm.value.activityName).toBe('Origami');
    });
  });

  describe('activeInactive', () => {
    it('should deactivate activity when confirmed and isActive was true', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockActivityService.ActiveInactiveById.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'GetActivityList');

      component.activeInactive(1, true);
      tick();

      expect(mockActivityService.ActiveInactiveById).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith('Activity has been Deactivated successfully');
      expect(component.GetActivityList).toHaveBeenCalled();
    }));

    it('should activate activity when confirmed and isActive was false', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockActivityService.ActiveInactiveById.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'GetActivityList');

      component.activeInactive(2, false);
      tick();

      expect(mockActivityService.ActiveInactiveById).toHaveBeenCalledWith(2);
      expect(mockToastr.success).toHaveBeenCalledWith('Activity has been Activated successfully');
    }));

    it('should do nothing if confirmation is cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.activeInactive(1, true);
      tick();

      expect(mockActivityService.ActiveInactiveById).not.toHaveBeenCalled();
    }));
  });

  describe('reset, cancel, openAddActivityModal', () => {
    it('reset should reset form fields', () => {
      component.activityForm.patchValue({ activityName: 'Test' });
      component.reset();

      expect(component.activityForm.value.activityName).toBe('');
      expect(component.activityForm.value.id).toBe(0);
    });

    it('cancel should call reset', () => {
      spyOn(component, 'reset');
      component.cancel();

      expect(component.reset).toHaveBeenCalled();
    });

    it('openAddActivityModal should set isEditMode false and reset', () => {
      component.isEditMode = true;
      spyOn(component, 'reset');

      component.openAddActivityModal();

      expect(component.isEditMode).toBeFalse();
      expect(component.reset).toHaveBeenCalled();
    });
  });
});
