import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DaycareService } from './daycare.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-day-care-settings',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule, BreadcrumbComponent, ToastrModule],
  templateUrl: './day-care-settings.component.html',
  styleUrl: './day-care-settings.component.css',
})
export class DayCareSettingsComponent implements OnInit {
  activitiesList: any[] = [];
  AgeList: any[] = [];
  classList: any[] = [];
  selectedPlans: number[] = [];
  selectedClass: any[] = [];
  selectedActivities: any[] = [];
  selectedAge: any[] = [];
  selectedFacility: any[] = [];
  activityList: any[] = [];
  CLassList: any;
  unselectedClass: number[] = [];
  unselectedAgeGroup: number[] = [];
  unselectedActivity: number[] = [];
  FacilityList: any[] = [];
  unselectedFacility: number[] = [];

  ageList: any[] = [];
  facilityList: any[] = [];
  activitylist: any[] = [];

  constructor(
    private dayCareSetting: DaycareService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private cookie: CookieService
  ) { }

  ngOnInit(): void {
    this.getAllAgeGroup();
    this.getAllActivites();
    this.getAllClasses();
    this.getAllFacility();
    this.editDayCareSettings(parseInt(this.cookie.get('CentreID')));
  }

  getAllActivites() {
    const BO = {
      isActive: true,
      searchText: '',
    };

    this.dayCareSetting.getAllActivites(BO).subscribe(
      (data) => {
        if (data.message === 'Ok' && Array.isArray(data.result)) {
          this.activitiesList = data.result;
        } else {
        }
      },
      (error) => {
        ///console.error('API Error:', error); // Log any API error
      }
    );
  }

  async getAllActivites22() {
    const BO = {
      isActive: true,
      searchText: '',
    };

    try {
      // Convert the observable to a promise and await the result
      const data = await this.dayCareSetting.getAllActivites(BO).toPromise();

      // Check the response and update activitiesList
      if (data.message === 'Ok' && Array.isArray(data.result)) {
        this.activitiesList = data.result;
      } else {
        //console.error('Invalid data format or no activities found', data);
      }
    } catch (error) {
      //console.error('API Error:', error); // Log any API error
    }
  }

  getAllClasses() {
    this.dayCareSetting.getAllClasses().subscribe((data) => {
      if (data.message == 'OK') {
        this.CLassList = data.result;
      }
    });
  }
  async getAllAgeGroup() {
    try {
      const data = await this.dayCareSetting.getAllAgeGroup().toPromise();
      if (data.message === 'Success') {
        this.AgeList = data.result;
      }
    } catch (error: any) {
      this.toastr.error(error.error.message)
      //console.error('Error fetching age groups', error);
    }
  }

  async getAllFacility() {
    // this.dayCareSetting.getAllFacility().subscribe((data) => {
    //   if (data.message == 'OK') {
    //     this.FacilityList = data.result;
    //   }
    // });
    try {
      const data = await this.dayCareSetting.getAllFacility().toPromise();
      if (data.message === 'OK') {
        this.FacilityList = data.result;
      }
    } catch (error) {
      //console.error('Error fetching age groups', error);
    }
  }
  onActivityboxChange(event: any, activityID: number) {
    if (event.target.checked) {
      this.selectedPlans.push(activityID);
      const unselectedIndex = this.unselectedActivity.indexOf(activityID);
      if (unselectedIndex > -1) {
        this.unselectedActivity.splice(unselectedIndex, 1);
      }
    } else {
      const index = this.selectedPlans.indexOf(activityID);
      if (index > -1) {
        this.selectedPlans.splice(index, 1);
      }
      this.unselectedActivity.push(activityID);
    }
  }

  patchActivities(selectedActivities: number[]) {
    this.activitylist.forEach((activity) => {
      if (selectedActivities.includes(activity.activityID)) {
        this.selectedPlans.push(activity.activityID);
      }
    });
  }

