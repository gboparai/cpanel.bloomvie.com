import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, NavigationStart } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SchedulerService } from './scheduler.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CommonService } from '../common.service';
import { ManageSchedulerService } from '../../day-care-management/manage-scheduler/manage-scheduler.service';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
import { ManageSchedulerComponent } from '../../day-care-management/manage-scheduler/manage-scheduler.component';
import { OnboardingService } from '../../onboarding/onboarding.service';

import { log } from 'console';
import { NgSelectModule } from '@ng-select/ng-select';
// Uppercase name (recommended)
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { TimeFormatAmPmPipe } from '../../bloomvie-management/dc-appointments-list/time-format.pipe';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { Subscription } from 'rxjs';
// import { TimeFormatAmPmPipe } from '../../bloomvie-management/dc-appointments-list/time-format.pipe';
// import introJs from 'intro.js';
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
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    RouterLink,
    NgFor,
    SkeletonLoaderComponent,
    NgIf,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ManageSchedulerComponent,
    NgSelectModule,
    TimeFormatAmPmPipe,
  ],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.css',
})
export class SchedulerComponent {
  objectKeys = Object.keys;
  disableScheduleButton: boolean = true;
  tour: any;
  centreID: number = 0;
  staffList: any;
  studentList: any;
  currentStartOfWeek: Date = new Date();
  startDateInstance: any;
  endDateInstance: any;
  selectedStartDate: any = null;
  selectedEndDate: any = null;
  intro: any;
  weekDays: {
    dayNumber: number;
    dayId: number;
    dayName: string;
    date: Date;
  }[] = [];
  weekRangeDisplay: string = '';
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
  filteredDaysWithIds: { day: string; id: any }[] | undefined;
  DayList: any;
  viewMode: 'week' | 'day' = 'week';
  selectedClassAssignments: any[] = [];
  selectedClassName: string = '';
  selectedDayName: string = '';
  modalTitle: string = '';
  selectedClass: string = '';

  //Modal
  selectedTimeSlot: any = null;
  selectedScheduleType: string = '';
  ModelButtonText: string = '';
  assignmentForm: any;
  showEndDate: boolean = false;
  patchedEndDate: any;
  selectedSlot: any;
  matchedDays: any[] = [];
  public greaterTimeValidationForStartTime: boolean = false;
  public greaterTimeValidationForEndTime: boolean = false;
  public timeMatchValidationForStartTime: boolean = false;
  public timeMatchValidationForEndTime: boolean = false;
  public slotCreatedForSomeOtherClass: boolean = false;
  public slotCreatedForSomeOtherClassforEndTime: boolean = false;
  teachersData: any;
  classList: any;
  filterClassData: any;
  public classDaysSlot: any[] = [];
  classID: any;
  submitted = false;
  isOnboarding: boolean = false;
  modalType: string = '';
  private routerSub!: Subscription;
  hours: string[] = [];
  DayCareTiming: any;
  currentDayHours: string[] = [];
  filteredClassesForDay: any;
  filteredStaffForDay: any;
  filteredClassDetails: any;
  startIndex!: number;
  endIndex!: number;
  colSpan!: number;
  // At the top of your component class
  fullSpan: number = 0;
  partialStart: boolean = false;
  partialEnd: boolean = false;
  totalSpan: number = 0;
  filteredStudentForDay: any;
  tourStarted: boolean = false;
  skeletonShow = 'Skelton';
  showhide = 'show';
  skeleton = 'show';
  constructor(
    private spinner: NgxSpinnerService,
    private cookie: CookieService,
    private router: Router,
    private toastr: ToastrService,
    private schedulerService: SchedulerService,
    private commonService: CommonService,
    private manageScheduler: ManageSchedulerService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public onBoardingService: OnboardingService
  ) {
    this.assignmentForm = this.fb.group(
      {
        startDate: [null, Validators.required],
        endDate: [null, Validators.required],
        startTime: [null, Validators.required],
        endTime: [null, Validators.required],
        selectedTimeSlot: [null, Validators.required],
        selectedScheduleType: ['', Validators.required],
      },
      {
        validators: [this.validateStartBeforeEnd()],
      }
    );
  }

