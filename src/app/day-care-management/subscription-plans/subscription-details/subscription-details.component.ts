import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SubscriptionDetailsService } from './subscription-details.service';
import { NgFor, NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { SubscriptionPlansComponent } from '../subscription-plans/subscription-plans.component';
// import $ from jQuery;
import { EventEmitter, Output } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { ProfileComponent } from '../../../common-component/profile/profile.component';
import { ProfileService } from '../../../common-component/profile/profile.service';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";
declare var $: any;

@Component({
  selector: 'app-subscription-details',
  standalone: true,
  imports: [NgFor, SubscriptionPlansComponent, NgIf, NgxPaginationModule, BreadcrumbComponent, ProfileComponent, SkeletonLoaderComponent], // Only standalone components, directives, pipes, or NgModules here
  providers: [ProfileService], // Services should go in the providers array
  templateUrl: './subscription-details.component.html',
  styleUrls: ['./subscription-details.component.css', '../../../common-component/profile/profile.component.css'],
})

export class SubscriptionDetailsComponent implements OnInit {

  subscriptionPlans: any[] = [];

  Plans: any[] = []; // Full list of subscription plans
  displayedPlans: any[] = [];

  ContentP: number = 1;
  Contentsize: number = 5;
  @Input() selectedFeatures: any[] = [];
  @ViewChild('checkBoxAinA') checkBoxAinA: any;
  isEditMode: boolean = false;

  @Output() editPlan = new EventEmitter<any>();

  plan: any;
  getForm: any;
  userId: any;
  billingCycle: any;
  skeletonShow = 'Skelton';


  constructor(private subscriptionDetailsService: SubscriptionDetailsService, private fb: FormBuilder, private cookie: CookieService, private toastr: ToastrService) {
    this.getForm = this.fb.group({
      searchText: [''],
      isActive: null,
      loginUserID: this.userId
    })
  }

  ngOnInit(): void {
    this.userId = this.cookie.get("UserId")
    this.getPlanDetails();
    this.loadPlans();
  }
  //
  loadPlans(): void {
    this.subscriptionPlans = [ /* Your subscription plans data here */];
    this.updateDisplayedPlans();
  }

  //pagination
  onPageChange(page: number): void {
    this.ContentP = page;
    this.updateDisplayedPlans();
  }

  updateDisplayedPlans(): void {
    const startIndex = (this.ContentP - 1) * this.Contentsize;
    const endIndex = startIndex + this.Contentsize;
    this.displayedPlans = this.subscriptionPlans.slice(startIndex, endIndex);
  }
  //

  onEdit(plan: any) {
    this.editPlan.emit(plan);
  }

  getPlanDetails(): void {
    this.skeletonShow = 'Skelton';

    this.getForm.patchValue({
      loginUserID: this.userId
    })
    this.subscriptionDetailsService.getDetails(this.getForm.value).subscribe((response) => {
      if (response.message === 'Ok') {
        this.subscriptionPlans = response.result;

        this.subscriptionPlans.forEach((plan) => {
          // Assuming plan.featureList is the array containing feature objects
          plan.featureNames = plan.featureList.map((feature: any) => feature.featureName).join(', ');
          if (plan.months === true) {
            plan.billingCycle = 'Monthly';
          } else if (plan.years === true) {
            plan.billingCycle = 'Yearly';
          }
          this.skeletonShow = '';

          // alert(plan.billingCycle)
        });
      } else {
        this.skeletonShow = '';

      }
    });
  }



  ActiveInactiveUserRole(id: number, isActive: boolean) {
    var action = 'activated';
    Swal.fire({
      title: "Confirmation",
      text: isActive ? "Are you sure you want to deactivate the plan ? " : "Are you sure you want to activate the plan?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: isActive ? "Confirm" : "Confirm"
    }).then((result) => {

      if (result.isConfirmed) {
        if (isActive === true) {
          action = 'deactivated';
        }
        this.subscriptionDetailsService.activeInActiveSubscriptionPlansByID(id).subscribe(res => {
          this.toastr.success("Subscription Plan has been " + action + " successfully")
          this.getPlanDetails();
        });
      }

      else {
        // if (this.checkBoxAinA) {
        //   this.checkBoxAinA.nativeElement.checked = isActive;
        // }
        function check() {
          $('#checkBoxAinA' + id).prop("checked", true)
        };
        function uncheck() {
          $('#checkBoxAinA' + id).prop("checked", false)
        }
        isActive ? check() : uncheck();
      }
    })
  }

  refreshData(): void {
    this.getPlanDetails(); // Refresh data
  }

}