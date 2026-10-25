import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SubscriptionPlansComponent } from './subscription-plans.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SubscriptionFeaturesService } from '../subscription-features/subscription-features.service';
import { SubscriptionPlansService } from './subscription-plans.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { SubscriptionDetailsService } from '../subscription-details/subscription-details.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageStudentService } from '../../student-management/manage-student/manage-student.service';
import { DaycareService } from '../../day-care-settings/daycare.service';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('SubscriptionPlansComponent', () => {
  let component: SubscriptionPlansComponent;
  let fixture: ComponentFixture<SubscriptionPlansComponent>;
  let mockFeaturesService: jasmine.SpyObj<SubscriptionFeaturesService>;
  let mockPlanService: jasmine.SpyObj<SubscriptionPlansService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockSubDetailsService: jasmine.SpyObj<SubscriptionDetailsService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockStudentService: jasmine.SpyObj<ManageStudentService>;
  let mockDaycareService: jasmine.SpyObj<DaycareService>;

  beforeEach(async () => {
    mockFeaturesService = jasmine.createSpyObj('SubscriptionFeaturesService', [
      'getFeatures',
      'GetSubscriptionPlanandFeaturesByUserId',
    ]);
    mockPlanService = jasmine.createSpyObj('SubscriptionPlansService', [
      'getSubscriptionPlans',
      'createSubscriptionPlan',
      'activeInActiveSubscriptionPlansByID',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get', 'check']);
    mockSubDetailsService = jasmine.createSpyObj('SubscriptionDetailsService', ['getDetails']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockStudentService = jasmine.createSpyObj('ManageStudentService', ['GetAllAgeGroup']);
    mockDaycareService = jasmine.createSpyObj('DaycareService', ['checkExternalBilling']);

    mockCookie.get.and.callFake((key: string) => {
      if (key === 'UserId') return '10';
      if (key === 'CentreID') return '5';
      if (key === 'UserInfo') {
        return JSON.stringify({ result: { userRoleID: 3 } });
      }
      return '';
    });

    mockDaycareService.checkExternalBilling.and.returnValue(of({
      message: 'Success',
      result: { externalBillingEnabled: false },
    }));
    mockFeaturesService.getFeatures.and.returnValue(of({
      message: 'Ok',
      result: [{ id: 1, featureName: 'Attendance', jobPostType: false, storageType: false, enrollmentType: false }],
    }));
    mockFeaturesService.GetSubscriptionPlanandFeaturesByUserId.and.returnValue(of({
      message: 'OK',
      result: [{ id: 1, planName: 'Gold Plan', price: 100 }],
    }));
    mockStudentService.GetAllAgeGroup.and.returnValue(of({
      message: 'Success',
      result: [{ id: 1, groupName: 'Toddler' }],
    }));

    await TestBed.configureTestingModule({
      imports: [SubscriptionPlansComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        ChangeDetectorRef,
        { provide: SubscriptionFeaturesService, useValue: mockFeaturesService },
        { provide: SubscriptionPlansService, useValue: mockPlanService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CookieService, useValue: mockCookie },
        { provide: SubscriptionDetailsService, useValue: mockSubDetailsService },
        { provide: Router, useValue: mockRouter },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ManageStudentService, useValue: mockStudentService },
        { provide: DaycareService, useValue: mockDaycareService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SubscriptionPlansComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SubscriptionPlansComponent);
    component = fixture.componentInstance;
  });

  it('should create SubscriptionPlansComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and ngOnInit', () => {
    it('should initialize form controls and load features and plans', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.userId).toBe('10');
      expect(component.centreID).toBe(5);
      expect(component.UserRoleId).toBe(3);
      expect(mockDaycareService.checkExternalBilling).toHaveBeenCalledWith(5);
      expect(mockFeaturesService.getFeatures).toHaveBeenCalled();
      expect(mockFeaturesService.GetSubscriptionPlanandFeaturesByUserId).toHaveBeenCalled();
    }));

    it('should set duration array based on UserRoleId', () => {
      component.UserRoleId = 1;
      component.setDurationArray();
      expect(component.durations).toEqual(['Monthly', 'Yearly']);

      component.UserRoleId = 3;
      component.setDurationArray();
      expect(component.durations).toEqual(['Daily', 'Monthly', 'Yearly']);
    });
  });

  describe('Form Validations and Numeric Inputs', () => {
    it('should validate minSelectedFeatures validator', () => {
      const validator = component.minSelectedFeatures(1);
      const controlEmpty = { value: [] } as any;
      expect(validator(controlEmpty)).toEqual({ minSelectedFeatures: true });

      const controlFilled = { value: [{ id: 1 }] } as any;
      expect(validator(controlFilled)).toBeNull();
    });

    it('should sanitize planName and description in onInputValidation', () => {
      const event = { target: { value: '123Special Plan!' } } as any;
      component.onInputValidation(event, 'planName');
      expect(component.subscriptionFormPlanA.get('planName')?.value).toBe('Special Plan');
    });

    it('should convert year to month and month to year', () => {
      expect(component.convertYearToMonth(2)).toBe(24);
      expect(component.convertMonthToYear(36)).toBe(3);
    });
  });

  describe('Plan Submission and Navigation', () => {
    it('should navigate to subscription features on goToSubscriptionFeatures', () => {
      component.goToSubscriptionFeatures();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['subscription-features']);
    });

    it('should reset form values on reset()', () => {
      component.subscriptionFormPlanA.patchValue({
        planName: 'Platinum',
        price: 200,
      });

      component.reset();

      expect(component.subscriptionFormPlanA.get('planName')?.value).toBe('');
      expect(component.subscriptionFormPlanA.get('price')?.value).toBe('');
    });

    it('should update information for editing plan in updateInformation', () => {
      const plan = {
        id: 10,
        planName: 'Silver',
        price: 50,
        description: 'Basic plan',
        duration: 'Monthly',
        discount: 0,
        ageGroupID: 1,
        featureList: [{ featureID: 1 }],
      };

      component.updateInformation(plan);

      expect(component.isEditMode).toBeTrue();
      expect(component.subscriptionFormPlanA.get('planName')?.value).toBe('Silver');
      expect(component.subscriptionFormPlanA.get('price')?.value).toBe(50);
    });
  });
});
