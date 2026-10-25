import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddMasterFacilityComponent } from './add-master-facility.component';
import { AddMasterFacilityService } from './add-master-facility.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('AddMasterFacilityComponent', () => {
  let component: AddMasterFacilityComponent;
  let fixture: ComponentFixture<AddMasterFacilityComponent>;
  let mockFacilityService: jasmine.SpyObj<AddMasterFacilityService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockFacilityService = jasmine.createSpyObj('AddMasterFacilityService', [
      'ManageFacility',
      'GetAllFacilities',
      'GetFacilityById',
      'ActiveInactiveFacilityId',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);

    mockCookie.get.and.returnValue('7');

    mockFacilityService.GetAllFacilities.and.returnValue(
      of({
        message: 'Success',
        result: [
          { facilityID: 1, facilityName: 'Swimming Pool', isActive: true },
          { facilityID: 2, facilityName: 'Gymnasium', isActive: false },
        ],
      })
    );

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      prop: jasmine.createSpy('prop'),
    });

    await TestBed.configureTestingModule({
      imports: [AddMasterFacilityComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AddMasterFacilityService, useValue: mockFacilityService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddMasterFacilityComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddMasterFacilityComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize default form values and properties', () => {
    expect(component).toBeTruthy();
    expect(component.faciltityForm).toBeDefined();
    expect(component.faciltityForm.value.facilityID).toBe(0);
    expect(component.faciltityForm.value.isActive).toBeTrue();
    expect(component.isEditMode).toBeFalse();
    expect(component.contentSize).toBe(5);
    expect(component.ContentP).toBe(1);
    expect(component.input).toBe(component.faciltityForm.controls);
  });

  describe('ngOnInit & GetFacilityList', () => {
    it('should read UserId cookie and load facility list on Success', () => {
      component.ngOnInit();

      expect(mockCookie.get).toHaveBeenCalledWith('UserId');
      expect(component.loginUserID).toBe(7);
      expect(mockFacilityService.GetAllFacilities).toHaveBeenCalled();
      expect(component.FacilitiesList.length).toBe(2);
      expect(component.skeletonShow).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('should mark all controls touched if form is invalid', () => {
      spyOn(component.faciltityForm, 'markAllAsTouched');
      component.faciltityForm.patchValue({ facilityName: '' });

      component.onSubmit();

      expect(component.faciltityForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should save new facility and show success toastr when facilityID is 0', () => {
      component.faciltityForm.patchValue({
        facilityID: 0,
        facilityName: 'Cafeteria',
      });

      mockFacilityService.ManageFacility.and.returnValue(
        of({ message: 'Success' })
      );
      spyOn(component, 'GetFacilityList');

      component.onSubmit();

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockFacilityService.ManageFacility).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Data saved successfully');
      expect(mockSpinner.hide).toHaveBeenCalled();
      expect(component.isEditMode).toBeFalse();
      expect(component.GetFacilityList).toHaveBeenCalled();
    });

    it('should update facility and show update toastr when facilityID > 0', () => {
      component.faciltityForm.patchValue({
        facilityID: 5,
        facilityName: 'Auditorium',
      });

      mockFacilityService.ManageFacility.and.returnValue(
        of({ message: 'Success' })
      );

      component.onSubmit();

      expect(mockToastr.success).toHaveBeenCalledWith('Data updated successfully');
    });

    it('should show warning toastr when facility name already exists', () => {
      component.faciltityForm.patchValue({
        facilityID: 0,
        facilityName: 'Swimming Pool',
      });

      mockFacilityService.ManageFacility.and.returnValue(
        of({ message: 'Facility name already exists' })
      );

      component.onSubmit();

      expect(mockToastr.warning).toHaveBeenCalledWith('Facility name already exist');
    });
  });

  describe('onEdit', () => {
    it('should fetch facility by id, populate form, and set isEditMode true', () => {
      mockFacilityService.GetFacilityById.and.returnValue(
        of({
          message: 'Success',
          result: {
            facilityID: 15,
            facilityName: 'Playground',
            isActive: true,
          },
        })
      );

      component.onEdit(15);

      expect(mockSpinner.show).toHaveBeenCalled();
      expect(mockFacilityService.GetFacilityById).toHaveBeenCalledWith(15);
      expect(component.isEditMode).toBeTrue();
      expect(component.faciltityForm.value.facilityID).toBe(15);
      expect(component.faciltityForm.value.facilityName).toBe('Playground');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });

    it('should show error toastr if GetFacilityById returns failure', () => {
      mockFacilityService.GetFacilityById.and.returnValue(
        of({ message: 'Error', result: null })
      );

      component.onEdit(99);

      expect(mockToastr.error).toHaveBeenCalledWith('Error patching facility');
      expect(mockSpinner.hide).toHaveBeenCalled();
    });
  });

  describe('activeInactive', () => {
    it('should deactivate facility when confirmed and isActive was true', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockFacilityService.ActiveInactiveFacilityId.and.returnValue(
        of({ message: 'Success' })
      );
      spyOn(component, 'GetFacilityList');

      component.activeInactive(1, true);
      tick();

      expect(mockFacilityService.ActiveInactiveFacilityId).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith('Facility has been deactivated successfully');
      expect(component.GetFacilityList).toHaveBeenCalled();
    }));

    it('should activate facility when confirmed and isActive was false', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockFacilityService.ActiveInactiveFacilityId.and.returnValue(
        of({ message: 'Success' })
      );
      spyOn(component, 'GetFacilityList');

      component.activeInactive(2, false);
      tick();

      expect(mockFacilityService.ActiveInactiveFacilityId).toHaveBeenCalledWith(2);
      expect(mockToastr.success).toHaveBeenCalledWith('Facility has been activated successfully');
    }));

    it('should do nothing if confirmation is cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.activeInactive(1, true);
      tick();

      expect(mockFacilityService.ActiveInactiveFacilityId).not.toHaveBeenCalled();
    }));
  });

  describe('reset, cancel, openAddFacilityModal', () => {
    it('reset should reset facility form fields', () => {
      component.faciltityForm.patchValue({ facilityName: 'Testing' });
      component.reset();

      expect(component.faciltityForm.value.facilityName).toBe('');
      expect(component.faciltityForm.value.facilityID).toBe(0);
    });

    it('cancel should call reset', () => {
      spyOn(component, 'reset');
      component.cancel();

      expect(component.reset).toHaveBeenCalled();
    });

    it('openAddFacilityModal should reset form, set isEditMode false, and open modal', () => {
      component.isEditMode = true;
      component.openAddFacilityModal();

      expect(component.isEditMode).toBeFalse();
      expect(component.faciltityForm.value.facilityName).toBe('');
    });
  });
});
