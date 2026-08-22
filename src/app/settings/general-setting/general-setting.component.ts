import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { ManageClassroomService } from '../../day-care-management/classroom-management/manage-classroom/manage-classroom.service';
import { AddAgeGroupService } from '../../master-settings/age-group/add-age-group/add-age-group.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AddMasterFacilityService } from '../../master-settings/add-master-facility/add-master-facility.service';
import { AddMasterActivityService } from '../../master-settings/add-master-activity/add-master-activity.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GeneralSettingService } from './general-setting.service';
import { CommonService } from '../../common-component/common.service';
import { CookieService } from 'ngx-cookie-service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { validateHeaderName } from 'http';
import { SwitcherComponentComponent } from '../../common-component/switcher-component/switcher-component.component';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";
declare var $: any;

@Component({
  selector: 'app-general-setting',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    CommonModule,
    SwitcherComponentComponent,
    FormsModule,
    ReactiveFormsModule,
    SkeletonLoaderComponent
],
  templateUrl: './general-setting.component.html',
  styleUrl: './general-setting.component.css',
})
export class GeneralSettingComponent implements OnInit {
  public ageGroupList: any[] = [];
  public facilityList: any[] = [];
  public activityList: any[] = [];
  public centreID: number = 0;
  public ageGroupForm: any;
  public facilityForm: any;
  public activityForm: any;
  public form: any;
  public loginUserID: number = 0;
  public trackForm: boolean = true;
  selectAgeGroups: number[] = [];
  selectFacility: number[] = [];
  selectActivities: number[] = [];
  skeletonShow = 'Skelton';
  workTimeskeleton="workTimeskeleton"

  constructor(
    private ageGroupSevice: AddAgeGroupService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private facilityService: AddMasterFacilityService,
    private activityService: AddMasterActivityService,
    private fb: FormBuilder,
    private genralSettingService: GeneralSettingService,
    private commonService: CommonService,
    private cookie: CookieService,
    public onBoardingService: OnboardingService
  ) {
    this.form = fb.group({
      ageGroups: fb.array([], Validators.required),
      facilities: fb.array([], Validators.required),
      activities: fb.array([], Validators.required),
    });

    this.ageGroupForm = fb.group({
      id: [0],
      // ageGroupTitle: ['', Validators.required],
      minAge: ['', Validators.required],
      maxAge: ['', Validators.required],
      loginUserId: [null],
      centreId: [null],

      // Arsh
      ageUnit: ['Month', Validators.required],
      // isActive: false
    });

    this.facilityForm = fb.group({
      id: [0],
      facilityName: [null, [Validators.required]],
      facilityDescription: [null, [Validators.required]],
      loginUserId: [null],
    });

    this.activityForm = fb.group({
      id: [0],
      activityName: ['', [Validators.required]],
      activityDescription: ['', [Validators.required]],
      createdBy: [0],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let enc_id: any = params.get('enc_id');
      if (enc_id) {
        const decryptedId = this.commonService.decrypt(enc_id);
        this.centreID =
          decryptedId && !isNaN(Number(decryptedId))
            ? parseInt(decryptedId, 10)
            : 0;
      } else if (this.cookie.check('CentreID')) {
        this.centreID = parseInt(this.cookie.get('CentreID'));
      }
      if (this.centreID) {
        if (this.cookie.check('UserId')) {
          this.loginUserID = parseInt(this.cookie.get('UserId'));
        }
        this.loadAllLists();
      }
      //Arsh Added on 19/03/25
      else {
        this.loginUserID = parseInt(this.cookie.get('UserId'));
        this.loadAllLists();
      }
    });
  }
  get ageGroupsControls(): any {
    return (this.form.get('ageGroups') as FormArray).controls;
  }
  get facilitiesControls(): any {
    return (this.form.get('facilities') as FormArray).controls;
  }
  get activitiesControls(): any {
    return (this.form.get('activities') as FormArray).controls;
  }

  get ageGroupFormControls() {
    return this.ageGroupForm.controls;
  }
  get facilityFormControls() {
    return this.facilityForm.controls;
  }

