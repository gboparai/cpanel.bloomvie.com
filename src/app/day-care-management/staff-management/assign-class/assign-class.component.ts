import { BreadcrumbComponent } from './../../../common-component/breadcrumb/breadcrumb.component';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { Component, Input } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AssignClassService } from './assign-class.service';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../../common-component/common.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { finalize } from 'rxjs';
import { TimeFormatAmPmPipe, TimeFormatPipe } from '../../../bloomvie-management/dc-appointments-list/time-format.pipe';
import { DatePipe } from '@angular/common';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
declare var $: any;

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
  classSlotID: number;
  teacherID: number;
  startTime: string;
  endTime: string;
  day?: number;
}

@Component({
  selector: 'app-assign-class',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    BreadcrumbComponent,
    CommonModule,
    NgSelectModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    TimeFormatPipe,
    TimeFormatAmPmPipe
  ],
  providers: [DatePipe],
  templateUrl: './assign-class.component.html',
  styleUrl: './assign-class.component.css',
})
export class AssignClassComponent {
  public UserRoleID: number = 0;
  public centreID: number = 0;
  public loginUserID: number = 0;
  public classList: any[] = [];
  public masterDays: any[] = [];
  public itemPerPage: number = 3;
  public currentPage: number = 1;
  public classDaysID: number[] = [];
  public classDaysSlot: any[] = [];
  public classID: number = 0;
  public className: string = '';
  public isClassAssigned: boolean = true;
  public primaryDaycareID: number = 0;
  public teachersData: any[] = [];
  public dayNameArray: any[] = [];
  public assignClassForm: any;
  public displayNameInModal: string = '';
  private teacherID: number = 0;
  public TempAssignmentList: createTeacherAssignmentSlotType[] = [];
  // public FinalAssignmentList: createTeacherAssignmentSlotType[] = [];
  public AssignmentBO: teacherAssignmnentObject[] = [];
  public isUpdate: boolean = false;
  private dayID: number = 0;
  private indexValue: number = 0;
  private viewSlot: boolean = false;
  public greaterTimeValidationForStartTime: boolean = false;
  public greaterTimeValidationForEndTime: boolean = false;
  public timeMatchValidationForStartTime: boolean = false;
  public timeMatchValidationForEndTime: boolean = false;
  public checkboxIndexValue: number = 0;
  public slotCreatedForSomeOtherClass: boolean = false;
  public slotCreatedForSomeOtherClassforEndTime: boolean = false;
  public dateRange: string[] = [];
  public teacherRoleID: number = 0;
  @Input() childActive: boolean = false;

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private assignClassService: AssignClassService,
    private cookie: CookieService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    public onBoardingService: OnboardingService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.assignClassForm = this.fb.group({
      slotID: [0],
      dayID: [0],
      classSlotID: [0],
      teacherID: [0],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.cookie.check('UserRoleId')) {
      this.UserRoleID = parseInt(this.cookie.get('UserRoleId'));
    } else if (this.cookie.check('userRoleID')) {
      this.UserRoleID = parseInt(this.cookie.get('userRoleID'));
    }
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
        this.getClassList();
        this.getAllDays();
      }
    });
  }

  // get specific day date from specific dateRange

  getSpecificWeekdayInRange(
    startDateStr: string,
    endDateStr: string,
    targetDayName: string
  ) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const targetDayIndex = daysOfWeek.indexOf(targetDayName);

    if (targetDayIndex === -1) {
      throw new Error('Invalid day name');
    }

    const current = new Date(startDate);
    while (current <= endDate) {
      if (current.getDay() === targetDayIndex) {
        return current; // Return date in YYYY-MM-DD
      }
      current.setDate(current.getDate() + 1);
    }

    return null;
  }

  createDynamicSlot(
    event: any,
    index: number,
    id: number,
    teacherID: number,
    teacherRecord: any
  ) {
    
    this.isUpdate = false;
    this.teacherID = teacherID;
    this.dayID = id;
    let checked = event.target.checked;
    this.checkboxIndexValue = index;
    this.teacherRoleID = teacherRecord.userRoleID;
    let classSlotID = this.dayNameArray.find(
      (item) => item.dayID == this.dayID
    )?.slotID;

    if (checked == true) {
      this.displayNameInModal = this.dayNameArray.find(
        (item) => item.dayID == id
      ).dayName;

      if (teacherRecord.userRoleID == 8) {
        let teacherRange = teacherRecord.teacherAvailability.find(
          (item: any) => item.dayID == id
        )?.dateRanges;
        let dateRange: any = [];
        teacherRange.forEach((item: any) => {
          let daysDate = this.getSpecificWeekdayInRange(
            item.startDate,
            item.endDate,
            this.displayNameInModal
          );

          let formatedDated = this.datePipe.transform(daysDate, 'dd/MM/yyyy');

          dateRange.push(formatedDated);
        });
        this.dateRange = dateRange;
      }
      $('#AddSlot').modal('show');
    } else {
      this.teacherID = 0;
      this.dayID = 0;
      this.TempAssignmentList = [];
      let assignmentData: any = this.AssignmentBO.find(
        (item: any) => item.teacherID == teacherID
      );
      let index = this.AssignmentBO.indexOf(assignmentData);
      this.AssignmentBO[index] = assignmentData.slots.filter(
        (item: any) => item.teacherID != teacherID && item.dayID != id
      );
    }
  }

  updateAssignmentList() {
   
    if (this.assignClassForm.valid) {
      this.TempAssignmentList[this.indexValue] = {
        ...this.TempAssignmentList[this.indexValue],
        startTime: this.assignClassForm.value.startTime,
        endTime: this.assignClassForm.value.endTime,
      };

      this.TempAssignmentList = [...this.TempAssignmentList];
      this.assignClassForm.reset();
      this.isUpdate = false;
      this.indexValue = 0;
    } else {
      this.assignClassForm.markAllAsTouched;
    }
  }

  editSlot(index: number) {
    this.isUpdate = true;
    this.indexValue = index;
    this.assignClassForm.patchValue({
      slotID: this.TempAssignmentList[index].slotID,
      dayID: this.TempAssignmentList[index].dayID,
      classSlotID: this.TempAssignmentList[index].classSlotID,
      teacherID: this.TempAssignmentList[index].teacherID,
      startTime: this.TempAssignmentList[index].startTime
        .split(':')
        .slice(0, 2)
        .join(':'),
      endTime: this.TempAssignmentList[index].endTime
        .split(':')
        .slice(0, 2)
        .join(':'),
    });
  }

  removeList(index: number) {
    this.isUpdate = false;
    this.assignClassForm.reset();
    this.TempAssignmentList.splice(index, 1);
  }

  isChecked(teacherRecord: any, dayID: number): boolean {
    const assignmentData: any = this.AssignmentBO.find(
      (item: any) => item.teacherID == teacherRecord.teacherID
    );
    if (assignmentData) {
      let isExistsRecord = assignmentData.slots.find(
        (item: any) =>
          item.dayID == dayID && item.teacherID == teacherRecord.teacherID
      );
      if (isExistsRecord) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  finalSubmission() {
    
    let existingSlotID = this.dayNameArray.find(
      (item: any) => item.dayID == this.dayID
    )?.slotID;

    let recordExists = this.AssignmentBO.find(
      (item: any) =>
        item.teacherID == this.teacherID && item.slotID == existingSlotID
    );
    if (recordExists) {
      let index = this.AssignmentBO.indexOf(recordExists);
      if (!this.viewSlot) {
        this.AssignmentBO[index].slots.push(...this.TempAssignmentList);
      } else {
        this.AssignmentBO[index].slots = [];
        this.AssignmentBO[index].slots.push(...this.TempAssignmentList);
      }
    } else {
      let classSlotID = this.dayNameArray.find(
        (item) => item.dayID == this.dayID
      )?.slotID;

      let assignmentbo: teacherAssignmnentObject = {
        teacherID: this.teacherID,
        slotID: classSlotID,
        classID: this.classID,
        tocAssignmentDate: this.dateRange.toString(),
        id: 0,

        slots: this.TempAssignmentList,
      };
      this.viewSlot = false;
      this.AssignmentBO.push(assignmentbo);
    }

    this.TempAssignmentList = [];
    this.teacherID = 0;
    this.dayID = 0;
    $('#AddSlot').modal('hide');
    this.assignClassForm.reset();
  }

  onClose() {
    
    let teacherRecord: any = this.AssignmentBO.find(
      (item: any) => item.teacherID == this.teacherID
    );
    if (teacherRecord) {
      let dayID = teacherRecord.slots.find(
        (item: any) => item.dayID == this.dayID
      )?.dayID;
      if (dayID == undefined) {
        const checkbox = document.getElementById(
          'day_' + this.checkboxIndexValue + '_' + this.dayID
        ) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = false;
        }
      }
    } else {
      const checkbox = document.getElementById(
        'day_' + this.checkboxIndexValue + '_' + this.dayID
      ) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = false;
      }
    }
    this.teacherRoleID = 0;
    this.dateRange = [];
    this.assignClassForm.reset();
    this.isUpdate = false;
    this.viewSlot = false;
    this.TempAssignmentList = [];
    this.teacherID = 0;
    this.dayID = 0;
    this.indexValue = 0;
    this.greaterTimeValidationForStartTime = false;
    this.greaterTimeValidationForEndTime = false;
    this.timeMatchValidationForStartTime = false;
    this.timeMatchValidationForEndTime = false;
  }

  viewSlots(teacherID: number, dayID: number, teacherRecord: any) {
    this.viewSlot = true;
    this.teacherID = teacherID;
    this.teacherRoleID = teacherRecord.userRoleID;
    this.dayID = dayID;
    let teacherSlots = this.AssignmentBO.find(
      (item: any) => item.teacherID == teacherID
    )?.slots;
    this.displayNameInModal = this.dayNameArray.find(
      (item) => item.dayID == dayID
    ).dayName;
    if (teacherSlots) {
      this.TempAssignmentList = teacherSlots.filter(
        (item: any) => item.dayID == dayID
      );
      if (teacherRecord.userRoleID == 8) {
        let teacherRange = teacherRecord.teacherAvailability.find(
          (item: any) => item.dayID == dayID
        )?.dateRanges;
        let dateRange: any = [];
        teacherRange.forEach((item: any) => {
          let daysDate = this.getSpecificWeekdayInRange(
            item.startDate,
            item.endDate,
            this.displayNameInModal
          );

          let formatedDated = this.datePipe.transform(daysDate, 'dd/MM/yyyy');

          dateRange.push(formatedDated);
        });
        this.dateRange = dateRange;
      }
      $('#AddSlot').modal('show');
    }
  }

  AddToAssignmentList() {
    if (this.assignClassForm.valid) {
      let classSlotID = this.dayNameArray.find(
        (item) => item.dayID == this.dayID
      )?.slotID;

      this.assignClassForm.patchValue({
        slotID: 0,
        dayID: this.dayID,
        teacherID: this.teacherID,
        classSlotID: classSlotID,
      });

      this.TempAssignmentList.push(this.assignClassForm.value);
      this.assignClassForm.reset();
    } else {
      this.assignClassForm.markAllAsTouched();
    }
  }

  isDisableDays(teacherRecord: any, id: any): boolean {
    let classAvailability = this.dayNameArray.find((item) => item.dayID == id);
    if (classAvailability) {
      let teacherAvailablity = teacherRecord.teacherAvailability.find(
        (item: any) => item.dayID == id
      );
      if (teacherAvailablity) {
        if (
          (classAvailability.startTime <= teacherAvailablity.startTime &&
            classAvailability.endTime > teacherAvailablity.startTime) ||
          (classAvailability.startTime < teacherAvailablity.endTime &&
            classAvailability.endTime > teacherAvailablity.endTime) ||
          (teacherAvailablity.startTime <= classAvailability.startTime &&
            teacherAvailablity.endTime > classAvailability.startTime) ||
          (teacherAvailablity.startTime <= classAvailability.endTime &&
            teacherAvailablity.endTime > classAvailability.endTime)
        ) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  // generateSlots(
  //   data: { startTime: string; endTime: string },
  //   assignedSlots: any[],
  //   assignedAllTimeSlot: any[]
  // ) {
  //   const slots = [];
  //   let currentTime = this.convertTimeToMinutes(data.startTime);
  //   const endTimeMinutes = this.convertTimeToMinutes(data.endTime);

  //   while (currentTime < endTimeMinutes) {
  //     const nextTime = Math.min(currentTime + 60, endTimeMinutes);
  //     const startTimeStr = this.convertMinutesToTime(currentTime);
  //     const endTimeStr = this.convertMinutesToTime(nextTime);

  //     const isAssigned = assignedSlots.some(
  //       (x: any) =>
  //         x.startTime.slice(0, 5) === startTimeStr &&
  //         x.endTime.slice(0, 5) === endTimeStr
  //     );
  //     const isBlocked = assignedAllTimeSlot.some((x: any) => {
  //       const assignedStart = this.convertTimeToMinutes(x.startTime);
  //       const assignedEnd = this.convertTimeToMinutes(x.endTime);
  //       const slotStart = this.convertTimeToMinutes(startTimeStr);
  //       const slotEnd = this.convertTimeToMinutes(endTimeStr);

  //       return (
  //         (slotStart >= assignedStart && slotStart < assignedEnd) ||
  //         (slotEnd > assignedStart && slotEnd <= assignedEnd) ||
  //         (slotStart <= assignedStart && slotEnd >= assignedEnd)
  //       );
  //     });
  //     slots.push({
  //       startTime: startTimeStr,
  //       endTime: endTimeStr,
  //       isSelected: isAssigned,
  //       isDisabled: !isAssigned && isBlocked,
  //     });

  //     currentTime = nextTime;
  //   }

  //   return slots;
  // }

  // convertTimeToMinutes(time: string): number {
  //   const [hours, minutes] = time.split(':').map(Number);
  //   return hours * 60 + minutes;
  // }

  // convertMinutesToTime(minutes: number): string {
  //   const hours = Math.floor(minutes / 60);
  //   const mins = minutes % 60;
  //   return `${hours.toString().padStart(2, '0')}:${mins
  //     .toString()
  //     .padStart(2, '0')}`;
  // }

  getAllDays() {
    this.assignClassService.getAllDays().subscribe((response: ApiResponse) => {
      if (response.message == 'Success') {
        this.masterDays = response.result;
      }
    });
  }

  getClassList() {
    this.spinner.show();
    this.assignClassService
      .getDaycareClasses(this.centreID)
      .subscribe((result: ApiResponse) => {
        if (result.message == 'Success') {
          this.classList = result.result;
        
        }
        this.spinner.hide();
      });
  }

  getAllAvailableTeachersByCentreID(classId: number, classTimings: any) {
    this.spinner.show();
    let classTimingsBO = classTimings.map((item: any) => {
      return {
        ...item,
        slotStartTime: item.startTime,
        slotEndTime: item.endTime,
      };
    });
    this.assignClassService
      .getAllAvailableTeachersByCentreID(classId, classTimingsBO)
      .subscribe((response: ApiResponse) => {
        if (response.message == 'Success') {
          this.teachersData = response.result;
          let data = this.teachersData.map(
            (item: any) => item.teacherAssignmentList
          );

          this.AssignmentBO = data.flat().map((result: any) => {
            let dynamicSlots = result.slots.map((item: any) => {
              let dayID = this.dayNameArray.find(
                (res: any) => res.slotID == item.classSlotID
              )?.dayID;
              return {
                ...item,
                dayID: dayID,
              };
            });

            return {
              ...result,
              slots: dynamicSlots,
            };
          });
          // const getTimeRange = (dayId: number) => {
          //   const foundSlot = this.classDaysSlot.find((x) => x.dayID === dayId);
          //   return {
          //     startTime: foundSlot?.startTime || '00:00',
          //     endTime: foundSlot?.endTime || '00:00',
          //   };
          // };

          // const getClassSlotId = (dayId: number) => {
          //   const foundSlot = this.classDaysSlot.find((x) => x.dayID === dayId);
          //   return foundSlot ? foundSlot.slotID : 0;
          // };

          // const getAllAssignedTimeSlot = (teacherId: number, data: any[]) => {
          //   return data.flatMap((slot: any) =>
          //     slot.assignedTimeSlots.map((timeSlot: any) => ({
          //       startTime: timeSlot.startTime,
          //       endTime: timeSlot.endTime,
          //     }))
          //   );
          // };

          // this.teachersData = response.result.map((data: any) => ({
          //   id: data.id,
          //   name: data.name,
          //   teacherAvailablity: data.dayIDs.map((x: any) => this.getDayName(x)),
          //   assignments: Array.from(
          //     new Map(
          //       data.slotInfo.map(
          //         (item: {
          //           classID: number;
          //           centreName: string;
          //           className: string;
          //         }) => [
          //           item.classID,
          //           {
          //             classId: item.classID,
          //             centreName: item.centreName,
          //             className: item.className,
          //             assignedDays: [],
          //           },
          //         ]
          //       )
          //     ).values()
          //   ).map((item: any) => {
          //     item.assignedDays = data.slotInfo
          //       .filter((x: any) => x.classID === item.classId)
          //       .map(
          //         (day: { dayName: string; assignedTimeSlots: any[] }) =>
          //           `${day.dayName}: (${day.assignedTimeSlots
          //             .map(
          //               (slot: { startTime: string; endTime: string }) =>
          //                 `${slot.startTime}-${slot.endTime}`
          //             )
          //             .join(', ')})`
          //       )
          //       .join(', ');

          //     return item;
          //   }),

          //   assignedDays: this.masterDays
          //     .filter((day) =>
          //       data.slotInfo.some(
          //         (slot: any) =>
          //           slot.dayID === day.id && slot.classID === this.classID
          //       )
          //     )
          //     .map((day) => day.day)
          //     .join(','),
          //   centre: data.centerInformation,
          //   slots: this.masterDays.map((day) => ({
          //     classSlotId: getClassSlotId(day.id),
          //     dayId: day.id,
          //     dayName: day.day,
          //     isSelected: data.slotInfo.some(
          //       (x: any) => x.dayID === day.id && x.classID === this.classID
          //     ),
          //     isDisabled:
          //       !this.classDaysID.includes(day.id) ||
          //       !data.dayIDs.includes(day.id),
          //     slots: this.generateSlots(
          //       getTimeRange(day.id),
          //       data.slotInfo.find(
          //         (x: any) => x.dayID === day.id && x.classID === this.classID
          //       )?.assignedTimeSlots || [],
          //       getAllAssignedTimeSlot(
          //         data.id,
          //         data.slotInfo.filter((x: any) => x.dayID === day.id)
          //       )
          //     ),
          //   })),
          // }));

          setTimeout(() => {
            this.spinner.hide();
          }, 500);
        } else {
          this.spinner.hide();
        }
      });
  }

  assignClass(event: any) {
   
    this.currentPage = 1;
    if (event) {
      this.primaryDaycareID = event.primaryDayCareID || this.primaryDaycareID;
      this.className = event.name || '';
      this.classID = event.id || 0;
      this.classDaysSlot = event.dayID || [];
      this.classDaysID = this.classDaysSlot.map((item: any) => item.dayID);
      this.dayNameArray = this.classDaysSlot.map((item: any) => {
        return {
          ...item,
          dayName: this.getDayName(item.dayID),
        };
      });
      this.getAllAvailableTeachersByCentreID(this.classID, this.classDaysSlot);
    } else {
      this.classDaysSlot = [];
      this.classDaysID = [];
      this.classID = 0;
      this.className = '';
      this.teachersData = [];
      this.dayNameArray = [];
    }
  }

  getDayName(dayID: number): string {
    let dayInfo = this.masterDays.find((item) => item.id == dayID);
    return dayInfo.day;
  }

  assignClassOnSpecificDay(teacherIndex: number) {
    this.teachersData = this.teachersData.map((teacher, index) =>
      index === teacherIndex
        ? {
          ...teacher,
          assignedDays: teacher.slots
            .filter((x: any) => x.isSelected)
            .map((item: any) => item.dayName)
            .join(','),
          slots: teacher.slots.map((slot: any) => ({
            ...slot,
            slots: slot.slots.map((nestedSlot: any) => ({
              ...nestedSlot,
              isSelected: !slot.isSelected ? false : nestedSlot.isSelected,
            })),
          })),
        }
        : teacher
    );
  }

  // dynamic slots validation for startTime
  ApplyValidationForStartTime() {
    let slotStartTime = this.assignClassForm.value.startTime
      ? this.assignClassForm.value.startTime + ':00'
      : this.assignClassForm.value.startTime;
    let slotEndTime = this.assignClassForm.value.endTime
      ? this.assignClassForm.value.endTime + ':00'
      : this.assignClassForm.value.endTime;

    let classSlots = this.classDaysSlot.find(
      (item: any) => item.dayID == this.dayID
    );

    let classStartTime = classSlots.startTime;
    let classEndTime = classSlots.endTime;

    let teacherRecord = this.teachersData.find(
      (item: any) => item.teacherID == this.teacherID
    );
    let teacherAvailability = teacherRecord.teacherAvailability.find(
      (item: any) => item.dayID == this.dayID
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
            if (this.TempAssignmentList.length > 0) {
              let isExistsSlot = this.TempAssignmentList.find(
                (item: any, index: number) =>
                  slotStartTime >= item.startTime + ':00' &&
                  slotStartTime <= item.endTime + ':00' &&
                  index != this.indexValue
              );
              if (isExistsSlot) {
                this.greaterTimeValidationForStartTime = false;
                this.timeMatchValidationForStartTime = true;
                // $('#startTime').val(null);
                this.assignClassForm.patchValue({
                  startTime: null,
                });
              } else {
                this.timeMatchValidationForStartTime = false;
                this.greaterTimeValidationForStartTime = false;

                let teacherRecord = this.AssignmentBO.find(
                  (item: any) => item.teacherID == this.teacherID
                );
                if (teacherRecord) {
                  if (teacherRecord.classID != this.classID) {
                    let specificDaySlots = teacherRecord?.slots.find(
                      (item: any) =>
                        item.day == this.dayID &&
                        item.startTime <= slotStartTime &&
                        item.endTime >= slotStartTime
                    );
                    if (specificDaySlots) {
                      this.slotCreatedForSomeOtherClass = true;
                      this.greaterTimeValidationForStartTime = false;
                      this.timeMatchValidationForStartTime = false;
                      this.assignClassForm.patchValue({
                        startTime: null,
                      });
                    } else {
                      this.slotCreatedForSomeOtherClass = false;
                    }
                  } else {
                    this.slotCreatedForSomeOtherClass = false;
                  }
                } else {
                  this.slotCreatedForSomeOtherClass = false;
                  this.greaterTimeValidationForStartTime = false;
                  this.timeMatchValidationForStartTime = false;
                }
              }
            } else {
              this.timeMatchValidationForStartTime = false;
              this.greaterTimeValidationForStartTime = false;

              let teacherRecord = this.AssignmentBO.find(
                (item: any) => item.teacherID == this.teacherID
              );
              if (teacherRecord) {
                if (teacherRecord.classID != this.classID) {
                  let specificDaySlots = teacherRecord?.slots.find(
                    (item: any) =>
                      item.day == this.dayID &&
                      item.startTime <= slotStartTime &&
                      item.endTime >= slotStartTime
                  );
                  if (specificDaySlots) {
                    this.slotCreatedForSomeOtherClass = true;
                    this.greaterTimeValidationForStartTime = false;
                    this.timeMatchValidationForStartTime = false;
                    this.assignClassForm.patchValue({
                      startTime: null,
                    });
                  } else {
                    this.slotCreatedForSomeOtherClass = false;
                  }
                } else {
                  this.slotCreatedForSomeOtherClass = false;
                }
              } else {
                this.slotCreatedForSomeOtherClass = false;
                this.greaterTimeValidationForStartTime = false;
                this.timeMatchValidationForStartTime = false;
              }
            }
          } else {
            this.timeMatchValidationForStartTime = false;
            this.greaterTimeValidationForStartTime = false;
            // $('#startTime').val(null);
            this.assignClassForm.patchValue({
              startTime: null,
            });
          }
        } else {
          // $('#startTime').val(null);
          this.greaterTimeValidationForStartTime = false;
          this.timeMatchValidationForStartTime = true;
          this.assignClassForm.patchValue({
            startTime: null,
          });
        }
      } else {
        this.greaterTimeValidationForStartTime = true;
        this.timeMatchValidationForStartTime = false;
        // $('#startTime').val(null);
        // $('#endTime').val(null);
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
          if (this.TempAssignmentList.length > 0) {
            let isExistsSlot = this.TempAssignmentList.find(
              (item: any, index: number) =>
                slotStartTime >= item.startTime + ':00' &&
                slotStartTime <= item.endTime + ':00' &&
                index != this.indexValue
            );
            if (isExistsSlot) {
              // $('#startTime').val(null);
              this.greaterTimeValidationForStartTime = false;
              this.timeMatchValidationForStartTime = true;
              this.assignClassForm.patchValue({
                startTime: null,
              });
            } else {
              this.timeMatchValidationForStartTime = false;
              this.greaterTimeValidationForStartTime = false;

              let teacherRecord = this.AssignmentBO.find(
                (item: any) => item.teacherID == this.teacherID
              );
              if (teacherRecord) {
                if (teacherRecord.classID != this.classID) {
                  let specificDaySlots = teacherRecord?.slots.find(
                    (item: any) =>
                      item.day == this.dayID &&
                      item.startTime <= slotStartTime &&
                      item.endTime >= slotStartTime
                  );
                  if (specificDaySlots) {
                    this.slotCreatedForSomeOtherClass = true;
                    this.greaterTimeValidationForStartTime = false;
                    this.timeMatchValidationForStartTime = false;
                    this.assignClassForm.patchValue({
                      startTime: null,
                    });
                  } else {
                    this.slotCreatedForSomeOtherClass = false;
                  }
                } else {
                  this.slotCreatedForSomeOtherClass = false;
                }
              } else {
                this.slotCreatedForSomeOtherClass = false;
                this.greaterTimeValidationForStartTime = false;
                this.timeMatchValidationForStartTime = false;
              }
            }
          } else {
            this.timeMatchValidationForStartTime = false;
            this.greaterTimeValidationForStartTime = false;

            let teacherRecord = this.AssignmentBO.find(
              (item: any) => item.teacherID == this.teacherID
            );
            if (teacherRecord) {
              if (teacherRecord.classID != this.classID) {
                let specificDaySlots = teacherRecord?.slots.find(
                  (item: any) =>
                    item.day == this.dayID &&
                    item.startTime <= slotStartTime &&
                    item.endTime >= slotStartTime
                );
                if (specificDaySlots) {
                  this.slotCreatedForSomeOtherClass = true;
                  this.greaterTimeValidationForStartTime = false;
                  this.timeMatchValidationForStartTime = false;
                  this.assignClassForm.patchValue({
                    startTime: null,
                  });
                } else {
                  this.slotCreatedForSomeOtherClass = false;
                }
              } else {
                this.slotCreatedForSomeOtherClass = false;
              }
            } else {
              this.slotCreatedForSomeOtherClass = false;
              this.greaterTimeValidationForStartTime = false;
              this.timeMatchValidationForStartTime = false;
            }
          }
        } else {
          // $('#startTime').val(null);
          this.slotCreatedForSomeOtherClass = false;
          this.greaterTimeValidationForStartTime = false;
          this.timeMatchValidationForStartTime = true;
          this.assignClassForm.patchValue({
            startTime: null,
          });
        }
      } else {
        // $('#startTime').val(null);
        this.greaterTimeValidationForStartTime = false;
        this.timeMatchValidationForStartTime = true;
        this.assignClassForm.patchValue({
          startTime: null,
        });
      }
    }
  }

  // dynamic slots Validation for endTime
  ApplyValidationForEndTime() {
    let slotStartTime = this.assignClassForm.value.startTime
      ? this.assignClassForm.value.startTime + ':00'
      : this.assignClassForm.value.startTime;
    let slotEndTime = this.assignClassForm.value.endTime
      ? this.assignClassForm.value.endTime + ':00'
      : this.assignClassForm.value.endTime;

    let classSlots = this.classDaysSlot.find(
      (item: any) => item.dayID == this.dayID
    );

    let classStartTime = classSlots.startTime;
    let classEndTime = classSlots.endTime;

    let teacherRecord = this.teachersData.find(
      (item: any) => item.teacherID == this.teacherID
    );
    let teacherAvailability = teacherRecord.teacherAvailability.find(
      (item: any) => item.dayID == this.dayID
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
                  slotEndTime >= item.startTime &&
                  slotEndTime <= item.endTime &&
                  index != this.indexValue
              );
              if (isExistsSlot) {
                // $('#endTime').val(null);
                this.timeMatchValidationForEndTime = true;
                this.greaterTimeValidationForEndTime = false;
                this.assignClassForm.patchValue({
                  endTime: null,
                });
              } else {
                this.timeMatchValidationForEndTime = false;
                this.greaterTimeValidationForEndTime = false;

                let teacherRecord = this.AssignmentBO.find(
                  (item: any) => item.teacherID == this.teacherID
                );
                if (teacherRecord) {
                  if (teacherRecord.classID != this.classID) {
                    let specificDaySlots = teacherRecord?.slots.find(
                      (item: any) =>
                        item.day == this.dayID &&
                        item.startTime <= slotEndTime &&
                        item.endTime >= slotEndTime
                    );
                    if (specificDaySlots) {
                      this.slotCreatedForSomeOtherClassforEndTime = true;
                      this.greaterTimeValidationForEndTime = false;
                      this.timeMatchValidationForEndTime = false;
                      this.assignClassForm.patchValue({
                        endTime: null,
                      });
                    } else {
                      this.slotCreatedForSomeOtherClassforEndTime = false;
                    }
                  } else {
                    this.slotCreatedForSomeOtherClassforEndTime = false;
                  }
                } else {
                  this.slotCreatedForSomeOtherClass = false;
                  this.greaterTimeValidationForStartTime = false;
                  this.timeMatchValidationForStartTime = false;
                }
              }
            } else {
              this.timeMatchValidationForEndTime = false;
              this.greaterTimeValidationForEndTime = false;

              let teacherRecord = this.AssignmentBO.find(
                (item: any) => item.teacherID == this.teacherID
              );
              if (teacherRecord) {
                if (teacherRecord.classID != this.classID) {
                  let specificDaySlots = teacherRecord?.slots.find(
                    (item: any) =>
                      item.day == this.dayID &&
                      item.startTime <= slotEndTime &&
                      item.endTime >= slotEndTime
                  );
                  if (specificDaySlots) {
                    this.slotCreatedForSomeOtherClassforEndTime = true;
                    this.greaterTimeValidationForEndTime = false;
                    this.timeMatchValidationForEndTime = false;
                    this.assignClassForm.patchValue({
                      endTime: null,
                    });
                  } else {
                    this.slotCreatedForSomeOtherClassforEndTime = false;
                  }
                } else {
                  this.slotCreatedForSomeOtherClassforEndTime = false;
                }
              } else {
                this.slotCreatedForSomeOtherClass = false;
                this.greaterTimeValidationForStartTime = false;
                this.timeMatchValidationForStartTime = false;
              }
            }
          } else {
            this.timeMatchValidationForEndTime = true;
            this.greaterTimeValidationForEndTime = false;
            // $('#endTime').val(null);
            this.assignClassForm.patchValue({
              endTime: null,
            });
          }
        } else {
          this.timeMatchValidationForEndTime = true;
          this.greaterTimeValidationForEndTime = false;
          // $('#endTime').val(null);
          this.assignClassForm.patchValue({
            endTime: null,
          });
        }
      } else {
        this.greaterTimeValidationForEndTime = true;
        this.timeMatchValidationForEndTime = false;
        // $('#startTime').val(null);
        // $('#endTime').val(null);
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
                slotEndTime >= item.startTime &&
                slotEndTime <= item.endTime &&
                index != this.indexValue
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

              let teacherRecord = this.AssignmentBO.find(
                (item: any) => item.teacherID == this.teacherID
              );
              if (teacherRecord) {
                if (teacherRecord.classID != this.classID) {
                  let specificDaySlots = teacherRecord?.slots.find(
                    (item: any) =>
                      item.day == this.dayID &&
                      item.startTime <= slotEndTime &&
                      item.endTime >= slotEndTime
                  );
                  if (specificDaySlots) {
                    this.slotCreatedForSomeOtherClassforEndTime = true;
                    this.greaterTimeValidationForEndTime = false;
                    this.timeMatchValidationForEndTime = false;
                    this.assignClassForm.patchValue({
                      endTime: null,
                    });
                  } else {
                    this.slotCreatedForSomeOtherClassforEndTime = false;
                  }
                } else {
                  this.slotCreatedForSomeOtherClassforEndTime = false;
                }
              } else {
                this.slotCreatedForSomeOtherClass = false;
                this.greaterTimeValidationForStartTime = false;
                this.timeMatchValidationForStartTime = false;
              }
            }
          } else {
            this.timeMatchValidationForEndTime = false;
            this.greaterTimeValidationForEndTime = false;

            let teacherRecord = this.AssignmentBO.find(
              (item: any) => item.teacherID == this.teacherID
            );
            if (teacherRecord) {
              if (teacherRecord.classID != this.classID) {
                let specificDaySlots = teacherRecord?.slots.find(
                  (item: any) =>
                    item.day == this.dayID &&
                    item.startTime <= slotEndTime &&
                    item.endTime >= slotEndTime
                );
                if (specificDaySlots) {
                  this.slotCreatedForSomeOtherClassforEndTime = true;
                  this.greaterTimeValidationForEndTime = false;
                  this.timeMatchValidationForEndTime = false;
                  this.assignClassForm.patchValue({
                    endTime: null,
                  });
                } else {
                  this.slotCreatedForSomeOtherClassforEndTime = false;
                }
              } else {
                this.slotCreatedForSomeOtherClassforEndTime = false;
              }
            } else {
              this.slotCreatedForSomeOtherClass = false;
              this.greaterTimeValidationForStartTime = false;
              this.timeMatchValidationForStartTime = false;
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

  manageBulkAssignment() {
    this.spinner.show();
    this.assignClassService.BulkClassAssignment(this.AssignmentBO).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.message === 'Success') {
          this.isClassAssigned = false;
          this.onClose();
          this.toastr.success(response.activity);
          this.getAllAvailableTeachersByCentreID(
            this.classID,
            this.classDaysSlot
          );
        } else {
          this.isClassAssigned = true;
          this.toastr.error(response.activity || 'Assignment failed.');
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err?.message || 'An error occurred.');
      },
    });
  }

  proceedToOnboarding() {
    this.commonService
      .manageDaycareOnBoarding(this.centreID, 'manageDaycareClassAssignment')
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          if (this.onBoardingService.isOnboarding) {
            if (!this.onBoardingService.onBoardingData.isCompleteStep6) {
              this.onBoardingService.onBoardingData.isCompleteStep6 = true;
              this.onBoardingService.handleNext('Tab-6');
            } else {
              this.toastr.success('Class Assignment updated successfully');
              this.onBoardingService.getCurrentTab();
            }
          } else {
            this.toastr.success('Class Assignment updated successfully');
          }
        }
      });
  }
}
