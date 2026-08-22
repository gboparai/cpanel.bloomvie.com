import {
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserRoleService } from '../../../settings/Permission/user-role/user-role.service';
import { ManageStaffService } from './manage-staff.service';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../../common-component/common.service';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import Swal from 'sweetalert2';
import { CommonModule, DatePipe, NgTemplateOutlet } from '@angular/common';
import { ViewStaffComponent } from '../view-staff/view-staff.component';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TimeFormatAmPmPipe } from '../../../bloomvie-management/dc-appointments-list/time-format.pipe';
import { Console } from 'node:console';
import { TooltipComponent } from '../../../common-component/tooltip/tooltip.component';
import flatpickr from 'flatpickr';

declare var $: any;

interface workCalendar {
  mon: boolean;
  monStartTime: string | null;
  monEndTime: string | null;

  tue: boolean;
  tueStartTime: string | null;
  tueEndTime: string | null;

  wed: boolean;
  wedStartTime: string | null;
  wedEndTime: string | null;

  thu: boolean;
  thuStartTime: string | null;
  thuEndTime: string | null;

  fri: boolean;
  friStartTime: string | null;
  friEndTime: string | null;

  sat: boolean;
  satStartTime: string | null;
  satEndTime: string | null;

  sun: boolean;
  sunStartTime: string | null;
  sunEndTime: string | null;
}

@Component({
  selector: 'app-manage-staff',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgTemplateOutlet,
    CommonModule,
    ViewStaffComponent,
    BreadcrumbComponent,
    NgxPaginationModule,
    TimeFormatAmPmPipe,
    TooltipComponent,
  ],
  providers: [DatePipe],
  templateUrl: './manage-staff.component.html',
  styleUrl: './manage-staff.component.css',
})
export class ManageStaffComponent implements OnInit {
  @ViewChild(ViewStaffComponent) childComponent!: ViewStaffComponent;
  public staffForm: any;
  // public assignmentForm: any;
  public userRoleList: any[] = [];
  public roleSpecializationList: any[] = [];
  public arrIndex1: any;
  private centreID: number = 0;
  private loginUserID: number = 0;
  public UserRoleID: number = 0;
  public isRoleSpecialLizationActive: boolean = false;
  public masterQualificationList: any[] = [];
  // public assignmentList: any[] = [];
  public isQualification: boolean = false;
  // assignmentList: any[] = [];
  // public classList: any[] = [];
  public sectionList: any[] = [];
  public inValidRecords: any[] = [];
  public isAssignmentVisible: boolean = false;
  private file: any;
  private base64String: any;
  public dayCareList: any[] = [];
  public isDayCareListActive: boolean = false;
  public CounsellorID: number = 0;
  public days: any[] = [];
  public availabilityValidationMessage: boolean = false;
  public tocTeachersList: any[] = [];
  public isToc: boolean = false;
  onSelectEdit: any;
  hoveredRow: any = null;

  public workCalendar: workCalendar = {
    mon: false,
    monStartTime: '',
    monEndTime: '',

    tue: false,
    tueStartTime: '',
    tueEndTime: '',

    wed: false,
    wedStartTime: '',
    wedEndTime: '',

    thu: false,
    thuStartTime: '',
    thuEndTime: '',

    fri: false,
    friStartTime: '',
    friEndTime: '',

    sat: false,
    satStartTime: '',
    satEndTime: '',

    sun: false,
    sunStartTime: '',
    sunEndTime: '',
  };

  @Input() InActiveImport: boolean = false;

  public isJobTypeActive: boolean = false;

