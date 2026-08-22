import { Component, ViewChild } from '@angular/core';
import { ManageClassroomService } from './manage-classroom.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import Swal from 'sweetalert2';
import { AddAgeGroupService } from '../../../master-settings/age-group/add-age-group/add-age-group.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { ViewClassroomComponent } from '../view-classroom/view-classroom.component';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../common-component/common.service';
import e from 'express';
import { ManageStudentService } from '../../student-management/manage-student/manage-student.service';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";
declare var $: any;

interface weekDays {
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
}

@Component({
  selector: 'app-manage-classroom',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ToastrModule,
    NgxPaginationModule,
    BreadcrumbComponent,
    NgSelectModule,
    CommonModule,
    ViewClassroomComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './manage-classroom.component.html',
  styleUrl: './manage-classroom.component.css',
})
export class ManageClassroomComponent {
  @ViewChild(ViewClassroomComponent) childComponent!: ViewClassroomComponent;
  classForm: FormGroup;
  endTimeLess: boolean[] = [false];
  classValue: any;
  ContentP: number = 1;
  Contentsize: number = 5;
  isEditMode: boolean = false;
  showAdditionalFields: boolean = false;
  ageGroupList: any;
  centreID: number = 0;
  form: any;
  days: any;
  classID: any;
  ClassCapacityLimitOver: boolean[] = [];
  classLimit: boolean = false;
  private loginUserID: number = 0;
  trackValue: boolean = true;
  isClassroomDuplicate: boolean = false;
  classNameContainSpace: boolean = false;
  sectionNameContainSpace: boolean[] = [];
  sectionContainSpace: boolean = false;
  classSlotList: any[] = [];
  daysTimeRange: any[] = [];
  filteredDays: any[] = [];
  classRoomEdit: any;
  editClassRoomCapacity: any;
  skeletonShow = "Skelton";

  startTimeOrEndTimeWorkCalendar: any;

  displayDayName: string[] = [];
  displayDayCareTiming: any[] = [];

  workCalendarOfWeek: weekDays = {
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  };
  daycarecentreDetails: any;
  enteredValue: any;

  constructor(
    private classService: ManageClassroomService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ageGpService: AddAgeGroupService,
    public onBoardingService: OnboardingService,
    private cookie: CookieService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private manageStudentService: ManageStudentService
  ) {
    this.classForm = this.fb.group({
      id: [0],
      className: ['', Validators.required],
      ageGroupID: [0, Validators.required],
      daycareCentreID: [0],
      loginUserID: [0],
      maxCapacity: ['', Validators.required],
      staff: ['', Validators.required],
      studentRatio: ['', Validators.required],
      classSlot: this.fb.array([]),
    });
  }

