import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SubscriptionDetailsComponent } from '../subscription-details/subscription-details.component';
import { SubscriptionFeaturesService } from '../subscription-features/subscription-features.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionPlansService } from './subscription-plans.service';
import { ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { SubscriptionDetailsService } from '../subscription-details/subscription-details.service';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { profile, timeStamp } from 'node:console';
import { ProfileComponent } from '../../../common-component/profile/profile.component';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageStudentService } from '../../student-management/manage-student/manage-student.service';
import { SkeletonLoaderComponent } from '../../../common-component/skeleton-loader/skeleton-loader.component';

declare var $: any;

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [
    SubscriptionDetailsComponent,
    ReactiveFormsModule,
    BreadcrumbComponent,
    ProfileComponent,
    CommonModule,
    NgSelectModule,
    NgxPaginationModule,
    FormsModule,
    NgIf,
    SkeletonLoaderComponent,
  ],
  templateUrl: './subscription-plans.component.html',
  styleUrls: [
    './subscription-plans.component.css',
    '../../../common-component/profile/profile.component.css',
  ],
})
export class SubscriptionPlansComponent implements OnInit {
  selectedStorage: string | null = null;
  features: any[] = [];
  subscriptionFormPlanA: any;
  isEditMode: boolean = false;
  discountPercantageList: any[] = [];
  discountPercantage: any;
  enrollmentFeature: any;
  lastSelectedEnrollmentFeature: any;
  strikeOnEnrollmentType: boolean = false;
  @Output() formSubmitted = new EventEmitter<void>();
  @ViewChild(SubscriptionDetailsComponent) childComponent:
    | SubscriptionDetailsComponent
    | undefined;

  @Output() featureChanged = new EventEmitter<any>();

  @ViewChild(SubscriptionDetailsComponent)
  subscriptionDetailsComponent!: SubscriptionDetailsComponent;
  selectedFeatures: any[] = [];
  currentPage = 1;
  itemsPerPage: number = 6;
  selectedFeaturesFormPlanA: FormGroup;
  userId: any;
  ContentP: number = 1;
  featureIds: any;
  subscriptionPlans: any;
  getForm: any;
  data: any;
  Userplanwithfeaturelist: any[] = [];
  UserRoleId: any;
  IsAlreadyExist: boolean = false;
  availableFeatures: any;
  duration: any;
  page: number = 1;
  totalItemsPerPage: number = 6;
  ContentAcceptedList: any[] = [];
  viewFeatures: any[] = [];
  jobPostFeature: any;
  storageFeature: any;
  lastEnrollmentTypeFeatures: any[] = [];
  jobPostTypeFeatureList: any[] = [];
  storageTypeFeatureList: any[] = [];
  enrollmentTypeFeatureList: any[] = [];
  otherFeatureList: any[] = [];
  viewJobPostFeature: any[] = [];
  viewStorageFeature: any[] = [];
  viewEnrollmentFeature: any[] = [];
  viewOtherFeature: any[] = [];
  durations: any = [];
  pageSize: number = 6;
  lastJobPostFeatures: any[] = [];
  lastStorageTypeFeatures: any[] = [];
  strikeOnJobPostType: boolean = false;
  strikeOnStorageType: boolean = false;
  lastSelectedStorageFeature: any;
  lastSelectedJobPostTypeFeature: any;
  viewDiscount: boolean = false;
  featuresID: any;
  freeTrailPlan: boolean = true;
  jobPostType: boolean = true;
  storageType: boolean = true;
  centreID: number = 0;
  ageGroupList: any[] = [];
  discountValue: number = 0;
  isChecked: boolean = false;
  discounts = [
    { id: 0, value: 0, isChecked: false },
    { id: 0, value: 0, isChecked: false },
    { id: 0, value: 0, isChecked: false },
    { id: 0, value: 0, isChecked: false },
    { id: 0, value: 0, isChecked: false },
  ];
  storedDiscounts: any[] = [];
  isCustomized: boolean = false;
  discountApplicable: boolean = true;
  checkboxDisabled: boolean = true;
  skeletonShow = 'Skelton';

  constructor(
    private subscriptionFeaturesService: SubscriptionFeaturesService,
    private subscriptionPlanService: SubscriptionPlansService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cookie: CookieService,
    private subscriptionDetailsService: SubscriptionDetailsService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private manageStudentService: ManageStudentService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscriptionFormPlanA = this.fb.group({
      ID: 0,
      userRoleID: '',
      planName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z_][a-zA-Z0-9$%()\-_+{}\/\\?'`:.,& ]*$/),
          Validators.maxLength(50),
        ],
      ],

      price: [
        '',
        [Validators.required, Validators.min(0)],
      ],
      featureList: [[], [this.minSelectedFeatures(1)]],
      isActive: null,
      loginUserID: 0,
      Discounts: [null],
      description: [
        '',
        [
          Validators.pattern(/^[a-zA-Z0-9$%()\-_+{}\/\\?'`:.,& ]*$/),
          Validators.maxLength(500),
        ],
      ],

      daily: null,
      monthly: null,
      yearly: null,
      discount: ['0'],
      duration: ['Monthly', Validators.required],
      isJobPostPlan: [null],
      isStorageTypePlan: [null],
      isDefault: [null],
      ageGroupID: [null, Validators.required],
      discountValues: [[]],
    });

    this.selectedFeaturesFormPlanA = this.fb.group({
      selectedFeaturesPlanA: [[]],
    });
    this.getForm = this.fb.group({
      searchText: [''],
      isActive: null,
      loginUserID: this.userId,
    });
  }

