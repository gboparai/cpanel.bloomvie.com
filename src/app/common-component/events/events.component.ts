
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { DayCareDashboardService } from '../../day-care-management/daycare-dashboard/day-care-dashboard.service';
import { CommonService } from '../common.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { DatePipe, formatDate } from '@angular/common';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';

import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { ViewStudentEnrollmentService } from '../../day-care-management/student-management/view-student-enrollment/view-student-enrollment.service';

declare var $: any;



@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    FullCalendarModule,
    BreadcrumbComponent,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    CommonModule,
  ],
  providers: [DatePipe],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent {
  EventList: any;
  EventUpdateDate: any;
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  calendarOptions: any;
  selectedDate: any;
  eventForm: any;
  IsEdit: boolean = false;
  DayCareId: any;
  userRoleID: any;
  UserID: any;
  selectedFileDocument: File | null = null;
  isOpen = false;
  selectedLabel = 'Select One';
  selectedValue: string = '';
  onSelectColor: any

  @Input() options: { value: string, label: string }[] = [];
  @Output() selectedColor = new EventEmitter<string>();

  colorOptions = [
    // { value: '#ffffff', label: 'White' },
    { value: '#2ecc71', label: 'Green' },
    { value: '#3498db', label: 'Blue' },
    { value: '#9b59b6', label: 'Purple' },
    { value: '#34495e', label: 'Dark Blue' },
    { value: '#1abc9c', label: 'Turquoice' },
    { value: '#e74c3c', label: 'Red' },
    { value: '#7f8c8d', label: 'Grey' },
    { value: '#f1c40f', label: 'Yellow' },
    { value: '#e67e22', label: 'Orange' },
    { value: '#000000', label: 'Black' },
  ];
  eventList: any;
  Students: any;
  studentBirthday: any;
  studentID: any;

  todaySelectedDate: any


  constructor(private service: CommonService, private spinner: NgxSpinnerService,
    private fb: FormBuilder, private viewStudent: ViewStudentEnrollmentService, private Toaster: ToastrService, private cookie: CookieService) {

    this.eventForm = this.fb.group({
      id: 0,
      eventName: ['', [Validators.required]],
      centerId: 0,
      eventDescription: ['', [Validators.required]],
      eventImageName: '',
      eventImagePath: '',
      colorLable: ['', [Validators.required]],
      eventDate: '',
      isActive: true,
      //  eventTypeID: [0,[Validators.required]],
      eventTypeID: [null, [Validators.required]],

      loginUserId: 0,
    });
  }



  ngOnInit(): void {
    // 


    const today = new Date();
    this.todaySelectedDate = formatDate(today, 'MM-dd-yyyy', 'en-US');

    this.DayCareId = this.cookie.get('CentreID');
    this.userRoleID = this.cookie.get('UserRoleId');
    this.UserID = this.cookie.get('UserId');
    this.studentID = this.cookie.get('StudentID');




    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin], // Include interactionPlugin if needed
      initialView: 'dayGridMonth',
      weekends: false,
      responsive: true,
      // events: [{ title: 'Meeting', start: new Date() }],
      dateClick: this.handleDateClick.bind(this),
    };
    this.getEventsByDayCareId(this.DayCareId);

    this.getMasterEvent();
  }


  // currentDateTime: string = '';
  // private intervalId: any;



  // updateDateTime(): void {
  //   const now = new Date();

  //   const options: Intl.DateTimeFormatOptions = {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     second: '2-digit',
  //     timeZone: 'America/Toronto' 
  //   };
  //   this.currentDateTime = now.toLocaleString('en-CA', options); 



  // }

  // ngOnDestroy(): void {
  //   if (this.intervalId) {
  //     clearInterval(this.intervalId);
  //   }
  // }


  handleDateClick(arg: any) {


    if (this.userRoleID == 5) {

    } else {
      this.selectedDate = arg.dateStr;
      $('#calendarDateModal').modal('show');
    }



  }



  handleEventClick(arg: any) {

    const event = arg.event;

    if (event.extendedProps.isBirthday) {
      Swal.fire({
        title: event.title,
        text: 'This is a birthday reminder. No action needed!',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.userRoleID === "5") {
      Swal.fire({
        title: event.title,
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }


    Swal.fire({
      title: event.title,
      text: 'What do you want to do with this event?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Edit',
      denyButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Edit logic
        this.eventForm.patchValue({
          id: Number(event.id),
          eventName: event.title,
          eventDescription: event.extendedProps.description,
          eventDate: event.startStr,
          eventTypeID: event.extendedProps.eventTypeId,
        });

        this.selectedLabel = event.extendedProps.colorLable;

        this.selectedValue = event.extendedProps.colorLable
        this.isOpen = false;
        this.onSelectColor = event.extendedProps.colorLable;
        this.selectedColor.emit(event.extendedProps.colorLable);
        this.selectedDate = event.startStr;
        this.IsEdit = true;
        $('#calendarDateModal').modal('show');
      } else if (result.isDenied) {
        // Delete logic
        this.deleteEvent(event.id);
      }
    });
  }




  deleteEvent(eventID: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this event!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteEvent(eventID, this.DayCareId).subscribe(
          (res: any) => {
            if (res.message === 'OK') {
              this.Toaster.success(res.activity);
              this.getEventsByDayCareId(this.DayCareId);
            } else {
              this.Toaster.warning(res.message);
            }
          },
          (error) => {
            console.error('Delete error:', error);
          }
        );
      }
    });
  }


  async getMasterEvent() {

    const type = this.userRoleID == 1 ? '' : 'Day Care Admin';

    await this.service.getMasterEvent(this.UserID, this.userRoleID, type).subscribe({
      next: (data) => {
        if (data.message === 'OK') {
          this.eventList = data.result;
        } else {
          console.error('Error:', data.message);
        }
      },
      error: (err) => {
        console.error('HTTP Error:', err);
      }
    });
  }

  async onSubmitEvent() {
    // 
    if (this.eventForm.valid) {
      this.spinner.show();

      this.eventForm.patchValue({
        // eventImageName: '',
        // eventImagePath: '',
        eventDate: this.selectedDate,
        centerId: Number(this.DayCareId),
        loginUserId: Number(this.UserID),
      });

      this.service.manageDaycareCentreEventManagment(
        this.eventForm.value
      ).subscribe(
        (res: any) => {
          if (res.message == 'OK') {
            this.Toaster.success(res.activity);
            $('#calendarDateModal').modal('hide');
            $('#formFile').val('');
            this.resetForm();
            this.getEventsByDayCareId(this.DayCareId);
            this.spinner.hide();

          } else if (res.message == 'update') {
            this.Toaster.success(res.activity);
            $('#calendarDateModal').modal('hide');
            $('#formFile').val('');
            this.resetForm();
            this.getEventsByDayCareId(this.DayCareId);
            this.spinner.hide();
          } else {
            this.Toaster.warning(res.message);
            this.spinner.hide();
          }
        },
        (error) => {
          // Handle error
          console.error('Error:', error);
          // this.toastr.error('Failed to save event!');
        }
      );
    } else {
      this.eventForm.markAllAsTouched();
    }
  }






  async getEventsByDayCareId(DayCareID: any) {

    // this.spinner.show();

    const studentID = this.userRoleID == 5 ? parseInt(this.studentID) : ''

    try {
      await this.service.getEventsByDayCareId(DayCareID, studentID).subscribe(
        (data) => {
          if (data.message === 'OK') {
            this.EventList = data.result.events;
            this.studentBirthday = data.result.studentBirthdays;

            // Format last updated event date
            if (this.EventList && this.EventList.length > 0) {
              const lastEvent = this.EventList[this.EventList.length - 1];
              const dateObj = new Date(lastEvent.eventCreatedDate);
              const formattedDate =
                `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/` +
                `${dateObj.getDate().toString().padStart(2, '0')}/` +
                `${dateObj.getFullYear()} ` +
                `${dateObj.getHours().toString().padStart(2, '0')}:` +
                `${dateObj.getMinutes().toString().padStart(2, '0')}`;
              this.EventUpdateDate = formattedDate;
            }

            // Normal calendar events
            const calendarEvents = this.EventList.map((event: any) => ({
              title: event.eventName,
              start: event.eventDate,
              description: event.eventDescription,
              id: event.eventID,
              imageUrl: this.rootUrl + event.eventImagePath,
              eventTypeId: event.eventTypeId,
              colorLable: event.colorLable
            }));

            const currentYear = new Date().getFullYear();
            const yearsRange = [currentYear - 1, currentYear, currentYear + 1]; // Optional: add more years

            const birthdayEvents: any[] = [];

            this.studentBirthday.forEach((bday: any, index: number) => {
              const month = bday.month.toString().padStart(2, '0');
              const day = bday.day.toString().padStart(2, '0');
              const studentName = `${bday.firstName} ${bday.lastName ? bday.lastName : ''}`;

              yearsRange.forEach((year) => {
                const dateStr = `${year}-${month}-${day}`;

                birthdayEvents.push({
                  title: `🎂   ${studentName}`,
                  start: dateStr,
                  allDay: true,
                  id: `bday-${index}-${year}`,
                  colorLable: '#ffb3b3',
                  isBirthday: true
                });
              });
            });


            const allCalendarEvents = [...calendarEvents, ...birthdayEvents];

            this.calendarOptions = {
              initialView: 'dayGridMonth',
              events: allCalendarEvents,
              eventClick: this.handleEventClick.bind(this),

              eventDidMount: (info: any) => {
                info.el.innerHTML = '';

                const color = info.event.extendedProps.colorLable;
                if (color) {
                  info.el.style.cssText += `
                    background-color: ${color} !important;
                    color: #040000 !important;
                    text-transform: capitalize !important;
                  `;
                }

                const titleText = info.event.title;
                const titleElement = document.createElement('div');

                if (titleText.length > 10) {
                  titleElement.textContent = titleText.substring(0, 10) + '...';
                  titleElement.title = titleText;
                } else {
                  titleElement.textContent = titleText;
                }



                titleElement.style.whiteSpace = 'nowrap';
                titleElement.style.overflow = 'hidden';
                titleElement.style.textOverflow = 'ellipsis';
                titleElement.style.maxWidth = '100px';

                info.el.appendChild(titleElement);
              }
            };

          } else {
            console.error('No records found');
          }

          this.spinner.hide();
        },
        (error) => {
          console.error('Failed to fetch events:', error);
          this.spinner.hide();
        }
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      this.spinner.hide();
    }
  }

  onColorSelected(color: string) {

  }

  toggleDropdown(): void {
    // 
    this.isOpen = !this.isOpen;
  }

  selectColor(option: { value: string, label: string }): void {
    // 
    this.onSelectColor = option.value

    this.eventForm.patchValue({
      colorLable: this.onSelectColor
    })

    this.selectedLabel = option.label;
    this.selectedValue = option.value;
    this.isOpen = false;
    this.selectedColor.emit(option.value);
  }


  resetForm() {
    this.eventForm.reset({
      id: 0,
      eventName: '',
      centerId: 0,
      eventDescription: '',
      eventImageName: '',
      eventImagePath: '',
      eventDate: '',
      colorLable: '',
      isActive: true,
      eventTypeID: null,
    });

    this.selectedFileDocument = null;

    const fileInputDocument = document.getElementById('formFileDocument') as HTMLInputElement;
    if (fileInputDocument) fileInputDocument.value = '';

    this.IsEdit = false;

    this.selectedLabel = 'Select One';
    this.selectedValue = '';
    this.onSelectColor = null;
  }





}