  ngOnInit() {

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
        this.getAllAge();
        this.getDays();
        this.getCentreWorkingDaysByCentreID();
        this.getDayCareCentreDetails();
      }
    });
  }

  isDisabledDays(day: any) {
    switch (day.day.toLowerCase()) {
      case 'sunday':
        return !this.workCalendarOfWeek.sunday;
        break;

      case 'monday':
        return !this.workCalendarOfWeek.monday;
        break;

      case 'tuesday':
        return !this.workCalendarOfWeek.tuesday;
        break;

      case 'wednesday':
        return !this.workCalendarOfWeek.wednesday;
        break;

      case 'thursday':
        return !this.workCalendarOfWeek.thursday;
        break;

      case 'friday':
        return !this.workCalendarOfWeek.friday;
        break;

      case 'saturday':
        return !this.workCalendarOfWeek.saturday;
        break;

      default:
        return false;
    }
  }

  getLength() {
    if (this.childComponent?.classList.length > 0) {
      this.trackValue = false;
    } else {
      this.trackValue = true;
    }
  }

  onEndTimeSelect(index: number) {

    let day = this.displayDayName[index];
    const startTime = this.classForm.value.classSlot[index].startTime + ':00';
    const endTime = this.classForm.value.classSlot[index].endTime;
    switch (day) {
      case 'Sunday':
        const sundayStartTime =
          this.startTimeOrEndTimeWorkCalendar.sunStartTime;
        const sundayEndTime = this.startTimeOrEndTimeWorkCalendar.sunEndTime;
        if (
          (startTime !== '' && startTime < sundayStartTime) ||
          (startTime !== '' && startTime > sundayEndTime)
        ) {
          $('#' + index + '_startTime').val(null);
          this.toastr.error('Does not matching the day care Timings');
        } else {
          if (
            (endTime !== '' && endTime > sundayEndTime) ||
            (endTime !== '' && endTime < sundayStartTime)
          ) {
            $('#' + index + '_endTime').val(null);
            this.toastr.error('Does not matching the day care Timings');
          }
        }
        break;

      case 'Monday':
        const mondayStartTime =
          this.startTimeOrEndTimeWorkCalendar.monStartTime;
        const mondayEndTime = this.startTimeOrEndTimeWorkCalendar.monEndTime;
        if (
          (startTime !== '' && startTime < mondayStartTime) ||
          (startTime > mondayEndTime && startTime !== '')
        ) {
          $('#' + index + '_startTime').val(null);
          this.toastr.error('Does not matching the day care Timings');
        } else {
          if (
            (endTime !== '' && endTime > mondayEndTime) ||
            (endTime !== '' && endTime < mondayStartTime)
          ) {
            $('#' + index + '_endTime').val(null);
            this.toastr.error('Does not matching the day care Timings');
          }
        }
        break;

      case 'Tuesday':
        const tuesdayStartTime =
          this.startTimeOrEndTimeWorkCalendar.tuesStartTime;
        const tuesdayEndTime = this.startTimeOrEndTimeWorkCalendar.tuesEndTime;
        if (
          (startTime !== '' && startTime < tuesdayStartTime) ||
          (startTime !== '' && startTime > tuesdayEndTime)
        ) {
          $('#' + index + '_startTime').val(null);
          this.toastr.error('Does not matching the day care Timings');
        } else {
          if (
            (endTime !== '' && endTime < tuesdayStartTime) ||
            (endTime > tuesdayEndTime && endTime !== '')
          ) {
            $('#' + index + '_endTime').val(null);
            this.toastr.error('Does not matching the day care Timings');
          }
        }
        break;

      case 'Wednesday':
        const wednesdayStartTime =
          this.startTimeOrEndTimeWorkCalendar.wedStartTime;
        const wednesdayEndTime = this.startTimeOrEndTimeWorkCalendar.wedEndTime;
        if (
          (startTime !== '' && startTime < wednesdayStartTime) ||
          (startTime > wednesdayEndTime && startTime !== '')
        ) {
          $('#' + index + '_startTime').val(null);
          this.toastr.error('Does not matching the day care Timings');
        } else {
          if (
            (endTime !== '' && endTime > wednesdayEndTime) ||
            (endTime !== '' && endTime < wednesdayStartTime)
          ) {
            $('#' + index + '_endTime').val(null);
            this.toastr.error('Does not matching the day care Timings');
          }
        }
        break;

      case 'Thursday':
        const thursdayStartTime =
          this.startTimeOrEndTimeWorkCalendar.thuStartTime;
        const thursdayEndTime = this.startTimeOrEndTimeWorkCalendar.thuEndTime;
        if (
          (startTime !== '' && startTime < thursdayStartTime) ||
          (startTime !== '' && startTime > thursdayEndTime)
        ) {
          $('#' + index + '_startTime').val(null);
          this.toastr.error('Does not matching the day care Timings');
        } else {
          if (
            (endTime !== '' && endTime > thursdayEndTime) ||
            (endTime !== '' && endTime < thursdayStartTime)
          ) {
            $('#' + index + '_endTime').val(null);
            this.toastr.error('Does not matching the day care Timings');
          }
        }
        break;

      case 'Friday':
        const fridayStartTime =
          this.startTimeOrEndTimeWorkCalendar.friStartTime;
        const fridayEndTime = this.startTimeOrEndTimeWorkCalendar.friEndTime;
        if (
          (startTime !== '' && startTime < fridayStartTime) ||
          (startTime !== '' && startTime > fridayEndTime)
        ) {
          $('#' + index + '_startTime').val(null);
          this.toastr.error('Does not matching the day care Timings');
        } else {
          if (
            (endTime !== '' && endTime > fridayEndTime) ||
            (endTime < fridayStartTime && endTime !== '')
          ) {
            $('#' + index + '_endTime').val(null);
            this.toastr.error('Does not matching the day care Timings');
          }
        }
        break;

      case 'Saturday':
        const saturdayStartTime =
          this.startTimeOrEndTimeWorkCalendar.satStartTime;
        const saturdayEndTime = this.startTimeOrEndTimeWorkCalendar.satEndTime;
        if (
          (startTime !== '' && startTime < saturdayStartTime) ||
          (startTime !== '' && startTime > saturdayEndTime)
        ) {
          $('#' + index + '_startTime').val(null);
          this.toastr.error('Does not matching the day care Timings');
        } else {
          if (
            (endTime !== '' && endTime > saturdayEndTime) ||
            (endTime !== '' && endTime < saturdayStartTime)
          ) {
            $('#' + index + '_endTime').val(null);
            this.toastr.error('Does not matching the day care Timings');
          }
        }
        break;
    }
    for (let i = 0; i < this.classForm.value.classSlot.length; i++) {
      if (
        this.classForm.value.classSlot[i].endTime <=
        this.classForm.value.classSlot[i].startTime
      ) {
        this.endTimeLess[i] = true;
        $('#' + i + '_endTime').val(null);
      } else {
        this.endTimeLess[i] = false;
      }
    }
  }

  getDayCareCentreDetails() {
    this.manageStudentService.getDayCareCentreDetails(this.centreID).subscribe({
      next: (response) => {
        if (response.message === 'OK') {
          this.daycarecentreDetails = response.result;
        }
      },
      error: (err) => { },
    });
  }


  checkSectionExists(e: any, i: number) {
    const sectionName = e.target.value;
    const regex = /\b\w+\s\w+\b/;
    if (regex.test(sectionName)) {
      this.sectionNameContainSpace[i] = true;
    } else {
      this.sectionNameContainSpace[i] = false;

      this.classService
        .checkSectionExists(sectionName, this.centreID)
        .subscribe(
          (data) => {
            this.spinner.show();
            if (data.message === 'section exists') {
              this.spinner.hide();
              const sectionFormArray = this.classForm.get(
                'daycareSection'
              ) as FormArray;
              sectionFormArray.at(i).get('className')?.setValue('');

              Swal.fire({
                title: 'Duplicate Section',
                icon: 'info',
              });
            } else {
              this.spinner.hide();
            }
          },
          (error) => {
            // handle error
          }
        );
    }
  }

  getCentreWorkingDaysByCentreID() {
    this.classService
      .getCentreWorkingDaysByCentreID(this.centreID)
      .subscribe((data: any) => {
        if (data.message == 'Success') {
          this.workCalendarOfWeek.sunday = data.result.sun;
          this.workCalendarOfWeek.monday = data.result.mon;
          this.workCalendarOfWeek.tuesday = data.result.tues;
          this.workCalendarOfWeek.wednesday = data.result.wed;
          this.workCalendarOfWeek.thursday = data.result.thu;
          this.workCalendarOfWeek.friday = data.result.fri;
          this.workCalendarOfWeek.saturday = data.result.sat;

          this.startTimeOrEndTimeWorkCalendar = data.result;

          Object.values(this.workCalendarOfWeek).forEach(
            (data: any, i: number) => {
              if (i == 0 && data == false) {
                this.filteredDays.push('sunday');
              } else if (i == 1 && data == false) {
                this.filteredDays.push('monday');
              } else if (i == 2 && data == false) {
                this.filteredDays.push('tuesday');
              } else if (i == 3 && data == false) {
                this.filteredDays.push('wednesday');
              } else if (i == 4 && data == false) {
                this.filteredDays.push('thursday');
              } else if (i == 5 && data == false) {
                this.filteredDays.push('friday');
              } else if (i == 6 && data == false) {
                this.filteredDays.push('saturday');
              }
            }
          );
        }
      });
  }

  onsubmit() {

    if (this.classForm.valid && this.classForm.value.classSlot.length > 0) {
      for (let i = 0; i < this.classForm.value.classSlot.length; i++) {
        if (
          this.classForm.value.classSlot[i].endTime <=
          this.classForm.value.classSlot[i].startTime
        ) {
          this.endTimeLess[i] = true;
          $('#' + i + '_endTime').val(null);
        } else {
          this.endTimeLess[i] = false;
        }
      }

      const regex = /\b\w+\s\w+\b/;
      for (let i = 0; i < this.classForm.value.classSlot.length; i++) {
        if (regex.test(this.classForm.value.classSlot[i].className)) {
          this.sectionContainSpace = true;
          return;
        }
      }

      if (this.endTimeLess.some((value) => value === false)) {
        const jsonData = this.classForm.value;
        const isDuplicate = this.childComponent.classList.some(
          (x: any) =>
            x.className.trim().toUpperCase() ===
            jsonData.className.trim().toUpperCase() &&
            x.ageGroupID === jsonData.ageGroupID &&
            x.id !== jsonData.id
        );
        if (isDuplicate) {
          this.commonService.duplicateRecordWarn();
          return;
        }
        this.spinner.show();
        this.classID = this.isEditMode ? this.classForm.value.id : 0;
        this.classForm.patchValue({
          id: this.classID,
          loginUserID: this.loginUserID,
          daycareCentreID: this.centreID,
        });
        const formDataArray = [this.classForm.value];

        this.classService.ManageClasses(formDataArray).subscribe(
          (data) => {
            if (data.message == 'OK') {
              this.getDayCareCentreDetails();
              setTimeout(() => {
                this.spinner.hide();
              }, 100);
              this.toastr.success(data.activity);
              this.childComponent.getAllClasses();
              this.resetForm();
              $('#submit-btn').text('Submit');
              this.getDayCareCentreDetails();
              this.classRoomEdit = '';
            } else {
              this.spinner.hide();
              this.toastr.error(data.message);
            }
          },
          (error) => {
            this.spinner.hide();
            this.toastr.error(error.message);
          }
        );
      }
    } else {
      this.classForm.markAllAsTouched();
      if (this.classForm.valid && this.classForm.value.classSlot.length == 0) {
        this.toastr.error('please select one day..');
      }
    }
  }

  getAllAge() {
    // this.spinner.show();
    this.classService.GetAllAgeGroup(this.centreID).subscribe((data) => {
      if (data.message == 'Success') {
        const activeAgeGroups = data.result.filter(
          (item: { isActive: boolean }) => item.isActive
        );
        this.ageGroupList = activeAgeGroups.map(
          (item: {
            id: any;
            ageGroupTitle: string;
            minAge: any;
            maxAge: any;
            isMonthly: boolean;
          }) => ({
            value: item.id,
            //label: `(${item.minAge} - ${item.maxAge}) Months`,

            //Added on 25/04/25
            label: `${item.minAge} - ${item.maxAge} ${item.isMonthly ? 'Month' : 'Year'
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
          })
        );
        // setTimeout(() => {
        //   this.spinner.hide();
        // }, 300);
      }
    });
  }

  convertYearToMonth(year: number): number {
    return year * 12;
  }

  convertMonthToYear(month: number): number {
    return parseFloat((month / 12).toFixed(1));
  }

  onEdit(plan: any) {

    this.displayDayName = [];
    this.displayDayCareTiming = [];
    this.classRoomEdit = plan;
    window.scrollTo(0, 0);
    this.isEditMode = true;
    this.clearFormArray(this.classForm.get('classSlot') as FormArray);
    this.classForm.patchValue({
      id: plan.id,
      className: plan.className,
      ageGroupID: plan.ageGroupID,
      maxCapacity: plan.capacity,
      staff: plan.staff,
      studentRatio: plan.studentRatio,
    });

    plan.daycareSection.forEach((section: any) => {
      const sectionFormGroup = this.createSection();
      sectionFormGroup.patchValue({
        id: section.id,
        classID: section.classID,
        startTime: section.startTime,
        endTime: section.endTime,
      });

      if (section.days && section.days.length > 0) {
        const daysFormArray = sectionFormGroup.get('days') as FormArray;
        this.clearFormArray(daysFormArray);
        section.days.forEach((day: any) => {
          this.displayDayName.push(day.dayName);
          switch (day.dayID) {
            case 1:
              this.displayDayCareTiming.push({
                startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.monStartTime),
                endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.monEndTime),
              });
              break;

            case 2:
              this.displayDayCareTiming.push({
                startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.tuesStartTime),
                endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.tuesEndTime),
              });
              break;

            case 3:
              this.displayDayCareTiming.push({
                startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.wedStartTime),
                endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.wedEndTime),
              });
              break;

            case 4:
              this.displayDayCareTiming.push({
                startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.thuStartTime),
                endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.thuEndTime),
              });
              break;

            case 5:
              this.displayDayCareTiming.push({
                startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.friStartTime),
                endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.friEndTime),
              });
              break;

            case 6:
              this.displayDayCareTiming.push({
                startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.satStartTime),
                endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.satEndTime),
              });
              break;

            case 7:
              this.displayDayCareTiming.push({
                startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.sunStartTime),
                endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.sunEndTime),
              });
              break;
          }

          const dayFormGroup = this.createdays();
          dayFormGroup.patchValue({
            id: day.dayCareSlotID,
            dayID: day.dayID,
            slotID: day.dayCareSlotID,
          });
          daysFormArray.push(dayFormGroup);
        });
      } else {
        console.warn(`No days available for section: ${section.sectionName}`);
      }

      (this.classForm.get('classSlot') as FormArray).push(sectionFormGroup);
    });
    $('#submit-btn').text('Update');
  }

  // Helper function to clear FormArray
  clearFormArray(formArray: FormArray): void {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  activeInactive(id: number, isActive: boolean) {
    var action = 'activated';
    Swal.fire({
      title: 'Confirmation',
      text: isActive
        ? 'Are you sure you want to deactivate the classroom?'
        : 'Are you sure you want to activate the classroom?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: isActive ? 'Confirm' : 'Confirm',
    }).then((result) => {
      if (result.isConfirmed) {
        if (isActive === true) {
          action = 'deactivated';
        }
        this.classService.ActiveInactiveClassroom(id).subscribe((res) => { });
      } else {
        function check() {
          $('#checkBoxAinA' + id).prop('checked', true);
        }
        function uncheck() {
          $('#checkBoxAinA' + id).prop('checked', false);
        }
        isActive ? check() : uncheck();
      }
    });
  }

  cancel() {
    this.isEditMode = false;
    this.classForm.reset();
  }

  reset() {
    this.classForm.reset({
      classID: 0,
      className: '',
      maxCapacity: '',
      staff: '',
      studentRatio: '',
    });
  }

  get sections(): FormArray {
    return this.classForm.get('classSlot') as FormArray;
  }
  createSection(): FormGroup {
    return this.fb.group({
      id: [0],
      classID: [0],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      days: this.fb.array([]),
    });
  }

  createdays(): FormGroup {
    return this.fb.group({
      id: [0],
      slotID: [0],
      dayID: ['', Validators.required],
      loginUserID: [0],
    });
  }

  onDayChange(event: Event, day: string, dayID?: number) {
    const checkbox = event.target as HTMLInputElement;

    //static map to get dayID and time
    const dayMap: { [key: number]: [string, string] } = {
      1: ['monStartTime', 'monEndTime'],
      2: ['tuesStartTime', 'tuesEndTime'],
      3: ['wedStartTime', 'wedEndTime'],
      4: ['thuStartTime', 'thuEndTime'],
      5: ['friStartTime', 'friEndTime'],
      6: ['satStartTime', 'satEndTime'],
      7: ['sunStartTime', 'sunEndTime'],
    };

    if (checkbox.checked) {
      if (!this.displayDayName.includes(day)) {
        const insertIndex = this.getSortedInsertIndex(dayID!);//sorts days based on dayID.

        this.displayDayName.splice(insertIndex, 0, day);
        const [startKey, endKey] = dayMap[dayID!]; //add dayName to the fixed key based on the dayID in the array

        this.displayDayCareTiming.splice(insertIndex, 0, {
          startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar[startKey]),
          endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar[endKey])
        }) // adding timing to displayDayCareTiming array in sequence with displayDayName array

        const newSection = this.createSection();
        this.sections.insert(insertIndex, newSection);

        const section = this.classForm.get('classSlot') as FormArray;
        const daysFormArray = section.at(insertIndex).get('days') as FormArray;

        daysFormArray.push(this.fb.group({ dayID: dayID }));
      }
    } else {
      // If unchecked, remove at the correct index
      const index = this.displayDayName.indexOf(day);
      if (index > -1) {
        this.displayDayName.splice(index, 1);
        this.displayDayCareTiming.splice(index, 1);
        this.sections.removeAt(index);
      }
    }
  }





  getSortedInsertIndex(newDayID: number): number {
    for (let i = 0; i < this.displayDayName.length; i++) {
      const existingDayID = this.getDayID(this.displayDayName[i]);
      if (existingDayID > newDayID) {
        return i;
      }
    }
    return this.displayDayName.length;
  }

  getDayID(day: string): number {
    const dayToID: { [key: string]: number } = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 7
    };
    return dayToID[day];
  }


  // onDayChange(event: Event, day: string, dayID?: number) {
  //   const checkbox = event.target as HTMLInputElement;

  //   if (checkbox.checked) {
  //     if (!this.displayDayName.includes(day)) {
  //       this.displayDayName.push(day);
  //       switch (dayID) {
  //         case 1:
  //           this.displayDayCareTiming.push({
  //             startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.monStartTime),
  //             endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.monEndTime),
  //           });
  //           break;

  //         case 2:
  //           this.displayDayCareTiming.push({
  //             startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.tuesStartTime),
  //             endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.tuesEndTime),
  //           });
  //           break;

  //         case 3:
  //           this.displayDayCareTiming.push({
  //             startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.wedStartTime),
  //             endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.wedEndTime),
  //           });
  //           break;

  //         case 4:
  //           this.displayDayCareTiming.push({
  //             startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.thuStartTime),
  //             endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.thuEndTime),
  //           });
  //           break;

  //         case 5:
  //           this.displayDayCareTiming.push({
  //             startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.friStartTime),
  //             endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.friEndTime),
  //           });
  //           break;

  //         case 6:
  //           this.displayDayCareTiming.push({
  //             startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.satStartTime),
  //             endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.satEndTime),
  //           });
  //           break;

  //         case 7:
  //           this.displayDayCareTiming.push({
  //             startTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.sunStartTime),
  //             endTime: this.commonService.convertTimeStringToDate(this.startTimeOrEndTimeWorkCalendar.sunEndTime),
  //           });
  //           break;
  //       }





  //       this.sections.push(this.createSection());
  //       const section = this.classForm.get('classSlot') as FormArray;
  //       const days = section
  //         .at(this.sections.length - 1)
  //         .get('days') as FormArray;

  //       days.push(
  //         this.fb.group({
  //           dayID: dayID,
  //         })
  //       );

  //     }
  //   } else {
  //     let index = this.displayDayName.indexOf(day);
  //     this.displayDayName.splice(index, 1);
  //     this.displayDayCareTiming.splice(index, 1);
  //     this.sections.removeAt(index);
  //   }

  // }

  // const checkbox = event.target as HTMLInputElement;
  // const dayID = +checkbox.value;
  // const section = this.classForm.get('classSlot') as FormArray;
  // const days = section.at(sectionIndex).get('days') as FormArray;

  // if (checkbox.checked) {
  //   if (!days.controls.some((control) => control.value.dayID === dayID)) {
  //     days.push(
  //       this.fb.group({
  //         dayID: dayID,
  //       })
  //     );
  //   }
  // } else {
  //   const index = days.controls.findIndex(
  //     (ctrl) => ctrl.value.dayID === dayID
  //   );
  //   if (index !== -1) {
  //     days.removeAt(index);
  //   }
  // }

  // isDaySelected(sectionIndex: number, dayID: number): boolean {
  //   const daysFormArray = (this.classForm.get('classSlot') as FormArray)
  //     .at(sectionIndex)
  //     .get('days') as FormArray;
  //   return daysFormArray.controls.some((ctrl) => ctrl.value.dayID == dayID);
  // }

  isDaySelected(day: string) {
    if (!this.displayDayName.includes(day)) {
      return false;
    } else {
      return true;
    }
  }

  isDaysSelectMoreThanOne() {
    if (this.displayDayName.length > 0) {
      return true;
    } else {
      return false;
    }
  }




  addSection(): void {
    if (this.classForm.value.classSlot.length > 0) {
      if (
        this.classForm.value.classSlot[
          this.classForm.value.classSlot.length - 1
        ].days.length > 0 &&
        this.classForm.value.classSlot[
          this.classForm.value.classSlot.length - 1
        ].startTime != '' &&
        this.classForm.value.classSlot[
          this.classForm.value.classSlot.length - 1
        ].endTime != ''
      ) {
        if (this.classForm.value.classSlot.length > 1) {
          let previousSlot =
            this.classForm.value.classSlot[
            this.classForm.value.classSlot.length - 2
            ];
          let currentSlot =
            this.classForm.value.classSlot[
            this.classForm.value.classSlot.length - 1
            ];

          const commonDays = previousSlot.days.filter((res: any) => {
            const isCommon = currentSlot.days.some((result: any) => {
              return res.dayID === result.dayID;
            });
            return isCommon;
          });

          if (commonDays.length > 0) {
            if (
              previousSlot.startTime == currentSlot.startTime &&
              previousSlot.endTime == currentSlot.endTime
            ) {
              let commonDaysValue: any[] = [];

              commonDays.forEach((val: any) => {
                switch (val.dayID) {
                  case 1:
                    commonDaysValue.push('monday');
                    break;

                  case 2:
                    commonDaysValue.push('tuesday');
                    break;

                  case 3:
                    commonDaysValue.push('wednesday');
                    break;

                  case 4:
                    commonDaysValue.push('thursday');
                    break;

                  case 5:
                    commonDaysValue.push('friday');
                    break;

                  case 6:
                    commonDaysValue.push('saturday');
                    break;

                  case 7:
                    commonDaysValue.push('sunday');
                    break;
                }
              });

              const daysList = commonDaysValue
                .map((day: any) => `<span>${day}</span>`)
                .join('&nbsp;');

              Swal.fire({
                title: `<span style='font-size: 17px'>You already make the slot in ${daysList}.</span>`,
                icon: `error`,
                confirmButtonText: 'Ok',
              });
            } else {
              const slotObj =
                this.classForm.value.classSlot[
                this.classForm.value.classSlot.length - 1
                ];

              slotObj.centreID = this.centreID;
              this.classService
                .checkSlotExists(slotObj)
                .subscribe((response: any) => {
                  if (response.message == 'Success') {
                    this.sections.push(this.createSection());
                  } else {
                    let matchedArray: any[] = [];
                    response.result.forEach((val: any) => {
                      switch (val.dayID) {
                        case 1:
                          matchedArray.push('monday');
                          break;

                        case 2:
                          matchedArray.push('tuesday');
                          break;

                        case 3:
                          matchedArray.push('wednesday');
                          break;

                        case 4:
                          matchedArray.push('thursday');
                          break;

                        case 5:
                          matchedArray.push('friday');
                          break;

                        case 6:
                          matchedArray.push('saturday');
                          break;

                        case 7:
                          matchedArray.push('sunday');
                          break;
                      }
                    });

                    const daysList = matchedArray
                      .map((day: any) => `<span>${day}</span>`)
                      .join('&nbsp;');

                    Swal.fire({
                      title: `<span style='font-size: 17px'>You cannot make the slot in ${daysList}.</span>`,
                      icon: `error`,
                      confirmButtonText: 'Ok',
                    });
                  }
                });
            }
          } else {
            const slotObj =
              this.classForm.value.classSlot[
              this.classForm.value.classSlot.length - 1
              ];

            slotObj.centreID = this.centreID;
            this.classService
              .checkSlotExists(slotObj)
              .subscribe((response: any) => {
                if (response.message == 'Success') {
                  this.sections.push(this.createSection());
                } else {
                  let matchedArray: any[] = [];
                  response.result.forEach((val: any) => {
                    switch (val.dayID) {
                      case 1:
                        matchedArray.push('monday');
                        break;

                      case 2:
                        matchedArray.push('tuesday');
                        break;

                      case 3:
                        matchedArray.push('wednesday');
                        break;

                      case 4:
                        matchedArray.push('thursday');
                        break;

                      case 5:
                        matchedArray.push('friday');
                        break;

                      case 6:
                        matchedArray.push('saturday');
                        break;

                      case 7:
                        matchedArray.push('sunday');
                        break;
                    }
                  });

                  const daysList = matchedArray
                    .map((day: any) => `<span>${day}</span>`)
                    .join('&nbsp;');

                  Swal.fire({
                    title: `<span style='font-size: 17px'>You cannot make the slot in ${daysList}.</span>`,
                    icon: `error`,
                    confirmButtonText: 'Ok',
                  });
                }
              });
          }
        } else {
          const slotObj =
            this.classForm.value.classSlot[
            this.classForm.value.classSlot.length - 1
            ];

          slotObj.centreID = this.centreID;
          this.classService
            .checkSlotExists(slotObj)
            .subscribe((response: any) => {
              if (response.message == 'Success') {
                this.sections.push(this.createSection());
              } else {
                let matchedArray: any[] = [];
                response.result.forEach((val: any) => {
                  switch (val.dayID) {
                    case 1:
                      matchedArray.push('monday');
                      break;

                    case 2:
                      matchedArray.push('tuesday');
                      break;

                    case 3:
                      matchedArray.push('wednesday');
                      break;

                    case 4:
                      matchedArray.push('thursday');
                      break;

                    case 5:
                      matchedArray.push('friday');
                      break;

                    case 6:
                      matchedArray.push('saturday');
                      break;

                    case 7:
                      matchedArray.push('sunday');
                      break;
                  }
                });

                const daysList = matchedArray
                  .map((day: any) => `<span>${day}</span>`)
                  .join('&nbsp;');

                Swal.fire({
                  title: `<span style='font-size: 17px'>You cannot make the slot in ${daysList}.</span>`,
                  icon: `error`,
                  confirmButtonText: 'Ok',
                });
              }
            });
        }
      } else {
        this.toastr.error('Form is not valid yet');
      }
    } else {
      this.toastr.error('error');
    }
  }

  removeSection(index: number): void {

    if (this.sections.length > 0) {
      let deletedDay = this.displayDayName[index];
      this.displayDayName.splice(index, 1);
      this.displayDayCareTiming.splice(index, 1);
      this.isDaySelected(deletedDay);
      this.sections.removeAt(index);
    }
    this.endTimeLess[index] = false;
  }

  getDays() {

    // this.spinner.show();
    this.skeletonShow = 'Skelton';
    this.classService.getAllDays().subscribe((data) => {
      if (data.message === 'Success') {
        this.days = data.result;
        this.skeletonShow = '';

      }
      this.skeletonShow = '';

    });
  }

  onSelectAll(event: any, sectionIndex?: number) {
    if (event.target.checked) {
      this.days
        .filter((x: any) => !this.filteredDays.includes(x.day.toLowerCase()))
        .forEach((item: { id: number; day: string }) => {
          if (!this.displayDayName.includes(item.day)) {
            this.displayDayName.push(item.day);
            switch (item.id) {
              case 1:
                this.displayDayCareTiming.push({
                  startTime: this.startTimeOrEndTimeWorkCalendar.monStartTime,
                  endTime: this.startTimeOrEndTimeWorkCalendar.monEndTime,
                });
                break;

              case 2:
                this.displayDayCareTiming.push({
                  startTime: this.startTimeOrEndTimeWorkCalendar.tuesStartTime,
                  endTime: this.startTimeOrEndTimeWorkCalendar.tuesEndTime,
                });
                break;

              case 3:
                this.displayDayCareTiming.push({
                  startTime: this.startTimeOrEndTimeWorkCalendar.wedStartTime,
                  endTime: this.startTimeOrEndTimeWorkCalendar.wedEndTime,
                });
                break;

              case 4:
                this.displayDayCareTiming.push({
                  startTime: this.startTimeOrEndTimeWorkCalendar.thuStartTime,
                  endTime: this.startTimeOrEndTimeWorkCalendar.thuEndTime,
                });
                break;

              case 5:
                this.displayDayCareTiming.push({
                  startTime: this.startTimeOrEndTimeWorkCalendar.friStartTime,
                  endTime: this.startTimeOrEndTimeWorkCalendar.friEndTime,
                });
                break;

              case 6:
                this.displayDayCareTiming.push({
                  startTime: this.startTimeOrEndTimeWorkCalendar.satStartTime,
                  endTime: this.startTimeOrEndTimeWorkCalendar.satEndTime,
                });
                break;

              case 7:
                this.displayDayCareTiming.push({
                  startTime: this.startTimeOrEndTimeWorkCalendar.sunStartTime,
                  endTime: this.startTimeOrEndTimeWorkCalendar.sunEndTime,
                });
                break;
            }
            this.sections.push(this.createSection());
            const section = this.classForm.get('classSlot') as FormArray;
            const days = section
              .at(this.sections.length - 1)
              .get('days') as FormArray;

            days.push(
              this.fb.group({
                dayID: item.id,
              })
            );
          }
        });
    } else {
      this.days
        .filter((x: any) => !this.filteredDays.includes(x.day.toLowerCase()))
        .forEach((item: { id: number; day: string }) => {
          let index = this.displayDayName.indexOf(item.day);
          this.displayDayName.splice(index, 1);
          this.displayDayCareTiming.splice(index, 1);
          this.sections.removeAt(index);
        });
    }

    // const daysFormArray = (this.classForm.get('classSlot') as FormArray).get(
    //   'days'
    // ) as FormArray;
    // if (event.target.checked) {
    //   this.clearFormArray(daysFormArray);
    // this.days
    //   .filter((x: any) => !this.filteredDays.includes(x.day.toLowerCase()))
    //   .forEach((item: { id: number; day: string }) => {
    //     daysFormArray.push(this.fb.group({ dayID: item.id }));
    //   });
    // } else {
    //   this.clearFormArray(daysFormArray);
    // }
  }

  resetForm() {
    // Get the FormArray reference
    const classSlotArray = this.classForm.get('classSlot') as FormArray;

    // Remove all elements from the array
    while (classSlotArray.length !== 0) {
      classSlotArray.removeAt(0);
    }

    // Reset the form with default values
    this.classForm.reset({
      id: 0,
      className: '',
      ageGroupID: 0,
      daycareCentreID: 0,
      loginUserID: 0,
      maxCapacity: '',
      staff: '',
      studentRatio: '',
      classSlot: [], // This does not affect FormArray directly
    });
    this.displayDayName = [];
    this.displayDayCareTiming = [];
    this.isDaysSelectMoreThanOne();
  }

  proceededOnBoarding() {
    this.spinner.show();
    this.commonService
      .manageDaycareOnBoarding(this.centreID, 'ManageDaycareCentreClasses')
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            if (!this.onBoardingService.onBoardingData.isCompleteStep4) {
              this.onBoardingService.onBoardingData.isCompleteStep4 = true;
              this.onBoardingService.handleNext('Tab-4');
            } else {
              this.toastr.success(response.activity);
              this.onBoardingService.getCurrentTab();
            }
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err.message);
        },
      });
  }

  previousCapacityInput: number = 0; // Add this to your component class

  ValidateClassCapacityInputNumber(event: any): void {
    const classCapacityCount = event.target.value;
    const enteredValue = Number(classCapacityCount);

    this.enteredValue = enteredValue;
    if (classCapacityCount === '') {
      this.getDayCareCentreDetails(); // Reset data
      this.previousCapacityInput = 0; // Reset previous value
      return;
    }

    if (enteredValue < 1 || enteredValue > 100) {
      event.target.value = null;
      this.classLimit = true;
      return;
    } else {
      this.classLimit = false;
    }

    // if (this.classRoomEdit?.id) {
    //   const classRoomCapacity =
    //     this.classRoomEdit.capacity +
    //     this.daycarecentreDetails.remainingCapacity;

    //   const difference = enteredValue - this.previousCapacityInput;

    //   const newRemaining =
    //     this.daycarecentreDetails.remainingCapacity - difference;

    //   // if (newRemaining < 0) {
    //   //   this.toastr.error('Student limit is over.');
    //   //   this.classForm.patchValue({ maxCapacity: '' });
    //   //   return;
    //   // }

    //   this.daycarecentreDetails.remainingCapacity = newRemaining;
    //   this.previousCapacityInput = enteredValue;
    // } else {
    // if (this.daycarecentreDetails.enrollmentCapacity == null) {
    //   this.daycarecentreDetails.remainingCapacity = 0;
    // }

    // Calculate the change
    //   const difference = enteredValue - this.previousCapacityInput;

    //   const newRemaining =
    //     this.daycarecentreDetails.remainingCapacity - difference;

    //   if (newRemaining < 0) {
    //     this.toastr.error('Student limit is over.');
    //     this.classForm.patchValue({ maxCapacity: '' });
    //     return;
    //   }

    //   this.daycarecentreDetails.remainingCapacity = newRemaining;
    //   this.previousCapacityInput = enteredValue;
    // }
  }

  valueClear() {
    this.editClassRoomCapacity = this.classRoomEdit.capacity;
  }

  onClassDuplicateCheck(event: any) {
    const className = event.target.value;

    const regex = /\b\w+\s\w+\b/;
    if (regex.test(className)) {
      // this.classNameContainSpace = true;
    } else {
      // this.classNameContainSpace = false;

      this.classService
        .onClassDuplicateCheck(this.centreID, className)
        .subscribe(
          (data) => {
            if (data.message === 'duplicate classroom') {
              this.isClassroomDuplicate = true;
              // this.classNameContainSpace = false;
              this.classForm.patchValue({
                className: '',
              });
            } else {
              this.isClassroomDuplicate = false;
            }
          },
          (e) => { }
        );
    }
  }

  validateClassRoomCapacity(event: any) {
    const capacity = event.target.value;
    if (capacity == '') {
      return;
    }
    const inputCapacity = Number(capacity);
    this.classService.getClassroomCapacityByClassID(this.centreID, inputCapacity).subscribe(
      (data) => {
        if (data.message === 'Invalid') {
          this.toastr.error('Classroom capacity exceeded');
          this.classForm.patchValue({ maxCapacity: '' });
        }
      },
      (error) => {
        this.toastr.error('Error fetching classroom capacity');
      }
    );
  }
}