  ngOnInit(): void {
    this.storedDiscounts = [];

    // Get references to the checkbox and the target div
    const toggler = document.getElementById('toggler') as HTMLInputElement;
    const dGrider = document.querySelector('.d-grider') as HTMLDivElement;

    // Function to toggle the visibility of .d-grider based on checkbox state
    // function toggleGriderVisibility() {
    //   if (toggler.checked) {
    //     dGrider.style.display = 'block'; // Show .d-grider if checkbox is checked
    //   } else {
    //     dGrider.style.display = 'none'; // Hide .d-grider if checkbox is unchecked
    //   }
    // }

    // Initialize visibility on page load based on checkbox state
    // window.addEventListener('load', toggleGriderVisibility);

    this.userId = this.cookie.get('UserId');
    this.centreID = parseInt(this.cookie.get('CentreID'))
      ? parseInt(this.cookie.get('CentreID'))
      : 0;
    const UserInfo = this.cookie.get('UserInfo');
    if (UserInfo) {
      const parsedInfo = JSON.parse(UserInfo);
      this.UserRoleId = parsedInfo.result.userRoleID;
    }
    this.loadFeatures();

    this.GetSubscriptionPlanandFeatures();
    this.setDurationArray();
    for (let i = 1; i < 100; i++) {
      this.discountPercantageList.push({
        label: `${i} %`,
        value: i,
      });
    }
    this.getAgeGroups();
  }

  setDurationArray() {
    // if(this.UserRoleId == 1){
    //   return this.durations.filter(
    //     option => option.label === 'Monthly' || option.label === 'Yearly'
    //   );
    // }else if(this.UserRoleId == 3){
    //    return this.durations;
    // }
    // return [];

    if (this.UserRoleId == 1) {
      this.durations = [
        { label: 'Monthly', value: 1 },
        { label: 'Yearly', value: 2 },
      ];
    } else if (this.UserRoleId == 3) {
      this.durations = [
        { label: 'Daily', value: 1 },
        //{ label: 'Weekly', value: 2 },
        { label: 'Monthly', value: 2 },
        { label: 'Yearly', value: 3 },
      ];
    } else {
      this.durations = [];
    }
  }

