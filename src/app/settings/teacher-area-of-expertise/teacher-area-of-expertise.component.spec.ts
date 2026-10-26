import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TeacherAreaOfExpertiseComponent } from './teacher-area-of-expertise.component';
import { TeacherAreaOfExpertiseService } from './teacher-area-of-expertise.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('TeacherAreaOfExpertiseComponent', () => {
  let component: TeacherAreaOfExpertiseComponent;
  let fixture: ComponentFixture<TeacherAreaOfExpertiseComponent>;
  let mockService: jasmine.SpyObj<TeacherAreaOfExpertiseService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('TeacherAreaOfExpertiseService', [
      'getAreaOfExpertise',
      'manageAreaOfExpertise',
      'activeInActiveAreaOfExpertise',
    ]);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);

    mockService.getAreaOfExpertise.and.returnValue(
      of({
        message: 'Success',
        activity: 'Loaded',
        result: [
          { id: 1, name: 'Special Education', isActive: true },
          { id: 2, name: 'Montessori', isActive: false },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [TeacherAreaOfExpertiseComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: TeacherAreaOfExpertiseService, useValue: mockService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TeacherAreaOfExpertiseComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TeacherAreaOfExpertiseComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize form and defaults', () => {
    expect(component).toBeTruthy();
    expect(component.areaOfExpertiseForm).toBeDefined();
    expect(component.areaOfExpertiseForm.value.id).toBe(0);
    expect(component.areaOfExpertiseForm.value.isActive).toBeTrue();
    expect(component.ContentP).toBe(1);
    expect(component.Contentsize).toBe(5);
    expect(component.isEditMode).toBeFalse();
  });

  describe('ngOnInit & getAllAreaOfExpertise', () => {
    it('should fetch area of expertise and update list on Success', () => {
      component.ngOnInit();

      expect(mockService.getAreaOfExpertise).toHaveBeenCalledWith('');
      expect(component.expertise.length).toBe(2);
      expect(component.skeletonShow).toBe('');
    });

    it('should set empty list on non-Success message', () => {
      mockService.getAreaOfExpertise.and.returnValue(
        of({ message: 'Error', activity: '', result: null })
      );

      component.getAllAreaOfExpertise();

      expect(component.expertise.length).toBe(0);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('reset & onEdit', () => {
    it('reset should reset form values and isEditMode', () => {
      component.areaOfExpertiseForm.patchValue({ id: 5, areaOfExpertise: 'Music', isActive: false });
      component.isEditMode = true;

      component.reset();

      expect(component.areaOfExpertiseForm.value.id).toBe(0);
      expect(component.areaOfExpertiseForm.value.areaOfExpertise).toBe('');
      expect(component.areaOfExpertiseForm.value.isActive).toBeTrue();
      expect(component.isEditMode).toBeFalse();
    });

    it('onEdit should patch item values into form and set isEditMode true', () => {
      const item = { id: 7, name: 'STEM', isActive: true };

      component.onEdit(item);

      expect(component.isEditMode).toBeTrue();
      expect(component.areaOfExpertiseForm.value.id).toBe(7);
      expect(component.areaOfExpertiseForm.value.areaOfExpertise).toBe('STEM');
    });
  });

  describe('manageAreaOfExpertise', () => {
    it('should mark all controls as touched if form is invalid', () => {
      spyOn(component.areaOfExpertiseForm, 'markAllAsTouched');
      component.areaOfExpertiseForm.patchValue({ areaOfExpertise: '' });

      component.manageAreaOfExpertise();

      expect(component.areaOfExpertiseForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should submit successfully, refresh list, and show success toastr', () => {
      component.areaOfExpertiseForm.patchValue({ areaOfExpertise: 'Art & Craft' });
      mockService.manageAreaOfExpertise.and.returnValue(
        of({ message: 'Success', activity: 'Saved expertise', result: {} })
      );
      spyOn(component, 'getAllAreaOfExpertise');

      component.manageAreaOfExpertise();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockService.manageAreaOfExpertise).toHaveBeenCalled();
      expect(component.getAllAreaOfExpertise).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Saved expertise');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should show warning toastr when message is not Success', () => {
      component.areaOfExpertiseForm.patchValue({ areaOfExpertise: 'Art & Craft' });
      mockService.manageAreaOfExpertise.and.returnValue(
        of({ message: 'Warning', activity: 'Already exists', result: null })
      );

      component.manageAreaOfExpertise();

      expect(mockToastr.warning).toHaveBeenCalledWith('Already exists');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('activeInactiveExpertise', () => {
    let mockCheckbox: HTMLInputElement;

    beforeEach(() => {
      mockCheckbox = document.createElement('input');
      mockCheckbox.type = 'checkbox';
      mockCheckbox.id = 'check3';
      document.body.appendChild(mockCheckbox);
    });

    afterEach(() => {
      if (mockCheckbox.parentElement) {
        mockCheckbox.parentElement.removeChild(mockCheckbox);
      }
    });

    it('should call service and update list when user confirms deactivate/activate', fakeAsync(() => {
      const item = { id: 3, isActive: true };
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true } as any)
      );
      mockService.activeInActiveAreaOfExpertise.and.returnValue(
        of({ message: 'Success', activity: 'Updated status', result: null })
      );
      spyOn(component, 'getAllAreaOfExpertise');

      component.activeInactiveExpertise({}, item);
      tick();

      expect(mockService.activeInActiveAreaOfExpertise).toHaveBeenCalledWith(3);
      expect(component.getAllAreaOfExpertise).toHaveBeenCalled();
    }));

    it('should revert checkbox if user cancels confirmation', fakeAsync(() => {
      const item = { id: 3, isActive: true };
      mockCheckbox.checked = false;

      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false } as any)
      );

      component.activeInactiveExpertise({}, item);
      tick();

      expect(mockCheckbox.checked).toBeTrue();
      expect(mockService.activeInActiveAreaOfExpertise).not.toHaveBeenCalled();
    }));
  });

  describe('onSearchInput', () => {
    it('should debounce search input and call getAllAreaOfExpertise after 1000ms', fakeAsync(() => {
      spyOn(component, 'getAllAreaOfExpertise');

      component.onSearchInput();
      expect(component.getAllAreaOfExpertise).not.toHaveBeenCalled();

      tick(1000);
      expect(component.getAllAreaOfExpertise).toHaveBeenCalled();
    }));
  });
});
