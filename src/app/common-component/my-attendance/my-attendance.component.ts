import { ChangeDetectorRef, Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import flatpickr from 'flatpickr';
import { MyAttendanceService } from './my-attendance.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import mapboxgl from 'mapbox-gl';
import { point } from '@turf/helpers';
import { environment } from '../../../environments/environment';
import { ClassroomDetailsService } from '../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
declare var $: any;

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    FullCalendarModule,
    NgIf,
    NgFor,
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    SkeletonLoaderComponent,
  ],
  providers: [DatePipe],
  templateUrl: './my-attendance.component.html',
  styleUrls: ['./my-attendance.component.css'],
})
export class MyAttendanceComponent {
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  ContentP: number = 1;
  Contentsize: number = 5;
  calendarOptions: any;
  userID: string | undefined;
  attendanceList: any;
  StartDate: string | null = null;
  EndDate: string | null = null;
  startDateInstance: any;
  endDateInstance: any;
  selectedStartDate: any = null;
  selectedEndDate: any = null;
  attendanceCount: any;
  holidayList: any;
  centreID: any;
  upcomingHolidayCount: any;
  IsnotLatandLong: boolean = false;
  inFullPath: string | undefined;
  outFullPath: string | undefined;

  marker: any;
  map: any;
  userRoleID: string | undefined;
  studentID: string | undefined;
  fullName: string | undefined;
  today!: Date;
  TodayAttendanceStatus: boolean = false;
  teacherAvailabilityDays: any;
  IsAbleToday: boolean = true;
  skeletonShow = 'Skelton';
  skalatonShowCard = 'skalatonShowCard';
  fullNameShow = 'fullNameShow';


  constructor(
    private service: MyAttendanceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private cookieService: CookieService,
    private cdRef: ChangeDetectorRef,
    private classroomDetailsService: ClassroomDetailsService
  ) { }

