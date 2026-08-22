import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { SubscriptionFeaturesService } from '../day-care-management/subscription-plans/subscription-features/subscription-features.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment.development';
import { CommonService } from '../common-component/common.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { SkeletonLoaderComponent } from '../common-component/skeleton-loader/skeleton-loader.component';
import { Console } from 'console';
import { AnyTxtRecord } from 'dns';

@Component({
  selector: 'app-bloomvie-plans',
  standalone: true,
  imports: [
    RouterLink,
    RouterModule,
    RouterOutlet,
    BreadcrumbComponent,
    CommonModule,
    NgxPaginationModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './bloomvie-plans.component.html',
  styleUrl: './bloomvie-plans.component.css',
})
export class BloomviePlansComponent implements OnInit {
  decryptedUserId: any;
  enc_type: any | null;
  constructor(
    private subscriptionFeatureService: SubscriptionFeaturesService,
    private toastrService: ToastrService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private commonservice: CommonService
  ) { }
  public planFeatureList: any[] = [];
  public jobPostTypeFeatureList: any[] = [];
  public storageTypeFeatureList: any[] = [];
  public enrollmentTypeFeatureList: any[] = [];
  public otherFeatureList: any[] = [];
  private encParam: string = '';
  private frontEndWebUrl = environment.frontEndWebUrl;
  public currentPlanId: number = 0;
  ContentPendingList: number = 1;

  // Define variables in your component
  currentPage: number = 1;
  itemsPerPage: number = 3;
  skeletonShow = 'Skelton';
  bloomvieOwerID: any;

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((param) => {
      const enc = param.get('enc');
      const enc_plan = param.get('enc_plan');
      this.enc_type = param.get('enc_type');

      if (enc && enc_plan) {
        const decryptedId = this.commonservice.decrypt(enc_plan);
        this.decryptedUserId = this.commonservice.decrypt(enc);

        this.currentPlanId =
          decryptedId && !isNaN(Number(decryptedId))
            ? parseInt(decryptedId, 10)
            : 0;

        this.encParam = enc;

        this.getBloomvieOwner();
      }
    });
  }

  getPlanList() {
    this.subscriptionFeatureService
      .GetSubscriptionPlanandFeaturesByUserId(this.decryptedUserId, 'renew')
      .subscribe({
        next: (response) => {
          this.planFeatureList = response.result.sort((a: any, b: any) => {
            return a.planeId === this.currentPlanId
              ? -1
              : b.planeId === this.currentPlanId
                ? 1
                : 0;
          });
          this.loadFeatures();
        },
        error: (err) => {
          this.toastrService.error(err.message);
        },
      });
  }

  getBloomvieOwner() {
    this.commonService.getBloomvieOwner().subscribe((data: any) => {
      if (data.message == 'Ok') {
        this.bloomvieOwerID = data.result.id;
        this.getPlanList();
      }
    });
  }

  loadFeatures() {
    this.skeletonShow = 'skeleton';

    var getForm = {
      loginUserID: this.bloomvieOwerID,
    };
    this.subscriptionFeatureService.getFeatures(getForm).subscribe((data) => {
      const features = data.result.filter((feature: any) => feature.isActive);
      features.forEach((feature: any) => {
        if (feature.jobPostType) {
          this.jobPostTypeFeatureList.push(feature);
        } else if (feature.storageType) {
          this.storageTypeFeatureList.push(feature);
        } else if (feature.enrollmentType) {
          this.enrollmentTypeFeatureList.push(feature);
        } else {
          this.otherFeatureList.push(feature);
        }
      });

      this.skeletonShow = '';
    });
    this.skeletonShow = '';
  }

  onBuyPlan(planId: number) {
    const encPlanId = this.commonService.encrypt(planId.toString());
    const daycareType = this.commonService.encrypt('Re-Subscribe');
    const encType = this.commonService.encrypt('expiryType');
    const encNewType = this.commonService.encrypt('encType');

    if (this.enc_type) {
      let params = `Userid=${this.encParam}&daycareType=${encType}&planid=${encPlanId}&enc_expiry=${encType}`;
      window.location.href = this.frontEndWebUrl + 'payment-details?' + params;
    } else {
      let params = `Userid=${this.encParam}&daycareType=${daycareType}&planid=${encPlanId}&enc_type=${encNewType}`;
      window.location.href = this.frontEndWebUrl + 'payment-details?' + params;
    }
  }
}
