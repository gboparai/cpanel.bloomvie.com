import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
  RouterOutlet,
  Router,
} from '@angular/router';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ManageSchedulerService } from './manage-scheduler.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { SchedulerService } from '../../common-component/scheduler/scheduler.service';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import flatpickr from 'flatpickr';
import {
  TimeFormatAmPmPipe,
  TimeFormatPipe,
} from '../../bloomvie-management/dc-appointments-list/time-format.pipe';
import { CommonService } from '../../common-component/common.service';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from '../../common-component/skeleton-loader/skeleton-loader.component';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

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

interface ApiResponse {
  message?: string;
  result?: any;
  activity?: string;
}

interface teacherAssignmnentObject {
  teacherID?: number;
  slotID?: number;
  classID?: number;
  id?: number;
  tocAssignmentDate?: string;
  slots: createTeacherAssignmentSlotType[];
}

interface createTeacherAssignmentSlotType {
  slotID: number;
  dayID: number;
  dayName: string;
  classSlotID: number;
  teacherID: number;
  startTime: string;
  endTime: string;
  day?: number;
  startDate: string;
  endDate: string;
  isRepeating: true;
}
const dayMap: { [key: number]: string } = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

@Component({
  selector: 'app-manage-scheduler',
  standalone: true,
  imports: [
    RouterLink,
    SkeletonLoaderComponent,
    RouterOutlet,
    BreadcrumbComponent,
    NgSelectModule,
    CommonModule,
    FormsModule,
    TimeFormatPipe,
    ReactiveFormsModule,
    TimeFormatAmPmPipe,
    SkeletonLoaderComponent,
  ],
  providers: [DatePipe],
  templateUrl: './manage-scheduler.component.html',
  styleUrl: './manage-scheduler.component.css',
})
export class ManageSchedulerComponent {
  // Added on 24/06/25 Arsh
  @Output() onBulkAssignmentSuccess = new EventEmitter<void>();
  classList: any;
  centreID: number = 0;
  staffList: any[] = [];
  selectedStaff: any[] = [];
  DayList: any;
  selectedDayIds: number[] = [];
  workCalendarOfWeek: weekDays = {
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  };
  filteredDays: any[] = [];
  // filteredDaysWithIds: { day: string; id: any; }[] | undefined;
  filteredDaysWithIds: { day: string; id: any; isActive: boolean }[] = [];

  isRepeating: boolean = true;

  startDateInstance: any;
  endDateInstance: any;
  selectedStartDate: any = null;
  selectedEndDate: any = null;
  selectedStaffIds: number[] = [];
  selectedStudentIds: number[] = [];
  selectedClassIds: number | null = null;
  daysOfWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  filteredStaffList: any;
  masterDays: any;

  public classDaysID: number[] = [];
  public classDaysSlot: any[] = [];
  public classID: number = 0;
  public className: string = '';
  public dayNameArray: any[] = [];
  public assignClassForm: any;
  public primaryDaycareID: number = 0;
  public teachersData: any[] = [];
  selectedStaffList: any;
  filteredClassList: any;
  assignClassTo: any;
  public AssignmentBO: teacherAssignmnentObject[] = [];
  selectedTeacherId: any;
  selectedDayId: any;
  public greaterTimeValidationForStartTime: boolean = false;
  public greaterTimeValidationForEndTime: boolean = false;
  public timeMatchValidationForStartTime: boolean = false;
  public timeMatchValidationForEndTime: boolean = false;
  public slotCreatedForSomeOtherClass: boolean = false;
  public slotCreatedForSomeOtherClassforEndTime: boolean = false;
  public TempAssignmentList: createTeacherAssignmentSlotType[] = [];
  private indexValue: number = 0;
  public isUpdate: boolean = false;
  filterTeacherDays: any;
  scheduleType: any;
  studentList: any;
  selectedStudentList: any;
  filterStudentDays: any;
  selectedStudentId: any;
  selectedClassStaffRatio: any;
  selectedClassStudentRatio: any;
  classAssignedTeacherIDs: any[] = [];
  disableBackToScheduler: boolean = true;
  classAssignedStudentIDs: any[] = [];
  private viewSlot: boolean = false;
  @Input() type: any;
  @Input() isOnboarding: boolean = false;
  tocFilterAvailabilityDays: any;
  selectedMatchingDates: any;
  skeletonShow = 'Skelton';
  classTimingFilterbySelectedDay: any;