  getFeatures() {
    this.storedDiscounts = [];
    this.spinner.show();
    this.storageType = true;
    this.jobPostType = true;
    this.freeTrailPlan = true;
    this.jobPostTypeFeatureList = this.jobPostTypeFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: true,
      };
    });
    this.viewDiscount = false;
    this.subscriptionFormPlanA.get('isStorageTypePlan')?.enable();
    this.subscriptionFormPlanA.get('isJobPostPlan')?.enable();
    this.subscriptionFormPlanA.get('isDefault')?.enable();
    this.loadFeatures();
    this.discounts.forEach((discount) => {
      discount.value = 0;
      discount.isChecked = false;
    });
    $('#exampleModal1').modal('show');
    setTimeout(() => {
      this.spinner.hide();
    }, 100);
  }

  loadFeatures() {
    this.getForm.patchValue({
      loginUserID: this.userId,
    });
    this.subscriptionFeaturesService
      .getFeatures(this.getForm.value)
      .subscribe((data) => {
        this.features = data.result.filter((feature: any) => feature.isActive);
        this.viewFeatures = this.features;

        this.jobPostTypeFeatureList = this.features.filter(
          (feature: any) => feature.jobPostType == true
        );

        this.viewJobPostFeature = this.jobPostTypeFeatureList;

        this.storageTypeFeatureList = this.features.filter(
          (feature: any) => feature.storageType == true
        );
        this.viewStorageFeature = this.storageTypeFeatureList;

        this.enrollmentTypeFeatureList = this.features.filter(
          (feature: any) => feature.enrollmentType == true
        );
        this.viewEnrollmentFeature = this.enrollmentTypeFeatureList;

        this.otherFeatureList = this.features.filter(
          (feature: any) =>
            !feature.enrollmentType &&
            !feature.storageType &&
            !feature.jobPostType
        );
        this.viewOtherFeature = this.otherFeatureList;
      });
  }

  GetSubscriptionPlanandFeatures() {
    this.skeletonShow = 'Skelton';
    this.subscriptionFeaturesService
      .GetSubscriptionPlanandFeaturesByUserId(this.userId, 'plans')
      .subscribe((data) => {

        if (data.message === 'OK') {
          this.Userplanwithfeaturelist = data.result;
          // this.Userplanwithfeaturelist.forEach((item) => {
          //   if (item?.price != null) {
          //     const costNum = Number(item.price);
          //     item.price = costNum
          //       .toLocaleString('en-CA', {
          //         minimumFractionDigits: 2,
          //         maximumFractionDigits: 2,
          //       })
          //       .replace(/,/g, '');
          //   }
          // });

          //updated on 22/08/25
          this.Userplanwithfeaturelist.forEach((item) => {
            if (item?.price != null) {
              const costNum = Number(item.price);
              item.price = costNum.toLocaleString('en-CA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            }
          });

          // this.spinner.hide();

          this.skeletonShow = '';

          this.IsAlreadyExist = true;
        } else {
          this.IsAlreadyExist = false;
          this.skeletonShow = '';
        }
      });
  }

  getPlanType(event: any) {
    this.subscriptionFormPlanA.patchValue({
      discount: '0',
    });

    if (event.target.value == 'Default') {
      this.viewDiscount = false;
    } else {
      this.viewDiscount = true;
    }
  }

  async PlanAlreadyAssigned(PlanID: number) {
    let response = await this.subscriptionPlanService
      .PlanAlreadyAssignedOrNot(PlanID)
      .toPromise();
    return response.success;
  }

  async UpdatePlanModal(plan: any) {
    this.spinner.show();
    const IsPlanAreadyExists = await this.PlanAlreadyAssigned(plan.planId);
    if (IsPlanAreadyExists == true) {
      this.spinner.hide();
      this.updateInformation(plan);
    } else {
      this.spinner.hide();
      this.toastr.warning(
        'No action taken: This plan has already been allocated'
      );
    }
  }

  updateInformation(plan: any) {
    this.storedDiscounts = [];
    this.discounts = [
      { id: 0, value: 0, isChecked: false },
      { id: 0, value: 0, isChecked: false },
      { id: 0, value: 0, isChecked: false },
      { id: 0, value: 0, isChecked: false },
      { id: 0, value: 0, isChecked: false },
    ];
    const selectedPlanID = plan.planId;
    this.isEditMode = true;
    this.subscriptionFormPlanA.patchValue({
      ID: plan.planId,
      planName: plan.planName,
      price: plan.price,
      featureList: plan.featureIds, // Bind featureIds
      userRoleID: plan.userRoleId,
      loginUserID: this.userId,
      isActive: plan.isActive,
      description: plan.description,
      daily: plan.daily,
      monthly: plan.monthly,
      yearly: plan.yearly,
      duration: plan.duration,
      discount: plan.discount,
      isJobPostPlan: plan.planOwnerID === 3 ? true : false,
      isStorageTypePlan: plan.planOwnerID === 4 ? true : false,
      isDefault: plan.isDefault == true ? true : false,
      discountValues: this.storedDiscounts,
      ageGroupID: plan.ageGroupID,
    });

    this.storageType =
      plan.planOwnerID != 3 && plan.isDefault != true && plan.planOwnerID == 4
        ? true
        : false;
    this.jobPostType =
      plan.planOwnerID != 4 && plan.isDefault != true && plan.planOwnerID == 3
        ? true
        : false;
    this.freeTrailPlan =
      plan.planOwnerID != 3 && plan.planOwnerID != 4 && plan.isDefault == true
        ? true
        : false;

    this.enrollmentTypeFeatureList = this.enrollmentTypeFeatureList.map(
      (en) => {
        return {
          ...en,
          isDisabled:
            this.jobPostType == true || this.storageType == true ? true : false,
        };
      }
    );

    this.storageTypeFeatureList = this.storageTypeFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: this.jobPostType == true ? true : false,
      };
    });

    this.jobPostTypeFeatureList = this.jobPostTypeFeatureList.map((f) => {
      return {
        ...f,
        isDisabled:
          this.storageType == true || this.freeTrailPlan == true ? true : false,
      };
    });

    this.otherFeatureList = this.otherFeatureList.map((f) => {
      return {
        ...f,
        isDisabled:
          this.storageType == true || this.jobPostType == true ? true : false,
      };
    });

    // disable the option at the time of edit
    if (this.storageType == true) {
      this.subscriptionFormPlanA.get('isStorageTypePlan')?.disable();
    } else if (this.jobPostType == true) {
      this.subscriptionFormPlanA.get('isJobPostPlan')?.disable();
    } else {
      this.subscriptionFormPlanA.get('isDefault')?.disable();
    }

    if (
      this.storageType == false &&
      this.jobPostType == false &&
      this.freeTrailPlan == false
    ) {
      this.disableOtherPlansFeaturesInCaseOfUpdate(plan);
    }

    this.disableTheRecordOnTheCaseOfUpdate(plan);

    if (plan.discount > 0) {
      this.viewDiscount = true;
    } else {
      this.viewDiscount = false;
    }
    this.discounts.forEach((discount) => {
      discount.value = 0;
      discount.isChecked = false;
    });
    const selectedPlan = this.Userplanwithfeaturelist.find(
      (plan) => plan.planId === selectedPlanID
    );

    selectedPlan.discountPlan.forEach((plan: any, index: any) => {
      if (this.discounts[index]) {
        this.discounts[index].id = plan.id;
        this.discounts[index].value = plan.discount;
        this.discounts[index].isChecked = plan.isActive;
        this.storedDiscounts.push(this.discounts[index]);
      }
    });

    $('#exampleModal1').modal('show');
  }

  disableOtherPlansFeaturesInCaseOfUpdate(plan: any) {
    // for storage type feature
    this.lastStorageTypeFeatures = this.storageTypeFeatureList.filter(
      (res: any) => res.storageType && !plan.featureIds.includes(res.id)
    );
    this.storageTypeFeatureList = this.storageTypeFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: !plan.featureIds.includes(f.id) ? true : false,
      };
    });

    // for job post type feature
    this.lastJobPostFeatures = this.jobPostTypeFeatureList.filter(
      (res: any) => res.jobPostType && !plan.featureIds.includes(res.id)
    );

    this.jobPostTypeFeatureList = this.jobPostTypeFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: !plan.featureIds.includes(f.id) ? true : false,
      };
    });

    // for enrollment type feature

    this.lastEnrollmentTypeFeatures = this.enrollmentTypeFeatureList.filter(
      (res: any) => res.enrollmentType && !plan.featureIds.includes(res.id)
    );

    this.enrollmentTypeFeatureList = this.enrollmentTypeFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: !plan.featureIds.includes(f.id) ? true : false,
      };
    });
  }

  disableTheRecordOnTheCaseOfUpdate(plan: any) {
    if (this.storageType == true) {
      this.lastStorageTypeFeatures = this.storageTypeFeatureList.filter(
        (res: any) => res.storageType && !plan.featureIds.includes(res.id)
      );
      this.storageTypeFeatureList = this.storageTypeFeatureList.map((f) => {
        return {
          ...f,
          isDisabled:
            !plan.featureIds.includes(f.id) &&
              (this.storageType == true || this.freeTrailPlan == true)
              ? true
              : false,
        };
      });
    } else if (this.jobPostType == true) {
      this.lastJobPostFeatures = this.jobPostTypeFeatureList.filter(
        (res: any) => res.jobPostType && !plan.featureIds.includes(res.id)
      );

      this.jobPostTypeFeatureList = this.jobPostTypeFeatureList.map((f) => {
        return {
          ...f,
          isDisabled:
            !plan.featureIds.includes(f.id) &&
              (this.jobPostType == true || this.freeTrailPlan == true)
              ? true
              : false,
        };
      });
    }
  }

  displayOnlyStorageFeature(event: any) {
    this.jobPostType = event.target.checked == true ? false : true;
    this.freeTrailPlan = event.target.checked == true ? false : true;
    this.discountApplicable = !event.target.checked;

    this.enrollmentTypeFeatureList = this.enrollmentTypeFeatureList.map(
      (en) => {
        return {
          ...en,
          isDisabled: event.target.checked == true ? true : false,
        };
      }
    );

    this.jobPostTypeFeatureList = this.jobPostTypeFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: event.target.checked == true ? true : false,
      };
    });

    this.otherFeatureList = this.otherFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: event.target.checked == true ? true : false,
      };
    });
  }

  displayJobPostFeaturesList(event: any) {
    // isha test
    let checked = event.target.checked;

    this.storageType = event.target.checked == true ? false : true;
    this.jobPostType = event.target.checked == true ? false : true;

    this.subscriptionFormPlanA.patchValue({
      price: 0.0,
    });

    this.discountApplicable = !checked;
    this.jobPostTypeFeatureList = this.jobPostTypeFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: checked == true ? true : false,
      };
    });
  }

  displayOnlyJobPostFeature(event: any) {
    let checked = event.target.checked;

    this.storageType = event.target.checked == true ? false : true;
    this.freeTrailPlan = event.target.checked == true ? false : true;
    this.discountApplicable = !checked;

    this.enrollmentTypeFeatureList = this.enrollmentTypeFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: checked == true ? true : false,
      };
    });

    this.storageTypeFeatureList = this.storageTypeFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: checked == true ? true : false,
      };
    });

    this.otherFeatureList = this.otherFeatureList.map((f) => {
      return {
        ...f,
        isDisabled: event.target.checked == true ? true : false,
      };
    });
  }

  filteringFeatureType_Old(feature: any, index: number) {
    if (feature.jobPostType !== undefined && feature.jobPostType == true) {
      if (feature.jobPostType == true) {
        this.jobPostFeature = feature;
        this.lastJobPostFeatures = this.features.filter(
          (res: any) => res.jobPostType && res.id != feature.id
        );

        //this.features = this.features.filter((res: any) => !res.jobPostType); // for hiding leftover jobPostType feature

        // this.features.splice(index, 0, feature);

        this.features = this.features.map((f) => {
          const jobPostType = this.lastJobPostFeatures.find(
            (jF) => jF.id == f.id
          );

          return {
            ...f,
            isDisabled: jobPostType !== undefined ? true : false,
          };
        });

        this.strikeOnJobPostType = true;
        this.lastSelectedJobPostTypeFeature = feature.id;

        if (this.strikeOnStorageType == true) {
          this.lastStorageTypeFeatures = this.features.filter(
            (res: any) => res.storageType && res.id != feature.id
          );

          this.features = this.features.map((f) => {
            const storageType = this.lastStorageTypeFeatures.find(
              (jF) => jF.id == f.id && jF.id != this.lastSelectedStorageFeature
            );
            return {
              ...f,
              isDisabled: storageType !== undefined ? true : f.isDisabled,
            };
          });

          let x = 10;
        }
      }
    } else if (
      feature.storageType !== undefined &&
      feature.storageType == true
    ) {
      if (feature.storageType == true) {
        this.storageFeature = feature;
        this.lastStorageTypeFeatures = this.features.filter(
          (res: any) => res.storageType && res.id != feature.id
        );
        // this.features = this.features.filter((res: any) => !res.storageType); // for hiding leftover storageType feature

        //this.features.splice(index, 0, feature);

        this.features = this.features.map((f) => {
          const storageType = this.lastStorageTypeFeatures.find(
            (jF) => jF.id == f.id
          );
          return {
            ...f,
            isDisabled: storageType !== undefined ? true : false,
          };
        });

        this.strikeOnStorageType = true;
        this.lastSelectedStorageFeature = feature.id;
        if (this.strikeOnJobPostType == true) {
          this.lastJobPostFeatures = this.features.filter(
            (res: any) => res.jobPostType && res.id != feature.id
          );

          this.features = this.features.map((f) => {
            const jobTypeFeatures = this.lastJobPostFeatures.find(
              (jF) =>
                jF.id == f.id && jF.id != this.lastSelectedJobPostTypeFeature
            );
            return {
              ...f,
              isDisabled: jobTypeFeatures !== undefined ? true : f.isDisabled,
            };
          });

          let x = 10;
        }
      }
    }
  }

  updateSelectedFeaturesPlanA_Old(
    featureId: number,
    event: any,
    feature?: any,
    index?: any
  ) {
    const featureList =
      this.subscriptionFormPlanA.get('featureList')?.value || [];
    if (event.target.checked) {
      if (feature.jobPostType == true || feature.storageType == true) {
        //this.loadFeatures(feature, index);
        this.filteringFeatureType(feature, index);
      }
      this.subscriptionFormPlanA.patchValue({
        featureList: [...featureList, featureId],
      });
    } else {
      if (feature.jobPostType == true) {
        this.features = this.features.map((f) => {
          const jobPostTypeFeature = this.lastJobPostFeatures.find(
            (fea) => fea.id == f.id
          );
          return {
            ...f,
            isDisabled: jobPostTypeFeature ? false : f.isDisabled,
          };
        });
        this.strikeOnJobPostType = false;
        this.lastSelectedJobPostTypeFeature = null;
      } else if (feature.storageType == true) {
        this.features = this.features.map((f) => {
          const storageTypeFeature = this.lastStorageTypeFeatures.find(
            (fea) => fea.id == f.id
          );
          return {
            ...f,
            isDisabled: storageTypeFeature ? false : f.isDisabled,
          };
        });

        this.strikeOnStorageType = false;
        this.lastSelectedStorageFeature = null;
      }

      this.subscriptionFormPlanA.patchValue({
        featureList: featureList.filter((id: number) => id !== featureId),
      });
    }
  }

  // new one

  filteringFeatureType(feature: any, index: number) {
    if (feature.jobPostType !== undefined && feature.jobPostType == true) {
      if (feature.jobPostType == true) {
        this.jobPostFeature = feature;
        this.lastJobPostFeatures = this.jobPostTypeFeatureList.filter(
          (res: any) => res.jobPostType && res.id != feature.id
        );
        this.jobPostTypeFeatureList = this.jobPostTypeFeatureList.map((f) => {
          const jobPostType = this.lastJobPostFeatures.find(
            (jF) => jF.id == f.id
          );

          return {
            ...f,
            isDisabled: jobPostType !== undefined ? true : false,
          };
        });

        this.strikeOnJobPostType = true;
        this.lastSelectedJobPostTypeFeature = feature.id;

        if (this.strikeOnStorageType == true) {
          this.lastStorageTypeFeatures = this.storageTypeFeatureList.filter(
            (res: any) => res.storageType && res.id != feature.id
          );

          this.storageTypeFeatureList = this.storageTypeFeatureList.map((f) => {
            const storageType = this.lastStorageTypeFeatures.find(
              (jF) => jF.id == f.id && jF.id != this.lastSelectedStorageFeature
            );
            return {
              ...f,
              isDisabled: storageType !== undefined ? true : f.isDisabled,
            };
          });

          let x = 10;
        }
      }
    } else if (
      feature.storageType !== undefined &&
      feature.storageType == true
    ) {
      if (feature.storageType == true) {
        this.storageFeature = feature;
        this.lastStorageTypeFeatures = this.storageTypeFeatureList.filter(
          (res: any) => res.storageType && res.id != feature.id
        );
        // this.features = this.features.filter((res: any) => !res.storageType); // for hiding leftover storageType feature

        //this.features.splice(index, 0, feature);

        this.storageTypeFeatureList = this.storageTypeFeatureList.map((f) => {
          const storageType = this.lastStorageTypeFeatures.find(
            (jF) => jF.id == f.id
          );
          return {
            ...f,
            isDisabled: storageType !== undefined ? true : false,
          };
        });

        this.strikeOnStorageType = true;
        this.lastSelectedStorageFeature = feature.id;
        if (this.strikeOnJobPostType == true) {
          this.lastJobPostFeatures = this.jobPostTypeFeatureList.filter(
            (res: any) => res.jobPostType && res.id != feature.id
          );

          this.jobPostTypeFeatureList = this.jobPostTypeFeatureList.map((f) => {
            const jobTypeFeatures = this.lastJobPostFeatures.find(
              (jF) =>
                jF.id == f.id && jF.id != this.lastSelectedJobPostTypeFeature
            );
            return {
              ...f,
              isDisabled: jobTypeFeatures !== undefined ? true : f.isDisabled,
            };
          });

          let x = 10;
        }
      }
    } else if (
      feature.enrollmentType !== undefined &&
      feature.enrollmentType == true
    ) {
      if (feature.enrollmentType == true) {
        this.enrollmentFeature = feature;
        this.lastEnrollmentTypeFeatures = this.enrollmentTypeFeatureList.filter(
          (res: any) => res.enrollmentType && res.id != feature.id
        );
        // this.features = this.features.filter((res: any) => !res.storageType); // for hiding leftover storageType feature

        //this.features.splice(index, 0, feature);

        this.enrollmentTypeFeatureList = this.enrollmentTypeFeatureList.map(
          (f) => {
            const enrollmentType = this.lastEnrollmentTypeFeatures.find(
              (jF) => jF.id == f.id
            );
            return {
              ...f,
              isDisabled: enrollmentType !== undefined ? true : false,
            };
          }
        );

        this.strikeOnEnrollmentType = true;
        this.lastSelectedEnrollmentFeature = feature.id;
        // if (this.strikeOnJobPostType == true) {
        //   this.lastJobPostFeatures = this.features.filter(
        //     (res: any) => res.jobPostType && res.id != feature.id
        //   );

        //   this.features = this.features.map((f) => {
        //     const jobTypeFeatures = this.lastJobPostFeatures.find(
        //       (jF) =>
        //         jF.id == f.id && jF.id != this.lastSelectedJobPostTypeFeature
        //     );
        //     return {
        //       ...f,
        //       isDisabled: jobTypeFeatures !== undefined ? true : f.isDisabled,
        //     };
        //   });

        //   let x = 10;
        // }
      }
    }
  }

  updateSelectedFeaturesPlanA(
    featureId: number,
    event: any,
    feature?: any,
    index?: any
  ) {
    this.featuresID = featureId;

    const featureList =
      this.subscriptionFormPlanA.get('featureList')?.value || [];
    if (event.target.checked) {
      if (
        feature.jobPostType == true ||
        feature.storageType == true ||
        feature.enrollmentType == true
      ) {
        //this.loadFeatures(feature, index);
        this.filteringFeatureType(feature, index);
      }
      this.subscriptionFormPlanA.patchValue({
        featureList: [...featureList, featureId],
      });
    } else {
      if (feature.jobPostType == true) {
        this.jobPostTypeFeatureList = this.jobPostTypeFeatureList.map((f) => {
          const jobPostTypeFeature = this.lastJobPostFeatures.find(
            (fea) => fea.id == f.id
          );
          return {
            ...f,
            isDisabled: jobPostTypeFeature ? false : f.isDisabled,
          };
        });
        this.strikeOnJobPostType = false;
        this.lastSelectedJobPostTypeFeature = null;
      } else if (feature.storageType == true) {
        this.storageTypeFeatureList = this.storageTypeFeatureList.map((f) => {
          const storageTypeFeature = this.lastStorageTypeFeatures.find(
            (fea) => fea.id == f.id
          );
          return {
            ...f,
            isDisabled: storageTypeFeature ? false : f.isDisabled,
          };
        });

        this.strikeOnStorageType = false;
        this.lastSelectedStorageFeature = null;
      } else if (feature.enrollmentType == true) {
        this.enrollmentTypeFeatureList = this.enrollmentTypeFeatureList.map(
          (f) => {
            const enrollmentTypeFeature = this.lastEnrollmentTypeFeatures.find(
              (fea) => fea.id == f.id
            );
            return {
              ...f,
              isDisabled: enrollmentTypeFeature ? false : f.isDisabled,
            };
          }
        );

        this.strikeOnEnrollmentType = false;
        this.lastSelectedEnrollmentFeature = null;
      }

      this.subscriptionFormPlanA.patchValue({
        featureList: featureList.filter((id: number) => id !== featureId),
      });
    }
  }

  // end here

  onSubmit() {
    if (this.UserRoleId == 1) {
      // TODO: (Billing) Yearly plans are currently disabled. This forcefully overrides the Super Admin's "Yearly" UI selection back to "Monthly". Needs to be removed once Yearly payment processing is fully supported.
      this.subscriptionFormPlanA.patchValue({
        duration: 'Monthly',
        discountValues: this.storedDiscounts,
      });
    }
    if (
      this.subscriptionFormPlanA.value.featureList == null ||
      this.subscriptionFormPlanA.value.featureList.length === 0
    ) {
      this.toastr.warning('Please Add Plan Features');
    }

    if (this.UserRoleId == 1) {
      this.subscriptionFormPlanA.get('ageGroupID').clearValidators();
      this.subscriptionFormPlanA.get('ageGroupID')?.updateValueAndValidity();
    }
    if (this.subscriptionFormPlanA.valid) {
      this.updateSelectedFeatures();
      const combinedPlansList: any[] = [];

      if (this.subscriptionFormPlanA.valid) {
        combinedPlansList.push(
          this.createSubscriptionPlan(this.subscriptionFormPlanA.value)
        );
      }
      this.spinner.show();

      if (this.UserRoleId == 1) {
        combinedPlansList.forEach((result: any) => {
          if (
            this.subscriptionFormPlanA.value.isDefault == true ||
            this.subscriptionFormPlanA.value.isStorageTypePlan == true
          ) {
            this.subscriptionPlanService
              .manageSubscription(combinedPlansList)
              .subscribe(
                (data) => {
                  this.spinner.hide();

                  if (data.message === 'Ok') {
                    if (data.token === 'Update') {
                      this.toastr.success('Plan Updated Successfully');
                      Swal.fire({
                        title: 'Plan Updated!',
                        text: 'Your plan has been successfully updated.',
                        icon: 'info',
                        confirmButtonText: 'OK',
                      }).then(() => {
                        $('#exampleModal1').modal('hide');
                        this.GetSubscriptionPlanandFeatures();
                        this.reset();
                      });
                    } else {
                      this.toastr.success('Plan Added  Successfully');
                      $('#exampleModal1').modal('hide');
                      this.GetSubscriptionPlanandFeatures();
                      this.reset();
                    }
                  } else {
                    this.toastr.error(data.message);
                  }
                },
                (error) => {
                  this.spinner.hide();
                  this.toastr.error('Error processing subscription plans');
                }
              );
          } else {
            this.subscriptionPlanService
              .CheckJobPostFeatureExists(result.FeatureList, this.UserRoleId)
              .subscribe((res: any) => {
                if (res.result == true) {
                  this.subscriptionPlanService
                    .manageSubscription(combinedPlansList)
                    .subscribe(
                      (data) => {
                        this.spinner.hide();

                        if (data.message === 'Ok') {
                          if (data.token === 'Update') {
                            this.toastr.success('Plan Updated Successfully');
                            Swal.fire({
                              title: 'Plan Updated!',
                              text: 'Your plan has been successfully updated.',
                              icon: 'info',
                              confirmButtonText: 'OK',
                            }).then(() => {
                              $('#exampleModal1').modal('hide');
                              this.GetSubscriptionPlanandFeatures();
                              this.reset();
                            });
                          } else {
                            this.toastr.success('Plan Added  Successfully');
                            $('#exampleModal1').modal('hide');
                            this.GetSubscriptionPlanandFeatures();
                            this.reset();
                          }
                        } else {
                          this.toastr.error(data.message);
                        }
                      },
                      (error) => {
                        this.spinner.hide();
                        this.toastr.error(
                          'Error processing subscription plans'
                        );
                      }
                    );
                }
                else {
                  this.spinner.hide();
                  // this.toastr.error('Plan does not contain the job post feature or studentEnrollment');
                  if (this.UserRoleId == 1) {
                    this.toastr.warning(res.message);
                  }
                  else {
                    this.toastr.error('Plan does not contain the job post feature or studentEnrollment');
                  }
                }
              });
          }
        });
      } else {
        this.subscriptionPlanService
          .manageSubscription(combinedPlansList)
          .subscribe(
            (data) => {
              this.spinner.hide();

              if (data.message === 'Ok') {
                if (data.token === 'Update') {
                  this.toastr.success(
                    'Subscription plans updated successfully'
                  );
                  Swal.fire({
                    title: 'Plan Updated!',
                    text: 'Your plan has been successfully updated.',
                    icon: 'info',
                    confirmButtonText: 'OK',
                  }).then(() => {
                    $('#exampleModal1').modal('hide');
                    this.GetSubscriptionPlanandFeatures();
                    this.reset();
                  });
                } else {
                  this.toastr.success(
                    'Subscription plans created successfully'
                  );
                  $('#exampleModal1').modal('hide');
                  this.GetSubscriptionPlanandFeatures();
                  this.reset();
                  let result = data.result;
                  if (result.planAdd == null || result.featureAdd != null) {
                    this.router.navigate(['/subscription-plans']).then(() => {
                      Swal.fire({
                        title: 'Plan Added!',
                        text: 'Your plan has been added successfully. Enroll a new student now!',
                        icon: 'success',
                        confirmButtonText: 'Enroll Student',
                        showCancelButton: true,
                        cancelButtonText: 'Maybe Later',
                      }).then((result) => {
                        if (result.isConfirmed) {
                          $('#exampleModal1').modal('hide');
                          this.router.navigate(['/student-enrollment']);
                        } else {
                          $('#exampleModal1').modal('hide');
                        }
                      });
                    });
                  }
                }
              } else {
                this.toastr.error(data.message);
              }
            },
            (error) => {
              this.spinner.hide();
              this.toastr.error('Error processing subscription plans');
            }
          );
      }
    } else {
      this.toastr.error('Please fill in all required fields correctly to save the plan.');
      this.subscriptionFormPlanA.markAllAsTouched();
      this.spinner.hide();
    }
  }

  private createSubscriptionPlan(formValue: any) {
    return {
      ID: formValue.ID || 0,
      UserRoleID: this.UserRoleId,
      PlanName: formValue.planName || '',
      Price: formValue.price || 0,
      FeatureList: this.createFeatureList(formValue.featureList),
      loginUserID: this.userId,
      discount: formValue.discount,
      description: formValue.description,
      daily: formValue.duration == 'Daily' ? true : false,
      monthly: formValue.duration == 'Monthly' ? true : false,
      yearly: formValue.duration == 'Yearly' ? true : false,
      isJobPostPlan: formValue.isJobPostPlan === true ? true : false,
      planCount: this.Userplanwithfeaturelist.length,
      isDefault: formValue.isDefault == true ? true : false,
      isStorageTypePlan: formValue.isStorageTypePlan == true ? true : false,
      ageGroupID: formValue.ageGroupID,
      discountValues: formValue.discountValues,
    };
  }

  private createFeatureList(selectedFeatureIds: any[]): any[] {
    return selectedFeatureIds.map((featureId) => {
      return {
        ID: featureId,
      };
    });
  }

  updateSelectedFeatures() {
    this.selectedFeaturesFormPlanA.patchValue({
      selectedFeaturesPlanA: this.subscriptionFormPlanA.value.featureList,
    });
  }

  updateFormValues(form: FormGroup) {
    form.patchValue({
      loginUserID: this.userId,
      id: form.value.id > 0 ? form.value.id : 0,
      userRoleID: this.userId == 1 ? 3 : 5,
    });

    const featureListArray = form.value.featureList || this.featureIds;
    const featureList = featureListArray
      .map((feature: { id: any }) => {
        return feature && typeof feature.id === 'number'
          ? { id: feature.id }
          : null;
      })
      .filter((feature: null) => feature !== null);

    form.patchValue({ featureList });
  }

  handleResponsePlanA(data: any) {
    if (data.message === 'Ok') {
      this.isEditMode = false;
      this.reset();
      this.selectedFeaturesFormPlanA.reset({
        selectedFeaturesPlanA: [],
      });
      this.formSubmitted.emit();
      this.childComponent?.refreshData();
    } else {
      this.subscriptionFormPlanA.markAllAsTouched();
    }
  }

  cancel() {
    this.discounts.forEach((discount) => {
      discount.value = 0;
      discount.isChecked = false;
    });
    this.isEditMode = false;
    this.reset();
    this.selectedFeaturesFormPlanA.reset({
      selectedFeaturesPlanA: [],
    });
    this.loadFeatures();
    $('#exampleModal1').modal('hide');
  }

  reset() {
    this.strikeOnEnrollmentType = false;
    this.strikeOnJobPostType = false;
    this.strikeOnStorageType = false;
    this.storedDiscounts = [];
    this.subscriptionFormPlanA.reset({
      ID: 0,
      userRoleID: '',
      planName: '',
      description: '',
      price: '',
      featureList: [],
      Discounts: null,
      isDefault: null,
      ageGroupID: null,
      discountValues: [],
      loginUserID: 0,
      isActive: null,
      duration: 'Monthly',
      discount: '0',
      daily: null,
      monthly: null,
      yearly: null,
      isJobPostPlan: null,
      isStorageTypePlan: null
    });
    this.isEditMode = false;
  }
  validateNumber(event: any) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);

    if (value < 0) {
      this.subscriptionFormPlanA.patchValue({
        price: null,
      });
    }
  }

  validateNumberInput(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    // || value.length >= 6
    if (!/^\d+$/.test(event.key)) {
      event.preventDefault();
    }
  }

  minSelectedFeatures(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedFeatures = control.value || [];
      return selectedFeatures.length >= min
        ? null
        : { minSelectedFeatures: true };
    };
  }

  ActiveInactivePlan(planeId: number, isActive: any) {
    var action = 'Activated';
    Swal.fire({
      title: 'Confirmation',
      text: isActive
        ? 'Are you sure you want to deactivate the subscription plan?'
        : 'Are you sure you want to activate the subscription plan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: isActive ? 'Confirm' : 'Confirm',
    }).then((result) => {
      if (result.isConfirmed) {
        if (isActive == true) {
          action = 'Deactivated';
        }
        this.subscriptionPlanService
          .activeInActiveSubscriptionPlansByID(planeId)
          .subscribe((data) => {
            if (data.message == 'OK') {
              this.toastr.success(
                'Subscription Plan has been ' + action + ' successfully'
              );
              this.GetSubscriptionPlanandFeatures();
            } else {
              this.toastr.error(data.message);
            }
          });
      } else {
        function check() {
          $('#vehicleA' + planeId).prop('checked', true);
        }
        function uncheck() {
          $('#vehicleA' + planeId).prop('checked', false);
        }
        isActive ? check() : uncheck();
      }
    });
  }

  goToSubscriptionFeatures() {
    $('#exampleModal1').modal('hide');
    setTimeout(() => {
      this.router.navigate(['/subscription-features']);
    }, 300);
  }

  close() {
    this.isEditMode = false;
    this.reset();
    this.selectedFeaturesFormPlanA.reset({
      selectedFeaturesPlanA: [],
    });
    this.subscriptionFormPlanA.patchValue({
      duration: 'Monthly',
    });
  }

  onPageChange(page: number) {
    this.page = page;
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.ContentAcceptedList = this.Userplanwithfeaturelist.slice(
      startIndex,
      endIndex
    );
    // window.scrollTo(0,2);
  }

  getAgeGroups() {
    // this.spinner.show();
    this.manageStudentService.GetAllAgeGroup(this.centreID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.ageGroupList = response.result;
          // this.ageGroupList = this.ageGroupList.map(item => ({ id: item.id, name: item.ageGroupTitle + " " + "(" + item.minAge + "-" + item.maxAge + ")" }));
          this.ageGroupList = this.ageGroupList.map((item) => ({
            id: item.id,
            //name: `(${item.minAge}-${item.maxAge} ) Months`,

            //Added on 25/04/25
            name: `${item.minAge} - ${item.maxAge} ${item.isMonthly ? 'Month' : 'Year'
              } (${item.isMonthly
                ? this.convertMonthToYear(item.minAge) +
                ' - ' +
                this.convertMonthToYear(item.maxAge) +
                ' Year'
                : this.convertYearToMonth(item.minAge) +
                ' - ' +
                this.convertYearToMonth(item.maxAge) +
                ' Month'
              })`,
          }));
        }
        // setTimeout(() => {
        //   this.spinner.hide();
        // }, 300);
      },
      error: (err) => {
        this.toastr.error(err.message);
        // this.spinner.hide();
      },
    });
  }

  convertYearToMonth(year: number): number {
    return year * 12;
  }

  convertMonthToYear(month: number): number {
    return parseFloat((month / 12).toFixed(1));
  }

  validatingNumberFormat(value: number, index: number) {
    if (isNaN(value) || value < 0 || value > 100 || value == null) {
      this.discounts[index].value = 0;
      this.discounts[index].isChecked = false;
      this.toastr.error('Invalid Amount ');
    } else {
      this.checkboxDisabled = false;
    }
  }

  validateInput(value: number, i: number) {
    if (isNaN(value) || value <= 0) {
      if (this.discounts[i].isChecked) {
        this.toastr.error(
          'Please enter a valid discount before checking the box.'
        );
        this.discounts[i].isChecked = false;
        this.cdr.detectChanges();
      }
      return;
    }

    const isDuplicateInDiscounts = this.discounts.find(
      (item: any, index: number) =>
        item.value == value && index != i && value != 0
    );

    if (isDuplicateInDiscounts) {
      this.discounts[i].value = 0;
      this.discounts[i].isChecked = false;
      this.toastr.error('Duplicate Value!');
      return;
    }

    if (this.discounts[i].isChecked) {
      const alreadyStored = this.storedDiscounts.some((d) => d.value === value);
      if (alreadyStored) {
        this.toastr.error('Discount already stored!');
        this.discounts[i].isChecked = false;
        return;
      }
      this.storedDiscounts.push(this.discounts[i]);
    } else {
      const indexInStored = this.storedDiscounts.findIndex(
        (d) => d === this.discounts[i]
      );
      if (indexInStored !== -1) {
        this.storedDiscounts.splice(indexInStored, 1);
      }
    }
  }

  // input Validators

  onInputValidation(event: Event, type: any): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    let value = input.value;

    if (type === 'planName') {
      value = value.replace(/[^a-zA-Z0-9$%()\-_+{}\/\\?'`:.,& ]/g, '');
      value = value.replace(/^[0-9]+/, '');
      value = value.substring(0, 50);
    }

    if (type === 'description') {
      value = value.replace(/[^a-zA-Z0-9$%()\-_+{}\/\\?'`:.,& ]/g, '');
      value = value.replace(/^[0-9]+/, '');
      value = value.substring(0, 500);
    }

    input.value = value;
    const controlName = type === 'planName' ? 'planName' : 'description';
    this.subscriptionFormPlanA.get(controlName)?.setValue(value);
  }
}