  // onBoxClass(event:any,className:string)
  // {
  //   if (event.target.checked) {
  //     this.selectedClass.push(className);
  //   } else {
  //     const index = this.selectedClass.indexOf(className);
  //     if (index > -1) {
  //       this.selectedClass.splice(index, 1);
  //     }
  //   }
  // }

  onBoxClass(event: any, className: number) {
    if (event.target.checked) {
      // Add the class to the selectedClass array
      this.selectedClass.push(className);
      // Remove the class from the unselectedClass array if it exists
      const unselectedIndex = this.unselectedClass.indexOf(className);
      if (unselectedIndex > -1) {
        this.unselectedClass.splice(unselectedIndex, 1);
      }
    } else {
      // Remove the class from the selectedClass array
      const index = this.selectedClass.indexOf(className);
      if (index > -1) {
        this.selectedClass.splice(index, 1);
      }
      // Add the class to the unselectedClass array
      this.unselectedClass.push(className);
    }
  }

  onBoxAge(event: any, ageGroupID: number) {
    if (event.target.checked) {
      this.selectedAge.push(ageGroupID);
      //arsh
      const unselectedIndex = this.unselectedAgeGroup.indexOf(ageGroupID);
      if (unselectedIndex > -1) {
        this.unselectedAgeGroup.splice(unselectedIndex, 1);
      }
    }
    //old one
    // else {
    //   const index = this.selectedAge.indexOf(ageGroupID);
    //   this.unselectedClass;
    //   if (index > -1) {
    //     this.selectedAge.splice(index, 1);
    //   }
    //   //this.unselectedAgeGroup.push(ageGroupID);
    // }
    else {
      // Remove the class from the selectedClass array
      const index = this.selectedAge.indexOf(ageGroupID);
      if (index > -1) {
        this.selectedAge.splice(index, 1);
      }
      // Add the class to the unselectedClass array
      this.unselectedAgeGroup.push(ageGroupID);
    }
  }

  onBoxFacility(event: any, facilityId: number) {
    if (event.target.checked) {
      // Add the class to the selectedClass array
      this.selectedFacility.push(facilityId);
      // Remove the class from the unselectedClass array if it exists
      const unselectedIndex = this.unselectedFacility.indexOf(facilityId);
      if (unselectedIndex > -1) {
        this.unselectedFacility.splice(unselectedIndex, 1);
      }
    } else {
      // Remove the class from the selectedClass array
      const index = this.selectedFacility.indexOf(facilityId);
      if (index > -1) {
        this.selectedFacility.splice(index, 1);
      }
      // Add the class to the unselectedClass array
      this.unselectedFacility.push(facilityId);
    }
  }

  patchAgeGroups(selectedAges: number[]) {
    this.ageList.forEach((ageGroup) => {
      if (selectedAges.includes(ageGroup.ageGroupID)) {
        this.selectedAge.push(ageGroup.ageGroupID);
      }
    });
  }

  patchFacility(selectedFacilities: number[]) {
    this.facilityList.forEach((FacilityGroup) => {
      if (selectedFacilities.includes(FacilityGroup.facilityID)) {
        this.selectedFacility.push(FacilityGroup.facilityID);
      }
    });
  }

