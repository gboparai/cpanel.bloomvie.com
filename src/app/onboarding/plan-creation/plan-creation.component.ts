import { Component, ViewChild } from '@angular/core';
import { SubscriptionFeaturesComponent } from '../../day-care-management/subscription-plans/subscription-features/subscription-features.component';
import { SubscriptionPlansComponent } from '../../day-care-management/subscription-plans/subscription-plans/subscription-plans.component';
import { OnboardingService } from '../onboarding.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-plan-creation',
  standalone: true,
  imports: [SubscriptionFeaturesComponent,SubscriptionPlansComponent],
  templateUrl: './plan-creation.component.html',
  styleUrl: './plan-creation.component.css'
})
export class PlanCreationComponent {
  disabledFeature:boolean = true;

  constructor (public service:OnboardingService,private toastr:ToastrService) { }

  @ViewChild(SubscriptionPlansComponent) subscriptionPlan!: SubscriptionPlansComponent;
  
  detectChanges(event:any) {
      if(event == "Ok") {
        this.subscriptionPlan.GetSubscriptionPlanandFeatures()
      }
  }


  // trackValue() {
  // planLength is creating error
  //   if(this.subscriptionPlan != null)
  //   {

  //     if(this.subscriptionPlan?.planLength == 0) {
  //       this.disabledFeature = true;
  //     } else {
  //   }
  //     this.disabledFeature = false;
  //   }
  // }


  proceedOnboarding(){
    if (!this.service.onBoardingData.isCompleteStep4) {
      this.service.onBoardingData.isCompleteStep4 = true;
      this.service.handleNext('Tab-4');
    } else {
      this.toastr.success("Plan Created Successfully...");
      this.service.getCurrentTab();
    };
  }

}