  convertMonthsToYears(months: number): number {
    if (months < 0) {
      throw new Error('Invalid input: months cannot be negative.');
    }
    return Math.floor(months / 12);
  }

  convertYearsToMonths(years: number): number {
    if (years < 0) {
      throw new Error('Invalid input: years cannot be negative.');
    }
    return years * 12;
  }
  async loadAllLists() {
     this.skeletonShow = 'Skelton';

    // Commented on 19/03/25
    // const ageGroupApi = this.ageGroupSevice.GetAllAgeGroup();
    // const facilityApi = this.facilityService.GetAllFacilities();
    // const activityApi = this.activityService.GetAllActivities({
    //   isActive: true,
    //   searchText: '',
    // });

    //Arsh //Added on 04/04/25
    this.selectAgeGroups =
      this.form
        .get('ageGroups')
        ?.value.map((checked: boolean, index: number) =>
          checked ? this.ageGroupList[index].id : null
        )
        .filter((id: null) => id !== null) || [];

    this.selectFacility =
      this.form
        .get('facilities')
        ?.value.map((checked: boolean, index: number) =>
          checked ? this.facilityList[index].id : null
        )
        .filter((id: null) => id !== null) || [];

    this.selectActivities =
      this.form
        .get('activities')
        ?.value.map((checked: boolean, index: number) =>
          checked ? this.activityList[index].id : null
        )
        .filter((id: null) => id !== null) || [];

    //End

    //Added on 19/03/25
    const ageGroupApi = this.genralSettingService.getAllAgeGroupsByUserID(
      this.loginUserID
    );
    const facilityApi = this.genralSettingService.getAllFacilityByUserId(
      this.loginUserID
    );
    const activityApi = this.genralSettingService.getAllActivitiesByUserId(
      this.loginUserID
    );

    const selectedEntitiesApi = this.genralSettingService.getEntitiesByCenter(
      this.centreID
    );

    forkJoin([
      ageGroupApi,
      facilityApi,
      activityApi,
      selectedEntitiesApi,
    ]).subscribe(
      ([response1, response2, response3, response4]) => {
        if (response1.message === 'Success') {          
          let ageGroup = response1.result;
          this.ageGroupList = ageGroup.map((item: any) => {
            if (item.isMonthly == true) {
              let minYear = this.convertMonthsToYears(item.minAge);
              let maxYear = this.convertMonthsToYears(item.maxAge);
              return {
                ...item,
                sortMinAge: item.minAge,
                label: `${item.minAge} - ${item.maxAge} Months ( ${minYear} - ${maxYear} Years)`,
              };
            } else {
              let minMonth = this.convertYearsToMonths(item.minAge);
              let maxMonth = this.convertYearsToMonths(item.maxAge);

              return {
                ...item,
                sortMinAge: minMonth,
                label: `${minMonth} - ${maxMonth} Months ( ${item.minAge} - ${item.maxAge} Years)`,
              };
            }
          }).sort((a:any, b:any) =>a.sortMinAge - b.sortMinAge);          
          this.skeletonShow = '';
        }
        if (response2.message === 'Success') {
          this.facilityList = response2.result.map(
            (item: {
              facilityID: number;
              facilityName: string;
              createdBy: number;
            }) => ({
              id: item.facilityID,
              facilityName: item.facilityName,
              createdBy: item.createdBy,
            })
          );
          this.skeletonShow = '';

        }
        if (response3.message === 'Ok') {
          this.activityList = response3.result;
          this.skeletonShow = '';

        }
        this.initializeCheckboxes(response4.result);

                this.skeletonShow = '';

      },
      (error) => {
                  this.skeletonShow = '';

        // this.toastr.error(error.message);
      }
    );
  }

