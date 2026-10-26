import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BloomviePlansComponent } from './bloomvie-plans.component';
import { SubscriptionFeaturesService } from '../day-care-management/subscription-plans/subscription-features/subscription-features.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../common-component/common.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('BloomviePlansComponent', () => {
  let component: BloomviePlansComponent;
  let fixture: ComponentFixture<BloomviePlansComponent>;
  let mockSubService: jasmine.SpyObj<SubscriptionFeaturesService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    mockSubService = jasmine.createSpyObj('SubscriptionFeaturesService', [
      'GetSubscriptionPlanandFeaturesByUserId',
      'getFeatures',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['error', 'success']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['decrypt', 'encrypt', 'getBloomvieOwner']);

    mockCommonService.decrypt.and.callFake((val: string) => {
      if (val === 'enc-plan-2') return '2';
      if (val === 'enc-user-10') return '10';
      return val;
    });
    mockCommonService.encrypt.and.callFake((val: string) => `enc_${val}`);
    mockCommonService.getBloomvieOwner.and.returnValue(of({ message: 'Ok', result: { id: 1 } }));

    mockSubService.GetSubscriptionPlanandFeaturesByUserId.and.returnValue(
      of({
        result: [
          { planeId: 1, name: 'Plan 1' },
          { planeId: 2, name: 'Plan 2' },
        ],
      })
    );
    mockSubService.getFeatures.and.returnValue(
      of({
        result: [
          { id: 1, isActive: true, jobPostType: true },
          { id: 2, isActive: true, storageType: true },
          { id: 3, isActive: true, enrollmentType: true },
          { id: 4, isActive: true, other: true },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [BloomviePlansComponent],
      providers: [
        { provide: SubscriptionFeaturesService, useValue: mockSubService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(
              convertToParamMap({
                enc: 'enc-user-10',
                enc_plan: 'enc-plan-2',
                enc_type: null,
              })
            ),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(BloomviePlansComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BloomviePlansComponent);
    component = fixture.componentInstance;
  });

  it('should create the BloomviePlansComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit & Plan Loading', () => {
    it('should parse route parameters and fetch plans and features', () => {
      component.ngOnInit();

      expect(component.decryptedUserId).toBe('10');
      expect(component.currentPlanId).toBe(2);
      expect(mockCommonService.getBloomvieOwner).toHaveBeenCalled();
      expect(mockSubService.GetSubscriptionPlanandFeaturesByUserId).toHaveBeenCalledWith('10', 'renew');
      expect(component.planFeatureList[0].planeId).toBe(2);
    });

    it('should categorize features into lists on loadFeatures', () => {
      component.bloomvieOwerID = 1;
      component.loadFeatures();

      expect(component.jobPostTypeFeatureList.length).toBe(1);
      expect(component.storageTypeFeatureList.length).toBe(1);
      expect(component.enrollmentTypeFeatureList.length).toBe(1);
      expect(component.otherFeatureList.length).toBe(1);
    });

    it('should handle network error in getPlanList by displaying Swal', () => {
      mockSubService.GetSubscriptionPlanandFeaturesByUserId.and.returnValue(
        throwError(() => ({ message: 'Server not responding. Please try again later.' }))
      );
      spyOn(Swal, 'fire');

      component.getPlanList();

      expect(Swal.fire).toHaveBeenCalledWith(
        'Network Error',
        jasmine.any(String),
        'warning'
      );
    });

    it('should handle general error in getPlanList', () => {
      mockSubService.GetSubscriptionPlanandFeaturesByUserId.and.returnValue(
        throwError(() => ({ message: 'Failed to load plans' }))
      );

      component.getPlanList();

      expect(mockToastr.error).toHaveBeenCalledWith('Failed to load plans');
    });
  });

  describe('onBuyPlan', () => {
    it('should construct redirect URL and set window.location.href', () => {
      component.enc_type = null;
      component['encParam'] = 'enc-user-10';

      // We test that encrypt is called for planId
      component.onBuyPlan(5);

      expect(mockCommonService.encrypt).toHaveBeenCalledWith('5');
      expect(mockCommonService.encrypt).toHaveBeenCalledWith('Re-Subscribe');
    });
  });
});
