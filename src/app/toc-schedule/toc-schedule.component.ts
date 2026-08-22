import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TeacherDashboardServiceService } from '../teachers-management/teachers-dashboard/teacher-dashboard-service.service';
import { CookieService } from 'ngx-cookie-service';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { SkeletonLoaderComponent } from "../common-component/skeleton-loader/skeleton-loader.component";
import { TimeFormatAmPmPipe } from '../bloomvie-management/dc-appointments-list/time-format.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
declare var $: any;

@Component({
  selector: 'app-toc-schedule',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    FullCalendarModule,
    NgFor,
    CommonModule,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    SkeletonLoaderComponent,
    TimeFormatAmPmPipe,
    NgxPaginationModule
    
],
  templateUrl: './toc-schedule.component.html',
  styleUrls: ['./toc-schedule.component.css'],
})
export class TocScheduleComponent implements OnInit {
  isExpanded: boolean = true;

  calendarOptions: any; // FullCalendar options
  centreID: any;
  dayCareEvents: any;
  UserID: number | undefined;
  TOCUserDetail: any;
  TOCSlotForm: any;
  selectedWeekSlots: any = {};
  expandedWeek: string | null = null;
  selectedDay: string | null = null;
  uniqueWorkingDayNames: string[] | undefined;
  filteredSlots: any;
  filteredSlotsByDay: any[] = [];
  currentExpandedDay: {
    slotIndex: number;
    dayName: string;
    weekName: string;
  } | null = null;
  slotDataFromdb: any;
  IsEditable: boolean = false;
  TOCUserDetailForDays: any;
  SelectedWeekDays: any[] = [];
  selectedWorkingDays1: any;
  timeRows: any[] = [];
  skeletonShow="Skelton";
  tocSkeletonShow="tocSkelton";

  daysOfWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  daysOfWeekMapping: any = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };
  disabledDays: { [key: string]: boolean } = {};
  disabledDaysForAddingSlots: { [key: string]: boolean } = {};
  DayName: string = '';
  timeRowsByDayForList: any[] = [];
  IsEditableSlot: boolean = false;
  editRowIndex: number = 0;
  EventDetail: any;
  StatusList: any;
  IsAddMoreSlots: boolean = false;
  // availableDays: any;
  availableDays: string[] = [];
  selectedWorkingDaysForAddingSlots: any[] = [];
  TocSlotlist: any[] = [];
  IsShowInputs: boolean = false;
  availableWeeks: {
    week: string;
    days: { date: string; dayName: string }[];
  }[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;
  currentWeekIndex: number = 0;
  SelectedWeek: string | undefined;
  selectedWeekName: string = '';
  selectedWorkingDayRadio: string = '';
  ischeckboxchecked: boolean = false;
  isCurrentMonthOptionVisible: boolean = false;
  isCurrentWeekOptionVisible: boolean = false;
  dateRange: string = '';
  filteredDayNameAfterAddedTs: any;
  filteredDaysOfWeek: string[] | undefined;
  filteredWeekAfterAddedTs: any;
  TocContentP: number = 1;
  TocContentSize: number = 5;

  constructor(
    private service: TeacherDashboardServiceService,
    private fb: FormBuilder,
    private cookie: CookieService,
    private tocservice: TocRegistrationService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {
    this.TOCSlotForm = this.fb.group(
      {
        id: [''],
        userID: [0],
        starttime: [null, [Validators.required]],
        endTime: [null, [Validators.required]],
        option: '',
        day: '',
        centreId : 0
      },
      { validator: this.timeValidator }
    );
  }

  ngOnInit(): void {
     ;
    this.UserID = parseInt(this.cookie.get('UserId'), 10);
    this.centreID = parseInt(this.cookie.get('CentreID'), 10);
    // this.centreID = 'your-centre-id';
    // this.calendarOptions = {
    //   plugins: [dayGridPlugin, interactionPlugin],
    //   initialView: 'dayGridMonth',
    //   weekends: false,
    //   events: [
    //     { title: 'Sample Event', start: new Date() } // Example event
    //   ]
    // };
    // this.getDayCareEvents();

    this.getTOCUserDetailByID(this.UserID);
    this.getAllMasterStatus();
  }

  timeValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const start = group.get('starttime')?.value;
    const end = group.get('endTime')?.value;

    if (start && end && start >= end) {
      return { endTimeInvalid: true }; // Return error if endTime is less than or equal to starttime
    }
    return null; // No error
  }

  getDayCareEvents() {
    this.service.getDayCareEventsByID(this.centreID).subscribe((data: any) => {
      this.dayCareEvents = data.result;
      const calendarEvents = this.dayCareEvents.map((event: any) => ({
        title: event.eventName,
        start: event.eventDate,
        description: event.eventDescription,
        id: event.eventID,
        imageUrl: event.eventImagePath,
      }));

      this.calendarOptions = {
        initialView: 'dayGridMonth',
        events: calendarEvents,
        eventContent: (arg: any) => ({
          html: `<b>${arg.timeText}</b> <i>${arg.event.title}</i>`,
        }),
      };
    });
  }

  getAllMasterStatus() {
     ;
    this.tocservice.getAllMasterStatus().subscribe((data) => {
      if (data.message == 'OK') this.StatusList = data.result;
    });
  }

  //Added on 05/02/25
  onPlusClick(slotDetail: any, index: number) {
     ;
    if (
      this.currentExpandedDay?.slotIndex === index &&
      this.currentExpandedDay?.weekName === slotDetail.weekName
    ) {
      this.currentExpandedDay = null;
    } else {
      this.currentExpandedDay = {
        slotIndex: index,
        weekName: slotDetail.weekName,
        dayName: '',
      };
      this.uniqueWorkingDayNames = Array.from(
        new Set(slotDetail?.slots?.map((slot: any) => slot.workingDayName))
      );

      const slotsByDay: { [key: string]: any[] } = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };

      slotDetail.slots.forEach((slot: any) => {
        const dayName = slot.workingDayName;
        if (slotsByDay[dayName]) {
          slotsByDay[dayName].push(slot);
        }
      });
    }
  }

  bindGridClick(
    slotDetail: any,
    dayName: string,
    slotIndex: number,
    weekName: string
  ) {
     ;
    // this.isExpanded = false;
    if (
      this.currentExpandedDay &&
      this.currentExpandedDay.slotIndex === slotIndex &&
      this.currentExpandedDay.dayName === dayName
    ) {
      //Commnented on 04/02/25
      // this.currentExpandedDay = null;
    } else {
      this.currentExpandedDay = { slotIndex, dayName, weekName };
    }
    this.filteredSlotsByDay = this.getFilteredSlots(slotDetail, dayName);
    for (let i = 0; i < this.filteredSlotsByDay.length; i++) {
      this.filteredSlotsByDay[i].StatusName = this.filterStatus(
        this.filteredSlotsByDay[i].statusId
      );
    }
  }

  filterStatus(StatusId: any): string | null {
    const status = this.StatusList.find(
      (data: { id: any }) => data.id === StatusId
    );
    return status ? status.status : null;
  }

  getFilteredSlots(slotDetail: any, dayName: string) {
    return slotDetail.slots.filter(
      (slot: any) => slot.workingDayName === dayName
    );
  }

  getTOCUserDetailByID(userid: any) {
     ;
    this.skeletonShow="Skelton";
    this.tocSkeletonShow="tocSkelton";
    this.tocservice.getTOCUserDetailByID(userid,this.centreID).subscribe(
      (data) => {
        if (data.message === 'ok') {
          this.TOCUserDetailForDays = data.result;
          this.TOCUserDetail = data.result.slotsGroupedByWeek;

          this.UpdateWorkingDays();
          if (this.isExpanded) {
            this.expandFirstRecord();
          }
            this.skeletonShow="";
            this.tocSkeletonShow="";
        } else {
          this.TOCUserDetail = [];
          this.TOCUserDetailForDays = [];
          this.skeletonShow="";
          this.tocSkeletonShow="";
        }
      },
      (error) => {
          this.skeletonShow="";
          this.tocSkeletonShow="";
      }
    );
  }

  expandFirstRecord() {
     ;
    if (this.TOCUserDetail && this.TOCUserDetail.length > 0) {
      const firstSlot = this.TOCUserDetail[0];
      if (
        firstSlot &&
        this.selectedWorkingDays1 &&
        this.selectedWorkingDays1.length > 0
      ) {
        this.currentExpandedDay = {
          slotIndex: 0,
          dayName: this.selectedWorkingDays1[0],
          weekName: firstSlot.weekName,
        };
        this.uniqueWorkingDayNames = Array.from(
          new Set(
            this.TOCUserDetail[0]?.slots?.map(
              (slot: any) => slot.workingDayName
            )
          )
        );
        this.filteredSlotsByDay = this.getFilteredSlots(
          this.TOCUserDetail[0],
          this.currentExpandedDay.dayName
        );
        for (let i = 0; i < this.filteredSlotsByDay.length; i++) {
          this.filteredSlotsByDay[i].StatusName = this.filterStatus(
            this.filteredSlotsByDay[i].statusId
          );
        }
      }
    }
  }

  //Added on 11/02/25
  UpdateWorkingDays() {
     ;
    if (this.TOCUserDetailForDays.workingDays) {
      const daysOfWeekMapping: { [key: string]: string } = {
        // 0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday',
      };

      this.selectedWorkingDays1 = this.TOCUserDetailForDays.workingDays
        .split(',')
        .map((day: string | number) => daysOfWeekMapping[+day]);
      this.SelectedWeekDays = [...this.selectedWorkingDays1];
      const checkedDays = this.TOCUserDetail.flatMap(
        (detail: { slots: any[] }) => detail.slots
      ).map((slot: { workingDayName: string }) => slot.workingDayName);

      this.selectedWorkingDays1 = this.selectedWorkingDays1.filter((day: any) =>
        checkedDays.includes(day)
      );

      //Added on 11/02/25  //Commented on 01/04/25
      // if(this.timeRowsByDayForList.length == 0 && !this.ischeckboxchecked){
      //   this.selectedWorkingDaysForAddingSlots = this.selectedWorkingDays1;
      // }

      const startDate = new Date(this.TOCUserDetailForDays.partTimeStartDate);
      const endDate = new Date(this.TOCUserDetailForDays.partTimeEndDate);
      // const availableDays: string[] = [];

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dayName = daysOfWeekMapping[d.getDay()];
        if (dayName === undefined) {
          this.availableDays.push('Sunday');
        } else {
          this.availableDays.push(dayName);
        }
      }

      // Added on 11/02/2023
      if (!this.IsAddMoreSlots && !this.ischeckboxchecked) {
        // this.daysOfWeek.forEach(day => {
        // this.disabledDays[day] = !this.SelectedWeekDays.includes(day);
        // });

        this.daysOfWeek.forEach((day) => {
          this.disabledDays[day] = !this.selectedWorkingDays1.includes(day);
        });

      } else {
        // this.daysOfWeek.forEach(day => {
        //   this.disabledDays[day] = false;
        // });

        //Added on 12/02/25    //Commented on 01/04/25
        // this.daysOfWeek.forEach(day => {
        //   this.disabledDaysForAddingSlots[day] = this.selectedWorkingDaysForAddingSlots.includes(day);
        //   if (this.disabledDaysForAddingSlots[day]) {
        //     this.selectedWorkingDayRadio = day;
        //     this.filterslotByDay(this.selectedWeekName,this.selectedWorkingDayRadio);
        //   }
        //   });

        //Added on 01/04/25
        this.filteredDaysOfWeek = this.daysOfWeek.filter(
          (day) => !this.selectedWorkingDays1.includes(day)
        );
   

      }

      this.cdr.detectChanges();
      const workingDayIds = this.TOCUserDetailForDays.workingDays
        .split(',')
        .map((day: string) => parseInt(day, 10));
      const daysOfWeekMapping1: any = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday',
      };
      this.TOCUserDetailForDays.workingDaysNames = workingDayIds
        .map((id: number) => daysOfWeekMapping1[id])
        .filter((day: string | undefined) => day)
        .join(', ');
    } else {
      this.TOCUserDetailForDays.workingDaysNames = 'No working days listed';
    }
  }

  onDaySelect(day: string) {
     ;
    this.selectedDay = day;
    // this.isSelectDay = true;
    if (this.selectedWeekName == '') {
      const week = this.availableWeeks[this.currentWeekIndex];
      this.SelectedWeek = week.week;
      this.selectedWeekName =
        this.SelectedWeek.split(' ')[0] + ' ' + this.SelectedWeek.split(' ')[1];
    }
    this.filterslotByDay(this.selectedWeekName, this.selectedDay);
  }

  ShowSwal(day: string, event: any): void {
     ;
    Swal.fire({
      title: 'Do you want Remove the slots of ' + day + ' ?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Saved!', '', 'success');
      } else if (result.isDenied) {
        // Swal.fire("Changes are not saved", "", "info");
        // this.UpdateWorkingDays();
        if (!this.selectedWorkingDays1.includes(day)) {
          this.selectedWorkingDays1.push(day);
        }
        this.cdr.detectChanges();
      }
    });
  }

  //Commented on 11/02/25
  // showSlotModal(day: string) {
  //   $('#AddTimeSlotModal').modal('show');
  //   this.DayName = day;
  // }

  showSlotModal() {
     ;
    this.IsAddMoreSlots = true;
    $('#AddTimeSlotModal').modal('show');
    this.UpdateWorkingDays();
    this.generateUniqueDays();
  }

  isEndOfMonthOrFutureMonth(startDate: Date, endDate: Date): boolean {
    const currentMonthEndDate = new Date(startDate);
    currentMonthEndDate.setMonth(startDate.getMonth() + 1);
    currentMonthEndDate.setDate(0);
    const isEndDateValid = endDate <= currentMonthEndDate;
    return isEndDateValid;
  }

  isEndOfWeekOrEarlier(startDate: Date, endDate: Date): boolean {
    const endOfWeek = new Date(startDate);
    const dayOfWeek = endOfWeek.getDay();
    const daysUntilEndOfWeek = 7 - dayOfWeek;
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilEndOfWeek);
    return endDate <= endOfWeek;
  }

  onCheckboxChange(day: string, event: any): void {
    if (!event.target.checked) {
      Swal.fire({
        title:
          'Do you want to remove the Availability and working day of ' +
          day +
          '?',
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteTOCUserAvailableSlots(day);
          this.selectedWorkingDays1 = this.selectedWorkingDays1.filter(
            (d: string) => d !== day
          );
          this.cdr.detectChanges();
        } else if (result.isDenied) {
          event.target.checked = true;
          this.selectedWorkingDays1.push(day);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.selectedWorkingDays1.push(day);
      $('#AddTimeSlotModal').modal('show');
      this.DayName = day;
    }
  }

  //Added on 23/01/25 for confirmation modal with swal
  // onCheckboxChange(day: string, event: any): void {
  //    ;
  //   this.DayName = day; // Save the day for modal use
  //   this.EventDetail = event;
  //   if (!event.target.checked) {
  //     $('#confirmationModal').modal('show'); // Open custom modal
  //     // this.cdr.detectChanges();
  //   } else {
  //     this.selectedWorkingDays1.push(day);
  //     $('#AddTimeSlotModal').modal('show'); // Directly open Add Slot modal
  //   }
  // }

  //Added on 23/01/25 for confirmation modal with swal
  onAddSlots(): void {
     ;
    $('#confirmationModal').modal('hide');
    $('#AddTimeSlotModal').modal('show');
    if (!this.selectedWorkingDays1.includes(this.DayName)) {
      this.selectedWorkingDays1.push(this.DayName);
    }
  }

  //Added on 23/01/25 for confirmation modal with swal
  onDeleteSlots(): void {
    this.EventDetail = [];
    $('#confirmationModal').modal('hide');
    Swal.fire({
      title: 'Do you want to remove the Availability of ' + this.DayName + '?',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteTOCUserAvailableSlots(this.DayName);
        this.selectedWorkingDays1 = this.selectedWorkingDays1.filter(
          (d: string) => d !== this.DayName
        );
        this.cdr.detectChanges();
      } else if (result.isDenied) {
        if (!this.selectedWorkingDays1.includes(this.DayName)) {
          this.selectedWorkingDays1.push(this.DayName);
        }
        this.cdr.detectChanges();
      }
    });
  }

  OpenModal(slotId: any) {
     ;
    this.IsEditable = true;
    this.tocservice.getTOCUserSlotById(slotId).subscribe((data) => {
      if (data.message == 'ok') {
        this.slotDataFromdb = data.result;
        this.TOCSlotForm.patchValue({
          id: this.slotDataFromdb.id,
          starttime: this.slotDataFromdb.startTime,
          endTime: this.slotDataFromdb.endTime,
          userID: this.UserID,
          option: this.slotDataFromdb.option,
        });
      } else {
        this.slotDataFromdb = [];
      }
    });
    $('#TimeSlotModal').modal('show');
  }

  deleteModal(slotId: any) {
     ;
    this.IsEditable = false;
    this.tocservice.getTOCUserSlotById(slotId).subscribe((data) => {
      if (data.message == 'ok') {
        this.slotDataFromdb = data.result;
        this.TOCSlotForm.patchValue({
          id: this.slotDataFromdb.id,
          starttime: this.slotDataFromdb.startTime,
          endTime: this.slotDataFromdb.endTime,
          userID: this.UserID,
          option: this.slotDataFromdb.option,
        });
      } else {
        this.slotDataFromdb = [];
      }
    });
    $('#TimeSlotModal').modal('show');
  }

  updateTOCUserSlot() {
     ;
    this.TOCSlotForm.patchValue({
      centreId : this.centreID
    })
    this.tocservice.updateTOCUserSlot(this.TOCSlotForm.value).subscribe((data) => {
        if (data.message == 'ok') {
          this.toastr.success('Slot update Successfully');
          this.getTOCUserDetailByID(this.UserID);
          this.resetForm();

          //Added on 12/02/25
          this.generateUniqueDays();
          this.UpdateWorkingDays();
        } else {
          this.toastr.error(data.message);
        }
      });
  }

  deleteTOCUserSlot() {
     ;
      this.TOCSlotForm.patchValue({
      centreId : this.centreID
    })
    this.tocservice.deleteTOCUserSlot(this.TOCSlotForm.value).subscribe((data) => {
        if (data.message == 'ok') {
          this.toastr.success('Slot deleted Successfully');
          this.getTOCUserDetailByID(this.UserID);
          this.resetForm();
          //Added on 12/02/25
          this.generateUniqueDays();
          this.UpdateWorkingDays();
        } else {
          this.toastr.error(data.message);
        }
      });
  }

  deleteTOCUserAvailableSlots(day: string) {
     ;
    this.tocservice
      .deleteTOCUserAvailableSlots(this.UserID, day,this.centreID)
      .subscribe((data) => {
        if (data.message == 'ok') {
          this.toastr.success('Slots deleted Successfully');
          this.getTOCUserDetailByID(this.UserID);
          this.resetForm();
        } else {
          this.toastr.error(data.message);
        }
      });
  }

  resetForm() {
     ;
    this.TOCSlotForm.reset();
    $('#TimeSlotModal').modal('hide');
    $('#confirmationModal').modal('hide');
    //Added on 05/02/25
    // $('#AddTimeSlotModal').modal('hide');
    // if(this.timeRowsByDayForList.length==0){
    // this.UpdateWorkingDays();
    // }
  }

  CloseModal() {
    $('#AddTimeSlotModal').modal('hide');
    this.IsAddMoreSlots = false;
    //Added on 12/02/25
    this.selectedWorkingDaysForAddingSlots = [];
    this.selectedWorkingDayRadio = '';
    this.ischeckboxchecked = false;
    this.filteredDayNameAfterAddedTs = '';
    this.filteredWeekAfterAddedTs = '';
    //end

    this.UpdateWorkingDays();
    this.resetForm();
    this.timeRowsByDayForList = [];
    this.IsShowInputs = false;
    this.TocSlotlist = [];
    this.selectedWorkingDaysForAddingSlots = [];
    this.filteredDayNameAfterAddedTs = '';
    this.filteredWeekAfterAddedTs = '';
  }

  CloseConfirmationModal() {
    this.TOCSlotForm.reset();
    $('#TimeSlotModal').modal('hide');
    $('#confirmationModal').modal('hide');
    this.UpdateWorkingDays();
    if (this.EventDetail != null) {
      this.EventDetail.target.checked = true;
    } else {
      this.EventDetail.target.checked = false;
    }
  }

  navigateWeek(direction: string) {
     ;
    if (
      direction === 'next' &&
      this.currentWeekIndex < this.availableWeeks.length - 1
    ) {
      this.currentWeekIndex++;
      const week = this.availableWeeks[this.currentWeekIndex];
      this.SelectedWeek = week.week;
      this.selectedWeekName =
        this.SelectedWeek.split(' ')[0] + ' ' + this.SelectedWeek.split(' ')[1];
      this.filterslotByDay(this.selectedWeekName, this.DayName);
    } else if (direction === 'prev' && this.currentWeekIndex > 0) {
      this.currentWeekIndex--;
      const week = this.availableWeeks[this.currentWeekIndex];
      this.SelectedWeek = week.week;
      this.selectedWeekName =
        this.SelectedWeek.split(' ')[0] + ' ' + this.SelectedWeek.split(' ')[1];
      this.filterslotByDay(this.selectedWeekName, this.DayName);
    }
    this.selectedDay = '';
  }

  SaveTimeSlots(SubmitVal: string) {
     ;
    $('#Addupdateslotbutton').html('Add Slot');
    if (SubmitVal == 'submit') {
      if (this.timeRowsByDayForList.length > 0 && this.TOCSlotForm.invalid) {
        this.TOCSlotForm.patchValue({
          id: '',
          userID: this.UserID,
          option: this.TOCUserDetailForDays.slotOptionType,
          day: this.DayName,
        });
        this.SubmitForm();
      } else if (
        this.TOCSlotForm.valid &&
        this.timeRowsByDayForList.length == 0
      ) {
        const timeRowsByDay = {
          startTime: this.TOCSlotForm.value.starttime,
          endTime: this.TOCSlotForm.value.endTime,
          option: this.TOCSlotForm.value.option,
          dayName: this.TOCSlotForm.value.day,
          userId: this.TOCSlotForm.value.userID,
        };
        this.timeRowsByDayForList.push(timeRowsByDay);
        this.SubmitForm();
      } else {
        this.TOCSlotForm.markAllAsTouched();
      }
    } else {
      if (this.TOCSlotForm.valid) {
        this.TOCSlotForm.patchValue({
          id: '',
          userID: this.UserID,
          option: this.TOCUserDetailForDays.slotOptionType,
          day: this.DayName,
        });

        let labelText = this.TOCUserDetailForDays.slotOptionType;
        const week = this.availableWeeks[this.currentWeekIndex];
        this.SelectedWeek = week.week;
        this.selectedWeekName =
          this.SelectedWeek.split(' ')[0] +
          ' ' +
          this.SelectedWeek.split(' ')[1];
        this.dateRange = this.SelectedWeek.split('(')[1].split(')')[0];

        if (this.availableWeeks.length > 0) {
          if (labelText == 'Apply For Whole Calendar') {
            for (let i = 0; i < this.availableWeeks.length; i++) {
              const week = this.availableWeeks[i];
              const weekDays = week.days.map((day) => day.dayName); // Extract day names from the current week's days
              const SelectedWeek = week.week;
              const WeekName = `${SelectedWeek.split(' ')[0]} ${
                SelectedWeek.split(' ')[1]
              }`;
              const dateRange = SelectedWeek.split('(')[1].split(')')[0];

              if (weekDays.includes(this.DayName)) {
                const timeRowsByDay = {
                  startTime: this.TOCSlotForm.value.starttime,
                  endTime: this.TOCSlotForm.value.endTime,
                  option: this.TOCSlotForm.value.option,
                  dayName: this.TOCSlotForm.value.day,
                  userId: this.TOCSlotForm.value.userID,
                  week: WeekName,
                  dateRange: dateRange,
                };
                this.timeRowsByDayForList.push(timeRowsByDay);
              }
            }
          } else if (labelText == 'Apply For Current Month') {
            if (this.isCurrentMonthOptionVisible) {
              const Firstweek = this.availableWeeks[0];
              for (let i = 0; i < this.availableWeeks.length; i++) {
                const week = this.availableWeeks[i];
                const SelectedWeek = week.week;
                const WeekName =
                  SelectedWeek.split(' ')[0] + ' ' + SelectedWeek.split(' ')[1];
                const dateRange = SelectedWeek.split('(')[1].split(')')[0];

                //Added on 14/02/25
                const isDayPresent = week.days.some(
                  (day) => day.dayName === this.DayName
                );
                if (isDayPresent) {
                  const timeRowsByDay = {
                    startTime: this.TOCSlotForm.value.starttime,
                    endTime: this.TOCSlotForm.value.endTime,
                    option: this.TOCSlotForm.value.option,
                    dayName: this.TOCSlotForm.value.day,
                    userId: this.TOCSlotForm.value.userID,
                    week: WeekName,
                    dateRange: dateRange,
                  };
                  this.timeRowsByDayForList.push(timeRowsByDay);
                }
              }
            } else {
              if (this.startDate && this.endDate) {
                let startDate = new Date(this.startDate);
                let endDate = new Date(this.endDate);

                let lastDayPrevMonth = new Date(
                  endDate.getFullYear(),
                  endDate.getMonth(),
                  0
                );
                let weeks = [];
                let current = new Date(startDate);
                let weekCount = 1;

                while (current <= lastDayPrevMonth) {
                  weeks.push(`Week ${weekCount}`);
                  current.setDate(current.getDate() + 7);
                  weekCount++;
                }

                this.availableWeeks = this.availableWeeks.filter(
                  (item, index) => index < weeks.length
                );
                for (let i = 0; i < this.availableWeeks.length; i++) {
                  const week = this.availableWeeks[i];
                  const weekDays = week.days.map((day) => day.dayName);
                  const SelectedWeek = week.week;
                  const WeekName =
                    SelectedWeek.split(' ')[0] +
                    ' ' +
                    SelectedWeek.split(' ')[1];
                  const dateRange = SelectedWeek.split('(')[1].split(')')[0];
                  const isDayPresent = week.days.some(
                    (day) => day.dayName === this.DayName
                  );

                  if (isDayPresent) {
                    const timeRowsByDay = {
                      startTime: this.TOCSlotForm.value.starttime,
                      endTime: this.TOCSlotForm.value.endTime,
                      option: this.TOCSlotForm.value.option,
                      dayName: this.TOCSlotForm.value.day,
                      userId: this.TOCSlotForm.value.userID,
                      week: WeekName,
                      dateRange: dateRange,
                    };
                    this.timeRowsByDayForList.push(timeRowsByDay);
                  }
                }
              }
            }
          } else if (labelText == 'Apply For Current Week') {
            if (this.isCurrentWeekOptionVisible) {
              for (let i = 0; i < this.availableWeeks.length; i++) {
                const week = this.availableWeeks[i];
                const SelectedWeek = week.week;
                const WeekName =
                  SelectedWeek.split(' ')[0] + ' ' + SelectedWeek.split(' ')[1];
                const dateRange = SelectedWeek.split('(')[1].split(')')[0];

                const timeRowsByDay = {
                  startTime: this.TOCSlotForm.value.starttime,
                  endTime: this.TOCSlotForm.value.endTime,
                  option: this.TOCSlotForm.value.option,
                  dayName: this.TOCSlotForm.value.day,
                  userId: this.TOCSlotForm.value.userID,
                  week: WeekName,
                  dateRange: dateRange,
                };
                this.timeRowsByDayForList.push(timeRowsByDay);
              }
            } else {
              if (this.startDate && this.endDate) {
                let startDate = new Date(this.startDate);
                let endDate = new Date(this.endDate);

                let currentDayOfWeek = startDate.getDay(); // Get the day of the week for startDate
                let daysUntilEndOfWeek = (7 - currentDayOfWeek) % 7; // Calculate days until the end of the week (Sunday)
                let lastDayOfCurrentWeek = new Date(startDate);
                lastDayOfCurrentWeek.setDate(
                  startDate.getDate() + daysUntilEndOfWeek
                );

                let weeks = [];
                let current = new Date(startDate);
                let weekCount = 1;

                if (currentDayOfWeek !== 1) {
                  current.setDate(
                    current.getDate() + ((8 - currentDayOfWeek) % 7)
                  );
                }

                while (current <= endDate) {
                  let weekEndDate = new Date(current);
                  weekEndDate.setDate(current.getDate() + 6);
                  weeks.push(`Week ${weekCount}`);
                  current.setDate(current.getDate() + 7);
                  weekCount++;
                }

                //Added on 14/2/25
                if (labelText == 'Apply For Current Week') {
                  weeks.splice(1);
                }

                this.availableWeeks = this.availableWeeks.filter(
                  (item, index) => index < weeks.length
                );
                for (let i = 0; i < this.availableWeeks.length; i++) {
                  const week = this.availableWeeks[i];
                  const SelectedWeek = week.week;
                  const WeekName =
                    SelectedWeek.split(' ')[0] +
                    ' ' +
                    SelectedWeek.split(' ')[1];
                  const dateRange = SelectedWeek.split('(')[1].split(')')[0];

                  const timeRowsByDay = {
                    startTime: this.TOCSlotForm.value.starttime,
                    endTime: this.TOCSlotForm.value.endTime,
                    option: this.TOCSlotForm.value.option,
                    dayName: this.TOCSlotForm.value.day,
                    userId: this.TOCSlotForm.value.userID,
                    week: WeekName,
                    dateRange: dateRange,
                  };
                  this.timeRowsByDayForList.push(timeRowsByDay);
                }
              }
            }
          } else {
            const timeRowsByDay = {
              startTime: this.TOCSlotForm.value.starttime,
              endTime: this.TOCSlotForm.value.endTime,
              option: this.TOCSlotForm.value.option,
              dayName: this.TOCSlotForm.value.day,
              userId: this.TOCSlotForm.value.userID,
              week: this.selectedWeekName,
              dateRange: this.dateRange,
            };
            this.timeRowsByDayForList.push(timeRowsByDay);
          }
        }

        if (this.IsEditableSlot) {
          if (this.TOCUserDetailForDays.slotOptionType != 'None') {
            //Added on 02/04/25
            var dayName = this.TOCSlotForm.value.day;
            let recordsForDay = this.timeRowsByDayForList.filter(
              (item) => item.dayName === dayName
            );
            const removedRecord = recordsForDay.splice(this.editRowIndex, 1)[0];

            if (removedRecord) {
              const firstIndex = this.timeRowsByDayForList.findIndex(
                (item) =>
                  item.startTime === removedRecord.startTime &&
                  item.endTime === removedRecord.endTime &&
                  item.option === removedRecord.option &&
                  item.dayName === removedRecord.dayName
              );

              if (firstIndex !== -1) {
                this.timeRowsByDayForList.splice(firstIndex, 1);
              }

              this.timeRowsByDayForList = this.timeRowsByDayForList.filter(
                (item) =>
                  !(
                    item.startTime === removedRecord.startTime &&
                    item.endTime === removedRecord.endTime &&
                    item.option === removedRecord.option &&
                    item.dayName === removedRecord.dayName
                  )
              );
            }

            this.IsEditableSlot = false;
            this.editRowIndex = 0;
          } else {
            // this.timeRowsByDayForList = this.timeRowsByDayForList.filter(record => record.dayName === this.DayName && record.week === this.selectedWeekName);
            const removedRecord = this.timeRowsByDayForList
              .filter(
                (record) =>
                  record.dayName === this.DayName &&
                  record.week === this.selectedWeekName
              )
              .splice(this.editRowIndex, 1)[0];
            const indexInList = this.timeRowsByDayForList.findIndex(
              (item) =>
                item.startTime === removedRecord.startTime &&
                item.endTime === removedRecord.endTime &&
                item.option === removedRecord.option &&
                item.dayName === removedRecord.dayName
            );

            if (indexInList !== -1) {
              this.timeRowsByDayForList.splice(indexInList, 1);
            }

            this.IsEditableSlot = false;
            this.editRowIndex = 0;
          }
        }

        // this.timeRowsByDayForList.push(timeRowsByDay);

        this.filterslotByDay(this.selectedWeekName, this.DayName);
        this.resetForm();
      } else {
        this.TOCSlotForm.markAllAsTouched();
      }
    }
  }

  //Commented on 12/02/25
  // filterslotByDay(dayName: string) {
  //    ;
  //   if (this.TOCUserDetail) {
  //     const allSlots = this.TOCUserDetail.flatMap((week: any) => week.slots);
  //     const filteredSlots = allSlots
  //       .filter((slot: { workingDayName: string; }) => slot.workingDayName.toLowerCase() === dayName.toLowerCase())
  //       .map((slot: { workingDayName: any; }) => ({
  //         ...slot,
  //         dayName: slot.workingDayName
  //       }));

  //     if (filteredSlots.length > 0) {
  //       this.TocSlotlist = filteredSlots;
  //     } else {
  //       this.IsShowInputs = true;
  //       this.DayName = dayName;
  //       this.TocSlotlist = this.timeRowsByDayForList.filter(slot => slot.dayName === dayName);
  //     }
  //   }
  //   this.IsShowInputs = true;
  //   this.DayName = dayName;
  //   //this.TocSlotlist = this.timeRowsByDayForList.filter(slot => slot.dayName === dayName);
  // }

  //Updated on 12/02/25
  filterslotByDay(week: string, dayName: string) {
     ;
    this.IsShowInputs = true;
    this.DayName = dayName;

    if (this.TOCUserDetailForDays.slotOptionType != 'None') {
      const filteredRecords = this.timeRowsByDayForList.filter(
        (slot) => slot.dayName === dayName
      );
      if (filteredRecords.length > 1) {
        const weekFilteredRecords = filteredRecords.filter(
          (slot) => slot.week === week
        );
        if (weekFilteredRecords.length > 0) {
          // If there are records for the selected week, show all of them
          this.TocSlotlist = weekFilteredRecords;
        } else {
          // If no records match the selected week, show only the first available record from a different week
          this.TocSlotlist = [filteredRecords[0]];
        }
      } else {
        // Default case: Only one record
        this.TocSlotlist = filteredRecords;
      }
    } else {
      const filteredRecords = this.timeRowsByDayForList.filter(
        (slot) => slot.dayName === dayName && slot.week == this.selectedWeekName
      );
      if (filteredRecords.length > 1) {
        const weekFilteredRecords = filteredRecords.filter(
          (slot) => slot.week === week
        );
        if (weekFilteredRecords.length > 0) {
          // If there are records for the selected week, show all of them
          this.TocSlotlist = weekFilteredRecords;
        } else {
          // If no records match the selected week, show only the first available record from a different week
          this.TocSlotlist = [filteredRecords[0]];
        }
      } else {
        // Default case: Only one record
        this.TocSlotlist = filteredRecords;
      }
    }

    if (this.TocSlotlist.length > 0) {
      this.filteredDayNameAfterAddedTs = this.TocSlotlist[0].dayName;
      this.filteredWeekAfterAddedTs = this.TocSlotlist[0].week;
    }

  }

  generateUniqueDays(): void {
     ;
    this.startDate = new Date(this.TOCUserDetailForDays.partTimeStartDate);
    this.endDate = new Date(this.TOCUserDetailForDays.partTimeEndDate);
    if (this.startDate && this.endDate) {
      const uniqueDays: { date: string; dayName: string }[] = [];
      const weeksMap = new Map<
        string,
        {
          week: string;
          days: { date: string; dayName: string }[];
          startDate: string;
          endDate: string;
        }
      >();
      let daysAdded: Set<string> = new Set();

      let currentDate = new Date(this.startDate);
      const endDate = new Date(this.endDate);

      while (currentDate <= endDate) {
        let weekNumber = this.getWeekNumberInMonth(currentDate);
        let month = currentDate.getMonth() + 1; // Get month (1-12)
        let year = currentDate.getFullYear(); // Get year
        const weekKey = `${year}-${month}-Week ${weekNumber}`; // Differentiate weeks by year-month-weekNumber
        // const dateStr = currentDate.toISOString().split('T')[0];

        const dateStr =
          currentDate.getFullYear() +
          '-' +
          String(currentDate.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(currentDate.getDate()).padStart(2, '0');

        const dayName = currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
        });

        // if (this.selectedWorkingDaysForAddingSlots.includes(dayName) && !daysAdded.has(dateStr)) {

        if (this.TOCUserDetailForDays.slotOptionType != 'None') {
          if (
            this.selectedWorkingDaysForAddingSlots.includes(dayName) &&
            !daysAdded.has(dateStr)
          ) {
            daysAdded.add(dateStr);
            uniqueDays.push({ date: dateStr, dayName });

            if (!weeksMap.has(weekKey)) {
              weeksMap.set(weekKey, {
                week: '',
                days: [],
                startDate: '',
                endDate: '',
              });
            }

            let weekData = weeksMap.get(weekKey)!;
            weekData.days.push({ date: dateStr, dayName });
            weekData.startDate = weekData.days[0].date;
            weekData.endDate = weekData.days[weekData.days.length - 1].date;
            weekData.week = `Week ${weekNumber} (${weekData.startDate} - ${weekData.endDate})`;
          }
        } else {
          if (!this.ischeckboxchecked) {
            if (
              this.SelectedWeekDays.includes(dayName) &&
              !daysAdded.has(dateStr)
            ) {
              daysAdded.add(dateStr);
              uniqueDays.push({ date: dateStr, dayName });
              if (!weeksMap.has(weekKey)) {
                weeksMap.set(weekKey, {
                  week: '',
                  days: [],
                  startDate: '',
                  endDate: '',
                });
              }

              let weekData = weeksMap.get(weekKey)!;
              weekData.days.push({ date: dateStr, dayName });
              weekData.startDate = weekData.days[0].date;
              weekData.endDate = weekData.days[weekData.days.length - 1].date;
              weekData.week = `Week ${weekNumber} (${weekData.startDate} - ${weekData.endDate})`;
            }
          } else {
            if (
              this.selectedWorkingDaysForAddingSlots.includes(dayName) &&
              !daysAdded.has(dateStr)
            ) {
              daysAdded.add(dateStr);
              uniqueDays.push({ date: dateStr, dayName });
              if (!weeksMap.has(weekKey)) {
                weeksMap.set(weekKey, {
                  week: '',
                  days: [],
                  startDate: '',
                  endDate: '',
                });
              }

              let weekData = weeksMap.get(weekKey)!;
              weekData.days.push({ date: dateStr, dayName });
              weekData.startDate = weekData.days[0].date;
              weekData.endDate = weekData.days[weekData.days.length - 1].date;
              weekData.week = `Week ${weekNumber} (${weekData.startDate} - ${weekData.endDate})`;
            }
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
      this.availableWeeks = Array.from(weeksMap.values());
    }

    //Added on 14/02/25
    const isEndOfMonthOrNextMonth = this.isEndOfMonthOrFutureMonth(
      this.startDate,
      this.endDate
    );
    const IsDayOfCurentWeek = this.isEndOfWeekOrEarlier(
      this.startDate,
      this.endDate
    );
    this.isCurrentMonthOptionVisible = isEndOfMonthOrNextMonth;
    this.isCurrentWeekOptionVisible = IsDayOfCurentWeek;
  }

  getWeekNumberInMonth(date: Date): number {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstMonday = new Date(firstDayOfMonth);
    while (firstMonday.getDay() !== 1) {
      firstMonday.setDate(firstMonday.getDate() + 1);
    }
    return Math.ceil((date.getDate() - firstMonday.getDate() + 1) / 7) + 1;
  }

  deleteRow(row: any, rowIndex: number) {
     ;
    if (this.TOCUserDetailForDays.slotOptionType != 'None') {
      if (
        this.timeRowsByDayForList &&
        Array.isArray(this.timeRowsByDayForList)
      ) {
        let filteredRecords = this.timeRowsByDayForList.filter(
          (record) => record.dayName === row.dayName
        );
        if (rowIndex >= 0 && rowIndex < filteredRecords.length) {
          let recordToRemove = filteredRecords[rowIndex];
          this.timeRowsByDayForList = this.timeRowsByDayForList.filter(
            (record) =>
              !(
                record.startTime === recordToRemove.startTime &&
                record.endTime === recordToRemove.endTime &&
                record.dayName === recordToRemove.dayName &&
                record.option === recordToRemove.option
              )
          );
        
        } else {
          // console.warn(`Error: rowIndex ${rowIndex} out of bounds for dayName: ${row.dayName}`);
        }
      }
      this.filteredDayNameAfterAddedTs = '';
      this.filteredWeekAfterAddedTs = '';
    } else {
      if (
        this.timeRowsByDayForList &&
        Array.isArray(this.timeRowsByDayForList)
      ) {
        // let filteredRecords = this.timeRowsByDayForList.filter(record => record.dayName === row.dayName);

        //Added on 02/04/25
        let filteredRecords = this.timeRowsByDayForList.filter(
          (record) => record.dayName === row.dayName && record.week === row.week
        );

        if (rowIndex >= 0 && rowIndex < filteredRecords.length) {
          let recordToRemove = filteredRecords[rowIndex];
          let actualIndex = this.timeRowsByDayForList.findIndex(
            (record) =>
              record.startTime === recordToRemove.startTime &&
              record.endTime === recordToRemove.endTime &&
              record.dayName === recordToRemove.dayName &&
              record.week === recordToRemove.week
          );

          if (actualIndex !== -1) {
            this.timeRowsByDayForList.splice(actualIndex, 1);
          }
        } else {
          // console.error("Error: rowIndex out of bounds for dayName:", row.dayName);
        }
      }

      this.filteredDayNameAfterAddedTs = '';
      this.filteredWeekAfterAddedTs = '';
    }
    this.filterslotByDay(this.selectedWeekName, this.DayName);
  }

  AddSlotsOfDay(day: string, event: any): void {
     ;
    if (!event.target.checked) {
      this.ischeckboxchecked = false;
      const index = this.selectedWorkingDaysForAddingSlots.indexOf(day);
      if (index !== -1) {
        this.selectedWorkingDaysForAddingSlots.splice(index, 1);
        this.UpdateWorkingDays();
      }
    } else {
      this.selectedWorkingDaysForAddingSlots.push(day);
      // this.ischeckboxchecked = true;
      this.generateUniqueDays();
      this.UpdateWorkingDays();
    }

    this.disabledDaysForAddingSlots[day] = false;

    // Show modal and update DayName
    $('#AddTimeSlotModal').modal('show');
  }

  resetCheckboxState(): void {
    this.selectedWorkingDaysForAddingSlots = [];
    this.ischeckboxchecked = false; // Reset the flag if needed
  }

  editRow(row: any, rowIndex: number) {
    this.IsEditableSlot = true;
    this.TOCSlotForm.patchValue({
      starttime: row.startTime,
      endTime: row.endTime,
      option: row.option,
      day: row.dayName,
      userID: row.userId,
    });
    this.editRowIndex = rowIndex;
    $('#Addupdateslotbutton').html('Update Slot');
  }

  formatDateRange(dateRange: string): string {
  if (!dateRange) return '';
  const [start, end] = dateRange.split(' - ');
  const format = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
  };
  return `${format(start)} - ${format(end)}`;
}

 onPageChangeToc(page: number): void {
    this.TocContentP = page;
  }

  SubmitForm() {
     const centreId = this.centreID;
    this.timeRowsByDayForList.forEach(row => {
      row.centreId = centreId;
    });

    this.tocservice.ManageTocSlots(this.timeRowsByDayForList).subscribe((data) => {
        if (data.message == 'ok') {
          this.toastr.success('Added Successfully');
          // this.resetForm();
          this.getTOCUserDetailByID(this.UserID);
          this.timeRowsByDayForList = [];
          $('#AddTimeSlotModal').modal('hide');
          this.CloseModal();
        }
      });
  }
}