  public teacherAvailabilityListForm: any;
  public displayDayName: string[] = [];
  public displayDayCareTiming: any[] = [];
  public greaterTimeValidationForEndTime: boolean = false;
  public timeMatchValidationForEndTime: boolean = false;
  public timeMatchValidationForStartTime: boolean = false;
  public greaterTimeValidationForStartTime: boolean = false;
  public jobPostTeachers: any[] = [];
  public itemPerPage: number = 5;
  public currentPage: number = 1;
  public currentPageToc: number = 1;
  public itemPerPageToc: number = 5;
  public isTOCRecord: boolean = false;
  public tocRoleList: any[] = [];
  userID: any;
  startDateInstance: any;
  endDateInstance: any;
  selectedStartDate: any = null;
  selectedEndDate: any = null;
  formattedStartDate: any;
  formattedEndDate: any;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private userRoleService: UserRoleService,
    private manageStaffSerivece: ManageStaffService,
    private route: ActivatedRoute,
    private cookie: CookieService,
    private commonService: CommonService,
    public onBoardingService: OnboardingService,
    private datePipe: DatePipe
  ) {
    this.staffForm = fb.group({
      id: [0],
      userRoleID: [null, [Validators.required]],
      firstName: [null, [Validators.required]],
      lastName: [null],
      email: [null, [Validators.required, Validators.email]],
      assignDaycare: [[]],
      roleSpecializationID: [null],
      salary: ['', Validators.min(1)],
      wages: ['', Validators.min(1)],
      workingHours: ['', Validators.min(1)],
      salaryUnit: [],
      qualification: [[]],
      isActive: [null],
      jobType: [null],
      teacherAvailability: [[]],
      joiningDate: [null, [Validators.required]],
    });

    this.teacherAvailabilityListForm = this.fb.group({
      teacherAvailabilityList: this.fb.array([]),
    });

    // this.assignmentForm = fb.group({
    //   classID: [null, [Validators.required]],
    //   // sectionID: [null, [Validators.required]],
    // });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.InitDatePicker();
    }, 200);
  }

  async ngOnInit() {
    this.userID = parseInt(this.cookie.get('UserId'));
    if (this.cookie.check('UserRoleId')) {
      this.UserRoleID = parseInt(this.cookie.get('UserRoleId'));
    } else if (this.cookie.check('userRoleID')) {
      this.UserRoleID = parseInt(this.cookie.get('userRoleID'));
    }
    // if (isNaN(this.UserRoleID)) {
    //   this.UserRoleID = 3;
    // }

    this.route.queryParamMap.subscribe((params) => {
      // let urlToken:any = params.get('urlToken');
      // if(urlToken){
      // //  this.commonService.TokenMatchQueryParam(urlToken).subscribe({
      // //   // next:(response=>{
      // //   //   // if(response.message=="Success"){
      // //   //   //   this.loginUserID = response.result.id;
      // //   //   //   this.userID = response.result.id;
      // //   //   //   this.centreID = response.result.centreID;
      // //   //   //   this.UserRoleID = response.result.userRoleID;
      // //   //   // }
      // //   //   // else{
      // //   //   //   this.toastr.error("Retry after some time!")
      // //   //   //   this.spinner.hide;
      // //   //   // }
      // //   // })
      // //  })
      // }
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
      // if (this.centreID) {
      if (this.cookie.check('UserId')) {
        this.loginUserID = parseInt(this.cookie.get('UserId'));
      }

      // this.getDaycareClassList();
      // }
      this.getUserRoles();
      this.getDayCare('false');
    });
    await this.getAllDays();
    this.getCentreWorkingDaysByCentreID();
    this.getAllMasterQualification();
    this.onEdit();
    this.DefaultValue();
  }

  DefaultValue() {
    const today = new Date();
    this.staffForm.patchValue({
      joiningDate: this.datePipe.transform(today, 'MM/dd/yyyy'),
    });
  }

  // ngAfterViewInit(): void {
  //     const today = new Date();

  //     this.startDateInstance = flatpickr('#startdatePicker', {
  //       dateFormat: 'm-d-Y',
  //       allowInput: true,
  //       maxDate: today,
  //       onChange: (selectedDates: Date[]) => {
  //         this.selectedStartDate = selectedDates[0];

  //         if (this.endDateInstance) {
  //           this.endDateInstance.set('minDate', this.selectedStartDate);
  //           this.endDateInstance.set('maxDate', today);
  //         }
  //       },
  //     });

  //     this.endDateInstance = flatpickr('#enddatePicker', {
  //       dateFormat: 'm-d-Y',
  //       allowInput: true,
  //       maxDate: today,
  //       onChange: (selectedDates: Date[]) => {
  //         this.selectedEndDate = selectedDates[0];
  //       },
  //     });
  //   }

  get staffFormControls() {
    return this.staffForm.controls;
  }

  createTeacherAvailabiltyForm(): FormGroup {
    return this.fb.group({
      id: [0],
      teacherID: [0],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      dayID: [0],
      isTocTeacher: [false],
    });
  }

  // get teacherAvailabiltyControl
  get teacherAvailabilityList(): FormArray {
    return this.teacherAvailabilityListForm.get('teacherAvailabilityList');
  }

  // add teacher Availabilty
  addTeacherAvailabilty() {
    this.teacherAvailabilityList.push(this.createTeacherAvailabiltyForm());
  }

  removeAvailableList(index: number): void {
    if (this.teacherAvailabilityList.length > 0) {
      this.teacherAvailabilityList.removeAt(index);
    }
  }
  // get assignmentFormControls() {
  //   return this.assignmentForm.controls;
  // }
  getUserRoles() {
    // this.spinner.show();
    this.userRoleService.getAllUserRoles().subscribe({
      next: (response) => {
        if (response.message === 'OK') {
          // const dataList = response.result
          //   .filter(
          //     (item: { id: number; userRole: string }) =>
          //       item.userRole.toUpperCase().trim() === 'TEACHER' ||
          //       item.userRole.toUpperCase().trim() === 'OTHERS'
          //   )
          //   .map((item: { id: number; userRole: string }) => ({
          //     id: item.id,
          //     name: item.userRole,
          //   }));
          if (this.UserRoleID == 3) {
            this.userRoleList = response.result
              .filter((role: any) => [4, 9, 10, 11].includes(role.id))
              .map((item: { id: number; userRole: string }) => ({
                id: item.id,
                name: item.userRole,
              }));
            this.tocRoleList = response.result
              .filter((role: any) => [4, 8, 9, 10, 11].includes(role.id))
              .map((item: { id: number; userRole: string }) => ({
                id: item.id,
                name: item.userRole,
              }));
          } else {
            this.userRoleList = response.result
              .filter((role: any) => [6, 9, 10, 11].includes(role.id))
              .map((item: { id: number; userRole: string }) => ({
                id: item.id,
                name: item.userRole,
              }));
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

  // getAllMasterQualification() {
  //   this.manageStaffSerivece.getMasterQualification().subscribe((item: any) => {
  //     if (item.message == 'OK') {
  //       this.masterQualificationList = item.result;
  //     }
  //   });
  // }

  // mohit

  getAllMasterQualification(): void {
    const type = 'Day Care Admin';

    this.commonService
      .getMasterAllQualifications(this.userID, this.UserRoleID, type)
      .subscribe({
        next: (data) => {
          if (data.message === 'OK') {
            this.masterQualificationList = data.result;

          } else {
            console.error('Error:', data.message);
          }
        },
        error: (err) => {
          console.error('HTTP Error:', err);
        },
      });
  }

  // getDaycareClassList() {
  //   this.spinner.show();
  //   this.manageStaffSerivece.getDaycareClasses(this.centreID).subscribe({
  //     next: (response) => {
  //       if (response.message === 'Success') {
  //         this.classList = response.result;
  //       }
  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 300);
  //     },
  //     error: (err) => {
  //       this.spinner.hide();
  //     },
  //   });
  // }

  onChangeClass(ID: number) {
    this.sectionList = [];
    // this.assignmentForm.get('sectionID').reset();
    this.manageStaffSerivece.getDaycareClassSections(ID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.sectionList = response.result;
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  onSubmitStaff() {
    this.availabilityValidationMessage = false;

    if (!this.staffForm.valid) {
      this.staffForm.markAllAsTouched();
      if (this.teacherAvailabilityList.length === 0) {
        this.availabilityValidationMessage = true;
      }
      return;
    }

    const formValue = { ...this.staffForm.value };
    formValue.qualification = formValue.qualification?.toString();
    formValue.jobType =
      formValue.jobType === 'partTime'
        ? 2
        : formValue.jobType === 'fullTime'
          ? 1
          : 0;
    formValue.centreID = this.centreID;
    formValue.loginUserID = this.loginUserID;
    formValue.id = formValue.id > 0 ? formValue.id : 0;

    const isTeacherOrAdmin =
      formValue.userRoleID === 4 || formValue.userRoleID === 8;
    formValue['joiningDate'] = this.datePipe.transform(
      formValue['joiningDate'],
      'yyyy-MM-dd'
    );
    if (isTeacherOrAdmin) {
      if (this.teacherAvailabilityList.length === 0) {
        this.availabilityValidationMessage = true;
        return;
      }

      if (formValue.userRoleID === 8) {
        const assignmentList = this.buildTOCTeacherAssignments();
        formValue.teacherAvailabiltyList = assignmentList;
      } else {
        formValue.teacherAvailabiltyList = this.teacherAvailabilityList.value;
      }
    } else {
      formValue.teacherAvailability = formValue.teacherAvailability?.toString();
    }

    if (isTeacherOrAdmin && !(formValue.wages || formValue.salary)) {
      this.toastr.error('Please select wages or salary first !!');
      return;
    }

    this.spinner.show();
    this.manageStaffSerivece.manageStaff(formValue, this.UserRoleID).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.message === 'Success') {
          this.DefaultValue();
          this.enableAllDates();
          this.handleSuccess(response.activity);
          this.onSelectEdit = null;

          this.commonService.trigger();
        } else {
          this.toastr.warning(response.message);
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.reset();
        this.toastr.error(err.message);
      },
    });
  }

  private buildTOCTeacherAssignments(): any[] {
    const assignmentList: any[] = [];

    const availabilityList = this.teacherAvailabilityList.getRawValue();
    availabilityList.forEach((item: any) => {
      const tocRecord = this.tocTeachersList.find(
        (data) => data.userID === item.teacherID
      );
      if (tocRecord) {
        const tocTeacherTimeRange = tocRecord.weeks
          .map((week: any) => {
            const match = week.timings.find(
              (t: any) => t.workingDayID === item.dayID
            );
            if (!match) return null;

            const [startDate, endDate] = week.dateRange.split(' - ');
            return { startDate, endDate };
          })
          .filter(Boolean);

        assignmentList.push({ ...item, tocTeacherTimeRange });
      }
    });

    return assignmentList;
  }

  private handleSuccess(activityMessage: string) {
    this.toastr.success(activityMessage);
    this.childComponent.getStaffList();
    this.reset();
    this.staffForm.reset({ id: 0 });
    this.dayCareList = [];
    this.isTOCRecord = false;
    this.isQualification = false;
    this.isJobTypeActive = false;
    this.isRoleSpecialLizationActive = false;
    this.isAssignmentVisible = false;
    this.isDayCareListActive = false;
  }

  getDayCare(type: string) {
    this.manageStaffSerivece
      .getDayCare(type, this.CounsellorID)
      .subscribe((item: any) => {
        if (item.message == 'Success') {
          this.dayCareList = item.result;
        }
      });
  }
  // get All master days
  async getAllDays() {
    let result = await this.manageStaffSerivece.getAllDays().toPromise();
    if (result.message == 'Success') {
      this.days = result.result;
    }
  }

  daysAvailability(dayInfo: any, event: any) {
    if (
      this.staffForm.value.teacherAvailability == null ||
      this.staffForm.value.teacherAvailability == undefined
    ) {
      this.staffForm.patchValue({
        teacherAvailability: [],
        assignDaycare: [],
        qualification: [],
      });
    }

    let checked = event.target.checked;
    if (checked == true) {
      if (!this.displayDayName.includes(dayInfo.day)) {
        this.displayDayName.push(dayInfo.day);
        switch (dayInfo.id) {
          case 1:
            this.displayDayCareTiming.push({
              startTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.monStartTime
              ),
              endTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.monEndTime
              ),
            });
            break;

          case 2:
            this.displayDayCareTiming.push({
              startTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.tueStartTime
              ),
              endTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.tueEndTime
              ),
            });
            break;

          case 3:
            this.displayDayCareTiming.push({
              startTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.wedStartTime
              ),
              endTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.wedEndTime
              ),
            });
            break;

          case 4:
            this.displayDayCareTiming.push({
              startTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.thuStartTime
              ),
              endTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.thuEndTime
              ),
            });
            break;

          case 5:
            this.displayDayCareTiming.push({
              startTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.friStartTime
              ),
              endTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.friEndTime
              ),
            });
            break;

          case 6:
            this.displayDayCareTiming.push({
              startTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.satStartTime
              ),
              endTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.satEndTime
              ),
            });
            break;

          case 7:
            this.displayDayCareTiming.push({
              startTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.sunStartTime
              ),
              endTime: this.commonService.convertTimeStringToDate(
                this.workCalendar.sunEndTime
              ),
            });
            break;
        }
      }

      this.addTeacherAvailabilty();
      let availableTeacher = this.teacherAvailabilityList.at(
        this.teacherAvailabilityList.length - 1
      );

      availableTeacher.patchValue({
        dayID: dayInfo.id,
      });
      this.availabilityValidationMessage =
        this.teacherAvailabilityList.length == 0 ? true : false;
    } else {
      let index = this.displayDayName.indexOf(dayInfo.day);
      this.displayDayName.splice(index, 1);
      this.displayDayCareTiming.splice(index, 1);
      this.removeAvailableList(index);
      this.availabilityValidationMessage =
        this.teacherAvailabilityList.length == 0 ? true : false;
    }
    // if (checked == true) {
    //   this.staffForm.value.teacherAvailability.push(dayInfo.id);
    //   this.availabilityValidationMessage =
    //     this.staffForm.value.teacherAvailability.length == 0 ? true : false;
    // } else {
    //   let indexOf = this.staffForm.value.teacherAvailability.indexOf(
    //     dayInfo.id
    //   );
    //   this.staffForm.value.teacherAvailability.splice(indexOf, 1);
    //   this.availabilityValidationMessage =
    //     this.staffForm.value.teacherAvailability.length == 0 ? true : false;
    // }
  }

  onChangeRole(data: any) {
    if (
      this.staffForm.value.teacherAvailability == null ||
      this.staffForm.value.teacherAvailability == undefined
    ) {
      this.staffForm.patchValue({
        teacherAvailability: [],
        assignDaycare: [],
        qualification: [],
      });
    }

    this.availabilityValidationMessage = false;
    let TeacherAvailability = this.staffForm.get('teacherAvailability');
    if (data != undefined || data != null) {
      if (
        data.name.toUpperCase().trim() == 'TEACHER' ||
        data.name.toUpperCase().trim() == 'TOC'
      ) {
        this.staffForm.patchValue({
          salaryUnit: 'Monthly',
          jobType: 'fullTime',
          joiningDate: this.datePipe.transform(new Date(), 'MM/dd/yyyy'),
        });
        this.isJobTypeActive = true;
        this.isRoleSpecialLizationActive = true;
        this.isAssignmentVisible = true;
        this.getAllMasterQualification();
        this.isQualification = true;
        // TeacherAvailability.setValidators([Validators.required]);
      } else {
        this.masterQualificationList = [];
        this.isQualification = false;
        this.isJobTypeActive = false;
        this.isRoleSpecialLizationActive = false;
        this.isAssignmentVisible = false;
        // TeacherAvailability.clearValidators();
        this.staffForm.patchValue({
          qualification: [],
          teacherAvailability: [],
        });
        // this.assignmentList = [];
        if (data.name.toUpperCase().trim() == 'COUNSELLOR') {
          this.isDayCareListActive = true;
          if (!data.isEdit) {
            this.getDayCare('false');
          }
        } else {
          this.staffForm.patchValue({
            assignDaycare: [],
          });
          this.isDayCareListActive = false;
          this.dayCareList = [];
        }
      }
    } else {
      this.isQualification = false;
      this.isJobTypeActive = false;
      this.isRoleSpecialLizationActive = false;
      this.isAssignmentVisible = false;
      this.isDayCareListActive = false;
      TeacherAvailability.clearValidators();
      // this.assignmentList = [];
      this.dayCareList = [];
    }
    this.staffForm.get('roleSpecializationID').reset();
    this.roleSpecializationList = [];
    this.getRoleSpecificationByRoleID(data.id);
  }

  getRoleSpecificationByRoleID(userRoleID: number) {
    this.manageStaffSerivece.getRoleSpecializationList(userRoleID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.roleSpecializationList = response.result;
        } else {
          this.roleSpecializationList = [];
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  onEdit() {
    this.reset();
    this.spinner.show();

    let localStorageData: any = localStorage.getItem('staffData');
    if (localStorageData) {
      this.spinner.hide();
      // const staffData = JSON.parse(this.cookie.get('staffData'));
      const staffData = JSON.parse(localStorageData);
      this.onSelectEdit = staffData;

      const jsonData = {
        isEdit: true,
        id: staffData.userRoleID,
        name: staffData.userRole,
      };

      if (staffData.userRoleID == 6) {
        this.CounsellorID = parseInt(staffData.id);
      }
      this.getDayCare('true');
      this.onChangeRole(jsonData);
      staffData.assignDaycare = staffData.assignDaycare.map(
        (daycare: any) => daycare.centreID
      );
      // setTimeout(() => {

      this.staffForm.patchValue({
        id: staffData.id,
        userRoleID: staffData.userRoleID,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        isActive: staffData.isActive,
        assignDaycare: staffData.assignDaycare,
        joiningDate: staffData.joiningDate
          ? this.datePipe.transform(staffData.joiningDate, 'MM/dd/yyyy')
          : staffData.joiningDate,
        jobType: staffData.jobTypeID == 1 ? 'fullTime' : 'partTime',
      });

      if (this.UserRoleID == 3) {
        // let teacherAvailability = staffData.teacherAvailability
        //   ? staffData.teacherAvailability.split(',').map(Number)
        //   : '';

        // adding form group

        staffData.teacherAvailability.forEach((item: any) => {
          let dayName = this.days.find((day) => day.id == item.dayID)?.day;
          if (!this.displayDayName.includes(dayName)) {
            this.displayDayName.push(dayName);

            switch (item.dayID) {
              case 1:
                this.displayDayCareTiming.push({
                  startTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.monStartTime
                  ),
                  endTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.monEndTime
                  ),
                });
                break;

              case 2:
                this.displayDayCareTiming.push({
                  startTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.tueStartTime
                  ),
                  endTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.tueEndTime
                  ),
                });
                break;

              case 3:
                this.displayDayCareTiming.push({
                  startTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.wedStartTime
                  ),
                  endTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.wedEndTime
                  ),
                });
                break;

              case 4:
                this.displayDayCareTiming.push({
                  startTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.thuStartTime
                  ),
                  endTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.thuEndTime
                  ),
                });
                break;

              case 5:
                this.displayDayCareTiming.push({
                  startTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.friStartTime
                  ),
                  endTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.friEndTime
                  ),
                });
                break;

              case 6:
                this.displayDayCareTiming.push({
                  startTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.satStartTime
                  ),
                  endTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.satEndTime
                  ),
                });
                break;

              case 7:
                this.displayDayCareTiming.push({
                  startTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.sunStartTime
                  ),
                  endTime: this.commonService.convertTimeStringToDate(
                    this.workCalendar.sunEndTime
                  ),
                });
                break;
            }
          }
          let teacherAvailabiltyControls = this.createTeacherAvailabiltyForm();
          teacherAvailabiltyControls.patchValue({
            id: item.id,
            teacherID: item.teacherID,
            startTime: item.startTime,
            endTime: item.endTime,
            dayID: item.dayID,
          });

          this.teacherAvailabilityList.push(teacherAvailabiltyControls);
        });

        let userQualification = staffData.userQualification
          ? staffData.userQualification.split(',').map(Number)
          : '';

        let userRoleID: number =
          staffData.userRoleID == 8 ? 4 : staffData.userRoleID;
        this.getRoleSpecificationByRoleID(userRoleID);

        this.staffForm.patchValue({
          // teacherAvailability: teacherAvailability,
          salary: staffData.salary,
          wages: staffData.wages,
          salaryUnit: staffData.salaryUnit,
          workingHours: staffData.workingHours,
          qualification: userQualification,
          roleSpecializationID: staffData.roleSpecializationID,
        });
      }

      if (staffData.userRoleID == 8) {
        this.toggleTOCRecord(true);
        this.isJobTypeActive = true;
        this.isRoleSpecialLizationActive = true;
        this.isAssignmentVisible = true;
        this.isQualification = true;
        this.isTOCRecord = true;
        this.staffForm.patchValue({
          salaryUnit: 'Daily',
        });
        this.isToc = true;
      }

      // }, 300);

      // this.assignmentList = staffData.assignmentList;

      // this.cookie.delete('staffData');
      localStorage.removeItem('staffData');
    } else {
      this.spinner.hide();
    }
  }

  // import from toc teachers
  importTocStaff(tocStaff: any) {
    this.reset();

    const enableDate = tocStaff.weeks.map((item: any) => {
      const splitedValue = item.dateRange.split(' - ');
      return this.datePipe.transform(splitedValue[0], 'MM/dd/yyyy');
    });

    this.startDateInstance.set('enable', enableDate);
    this.isTOCRecord = true;
    let userRoleID: number = tocStaff.userRoleID == 8 ? 4 : tocStaff.userRoleID;
    this.getRoleSpecificationByRoleID(userRoleID);
    this.isJobTypeActive = true;
    this.isRoleSpecialLizationActive = true;
    this.isAssignmentVisible = true;
    this.isQualification = true;
    let qualifications = tocStaff.qualificationID.split(',').map(Number);
    this.staffForm.patchValue({
      salaryUnit: 'Daily',
    });
    this.isToc = true;
    const currentDate = new Date();
    this.staffForm.patchValue({
      id: tocStaff.userID,
      userRoleID: tocStaff.userRoleID,
      firstName: tocStaff.firstName,
      lastName: tocStaff.lastName,
      email: tocStaff.email,
      roleSpecializationID: tocStaff.roleSpecializationID,
      qualification: qualifications,
      jobType: 'partTime',
      isActive: tocStaff.isActive,
      joiningDate: this.datePipe.transform(currentDate, 'MM/dd/yyyy'),
    });

    // toc record timings
    let availability = tocStaff.weeks[0].timings;

    availability.forEach((item: any) => {
      if (!this.displayDayName.includes(item.workingDayName)) {
        this.displayDayName.push(item.workingDayName);

        switch (item.workingDayID) {
          case 1:
            this.displayDayCareTiming.push({
              startTime: this.workCalendar.monStartTime,
              endTime: this.workCalendar.monEndTime,
            });
            break;

          case 2:
            this.displayDayCareTiming.push({
              startTime: this.workCalendar.tueStartTime,
              endTime: this.workCalendar.tueEndTime,
            });
            break;

          case 3:
            this.displayDayCareTiming.push({
              startTime: this.workCalendar.wedStartTime,
              endTime: this.workCalendar.wedEndTime,
            });
            break;

          case 4:
            this.displayDayCareTiming.push({
              startTime: this.workCalendar.thuStartTime,
              endTime: this.workCalendar.thuEndTime,
            });
            break;

          case 5:
            this.displayDayCareTiming.push({
              startTime: this.workCalendar.friStartTime,
              endTime: this.workCalendar.friEndTime,
            });
            break;

          case 6:
            this.displayDayCareTiming.push({
              startTime: this.workCalendar.satStartTime,
              endTime: this.workCalendar.satEndTime,
            });
            break;

          case 7:
            this.displayDayCareTiming.push({
              startTime: this.workCalendar.sunStartTime,
              endTime: this.workCalendar.sunEndTime,
            });
            break;
        }
      }
      let teacherAvailabiltyControls = this.createTeacherAvailabiltyForm();
      teacherAvailabiltyControls.patchValue({
        id: item.id ? item.id : 0,
        teacherID: tocStaff.userID,
        startTime: item.startTime,
        endTime: item.endTime,
        dayID: item.workingDayID,
        isTocTeacher: true,
      });

      this.teacherAvailabilityList.push(teacherAvailabiltyControls);
    });

    //   let dayName = this.days.find((day) => day.id == item.dayID)?.day;
    //   if (!this.displayDayName.includes(dayName)) {
    //     this.displayDayName.push(dayName);

    //     switch (item.dayID) {
    //       case 1:
    //         this.displayDayCareTiming.push({
    //           startTime: this.workCalendar.monStartTime,
    //           endTime: this.workCalendar.monEndTime,
    //         });
    //         break;

    //       case 2:
    //         this.displayDayCareTiming.push({
    //           startTime: this.workCalendar.tueStartTime,
    //           endTime: this.workCalendar.tueEndTime,
    //         });
    //         break;

    //       case 3:
    //         this.displayDayCareTiming.push({
    //           startTime: this.workCalendar.wedStartTime,
    //           endTime: this.workCalendar.wedEndTime,
    //         });
    //         break;

    //       case 4:
    //         this.displayDayCareTiming.push({
    //           startTime: this.workCalendar.thuStartTime,
    //           endTime: this.workCalendar.thuEndTime,
    //         });
    //         break;

    //       case 5:
    //         this.displayDayCareTiming.push({
    //           startTime: this.workCalendar.friStartTime,
    //           endTime: this.workCalendar.friEndTime,
    //         });
    //         break;

    //       case 6:
    //         this.displayDayCareTiming.push({
    //           startTime: this.workCalendar.satStartTime,
    //           endTime: this.workCalendar.satEndTime,
    //         });
    //         break;

    //       case 7:
    //         this.displayDayCareTiming.push({
    //           startTime: this.workCalendar.sunStartTime,
    //           endTime: this.workCalendar.sunEndTime,
    //         });
    //         break;
    //     }
    //   }
    //   let teacherAvailabiltyControls = this.createTeacherAvailabiltyForm();
    //   teacherAvailabiltyControls.patchValue({
    //     id: item.id,
    //     teacherID: item.teacherID,
    //     startTime: item.startTime,
    //     endTime: item.endTime,
    //     dayID: item.dayID,
    //   });

    //   this.teacherAvailabilityList.push(teacherAvailabiltyControls);
    // });
    this.toggleTOCRecord(true);
    $('#tocModal').modal('hide');
  }

  enableAllDates() {
    this.startDateInstance.destroy();
    const today = new Date();
    this.startDateInstance = flatpickr('#startdatePicker', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      minDate: today,
    });
  }

  // import from job posting
  ImportValueFromJobPosting(jobPostingTeachers: any) {
    this.getRoleSpecificationByRoleID(jobPostingTeachers.userRoleID);
    this.isJobTypeActive = true;
    this.isRoleSpecialLizationActive = true;
    this.isAssignmentVisible = true;
    this.isQualification = true;
    let qualifications = jobPostingTeachers.qualifications
      .split(',')
      .map(Number);
    const currentDate = new Date();
    this.staffForm.patchValue({
      id: jobPostingTeachers.id,
      userRoleID: jobPostingTeachers.userRoleID,
      firstName: jobPostingTeachers.firstName,
      lastName: jobPostingTeachers.lastName,
      email: jobPostingTeachers.email,
      roleSpecializationID: jobPostingTeachers.roleSpecification,
      qualification: qualifications,
      jobType: jobPostingTeachers.jobTypeID == 1 ? 'fullTime' : 'partTime',
      isActive: jobPostingTeachers.isActive,
      joiningDate: this.datePipe.transform(currentDate, 'MM/dd/yyyy'),
    });

    $('#jobPostingModal').modal('hide');
  }

  isChecked(day: any) {
    // if (this.staffForm.value.teacherAvailability != null) {
    //   return this.staffForm.value.teacherAvailability.includes(day.id)
    //     ? true
    //     : false;
    // } else {
    //   return false;
    // }

    return this.displayDayName.includes(day.day) ? true : false;
  }

  // get work calendar
  getCentreWorkingDaysByCentreID() {
    this.manageStaffSerivece
      .getCentreWorkingDaysByCentreID(this.centreID)
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          this.workCalendar.mon = result.result.mon;
          this.workCalendar.monStartTime = result.result.monStartTime;
          this.workCalendar.monEndTime = result.result.monEndTime;

          this.workCalendar.tue = result.result.tues;
          this.workCalendar.tueStartTime = result.result.tuesStartTime;
          this.workCalendar.tueEndTime = result.result.tuesEndTime;

          this.workCalendar.wed = result.result.wed;
          this.workCalendar.wedStartTime = result.result.wedStartTime;
          this.workCalendar.wedEndTime = result.result.wedEndTime;

          this.workCalendar.thu = result.result.thu;
          this.workCalendar.thuStartTime = result.result.thuStartTime;
          this.workCalendar.thuEndTime = result.result.thuEndTime;

          this.workCalendar.fri = result.result.fri;
          this.workCalendar.friStartTime = result.result.friStartTime;
          this.workCalendar.friEndTime = result.result.friEndTime;

          this.workCalendar.sat = result.result.sat;
          this.workCalendar.satStartTime = result.result.satStartTime;
          this.workCalendar.satEndTime = result.result.satEndTime;

          this.workCalendar.sun = result.result.sun;
          this.workCalendar.sunStartTime = result.result.sunStartTime;
          this.workCalendar.sunEndTime = result.result.sunEndTime;
        }
      });
  }

  isDisabledDays(day: any) {
    let dayName = day.day;
    dayName = dayName.toLowerCase();
    switch (dayName) {
      case 'monday':
        return this.workCalendar.mon == true && this.isTOCRecord == false
          ? false
          : true;
        break;

      case 'tuesday':
        return this.workCalendar.tue == true && this.isTOCRecord == false
          ? false
          : true;
        break;

      case 'wednesday':
        return this.workCalendar.wed == true && this.isTOCRecord == false
          ? false
          : true;
        break;

      case 'thursday':
        return this.workCalendar.thu == true && this.isTOCRecord == false
          ? false
          : true;
        break;

      case 'friday':
        return this.workCalendar.fri == true && this.isTOCRecord == false
          ? false
          : true;
        break;

      case 'saturday':
        return this.workCalendar.sat == true && this.isTOCRecord == false
          ? false
          : true;
        break;

      case 'sunday':
        return this.workCalendar.sun == true && this.isTOCRecord == false
          ? false
          : true;
        break;

      default:
        return false;
    }
  }

  resetjoiningDate(dayName: string) {
    this.staffForm.patchValue({
      joiningDate: null,
    });

    this.toastr.error(
      `The daycare is closed on ${dayName}. Please choose another day.`
    );
  }

  validateJoiningDate(event: Event) {
    const date = (event.target as HTMLInputElement).value;

    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dateFormat = new Date(date);

    const day = dateFormat.getDay();
    switch (dayNames[day]) {
      case 'monday':
        if (this.workCalendar.mon == false) {
          this.resetjoiningDate(dayNames[day]);
        }
        break;
      case 'tuesday':
        if (this.workCalendar.tue == false) {
          this.resetjoiningDate(dayNames[day]);
        }
        break;

      case 'wednesday':
        if (this.workCalendar.wed == false) {
          this.resetjoiningDate(dayNames[day]);
        }
        break;

      case 'thursday':
        if (this.workCalendar.thu == false) {
          this.resetjoiningDate(dayNames[day]);
        }
        break;

      case 'friday':
        if (this.workCalendar.fri == false) {
          this.resetjoiningDate(dayNames[day]);
        }
        break;

      case 'saturday':
        if (this.workCalendar.sat == false) {
          this.resetjoiningDate(dayNames[day]);
        }
        break;

      case 'sunday':
        if (this.workCalendar.sun == false) {
          this.resetjoiningDate(dayNames[day]);
        }
        break;
    }
  }

  // open import from job posting modal
  async jobPostingModal() {
    this.isTOCRecord = false;
    this.toggleTOCRecord(false);
    this.reset();
    await this.getAllJobPostingTeachersByCentreID(this.centreID);
    this.staffForm.patchValue({
      salaryUnit: 'Monthly',
    });
  }

  InitDatePicker(): void {
    const today = new Date();
    this.startDateInstance = flatpickr('#startdatePicker', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      minDate: today,
    });
  }

  async getAllJobPostingTeachersByCentreID(CentreID: number) {
    // this.spinner.show();
    this.jobPostTeachers = [];
    let data = await this.manageStaffSerivece
      .getAllJobPostingTeachersByCentreID(CentreID)
      .toPromise();
    if (data.message == 'Success') {
      this.jobPostTeachers = data.result.map((item: any) => {
        let qualificationArray = item.qualifications
          .split(',')
          .map((list: string) => parseInt(list));
        let qualificationName = '';

        this.masterQualificationList.forEach((result: any) => {
          if (qualificationArray.includes(result.id)) {
            qualificationName =
              qualificationName == ''
                ? result.name
                : `${qualificationName}, ${result.name}`;
          }
        });

        return {
          ...item,
          qualificationNames: qualificationName,
        };
      });

      setTimeout(() => {
        $('#jobPostingModal').modal('show');
        // this.spinner.hide();
      }, 100);
    } else {
      Swal.fire(data.message, '', 'warning');
      // this.spinner.hide();
    }
  }

  toggleTOCRecord(disable: boolean) {
    this.isTOCRecord = disable;

    this.teacherAvailabilityList.controls.forEach((group, i) => {
      const startCtrl = group.get('startTime');
      const endCtrl = group.get('endTime');

      if (disable) {
        startCtrl?.disable({ emitEvent: false });
        endCtrl?.disable({ emitEvent: false });
      } else {
        startCtrl?.enable({ emitEvent: false });
        endCtrl?.enable({ emitEvent: false });
      }

    });
  }

  async tocModal() {
    this.reset();
    // this.teacherAvailabilityList.clear();
    await this.getAllAvailableTocTeachers(this.centreID);
  }

  async getAllAvailableTocTeachers(centreID: number) {
    // this.spinner.show();
    this.tocTeachersList = [];
    let response = await this.manageStaffSerivece
      .getAllAvailableTocTeachers(centreID)
      .toPromise();
    if (response.message == 'Success') {
      let tocList = response.result.map((item: any) => {
        let qualificationArray = item.qualificationID
          .split(',')
          .map((list: string) => parseInt(list));
        let qualificationName = '';

        this.masterQualificationList.forEach((result: any) => {
          if (qualificationArray.includes(result.id)) {
            qualificationName =
              qualificationName == ''
                ? result.name
                : `${qualificationName}, ${result.name}`;
          }
        });

        return {
          ...item,
          qualificationNames: qualificationName,
        };
      });

      let differentRecord: any = [];
      tocList.forEach((item: any) => {
        let isExists = differentRecord.find(
          (result: any) => result.userID == item.userID
        );
        if (isExists == undefined) {
          differentRecord.push(item);
        }
      });

      let weekSetup: any = [];

      // pending commit hai yeh and sure bhi nhi hai

      // differentRecord.forEach((item: any) => {
      //   tocList.forEach((data: any) => {
      //     if (data.userID == item.userID) {
      //       let weekArray: any = [];
      //       // for weeks

      //       tocList.forEach((res: any) => {
      //         let timings: any = [];

      //         if (res.userID == data.userID) {
      //           //for timings

      //           tocList.forEach((info: any) => {
      //             if (
      //               info.userID == res.userID &&
      //               info.weekName == res.weekName
      //             ) {
      //               let isExists = timings.find(
      //                 (a: any) => a.workingDayID == info.workingDayID
      //               );
      //               if (isExists == undefined) {
      //                 const obj = {
      //                   workingDayName: info.workingDayName,
      //                   workingDayID: info.workingDayID,
      //                   startTime: info.slotStartTime,
      //                   endTime: info.slotEndTime,
      //                 };

      //                 timings.push(obj);
      //               }
      //             }
      //           });

      //           let isExists = weekArray.find(
      //             (x: any) => x.weekName == res.weekName
      //           );
      //           if (isExists == undefined) {
      //             const obj = {
      //               dateRange: res.dateRange,
      //               weekName: res.weekName,
      //               timings: timings,
      //             };
      //             weekArray.push(obj);
      //           }
      //         }
      //       });

      //       let obj = {
      //         firstName: data.firstName,
      //         lastName: data.lastName,
      //         qualificationID: data.qualificationID,
      //         qualificationNames: data.qualificationNames,
      //         userID: data.userID,
      //         id: data.id,
      //         email: data.email,
      //         userRoleID: data.userRoleID,
      //         isActive: data.isActive,
      //         weeks: weekArray,
      //       };

      //       let isExists = weekSetup.find(
      //         (item: any) => item.userID == data.userID
      //       );
      //       if (isExists == undefined) {
      //         weekSetup.push(obj);
      //       }
      //     }
      //   });
      // });

      differentRecord.forEach((item: any) => {
        const userRecords = tocList.filter(
          (record: any) => record.userID === item.userID
        );

        const weekMap = new Map<string, any>();

        userRecords.forEach((rec: any) => {
          const weekKey = rec.weekName;

          if (!weekMap.has(weekKey)) {
            weekMap.set(weekKey, {
              dateRange: rec.dateRange,
              weekName: rec.weekName,
              timings: [],
            });
          }

          const week = weekMap.get(weekKey);

          const timingExists = week.timings.some(
            (t: any) => t.workingDayID === rec.workingDayID
          );

          if (!timingExists) {
            week.timings.push({
              workingDayName: rec.workingDayName,
              workingDayID: rec.workingDayID,
              startTime: rec.slotStartTime,
              endTime: rec.slotEndTime,
            });
          }
        });

        const userDataExists = weekSetup.some(
          (w: any) => w.userID === item.userID
        );

        if (!userDataExists && userRecords.length > 0) {
          const ref = userRecords[0]; // use the first matched record for user meta
          weekSetup.push({
            firstName: ref.firstName,
            lastName: ref.lastName,
            teacherName: ref.teacherName,
            qualificationID: ref.qualificationID,
            qualificationNames: ref.qualificationNames,
            userID: ref.userID,
            id: ref.id,
            email: ref.email,
            userRoleID: ref.userRoleID,
            isActive: ref.isActive,
            roleSpecializationID: ref.roleSpecializationID,
            weeks: Array.from(weekMap.values()),
          });
        }
      });

      this.tocTeachersList = weekSetup;
      setTimeout(() => {
        // this.spinner.hide();
        $('#tocModal').modal('show');
      }, 100);
    } else {
      // this.spinner.hide();
      Swal.fire(response.message, '', 'warning');
    }
  }

  // onEdit(item: any) {
  //   const jsonData = {
  //     id: item.userRoleID,
  //     name: item.userRole
  //   };
  //   this.onChangeRole(jsonData);

  //   setTimeout(() => {
  //     this.staffForm.patchValue({
  //       id: item.id,
  //       userRoleID: item.userRoleID,
  //       firstName: item.firstName,
  //       lastName: item.lastName,
  //       email: item.email,
  //       roleSpecializationID: item.roleSpecializationID,
  //       isActive: item.isActive,
  //     });
  //   }, 300);
  //   this.assignmentList = item.assignmentList;
  // }

  // onEditSection(item: any, arrIndex: number) {
  //   this.onChangeClass(item.classID);
  //   this.assignmentForm.patchValue({
  //     classID: item.classID,
  //     // sectionID: item.sectionID,
  //   });
  //   this.arrIndex1 = arrIndex;
  // }

  // onRemoveSection(arrIndex: number) {
  //   Swal.fire({
  //     title: 'Confirmation',
  //     text: 'Are you sure you want to delete this section?',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Confirm',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.assignmentList.splice(arrIndex, 1);
  //     }
  //   });
  // }
  async onChangeEmail() {
    const emailControl = this.staffForm.get('email');
    if (emailControl.errors?.required || emailControl.errors?.email) {
      return;
    }
    try {
      const isDuplicate = await this.commonService
        .validateDuplicateRecord('UserMaster', 'email', emailControl.value)
        .toPromise();
      if (isDuplicate) {
        emailControl.setErrors({ duplicateEmail: true });
      } else {
        if (emailControl.errors && emailControl.errors.duplicateEmail) {
          delete emailControl.errors.duplicateEmail;
          emailControl.setErrors(
            Object.keys(emailControl.errors).length > 0
              ? emailControl.errors
              : null
          );
        }
      }
    } catch (error: any) {
      this.toastr.error(error.message);
    }
  }

  proceededOnBoarding() {
    this.spinner.show();
    this.commonService
      .manageDaycareOnBoarding(this.centreID, 'ManageDaycareStaff')
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            if (!this.onBoardingService.onBoardingData.isCompleteStep5) {
              this.onBoardingService.onBoardingData.isCompleteStep5 = true;
              this.onBoardingService.handleNext('Tab-5');
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

  // isDuplicateEntry(jsonData: any, currentIndex: number): boolean {
  //   return this.assignmentList.some(
  //     (item, index) =>
  //       index !== currentIndex && item.classID === jsonData.classID
  //     // && item.sectionID === jsonData.sectionID
  //   );
  // }

  reset() {
    this.isTOCRecord = false;
    this.isToc = false;
    this.availabilityValidationMessage = false;
    this.greaterTimeValidationForEndTime = false;
    this.timeMatchValidationForEndTime = false;
    this.timeMatchValidationForStartTime = false;
    this.greaterTimeValidationForStartTime = false;
    this.isQualification = false;
    this.isJobTypeActive = false;
    this.isRoleSpecialLizationActive = false;
    this.isAssignmentVisible = false;
    this.isDayCareListActive = false;
    this.dayCareList = [];
    this.teacherAvailabilityList.clear();
    this.displayDayName = [];
    this.displayDayCareTiming = [];
    this.staffForm.reset({ id: 0 });
    this.toggleTOCRecord(false);
    this.onSelectEdit = null;
  }

  //validating start time
  ValidateStartTime(index: number) {
    // const time: any = index + ':00';

    let startTime = this.teacherAvailabilityListForm.value
      .teacherAvailabilityList[index].startTime
      ? this.teacherAvailabilityListForm.value.teacherAvailabilityList[index]
        .startTime + ':00'
      : this.teacherAvailabilityListForm.value.teacherAvailabilityList[index]
        .startTime;
    let endTime = this.teacherAvailabilityListForm.value
      .teacherAvailabilityList[index].endTime
      ? this.teacherAvailabilityListForm.value.teacherAvailabilityList[index]
        .endTime + ':00'
      : this.teacherAvailabilityListForm.value.teacherAvailabilityList[index]
        .endTime;
    let teacherListControl = this.teacherAvailabilityList.at(index);

    if (endTime != null) {
      if (startTime < endTime) {
        if (
          this.displayDayCareTiming[index].startTime > startTime ||
          this.displayDayCareTiming[index].endTime < startTime
        ) {
          this.greaterTimeValidationForStartTime = false;
          this.timeMatchValidationForStartTime = true;

          $('#' + index + '_startTime').val(null);
          teacherListControl.patchValue({
            startTime: null,
          });
        } else {
          this.greaterTimeValidationForStartTime = false;
          this.timeMatchValidationForStartTime = false;
        }
      } else {
        $('#' + index + '_startTime').val(null);
        $('#' + index + '_endTime').val(null);

        teacherListControl.patchValue({
          endTime: null,
          startTime: null,
        });

        this.greaterTimeValidationForStartTime = true;
        this.timeMatchValidationForStartTime = false;
      }
    } else {
      if (
        this.displayDayCareTiming[index].startTime > startTime ||
        this.displayDayCareTiming[index].endTime < startTime
      ) {
        this.greaterTimeValidationForStartTime = false;
        this.timeMatchValidationForStartTime = true;

        $('#' + index + '_startTime').val(null);

        teacherListControl.patchValue({
          startTime: null,
        });
      } else {
        this.greaterTimeValidationForStartTime = false;
        this.timeMatchValidationForStartTime = false;
      }
    }
  }

  // Validating End Time
  ValidateEndTime(index: number) {
    let endTime = this.teacherAvailabilityListForm.value
      .teacherAvailabilityList[index].endTime
      ? this.teacherAvailabilityListForm.value.teacherAvailabilityList[index]
        .endTime + ':00'
      : this.teacherAvailabilityListForm.value.teacherAvailabilityList[index]
        .endTime;
    let startTime = this.teacherAvailabilityListForm.value
      .teacherAvailabilityList[index].startTime
      ? this.teacherAvailabilityListForm.value.teacherAvailabilityList[index]
        .startTime + ':00'
      : this.teacherAvailabilityListForm.value.teacherAvailabilityList[index]
        .startTime;
    let teacherListControl = this.teacherAvailabilityList.at(index);

    if (startTime != null) {
      if (startTime < endTime) {
        if (
          this.displayDayCareTiming[index].startTime > endTime ||
          this.displayDayCareTiming[index].endTime < endTime
        ) {
          $('#' + index + '_endTime').val(null);

          teacherListControl.patchValue({
            endTime: null,
          });

          this.timeMatchValidationForEndTime = true;
          this.greaterTimeValidationForEndTime = false;
        } else {
          this.greaterTimeValidationForEndTime = false;
          this.timeMatchValidationForEndTime = false;
        }
      } else {
        $('#' + index + '_endTime').val(null);
        $('#' + index + '_startTime').val(null);

        teacherListControl.patchValue({
          endTime: null,
          startTime: null,
        });

        this.timeMatchValidationForEndTime = false;
        this.greaterTimeValidationForEndTime = true;
      }
    } else {
      if (
        this.displayDayCareTiming[index].startTime > endTime ||
        this.displayDayCareTiming[index].endTime < endTime
      ) {
        $('#' + index + '_endTime').val(null);
        teacherListControl.patchValue({
          endTime: null,
        });

        this.timeMatchValidationForEndTime = true;
        this.greaterTimeValidationForEndTime = false;
      } else {
        this.greaterTimeValidationForEndTime = false;
        this.timeMatchValidationForEndTime = false;
      }
    }
  }

  //sg(20-03-2025)
  downloadBulkFormatSheet() {
    this.spinner.show();
    if (!this.UserRoleID) {
      console.warn('No UserRole Found');
      this.toastr.error('Failed to download the Admin Excel file.');
      return;
    }
    if (this.UserRoleID == 1) {
      this.manageStaffSerivece
        .downloadExcelSheetFormatBloomvieAdmin()
        .subscribe({
          next: (response) => {
            const base64String = response.result;
            this.downloadExcelFile(
              base64String,
              'BloomvieAdminEmployeeData.xlsx'
            );
          },
          error: (err) => {
            this.toastr.error('Failed to download the Admin Excel file.');
            console.error(err);
            this.spinner.hide();
          },
        });
    } else {
      this.manageStaffSerivece
        .downloadBulkUploadSheetFormat(this.centreID)
        .subscribe({
          next: (response) => {
            const base64String = response.result;
            this.downloadExcelFile(base64String, 'EmployeeData.xlsx');
          },
          error: (err) => {
            this.toastr.error('Failed to download the Excel file.');
            console.error(err);
            this.spinner.hide();
          },
        });
    }
  }
  //   this.manageStaffSerivece
  //     .downloadBulkUploadSheetFormat(this.centreID)
  //     .subscribe({
  //       next: (response) => {
  //         const base64String = response.result;
  //         const byteCharacters = atob(base64String);

  //         const byteNumbers = new Array(byteCharacters.length);
  //         for (let i = 0; i < byteCharacters.length; i++) {
  //           byteNumbers[i] = byteCharacters.charCodeAt(i);
  //         }
  //         const byteArray = new Uint8Array(byteNumbers);
  //         const blob = new Blob([byteArray], {
  //           type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //         });
  //         const url = window.URL.createObjectURL(blob);
  //         const a = document.createElement('a');
  //         a.href = url;
  //         a.download = 'EmployeeData.xlsx';
  //         document.body.appendChild(a);
  //         a.click();
  //         window.URL.revokeObjectURL(url);
  //         document.body.removeChild(a);
  //         this.spinner.hide();
  //       },
  //       error: (err) => {
  //         this.toastr.error('Failed to download the Excel file.');
  //         console.error(err);
  //         this.spinner.hide();
  //       },
  //     });
  // }

  private downloadExcelFile(base64String: string, fileName: string) {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    this.spinner.hide();
  }

  onChangeFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedMimeType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExtension = file.name.split('.').pop();
      if (file.type !== allowedMimeType && fileExtension !== 'xlsx') {
        Swal.fire({
          icon: 'error',
          title: 'Invalid file type',
          text: 'Please upload a valid Excel file (.xlsx)',
        });
        return;
      }
      this.file = file;
    }
  }

  uploadBulkStaff() {
    if (!this.file) {
      Swal.fire({
        icon: 'error',
        title: 'No File Selected',
        text: 'Please choose a file to upload!',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.spinner.show();
    const formData = new FormData();
    formData.append('file', this.file);
    this.manageStaffSerivece
      .uploadBulkStaff(formData, this.centreID)
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.toastr.success(response.activity);
            $('#exampleModal3').modal('hide');

            if (response.result.skipRecords.length > 0) {
              this.inValidRecords = response.result.skipRecords;
              this.base64String = response.result.base64String;
            } else {
              $('#exampleModal').modal('hide');
            }
            this.childComponent.getStaffList();
            this.file = '';
            $('#formFile').val('');
            const formData = new FormData();
            $('#formFile').val('');
          } else {
            this.toastr.warning(response.message);
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
        error: (err) => {
          this.toastr.error(err.message);
          this.spinner.hide();
        },
      });
  }

  // onAssignTeacher() {
  //   if (this.assignmentForm.valid) {
  //     const jsonData = this.assignmentForm.value;
  //     if (this.isDuplicateEntry(jsonData, this.arrIndex1)) {
  //       this.commonService.duplicateRecordWarn();
  //       return;
  //     }

  //     this.manageStaffSerivece
  //       .isClassOrSectionAssigned(
  //         this.assignmentForm.value.classID,
  //         parseInt(this.staffForm.value.id)
  //       )
  //       .subscribe((val: any) => {
  //         if (val.message == 'Success') {
  //           jsonData['assignmentDate'] = new Date().toISOString();
  //           jsonData['className'] = this.classList.find(
  //             (x) => x.id === jsonData.classID
  //           )?.name;
  //           // jsonData['sectionName'] = this.sectionList.find(x => x.id === jsonData.sectionID)?.name;
  //           if (this.arrIndex1 === 0 || this.arrIndex1 > 0) {
  //             this.assignmentList[this.arrIndex1] = jsonData;
  //           } else {
  //             this.assignmentList.push(jsonData);
  //           }
  //           this.assignmentForm.reset();
  //           this.arrIndex1 = null;
  //         } else {
  //           Swal.fire({
  //             icon: 'error',
  //             title: 'Oops...',
  //             text: val.message,
  //           });
  //           this.assignmentForm.reset();
  //         }
  //       });
  //   } else {
  //     this.assignmentForm.markAllAsTouched();
  //   }
  // }

  downloadSkipRecordsSheet() {
    if (this.base64String) {
      const byteCharacters = atob(this.base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Invalid_EmployeeData.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  onBulkUploadModalClose() {
    this.base64String = undefined;
    this.inValidRecords = [];
    this.file = '';
    const fileInput = document.getElementById('formFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  geturlToken() { }
}