  ngOnInit(): void {
    // const url = window.location.href;
    if (this.router.url.includes('onboarding')) {
      this.isOnboarding = true;
    }
    this.centreID = parseInt(this.cookie.get('CentreID'));
    this.getClassList();
    this.GetAllDays();
    this.setCurrentWeek();
    this.getStaffList();
    this.getStudentList();
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.startTour();
  //   }, 10000);
  // }

  // ngAfterViewChecked(): void {
  //   const targetElement = document.querySelector('#table-cell-block1');

  //   if (!this.tourStarted && this.studentList?.length > 0 && targetElement) {
  //     this.tourStarted = true;
  //     setTimeout(() => this.startTour(), 0);
  //   }
  // }

  startTour() {
    let steps = [
      {
        element: '#calendar-range-btn',
        intro: 'This shows the calendar for' + this.weekRangeDisplay + '.',
        position: 'bottom',
      },
      {
        element: '#staff-schedule',
        intro: 'Click here to create or manage staff schedules.',
      },
    ];

    if (!this.isOnboarding) {
      steps.push({
        element: '#student-schedule',
        intro: 'Use this button to schedule students.',
      });
    }

    this.intro = introJs();
    this.intro.setOptions({
      steps: steps,
      showBullets: false,
      exitOnOverlayClick: false,
      showStepNumbers: true,
      nextLabel: 'Next →',
      prevLabel: '← Back',
      doneLabel: 'Finish',
    });
    this.intro.start();

    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.intro.exit(); // Abort the tour
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.startTour();
  //   }, 500); // Delay ensures DOM is rendered
  // }

  showCalendar = false;
  selectedDate: string | null = null;

  validateStartBeforeEnd(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const startDate = group.get('startDate')?.value;
      const endDate = group.get('endDate')?.value;
      const startTime = group.get('startTime')?.value;
      const endTime = group.get('endTime')?.value;

      let errors: any = {};

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        errors.dateOrder = 'Start date must be before or same as end date';
      }

      if (startTime && endTime && startTime >= endTime) {
        errors.timeOrder = 'Start time must be before end time';
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }

  setCurrentWeek(): void {
    const today = new Date();
    this.currentStartOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    this.generateWeekDays(this.currentStartOfWeek);
  }

  generateWeekDays(startOfWeek: Date): void {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);

      this.weekDays.push({
        dayNumber: currentDay.getDate(),
        dayId: currentDay.getDay() === 0 ? 7 : currentDay.getDay(),
        dayName: currentDay.toLocaleDateString('en-US', { weekday: 'short' }),
        date: currentDay,
      });
    }

    const startMonth = startOfWeek.toLocaleString('en-US', { month: 'short' });
    const endMonth = endOfWeek.toLocaleString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
      this.weekRangeDisplay = `${startMonth} ${startOfWeek.getDate()}-${endOfWeek.getDate()}`;
    } else {
      this.weekRangeDisplay = `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}`;
    }
  }

  goToPreviousWeek(): void {
    this.currentStartOfWeek.setDate(this.currentStartOfWeek.getDate() - 7);
    this.generateWeekDays(new Date(this.currentStartOfWeek));
  }

  goToNextWeek(): void {
    this.currentStartOfWeek.setDate(this.currentStartOfWeek.getDate() + 7);
    this.generateWeekDays(new Date(this.currentStartOfWeek));
  }

  // onToggleView(mode: 'week' | 'day'): void {
  //   this.viewMode = mode;

  //   if (mode === 'week') {
  //     this.generateWeekDays(this.currentStartOfWeek);
  //   } else if (mode === 'day') {
  //     this.setDayView(new Date(this.currentStartOfWeek));
  //   }
  // }

  onToggleView(mode: 'week' | 'day'): void {
    this.viewMode = mode;

    if (mode === 'week') {
      this.generateWeekDays(this.currentStartOfWeek);
    } else {
      this.setDayView(new Date(this.currentStartOfWeek));
    }
  }

  goToPrevious(): void {
    if (this.viewMode === 'week') {
      this.currentStartOfWeek.setDate(this.currentStartOfWeek.getDate() - 7);
      this.generateWeekDays(this.currentStartOfWeek);
    } else if (this.viewMode === 'day') {
      const prevDay = new Date(this.weekDays[0].date);
      prevDay.setDate(prevDay.getDate() - 1);
      this.setDayView(prevDay);
    }
  }

  goToNext(): void {
    if (this.viewMode === 'week') {
      this.currentStartOfWeek.setDate(this.currentStartOfWeek.getDate() + 7);
      this.generateWeekDays(this.currentStartOfWeek);
    } else if (this.viewMode === 'day') {
      const nextDay = new Date(this.weekDays[0].date);
      nextDay.setDate(nextDay.getDate() + 1);
      this.setDayView(nextDay);
    }
  }

  setDayView(date: Date): void {
    const selectedDayId = date.getDay() === 0 ? 7 : date.getDay();
    const selectedDateString = date.toISOString().split('T')[0];
    this.weekDays = [
      {
        dayNumber: date.getDate(),
        dayId: selectedDayId,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date,
      },
    ];

    this.weekRangeDisplay = `${date.toLocaleString('en-US', {
      month: 'short',
    })} ${date.getDate()}`;

    const fullDayName = this.getFullDayName(this.weekDays[0].dayName);
    this.currentDayHours = this.getAvailableHoursForDay(
      fullDayName,
      this.DayCareTiming
    ).map((time: string) => this.commonService.transform(time));

    this.skeleton = '';

    this.filteredClassesForDay = this.classList
      .filter((dayClass: any) =>
        dayClass.dayID?.some((day: any) => day.dayID === selectedDayId)
      )
      .map((dayClass: any) => {
        const matchingDay = dayClass.dayID.find(
          (day: any) => day.dayID === selectedDayId
        );
        return {
          id: dayClass.id,
          name: dayClass.name,
          staffRatio: dayClass.staffRatio,
          studentRatio: dayClass.studentRatio,
          startTime: matchingDay?.startTime || '',
          endTime: matchingDay?.endTime || '',
        };
      });

    this.selectedClass =
      this.filteredClassesForDay.length > 0
        ? this.filteredClassesForDay[0].id
        : '';

    this.filteredClassDetails = this.filteredClassesForDay.find(
      (x: { id: string }) => x.id == this.selectedClass
    );

    if (
      this.filteredClassDetails?.startTime &&
      this.filteredClassDetails?.endTime
    ) {
      this.calculateClassSpan(
        this.filteredClassDetails.startTime,
        this.filteredClassDetails.endTime
      );
    }

    this.filteredStaffForDay = this.staffList.filter(
      (staff: { assignmentList: any[] }) => {
        return staff.assignmentList.some((assignment) => {
          const dayIdMatches = assignment.dayId === selectedDayId;
          const isSameClass = assignment.classID === this.selectedClass;
          const assignmentDate = new Date(assignment.assignmentDate)
            .toISOString()
            .split('T')[0];
          const currentDate = date.toISOString().split('T')[0];

          if (assignment.isRepeated) {
            const start = this.normalizeDate(new Date(assignment.startDate));
            const end = this.normalizeDate(new Date(assignment.endDate));
            const current = this.normalizeDate(new Date(date));
            return (
              dayIdMatches && isSameClass && current >= start && current <= end
            );
          } else {
            return (
              dayIdMatches &&
              isSameClass &&
              assignmentDate === selectedDateString
            );
          }
        });
      }
    );

    this.filteredStaffForDay.forEach((staff: any) => {
      const assignment = staff.assignmentList.find((assignment: any) => {
        const isSameDay = assignment.dayId === selectedDayId;
        const isSameClass = assignment.classID === this.selectedClass;
        const assignmentDate = new Date(assignment.assignmentDate)
          .toISOString()
          .split('T')[0];
        const currentDate = date.toISOString().split('T')[0];

        if (assignment.isRepeated) {
          const start = this.normalizeDate(new Date(assignment.startDate));
          const end = this.normalizeDate(new Date(assignment.endDate));
          const current = this.normalizeDate(new Date(date));
          return isSameDay && isSameClass && current >= start && current <= end;
        } else {
          return isSameDay && isSameClass && assignmentDate === currentDate;
        }
      });

      if (assignment) {
        staff.assignment = assignment;
        const span = this.computeSlotSpan(
          assignment.startTime,
          assignment.endTime
        );
        staff.startIndex = span.startIndex;
        staff.endIndex = span.endIndex;
        staff.totalSpan = span.totalSpan;
      } else {
        staff.assignment = null;
        staff.startIndex = 0;
        staff.endIndex = 0;
        staff.totalSpan = 0;
      }
    });

    this.filteredStudentForDay = this.studentList.filter(
      (student: { assignmentList: any[] }) => {
        return student.assignmentList.some((assignment) => {
          const dayIdMatches = assignment.dayId === selectedDayId;
          const isSameClass = assignment.classID === this.selectedClass;
          const assignmentDate = new Date(assignment.assignmentDate)
            .toISOString()
            .split('T')[0];
          const currentDate = date.toISOString().split('T')[0];

          if (assignment.isRepeated) {
            const start = this.normalizeDate(new Date(assignment.startDate));
            const end = this.normalizeDate(new Date(assignment.endDate));
            const current = this.normalizeDate(new Date(date));
            return (
              dayIdMatches && isSameClass && current >= start && current <= end
            );
          } else {
            return (
              dayIdMatches && isSameClass && assignmentDate === currentDate
            );
          }
        });
      }
    );

    this.filteredStudentForDay.forEach((student: any) => {
      const assignment = student.assignmentList.find((assignment: any) => {
        const isSameDay = assignment.dayId === selectedDayId;
        const isSameClass = assignment.classID === this.selectedClass;
        const assignmentDate = new Date(assignment.assignmentDate)
          .toISOString()
          .split('T')[0];
        const currentDate = date.toISOString().split('T')[0];

        if (assignment.isRepeated) {
          const start = this.normalizeDate(new Date(assignment.startDate));
          const end = this.normalizeDate(new Date(assignment.endDate));
          const current = this.normalizeDate(new Date(date));
          return isSameDay && isSameClass && current >= start && current <= end;
        } else {
          return isSameDay && isSameClass && assignmentDate === currentDate;
        }
      });

      if (assignment) {
        student.assignment = assignment;
        const span = this.computeSlotSpan(
          assignment.startTime,
          assignment.endTime
        );
        student.startIndex = span.startIndex;
        student.endIndex = span.endIndex;
        student.totalSpan = span.totalSpan;
      } else {
        student.assignment = null;
        student.startIndex = 0;
        student.endIndex = 0;
        student.totalSpan = 0;
      }
    });

    this.skeleton = '';
  }

  shouldShowTeacher(item: any): boolean {
    const isTOC = item.userRole?.toLowerCase() === 'toc';

    if (!isTOC) {
      return true;
    }

    const startDate = item.tocTeacherAvailableRange?.[0]?.partTimeStartDate
      ? new Date(item.tocTeacherAvailableRange[0].partTimeStartDate)
      : null;

    const endDate = item.tocTeacherAvailableRange?.[0]?.partTimeEndDate
      ? new Date(item.tocTeacherAvailableRange[0].partTimeEndDate)
      : null;

    if (!startDate || !endDate) {
      return false;
    }
    const weekStart = new Date(this.weekDays[0].date);
    const weekEnd = new Date(this.weekDays[this.weekDays.length - 1].date);

    return startDate <= weekEnd && endDate >= weekStart;
  }

  calculateClassSpan(startTime: string, endTime: string) {
    const slotDuration = 30;
    const firstSlot = this.timeToMinutes(this.currentDayHours[0]);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    const startOffset = Math.floor((start - firstSlot) / slotDuration);
    const endOffset = Math.floor((end - firstSlot) / slotDuration);

    this.startIndex = startOffset;
    this.endIndex = endOffset + 1;
    this.totalSpan = this.endIndex - this.startIndex;
  }

  private computeSlotSpan(
    startTime: string,
    endTime: string
  ): { startIndex: number; endIndex: number; totalSpan: number } {
    const slotDuration = 30;
    const firstSlot = this.timeToMinutes(this.currentDayHours[0]);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    const startIndex = Math.floor((start - firstSlot) / slotDuration);
    const endIndex = Math.floor((end - firstSlot) / slotDuration) + 1;
    return {
      startIndex,
      endIndex,
      totalSpan: endIndex - startIndex,
    };
  }

  convertToMinutes(time: string): number {
    const [hh, mm] = time.split(':').map(Number);
    return hh * 60 + mm;
  }

  getStartHourIndex(time: string): number {
    const classMinutes = this.timeToMinutes(time);
    for (let i = 0; i < this.currentDayHours.length; i++) {
      const slotMinutes = this.timeToMinutes(this.currentDayHours[i]);
      if (classMinutes <= slotMinutes) {
        return i > 0 ? i - 1 : 0;
      }
    }
    return 0;
  }

  getEndHourIndex(time: string): number {
    const classMinutes = this.timeToMinutes(time);
    for (let i = 0; i < this.currentDayHours.length; i++) {
      const slotMinutes = this.timeToMinutes(this.currentDayHours[i]);
      if (classMinutes <= slotMinutes) {
        return i;
      }
    }
    return this.currentDayHours.length;
  }

  //Commented on 11/07/25
  // timeToMinutes(time: string): number {
  //   const [h, m] = time.split(':').map(Number);
  //   return h * 60 + m;
  // }

  //Updated on 11/07/25
  timeToMinutes(time: string): number {
    if (!time || !time.includes(':')) return 0;

    // Remove AM/PM and trim the string
    time = time.replace(/AM|PM|am|pm/i, '').trim();

    const [hStr, mStr] = time.split(':');
    const h = Number(hStr?.trim() || '0');
    const m = Number(mStr?.trim() || '0');

    if (isNaN(h) || isNaN(m)) return 0;

    return h * 60 + m;
  }

  private normalizeDate(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private getFullDayName(shortDay: string): string {
    switch (shortDay.toLowerCase()) {
      case 'mon':
        return 'monday';
      case 'tue':
        return 'tuesday';
      case 'wed':
        return 'wednesday';
      case 'thu':
        return 'thursday';
      case 'fri':
        return 'friday';
      case 'sat':
        return 'saturday';
      case 'sun':
        return 'sunday';
      default:
        return '';
    }
  }

  private getAvailableHoursForDay(dayName: string, timingData: any): string[] {
    const normalizedDay = dayName.toLowerCase();
    let startTime: string | null = null;
    let endTime: string | null = null;
    let isOpen: boolean = false;

    switch (normalizedDay) {
      case 'monday':
        isOpen = timingData.mon;
        startTime = timingData.monStartTime;
        endTime = timingData.monEndTime;
        break;
      case 'tuesday':
        isOpen = timingData.tues;
        startTime = timingData.tuesStartTime;
        endTime = timingData.tuesEndTime;
        break;
      case 'wednesday':
        isOpen = timingData.wed;
        startTime = timingData.wedStartTime;
        endTime = timingData.wedEndTime;
        break;
      case 'thursday':
        isOpen = timingData.thu;
        startTime = timingData.thuStartTime;
        endTime = timingData.thuEndTime;
        break;
      case 'friday':
        isOpen = timingData.fri;
        startTime = timingData.friStartTime;
        endTime = timingData.friEndTime;
        break;
      case 'saturday':
        isOpen = timingData.sat;
        startTime = timingData.satStartTime;
        endTime = timingData.satEndTime;
        break;
      case 'sunday':
        isOpen = timingData.sun;
        startTime = timingData.sunStartTime;
        endTime = timingData.sunEndTime;
        break;
      default:
        return [];
    }

    if (!isOpen || !startTime || !endTime) {
      return [];
    }

    const hours: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const current = new Date();
    current.setHours(startHour, startMin, 0, 0);
    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);

    while (current <= end) {
      const hh = current.getHours().toString().padStart(2, '0');
      const mm = current.getMinutes().toString().padStart(2, '0');
      hours.push(`${hh}:${mm}`);
      current.setMinutes(current.getMinutes() + 30);
    }
    return hours;
  }

  onClassChange(selectedClassId: any): void {
    this.filteredStaffForDay = [];
    this.filteredStudentForDay = [];
    this.selectedClass = selectedClassId.id;

    this.filteredClassDetails = this.filteredClassesForDay.find(
      (x: any) => x.id == this.selectedClass
    );

    if (
      this.filteredClassDetails?.startTime &&
      this.filteredClassDetails?.endTime
    ) {
      this.calculateClassSpan(
        this.filteredClassDetails.startTime,
        this.filteredClassDetails.endTime
      );
    } else {
      this.totalSpan = 0;
      this.startIndex = 0;
      this.endIndex = 0;
    }

    const selectedDate = this.weekDays[0]?.date || new Date();
    const selectedDayId =
      selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
    const selectedDateString = selectedDate.toISOString().split('T')[0];

    this.filteredStaffForDay = this.staffList.filter(
      (staff: { assignmentList: any[] }) => {
        return staff.assignmentList.some((assignment) => {
          const dayIdMatches = assignment.dayId === selectedDayId;
          const isSameClass = assignment.classID === this.selectedClass;
          const assignmentDate = new Date(assignment.assignmentDate)
            .toISOString()
            .split('T')[0];

          if (assignment.isRepeated) {
            const start = this.normalizeDate(new Date(assignment.startDate));
            const end = this.normalizeDate(new Date(assignment.endDate));
            const current = this.normalizeDate(new Date(selectedDate));
            return (
              dayIdMatches && isSameClass && current >= start && current <= end
            );
          } else {
            return (
              dayIdMatches &&
              isSameClass &&
              assignmentDate === selectedDateString
            );
          }
        });
      }
    );

    this.filteredStaffForDay.forEach((staff: any) => {
      const assignment = staff.assignmentList.find((assignment: any) => {
        const isSameDay = assignment.dayId === selectedDayId;
        const isSameClass = assignment.classID === this.selectedClass;
        const assignmentDate = new Date(assignment.assignmentDate)
          .toISOString()
          .split('T')[0];
        const currentDate = selectedDate.toISOString().split('T')[0];

        if (assignment.isRepeated) {
          const start = this.normalizeDate(new Date(assignment.startDate));
          const end = this.normalizeDate(new Date(assignment.endDate));
          const current = this.normalizeDate(new Date(selectedDate));
          return isSameDay && isSameClass && current >= start && current <= end;
        } else {
          return isSameDay && isSameClass && assignmentDate === currentDate;
        }
      });
      if (assignment) {
        staff.assignment = assignment;
        const span = this.computeSlotSpan(
          assignment.startTime,
          assignment.endTime
        );
        staff.startIndex = span.startIndex;
        staff.endIndex = span.endIndex;
        staff.totalSpan = span.totalSpan;
      } else {
        staff.assignment = null;
        staff.startIndex = 0;
        staff.endIndex = 0;
        staff.totalSpan = 0;
      }
    });

    // Filter students
    this.filteredStudentForDay = this.studentList.filter(
      (student: { assignmentList: any[] }) => {
        return student.assignmentList.some((assignment) => {
          const dayIdMatches = assignment.dayId === selectedDayId;
          const isSameClass = assignment.classID === this.selectedClass;
          const assignmentDate = new Date(assignment.assignmentDate)
            .toISOString()
            .split('T')[0];
          const currentDate = selectedDate.toISOString().split('T')[0];

          if (assignment.isRepeated) {
            const start = this.normalizeDate(new Date(assignment.startDate));
            const end = this.normalizeDate(new Date(assignment.endDate));
            const current = this.normalizeDate(new Date(selectedDate));
            return (
              dayIdMatches && isSameClass && current >= start && current <= end
            );
          } else {
            return (
              dayIdMatches && isSameClass && assignmentDate === currentDate
            );
          }
        });
      }
    );

    this.filteredStudentForDay.forEach((student: any) => {
      const assignment = student.assignmentList.find((assignment: any) => {
        const isSameDay = assignment.dayId === selectedDayId;
        const isSameClass = assignment.classID === this.selectedClass;
        const assignmentDate = new Date(assignment.assignmentDate)
          .toISOString()
          .split('T')[0];
        const currentDate = selectedDate.toISOString().split('T')[0];

        if (assignment.isRepeated) {
          const start = this.normalizeDate(new Date(assignment.startDate));
          const end = this.normalizeDate(new Date(assignment.endDate));
          const current = this.normalizeDate(new Date(selectedDate));
          return isSameDay && isSameClass && current >= start && current <= end;
        } else {
          return isSameDay && isSameClass && assignmentDate === currentDate;
        }
      });

      this.skeleton = '';

      if (assignment) {
        student.assignment = assignment;
        const span = this.computeSlotSpan(
          assignment.startTime,
          assignment.endTime
        );
        student.startIndex = span.startIndex;
        student.endIndex = span.endIndex;
        student.totalSpan = span.totalSpan;
      } else {
        student.assignment = null;
        student.startIndex = 0;
        student.endIndex = 0;
        student.totalSpan = 0;
      }
    });
  }

  isDayAvailable(dayNumber: number): boolean {
    if (!this.filteredDaysWithIds || !Array.isArray(this.filteredDaysWithIds)) {
      return false;
    }
    return this.filteredDaysWithIds.some((d) => d.id === dayNumber);
  }

  getClassList() {
    this.manageScheduler.getDaycareClasses(this.centreID).subscribe((data) => {
      if (data.message == 'Success') {
        this.classList = data.result;
      }
    });
  }

  getCentreWorkingDaysByCentreID() {
    this.manageScheduler
      .getCentreWorkingDaysByCentreID(this.centreID)
      .subscribe((data: any) => {
        if (data.message == 'Success') {
          this.DayCareTiming = data.result;
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
              };
            }
          );
        }
      });
  }

  GetAllDays() {
    this.manageScheduler.GetAllDays().subscribe((data) => {
      if (data.message === 'Success') {
        this.DayList = data.result.sort((a: any, b: any) => b.id - a.id);
        this.getCentreWorkingDaysByCentreID();
      }
    });
  }

  base64ToBlob(base64: any, mime = 'image/jpeg') {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mime });
  }

  getS3FileName(fileName: any) {
    let response = this.base64ToBlob(fileName);
    const imageUrl = URL.createObjectURL(response);
    return imageUrl;
  }

  async getStaffList() {
    this.showhide = 'show';
    this.schedulerService.getCentreStaffList(this.centreID, '', 'active', true)
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.staffList = response.result.map((item: any) => {
              return {
                ...item,
                s3Url: item.s3ImageUrl
                  ? this.getS3FileName(item.s3ImageUrl)
                  : '',
              };
            });
            this.showhide == '';
          } else {
            this.staffList = [];
          }
          this.showhide = '';
        },
        error: (err) => {
          this.showhide = '';
        },
      });
  }

  //With s3 Method
  // async getStaffList() {
  //   this.spinner.show();
  //   this.schedulerService.getCentreStaffList(this.centreID, '').subscribe({
  //     next: async (response) => {
  //       if (response.message === 'Success') {
  //         this.staffList = await Promise.all(
  //           response.result.map(async (item: any) => {
  //             let staffProfile = '';
  //             if (item.imageUrl) {
  //               const trimmedPath = item.imageUrl.replace(/^Content\/Image\//, '');
  //               staffProfile = await this.getS3FileName(trimmedPath);
  //             }

  //             return {
  //               ...item,
  //               staffProfile: staffProfile,
  //             };
  //           })
  //         );
  //       } else {
  //         this.staffList = [];
  //       }

  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 300);
  //     },
  //     error: (err) => {
  //       this.spinner.hide();
  //       this.toastr.error(err.message);
  //     },
  //   });
  // }

  // async getS3FileName(fileName: Blob) {
  //   let blob = await this.commonService.getS3FileByName(fileName).toPromise();
  //   if (blob) {
  //     const imageUrl = URL.createObjectURL(blob);
  //     alert(imageUrl);
  //     return imageUrl;
  //   } else {
  //     return 'Failed to fetch S3 image';
  //   }
  // }

  async getStudentList() {
    this.showhide == 'show';
    this.schedulerService.getStudentList(this.centreID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          setTimeout(() => {
            this.startTour();
            this.disableScheduleButton = false;
          }, 100);
          this.studentList = response.result.map((item: any) => {
            return {
              ...item,
              S3ImageUrl: item.s3ImageUrl
                ? this.getS3FileName(item.s3ImageUrl)
                : '',
            };
          });
          this.showhide = '';
        } else {
          setTimeout(() => {
            this.startTour();
            this.disableScheduleButton = false;
          }, 100);
          this.studentList = [];
        }
        this.showhide = '';
      },
      error: (err) => {
        this.showhide = '';
      },
    });
  }

  goToScheduler(type: string): void {
    if (!this.isOnboarding) {
      const encryptedType = this.commonService.encrypt(type);
      this.router.navigate(['/manage-scheduler'], {
        queryParams: { type: encryptedType },
      });
    } else {
      this.modalType = type;
      if (this.modalType == 'staff') {
        $('#staticBackdrop').modal('show');
      } else {
        $('#staticBackdrop1').modal('show');
      }
    }
  }

  // getAssignmentByDate(assignments: any[], date: Date) {
  //   return assignments?.find(a => {
  //     const assignmentDate = new Date(a.assignmentDate);
  //     return (
  //       assignmentDate.getFullYear() === date.getFullYear() &&
  //       assignmentDate.getMonth() === date.getMonth() &&
  //       assignmentDate.getDate() === date.getDate()
  //     );
  //   }) || null;
  // }

  getGroupedAssignmentTimes(
    assignments: any[],
    date: Date
  ): { [key: string]: string[] } {
    const filtered =
      assignments?.filter((a) => {
        const assignmentDate = new Date(a.assignmentDate);
        return (
          assignmentDate.getFullYear() === date.getFullYear() &&
          assignmentDate.getMonth() === date.getMonth() &&
          assignmentDate.getDate() === date.getDate()
        );
      }) || [];

    const grouped: { [key: string]: string[] } = {};

    filtered.forEach((a) => {
      const timeRange = `${this.commonService.transform(
        a.startTime
      )} - ${this.commonService.transform(a.endTime)}`;

      if (!grouped[a.className]) {
        grouped[a.className] = [];
      }
      grouped[a.className].push(timeRange);
    });

    return grouped;
  }

  // objectKeys = Object.keys;

  // formatTime(time: string): string {
  //   const [h, m] = time.split(':');
  //   const hour = +h;
  //   const ampm = hour >= 12 ? 'PM' : 'AM';
  //   const formattedHour = hour % 12 || 12;
  //   return `${formattedHour}:${m} ${ampm}`;
  // }

  hasAssignmentsForDay(assignments: any[], date: Date): boolean {
    const grouped = this.getGroupedAssignmentTimes(assignments, date);
    return Object.keys(grouped).length > 0;
  }

  getDayName(dayId: number): string {
    const dayMap: { [key: number]: string } = {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
      7: 'Sunday',
    };
    return dayMap[dayId] || 'Unknown';
  }

  getClassIdByName(assignmentList: any[], className: string): number | null {
    const match = assignmentList.find((a) => a.className === className);
    return match ? match.classID : null;
  }

  onAssignmentClick(
    day: any,
    assignmentList: any[],
    date: Date,
    className: string,
    classID: number | null
  ) {
    if (classID === null) {
      console.warn('No classID found for', className);
      return;
    }
    const filteredAssignments = assignmentList.filter(
      (a) =>
        new Date(a.assignmentDate).toDateString() ===
        new Date(date).toDateString() && a.classID === classID
    );

    Swal.fire({
      title: `${className} - ${this.getDayName(day.dayId)}`,
      html: `
        <p><strong>Time Slots:</strong> 
        ${filteredAssignments
          .map((a) => `${this.commonService.transform(a.startTime)} - ${this.commonService.transform(a.endTime)}`)
          .join(', ')}
       </p>`,

      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Edit',
      denyButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      this.selectedClassAssignments = filteredAssignments;
      this.modalTitle = `${result.isConfirmed ? 'Update' : 'Delete'
        } - ${className}`;
      this.ModelButtonText = `${result.isConfirmed ? 'Update' : 'Delete'}`;
      if (result.isConfirmed || result.isDenied) {
        this.selectedTimeSlot = [];
        this.selectedScheduleType = '';
        if (this.ModelButtonText == 'Update') {
          $('#assignmentEditModal').modal('show');
        } else {
          $('#assignmentDeleteModal').modal('show');
        }
      } else {
        $('#assignmentEditModal').modal('hide');
        $('#assignmentDeleteModal').modal('hide');
      }
    });
  }

  handleAction() {
    if (this.ModelButtonText === 'Update') {
      this.onEditAssignment();
    } else if (this.ModelButtonText === 'Delete') {
      this.onDeleteAssignment();
    }
  }

  onDeleteAssignment() {
    this.submitted = true;
    if (!this.selectedTimeSlot || !this.selectedScheduleType) {
      this.toastr.warning('Please select both Time Slot and Schedule Type.');
      return;
    }

    this.spinner.show();
    const timeSlot = this.selectedTimeSlot;
    const scheduleType = this.selectedScheduleType;

    this.schedulerService
      .deleteClassAssignment(timeSlot, scheduleType)
      .subscribe({
        next: (res) => {
          if (res.message === 'ok') {
            this.toastr.success('Assignment Deleted Successfull');
            $('#assignmentDeleteModal').modal('hide');
            this.spinner.hide();
            this.selectedTimeSlot = [];
            this.selectedScheduleType = '';
            this.submitted = false;
            this.getStaffList();
            this.getStudentList();
          } else {
            this.toastr.warning(res.message);
            this.spinner.hide();
          }
        },
        error: (err) => {
          this.spinner.hide();
          console.error('Delete failed', err);
        },
      });
  }

  InitDatePicker() {
    const today = new Date();
    this.startDateInstance = flatpickr('#startdatePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: today,
      onChange: (selectedDates: any) => {
        this.selectedStartDate = selectedDates[0];
      },
    });

    this.endDateInstance = flatpickr('#enddatePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      onChange: (selectedDates: any) => {
        this.selectedEndDate = selectedDates[0];
      },
    });
  }

  selectedEditTimeSlot(slot: any) {
    this.selectedSlot = slot; // Store slot globally for reuse

    const isSingle =
      this.assignmentForm.value.selectedScheduleType === 'single';
    const startDate = isSingle
      ? this.formatToMDY(slot.assignmentDate)
      : this.formatToMDY(slot.startDate);
    const endDate = slot.endDate ? this.formatToMDY(slot.endDate) : '';

    this.assignmentForm.patchValue({
      startTime: slot.startTime.split(':').slice(0, 2).join(':'),
      endTime: slot.endTime.split(':').slice(0, 2).join(':'),
      startDate: startDate,
      endDate: endDate,
    });

    this.patchedEndDate = endDate;

    const teacherId = this.selectedSlot.userId;
    const teacher = this.staffList.find((staff: any) => staff.id === teacherId);
    const teacherAvailability = teacher?.teacherAvailability || [];

    if (this.selectedSlot?.userRole != 'Student') {
      if (this.filteredDaysWithIds?.length) {
        this.matchedDays = this.filteredDaysWithIds
          .filter((day) =>
            teacherAvailability.some(
              (av: { dayID: any }) => av.dayID === day.id
            )
          )
          .map((day) => ({
            ...day,
            availability: teacherAvailability.find(
              (av: { dayID: any }) => av.dayID === day.id
            ),
          }));
      } else {
        this.matchedDays = [];
      }

      // if (this.matchedDays?.length) {
      //   this.matchedDays = this.matchedDays.filter((day: { id: any; }) =>
      //     teacherAvailability.some((av: { dayID: any; }) => av.dayID === day.id)
      //   )
      //     .map((day: { id: any; }) => ({
      //       ...day,
      //       availability: teacherAvailability.find((av: { dayID: any; }) => av.dayID === day.id)
      //     }));
      // }
      //  else {
      //   this.matchedDays = [];
      // }

      if (this.matchedDays?.length) {
        this.matchedDays = this.matchedDays.filter(
          (day: { id: any }) => day.id === this.selectedSlot.dayId
        );
      } else {
        this.matchedDays = [];
      }
    }

    this.filterClassData = this.classList.find(
      (x: { id: any }) => x.id == this.selectedSlot.classID
    );
    this.classDaysSlot = this.filterClassData.dayID || [];

    this.classID = this.selectedSlot.classID;

    this.getAllAvailableTeachersByCentreID(this.classID, this.classDaysSlot);
  }

  formatToMDY(dateStr: string): string {
    const date = new Date(dateStr);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }

  // onScheduleTypeChange(event: any) {
  //   const selectedValue = event.target.value;
  //   this.showEndDate = selectedValue === 'schedule';

  //   const isSingle = selectedValue === 'single';

  //   if (this.selectedSlot) {
  //     const startDate = isSingle ? this.formatToMDY(this.selectedSlot.assignmentDate) : this.formatToMDY(this.selectedSlot.startDate);

  //     this.assignmentForm.patchValue({
  //       startDate: startDate,
  //       endDate: this.showEndDate ? this.patchedEndDate : '',
  //     });

  //     if (!this.showEndDate) {
  //       this.assignmentForm.get('endDate')?.clearValidators();
  //       this.assignmentForm.get('endDate')?.updateValueAndValidity();
  //     }
  //     else {
  //       this.assignmentForm.get('endDate')?.setValidators([Validators.required]);
  //     }
  //   }
  // }

  onScheduleTypeChange(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue == 'schedule') {
      Swal.fire({
        title: `Reminder: Do you want to apply changes to all slots within the selected date range?`,
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.showEndDate = selectedValue === 'schedule';
          const isSingle = selectedValue === 'single';

          if (this.selectedSlot) {
            const startDate = isSingle
              ? this.formatToMDY(this.selectedSlot.assignmentDate)
              : this.formatToMDY(this.selectedSlot.startDate);
            this.assignmentForm.patchValue({
              startDate: startDate,
              endDate: this.showEndDate ? this.patchedEndDate : '',
            });
            if (!this.showEndDate) {
              this.assignmentForm.get('endDate')?.clearValidators();
              this.assignmentForm.get('endDate')?.updateValueAndValidity();
            } else {
              this.assignmentForm
                .get('endDate')
                ?.setValidators([Validators.required]);
            }
          }
        } else {
          this.assignmentForm = this.fb.group({
            selectedScheduleType: '',
          });
        }
      });
    } else {
      this.showEndDate = selectedValue === 'schedule';
      const isSingle = selectedValue === 'single';

      if (this.selectedSlot) {
        const startDate = isSingle
          ? this.formatToMDY(this.selectedSlot.assignmentDate)
          : this.formatToMDY(this.selectedSlot.startDate);

        this.assignmentForm.patchValue({
          startDate: startDate,
          endDate: this.showEndDate ? this.patchedEndDate : '',
        });

        if (!this.showEndDate) {
          this.assignmentForm.get('endDate')?.clearValidators();
          this.assignmentForm.get('endDate')?.updateValueAndValidity();
        } else {
          this.assignmentForm
            .get('endDate')
            ?.setValidators([Validators.required]);
        }
      }
    }
  }

  startDateChange(event: any) {
    if (this.selectedSlot.isRepeated == false) {
      const date = new Date(event.target.value);
      const jsDay = date.getDay();
      const dayId = jsDay === 0 ? 7 : jsDay;

      if (this.selectedSlot.dayId !== dayId) {
        // this.toastr.warning('Teacher is not available on selected date.');
        this.toastr.warning('Selected day not available in selected date.');
        $('#startdatePicker').val(null);
        return;
      }
    }
  }

  endDateChange(event: any) {
    if (this.selectedSlot.isRepeated == true) {
      const startDate = new Date(this.assignmentForm.value.startDate);
      const endDate = new Date(event.target.value);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return;
      }
      let currentDate = new Date(startDate);
      let hasMatchingDay = false;
      while (currentDate <= endDate) {
        const jsDay = currentDate.getDay();
        const dayId = jsDay === 0 ? 7 : jsDay;
        if (this.selectedSlot.dayId == dayId) {
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
    }
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

    const type = this.selectedSlot.userRole == 'Staff' ? 'staff' : 'student';

    this.manageScheduler
      .getAllAvailableTeachersByCentreID(classId, classTimingsBO, type)
      .subscribe((data) => {
        if (data.message == 'Success') {
          this.teachersData = data.result;
          setTimeout(() => {
            this.spinner.hide();
          }, 500);
        } else {
          this.spinner.hide();
        }
      });
  }

  // ApplyValidationForStartTime() {
  //   let slotStartTime = this.assignmentForm.value.startTime ? this.assignmentForm.value.startTime + ':00' : this.assignmentForm.value.startTime;
  //   let slotEndTime = this.assignmentForm.value.endTime ? this.assignmentForm.value.endTime + ':00' : this.assignmentForm.value.endTime;
  //   let classSlots = this.classDaysSlot.find((item: any) => item.dayID == this.selectedSlot.dayId);
  //   let classStartTime = classSlots.startTime;
  //   let classEndTime = classSlots.endTime;
  //   let teacherRecord = this.teachersData.find((item: any) => item.teacherID == this.selectedSlot.userId);
  //   let teacherAvailability = teacherRecord.teacherAvailability.find((item: any) => item.dayID == this.selectedSlot.dayId);
  //   let teacherAssigment = teacherRecord.teacherAssignmentList.filter((x: { teacherID: any; dayId: any; }) => x.teacherID == this.selectedSlot.userId && x.dayId == this.selectedSlot.dayId);
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
  //           this.timeMatchValidationForStartTime = false;
  //           this.greaterTimeValidationForStartTime = false;

  //           const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //             assignment.dayId === this.selectedSlot.dayId &&
  //             assignment.teacherID === this.selectedSlot.userId &&
  //             assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //           );

  //           if (isOverlapping) {
  //             this.slotCreatedForSomeOtherClass = true;
  //             this.greaterTimeValidationForStartTime = false;
  //             this.timeMatchValidationForStartTime = false;
  //             this.assignmentForm.patchValue({
  //               startTime: null,
  //             });
  //           }
  //           else {
  //             this.slotCreatedForSomeOtherClass = false;
  //             this.greaterTimeValidationForStartTime = false;
  //             this.timeMatchValidationForStartTime = false;
  //           }

  //         }
  //         else {
  //           this.timeMatchValidationForStartTime = false;
  //           this.greaterTimeValidationForStartTime = false;
  //           this.assignmentForm.patchValue({
  //             startTime: null,
  //           });
  //         }
  //       }
  //       else {
  //         this.greaterTimeValidationForStartTime = false;
  //         this.timeMatchValidationForStartTime = true;
  //         this.assignmentForm.patchValue({
  //           startTime: null,
  //         });
  //       }
  //     }
  //     else {
  //       this.greaterTimeValidationForStartTime = true;
  //       this.timeMatchValidationForStartTime = false;
  //       this.assignmentForm.patchValue({
  //         startTime: null,
  //         endTime: null,
  //       });
  //     }
  //   }
  //   else {
  //     if (slotStartTime >= classStartTime && slotStartTime <= classEndTime) {
  //       if (slotStartTime >= teacherStartTime && slotStartTime <= teacherEndTime) {
  //         this.timeMatchValidationForStartTime = false;
  //         this.greaterTimeValidationForStartTime = false;

  //         const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //           assignment.dayId === this.selectedSlot.dayId &&
  //           assignment.teacherID === this.selectedSlot.userId &&
  //           assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //         );

  //         if (isOverlapping) {
  //           this.slotCreatedForSomeOtherClass = true;
  //           this.greaterTimeValidationForStartTime = false;
  //           this.timeMatchValidationForStartTime = false;
  //           this.assignmentForm.patchValue({
  //             startTime: null,
  //           });
  //         }
  //         else {
  //           this.slotCreatedForSomeOtherClass = false;
  //           this.greaterTimeValidationForStartTime = false;
  //           this.timeMatchValidationForStartTime = false;
  //         }

  //       }
  //       else {
  //         this.slotCreatedForSomeOtherClass = false;
  //         this.greaterTimeValidationForStartTime = false;
  //         this.timeMatchValidationForStartTime = true;
  //         this.assignmentForm.patchValue({
  //           startTime: null,
  //         });
  //       }
  //     }
  //     else {
  //       this.greaterTimeValidationForStartTime = false;
  //       this.timeMatchValidationForStartTime = true;
  //       this.assignmentForm.patchValue({
  //         startTime: null,
  //       });
  //     }
  //   }
  // }

  ApplyValidationForStartTime() {
    const slotStartTime = this.assignmentForm.value.startTime
      ? this.assignmentForm.value.startTime + ':00'
      : null;
    const slotEndTime = this.assignmentForm.value.endTime
      ? this.assignmentForm.value.endTime + ':00'
      : null;

    const classSlot = this.classDaysSlot.find(
      (item: any) => item.dayID === this.selectedSlot.dayId
    );
    const teacherRecord = this.teachersData.find(
      (item: any) => item.teacherID === this.selectedSlot.userId
    );
    const teacherAvailability = teacherRecord?.teacherAvailability.find(
      (item: any) => item.dayID === this.selectedSlot.dayId
    );

    if (
      !slotStartTime ||
      !classSlot ||
      !teacherRecord ||
      !teacherAvailability
    ) {
      this.assignmentForm.patchValue({ startTime: null });
      return;
    }

    const classStartTime = classSlot.startTime;
    const classEndTime = classSlot.endTime;
    const teacherStartTime = teacherAvailability.startTime;
    const teacherEndTime = teacherAvailability.endTime;

    const teacherAssignments = teacherRecord.teacherAssignmentList.filter(
      (x: any) =>
        x.teacherID === this.selectedSlot.userId &&
        x.dayId === this.selectedSlot.dayId
    );

    const uniqueAssignments = teacherAssignments.filter(
      (assignment: any, index: number, self: any[]) =>
        index ===
        self.findIndex(
          (a: any) =>
            a.classStartTime === assignment.classStartTime &&
            a.classEndTime === assignment.classEndTime
        )
    );

    const isWithinClassTime =
      slotStartTime >= classStartTime && slotStartTime <= classEndTime;
    const isWithinTeacherTime =
      slotStartTime >= teacherStartTime && slotStartTime <= teacherEndTime;

    // Case: EndTime exists, check time relationship
    if (slotEndTime) {
      if (slotStartTime >= slotEndTime) {
        this.greaterTimeValidationForStartTime = true;
        this.timeMatchValidationForStartTime = false;
        this.assignmentForm.patchValue({
          startTime: null,
          endTime: null,
        });
        return;
      }
    }

    if (isWithinClassTime) {
      if (isWithinTeacherTime) {
        const isOverlapping = uniqueAssignments.some(
          (assignment: any) =>
            assignment.dayId === this.selectedSlot.dayId &&
            assignment.teacherID === this.selectedSlot.userId &&
            assignment.classStartTime <= slotStartTime &&
            assignment.classEndTime >= slotStartTime
        );

        if (isOverlapping) {
          this.slotCreatedForSomeOtherClass = true;
          this.assignmentForm.patchValue({ startTime: null });
        } else {
          this.slotCreatedForSomeOtherClass = false;
        }

        this.greaterTimeValidationForStartTime = false;
        this.timeMatchValidationForStartTime = false;
      } else {
        this.greaterTimeValidationForStartTime = false;
        this.timeMatchValidationForStartTime = true;
        this.assignmentForm.patchValue({ startTime: null });
      }
    } else {
      this.greaterTimeValidationForStartTime = false;
      this.timeMatchValidationForStartTime = true;
      this.assignmentForm.patchValue({ startTime: null });
    }
  }

  // ApplyValidationForEndTime() {
  //   let slotStartTime = this.assignmentForm.value.startTime ? this.assignmentForm.value.startTime + ':00' : this.assignmentForm.value.startTime;
  //   let slotEndTime = this.assignmentForm.value.endTime ? this.assignmentForm.value.endTime + ':00' : this.assignmentForm.value.endTime;
  //   let classSlots = this.classDaysSlot.find((item: any) => item.dayID == this.selectedSlot.dayId);
  //   let classStartTime = classSlots.startTime;
  //   let classEndTime = classSlots.endTime;
  //   let teacherRecord = this.teachersData.find((item: any) => item.teacherID == this.selectedSlot.userId);
  //   let teacherAvailability = teacherRecord.teacherAvailability.find((item: any) => item.dayID == this.selectedSlot.dayId);
  //   let teacherAssigment = teacherRecord.teacherAssignmentList.filter((x: { teacherID: any; dayId: any; }) => x.teacherID == this.selectedSlot.userId && x.dayId == this.selectedSlot.dayId);
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

  //           this.timeMatchValidationForEndTime = false;
  //           this.greaterTimeValidationForEndTime = false;

  //           const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //             assignment.dayId === this.selectedSlot.dayId &&
  //             assignment.teacherID === this.selectedSlot.userId &&
  //             assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //           );

  //           if (isOverlapping) {
  //             this.slotCreatedForSomeOtherClassforEndTime = true;
  //             this.greaterTimeValidationForEndTime = false;
  //             this.timeMatchValidationForEndTime = false;
  //             this.assignmentForm.patchValue({
  //               endTime: null,
  //             });
  //           }
  //           else {
  //             this.slotCreatedForSomeOtherClassforEndTime = false;
  //             this.greaterTimeValidationForEndTime = false;
  //             this.timeMatchValidationForEndTime = false;
  //           }

  //         } else {
  //           this.timeMatchValidationForEndTime = true;
  //           this.greaterTimeValidationForEndTime = false;
  //           this.assignmentForm.patchValue({
  //             endTime: null,
  //           });
  //         }
  //       }
  //       else {
  //         this.timeMatchValidationForEndTime = true;
  //         this.greaterTimeValidationForEndTime = false;
  //         this.assignmentForm.patchValue({
  //           endTime: null,
  //         });
  //       }
  //     } else {
  //       this.greaterTimeValidationForEndTime = true;
  //       this.timeMatchValidationForEndTime = false;
  //       this.assignmentForm.patchValue({
  //         endTime: null,
  //         startTime: null,
  //       });
  //     }
  //   } else {
  //     if (slotEndTime >= classStartTime && slotEndTime <= classEndTime) {
  //       if (slotEndTime >= teacherStartTime && slotEndTime <= teacherEndTime) {
  //         this.timeMatchValidationForEndTime = false;
  //         this.greaterTimeValidationForEndTime = false;

  //         const isOverlapping = uniqueAssignments.some((assignment: any) =>
  //           assignment.dayId === this.selectedSlot.dayId &&
  //           assignment.teacherID === this.selectedSlot.userId &&
  //           assignment.classStartTime <= slotStartTime && assignment.classEndTime >= slotStartTime
  //         );

  //         if (isOverlapping) {
  //           this.slotCreatedForSomeOtherClassforEndTime = true;
  //           this.greaterTimeValidationForEndTime = false;
  //           this.timeMatchValidationForEndTime = false;
  //           this.assignmentForm.patchValue({
  //             endTime: null,
  //           });
  //         }
  //         else {
  //           this.slotCreatedForSomeOtherClassforEndTime = false;
  //           this.greaterTimeValidationForEndTime = false;
  //           this.timeMatchValidationForEndTime = false;
  //         }

  //       } else {
  //         // $('#endTime').val(null);
  //         this.greaterTimeValidationForEndTime = false;
  //         this.timeMatchValidationForEndTime = true;
  //         this.assignmentForm.patchValue({
  //           endTime: null,
  //         });
  //       }
  //     } else {
  //       // $('#endTime').val(null);
  //       this.greaterTimeValidationForEndTime = false;
  //       this.timeMatchValidationForEndTime = true;
  //       this.assignmentForm.patchValue({
  //         endTime: null,
  //       });
  //     }
  //   }
  // }

  ApplyValidationForEndTime() {
    let slotStartTime = this.assignmentForm.value.startTime
      ? this.assignmentForm.value.startTime + ':00'
      : this.assignmentForm.value.startTime;

    let slotEndTime = this.assignmentForm.value.endTime
      ? this.assignmentForm.value.endTime + ':00'
      : this.assignmentForm.value.endTime;

    const classSlot = this.classDaysSlot.find(
      (item: any) => item.dayID == this.selectedSlot.dayId
    );
    const classStartTime = classSlot?.startTime;
    const classEndTime = classSlot?.endTime;

    const teacher = this.teachersData.find(
      (item: any) => item.teacherID == this.selectedSlot.userId
    );
    const teacherAvailability = teacher?.teacherAvailability.find(
      (item: any) => item.dayID == this.selectedSlot.dayId
    );
    const teacherStartTime = teacherAvailability?.startTime;
    const teacherEndTime = teacherAvailability?.endTime;

    const teacherAssignments =
      teacher?.teacherAssignmentList.filter(
        (x: any) =>
          x.teacherID == this.selectedSlot.userId &&
          x.dayId == this.selectedSlot.dayId
      ) || [];

    const uniqueAssignments = teacherAssignments.filter(
      (assignment: any, index: number, self: any[]) =>
        index ===
        self.findIndex(
          (a) =>
            a.classStartTime === assignment.classStartTime &&
            a.classEndTime === assignment.classEndTime &&
            a.assignmentID !== this.selectedSlot.assignmentID // allow editing same assignment
        )
    );

    // Ensure we have valid times
    if (slotStartTime && slotEndTime) {
      if (slotStartTime >= slotEndTime) {
        this.greaterTimeValidationForEndTime = true;
        this.timeMatchValidationForEndTime = false;
        this.assignmentForm.patchValue({ startTime: null, endTime: null });
        return;
      }

      // Check if within class slot and teacher availability
      if (
        slotEndTime >= classStartTime &&
        slotEndTime <= classEndTime &&
        slotEndTime >= teacherStartTime &&
        slotEndTime <= teacherEndTime
      ) {
        this.timeMatchValidationForEndTime = false;
        this.greaterTimeValidationForEndTime = false;

        const isOverlapping = uniqueAssignments.some(
          (assignment: any) =>
            assignment.dayId === this.selectedSlot.dayId &&
            assignment.teacherID === this.selectedSlot.userId &&
            assignment.classStartTime <= slotStartTime &&
            assignment.classEndTime >= slotStartTime
        );

        if (isOverlapping) {
          this.slotCreatedForSomeOtherClassforEndTime = true;
          this.assignmentForm.patchValue({ endTime: null });
        } else {
          this.slotCreatedForSomeOtherClassforEndTime = false;
        }
      } else {
        // Outside availability or class time
        this.timeMatchValidationForEndTime = true;
        this.greaterTimeValidationForEndTime = false;
        this.assignmentForm.patchValue({ endTime: null });
      }
    } else if (slotEndTime) {
      // When only endTime is filled and startTime is null
      if (
        slotEndTime >= classStartTime &&
        slotEndTime <= classEndTime &&
        slotEndTime >= teacherStartTime &&
        slotEndTime <= teacherEndTime
      ) {
        this.timeMatchValidationForEndTime = false;
        this.greaterTimeValidationForEndTime = false;

        const isOverlapping = uniqueAssignments.some(
          (assignment: any) =>
            assignment.dayId === this.selectedSlot.dayId &&
            assignment.teacherID === this.selectedSlot.userId &&
            assignment.classStartTime <= slotEndTime &&
            assignment.classEndTime >= slotEndTime
        );

        if (isOverlapping) {
          this.slotCreatedForSomeOtherClassforEndTime = true;
          this.assignmentForm.patchValue({ endTime: null });
        } else {
          this.slotCreatedForSomeOtherClassforEndTime = false;
        }
      } else {
        this.greaterTimeValidationForEndTime = false;
        this.timeMatchValidationForEndTime = true;
        this.assignmentForm.patchValue({ endTime: null });
      }
    }
  }

  onEditAssignment() {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }
    this.spinner.show();
    const timeSlot = this.selectedTimeSlot;
    const scheduleType = this.selectedScheduleType;

    var obj = {
      userId: this.assignmentForm.value.selectedTimeSlot.userId,
      classID: this.assignmentForm.value.selectedTimeSlot.classID,
      className: this.assignmentForm.value.selectedTimeSlot.className,
      dayId: this.assignmentForm.value.selectedTimeSlot.dayId,
      isRepeated: this.assignmentForm.value.selectedTimeSlot.isRepeated,
      userRole: this.assignmentForm.value.selectedTimeSlot.userRole,
      oldstartTime: this.assignmentForm.value.selectedTimeSlot.startTime,
      oldendTime: this.assignmentForm.value.selectedTimeSlot.endTime,
      newstartTime: this.assignmentForm.value.startTime,
      newendTime: this.assignmentForm.value.endTime,
      newstartDate: this.assignmentForm.value.startDate,
      newendDate: this.assignmentForm.value.endDate,
      selectedScheduleType: this.assignmentForm.value.selectedScheduleType,
      slotId: this.assignmentForm.value.selectedTimeSlot.slotId,
    };

    this.schedulerService.editAssignment(obj).subscribe({
      next: (res) => {
        if (res.message == 'ok') {
          this.spinner.hide();
          this.toastr.success(res.activity);
          $('#assignmentEditModal').modal('hide');
          this.resetForm();
          this.getStaffList();
          this.getStudentList();
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Edit Failed:', err);
        // show error toast
      },
    });
  }

  resetForm(): void {
    this.assignmentForm.reset({
      selectedTimeSlot: null,
      selectedScheduleType: null,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    });

    this.showEndDate = false;
    this.patchedEndDate = '';
    this.selectedSlot = null;
    this.matchedDays = [];
    this.filterClassData = [];
    this.classID = [];
    this.classDaysSlot = [];

    this.assignmentForm.get('endDate')?.setValidators([Validators.required]);

    this.greaterTimeValidationForStartTime = false;
    this.greaterTimeValidationForEndTime = false;
    this.timeMatchValidationForStartTime = false;
    this.timeMatchValidationForEndTime = false;
    this.slotCreatedForSomeOtherClass = false;
    this.slotCreatedForSomeOtherClassforEndTime = false;

    // Optional: reset flatpickr values if you're using flatpickr
    if (this.startDateInstance) {
      this.startDateInstance.clear();
    }
    if (this.endDateInstance) {
      this.endDateInstance.clear();
    }
  }

  proceededOnBoarding() {
    this.spinner.show();
    this.commonService
      .manageDaycareOnBoarding(this.centreID, 'manageDaycareClassAssignment')
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            if (!this.onBoardingService.onBoardingData.isCompleteStep6) {
              this.onBoardingService.onBoardingData.isCompleteStep6 = true;
              this.onBoardingService.handleNext('Tab-6');
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

  // Added on 24/06/25 Arsh
  handleBulkAssignmentSuccess(): void {
    this.getStaffList();
  }
}

// function introJs(): any {
//   throw new Error('Function not implemented.');
// }
