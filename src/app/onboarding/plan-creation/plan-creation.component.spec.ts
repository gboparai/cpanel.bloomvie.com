import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanCreationComponent } from './plan-creation.component';
import { OnboardingService } from '../onboarding.service';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PlanCreationComponent', () => {
  let component: PlanCreationComponent;
  let fixture: ComponentFixture<PlanCreationComponent>;
  let mockOnboardingService: any;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockOnboardingService = {
      onBoardingData: {
        isCompleteStep4: false,
      },
      handleNext: jasmine.createSpy('handleNext'),
      getCurrentTab: jasmine.createSpy('getCurrentTab'),
    };
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [PlanCreationComponent],
      providers: [
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: ToastrService, useValue: mockToastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PlanCreationComponent, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PlanCreationComponent);
    component = fixture.componentInstance;
  });

  it('should create the PlanCreationComponent', () => {
    expect(component).toBeTruthy();
    expect(component.disabledFeature).toBeTrue();
  });

  describe('detectChanges', () => {
    it('should call GetSubscriptionPlanandFeatures on child component when event is Ok', () => {
      const mockSubPlan = jasmine.createSpyObj('SubscriptionPlansComponent', ['GetSubscriptionPlanandFeatures']);
      component.subscriptionPlan = mockSubPlan;

      component.detectChanges('Ok');

      expect(mockSubPlan.GetSubscriptionPlanandFeatures).toHaveBeenCalled();
    });

    it('should not call GetSubscriptionPlanandFeatures when event is not Ok', () => {
      const mockSubPlan = jasmine.createSpyObj('SubscriptionPlansComponent', ['GetSubscriptionPlanandFeatures']);
      component.subscriptionPlan = mockSubPlan;

      component.detectChanges('Cancel');

      expect(mockSubPlan.GetSubscriptionPlanandFeatures).not.toHaveBeenCalled();
    });
  });

  describe('proceedOnboarding', () => {
    it('should complete step 4 and navigate to Tab-4 when step 4 was incomplete', () => {
      mockOnboardingService.onBoardingData.isCompleteStep4 = false;

      component.proceedOnboarding();

      expect(mockOnboardingService.onBoardingData.isCompleteStep4).toBeTrue();
      expect(mockOnboardingService.handleNext).toHaveBeenCalledWith('Tab-4');
    });

    it('should show success message and get current tab when step 4 was already complete', () => {
      mockOnboardingService.onBoardingData.isCompleteStep4 = true;

      component.proceedOnboarding();

      expect(mockToastr.success).toHaveBeenCalledWith('Plan Created Successfully...');
      expect(mockOnboardingService.getCurrentTab).toHaveBeenCalled();
    });
  });
});
