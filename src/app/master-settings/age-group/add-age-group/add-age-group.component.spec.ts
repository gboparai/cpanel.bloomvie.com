import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddAgeGroupComponent } from './add-age-group.component';
import { AddAgeGroupService } from './add-age-group.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('AddAgeGroupComponent', () => {
  let component: AddAgeGroupComponent;
  let fixture: ComponentFixture<AddAgeGroupComponent>;
  let mockAgeGpService: jasmine.SpyObj<AddAgeGroupService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockAgeGpService = jasmine.createSpyObj('AddAgeGroupService', [
      'ManageAgeGroup',
      'GetAllAgeGroup',
      'GetAgeGroupByID',
      'ActiveInactiveAgeGroup',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['check', 'get']);

    mockCookie.check.and.returnValue(true);
    mockCookie.get.and.returnValue('9');

    mockAgeGpService.GetAllAgeGroup.and.returnValue(
      of({
        message: 'Success',
        result: [
          { id: 1, minAge: 6, maxAge: 12, isActive: true },
          { id: 2, minAge: 12, maxAge: 24, isActive: false },
        ],
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      prop: jasmine.createSpy('prop'),
    });

    await TestBed.configureTestingModule({
      imports: [AddAgeGroupComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AddAgeGroupService, useValue: mockAgeGpService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddAgeGroupComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddAgeGroupComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize default form values and pagination', () => {
    expect(component).toBeTruthy();
    expect(component.AgeGpFrom).toBeDefined();
    expect(component.AgeGpFrom.value.id).toBe(0);
    expect(component.ContentP).toBe(1);
    expect(component.Contentsize).toBe(5);
    expect(component.isEditMode).toBeFalse();
    expect(component.input).toBe(component.AgeGpFrom.controls);
  });

  describe('ngOnInit & getAgeGroupList', () => {
    it('should read UserId cookie and fetch all age groups on init', () => {
      component.ngOnInit();

      expect(mockCookie.check).toHaveBeenCalledWith('UserId');
      expect(mockCookie.get).toHaveBeenCalledWith('UserId');
      expect(mockAgeGpService.GetAllAgeGroup).toHaveBeenCalled();
      expect(component.ageGroupList.length).toBe(2);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('should mark all controls as touched if form is invalid', () => {
      spyOn(component.AgeGpFrom, 'markAllAsTouched');
      component.AgeGpFrom.patchValue({ minAge: '', maxAge: '' });

      component.onSubmit();

      expect(component.AgeGpFrom.markAllAsTouched).toHaveBeenCalled();
    });

    it('should submit successfully, refresh list, and hide modal on Success', fakeAsync(() => {
      component.AgeGpFrom.patchValue({ minAge: '2', maxAge: '3' });
      mockAgeGpService.ManageAgeGroup.and.returnValue(
        of({ message: 'Success', activity: 'Age group saved' })
      );
      spyOn(component, 'getAgeGroupList');

      component.onSubmit();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockAgeGpService.ManageAgeGroup).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Age group saved');
      expect(component.getAgeGroupList).toHaveBeenCalled();

      tick(300);

      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(component.isEditMode).toBeFalse();
    }));

    it('should show warning toastr when response is not Success', fakeAsync(() => {
      component.AgeGpFrom.patchValue({ minAge: '2', maxAge: '3' });
      mockAgeGpService.ManageAgeGroup.and.returnValue(
        of({ message: 'Age group already exists', activity: '' })
      );

      component.onSubmit();

      expect(mockToastr.warning).toHaveBeenCalledWith('Age group already exists');

      tick(300);
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));
  });

  describe('onEdit', () => {
    it('should fetch age group by id, patch form, and set isEditMode true', () => {
      mockAgeGpService.GetAgeGroupByID.and.returnValue(
        of({
          message: 'Success',
          result: { id: 10, minAge: 24, maxAge: 36 },
        })
      );

      component.onEdit(10);

      expect(mockAgeGpService.GetAgeGroupByID).toHaveBeenCalledWith(10);
      expect(component.isEditMode).toBeTrue();
      expect(component.AgeGpFrom.value.id).toBe(10);
      expect(component.AgeGpFrom.value.minAge).toBe(24);
      expect(component.AgeGpFrom.value.maxAge).toBe(36);
    });
  });

  describe('activeInactive', () => {
    it('should deactivate age group when confirmed and isActive was true', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockAgeGpService.ActiveInactiveAgeGroup.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getAgeGroupList');

      component.activeInactive(1, true);
      tick();

      expect(mockAgeGpService.ActiveInactiveAgeGroup).toHaveBeenCalledWith(1);
      expect(component.getAgeGroupList).toHaveBeenCalled();
    }));

    it('should activate age group when confirmed and isActive was false', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockAgeGpService.ActiveInactiveAgeGroup.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getAgeGroupList');

      component.activeInactive(2, false);
      tick();

      expect(mockAgeGpService.ActiveInactiveAgeGroup).toHaveBeenCalledWith(2);
      expect(component.getAgeGroupList).toHaveBeenCalled();
    }));

    it('should revert checkbox if user cancels confirmation', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.activeInactive(1, true);
      tick();

      expect(mockAgeGpService.ActiveInactiveAgeGroup).not.toHaveBeenCalled();
    }));
  });

  describe('cancel', () => {
    it('should set isEditMode to false and reset form', () => {
      component.isEditMode = true;
      component.AgeGpFrom.patchValue({ minAge: '5' });

      component.cancel();

      expect(component.isEditMode).toBeFalse();
      expect(component.AgeGpFrom.value.minAge).toBeNull();
    });
  });
});
