import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubscriptionDetailsComponent } from './subscription-details.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SubscriptionDetailsService } from './subscription-details.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../../common-component/profile/profile.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('SubscriptionDetailsComponent', () => {
  let component: SubscriptionDetailsComponent;
  let fixture: ComponentFixture<SubscriptionDetailsComponent>;
  let mockSubDetailsService: jasmine.SpyObj<SubscriptionDetailsService>;
  let mockCookie: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    mockSubDetailsService = jasmine.createSpyObj('SubscriptionDetailsService', [
      'getDetails',
      'activeInActiveSubscriptionPlansByID',
    ]);
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error', 'info']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getUserProfile']);

    mockCookie.get.and.returnValue('10');
    mockSubDetailsService.getDetails.and.returnValue(of({
      message: 'Ok',
      result: [
        {
          id: 1,
          planName: 'Gold Plan',
          months: true,
          years: false,
          featureList: [{ featureName: 'Feature 1' }, { featureName: 'Feature 2' }],
        },
      ],
    }));

    await TestBed.configureTestingModule({
      imports: [SubscriptionDetailsComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: SubscriptionDetailsService, useValue: mockSubDetailsService },
        { provide: CookieService, useValue: mockCookie },
        { provide: ToastrService, useValue: mockToastr },
        { provide: ProfileService, useValue: mockProfileService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SubscriptionDetailsComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SubscriptionDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create SubscriptionDetailsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Plan Details', () => {
    it('should read userId and load plan details in ngOnInit', () => {
      component.ngOnInit();

      expect(component.userId).toBe('10');
      expect(mockSubDetailsService.getDetails).toHaveBeenCalledWith(jasmine.objectContaining({ loginUserID: '10' }));
      expect(component.subscriptionPlans.length).toBe(1);
      expect(component.subscriptionPlans[0].billingCycle).toBe('Monthly');
      expect(component.subscriptionPlans[0].featureNames).toBe('Feature 1, Feature 2');
    });

    it('should emit editPlan in onEdit', () => {
      spyOn(component.editPlan, 'emit');
      const mockPlan = { id: 1, planName: 'Silver' };

      component.onEdit(mockPlan);

      expect(component.editPlan.emit).toHaveBeenCalledWith(mockPlan);
    });
  });

  describe('Pagination', () => {
    it('should update ContentP and slice displayed plans on onPageChange', () => {
      component.subscriptionPlans = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
      component.Contentsize = 5;

      component.onPageChange(2);

      expect(component.ContentP).toBe(2);
      expect(component.displayedPlans.length).toBe(1);
    });
  });

  describe('Active/Inactive Toggle', () => {
    it('should call activeInActiveSubscriptionPlansByID on confirmation', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      mockSubDetailsService.activeInActiveSubscriptionPlansByID.and.returnValue(of({ message: 'Success' }));
      spyOn(component, 'getPlanDetails');

      component.ActiveInactiveUserRole(1, false);
      await fixture.whenStable();

      expect(mockSubDetailsService.activeInActiveSubscriptionPlansByID).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith('Subscription Plan has been activated successfully');
      expect(component.getPlanDetails).toHaveBeenCalled();
    });

    it('should call getPlanDetails in refreshData()', () => {
      spyOn(component, 'getPlanDetails');
      component.refreshData();
      expect(component.getPlanDetails).toHaveBeenCalled();
    });
  });
});
