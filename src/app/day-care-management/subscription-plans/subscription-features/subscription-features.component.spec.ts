import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SubscriptionFeaturesComponent } from './subscription-features.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SubscriptionFeaturesService } from './subscription-features.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('SubscriptionFeaturesComponent', () => {
  let component: SubscriptionFeaturesComponent;
  let fixture: ComponentFixture<SubscriptionFeaturesComponent>;
  let mockSubFeaturesService: jasmine.SpyObj<SubscriptionFeaturesService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockSubFeaturesService = jasmine.createSpyObj('SubscriptionFeaturesService', [
      'getFeatures',
      'getAllUnits',
      'subscriptionFeature',
      'deleteFeature',
      'activeInActiveSubscriptionFeaturesByID',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'set']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'UserId') return '10';
      if (key === 'UserRoleId') return '3';
      if (key === 'CentreID') return '5';
      return '';
    });

    mockSubFeaturesService.getFeatures.and.returnValue(of({
      message: 'Ok',
      result: [{ id: 1, featureName: 'Attendance', featureDescription: 'Track attendance' }],
    }));
    mockSubFeaturesService.getAllUnits.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, unitName: 'Students' }],
    }));

    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
    });

    await TestBed.configureTestingModule({
      imports: [SubscriptionFeaturesComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: SubscriptionFeaturesService, useValue: mockSubFeaturesService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SubscriptionFeaturesComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SubscriptionFeaturesComponent);
    component = fixture.componentInstance;
  });

  it('should create SubscriptionFeaturesComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and Form validation', () => {
    it('should initialize featureForm and getForm controls', () => {
      expect(component.featureForm.contains('featureName')).toBeTrue();
      expect(component.featureForm.contains('featureDescription')).toBeTrue();
      expect(component.getForm.contains('searchText')).toBeTrue();
    });

    it('should validate whitespace in noWhitespaceValidator', () => {
      const control = { value: '   ' } as any;
      expect(component.noWhitespaceValidator(control)).toEqual({ whitespace: true });

      const validControl = { value: 'Valid name' } as any;
      expect(component.noWhitespaceValidator(validControl)).toBeNull();
    });

    it('should load features and units on ngOnInit', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.loginUserId).toBe('10');
      expect(component.UserRoleID).toBe('3');
      expect(component.CentreID).toBe(5);
      expect(mockSubFeaturesService.getFeatures).toHaveBeenCalled();
      expect(mockSubFeaturesService.getAllUnits).toHaveBeenCalled();
      expect(component.features.length).toBe(1);
      expect(component.UnitsList.length).toBe(1);
    }));
  });

  describe('Form input handling and digit limits', () => {
    it('should sanitize input in onInputValidation', () => {
      const event = { target: { value: '123feature!' } } as any;
      component.onInputValidation(event, 'feature');

      expect(component.featureForm.get('featureName')?.value).toBe('Feature');
    });

    it('should prevent more than 4 digits in preventMoreThan4Digits', () => {
      const event = { target: { value: '12345' } } as any;
      component.preventMoreThan4Digits(event);

      expect(event.target.value).toBe('1234');
      expect(component.featureForm.get('Capacity')?.value).toBe('1234');
    });
  });

  describe('Form Submission', () => {
    it('should add new feature on valid submission', fakeAsync(() => {
      component.featureForm.patchValue({
        id: 0,
        featureName: 'Messaging',
        featureDescription: 'Direct messaging between parents and teachers',
      });

      mockSubFeaturesService.subscriptionFeature.and.returnValue(of({
        message: 'Ok',
        result: { id: 2 },
      }));
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      component.onSubmit();
      tick();

      expect(mockSubFeaturesService.subscriptionFeature).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Feature Added Successfully.');
    }));

    it('should update existing feature on valid submission with id > 0', fakeAsync(() => {
      component.featureForm.patchValue({
        id: 5,
        featureName: 'Messaging Updated',
        featureDescription: 'Direct messaging',
      });

      mockSubFeaturesService.subscriptionFeature.and.returnValue(of({
        message: 'Ok',
        result: { id: 5 },
      }));

      component.onSubmit();
      tick();

      expect(mockSubFeaturesService.subscriptionFeature).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Feature Updated Successfully.');
    }));
  });

  describe('Edit, Delete, and Toggle status', () => {
    it('should patch form on onEdit()', () => {
      const item = {
        id: 10,
        featureName: 'Reports',
        featureDescription: 'Detailed reports',
        quantity: 50,
        units: 'Pages',
        jobPostType: false,
      };

      component.onEdit(item);

      expect(component.featureForm.value.id).toBe(10);
      expect(component.featureForm.value.featureName).toBe('Reports');
      expect(component.featureForm.value.featureDescription).toBe('Detailed reports');
    });

    it('should delete feature on onDelete', () => {
      mockSubFeaturesService.deleteFeature.and.returnValue(of({
        message: 'Feature deleted successfully.',
      }));
      spyOn(component, 'getData');

      component.onDelete(10);

      expect(mockSubFeaturesService.deleteFeature).toHaveBeenCalledWith(10);
      expect(mockToastr.success).toHaveBeenCalledWith('Feature deleted successfully.');
      expect(component.getData).toHaveBeenCalled();
    });

    it('should toggle active status on ActiveInactiveUserRole', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockSubFeaturesService.activeInActiveSubscriptionFeaturesByID.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getData');

      component.ActiveInactiveUserRole(1, true);
      await fixture.whenStable();

      expect(mockSubFeaturesService.activeInActiveSubscriptionFeaturesByID).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalled();
      expect(component.getData).toHaveBeenCalled();
    });
  });
});
