import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxSpinnerService } from 'ngx-spinner';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import flatpickr from 'flatpickr';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { DcAppointmentsListComponent } from '../dc-appointments-list/dc-appointments-list.component';
import { DaycareAppointmentsService } from './daycare-appointments.service';
import { DaycareAppointmentsSlotComponent } from '../daycare-appointments-slot/daycare-appointments-slot.component';
import { CommonService } from '../../common-component/common.service';
import { effect } from '@angular/core';
import { TimeFormatAmPmPipe } from '../dc-appointments-list/time-format.pipe';
@Component({
  selector: 'app-daycare-appointments',
  standalone: true,
  imports: [
    RouterLink,
    BreadcrumbComponent,
    DcAppointmentsListComponent,
    DaycareAppointmentsSlotComponent,
    FullCalendarModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TimeFormatAmPmPipe,
  ],
  providers: [DatePipe],
  templateUrl: './daycare-appointments.component.html',
  styleUrls: ['./daycare-appointments.component.css'],
})
export class DaycareAppointmentsComponent implements OnInit, AfterViewInit {
  calendarOptions: any;
  SlotForm: any;
  RoleID: any;
  CurrentDate: any;
  slotDate: any;
  // slotDate: { counsellorCount: number; }[] = [];
  AvailableDate: any;
  Available: any;
  formattedTime: any;
  UserID: any;
  userTimeZone: string = '';
  // userOffset: string = '';

  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private service: DaycareAppointmentsService,
    private datePipe: DatePipe,
    private coomonService: CommonService,
    private toastr: ToastrService,
    private cookie: CookieService
  ) {
    this.SlotForm = fb.group(
      {
        id: [0],
        dateRange: ['', Validators.required],
        startDate: [null, Validators.required],
        endDate: [null, Validators.required],
        startTime: [null, Validators.required],
        endTime: ['', Validators.required],
        duration: [null, Validators.required],
        createdBy: [0],
        // userOffset: [''],
        regionData: [null],
      },
      { validators: this.timeValidator }
    );
    effect(() => {
      let region = this.coomonService.regionResponseSignal();
      if (region.offsetString != "") {
        this.getSlotDate();
      }
    })
  }

  ngOnInit(): void {
    // this.calendarOptions = {
    //   plugins: [dayGridPlugin, interactionPlugin], // Include interactionPlugin if needed
    //   initialView: 'dayGridMonth',
    //   weekends: false,
    //   responsive: true,
    //   events: [
    //     { title: 'Meeting', start: new Date() }
    //   ]
    // };
    const UserInfo = this.cookie.get('UserInfo');
    const parsedInfo = JSON.parse(UserInfo);
    this.RoleID = parsedInfo.result.userRoleID;
    this.UserID = parsedInfo.result.id;

    this.userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // this.userOffset = this.getGMTOffsetString();

    this.setDefaultTimes();
    // this.getSlotDate();
  }

  ngAfterViewInit(): void {
    // Initialize Flatpickr
    this.initDateRangePicker();
  }

  //   initDateRangePicker() {
  //     const self = this;

  //     flatpickr("#dateRangePicker", {
  //         mode: "range", // Enables range selection
  //         dateFormat: "d/m/Y", // Date format
  //         allowInput: true, // Allow manual input if needed
  //         onClose(selectedDates) {
  //             if (selectedDates.length === 2) {
  //                 // Two dates selected (range)
  //                 const startDate = selectedDates[0];
  //                 const endDate = selectedDates[1];

  //                 // Patch the form with start and end dates
  //                 self.SlotForm.patchValue({
  //                     startDate:self.datePipe.transform(startDate,'yyyy-MM-dd'),
  //                     endDate: self.datePipe.transform(endDate,'yyyy-MM-dd'),
  //                 });

  //             }else {
  //                 // Handle cases where no date is selected if needed
  //                 self.SlotForm.patchValue({
  //                     startDate: null,
  //                     endDate: null,
  //                     dateRange: ""
  //                 });
  //             }
  //         },
  //         locale: {
  //             firstDayOfWeek: 1 // Start week on Monday
  //         }
  //     });
  // }

  getGMTOffsetString(): string {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();

    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const localDate = new Date(
      now.toLocaleString('en-US', { timeZone: userTimeZone })
    );

    const offsetInMinutes = (localDate.getTime() - utcDate.getTime()) / 60000;

    // Convert to ±HH:mm format
    const sign = offsetInMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetInMinutes);
    const hours = Math.floor(absMinutes / 60)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor(absMinutes % 60)
      .toString()
      .padStart(2, '0');

    const offsetFormatted = `${sign}${hours}:${minutes}`;
    return offsetFormatted;
  }

  timeValidator(group: AbstractControl) {
    const startTimeControl = group.get('startTime');
    const endTimeControl = group.get('endTime');

    if (startTimeControl && endTimeControl) {
      const startTime = startTimeControl.value;
      const endTime = endTimeControl.value;

      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);

        if (end <= start) {
          endTimeControl.setValue('');
          return { invalidTime: true };
        }
      }
    }
    return null;
  }

  initDateRangePicker() {
    const self = this;
    const currentDate = new Date(); // Get the current date

    flatpickr('#dateRangePicker', {
      mode: 'range', // Enables range selection
      dateFormat: 'd/m/Y', // Date format
      allowInput: true, // Allow manual input if needed
      minDate: currentDate, // Disable past dates
      onClose(selectedDates) {
        if (selectedDates.length === 2) {
          const startDate = selectedDates[0];
          const endDate = selectedDates[1];
          self.SlotForm.patchValue({
            startDate: self.datePipe.transform(startDate, 'yyyy-MM-dd'),
            endDate: self.datePipe.transform(endDate, 'yyyy-MM-dd'),
          });

        } else {
          self.SlotForm.patchValue({
            startDate: null,
            endDate: null,
            dateRange: '',
          });
        }
      },
      locale: {
        firstDayOfWeek: 1, // Start week on Monday
      },
    });
  }

  SlotSubmit() {
    if (this.SlotForm.valid) {
      this.spinner.show();
      const [startDateStr, endDateStr] =
        this.SlotForm.value.dateRange.split('to');
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // Validate date range
      if (endDate < startDate) {
        console.error(
          'End date must be greater than or equal to the start date.'
        );
        return;
      }

      const region: any = this.coomonService.regionResponseSignal();

      const startTimeFormatted = `${this.SlotForm.value.startTime}:00`;
      const endTimeFormatted = `${this.SlotForm.value.endTime}:00`;
      this.SlotForm.patchValue({
        id: 0,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        createdBy: this.UserID,
        regionData: {
          regionHours: region.offsetHours,
          regionMinutes: region.offsetMinutes,
          regionOffset: region.offsetString,
        },
        // userOffset: this.userOffset,
        // regionID: region,
      });
      this.service.manageSlots(this.SlotForm.value).subscribe((data) => {
        if (data.message == 'ok') {
          this.spinner.hide();
          const Slotdata = data.result;
          this.getSlotDate();
          this.SlotForm.reset();
          this.toastr.success('Slots Create Successfully');
        } else {
          this.spinner.hide();
        }
      });
    } else {
      this.SlotForm.markAllAsTouched();
    }
  }

  setDefaultTimes() {
    this.SlotForm.patchValue({
      startTime: '08:00', // 8 AM
      endTime: '17:00', // 5 PM
    });
  }

  get hasBookedSlots(): boolean {
    if (this.slotDate != null) {
      return this.slotDate.some(
        (item: { counsellorCount: number }) => item.counsellorCount === 0
      );
    }
    return false;
  }

  getSlotDate() {
    //const currentDate = new Date(); // Get the current date and time
    //const formattedDate = currentDate.toISOString().split('T')[0];
    //this.formattedTime = currentDate.toTimeString().split(' ')[0];

    //Added on 06/05/25
    // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // const now = new Date();
    const localDate = new Date();
    const region: any = this.coomonService.regionResponseSignal();

    this.formattedTime = localDate.toTimeString().split(' ')[0];

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    this.service
      .getSlotTime(formattedDate, region.offsetHours, region.offsetMinutes)
      .subscribe((data) => {
        this.slotDate = data.result;
        // this.Available =    this.slotDate.filter((slot:any) => {
        //   const slotStartTime = slot.slotStartTime;

        //   return slotStartTime > formattedTime;
        // })

        // 👇 Call your common getUtcTime() method and pass the slotDate (or data.result)
        this.coomonService.getUtcTime(this.slotDate);

      });
  }

  formatTime(time: string): string {
    const timeParts = time.split(':');

    return `${timeParts[0]}:${timeParts[1]}`;
  }

  get SlotFormControls() {
    return this.SlotForm.controls;
  }
}