  constructor(
    private spinner: NgxSpinnerService,
    private cookie: CookieService,
    private commonService: CommonService,
    private toastr: ToastrService,
    private manageScheduler: ManageSchedulerService,
    private schedulerService: SchedulerService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.assignClassForm = this.fb.group({
      // slotID: [0],
      dayID: [0],
      // classSlotID: [0],
      teacherID: [0],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      isRepeating: [true],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      classID: 0,
      // description: [''],
      // selectedStaff: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (this.type) {
      this.scheduleType = this.type;
    }
    if (!this.scheduleType) {
      this.route.queryParams.subscribe((params) => {
        const encryptedType = params['type'];
        this.scheduleType = this.commonService.decrypt(encryptedType);
      });
    }

    this.centreID = parseInt(this.cookie.get('CentreID'));
    this.GetAllDays();
    // this.getCentreWorkingDaysByCentreID();
    this.getClassList();

    if (this.scheduleType == 'staff') {
      this.getStaffList();
    } else {
      this.getStudentList();
    }
  }

  startTour() {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          element: '#daysList',
          intro: 'This shows the Days of the week.',
          position: 'bottom',
        },
        {
          element: '#classList',
          intro: 'This shows the classes available.',
        },
        {
          element: '#staffList',
          intro: 'This shows the List of the schedule user.',
        },
        // {
        //   element: '#table-cell-block1',
        //   intro: 'Click here to Edit or Delete the Event.',
        //   position: 'bottom',
        // },
      ],
      showBullets: false,
      exitOnOverlayClick: false,
      showStepNumbers: true,
      nextLabel: 'Next →',
      prevLabel: '← Back',
      doneLabel: 'Finish',
    });
    intro.start();
  }

  ngAfterViewInit(): void {
    const startDate = new Date();
    const endDate = null;

    this.InitDatePicker(startDate, endDate);
  }

  getClassList() {
    this.spinner.show();
    this.manageScheduler.getDaycareClasses(this.centreID).subscribe((data) => {
      setTimeout(() => {
        this.spinner.hide();
      }, 100);
      if (data.message == 'Success') {
        this.classList = data.result;
      }
    });
  }

  async getStaffList() {
    this.spinner.show();
    this.schedulerService
      .getCentreStaffList(this.centreID, '', 'active', true)
      .subscribe({
        next: (response) => {
          setTimeout(() => {
            this.startTour();
            this.spinner.hide();
            this.disableBackToScheduler = false;
          }, 100);
          if (response.message === 'Success') {
            this.staffList = response.result;
          } else {
            this.staffList = [];
          }
        },
        error: (err) => { },
      });
  }

  goToScheduler() {
    this.router.navigate(['scheduler']);
  }

  async getStudentList() {
    this.schedulerService.getStudentList(this.centreID).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.startTour();
          this.disableBackToScheduler = false;
        }, 100);
        if (response.message === 'Success') {
          this.studentList = response.result;
        } else {
          this.studentList = [];
        }
      },
      error: (err) => {
        // this.toastr.error(err.message);
      },
    });
  }

  GetAllDays() {
    this.manageScheduler.GetAllDays().subscribe((data) => {
      if (data.message === 'Success') {
        this.DayList = data.result.sort((a: any, b: any) => b.id - a.id);
        this.masterDays = data.result;
        this.getCentreWorkingDaysByCentreID();
      }
    });
  }

  onDayToggle(day: any): void {
    day.isActive = !day.isActive;
    if (day.isActive) {
      if (!this.selectedDayIds.includes(day.id)) {
        this.selectedDayIds.push(day.id);
      }
    } else {
      this.selectedDayIds = this.selectedDayIds.filter((id) => id !== day.id);
    }
    this.filteredClassList = this.classList.filter((cls: any) =>
      cls.dayID?.some((d: any) => this.selectedDayIds.includes(d.dayID))
    );
  }

  getCentreWorkingDaysByCentreID() {
    this.skeletonShow = 'Skelton';
    this.manageScheduler
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

          Object.values(this.workCalendarOfWeek).forEach(
            (data: any, i: number) => {
              if (i == 0 && data == true) {
                this.filteredDays.push('sunday');
              } else if (i == 1 && data == true) {
                this.filteredDays.push('monday');
              } else if (i == 2 && data == true) {
                this.filteredDays.push('tuesday');
              } else if (i == 3 && data == true) {
                this.filteredDays.push('wednesday');
              } else if (i == 4 && data == true) {
                this.filteredDays.push('thursday');
              } else if (i == 5 && data == true) {
                this.filteredDays.push('friday');
              } else if (i == 6 && data == true) {
                this.filteredDays.push('saturday');
              }
            }
          );

          this.filteredDays = this.filteredDays.map(
            (day: string) => day.charAt(0).toUpperCase() + day.slice(1)
          );

          this.filteredDaysWithIds = this.filteredDays.map(
            (dayName: string) => {
              const matchedDay = this.DayList.find(
                (d: { day: string }) =>
                  d.day.toLowerCase() === dayName.toLowerCase()
              );
              return {
                day: dayName,
                id: matchedDay?.id || null,
                isActive: false,
              };
            }
          );

          this.skeletonShow = '';
        }
        this.skeletonShow = '';
      });
  }

  InitDatePicker(startDate: Date | null, endDate: Date | null) {
    this.startDateInstance = flatpickr('#startdatePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: startDate || undefined,
      maxDate: endDate || undefined,
      onChange: (selectedDates: any) => {
        this.selectedStartDate = selectedDates[0];
      },
    });

    this.endDateInstance = flatpickr('#enddatePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: startDate || undefined,
      maxDate: endDate || undefined,
      onChange: (selectedDates: any) => {
        this.selectedEndDate = selectedDates[0];
      },
    });
  }

  // InitDatePicker() {
  //   const today = new Date();
  //   this.startDateInstance = flatpickr("#startdatePicker", {
  //     dateFormat: 'm-d-Y',
  //     allowInput: true,
  //     minDate: today,
  //     onChange: (selectedDates: any) => {
  //       this.selectedStartDate = selectedDates[0];
  //     }
  //   });

  //   this.endDateInstance = flatpickr("#enddatePicker", {
  //     dateFormat: 'm-d-Y',
  //     allowInput: true,
  //     minDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
  //     onChange: (selectedDates: any) => {
  //       this.selectedEndDate = selectedDates[0];
  //     }
  //   });
  // }

  getDayName(dayID: number): string {
    let dayInfo = this.masterDays.find(
      (item: { id: number }) => item.id == dayID
    );
    return dayInfo.day;
  }

  assignClass(event: any) {
    if (event) {
      this.filteredStaffList = [];
      this.selectedStaffIds = [];
      this.selectedStaffList = [];
      this.primaryDaycareID = event.primaryDayCareID || this.primaryDaycareID;
      this.className = event.name || '';
      this.classID = event.id || 0;
      this.selectedClassStaffRatio = event.staffRatio;
      this.selectedClassStudentRatio = event.studentRatio;
      this.classDaysSlot = event.dayID || [];
      this.classDaysID = this.classDaysSlot.map((item: any) => item.dayID);
      this.dayNameArray = this.classDaysSlot.map((item: any) => {
        return {
          ...item,
          dayName: this.getDayName(item.dayID),
        };
      });

      if (this.scheduleType == 'staff') {
        this.filteredStaffList = this.staffList.filter((staff: any) =>
          staff.teacherAvailability?.some((availability: any) =>
            this.classDaysID.includes(availability.dayID)
          )
        );
        this.getAllAvailableTeachersByCentreID(
          this.classID,
          this.classDaysSlot
        );
      } else {
        this.getAllAvailableTeachersByCentreID(
          this.classID,
          this.classDaysSlot
        );
      }
    } else {
      this.classDaysSlot = [];
      this.classDaysID = [];
      this.classID = 0;
      this.className = '';
      this.teachersData = [];
      this.dayNameArray = [];
      this.filteredStaffList = [];
    }
  }

  trackById(index: number, item: any): number {
    return item?.id;
  }

  getAvailabilityByDay(availabilityList: any[]) {
    if (!Array.isArray(availabilityList) || !Array.isArray(this.classDaysID))
      return null;
    return (
      availabilityList.find((a) => this.classDaysID.includes(a.dayID)) || null
    );
  }

  // using checkbox commented on 17/07/25
  // onRepeatToggle(event: Event): void {
  //   const checkbox = event.target as HTMLInputElement;
  //   this.isRepeating = checkbox.checked;
  //   if (this.tocFilterAvailabilityDays.length > 0) {
  //     const teacherRange = this.tocFilterAvailabilityDays.find(
  //       (x: { partTimeWorkingDays: any }) =>
  //         x.partTimeWorkingDays
  //           ?.split(',')
  //           .map((id: string) => Number(id.trim()))
  //           .includes(this.selectedDayId)
  //     );

  //     if (teacherRange) {
  //       const SD = new Date(teacherRange.partTimeStartDate);
  //       const ED = new Date(teacherRange.partTimeEndDate);

  //       setTimeout(() => {
  //         this.InitDatePicker(SD, ED);
  //       });
  //     }
  //   } else {
  //     const startDate = new Date();
  //     const endDate = null;
  //     setTimeout(() => {
  //       this.InitDatePicker(startDate, endDate);
  //     });
  //   }
  // }

  onRepeatToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isRepeating = input.value === 'true';

    if (this.tocFilterAvailabilityDays.length > 0) {
      const teacherRange = this.tocFilterAvailabilityDays.find(
        (x: { partTimeWorkingDays: any }) =>
          x.partTimeWorkingDays
            ?.split(',')
            .map((id: string) => Number(id.trim()))
            .includes(this.selectedDayId)
      );

      if (teacherRange) {
        const SD = new Date(teacherRange.partTimeStartDate);
        const ED = new Date(teacherRange.partTimeEndDate);
        setTimeout(() => {
          this.InitDatePicker(SD, ED);
        });
      }
    } else {
      const startDate = new Date();
      const endDate = null;
      setTimeout(() => {
        this.InitDatePicker(startDate, endDate);
      });
    }
  }

  // onStaffChange() {
  //   if (this.AssignmentBO.length > 0) {
  //     const assignedTeacherIds = this.AssignmentBO
  //       .flatMap((teacher: any) => teacher.slots || [])
  //       .map((slot: any) => slot.teacherID);

  //     this.selectedStaffList = this.filteredStaffList
  //       .filter((x: { id: number }) => this.selectedStaffIds.includes(x.id))
  //       .map((staff: any) => ({
  //         ...staff,
  //         isChecked: assignedTeacherIds.includes(staff.id)
  //       }));
  //   }
  //   else {
  //     this.selectedStaffList = this.filteredStaffList.filter((x: { id: number }) => this.selectedStaffIds.includes(x.id)).map((staff: any) => ({
  //       ...staff,
  //       isChecked: false
  //     }));
  //   }
  // }

  // onStudentChange() {
  //   if (this.AssignmentBO.length > 0) {
  //     const assignedTeacherIds = this.AssignmentBO
  //       .flatMap((teacher: any) => teacher.slots || [])
  //       .map((slot: any) => slot.teacherID);

  //     this.selectedStudentList = this.studentList
  //       .filter((x: { studentID: number }) => this.selectedStudentIds.includes(x.studentID))
  //       .map((staff: any) => ({
  //         ...staff,
  //         isChecked: assignedTeacherIds.includes(staff.studentID)
  //       }));

  //   }
  //   else {
  //     this.selectedStudentList = this.studentList.filter((x: { studentID: number }) => this.selectedStudentIds.includes(x.studentID)).map((staff: any) => ({
  //       ...staff,
  //       isChecked: false
  //     }));
  //   }
  // }

  //Commented on 02/06/25
  // onStaffChange() {
  //   if (this.AssignmentBO.length > 0) {
  //     const assignedTeacherIds = this.AssignmentBO.flatMap((teacher: any) => teacher.slots || []).map((slot: any) => slot.teacherID);
  //     this.selectedStaffList = this.filteredStaffList.filter((x: { id: number }) => this.selectedStaffIds.includes(x.id)).map((staff: any) => ({
  //         ...staff,
  //         isChecked: assignedTeacherIds.includes(staff.id)
  //       }));
  //   }
  //   else {
  //     if (this.selectedStaffIds.length <= this.selectedClassStaffRatio ) {
  //       this.selectedStaffList = this.filteredStaffList.filter((x: { id: number }) => this.selectedStaffIds.includes(x.id)).map((staff: any) => ({
  //         ...staff,
  //         isChecked: false
  //       }));
  //     }
  //     else {
  //       Swal.fire({
  //         title: 'Do you want to add more staff up to the class-staff ratio?',
  //         showDenyButton: true,
  //         showCancelButton: true,
  //         confirmButtonText: 'Yes',
  //         denyButtonText: `No`,
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           this.selectedStaffList = this.filteredStaffList.filter((x: { id: number }) => this.selectedStaffIds.includes(x.id)).map((staff: any) => ({
  //             ...staff,
  //             isChecked: false
  //           }));
  //         }
  //         else if (result.isDenied || result.isDismissed) {
  //             const staffId = this.selectedStaffIds[this.selectedClassStaffRatio];
  //             this.selectedStaffIds = this.selectedStaffIds.filter(x => x !== staffId);
  //
  //         }
  //       });
  //     }
  //   }
  // }

  //Commented on 02/06/25
  //  onStudentChange() {
  //   if (this.AssignmentBO.length > 0) {
  //     const assignedTeacherIds = this.AssignmentBO.flatMap((teacher: any) => teacher.slots || []).map((slot: any) => slot.teacherID);
  //     this.selectedStudentList = this.studentList.filter((x: { studentID: number }) => this.selectedStudentIds.includes(x.studentID)).map((staff: any) => ({
  //       ...staff,
  //       isChecked: assignedTeacherIds.includes(staff.studentID)
  //     }));
  //   }
  //   else {
  //     if (this.selectedStudentIds.length <= this.selectedClassStudentRatio) {
  //       this.selectedStudentList = this.studentList.filter((x: { studentID: number }) => this.selectedStudentIds.includes(x.studentID)).map((staff: any) => ({
  //         ...staff,
  //         isChecked: false
  //       }));
  //     }
  //     else {
  //       Swal.fire({
  //         title: 'Do you want to add more students up to the class-student ratio?',
  //         showDenyButton: true,
  //         showCancelButton: true,
  //         confirmButtonText: 'Yes',
  //         denyButtonText: `No`,
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           this.selectedStudentList = this.studentList.filter((x: { studentID: number }) => this.selectedStudentIds.includes(x.studentID)).map((staff: any) => ({
  //             ...staff,
  //             isChecked: false
  //           }));
  //         } else if (result.isDenied || result.isDismissed) {
  //             const studentId = this.selectedStudentIds[this.selectedClassStudentRatio];
  //             this.selectedStudentIds = this.selectedStudentIds.filter(x => x !== studentId);
  //         }
  //       });
  //     }

  //   }
  // }

  get isHighlighted() {
    if (this.scheduleType == 'staff') {
      return (id: number) => this.classAssignedTeacherIDs.includes(id);
    } else {
      return (id: number) => this.classAssignedStudentIDs.includes(id);
    }
  }

  onStaffChange() {
    if (this.AssignmentBO.length > 0) {
      const assignedTeacherIds = this.AssignmentBO.flatMap(
        (teacher: any) => teacher.slots || []
      ).map((slot: any) => slot.teacherID);
      this.selectedStaffList = this.filteredStaffList
        .filter((x: { id: number }) => this.selectedStaffIds.includes(x.id))
        .map((staff: any) => ({
          ...staff,
          isChecked: assignedTeacherIds.includes(staff.id),
        }));
    } else {
      const Staff =
        this.classAssignedTeacherIDs.length > 0
          ? this.selectedClassStaffRatio - this.classAssignedTeacherIDs.length
          : this.selectedClassStaffRatio;
      if (Staff != 0) {
        if (this.selectedStaffIds.length <= Staff) {
          this.selectedStaffList = this.filteredStaffList
            .filter((x: { id: number }) => this.selectedStaffIds.includes(x.id))
            .map((staff: any) => ({
              ...staff,
              isChecked: false,
            }));
        } else {
          Swal.fire({
            title: 'Do you want to add more staff up to the class-staff ratio?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: `No`,
          }).then((result) => {
            if (result.isConfirmed) {
              this.selectedStaffList = this.filteredStaffList
                .filter((x: { id: number }) =>
                  this.selectedStaffIds.includes(x.id)
                )
                .map((staff: any) => ({
                  ...staff,
                  isChecked: false,
                }));
            } else if (result.isDenied || result.isDismissed) {
              if (this.classAssignedTeacherIDs.length == 0) {
                const staffId =
                  this.selectedStaffIds[this.selectedClassStaffRatio];
                this.selectedStaffIds = this.selectedStaffIds.filter(
                  (x) => x !== staffId
                );
              } else {
                const lastIndex = this.selectedStaffIds.length - 1;
                const staffId = this.selectedStaffIds[lastIndex];
                this.selectedStaffIds = this.selectedStaffIds.filter(
                  (x) => x !== staffId
                );
              }
            }
          });
        }
      } else {
        // if (this.selectedStaffIds.length <= this.selectedClassStaffRatio) {
        if (
          this.selectedStaffIds.length <= this.selectedClassStaffRatio &&
          (Staff != 0 ||
            this.classAssignedTeacherIDs.some((id) =>
              this.selectedStaffIds.includes(id)
            ))
        ) {
          this.selectedStaffList = this.filteredStaffList
            .filter((x: { id: number }) => this.selectedStaffIds.includes(x.id))
            .map((staff: any) => ({
              ...staff,
              isChecked: false,
            }));
        } else {
          Swal.fire({
            title: 'Do you want to add more staff up to the class-staff ratio?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: `No`,
          }).then((result) => {
            if (result.isConfirmed) {
              this.selectedStaffList = this.filteredStaffList
                .filter((x: { id: number }) =>
                  this.selectedStaffIds.includes(x.id)
                )
                .map((staff: any) => ({
                  ...staff,
                  isChecked: false,
                }));
            } else if (result.isDenied || result.isDismissed) {
              if (this.classAssignedTeacherIDs.length == 0) {
                const staffId =
                  this.selectedStaffIds[this.selectedClassStaffRatio];
                this.selectedStaffIds = this.selectedStaffIds.filter(
                  (x) => x !== staffId
                );
              } else {
                const lastIndex = this.selectedStaffIds.length - 1;
                const staffId = this.selectedStaffIds[lastIndex];
                this.selectedStaffIds = this.selectedStaffIds.filter(
                  (x) => x !== staffId
                );
              }
            }
          });
        }
      }
    }
  }

  onStudentChange() {
    if (this.AssignmentBO.length > 0) {
      const assignedTeacherIds = this.AssignmentBO.flatMap(
        (teacher: any) => teacher.slots || []
      ).map((slot: any) => slot.teacherID);
      this.selectedStudentList = this.studentList
        .filter((x: { studentID: number }) =>
          this.selectedStudentIds.includes(x.studentID)
        )
        .map((staff: any) => ({
          ...staff,
          isChecked: assignedTeacherIds.includes(staff.studentID),
        }));
    } else {
      const stu =
        this.classAssignedStudentIDs.length > 0
          ? this.selectedClassStudentRatio - this.classAssignedStudentIDs.length
          : this.selectedClassStudentRatio;
      if (stu != 0) {
        if (this.selectedStudentIds.length <= stu) {
          this.selectedStudentList = this.studentList
            .filter((x: { studentID: number }) =>
              this.selectedStudentIds.includes(x.studentID)
            )
            .map((staff: any) => ({
              ...staff,
              isChecked: false,
            }));
        } else {
          Swal.fire({
            title:
              'Do you want to add more students up to the class-student ratio?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: `No`,
          }).then((result) => {
            if (result.isConfirmed) {
              this.selectedStudentList = this.studentList
                .filter((x: { studentID: number }) =>
                  this.selectedStudentIds.includes(x.studentID)
                )
                .map((staff: any) => ({
                  ...staff,
                  isChecked: false,
                }));
            } else if (result.isDenied || result.isDismissed) {
              if (this.classAssignedStudentIDs.length == 0) {
                const studentId =
                  this.selectedStudentIds[this.selectedClassStudentRatio];
                this.selectedStudentIds = this.selectedStudentIds.filter(
                  (x) => x !== studentId
                );
              } else {
                const lastIndex = this.selectedStudentIds.length - 1;
                const studentId = this.selectedStudentIds[lastIndex];
                this.selectedStudentIds = this.selectedStudentIds.filter(
                  (x) => x !== studentId
                );
              }
            }
          });
        }
      } else {
        if (
          this.selectedStudentIds.length <= this.selectedClassStudentRatio &&
          (stu != 0 ||
            this.classAssignedStudentIDs.some((id) =>
              this.selectedStudentIds.includes(id)
            ))
        ) {
          this.selectedStudentList = this.studentList
            .filter((x: { studentID: number }) =>
              this.selectedStudentIds.includes(x.studentID)
            )
            .map((staff: any) => ({
              ...staff,
              isChecked: false,
            }));
        } else {
          Swal.fire({
            title:
              'Do you want to add more students up to the class-student ratio?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: `No`,
          }).then((result) => {
            if (result.isConfirmed) {
              this.selectedStudentList = this.studentList
                .filter((x: { studentID: number }) =>
                  this.selectedStudentIds.includes(x.studentID)
                )
                .map((staff: any) => ({
                  ...staff,
                  isChecked: false,
                }));
            } else if (result.isDenied || result.isDismissed) {
              if (this.classAssignedStudentIDs.length == 0) {
                const studentId =
                  this.selectedStudentIds[this.selectedClassStudentRatio];
                this.selectedStudentIds = this.selectedStudentIds.filter(
                  (x) => x !== studentId
                );
              } else {
                const lastIndex = this.selectedStudentIds.length - 1;
                const studentId = this.selectedStudentIds[lastIndex];
                this.selectedStudentIds = this.selectedStudentIds.filter(
                  (x) => x !== studentId
                );
              }
            }
          });
        }
      }
    }
  }

  removeUserId(id: number) {
    if (this.scheduleType == 'staff') {
      this.selectedStaffIds = this.selectedStaffIds.filter((x) => x !== id);
      // this.selectedStaffList = this.filteredStaffList.filter((x: { id: number }) => this.selectedStaffIds.includes(x.id));

      if (this.AssignmentBO.length > 0) {
        const assignedTeacherIds = this.AssignmentBO.flatMap(
          (teacher: any) => teacher.slots || []
        ).map((slot: any) => slot.teacherID);

        this.selectedStaffList = this.filteredStaffList
          .filter((x: { id: number }) => this.selectedStaffIds.includes(x.id))
          .map((staff: any) => ({
            ...staff,
            isChecked: assignedTeacherIds.includes(staff.id),
          }));

        this.AssignmentBO = this.AssignmentBO.map((teacher: any) => {
          const filteredSlots = teacher.slots?.filter(
            (slot: any) => slot.teacherID !== id
          );
          return { ...teacher, slots: filteredSlots };
        }).filter((teacher: any) => teacher.slots && teacher.slots.length > 0);
      } else {
        this.selectedStaffList = this.filteredStaffList.filter(
          (x: { id: number }) => this.selectedStaffIds.includes(x.id)
        );
      }
    } else {
      this.selectedStudentIds = this.selectedStudentIds.filter((x) => x !== id);
      // this.selectedStudentList = this.studentList.filter((x: { studentID: number }) => this.selectedStudentIds.includes(x.studentID));

      if (this.AssignmentBO.length > 0) {
        const assignedStudentIds = this.AssignmentBO.flatMap(
          (teacher: any) => teacher.slots || []
        ).map((slot: any) => slot.teacherID);

        this.selectedStudentList = this.studentList
          .filter((x: { studentID: number }) =>
            this.selectedStudentIds.includes(x.studentID)
          )
          .map((staff: any) => ({
            ...staff,
            isChecked: assignedStudentIds.includes(staff.studentID),
          }));

        this.AssignmentBO = this.AssignmentBO.map((teacher: any) => {
          const filteredSlots = teacher.slots?.filter(
            (slot: any) => slot.teacherID !== id
          );
          return { ...teacher, slots: filteredSlots };
        }).filter((teacher: any) => teacher.slots && teacher.slots.length > 0);
      } else {
        this.selectedStudentList = this.studentList.filter(
          (x: { studentID: number }) =>
            this.selectedStudentIds.includes(x.studentID)
        );
      }
    }
  }

  getNameById(id: number): string {
    if (this.scheduleType == 'staff') {
      const staff = this.staffList.find((x: { id: number }) => x.id === id);
      return staff
        ? `${staff.firstName}${staff.lastName ? ' ' + staff.lastName : ''}`
        : '';
    } else {
      const student = this.studentList.find(
        (x: { studentID: number }) => x.studentID === id
      );
      return student
        ? `${student.studentFirstName}${student.studentLastName ? ' ' + student.studentLastName : ''
        }`
        : '';
    }
  }

  // onStaffToggle(staffDetail: any) {
  //   this.TempAssignmentList = [];
  //   this.selectedTeacherId = staffDetail.id;
  //   if (staffDetail.isChecked) {
  //     const commonDayIds = this.classDaysID.filter((dayId: number) =>
  //       this.selectedDayIds.includes(dayId)
  //     );

  //     this.filterTeacherDays = staffDetail.teacherAvailability?.filter((availability: any) =>
  //       commonDayIds.includes(availability.dayID)
  //     ).map((availability: any) => ({
  //       ...availability,
  //       dayName: dayMap[availability.dayID] || 'Unknown'
  //     }));

  //     setTimeout(() => {
  //       $('#assignClassModal').modal('show');
  //     }, 1);
  //   }
  //   else {
  //     this.AssignmentBO = this.AssignmentBO.map((teacher: any) => {
  //       const filteredSlots = teacher.slots?.filter(
  //         (slot: any) => slot.teacherID !== this.selectedTeacherId
  //       );
  //       return { ...teacher, slots: filteredSlots };
  //     })
  //       .filter((teacher: any) => teacher.slots && teacher.slots.length > 0);

  //     this.selectedTeacherId = [];
  //   }
  // }

  // with TOC
  onStaffToggle(staffDetail: any) {
    this.TempAssignmentList = [];
    this.selectedTeacherId = staffDetail.id;

    if (staffDetail.isChecked) {
      const commonDayIds = this.classDaysID.filter((dayId: number) =>
        this.selectedDayIds.includes(dayId)
      );

      // Main teacherAvailability (regular days)
      this.filterTeacherDays = (staffDetail.teacherAvailability || [])
        .filter((availability: any) =>
          commonDayIds.includes(availability.dayID)
        )
        .map((availability: any) => ({
          ...availability,
          dayName: dayMap[availability.dayID] || 'Unknown',
        }));

      // Separate array for TOC Available Ranges (full objects)
      this.tocFilterAvailabilityDays = [];
      if (
        staffDetail.userRoleID === 8 &&
        Array.isArray(staffDetail.tocTeacherAvailableRange)
      ) {
        this.tocFilterAvailabilityDays =
          staffDetail.tocTeacherAvailableRange.map((toc: any) => ({
            ...toc,
            isTOCRange: true,
          }));
      }

      setTimeout(() => {
        $('#assignClassModal').modal('show');
      }, 1);
    } else {
      this.AssignmentBO = this.AssignmentBO.map((teacher: any) => {
        const filteredSlots = teacher.slots?.filter(
          (slot: any) => slot.teacherID !== this.selectedTeacherId
        );
        return { ...teacher, slots: filteredSlots };
      }).filter((teacher: any) => teacher.slots && teacher.slots.length > 0);

      this.selectedTeacherId = [];
      this.filterTeacherDays = [];
      this.tocFilterAvailabilityDays = [];
    }
  }

  viewUserSlots(staff: any) {
    this.resetForm();
    $('#assignClassModal').modal('show');
    if (this.scheduleType == 'staff') {
      this.selectedTeacherId = staff.id;
      this.viewSlot = true;
      this.TempAssignmentList = this.AssignmentBO.flatMap(
        (teacher: any) =>
          teacher.slots?.filter(
            (slot: any) => slot.teacherID === this.selectedTeacherId
          ) || []
      );
    } else {
      this.selectedStudentId = staff.studentID;
      this.viewSlot = true;
      this.TempAssignmentList = this.AssignmentBO.flatMap(
        (teacher: any) =>
          teacher.slots?.filter(
            (slot: any) => slot.teacherID === this.selectedStudentId
          ) || []
      );
    }
  }

  onStudentToggle(studentDetail: any) {
    this.selectedStudentId = studentDetail.studentID;
    if (studentDetail.isChecked) {
      const commonDayIds = this.classDaysID.filter((dayId: number) =>
        this.selectedDayIds.includes(dayId)
      );

      this.filterStudentDays = commonDayIds.map((dayID: number) => ({
        dayID,
        dayName: dayMap[dayID] || 'Unknown',
      }));

      setTimeout(() => {
        $('#assignClassModal').modal('show');
      }, 1);
    } else {
      this.AssignmentBO = this.AssignmentBO.map((teacher: any) => {
        const filteredSlots = teacher.slots?.filter(
          (slot: any) => slot.teacherID !== this.selectedStudentId
        );
        return { ...teacher, slots: filteredSlots };
      }).filter((teacher: any) => teacher.slots && teacher.slots.length > 0);

      this.selectedStudentId = [];
    }
  }

  onDayCheckboxChange(day: any) {
    if (day.selected) {
      if (!this.selectedDayId.includes(day.dayID)) {
        this.selectedDayId.push(day.dayID);
      }
    } else {
      this.selectedDayId = this.selectedDayIds.filter((id) => id == day.dayID);
    }
  }

  onDayRadioChange(dayId: number) {
    if (this.scheduleType == 'staff') {
      this.selectedDayId = dayId;
      if (this.tocFilterAvailabilityDays.length > 0) {
        const teacherRange = this.tocFilterAvailabilityDays.find(
          (x: { partTimeWorkingDays: any }) =>
            x.partTimeWorkingDays
              ?.split(',')
              .map((id: string) => Number(id.trim()))
              .includes(this.selectedDayId)
        );

        if (teacherRange) {
          const SD = new Date(teacherRange.partTimeStartDate);
          const ED = new Date(teacherRange.partTimeEndDate);

          setTimeout(() => {
            this.InitDatePicker(SD, ED);
          });
        }
      }
    } else {
      this.selectedDayId = dayId;
      var classTime = this.dayNameArray.find(
        (x) => x.dayID == this.selectedDayId
      );
      this.assignClassForm.patchValue({
        startTime: classTime.startTime.split(':').slice(0, 2).join(':'),
        endTime: classTime.endTime.split(':').slice(0, 2).join(':'),
      });
    }
    this.classTimingFilterbySelectedDay = this.dayNameArray.filter(
      (x) => x.dayID == dayId
    );
  }

  startDateChange(event: any) {
    if (!this.isRepeating) {
      const date = new Date(event.target.value);
      const jsDay = date.getDay();
      const dayId = jsDay === 0 ? 7 : jsDay;

      if (this.selectedDayId !== dayId) {
        // this.toastr.warning('Teacher is not available on selected date.');
        this.toastr.warning('Selected day not available in selected date.');
        $('#startdatePicker').val(null);
        return;
      }
    }
  }

  endDateChange(event: any) {
    if (this.isRepeating) {
      const startDate = new Date(this.assignClassForm.value.startDate);
      const endDate = new Date(event.target.value);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return;
      }
      let currentDate = new Date(startDate);
      let hasMatchingDay = false;
      const matchingDates: string[] = [];
      while (currentDate <= endDate) {
        const jsDay = currentDate.getDay();
        const dayId = jsDay === 0 ? 7 : jsDay;
        if (this.selectedDayId == dayId) {
          hasMatchingDay = true;
          break;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (!hasMatchingDay) {
        this.toastr.warning(
          'Selected day not available between selected dates.'
        );
        $('#startdatePicker').val(null);
        $('#enddatePicker').val(null);
      }

      while (currentDate <= endDate) {
        const jsDay = currentDate.getDay();
        const dayId = jsDay === 0 ? 7 : jsDay;
        if (this.selectedDayId == dayId) {
          matchingDates.push(this.formatDateLocal(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      this.selectedMatchingDates = matchingDates;
    }
  }

  formatDateLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are 0-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  getAllAvailableTeachersByCentreID(classId: number, classTimings: any) {
    // this.spinner.show();
    let classTimingsBO = classTimings.map((item: any) => {
      return {
        ...item,
        slotStartTime: item.startTime,
        slotEndTime: item.endTime,
      };
    });
    this.manageScheduler
      .getAllAvailableTeachersByCentreID(
        classId,
        classTimingsBO,
        this.scheduleType
      )
      .subscribe((response: ApiResponse) => {
        if (response.message == 'Success') {
          this.teachersData = response.result;
          setTimeout(() => {
            this.spinner.hide();
          }, 500);

          if (this.scheduleType == 'staff') {
            this.classAssignedTeacherIDs = this.teachersData
              .filter((teacher) =>
                teacher.teacherAssignmentList.some(
                  (assignment: { classID: number }) =>
                    assignment.classID === this.classID
                )
              )
              .map((teacher) => teacher.teacherID);
          } else {
            this.classAssignedStudentIDs = this.teachersData
              .filter((teacher) =>
                teacher.studentAssignmentList.some(
                  (assignment: { classID: number }) =>
                    assignment.classID === this.classID
                )
              )
              .map((teacher) => teacher.studentID);
          }
        } else {
          this.spinner.hide();
        }
      });
  }

  //Commented on 29/05/25
  // ApplyValidationForStartTime() {
  //   let slotStartTime = this.assignClassForm.value.startTime ? this.assignClassForm.value.startTime + ':00' : this.assignClassForm.value.startTime;
  //   let slotEndTime = this.assignClassForm.value.endTime ? this.assignClassForm.value.endTime + ':00' : this.assignClassForm.value.endTime;
  //   let classSlots = this.classDaysSlot.find((item: any) => item.dayID == this.selectedDayId);
  //   let classStartTime = classSlots.startTime;
  //   let classEndTime = classSlots.endTime;
  //   let teacherRecord = this.teachersData.find((item: any) => item.teacherID == this.selectedTeacherId);
  //   let teacherAvailability = teacherRecord.teacherAvailability.find((item: any) => item.dayID == this.selectedDayId);
  //   let teacherStartTime = teacherAvailability.startTime;
  //   let teacherEndTime = teacherAvailability.endTime;
  //   if (slotEndTime != null) {
  //     if (slotStartTime < slotEndTime) {
  //       this.greaterTimeValidationForStartTime = false;
  //       if (slotStartTime >= classStartTime && slotStartTime <= classEndTime) {
  //         if (slotStartTime >= teacherStartTime && slotStartTime <= teacherEndTime) {
  //           if (this.TempAssignmentList.length > 0) {
  //             let isExistsSlot = this.TempAssignmentList.find(
  //               (item: any, index: number) =>
  //                 slotStartTime >= item.startTime + ':00' &&
  //                 slotStartTime <= item.endTime + ':00' &&
  //                 index != this.indexValue
  //             );
  //             if (isExistsSlot) {
  //               this.greaterTimeValidationForStartTime = false;
  //               this.timeMatchValidationForStartTime = true;
  //               // $('#startTime').val(null);
  //               this.assignClassForm.patchValue({
  //                 startTime: null,
  //               });
  //             } else {
  //               this.timeMatchValidationForStartTime = false;
  //               this.greaterTimeValidationForStartTime = false;

  //               let teacherRecord = this.AssignmentBO.find((item: any) => item.teacherID == this.selectedTeacherId);
  //               if (teacherRecord) {
  //                 if (teacherRecord.classID != this.classID) {
  //                   let specificDaySlots = teacherRecord?.slots.find(
  //                     (item: any) =>
  //                       item.day == this.selectedDayId &&
  //                       item.startTime <= slotStartTime &&
  //                       item.endTime >= slotStartTime
  //                   );
  //                   if (specificDaySlots) {
  //                     this.slotCreatedForSomeOtherClass = true;
  //                     this.greaterTimeValidationForStartTime = false;
  //                     this.timeMatchValidationForStartTime = false;
  //                     this.assignClassForm.patchValue({
  //                       startTime: null,
  //                     });
  //                   } else {
  //                     this.slotCreatedForSomeOtherClass = false;
  //                   }
  //                 } else {
  //                   this.slotCreatedForSomeOtherClass = false;
  //                 }
  //               } else {
  //                 this.slotCreatedForSomeOtherClass = false;
  //                 this.greaterTimeValidationForStartTime = false;
  //                 this.timeMatchValidationForStartTime = false;
  //               }
  //             }
  //           }
  //           else {
  //             this.timeMatchValidationForStartTime = false;
  //             this.greaterTimeValidationForStartTime = false;
  //             let teacherRecord = this.AssignmentBO.find((item: any) => item.teacherID == this.selectedTeacherId);
  //             if (teacherRecord) {
  //               if (teacherRecord.classID != this.classID) {
  //                 let specificDaySlots = teacherRecord?.slots.find(
  //                   (item: any) =>
  //                     item.day == this.selectedDayId &&
  //                     item.startTime <= slotStartTime &&
  //                     item.endTime >= slotStartTime
  //                 );
  //                 if (specificDaySlots) {
  //                   this.slotCreatedForSomeOtherClass = true;
  //                   this.greaterTimeValidationForStartTime = false;
  //                   this.timeMatchValidationForStartTime = false;
  //                   this.assignClassForm.patchValue({
  //                     startTime: null,
  //                   });
  //                 } else {
  //                   this.slotCreatedForSomeOtherClass = false;
  //                 }
  //               } else {
  //                 this.slotCreatedForSomeOtherClass = false;
  //               }
  //             } else {
  //               this.slotCreatedForSomeOtherClass = false;
  //               this.greaterTimeValidationForStartTime = false;
  //               this.timeMatchValidationForStartTime = false;
  //             }
  //           }
  //         } else {
  //           this.timeMatchValidationForStartTime = false;
  //           this.greaterTimeValidationForStartTime = false;
  //           // $('#startTime').val(null);
  //           this.assignClassForm.patchValue({
  //             startTime: null,
  //           });
  //         }
  //       } else {
  //         // $('#startTime').val(null);
  //         this.greaterTimeValidationForStartTime = false;
  //         this.timeMatchValidationForStartTime = true;
  //         this.assignClassForm.patchValue({
  //           startTime: null,
  //         });
  //       }
  //     } else {
  //       this.greaterTimeValidationForStartTime = true;
  //       this.timeMatchValidationForStartTime = false;
  //       // $('#startTime').val(null);
  //       // $('#endTime').val(null);
  //       this.assignClassForm.patchValue({
  //         startTime: null,
  //         endTime: null,
  //       });
  //     }
  //   }
  //   else {
  //     if (slotStartTime >= classStartTime && slotStartTime <= classEndTime) {
  //       if (slotStartTime >= teacherStartTime && slotStartTime <= teacherEndTime) {
  //         if (this.TempAssignmentList.length > 0) {
  //           let isExistsSlot = this.TempAssignmentList.find(
  //             (item: any, index: number) =>
  //               slotStartTime >= item.startTime + ':00' &&
  //               slotStartTime <= item.endTime + ':00' &&
  //               index != this.indexValue
  //           );
  //           if (isExistsSlot) {
  //             // $('#startTime').val(null);
  //             this.greaterTimeValidationForStartTime = false;
  //             this.timeMatchValidationForStartTime = true;
  //             this.assignClassForm.patchValue({
  //               startTime: null,
  //             });
  //           } else {
  //             this.timeMatchValidationForStartTime = false;
  //             this.greaterTimeValidationForStartTime = false;
  //             let teacherRecord = this.AssignmentBO.find(
  //               (item: any) => item.teacherID == this.selectedTeacherId
  //             );
  //             if (teacherRecord) {
  //               if (teacherRecord.classID != this.classID) {
  //                 let specificDaySlots = teacherRecord?.slots.find(
  //                   (item: any) =>
  //                     item.day == this.selectedDayId &&
  //                     item.startTime <= slotStartTime &&
  //                     item.endTime >= slotStartTime
  //                 );
  //                 if (specificDaySlots) {
  //                   this.slotCreatedForSomeOtherClass = true;
  //                   this.greaterTimeValidationForStartTime = false;
  //                   this.timeMatchValidationForStartTime = false;
  //                   this.assignClassForm.patchValue({
  //                     startTime: null,
  //                   });
  //                 } else {
  //                   this.slotCreatedForSomeOtherClass = false;
  //                 }
  //               } else {
  //                 this.slotCreatedForSomeOtherClass = false;
  //               }
  //             } else {
  //               this.slotCreatedForSomeOtherClass = false;
  //               this.greaterTimeValidationForStartTime = false;
  //               this.timeMatchValidationForStartTime = false;
  //             }
  //           }
  //         } else {
  //           this.timeMatchValidationForStartTime = false;
  //           this.greaterTimeValidationForStartTime = false;

  //           let teacherRecord = this.AssignmentBO.find(
  //             (item: any) => item.teacherID == this.selectedTeacherId
  //           );
  //           if (teacherRecord) {
  //             if (teacherRecord.classID != this.classID) {
  //               let specificDaySlots = teacherRecord?.slots.find(
  //                 (item: any) =>
  //                   item.day == this.selectedDayId &&
  //                   item.startTime <= slotStartTime &&
  //                   item.endTime >= slotStartTime
  //               );
  //               if (specificDaySlots) {
  //                 this.slotCreatedForSomeOtherClass = true;
  //                 this.greaterTimeValidationForStartTime = false;
  //                 this.timeMatchValidationForStartTime = false;
  //                 this.assignClassForm.patchValue({
  //                   startTime: null,
  //                 });
  //               } else {
  //                 this.slotCreatedForSomeOtherClass = false;
  //               }
  //             } else {
  //               this.slotCreatedForSomeOtherClass = false;
  //             }
  //           } else {
  //             this.slotCreatedForSomeOtherClass = false;
  //             this.greaterTimeValidationForStartTime = false;
  //             this.timeMatchValidationForStartTime = false;
  //           }
  //         }
  //       } else {
  //         // $('#startTime').val(null);
  //         this.slotCreatedForSomeOtherClass = false;
  //         this.greaterTimeValidationForStartTime = false;
  //         this.timeMatchValidationForStartTime = true;
  //         this.assignClassForm.patchValue({
  //           startTime: null,
  //         });
  //       }
  //     } else {
  //       // $('#startTime').val(null);
  //       this.greaterTimeValidationForStartTime = false;
  //       this.timeMatchValidationForStartTime = true;
  //       this.assignClassForm.patchValue({
  //         startTime: null,
  //       });
  //     }
  //   }
  // }

  //  ApplyValidationForEndTime() {
  //   let slotStartTime = this.assignClassForm.value.startTime  ? this.assignClassForm.value.startTime + ':00' : this.assignClassForm.value.startTime;
  //   let slotEndTime = this.assignClassForm.value.endTime ? this.assignClassForm.value.endTime + ':00' : this.assignClassForm.value.endTime;
  //   let classSlots = this.classDaysSlot.find((item: any) => item.dayID == this.selectedDayId);

  //   let classStartTime = classSlots.startTime;
  //   let classEndTime = classSlots.endTime;

  //   let teacherRecord = this.teachersData.find((item: any) => item.teacherID == this.selectedTeacherId);
  //   let teacherAvailability = teacherRecord.teacherAvailability.find((item: any) => item.dayID == this.selectedDayId);

  //   let teacherStartTime = teacherAvailability.startTime;
  //   let teacherEndTime = teacherAvailability.endTime;
  //   if (slotStartTime != null) {
  //     if (slotStartTime < slotEndTime) {
  //       this.greaterTimeValidationForEndTime = false;
  //       if (slotEndTime >= classStartTime && slotEndTime <= classEndTime) {
  //         if (
  //           slotEndTime >= teacherStartTime &&
  //           slotEndTime <= teacherEndTime
  //         ) {
  //           this.timeMatchValidationForEndTime = false;
  //           if (this.TempAssignmentList.length > 0) {
  //             let isExistsSlot = this.TempAssignmentList.find(
  //               (item: any, index: number) =>
  //                 slotEndTime >= item.startTime &&
  //                 slotEndTime <= item.endTime &&
  //                 index != this.indexValue
  //             );
  //             if (isExistsSlot) {
  //               // $('#endTime').val(null);
  //               this.timeMatchValidationForEndTime = true;
  //               this.greaterTimeValidationForEndTime = false;
  //               this.assignClassForm.patchValue({
  //                 endTime: null,
  //               });
  //             } else {
  //               this.timeMatchValidationForEndTime = false;
  //               this.greaterTimeValidationForEndTime = false;

  //               let teacherRecord = this.AssignmentBO.find(
  //                 (item: any) => item.teacherID == this.selectedTeacherId
  //               );
  //               if (teacherRecord) {
  //                 if (teacherRecord.classID != this.classID) {
  //                   let specificDaySlots = teacherRecord?.slots.find(
  //                     (item: any) =>
  //                       item.day == this.selectedDayId &&
  //                       item.startTime <= slotEndTime &&
  //                       item.endTime >= slotEndTime
  //                   );
  //                   if (specificDaySlots) {
  //                     this.slotCreatedForSomeOtherClassforEndTime = true;
  //                     this.greaterTimeValidationForEndTime = false;
  //                     this.timeMatchValidationForEndTime = false;
  //                     this.assignClassForm.patchValue({
  //                       endTime: null,
  //                     });
  //                   } else {
  //                     this.slotCreatedForSomeOtherClassforEndTime = false;
  //                   }
  //                 } else {
  //                   this.slotCreatedForSomeOtherClassforEndTime = false;
  //                 }
  //               } else {
  //                 this.slotCreatedForSomeOtherClass = false;
  //                 this.greaterTimeValidationForStartTime = false;
  //                 this.timeMatchValidationForStartTime = false;
  //               }
  //             }
  //           } else {
  //             this.timeMatchValidationForEndTime = false;
  //             this.greaterTimeValidationForEndTime = false;

  //             let teacherRecord = this.AssignmentBO.find(
  //               (item: any) => item.teacherID == this.selectedTeacherId
  //             );
  //             if (teacherRecord) {
  //               if (teacherRecord.classID != this.classID) {
  //                 let specificDaySlots = teacherRecord?.slots.find(
  //                   (item: any) =>
  //                     item.day == this.selectedDayId &&
  //                     item.startTime <= slotEndTime &&
  //                     item.endTime >= slotEndTime
  //                 );
  //                 if (specificDaySlots) {
  //                   this.slotCreatedForSomeOtherClassforEndTime = true;
  //                   this.greaterTimeValidationForEndTime = false;
  //                   this.timeMatchValidationForEndTime = false;
  //                   this.assignClassForm.patchValue({
  //                     endTime: null,
  //                   });
  //                 } else {
  //                   this.slotCreatedForSomeOtherClassforEndTime = false;
  //                 }
  //               } else {
  //                 this.slotCreatedForSomeOtherClassforEndTime = false;
  //               }
  //             } else {
  //               this.slotCreatedForSomeOtherClass = false;
  //               this.greaterTimeValidationForStartTime = false;
  //               this.timeMatchValidationForStartTime = false;
  //             }
  //           }
  //         } else {
  //           this.timeMatchValidationForEndTime = true;
  //           this.greaterTimeValidationForEndTime = false;
  //           // $('#endTime').val(null);
  //           this.assignClassForm.patchValue({
  //             endTime: null,
  //           });
  //         }
  //       } else {
  //         this.timeMatchValidationForEndTime = true;
  //         this.greaterTimeValidationForEndTime = false;
  //         // $('#endTime').val(null);
  //         this.assignClassForm.patchValue({
  //           endTime: null,
  //         });
  //       }
  //     } else {
  //       this.greaterTimeValidationForEndTime = true;
  //       this.timeMatchValidationForEndTime = false;
  //       // $('#startTime').val(null);
  //       // $('#endTime').val(null);
  //       this.assignClassForm.patchValue({
  //         endTime: null,
  //         startTime: null,
  //       });
  //     }
  //   } else {
  //     if (slotEndTime >= classStartTime && slotEndTime <= classEndTime) {
  //       if (slotEndTime >= teacherStartTime && slotEndTime <= teacherEndTime) {
  //         if (this.TempAssignmentList.length > 0) {
  //           let isExistsSlot = this.TempAssignmentList.find(
  //             (item: any, index: number) =>
  //               slotEndTime >= item.startTime &&
  //               slotEndTime <= item.endTime &&
  //               index != this.indexValue
  //           );
  //           if (isExistsSlot) {
  //             this.greaterTimeValidationForEndTime = false;
  //             this.timeMatchValidationForEndTime = true;
  //             // $('#endTime').val(null);
  //             this.assignClassForm.patchValue({
  //               endTime: null,
  //             });
  //           } else {
  //             this.timeMatchValidationForEndTime = false;
  //             this.greaterTimeValidationForEndTime = false;

  //             let teacherRecord = this.AssignmentBO.find(
  //               (item: any) => item.teacherID == this.selectedTeacherId
  //             );
  //             if (teacherRecord) {
  //               if (teacherRecord.classID != this.classID) {
  //                 let specificDaySlots = teacherRecord?.slots.find(
  //                   (item: any) =>
  //                     item.day == this.selectedDayId &&
  //                     item.startTime <= slotEndTime &&
  //                     item.endTime >= slotEndTime
  //                 );
  //                 if (specificDaySlots) {
  //                   this.slotCreatedForSomeOtherClassforEndTime = true;
  //                   this.greaterTimeValidationForEndTime = false;
  //                   this.timeMatchValidationForEndTime = false;
  //                   this.assignClassForm.patchValue({
  //                     endTime: null,
  //                   });
  //                 } else {
  //                   this.slotCreatedForSomeOtherClassforEndTime = false;
  //                 }
  //               } else {
  //                 this.slotCreatedForSomeOtherClassforEndTime = false;
  //               }
  //             } else {
  //               this.slotCreatedForSomeOtherClass = false;
  //               this.greaterTimeValidationForStartTime = false;
  //               this.timeMatchValidationForStartTime = false;
  //             }
  //           }
  //         } else {
  //           this.timeMatchValidationForEndTime = false;
  //           this.greaterTimeValidationForEndTime = false;

  //           let teacherRecord = this.AssignmentBO.find(
  //             (item: any) => item.teacherID == this.selectedTeacherId
  //           );
  //           if (teacherRecord) {
  //             if (teacherRecord.classID != this.classID) {
  //               let specificDaySlots = teacherRecord?.slots.find(
  //                 (item: any) =>
  //                   item.day == this.selectedDayId &&
  //                   item.startTime <= slotEndTime &&
  //                   item.endTime >= slotEndTime
  //               );
  //               if (specificDaySlots) {
  //                 this.slotCreatedForSomeOtherClassforEndTime = true;
  //                 this.greaterTimeValidationForEndTime = false;
  //                 this.timeMatchValidationForEndTime = false;
  //                 this.assignClassForm.patchValue({
  //                   endTime: null,
  //                 });
  //               } else {
  //                 this.slotCreatedForSomeOtherClassforEndTime = false;
  //               }
  //             } else {
  //               this.slotCreatedForSomeOtherClassforEndTime = false;
  //             }
  //           } else {
  //             this.slotCreatedForSomeOtherClass = false;
  //             this.greaterTimeValidationForStartTime = false;
  //             this.timeMatchValidationForStartTime = false;
  //           }
  //         }
  //       } else {
  //         // $('#endTime').val(null);
  //         this.greaterTimeValidationForEndTime = false;
  //         this.timeMatchValidationForEndTime = true;
  //         this.assignClassForm.patchValue({
  //           endTime: null,
  //         });
  //       }
  //     } else {
  //       // $('#endTime').val(null);
  //       this.greaterTimeValidationForEndTime = false;
  //       this.timeMatchValidationForEndTime = true;
  //       this.assignClassForm.patchValue({
  //         endTime: null,
  //       });
  //     }
  //   }
  // }

  ApplyValidationForStartTime_old() {
    let slotStartTime = this.assignClassForm.value.startTime
      ? this.assignClassForm.value.startTime + ':00'
      : this.assignClassForm.value.startTime;
    let slotEndTime = this.assignClassForm.value.endTime
      ? this.assignClassForm.value.endTime + ':00'
      : this.assignClassForm.value.endTime;
    let classSlots = this.classDaysSlot.find(
      (item: any) => item.dayID == this.selectedDayId
    );
    let classStartTime = classSlots.startTime;
    let classEndTime = classSlots.endTime;
    let teacherRecord = this.teachersData.find(
      (item: any) => item.teacherID == this.selectedTeacherId
    );
    let teacherAvailability = teacherRecord.teacherAvailability.find(
      (item: any) => item.dayID == this.selectedDayId
    );
    let teacherAssigment = teacherRecord.teacherAssignmentList.find(
      (x: { teacherID: any; dayId: any }) =>
        x.teacherID == this.selectedTeacherId && x.dayId == this.selectedDayId
    );
    let teacherStartTime = teacherAvailability.startTime;
    let teacherEndTime = teacherAvailability.endTime;
    if (slotEndTime != null) {
      if (slotStartTime < slotEndTime) {
        this.greaterTimeValidationForStartTime = false;
        if (slotStartTime >= classStartTime && slotStartTime <= classEndTime) {
          if (
            slotStartTime >= teacherStartTime &&
            slotStartTime <= teacherEndTime
          ) {
            if (
              Array.isArray(this.TempAssignmentList) &&
              this.TempAssignmentList.length > 0
            ) {
              let isExistsSlot = this.TempAssignmentList.find(
                (item: any, index: number) =>
                  slotStartTime >= item.startTime + ':00' &&
                  slotStartTime <= item.endTime + ':00'
                // &&
                // index != this.indexValue
              );
              if (isExistsSlot) {
                this.greaterTimeValidationForStartTime = false;
                this.timeMatchValidationForStartTime = true;
                this.assignClassForm.patchValue({
                  startTime: null,
                });
              } else {
                this.timeMatchValidationForStartTime = false;
                this.greaterTimeValidationForStartTime = false;

                if (
                  teacherAssigment.classID != this.classID &&
                  teacherAssigment.dayId == this.selectedDayId &&
                  teacherAssigment.classStartTime <= slotStartTime &&
                  teacherAssigment.classEndTime >= slotStartTime
                ) {
                  this.slotCreatedForSomeOtherClass = true;
                  this.greaterTimeValidationForStartTime = false;
                  this.timeMatchValidationForStartTime = false;
                  this.assignClassForm.patchValue({
                    startTime: null,
                  });
                } else {
                  this.slotCreatedForSomeOtherClass = false;
                  this.greaterTimeValidationForStartTime = false;
                  this.timeMatchValidationForStartTime = false;
                }
              }
            } else {
              this.timeMatchValidationForStartTime = false;
              this.greaterTimeValidationForStartTime = false;

              if (
                teacherAssigment.classID != this.classID &&
                teacherAssigment.dayId == this.selectedDayId &&
                teacherAssigment.classStartTime <= slotStartTime &&
                teacherAssigment.classEndTime >= slotStartTime
              ) {
                this.slotCreatedForSomeOtherClass = true;
                this.greaterTimeValidationForStartTime = false;
                this.timeMatchValidationForStartTime = false;
                this.assignClassForm.patchValue({
                  startTime: null,
                });
              } else {
                this.slotCreatedForSomeOtherClass = false;
                this.greaterTimeValidationForStartTime = false;
                this.timeMatchValidationForStartTime = false;
              }
            }
          } else {
            this.timeMatchValidationForStartTime = false;
            this.greaterTimeValidationForStartTime = false;
            this.assignClassForm.patchValue({
              startTime: null,
            });
          }
        } else {
          this.greaterTimeValidationForStartTime = false;
          this.timeMatchValidationForStartTime = true;
          this.assignClassForm.patchValue({
            startTime: null,
          });
        }
      } else {
        this.greaterTimeValidationForStartTime = true;
        this.timeMatchValidationForStartTime = false;
        this.assignClassForm.patchValue({
          startTime: null,
          endTime: null,
        });
      }
    } else {
      if (slotStartTime >= classStartTime && slotStartTime <= classEndTime) {
        if (
          slotStartTime >= teacherStartTime &&
          slotStartTime <= teacherEndTime
        ) {
          if (
            Array.isArray(this.TempAssignmentList) &&
            this.TempAssignmentList.length > 0
          ) {
            let isExistsSlot = this.TempAssignmentList.find(
              (item: any, index: number) =>
                slotStartTime >= item.startTime + ':00' &&
                slotStartTime <= item.endTime + ':00'
              // &&
              // index != this.indexValue
            );
            if (isExistsSlot) {
              this.greaterTimeValidationForStartTime = false;
              this.timeMatchValidationForStartTime = true;
              this.assignClassForm.patchValue({
                startTime: null,
              });
            } else {
              this.timeMatchValidationForStartTime = false;
              this.greaterTimeValidationForStartTime = false;

              // if(teacherAssigment.classID != this.classID && teacherAssigment.dayId == this.selectedDayId && teacherAssigment.classStartTime <= slotStartTime && teacherAssigment.classEndTime >= slotStartTime) {
              if (
                (teacherAssigment.classID != this.classID ||
                  teacherAssigment.classID == this.classID) &&
                teacherAssigment.dayId == this.selectedDayId &&
                teacherAssigment.classStartTime <= slotStartTime &&
                teacherAssigment.classEndTime >= slotStartTime
              ) {
                this.slotCreatedForSomeOtherClass = true;
                this.greaterTimeValidationForStartTime = false;
                this.timeMatchValidationForStartTime = false;
                this.assignClassForm.patchValue({
                  startTime: null,
                });
              } else {
                this.slotCreatedForSomeOtherClass = false;
                this.greaterTimeValidationForStartTime = false;
                this.timeMatchValidationForStartTime = false;
              }
            }
          } else {
            this.timeMatchValidationForStartTime = false;
            this.greaterTimeValidationForStartTime = false;

            // if (teacherAssigment.classID != this.classID && teacherAssigment.dayId == this.selectedDayId && teacherAssigment.classStartTime <= slotStartTime && teacherAssigment.classEndTime >= slotStartTime) {
            if (
              (teacherAssigment.classID != this.classID ||
                teacherAssigment.classID == this.classID) &&
              teacherAssigment.dayId == this.selectedDayId &&
              teacherAssigment.classStartTime <= slotStartTime &&
              teacherAssigment.classEndTime >= slotStartTime
            ) {
              this.slotCreatedForSomeOtherClass = true;
              this.greaterTimeValidationForStartTime = false;
              this.timeMatchValidationForStartTime = false;
              this.assignClassForm.patchValue({
                startTime: null,
              });
            } else {
              this.slotCreatedForSomeOtherClass = false;
              this.greaterTimeValidationForStartTime = false;
              this.timeMatchValidationForStartTime = false;
            }
          }
        } else {
          this.slotCreatedForSomeOtherClass = false;
          this.greaterTimeValidationForStartTime = false;
          this.timeMatchValidationForStartTime = true;
          this.assignClassForm.patchValue({
            startTime: null,
          });
        }
      } else {
        this.greaterTimeValidationForStartTime = false;
        this.timeMatchValidationForStartTime = true;
        this.assignClassForm.patchValue({
          startTime: null,
        });
      }
    }
  }

  ApplyValidationForEndTime_old() {
    let slotStartTime = this.assignClassForm.value.startTime
      ? this.assignClassForm.value.startTime + ':00'
      : this.assignClassForm.value.startTime;
    let slotEndTime = this.assignClassForm.value.endTime
      ? this.assignClassForm.value.endTime + ':00'
      : this.assignClassForm.value.endTime;
    let classSlots = this.classDaysSlot.find(
      (item: any) => item.dayID == this.selectedDayId
    );

    let classStartTime = classSlots.startTime;
    let classEndTime = classSlots.endTime;

    let teacherRecord = this.teachersData.find(
      (item: any) => item.teacherID == this.selectedTeacherId
    );
    let teacherAvailability = teacherRecord.teacherAvailability.find(
      (item: any) => item.dayID == this.selectedDayId
    );
    let teacherAssigment = teacherRecord.teacherAssignmentList.find(
      (x: { teacherID: any; dayId: any }) =>
        x.teacherID == this.selectedTeacherId && x.dayId == this.selectedDayId
    );

    let teacherStartTime = teacherAvailability.startTime;
    let teacherEndTime = teacherAvailability.endTime;
    if (slotStartTime != null) {
      if (slotStartTime < slotEndTime) {
        this.greaterTimeValidationForEndTime = false;
        if (slotEndTime >= classStartTime && slotEndTime <= classEndTime) {
          if (
            slotEndTime >= teacherStartTime &&
            slotEndTime <= teacherEndTime
          ) {
            this.timeMatchValidationForEndTime = false;
            if (this.TempAssignmentList.length > 0) {
              let isExistsSlot = this.TempAssignmentList.find(
                (item: any, index: number) =>
                  slotEndTime >= item.startTime && slotEndTime <= item.endTime
                // &&
                // index != this.indexValue
              );
              if (isExistsSlot) {
                this.timeMatchValidationForEndTime = true;
                this.greaterTimeValidationForEndTime = false;
                this.assignClassForm.patchValue({
                  endTime: null,
                });
              } else {
                this.timeMatchValidationForEndTime = false;
                this.greaterTimeValidationForEndTime = false;

                if (
                  teacherAssigment.classID != this.classID &&
                  teacherAssigment.dayId == this.selectedDayId &&
                  teacherAssigment.classStartTime <= slotStartTime &&
                  teacherAssigment.classEndTime >= slotStartTime
                ) {
                  this.slotCreatedForSomeOtherClassforEndTime = true;
                  this.greaterTimeValidationForEndTime = false;
                  this.timeMatchValidationForEndTime = false;
                  this.assignClassForm.patchValue({
                    endTime: null,
                  });
                } else {
                  this.slotCreatedForSomeOtherClassforEndTime = false;
                  this.greaterTimeValidationForEndTime = false;
                  this.timeMatchValidationForEndTime = false;
                }
              }
            } else {
              this.timeMatchValidationForEndTime = false;
              this.greaterTimeValidationForEndTime = false;

              if (
                teacherAssigment.classID != this.classID &&
                teacherAssigment.dayId == this.selectedDayId &&
                teacherAssigment.classStartTime <= slotStartTime &&
                teacherAssigment.classEndTime >= slotStartTime
              ) {
                this.slotCreatedForSomeOtherClassforEndTime = true;
                this.greaterTimeValidationForEndTime = false;
                this.timeMatchValidationForEndTime = false;
                this.assignClassForm.patchValue({
                  endTime: null,
                });
              } else {
                this.slotCreatedForSomeOtherClassforEndTime = false;
                this.greaterTimeValidationForEndTime = false;
                this.timeMatchValidationForEndTime = false;
              }
            }
          } else {
            this.timeMatchValidationForEndTime = true;
            this.greaterTimeValidationForEndTime = false;
            this.assignClassForm.patchValue({
              endTime: null,
            });
          }
        } else {
          this.timeMatchValidationForEndTime = true;
          this.greaterTimeValidationForEndTime = false;
          this.assignClassForm.patchValue({
            endTime: null,
          });
        }
      } else {
        this.greaterTimeValidationForEndTime = true;
        this.timeMatchValidationForEndTime = false;
        this.assignClassForm.patchValue({
          endTime: null,
          startTime: null,
        });
      }
    } else {
      if (slotEndTime >= classStartTime && slotEndTime <= classEndTime) {
        if (slotEndTime >= teacherStartTime && slotEndTime <= teacherEndTime) {
          if (this.TempAssignmentList.length > 0) {
            let isExistsSlot = this.TempAssignmentList.find(
              (item: any, index: number) =>
                slotEndTime >= item.startTime && slotEndTime <= item.endTime
              // &&
              // index != this.indexValue
            );
            if (isExistsSlot) {
              this.greaterTimeValidationForEndTime = false;
              this.timeMatchValidationForEndTime = true;
              // $('#endTime').val(null);
              this.assignClassForm.patchValue({
                endTime: null,
              });
            } else {
              this.timeMatchValidationForEndTime = false;
              this.greaterTimeValidationForEndTime = false;

              if (
                teacherAssigment.classID != this.classID &&
                teacherAssigment.dayId == this.selectedDayId &&
                teacherAssigment.classStartTime <= slotStartTime &&
                teacherAssigment.classEndTime >= slotStartTime
              ) {
                this.slotCreatedForSomeOtherClassforEndTime = true;
                this.greaterTimeValidationForEndTime = false;
                this.timeMatchValidationForEndTime = false;
                this.assignClassForm.patchValue({
                  endTime: null,
                });
              } else {
                this.slotCreatedForSomeOtherClassforEndTime = false;
                this.greaterTimeValidationForEndTime = false;
                this.timeMatchValidationForEndTime = false;
              }
            }
          } else {
            this.timeMatchValidationForEndTime = false;
            this.greaterTimeValidationForEndTime = false;

            if (
              teacherAssigment.classID != this.classID &&
              teacherAssigment.dayId == this.selectedDayId &&
              teacherAssigment.classStartTime <= slotStartTime &&
              teacherAssigment.classEndTime >= slotStartTime
            ) {
              this.slotCreatedForSomeOtherClassforEndTime = true;
              this.greaterTimeValidationForEndTime = false;
              this.timeMatchValidationForEndTime = false;
              this.assignClassForm.patchValue({
                endTime: null,
              });
            } else {
              this.slotCreatedForSomeOtherClassforEndTime = false;
              this.greaterTimeValidationForEndTime = false;
              this.timeMatchValidationForEndTime = false;
            }
          }
        } else {
          // $('#endTime').val(null);
          this.greaterTimeValidationForEndTime = false;
          this.timeMatchValidationForEndTime = true;
          this.assignClassForm.patchValue({
            endTime: null,
          });
        }
      } else {
        // $('#endTime').val(null);
        this.greaterTimeValidationForEndTime = false;
        this.timeMatchValidationForEndTime = true;
        this.assignClassForm.patchValue({
          endTime: null,
        });
      }
    }
  }

  // Added on 04/06/25
  // ApplyValidationForStartTime() {
  //   let slotStartTime = this.assignClassForm.value.startTime ? this.assignClassForm.value.startTime + ':00' : this.assignClassForm.value.startTime;
  //   let slotEndTime = this.assignClassForm.value.endTime ? this.assignClassForm.value.endTime + ':00' : this.assignClassForm.value.endTime;
  //   let classSlots = this.classDaysSlot.find((item: any) => item.dayID == this.selectedDayId);
  //   let classStartTime = classSlots.startTime;
  //   let classEndTime = classSlots.endTime;
  //   let teacherRecord = this.teachersData.find((item: any) => item.teacherID == this.selectedTeacherId);
  //   let teacherAvailability = teacherRecord.teacherAvailability.find((item: any) => item.dayID == this.selectedDayId);
  //   let teacherAssigment = teacherRecord.teacherAssignmentList.filter((x: { teacherID: any; dayId: any; }) => x.teacherID == this.selectedTeacherId && x.dayId == this.selectedDayId);
  //   const uniqueAssignments = teacherAssigment.filter((assignment: { classStartTime: any; classEndTime: any; }, index: any, self: { classStartTime: any; classEndTime: any; }[]) =>
  //     index === self.findIndex((a: { classStartTime: any; classEndTime: any; }) =>
  //       a.classStartTime === assignment.classStartTime &&
  //       a.classEndTime === assignment.classEndTime
  //     )
  //   );
  //   let teacherStartTime = teacherAvailability.startTime;
  //   let teacherEndTime = teacherAvailability.endTime;
  //   if (slotEndTime != null) {
  //     if (slotStartTime < slotEndTime) {
  //       this.greaterTimeValidationForStartTime = false;
  //       if (slotStartTime >= classStartTime && slotStartTime <= classEndTime) {
  //         if (slotStartTime >= teacherStartTime && slotStartTime <= teacherEndTime) {
  //           if (Array.isArray(this.TempAssignmentList) && this.TempAssignmentList.length > 0) {
  //             let isExistsSlot = this.TempAssignmentList.find(
  //               (item: any, index: number) =>
  //                 slotStartTime >= item.startTime + ':00' &&
  //                 slotStartTime <= item.endTime + ':00'
  //             );
  //             if (isExistsSlot) {
  //               this.greaterTimeValidationForStartTime = false;
  //               this.timeMatchValidationForStartTime = true;
  //               this.assignClassForm.patchValue({
  //                 startTime: null,
  //               });
  //             }
  //             else {
  //               this.timeMatchValidationForStartTime = false;
  //               this.greaterTimeValidationForStartTime = false;

  //               const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //                 assignment.dayId === this.selectedDayId &&
  //                 assignment.teacherID === this.selectedTeacherId &&
  //                 assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //               );

  //               if (isOverlapping) {
  //                 this.slotCreatedForSomeOtherClass = true;
  //                 this.greaterTimeValidationForStartTime = false;
  //                 this.timeMatchValidationForStartTime = false;
  //                 this.assignClassForm.patchValue({
  //                   startTime: null,
  //                 });
  //               }
  //               else {
  //                 this.slotCreatedForSomeOtherClass = false;
  //                 this.greaterTimeValidationForStartTime = false;
  //                 this.timeMatchValidationForStartTime = false;
  //               }
  //             }
  //           }
  //           else {
  //             this.timeMatchValidationForStartTime = false;
  //             this.greaterTimeValidationForStartTime = false;

  //             const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //               assignment.dayId === this.selectedDayId &&
  //               assignment.teacherID === this.selectedTeacherId &&
  //               assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //             );

  //             if (isOverlapping) {
  //               this.slotCreatedForSomeOtherClass = true;
  //               this.greaterTimeValidationForStartTime = false;
  //               this.timeMatchValidationForStartTime = false;
  //               this.assignClassForm.patchValue({
  //                 startTime: null,
  //               });
  //             }
  //             else {
  //               this.slotCreatedForSomeOtherClass = false;
  //               this.greaterTimeValidationForStartTime = false;
  //               this.timeMatchValidationForStartTime = false;
  //             }
  //           }
  //         }
  //         else {
  //           this.timeMatchValidationForStartTime = false;
  //           this.greaterTimeValidationForStartTime = false;
  //           this.assignClassForm.patchValue({
  //             startTime: null,
  //           });
  //         }
  //       }
  //       else {
  //         this.greaterTimeValidationForStartTime = false;
  //         this.timeMatchValidationForStartTime = true;
  //         this.assignClassForm.patchValue({
  //           startTime: null,
  //         });
  //       }
  //     }
  //     else {
  //       this.greaterTimeValidationForStartTime = true;
  //       this.timeMatchValidationForStartTime = false;
  //       this.assignClassForm.patchValue({
  //         startTime: null,
  //         endTime: null,
  //       });
  //     }
  //   }
  //   else {
  //     if (slotStartTime >= classStartTime && slotStartTime <= classEndTime) {
  //       if (slotStartTime >= teacherStartTime && slotStartTime <= teacherEndTime) {
  //         if (Array.isArray(this.TempAssignmentList) && this.TempAssignmentList.length > 0) {
  //           let isExistsSlot = this.TempAssignmentList.find(
  //             (item: any, index: number) =>
  //               slotStartTime >= item.startTime + ':00' &&
  //               slotStartTime <= item.endTime + ':00'
  //           );
  //           if (isExistsSlot) {
  //             this.greaterTimeValidationForStartTime = false;
  //             this.timeMatchValidationForStartTime = true;
  //             this.assignClassForm.patchValue({
  //               startTime: null,
  //             });
  //           }
  //           else {
  //             this.timeMatchValidationForStartTime = false;
  //             this.greaterTimeValidationForStartTime = false;

  //             const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //               assignment.dayId === this.selectedDayId &&
  //               assignment.teacherID === this.selectedTeacherId &&
  //               assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //             );

  //             if (isOverlapping) {
  //               this.slotCreatedForSomeOtherClass = true;
  //               this.greaterTimeValidationForStartTime = false;
  //               this.timeMatchValidationForStartTime = false;
  //               this.assignClassForm.patchValue({
  //                 startTime: null,
  //               });
  //             }
  //             else {
  //               this.slotCreatedForSomeOtherClass = false;
  //               this.greaterTimeValidationForStartTime = false;
  //               this.timeMatchValidationForStartTime = false;
  //             }
  //           }
  //         }
  //         else {
  //           this.timeMatchValidationForStartTime = false;
  //           this.greaterTimeValidationForStartTime = false;

  //           const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //             assignment.dayId === this.selectedDayId &&
  //             assignment.teacherID === this.selectedTeacherId &&
  //             assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //           );

  //           if (isOverlapping) {
  //             this.slotCreatedForSomeOtherClass = true;
  //             this.greaterTimeValidationForStartTime = false;
  //             this.timeMatchValidationForStartTime = false;
  //             this.assignClassForm.patchValue({
  //               startTime: null,
  //             });
  //           }
  //           else {
  //             this.slotCreatedForSomeOtherClass = false;
  //             this.greaterTimeValidationForStartTime = false;
  //             this.timeMatchValidationForStartTime = false;
  //           }
  //         }
  //       }
  //       else {
  //         this.slotCreatedForSomeOtherClass = false;
  //         this.greaterTimeValidationForStartTime = false;
  //         this.timeMatchValidationForStartTime = true;
  //         this.assignClassForm.patchValue({
  //           startTime: null,
  //         });
  //       }
  //     }
  //     else {
  //       this.greaterTimeValidationForStartTime = false;
  //       this.timeMatchValidationForStartTime = true;
  //       this.assignClassForm.patchValue({
  //         startTime: null,
  //       });
  //     }
  //   }
  // }

  ApplyValidationForStartTime() {
    const slotStartTime = this.assignClassForm.value.startTime
      ? this.assignClassForm.value.startTime + ':00'
      : null;
    const slotEndTime = this.assignClassForm.value.endTime
      ? this.assignClassForm.value.endTime + ':00'
      : null;

    const classSlots = this.classDaysSlot.find(
      (item: any) => item.dayID == this.selectedDayId
    );
    const teacherRecord = this.teachersData.find(
      (item: any) => item.teacherID == this.selectedTeacherId
    );
    const teacherAvailability = teacherRecord?.teacherAvailability.find(
      (item: any) => item.dayID == this.selectedDayId
    );
    const teacherAssignments =
      teacherRecord?.teacherAssignmentList.filter(
        (x: any) =>
          x.teacherID == this.selectedTeacherId && x.dayId == this.selectedDayId
      ) || [];

    const uniqueAssignments = teacherAssignments.filter(
      (assignment: any, index: number, self: any[]) =>
        index ===
        self.findIndex(
          (a: any) =>
            a.classStartTime === assignment.classStartTime &&
            a.classEndTime === assignment.classEndTime
        )
    );

    const classStartTime = classSlots?.startTime;
    const classEndTime = classSlots?.endTime;
    const teacherStartTime = teacherAvailability?.startTime;
    const teacherEndTime = teacherAvailability?.endTime;

    this.greaterTimeValidationForStartTime = false;
    this.timeMatchValidationForStartTime = false;
    this.slotCreatedForSomeOtherClass = false;

    if (!slotStartTime) return;

    if (slotEndTime && slotStartTime >= slotEndTime) {
      this.greaterTimeValidationForStartTime = true;
      this.assignClassForm.patchValue({ startTime: null, endTime: null });
      return;
    }

    if (slotStartTime < classStartTime || slotStartTime > classEndTime) {
      this.timeMatchValidationForStartTime = true;
      this.assignClassForm.patchValue({ startTime: null });
      return;
    }

    if (slotStartTime < teacherStartTime || slotStartTime > teacherEndTime) {
      this.timeMatchValidationForStartTime = true;
      this.assignClassForm.patchValue({ startTime: null });
      return;
    }

    const isTempSlotConflict = this.TempAssignmentList?.some(
      (item: any) =>
        slotStartTime >= item.startTime + ':00' &&
        slotStartTime <= item.endTime + ':00'
    );

    if (isTempSlotConflict) {
      this.timeMatchValidationForStartTime = true;
      this.assignClassForm.patchValue({ startTime: null });
      return;
    }

    const selectedDateRaw = this.assignClassForm.value.startDate;
    const selectedDate = new Date(selectedDateRaw).toISOString().split('T')[0];

    const isOverlapping = uniqueAssignments.some((assignment: any) => {
      const assignmentDate = new Date(assignment.assignmentDate)
        .toISOString()
        .split('T')[0];

      return (
        assignment.dayId === this.selectedDayId &&
        assignment.teacherID === this.selectedTeacherId &&
        (assignment.classID !== this.classID ||
          assignment.classID == this.classID) &&
        assignmentDate === selectedDate &&
        assignment.classStartTime <= slotStartTime &&
        assignment.classEndTime >= slotStartTime
      );
    });

    if (isOverlapping) {
      this.slotCreatedForSomeOtherClass = true;
      this.assignClassForm.patchValue({ startTime: null });
      return;
    }

    // ✅ All validations passed
    this.greaterTimeValidationForStartTime = false;
    this.timeMatchValidationForStartTime = false;
    this.slotCreatedForSomeOtherClass = false;

    //Added on 04/07/25
    const assignmentDates: string[] = [];
    teacherAssignments.forEach((item: any) => {
      if (item?.assignmentDate) {
        assignmentDates.push(item.assignmentDate);
      }
    });

    if (this.selectedMatchingDates.length > 0) {
      const isAlreadyAssignedClassWithSameRange = teacherAssignments.find(
        (x: any) =>
          this.selectedMatchingDates.includes(x.assignmentDate) &&
          x.classStartTime === classStartTime
      );

      if (isAlreadyAssignedClassWithSameRange != null) {
        this.toastr.warning(
          'A class with the same timing has already been assigned within the selected date range.'
        );
        this.assignClassForm.patchValue({ startTime: null });
        return;
      }
    }
    //End
  }

  // Added on 04/06/25
  // ApplyValidationForEndTime() {
  //   let slotStartTime = this.assignClassForm.value.startTime ? this.assignClassForm.value.startTime + ':00' : this.assignClassForm.value.startTime;
  //   let slotEndTime = this.assignClassForm.value.endTime ? this.assignClassForm.value.endTime + ':00' : this.assignClassForm.value.endTime;
  //   let classSlots = this.classDaysSlot.find((item: any) => item.dayID == this.selectedDayId);
  //   let classStartTime = classSlots.startTime;
  //   let classEndTime = classSlots.endTime;
  //   let teacherRecord = this.teachersData.find((item: any) => item.teacherID == this.selectedTeacherId);
  //   let teacherAvailability = teacherRecord.teacherAvailability.find((item: any) => item.dayID == this.selectedDayId);
  //   let teacherAssigment = teacherRecord.teacherAssignmentList.filter((x: { teacherID: any; dayId: any; }) => x.teacherID == this.selectedTeacherId && x.dayId == this.selectedDayId);
  //   const uniqueAssignments = teacherAssigment.filter((assignment: { classStartTime: any; classEndTime: any; }, index: any, self: { classStartTime: any; classEndTime: any; }[]) =>
  //     index === self.findIndex((a: { classStartTime: any; classEndTime: any; }) =>
  //       a.classStartTime === assignment.classStartTime &&
  //       a.classEndTime === assignment.classEndTime
  //     )
  //   );

  //   let teacherStartTime = teacherAvailability.startTime;
  //   let teacherEndTime = teacherAvailability.endTime;
  //   if (slotStartTime != null) {
  //     if (slotStartTime < slotEndTime) {
  //       this.greaterTimeValidationForEndTime = false;
  //       if (slotEndTime >= classStartTime && slotEndTime <= classEndTime) {
  //         if (slotEndTime >= teacherStartTime && slotEndTime <= teacherEndTime) {
  //           this.timeMatchValidationForEndTime = false;
  //           if (this.TempAssignmentList.length > 0) {
  //             let isExistsSlot = this.TempAssignmentList.find(
  //               (item: any, index: number) =>
  //                 slotEndTime >= item.startTime &&
  //                 slotEndTime <= item.endTime
  //             );
  //             if (isExistsSlot) {
  //               this.timeMatchValidationForEndTime = true;
  //               this.greaterTimeValidationForEndTime = false;
  //               this.assignClassForm.patchValue({
  //                 endTime: null,
  //               });
  //             }
  //             else {
  //               this.timeMatchValidationForEndTime = false;
  //               this.greaterTimeValidationForEndTime = false;
  //               const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //                 assignment.dayId === this.selectedDayId &&
  //                 assignment.teacherID === this.selectedTeacherId &&
  //                 assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //               );

  //               if (isOverlapping) {
  //                 this.slotCreatedForSomeOtherClassforEndTime = true;
  //                 this.greaterTimeValidationForEndTime = false;
  //                 this.timeMatchValidationForEndTime = false;
  //                 this.assignClassForm.patchValue({
  //                   endTime: null,
  //                 });
  //               }
  //               else {
  //                 this.slotCreatedForSomeOtherClassforEndTime = false;
  //                 this.greaterTimeValidationForEndTime = false;
  //                 this.timeMatchValidationForEndTime = false;
  //               }
  //             }
  //           }
  //           else {
  //             this.timeMatchValidationForEndTime = false;
  //             this.greaterTimeValidationForEndTime = false;

  //             const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //               assignment.dayId === this.selectedDayId &&
  //               assignment.teacherID === this.selectedTeacherId &&
  //               assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //             );

  //             if (isOverlapping) {
  //               this.slotCreatedForSomeOtherClassforEndTime = true;
  //               this.greaterTimeValidationForEndTime = false;
  //               this.timeMatchValidationForEndTime = false;
  //               this.assignClassForm.patchValue({
  //                 endTime: null,
  //               });
  //             }
  //             else {
  //               this.slotCreatedForSomeOtherClassforEndTime = false;
  //               this.greaterTimeValidationForEndTime = false;
  //               this.timeMatchValidationForEndTime = false;
  //             }
  //           }
  //         } else {
  //           this.timeMatchValidationForEndTime = true;
  //           this.greaterTimeValidationForEndTime = false;
  //           this.assignClassForm.patchValue({
  //             endTime: null,
  //           });
  //         }
  //       } else {
  //         this.timeMatchValidationForEndTime = true;
  //         this.greaterTimeValidationForEndTime = false;
  //         this.assignClassForm.patchValue({
  //           endTime: null,
  //         });
  //       }
  //     } else {
  //       this.greaterTimeValidationForEndTime = true;
  //       this.timeMatchValidationForEndTime = false;
  //       this.assignClassForm.patchValue({
  //         endTime: null,
  //         startTime: null,
  //       });
  //     }
  //   } else {
  //     if (slotEndTime >= classStartTime && slotEndTime <= classEndTime) {
  //       if (slotEndTime >= teacherStartTime && slotEndTime <= teacherEndTime) {
  //         if (this.TempAssignmentList.length > 0) {
  //           let isExistsSlot = this.TempAssignmentList.find(
  //             (item: any, index: number) =>
  //               slotEndTime >= item.startTime &&
  //               slotEndTime <= item.endTime
  //           );
  //           if (isExistsSlot) {
  //             this.greaterTimeValidationForEndTime = false;
  //             this.timeMatchValidationForEndTime = true;
  //             this.assignClassForm.patchValue({
  //               endTime: null,
  //             });
  //           }
  //           else {
  //             this.timeMatchValidationForEndTime = false;
  //             this.greaterTimeValidationForEndTime = false;

  //             const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //               assignment.dayId === this.selectedDayId &&
  //               assignment.teacherID === this.selectedTeacherId &&
  //               assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //             );

  //             if (isOverlapping) {
  //               this.slotCreatedForSomeOtherClassforEndTime = true;
  //               this.greaterTimeValidationForEndTime = false;
  //               this.timeMatchValidationForEndTime = false;
  //               this.assignClassForm.patchValue({
  //                 endTime: null,
  //               });
  //             }
  //             else {
  //               this.slotCreatedForSomeOtherClassforEndTime = false;
  //               this.greaterTimeValidationForEndTime = false;
  //               this.timeMatchValidationForEndTime = false;
  //             }
  //           }
  //         }
  //         else {
  //           this.timeMatchValidationForEndTime = false;
  //           this.greaterTimeValidationForEndTime = false;

  //           const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //             assignment.dayId === this.selectedDayId &&
  //             assignment.teacherID === this.selectedTeacherId &&
  //             assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //           );

  //           if (isOverlapping) {
  //             this.slotCreatedForSomeOtherClassforEndTime = true;
  //             this.greaterTimeValidationForEndTime = false;
  //             this.timeMatchValidationForEndTime = false;
  //             this.assignClassForm.patchValue({
  //               endTime: null,
  //             });
  //           }
  //           else {
  //             this.slotCreatedForSomeOtherClassforEndTime = false;
  //             this.greaterTimeValidationForEndTime = false;
  //             this.timeMatchValidationForEndTime = false;
  //           }
  //         }
  //       } else {
  //         // $('#endTime').val(null);
  //         this.greaterTimeValidationForEndTime = false;
  //         this.timeMatchValidationForEndTime = true;
  //         this.assignClassForm.patchValue({
  //           endTime: null,
  //         });
  //       }
  //     } else {
  //       // $('#endTime').val(null);
  //       this.greaterTimeValidationForEndTime = false;
  //       this.timeMatchValidationForEndTime = true;
  //       this.assignClassForm.patchValue({
  //         endTime: null,
  //       });
  //     }
  //   }
  // }

  ApplyValidationForEndTime() {
    const slotStartTime = this.assignClassForm.value.startTime
      ? this.assignClassForm.value.startTime + ':00'
      : null;
    const slotEndTime = this.assignClassForm.value.endTime
      ? this.assignClassForm.value.endTime + ':00'
      : null;
    const selectedDateRaw = this.assignClassForm.value.startDate;

    if (!slotStartTime || !slotEndTime || !selectedDateRaw) {
      this.greaterTimeValidationForEndTime = false;
      this.timeMatchValidationForEndTime = false;
      return;
    }

    const selectedDate = new Date(selectedDateRaw).toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const classSlot = this.classDaysSlot.find(
      (item: any) => item.dayID == this.selectedDayId
    );
    const teacher = this.teachersData.find(
      (item: any) => item.teacherID == this.selectedTeacherId
    );
    const teacherAvailability = teacher?.teacherAvailability.find(
      (item: any) => item.dayID == this.selectedDayId
    );

    if (!classSlot || !teacher || !teacherAvailability) {
      this.assignClassForm.patchValue({ endTime: null });
      return;
    }

    const classStartTime = classSlot.startTime;
    const classEndTime = classSlot.endTime;
    const teacherStartTime = teacherAvailability.startTime;
    const teacherEndTime = teacherAvailability.endTime;

    // Basic check: Start must be before end
    if (slotStartTime >= slotEndTime) {
      this.greaterTimeValidationForEndTime = true;
      this.timeMatchValidationForEndTime = false;
      this.assignClassForm.patchValue({ endTime: null });
      return;
    }

    // Check class and teacher availability bounds
    const isWithinClassTime =
      slotEndTime >= classStartTime && slotEndTime <= classEndTime;
    const isWithinTeacherTime =
      slotEndTime >= teacherStartTime && slotEndTime <= teacherEndTime;

    if (!isWithinClassTime || !isWithinTeacherTime) {
      this.timeMatchValidationForEndTime = true;
      this.assignClassForm.patchValue({ endTime: null });
      return;
    }

    // Check if endTime overlaps with temporary assignments
    const isExistsSlot = this.TempAssignmentList.find(
      (item: any) =>
        slotEndTime >= item.startTime && slotEndTime <= item.endTime
    );

    if (isExistsSlot) {
      this.timeMatchValidationForEndTime = true;
      this.assignClassForm.patchValue({ endTime: null });
      return;
    }

    // Filter unique teacher assignments on the same day
    const teacherAssignments = teacher.teacherAssignmentList.filter(
      (x: any) =>
        x.teacherID === this.selectedTeacherId && x.dayId === this.selectedDayId
    );

    const uniqueAssignments = teacherAssignments.filter(
      (assignment: any, index: number, self: any[]) =>
        index ===
        self.findIndex(
          (a) =>
            a.classStartTime === assignment.classStartTime &&
            a.classEndTime === assignment.classEndTime &&
            new Date(a.assignmentDate).toISOString().split('T')[0] ===
            new Date(assignment.assignmentDate).toISOString().split('T')[0]
        )
    );

    // Check for overlapping slot in another class on same date
    const isOverlapping = uniqueAssignments.some((assignment: any) => {
      const assignmentDate = new Date(assignment.assignmentDate)
        .toISOString()
        .split('T')[0];
      return (
        assignment.dayId === this.selectedDayId &&
        assignment.teacherID === this.selectedTeacherId &&
        (assignment.classID !== this.classID ||
          assignment.classID == this.classID) &&
        assignmentDate === selectedDate &&
        assignment.classStartTime <= slotEndTime &&
        assignment.classEndTime >= slotEndTime
      );
    });

    if (isOverlapping) {
      this.slotCreatedForSomeOtherClassforEndTime = true;
      this.timeMatchValidationForEndTime = false;
      this.assignClassForm.patchValue({ endTime: null });
    } else {
      this.slotCreatedForSomeOtherClassforEndTime = false;
      this.timeMatchValidationForEndTime = false;
    }
    this.greaterTimeValidationForEndTime = false;

    //Added on 04/07/25
    const assignmentDates: string[] = [];
    teacherAssignments.forEach((item: any) => {
      if (item?.assignmentDate) {
        assignmentDates.push(item.assignmentDate);
      }
    });

    if (this.selectedMatchingDates.length > 0) {
      const isAlreadyAssignedClassWithSameRange = teacherAssignments.find(
        (x: any) =>
          this.selectedMatchingDates.includes(x.assignmentDate) &&
          x.classStartTime === classStartTime
      );

      if (isAlreadyAssignedClassWithSameRange != null) {
        this.toastr.warning(
          'A class with the same timing has already been assigned within the selected date range.'
        );
        this.assignClassForm.patchValue({ endTime: null });
        return;
      }
    }
    //End
  }

  resetForm() {
    this.assignClassForm.reset({
      slotID: 0,
      dayID: 0,
      classSlotID: 0,
      teacherID: 0,
      startDate: null,
      endDate: null,
      isRepeating: true,
      startTime: null,
      endTime: null,
      description: '',
      selectedStaff: [],
    });
    this.assignClassForm.get('endDate')?.setValidators([Validators.required]);

    this.greaterTimeValidationForStartTime = false;
    this.greaterTimeValidationForEndTime = false;
    this.timeMatchValidationForStartTime = false;
    this.timeMatchValidationForEndTime = false;
    this.slotCreatedForSomeOtherClass = false;
    this.slotCreatedForSomeOtherClassforEndTime = false;
  }

  closeModel() {
    if (!this.viewSlot) {
      this.assignClassForm.reset({
        slotID: 0,
        dayID: 0,
        classSlotID: 0,
        teacherID: 0,
        startDate: null,
        endDate: null,
        isRepeating: true,
        startTime: null,
        endTime: null,
        description: '',
        selectedStaff: [],
      });

      this.selectedStaffList = this.selectedStaffList.map((staff: any) => ({
        ...staff,
        isChecked: false,
      }));

      this.greaterTimeValidationForStartTime = false;
      this.greaterTimeValidationForEndTime = false;
      this.timeMatchValidationForStartTime = false;
      this.timeMatchValidationForEndTime = false;
      this.slotCreatedForSomeOtherClass = false;
      this.slotCreatedForSomeOtherClassforEndTime = false;
      this.classTimingFilterbySelectedDay = [];
    } else {
      $('#assignClassModal').modal('hide');
      this.viewSlot = false;
      this.isUpdate = false;
    }
  }

  manageRecord() {
    if (!this.isUpdate) {
      this.AddToAssignmentList();
    } else {
      this.updateAssignmentList();
    }
  }

  AddToAssignmentList() {
    if (!this.isRepeating) {
      this.assignClassForm.get('endDate')?.clearValidators();
      this.assignClassForm.get('endDate')?.updateValueAndValidity();
    }

    if (this.assignClassForm.valid) {
      // let classSlotID = this.dayNameArray.find((item) => item.dayID == this.selectedDayId)?.slotID;
      this.assignClassForm.patchValue({
        teacherID:
          this.scheduleType == 'staff'
            ? this.selectedTeacherId
            : this.selectedStudentId,
        classID: this.classID,
      });

      if (this.scheduleType != 'staff') {
        const isDuplicate = this.TempAssignmentList.some(
          (item) =>
            // item.classID === this.assignClassForm.value.classID &&
            item.dayID === this.assignClassForm.value.dayID &&
            item.teacherID === this.assignClassForm.value.teacherID &&
            item.startTime === this.assignClassForm.value.startTime &&
            item.endTime === this.assignClassForm.value.endTime
        );
        if (isDuplicate) {
          this.toastr.warning('This time slot is already created.');
          this.resetForm();
          const startDate = new Date();
          const endDate = null;
          setTimeout(() => {
            this.InitDatePicker(startDate, endDate);
          });
          return;
        }
      }

      this.TempAssignmentList.push(this.assignClassForm.value);
      this.TempAssignmentList = this.TempAssignmentList.map((item) => ({
        ...item,
        dayName: dayMap[item.dayID] || 'Unknown',
      }));
      this.resetForm();
      const startDate = new Date();
      const endDate = null;
      setTimeout(() => {
        this.InitDatePicker(startDate, endDate);
      });
    } else {
      this.assignClassForm.markAllAsTouched();
    }
  }

  updateAssignmentList() {
    if (!this.isRepeating) {
      this.assignClassForm.get('endDate')?.clearValidators();
      this.assignClassForm.get('endDate')?.updateValueAndValidity();
    }
    if (this.assignClassForm.valid) {
      this.TempAssignmentList[this.indexValue] = {
        ...this.TempAssignmentList[this.indexValue],
        startTime: this.assignClassForm.value.startTime,
        endTime: this.assignClassForm.value.endTime,
        startDate: this.selectedStartDate
          ? this.formatDate(this.selectedStartDate)
          : this.assignClassForm.value.startDate,
        endDate: this.selectedEndDate
          ? this.formatDate(this.selectedEndDate)
          : this.assignClassForm.value.endDate,
      };
      this.TempAssignmentList = [...this.TempAssignmentList];
      this.resetForm();
      const startDate = new Date();
      const endDate = null;
      setTimeout(() => {
        this.InitDatePicker(startDate, endDate);
      });
      this.isUpdate = false;
      this.indexValue = 0;
    } else {
      this.assignClassForm.markAllAsTouched();
    }
  }

  formatDate(date: Date): string {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  }

  editSlot(index: number) {
    this.isUpdate = true;
    this.indexValue = index;
    const slot = this.TempAssignmentList[index];

    this.assignClassForm.patchValue({
      slotID: slot.slotID,
      dayID: slot.dayID,
      classSlotID: slot.classSlotID,
      teacherID: slot.teacherID,
      startTime: slot.startTime.split(':').slice(0, 2).join(':'),
      endTime: slot.endTime.split(':').slice(0, 2).join(':'),
      startDate: slot.startDate,
      endDate: slot.endDate,
      isRepeating: slot.isRepeating,
    });

    this.selectedDayId = slot.dayID;
    // this.isRepeating = slot.isRepeating == true ? slot.isRepeating : slot.isRepeating;

    // const startDateObj = new Date(slot.startDate);
    // const endDateObj = new Date(slot.endDate);
    // if (this.startDateInstance) {
    //   this.startDateInstance.setDate(startDateObj, false);
    // }
    // if (this.endDateInstance) {
    //   this.endDateInstance.setDate(endDateObj, false);
    // }
  }

  removeList(index: number) {
    this.isUpdate = false;
    this.resetForm();
    this.TempAssignmentList.splice(index, 1);
  }

  //Commented on 03/06/25
  //  finalSubmission() {
  //   if (this.viewSlot && !this.assignClassForm.valid) {
  //     $('#assignClassModal').modal('hide');
  //     this.viewSlot = false;
  //   }
  //   else {
  //     let assignmentbo: teacherAssignmnentObject = {
  //       slots: this.TempAssignmentList,
  //     };
  //     this.AssignmentBO.push(assignmentbo);
  //   }
  //   this.TempAssignmentList = [];
  //   this.selectedTeacherId = 0;
  //   this.selectedDayId = 0;
  //   $('#assignClassModal').modal('hide');
  //   this.resetForm();
  // }

  finalSubmission() {
    if (this.scheduleType == 'staff') {
      let existingIndex = this.AssignmentBO.findIndex((teacher: any) =>
        teacher.slots?.some(
          (slot: any) =>
            slot.teacherID === this.selectedTeacherId &&
            slot.dayID === this.selectedDayId
        )
      );

      if (existingIndex !== -1) {
        this.AssignmentBO.splice(existingIndex, 1);
      }
    } else {
      let existingIndex = this.AssignmentBO.findIndex((teacher: any) =>
        teacher.slots?.some(
          (slot: any) =>
            slot.teacherID === this.selectedStudentId &&
            slot.dayID === this.selectedDayId
        )
      );

      if (existingIndex !== -1) {
        this.AssignmentBO.splice(existingIndex, 1);
      }
    }

    let assignmentbo: teacherAssignmnentObject = {
      slots: this.TempAssignmentList,
    };
    this.AssignmentBO.push(assignmentbo);

    this.TempAssignmentList = [];
    this.selectedTeacherId = 0;
    this.selectedStudentId = 0;
    this.selectedDayId = 0;
    $('#assignClassModal').modal('hide');
    this.resetForm();
  }

  hasSlots(staffId: number): boolean {
    if (this.scheduleType == 'staff') {
      return this.AssignmentBO.some((teacher: any) =>
        teacher.slots?.some((slot: any) => slot.teacherID === staffId)
      );
    } else {
      return this.AssignmentBO.some((teacher: any) =>
        teacher.slots?.some((slot: any) => slot.teacherID === staffId)
      );
    }
  }

  formatToISODate(dateStr: string): string {
    const [month, day, year] = dateStr.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  manageBulkAssignment() {
    this.spinner.show();
    const transformedPayload = this.AssignmentBO.map((assignment: any) => ({
      slots: assignment.slots.map((slot: any) => ({
        TeacherID: slot.teacherID,
        ClassID: slot.classID,
        // startDate: new Date(slot.startDate),
        // endDate: new Date(slot.endDate),
        startDate: new Date(this.formatToISODate(slot.startDate)),
        endDate:
          slot.endDate != null
            ? new Date(this.formatToISODate(slot.endDate))
            : new Date(slot.endDate),
        tocAssignmentDate: null,
        StartTime: slot.startTime,
        EndTime: slot.endTime,
        isRepeated: slot.isRepeating,
        dayID: slot.dayID,
      })),
    }));

    var userType = this.scheduleType == 'staff' ? 'Staff' : 'Student';

    this.manageScheduler
      .BulkClassAssignment(transformedPayload, userType)
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.message === 'Success') {
            this.toastr.success(response.activity);
            this.spinner.hide();
            this.resetForm();
            this.resetAllPage();
            // this.getAllAvailableTeachersByCentreID(this.classID, this.classDaysSlot);

            // Added on 24/06/25 Arsh
            if (this.isOnboarding == true) {
              this.onBulkAssignmentSuccess.emit();
            } else {
              this.commonService.trigger();
            }
          } else {
            this.spinner.hide();
            this.toastr.error(response.activity || 'Assignment failed.');
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err?.message || 'An error occurred.');
        },
      });
  }

  resetAllPage() {
    this.classList = null;
    this.staffList = [];
    this.selectedStaff = [];
    this.selectedDayIds = [];
    if (this.filteredDaysWithIds && Array.isArray(this.filteredDaysWithIds)) {
      this.filteredDaysWithIds.forEach((day: any) => {
        day.isActive = false;
      });
    }
    this.isRepeating = true;
    this.startDateInstance = null;
    this.endDateInstance = null;
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    this.selectedStaffIds = [];
    this.selectedStudentIds = [];
    this.selectedClassIds = null;
    this.filteredStaffList = null;
    this.classDaysID = [];
    this.classDaysSlot = [];
    this.classID = 0;
    this.className = '';
    this.dayNameArray = [];
    this.assignClassTo = null;
    this.teachersData = [];
    this.selectedStaffList = null;
    this.filteredClassList = null;
    this.AssignmentBO = [];
    this.selectedTeacherId = null;
    this.selectedDayId = null;
    this.greaterTimeValidationForStartTime = false;
    this.greaterTimeValidationForEndTime = false;
    this.timeMatchValidationForStartTime = false;
    this.timeMatchValidationForEndTime = false;
    this.slotCreatedForSomeOtherClass = false;
    this.slotCreatedForSomeOtherClassforEndTime = false;
    this.TempAssignmentList = [];
    this.indexValue = 0;
    this.isUpdate = false;
    this.filterTeacherDays = null;
    this.studentList = null;
    this.selectedStudentList = null;
    this.filterStudentDays = null;
    this.selectedStudentId = null;
    this.selectedClassStaffRatio = null;
    this.selectedClassStudentRatio = null;
    this.viewSlot = false;
    this.resetForm();
    this.getClassList();
    if (this.scheduleType == 'staff') {
      this.getStaffList();
    } else {
      this.getStudentList();
    }
  }
}