  initializeCheckboxes(selectedEntities: {
    activities: number[];
    ageGroups: number[];
    facilities: number[];
  }) {
    const ageGroupFormArray = this.form.get('ageGroups') as FormArray;
    const facilityFormArray = this.form.get('facilities') as FormArray;
    const activityFormArray = this.form.get('activities') as FormArray;

    // Clear the form arrays
    ageGroupFormArray.clear();
    facilityFormArray.clear();
    activityFormArray.clear();

    //Arsh //Commented on 04/04/25
    // this.ageGroupList.forEach((item) => {
    //   let isChecked = selectedEntities.ageGroups.some((x) => x === item.id)
    //     ? true
    //     : false;
    //   ageGroupFormArray.push(this.fb.control(isChecked));
    // });

    // this.facilityList.forEach((item) => {
    //   let isChecked = selectedEntities.facilities.some((x) => x === item.id)
    //     ? true
    //     : false;
    //   facilityFormArray.push(this.fb.control(isChecked));
    // });

    // this.activityList.forEach((item) => {
    //   let isChecked = selectedEntities.activities.some((x) => x === item.id)
    //     ? true
    //     : false;
    //   activityFormArray.push(this.fb.control(isChecked));
    // });

    //Arsh //Added on 04/04/25
    this.ageGroupList.forEach((item) => {
      let isChecked =
        selectedEntities.ageGroups.includes(item.id) ||
        this.selectAgeGroups.includes(item.id);
      ageGroupFormArray.push(this.fb.control(isChecked));
    });

    this.facilityList.forEach((item) => {
      let isChecked =
        selectedEntities.facilities.includes(item.id) ||
        this.selectFacility.includes(item.id);
      facilityFormArray.push(this.fb.control(isChecked));
    });

    this.activityList.forEach((item) => {
      let isChecked =
        selectedEntities.activities.includes(item.id) ||
        this.selectActivities.includes(item.id);
      activityFormArray.push(this.fb.control(isChecked));
    });
  }

  //Arsh //Added on 04/04/25
  selectageGroups(id: number, event: any) {
  
    const ageGroupFormArray = this.form.get('ageGroups') as FormArray;
    if (event.target.checked) {
      if (!this.selectAgeGroups.includes(id)) {
        this.selectAgeGroups.push(id);
      }
    } else {
      this.selectAgeGroups = this.selectAgeGroups.filter((item) => item !== id);
    }
  }

  //Arsh //Added on 04/04/25
  selectFacilities(id: number, event: any) {
    
    const facilityFormArray = this.form.get('facilities') as FormArray;
    if (event.target.checked) {
      if (!this.selectFacility.includes(id)) {
        this.selectFacility.push(id);
      }
    } else {
      this.selectFacility = this.selectFacility.filter((item) => item !== id);
    }
  }

  //Arsh //Added on 04/04/25
  selectActivity(id: number, event: any) {
    
    const activityFormArray = this.form.get('activities') as FormArray;

    if (event.target.checked) {
      if (!this.selectActivities.includes(id)) {
        this.selectActivities.push(id);
      }
    } else {
      this.selectActivities = this.selectActivities.filter(
        (item) => item !== id
      );
    }
  }

  trackingFields() {
    if (
      this.form.value.ageGroups.includes(true) &&
      this.form.value.facilities.includes(true) &&
      this.form.value.activities.includes(true)
    ) {
      this.trackForm = false;
    } else {
      this.trackForm = true;
    }
  }