  ngOnInit(): void {
    this.today = new Date();
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin], // Include interactionPlugin if needed
      initialView: 'dayGridMonth',
      weekends: false,
      responsive: true,
      events: [{ title: 'Meeting', start: new Date() }],
    };

    this.userID = this.cookieService.get('UserId');
    this.centreID = this.cookieService.get('CentreID');
    this.userRoleID = this.cookieService.get('UserRoleId') || this.cookieService.get('userRoleID');
    this.studentID = this.cookieService.get('StudentID');

    if (this.userRoleID != '4' && this.userRoleID != '8') {
      this.getStudentDetailByStudentId();
    } else {
      const UserInfo = this.cookieService.get('UserInfo');
      if (UserInfo) {
        const parsedInfo = JSON.parse(UserInfo);
        const firstName = parsedInfo.result.firstName;
        const MiddleName = parsedInfo.result.middleName;
        const lastName = parsedInfo.result.lastName;
        this.fullName =
          firstName +
          (MiddleName ? ' ' + MiddleName : '') +
          (lastName ? ' ' + lastName : '');

        if (this.fullName) {
          this.fullNameShow = '';
        }
      }
    }

    if (this.userID != null) {
      this.userRoleID != '5' && this.getteacherAvailability();
      this.checkTodayAttandanceStatusById();
      this.getCurrentMonthAttendanceSummaryByID();
      this.getDaycareSeasonalHolidayList();
      this.getMyAttendanceByID();
    }
  }

  ngAfterViewInit() {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    this.startDateInstance = flatpickr('#startdatePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      defaultDate: oneWeekAgo,
      onChange: (selectedDates: any) => {
        this.selectedStartDate = selectedDates[0];
      },
    });

    this.endDateInstance = flatpickr('#enddatePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      defaultDate: today,
      onChange: (selectedDates: any) => {
        this.selectedEndDate = selectedDates[0];
      },
    });

    this.selectedStartDate = oneWeekAgo;
    this.selectedEndDate = today;
  }

  getStudentDetailByStudentId() {
    this.skeletonShow = 'Skelton';
    this.service
      .getStudentDetailByStudentId(Number(this.studentID))
      .subscribe((data) => {
        if (data.message == 'OK') {
          this.fullName =
            data.result.studentFirstName +
            (data.result.studentLastName != null
              ? data.result.studentLastName
              : '');

          if (this.fullName) {
            this.fullNameShow = '';
          }

          this.skeletonShow = '';
        } else {
          this.skeletonShow = '';
        }
      });
  }

  getteacherAvailability() {
    this.classroomDetailsService.getTeacherAvailability(Number(this.userID), this.centreID).subscribe((data) => {
      if ((data.message = 'Ok')) {
        this.teacherAvailabilityDays = data.result;
        this.getActivityDate();
      } else {
        this.teacherAvailabilityDays = [];
      }
    });
  }

  getActivityDate() {
    const date = new Date();
    const jsDay = date.getDay();
    const dayId = jsDay === 0 ? 7 : jsDay;
    if (!this.teacherAvailabilityDays.includes(dayId)) {
      // this.toastr.warning('Selected day is not available for the teacher.');
      this.IsAbleToday = false;
    } else {
      this.IsAbleToday = true;
    }
  }

  checkTodayAttandanceStatusById() {
    var userId;
    var centreId;
    if (this.userRoleID != '5') {
      userId = this.userID;
      centreId = this.centreID;
    }
    else {
      userId = this.studentID;
      centreId = 0;
    }

    this.service.checkTodayAttandanceStatusById(Number(userId), Number(this.userRoleID), Number(centreId)).subscribe((data) => {
      if (data.message == 'ok') {
        this.TodayAttendanceStatus = data.result;
        this.cdRef.detectChanges();
      } else {
        this.TodayAttendanceStatus = false;
      }
    });
  }

  getCurrentMonthAttendanceSummaryByID() {
    this.skeletonShow = 'Skelton';
    this.skalatonShowCard = 'skalatonShowCard';

    var userId;
    var centreID;
    if (this.userRoleID != '5') {
      userId = this.userID;
      centreID = this.centreID
    }
    else {
      userId = this.studentID;
      centreID = 0;
    }

    this.service.getCurrentMonthAttendanceSummaryByID(Number(userId), Number(this.userRoleID), Number(centreID)).subscribe((response) => {
      if (response.message === 'Success') {
        this.attendanceCount = response.result;
        // this.spinner.hide();
        this.skeletonShow = '';
        this.skalatonShowCard = '';
      } else {
        this.attendanceCount = [];
        // this.spinner.hide();
        this.skeletonShow = '';
        this.skalatonShowCard = '';
      }
    });
  }

  getDaycareSeasonalHolidayList() {
    this.skeletonShow = 'Skelton';

    this.service
      .getDaycareSeasonalHolidayList(Number(this.centreID))
      .subscribe((response) => {
        if (response.message === 'Success') {
          this.holidayList = response.result;
          const today = new Date();
          const upcomingHolidays = this.holidayList.filter((holiday: any) => {
            return new Date(holiday.startDate) > today;
          });

          this.upcomingHolidayCount = upcomingHolidays.length;
          this.skeletonShow = '';
          // this.spinner.hide();
        }
        this.skeletonShow = '';

        // this.spinner.hide();
      });
  }

  filterAttendance() {
    this.getMyAttendanceByID();
  }

  resetFilter() {
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    if (this.startDateInstance) {
      this.startDateInstance.clear();
    }
    if (this.endDateInstance) {
      this.endDateInstance.clear();
    }
    this.getMyAttendanceByID();
  }

  getMyAttendanceByID() {
    // this.spinner.show();
    var userId;
    var centreID;
    if (this.userRoleID != '5') {
      userId = this.userID;
      centreID = this.centreID;
    } else {
      userId = this.studentID;
      centreID = 0;
    }

    const startDate = this.selectedStartDate
      ? this.formatDate(this.selectedStartDate)
      : '';
    const endDate = this.selectedEndDate
      ? this.formatDate(this.selectedEndDate)
      : '';
    this.service.getMyAttendanceByID(Number(userId), startDate, endDate, Number(this.userRoleID), Number(centreID)).subscribe((response) => {
      if (response.message === 'ok') {
        this.attendanceList = response.result;
        this.spinner.hide();
      } else {
        this.attendanceList = [];
        // this.spinner.hide();
      }
    });
  }

  formatDate(date: Date): string {
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    const yyyy = date.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  async viewDetail(InimagePath: string, OutimagePath: string) {
    this.inFullPath = InimagePath;
    this.outFullPath = OutimagePath;
  }

  openMapPopup(lng: number, lat: number): void {
    this.IsnotLatandLong = false;
    this.spinner.show();

    if (lng != null && lat != null) {
      setTimeout(() => {
        this.initMap(lng, lat);
        $('#mapPopup').modal('show');
      }, 100);
    } else {
      this.IsnotLatandLong = true;
      $('#mapPopup').modal('show');
      this.spinner.hide();
    }
  }

  initMap(lng: number, lat: number) {
    this.spinner.show();
    this.IsnotLatandLong = false;
    $('#mapPopup').modal('show');
    if (lng != null && lat != null) {
      setTimeout(() => { }, 100);

      $('.mapboxgl-control-container').remove();
      $('.mapboxgl-canvas-container').remove();
      //  $("#mapPopup").modal("show");
      mapboxgl.accessToken =
        'pk.eyJ1Ijoiam9obmRvZTM1MzkiLCJhIjoiY2xpazVndG9qMGYzeTNycXEyeXRjeG5ueiJ9.YyD4EW5KIxKIMwTfa57hEw';
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lat, lng], // Default center, will be updated with the provided coordinates
        zoom: 12,
      });
      this.marker = new mapboxgl.Marker({ draggable: true })
        .setLngLat([lat, lng]) // Default marker coordinates
        .addTo(this.map);
      this.marker.on('dragend', () => {
        const lngLat = this.marker.getLngLat();
        this.reverseGeocode(lngLat.lng, lngLat.lat)
          .then((locationName: string) => { })
          .catch((error: any) => {
            console.error('Error:', error);
          });
      });
      const pointFeature = point([lat, lng]);
      // Add the point as a source on the map
      map.on('load', () => {
        map.addSource('point', {
          type: 'geojson',
          data: pointFeature,
        });
        // Add a layer to display the point
        map.addLayer({
          id: 'point',
          type: 'circle',
          source: 'point',
          paint: {
            'circle-radius': 8,
            'circle-color': '#FF0000',
          },
        });
      });
      this.spinner.hide();
    } else {
      this.IsnotLatandLong = true;
      this.spinner.hide();
    }
  }

  private reverseGeocode(lng: number, lat: number): Promise<string> {
    return new Promise((resolve, reject) => {
      mapboxgl.accessToken =
        'pk.eyJ1Ijoiam9obmRvZTM1MzkiLCJhIjoiY2xpazVndG9qMGYzeTNycXEyeXRjeG5ueiJ9.YyD4EW5KIxKIMwTfa57hEw';
      const geocoderUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`;
      fetch(geocoderUrl)
        .then((response) => response.json())
        .then((data) => {
          const locationName = data.features[0].place_name;
          resolve(locationName);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