  async submitData() {
    try {
      const selectedActivities: number[] = this.selectedPlans.map((plan) =>
        Number(plan)
      );
      const selectedAgeGroups: number[] = this.selectedAge.map((ageGroup) =>
        Number(ageGroup)
      );
      const selectedClassRooms: number[] = this.selectedClass.map((classRoom) =>
        Number(classRoom)
      );
      const selectedFacilities: number[] = this.selectedFacility.map(
        (Facility) => Number(Facility)
      );

      //Arsh
      const unselectedAgeGroup: number[] = this.unselectedAgeGroup.map(
        (unselectedageGroup) => Number(unselectedageGroup)
      );
      const unselectedClass: number[] = this.unselectedClass.map(
        (unselectedGroupClass) => Number(unselectedGroupClass)
      );
      const unselectedActivity: number[] = this.unselectedActivity.map(
        (unselectedGroupActivity) => Number(unselectedGroupActivity)
      );

      const unselectedfacility: number[] = this.unselectedFacility.map(
        (unselectedGroupFacility) => Number(unselectedGroupFacility)
      );

      this.spinner.show();

      const activityResponse = await this.dayCareSetting
        .assignmentActivitesForDayCare(parseInt(this.cookie.get('CentreID')),
          selectedActivities,
          unselectedActivity
        )
        .toPromise();
      if (activityResponse.message === 'OK') {
        // if (activityResponse.activity === "Added") {
        //   this.toastr.success("Activities added successfully!");
        // } else if (activityResponse.activity === "Updated") {
        //   this.toastr.success("Activities updated successfully!");
        // }
      } else {
        this.spinner.hide();

        this.toastr.error('Failed to assign activities.');
      }

      const ageGroupResponse = await this.dayCareSetting
        .assignAgeGroupsForDayCare(parseInt(this.cookie.get('CentreID')), selectedAgeGroups, unselectedAgeGroup)
        .toPromise();
      if (ageGroupResponse.message === 'OK') {
        this.spinner.hide();

        // if (ageGroupResponse.activity === "Added") {
        //   this.toastr.success("Age groups added successfully!");
        // } else if (ageGroupResponse.activity === "Updated") {
        //   this.toastr.success("Age groups updated successfully!");
        // }
      } else {
        this.spinner.hide();

        this.toastr.error('Failed to assign age groups.');
      }

      //Arsh
      const FacilityResponse = await this.dayCareSetting
        .assignFacilityForDayCare(parseInt(this.cookie.get('CentreID')), selectedFacilities, unselectedfacility)
        .toPromise();
      if (FacilityResponse.message === 'OK') {
        // if (activityResponse.activity === "Added") {
        //   this.toastr.success("Activities added successfully!");
        // } else if (activityResponse.activity === "Updated") {
        //   this.toastr.success("Activities updated successfully!");
        // }
      } else {
        this.spinner.hide();
        this.toastr.error('Failed to assign Facility.');
      }

      const classRoomResponse = await this.dayCareSetting
        .assignClassRoomForDayCare(parseInt(this.cookie.get('CentreID')), selectedClassRooms, unselectedClass)
        .toPromise();
      if (classRoomResponse.message === 'OK') {
        if (classRoomResponse.activity === 'Added') {
          this.spinner.hide();
          this.toastr.success('Classrooms Settings Added successfully!');
        } else if (classRoomResponse.activity === 'Updated') {
          this.spinner.hide();
          this.toastr.success('Classrooms  Settings updated successfully!');
        }
      } else {
        this.spinner.hide();

        this.toastr.error('Failed to assign classrooms.');
      }
    } catch (error) {
      this.toastr.error('Error while submitting data.');
      //console.error('Error while submitting data:', error);
    }
  }

  editDayCareSettings(centerID: any) {
    this.dayCareSetting.editDayCareSettings(centerID).subscribe((data) => {
      if (data.message === 'OK') {
        this.classList = data.result.classes;
        this.activitylist = data.result.activities;
        this.ageList = data.result.ageGroups;
        this.facilityList = data.result.facilities;
        const selectedClass = data.result.classes.map(
          (classes: any) => classes.classID
        );
        const selectedActivities = data.result.activities.map(
          (activity: any) => activity.activityID
        );
        const selectedAges = data.result.ageGroups.map(
          (ageGroup: any) => ageGroup.ageGroupID
        );

        const selectedfacility = data.result.facilities.map(
          (FacilityGroup: any) => FacilityGroup.facilityID
        );

        if (this.classList) {
          this.patchClass(selectedClass);
        }

        if (this.activitylist) {
          this.patchActivities(selectedActivities);
        }

        if (this.ageList) {
          this.patchAgeGroups(selectedAges);
        }
        if (this.facilityList) {
          this.patchFacility(selectedfacility);
        }
      }
    });
  }

  patchClass(selectedClass: number[]) {
    this.classList.forEach((cls) => {
      if (selectedClass.includes(cls.classID)) {
        this.selectedClass.push(cls.classID);
      }
    });
  }
}