  onSubmit() {
    
    this.spinner.show();
    const getSelectedItems = (formArrayName: string, list: any[]) => {
      return (this.form.get(formArrayName) as FormArray).value
        .map((checked: boolean, index: number) =>
          checked ? list[index].id : null
        )
        .filter((value: string | null) => value !== null);
    };
    const selectedAgeGroups = getSelectedItems('ageGroups', this.ageGroupList);
    const selectedFacilities = getSelectedItems(
      'facilities',
      this.facilityList
    );
    const selectedActivities = getSelectedItems(
      'activities',
      this.activityList
    );
    const json = {
      ageGroupListId: selectedAgeGroups,
      facilitiesListId: selectedFacilities,
      activitiesListId: selectedActivities,
    };
    // const hasQueryParams =
    //   Object.keys(this.route.snapshot.queryParams).length > 0;
    this.genralSettingService
      .assignEntitiesToCenter(json, this.centreID)
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            // if (hasQueryParams) {
            this.commonService
              .manageDaycareOnBoarding(
                this.centreID,
                'manageDaycareGeneralSettings'
              )
              .subscribe((result: any) => {
                if (result.message == 'Success') {
                  if (!this.onBoardingService.onBoardingData.isCompleteStep2) {
                    this.onBoardingService.onBoardingData.isCompleteStep2 =
                      true;
                    this.spinner.hide();
                    this.onBoardingService.handleNext('Tab-2');
                  } else {
                    this.toastr.success(
                      'Entities assigned to center successfully!'
                    );
                    this.spinner.hide();
                    this.onBoardingService.getCurrentTab();
                  }
                }
              });
            // } else {
            //   this.toastr.success('Entities assigned to center successfully!');
            //   this.spinner.hide();
            // }
          }
        },
        error: (err) => {
          // this.toastr.error(err.message);
          this.spinner.hide();
        },
      });
  }

  onSubmitAgeGroup() {
    
    if (this.ageGroupForm.valid) {
      this.spinner.show();
      this.ageGroupForm.patchValue({
        id: this.ageGroupForm.get('id').value
          ? this.ageGroupForm.get('id').value
          : 0,
        loginUserId: this.loginUserID,
      });
      this.ageGroupSevice.ManageAgeGroup(this.ageGroupForm.value).subscribe({
        next: async (response) => {
          if (response.message === 'Success') {
            this.toastr.success(response.activity);
            await this.loadAllLists();
            $('#exampleModal').modal('hide');
            this.ageGroupForm.reset();
            this.ageGroupForm.patchValue({
              ageUnit: 'Month',
            });

            this.spinner.hide();
          } else {
            this.toastr.warning(response.message);
            this.spinner.hide();
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
        error: (err) => {
          this.spinner.hide();
          // this.toastr.error(err.message);
        },
      });
    } else {
      this.ageGroupForm.markAllAsTouched();
    }
  }

  async manageMasterActivities() {
    
    if (this.activityForm.valid) {
      this.spinner.show();
      // commented on 19/03/25
      // this.activityForm.patchValue({
      //   createdBy: this.centreID,
      // });

      this.activityForm.patchValue({
        createdBy: this.loginUserID,
      });

      let response = await this.genralSettingService
        .manageMasterActivites(this.activityForm.value)
        .toPromise();
      if (response.message == 'Success') {
        this.activityForm.reset();
        $('#exampleModal3').modal('hide');
        this.spinner.hide();
        this.toastr.success(response.activity);
        await this.loadAllLists();
      } else {
        this.spinner.hide();
        this.toastr.warning(response.message);
      }
    } else {
      this.activityForm.markAllAsTouched();
    }
  }

  onSubmitFacility() {
    this.spinner.show();
    if (this.facilityForm.valid) {
      this.facilityForm.patchValue({
        id: this.facilityForm.get('id').value
          ? this.facilityForm.get('id').value
          : 0,
        loginUserId: this.loginUserID,
      });
      this.facilityService.ManageFacility(this.facilityForm.value).subscribe({
        next: async (response) => {
          if (response.message === 'Success') {
            await this.loadAllLists();
            this.toastr.success('Facility saved successfully');
            this.facilityForm.reset();
            $('#exampleModal2').modal('hide');
            this.spinner.hide();
          } else {
            this.toastr.warning(response.message);
            this.spinner.hide();
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
      });
    } else {
      this.spinner.hide();
      this.facilityForm.markAllAsTouched();
    }
  }

  allowOnlyNumericInput(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (
      (charCode < 48 || charCode > 57) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
        event.key
      )
    ) {
      event.preventDefault();
    }
  }

  // UpdateAgeGroup(ageGroups: any) {
  //   this.ageGroupForm.patchValue({
  //     id: ageGroups.id,
  //     minAge: ageGroups.minAge,
  //     maxAge: ageGroups.maxAge,
  //     centreId: this.centreID,
  //     loginUserId: this.loginUserID,
  //     isActive : ageGroups.isActive
  //   });
  // }
}
