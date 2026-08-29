import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AttendanceDashboardService } from './attendance-dashboard.service';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import mapboxgl from 'mapbox-gl';
import { point } from '@turf/helpers';
import flatpickr from 'flatpickr';
import { ChartComponent } from 'ng-apexcharts';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
} from 'ng-apexcharts';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ManageStaffService } from '../../day-care-management/staff-management/add-staff/manage-staff.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApplyleaveService } from '../apply-leave/applyleave.service';
import { Router } from '@angular/router';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { TimeFormatAmPmPipe } from '../../bloomvie-management/dc-appointments-list/time-format.pipe';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
declare var $: any;

export type ApexPieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
};

@Component({
  standalone: true,
  imports: [
    BreadcrumbComponent,
    FullCalendarModule,
    TimeFormatAmPmPipe,
    NgIf,
    NgFor,
    CommonModule,
    ChartComponent,
    NgxPaginationModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    SkeletonLoaderComponent,
  ],
  selector: 'app-attendance-dashboard',
  providers: [DatePipe],
  templateUrl: './attendance-dashboard.component.html',
  styleUrls: ['./attendance-dashboard.component.css'],
})
export class AttendanceDashboardComponent implements OnInit, AfterViewInit {
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  ContentP: number = 1;
  Contentsize: number = 5;
  calendarOptions: any;
  userID: string | undefined;
  attendanceList: any;
  StartDate: string | null = null;
  EndDate: string | null = null;

  public chartOptions: ApexPieChartOptions;
  centreID: any | undefined;
  attendanceCount: any;
  fullName: string | undefined;
  inFullPath: string | undefined;
  outFullPath: string | undefined;
  marker: any;
  map: any;
  IsnotLatandLong: boolean = false;
  userRoleID: any | undefined;
  CentreName: any;
  AllClassList: any;
  selectedClassId: any;
  selectedClassID: number | null = null;
  selectedClassName: any;

  startDateInstance: any;
  endDateInstance: any;
  selectedStartDate: any = null;
  selectedEndDate: any = null;
  formattedStartDate: any;
  formattedEndDate: any;
  leaveList: any;
  skeletonShow = 'Skelton';
  isChartVisible: boolean = false;
  constructor(
    private service: AttendanceDashboardService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private manageStaffSerivece: ManageStaffService,
    private cookieService: CookieService,
    private applyService: ApplyleaveService,
    private router: Router
  ) {
    this.chartOptions = {
      series: [100, 80, 10, 10],
      chart: {
        width: 380,
        type: 'pie',
      },
      // labels: [" Total Staff", " Present", " On Leave", " Absent"],
      // labels: [" Total Staff", " Present"," Absent"],
      labels:
        this.userRoleID != '4' || this.userRoleID != '8'
          ? ['Total Staff', 'Present', 'Absent']
          : ['Total Student', 'Present', 'Absent'],

      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }

  ngOnInit(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      weekends: false,
      responsive: true,
      events: [{ title: 'Meeting', start: new Date() }],
    };

    this.userID = this.cookieService.get('UserId');
    this.centreID = this.cookieService.get('CentreID');

    // setTimeout(() => {
    this.userRoleID = this.cookieService.get('UserRoleId');
    // }, 10);

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
    }

    if (this.centreID != null) {
      this.getDayCareByID();

      if (this.userRoleID != '3') {
        this.getClassListByTeacherID();
      }

      this.initDatePicker(); //Added on 04/08/25
      this.getTodayAttendanceSummaryByCentreID();
      this.getstaffAttendanceByCentreID();
    }
    this.getEmployeeLeave();
  }

  ngAfterViewInit(): void {
    //Commented on 04/08/25
    // const today = new Date();
    // this.startDateInstance = flatpickr('#startdatePicker', {
    //   dateFormat: 'm-d-Y',
    //   allowInput: true,
    //   maxDate: today,
    //   onChange: (selectedDates: Date[]) => {
    //     this.selectedStartDate = selectedDates[0];

    //     if (this.endDateInstance) {
    //       this.endDateInstance.set('minDate', this.selectedStartDate);
    //       this.endDateInstance.set('maxDate', today);
    //     }
    //   },
    // });

    // this.endDateInstance = flatpickr('#enddatePicker', {
    //   dateFormat: 'm-d-Y',
    //   allowInput: true,
    //   maxDate: today,
    //   onChange: (selectedDates: Date[]) => {
    //     this.selectedEndDate = selectedDates[0];
    //   },
    // });
  }


  initDatePicker() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.selectedStartDate = startOfMonth;
    this.selectedEndDate = today;

    this.startDateInstance = flatpickr('#startdatePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      defaultDate: startOfMonth,
      maxDate: today,
      onChange: (selectedDates: Date[]) => {
        this.selectedStartDate = selectedDates[0];
        if (this.endDateInstance) {
          this.endDateInstance.set('minDate', this.selectedStartDate);
          // this.endDateInstance.set('maxDate', today);
        }
      },
    });

    this.endDateInstance = flatpickr('#enddatePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      defaultDate: today,
      minDate: startOfMonth,
      maxDate: today,
      onChange: (selectedDates: Date[]) => {
        this.selectedEndDate = selectedDates[0];
      },
    });
  }


  initDateRangePicker() {
    const self = this;
    flatpickr('#dateRangePicker', {
      mode: 'range',
      dateFormat: 'd/m/Y',
      allowInput: true,
      onClose(selectedDates) {
        if (selectedDates.length === 2) {
          const startDate = selectedDates[0];
          const endDate = selectedDates[1];
          self.StartDate = self.datePipe.transform(startDate, 'yyyy-MM-dd');
          self.EndDate = self.datePipe.transform(endDate, 'yyyy-MM-dd');
        } else {
          self.StartDate = null;
          self.EndDate = null;
        }
      },
      locale: {
        firstDayOfWeek: 1,
      },
    });
  }

  getClassListByTeacherID() {
    this.manageStaffSerivece
      .getClassListByuserRoleID(
        Number(this.userID),
        Number(this.centreID),
        Number(this.userRoleID)
      )
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.AllClassList = response.result;
            // Auto-select first item
            if (this.AllClassList && this.AllClassList.length > 0) {
              this.selectedClassID = this.AllClassList[0].classID;
              this.selectedClassName = this.AllClassList[0].className;
              this.selectedClassId = this.selectedClassID;
              this.selectedClass(this.selectedClassID); // Optionally trigger the function manually
            }
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
        error: (err) => {
          this.spinner.hide();
          // this.toastr.error(err.message);
        },
      });
  }

  selectedClass(event: any) {
    if (event) {
      if (event.classID != null || event.classID !== undefined) {
        this.selectedClassId = event.classID;
        this.selectedClassName = event.className;
      } else {
        this.selectedClassId = event;
      }
    } else {
      this.selectedClassId = 0;
    }
    this.getstaffAttendanceByCentreID();
  }

  // getAttendanceByID() {
  //   this.spinner.show();
  //   const startDate = "";
  //   const endDate = "";

  //   this.service.getAttendanceByID(Number(this.userID), startDate, endDate).subscribe((response) => {
  //     if (response.message === 'ok') {
  //       this.attendanceList = response.result;
  //     }
  //     this.spinner.hide();
  //   }, () => this.spinner.hide());
  // }

  getDayCareByID() {
    this.service.getDayCareByID(this.centreID).subscribe((data) => {
      if (data.message == 'Success') {
        this.CentreName = data.result.centreName;
      } else {
        this.CentreName = [];
      }
    });
  }

  getstaffAttendanceByCentreID() {
    this.skeletonShow = 'Skelton';
    // const startDate = '';
    // const endDate = '';

    const startDate = this.selectedStartDate
      ? this.formatDate(this.selectedStartDate)
      : '';
    const endDate = this.selectedEndDate
      ? this.formatDate(this.selectedEndDate)
      : '';

    var userId;
    if (this.userRoleID != '4' && this.userRoleID != '8') {
      userId = this.centreID;
    } else {
      userId = this.userID;
    }

    const classId = this.selectedClassId != null ? this.selectedClassId : 0;

    this.service
      .getstaffAttendanceByCentreID(
        Number(userId),
        startDate,
        endDate,
        Number(this.userRoleID),
        Number(classId)
      )
      .subscribe(
        (response) => {
          if (response.message === 'ok') {
            this.attendanceList = response.result;
            this.skeletonShow = '';
          } else {
            this.attendanceList = [];
            this.skeletonShow = '';
          }
        },
        () => (this.skeletonShow = '')
      );
  }

  Onsearchclick() {
    // const startDate = this.StartDate;
    // const endDate = this.EndDate;
    this.skeletonShow = 'Skelton';
    const startDate = this.selectedStartDate
      ? this.formatDate(this.selectedStartDate)
      : '';
    const endDate = this.selectedEndDate
      ? this.formatDate(this.selectedEndDate)
      : '';

    var userId;
    if (this.userRoleID != '4' && this.userRoleID != '8') {
      userId = this.centreID;
    } else {
      userId = this.userID;
    }

    const classId = this.selectedClassId != null ? this.selectedClassId : 0;

    this.service
      .getstaffAttendanceByCentreID(
        Number(userId),
        startDate,
        endDate,
        Number(this.userRoleID),
        Number(classId)
      )
      .subscribe(
        (response) => {
          if (response.message === 'ok') {
            this.attendanceList = response.result;
            this.skeletonShow = '';
          } else {
            this.attendanceList = [];
            this.skeletonShow = '';
          }
        },
        () => (this.skeletonShow = '')
      );
  }

  formatDate(date: Date): string {
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    const yyyy = date.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  }

  //Commented on 04/08/25
  // resetfilter() {
  //   // (document.getElementById('dateRangePicker') as HTMLInputElement).value = '';
  //   // this.initDateRangePicker();
  //   this.selectedStartDate = null;
  //   this.selectedEndDate = null;
  //   if (this.startDateInstance) {
  //     this.startDateInstance.clear();
  //   }
  //   if (this.endDateInstance) {
  //     this.endDateInstance.clear();
  //   }

  //   if (this.userRoleID != '3') {
  //     this.getClassListByTeacherID();
  //   }
  //   this.getstaffAttendanceByCentreID();
  // }

  //Added on 04/08/25
  resetfilter() {
    this.initDatePicker();
    if (this.userRoleID != '3') {
      this.getClassListByTeacherID();
    }
    this.getstaffAttendanceByCentreID();
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  //Commented on 01/08/25
  // getTodayAttendanceSummaryByCentreID() {
  //   var userId;
  //   if (this.userRoleID != '4' && this.userRoleID != '8') {
  //     userId = this.centreID;
  //   } else {
  //     userId = this.userID;
  //   }

  //   this.service.getTodayAttendanceSummaryByCentreID(Number(userId),Number(this.userRoleID)).subscribe((response) => {
  //       if (response.message === 'Success') {
  //         this.attendanceCount = response.result;
  //         this.chartOptions = {
  //           series: [
  //             this.attendanceCount.totalStaff || 0,
  //             this.attendanceCount.presentCount || 0,
  //             this.attendanceCount.absentCount || 0,
  //             // this.attendanceCount.leaveCount || 0,
  //           ],
  //           chart: {
  //             width: 380,
  //             type: 'pie',
  //           },
  //           // labels: ["Total Staff", "Present", "On Leave", "Absent"],
  //           labels: 
  //             this.userRoleID != '4' && this.userRoleID != '8'
  //               ? ['Total Staff', 'Present', 'Absent']
  //               : ['Total Student', 'Present', 'Absent'],
  //           responsive: [
  //             {
  //               breakpoint: 480,
  //               options: {
  //                 chart: {
  //                   width: 200,
  //                 },
  //                 legend: {
  //                   position: 'bottom',
  //                 },
  //               },
  //             },
  //           ],
  //         };
  //         this.spinner.hide();
  //       } 
  //       else {
  //         if (this.attendanceCount) {
  //           this.chartOptions = {
  //             series: [
  //               this.attendanceCount.totalStaff || 0,
  //               this.attendanceCount.presentCount || 0,
  //               this.attendanceCount.absentCount || 0,
  //               // this.attendanceCount.leaveCount || 0,
  //             ],
  //             chart: {
  //               width: 380,
  //               type: 'pie',
  //             },
  //             labels:
  //               this.userRoleID != '4' && this.userRoleID != '8'
  //                 ? ['Total Staff', 'Present', 'Absent']
  //                 : ['Total Student', 'Present', 'Absent'],
  //             responsive: [
  //               {
  //                 breakpoint: 480,
  //                 options: {
  //                   chart: {
  //                     width: 200,
  //                   },
  //                   legend: {
  //                     position: 'bottom',
  //                   },
  //                 },
  //               },
  //             ],
  //           };
  //         } else {
  //           // Fallback if attendanceCount is undefined
  //           this.chartOptions = {
  //             series: [100, 80, 10, 10],
  //             chart: {
  //               width: 380,
  //               type: 'pie',
  //             },
  //             labels:
  //               this.userRoleID != '4' && this.userRoleID != '8'
  //                 ? ['Total Staff', 'Present', 'Absent']
  //                 : ['Total Student', 'Present', 'Absent'],
  //             responsive: [
  //               {
  //                 breakpoint: 480,
  //                 options: {
  //                   chart: {
  //                     width: 200,
  //                   },
  //                   legend: {
  //                     position: 'bottom',
  //                   },
  //                 },
  //               },
  //             ],
  //           };
  //         }
  //         this.spinner.hide();
  //       }
  //     });
  // }


  //Added on 01/08/25
  getTodayAttendanceSummaryByCentreID() {
    this.spinner.show();
    let userId = (this.userRoleID != '4' && this.userRoleID != '8') ? this.centreID : this.userID;

    this.service.getTodayAttendanceSummaryByCentreID(Number(userId), Number(this.userRoleID)).subscribe((response) => {
      if (response.message === 'Success') {
        this.attendanceCount = response.result;

        const total = (this.attendanceCount.totalStaff || this.attendanceCount.totalStudent || 0);
        const present = this.attendanceCount.presentCount || 0;
        const absent = this.attendanceCount.absentCount || 0;

        this.isChartVisible = (total > 0 || present > 0 || absent > 0);

        if (this.isChartVisible) {
          this.chartOptions = {
            series: [total, present, absent],
            chart: { width: 380, type: 'pie' },
            labels: (this.userRoleID != '4' && this.userRoleID != '8')
              ? ['Total Staff', 'Present', 'Absent']
              : ['Total Student', 'Present', 'Absent'],
            responsive: [{
              breakpoint: 480,
              options: {
                chart: { width: 200 },
                legend: { position: 'bottom' }
              }
            }]
          };
        }

      } else {
        this.isChartVisible = false;
      }

      this.spinner.hide();
    });
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

  // PrintPdfView() {
  //   const doc = new jsPDF();
  //   const img = new Image();
  //   img.src = 'assets/img/logo-new.png';

  //   const dayCareName = this.userRoleID == '3' ? this.CentreName : '';
  //   const attendanceInfoText = this.userRoleID == '3' ? `This report shows the attendance records including In Time, Out Time, and total working hours for all staff. Total records: ${this.attendanceList.length}`
  //   : `This report shows the attendance records for all students. Total records: ${this.attendanceList.length}`;

  //   img.onload = () => {
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     let pageNumber = 0;

  //     const headers = this.userRoleID== '3' ? [['Name', 'Attendance Date', 'Attendance End Date', 'In Time', 'Out Time', 'Working Hours', 'Total Working Hours','Status']]:
  //     [['Name', 'Attendance Date', 'Attendance End Date','Status']];

  //     const formatDate = (dateString: string): string => {
  //       const date = new Date(dateString);
  //       return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  //     };

  //     const formatTime = (time: string): string => {
  //       return time ? time.slice(0, 5) : '';
  //     };

  //     const data = this.attendanceList.map((item: any) => [
  //       item.firstName || '',
  //       item.attendanceDate ? formatDate(item.attendanceDate) : '',
  //       item.endAttendanceDate ? formatDate(item.endAttendanceDate) : '',
  //       formatTime(item.inTime),
  //       formatTime(item.outTime),
  //       item.workingHours?.toString() || '0',
  //       item.totalWorkingHours?.toString() || '0',
  //       item.type == 'Attendance' ? 'Present' : 'Absent'
  //     ]);

  //     autoTable(doc, {
  //       head: headers,
  //       body: data,
  //       startY: 50, // Adjusted to make space for description
  //       styles: { fontSize: 8 },
  //       headStyles: { fillColor: [22, 160, 133] },
  //       didDrawPage: function () {
  //         pageNumber++;

  //         // Logo
  //         doc.addImage(img, 'PNG', 15, 10, 40, 15);

  //         const centerX = pageWidth / 2;

  //         // Header: Day Care Name
  //         doc.setFontSize(12);
  //         doc.setTextColor(40);
  //         // doc.text(dayCareName, 82, 20);
  //         doc.text(dayCareName, centerX, 15, { align: 'center' });

  //         // Subheading: Report Title
  //         doc.setFontSize(11);
  //         doc.setFont('helvetica', 'bold');
  //         // doc.text('Attendance Report', 82, 30);
  //         doc.text('Attendance Report', centerX, 22, { align: 'center' });

  //         // Attendance Info Text
  //         doc.setFontSize(10);
  //         const splitInfo = doc.splitTextToSize(attendanceInfoText, pageWidth - 30);
  //         doc.text(splitInfo, 15, 40); // Position below title

  //         // Page number (bottom right)
  //         doc.setFontSize(9);
  //         doc.text(`Page ${pageNumber}`, pageWidth - 30, pageHeight - 10);
  //       }
  //     });

  //     doc.save('Attendance_Report.pdf');
  //   };
  // }

  // Arsh Added on 08/05/25
  PrintPdfView() {
    const doc = new jsPDF();
    const img = new Image();
    img.src = 'assets/img/logo-new.png';

    const isRole3 = this.userRoleID === '3';
    const dayCareName = isRole3 ? this.CentreName : this.selectedClassName;
    const attendanceInfoText = isRole3
      ? `This report shows the attendance records including In Time, Out Time, and total working hours for all staff. Total records: ${this.attendanceList.length}`
      : `This report shows the attendance records for all students. Total records: ${this.attendanceList.length}`;

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let pageNumber = 0;

      const headers = isRole3
        ? [
          [
            'Name',
            'Attendance Date',
            'Attendance End Date',
            'In Time',
            'Out Time',
            'Working Hours',
            'Total Working Hours',
            'Over Time',
            'Status',
          ],
        ]
        : [['Name', 'Attendance Date', 'Attendance End Date', 'Status']];

      const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      };

      const formatTime = (time: string): string => {
        return time ? time.slice(0, 5) : '';
      };

      const data = this.attendanceList.map((item: any) => {
        const commonFields = [
          item.firstName || '',
          item.attendanceDate ? formatDate(item.attendanceDate) : '',
          item.endAttendanceDate ? formatDate(item.endAttendanceDate) : '',
        ];

        const status = item.type === 'Attendance' ? 'Present' : 'Absent';

        if (isRole3) {
          return [
            ...commonFields,
            formatTime(item.inTime),
            formatTime(item.outTime),
            formatTime(item.workingHours?.toString()) || '0',
            formatTime(item.totalWorkingHours?.toString()) || '0',
            formatTime(item.overTime?.toString()) || '0',
            status,
          ];
        } else {
          return [...commonFields, status];
        }
      });

      autoTable(doc, {
        head: headers,
        body: data,
        margin: { top: 50 },
        // startY: 50,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        didDrawPage: function () {
          pageNumber++;

          // Logo
          doc.addImage(img, 'PNG', 15, 10, 40, 15);

          const centerX = pageWidth / 2;

          // if (isRole3) {
          //   doc.setFontSize(12);
          //   doc.setTextColor(40);
          //   doc.text(dayCareName, centerX, 15, { align: 'center' });
          // }

          doc.setFontSize(12);
          doc.setTextColor(40);
          doc.text(dayCareName, centerX, 15, { align: 'center' });

          // Report Title (always shown)
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Attendance Report', centerX, 22, { align: 'center' });

          // Info Text
          doc.setFontSize(10);
          const splitInfo = doc.splitTextToSize(
            attendanceInfoText,
            pageWidth - 30
          );
          doc.text(splitInfo, 15, 40);

          // Page Number
          doc.setFontSize(9);
          doc.text(`Page ${pageNumber}`, pageWidth - 30, pageHeight - 10);
        },
      });

      doc.save('Attendance_Report.pdf');
    };
  }

  downloadPdf(items: any) {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = 'assets/img/logo-new.png';

    const isRole3 = this.userRoleID === '3';
    const dayCareName = isRole3 ? this.CentreName : this.selectedClassName;

    const normalizedItems = Array.isArray(items) ? items : [items];

    const attendanceInfoText = isRole3
      ? `This report shows the attendance records including In Time, Out Time, and total working hours for all staff. Total records: ${normalizedItems.length}`
      : `This report shows the attendance records for all students. Total records: ${normalizedItems.length}`;

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    const formatTime = (time: string): string => {
      return time ? time.slice(0, 5) : '';
    };

    const loadImage = (url: string): Promise<HTMLImageElement> =>
      new Promise((resolve) => {
        if (!url) return resolve(null as any);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = `${this.rootUrl}/${url}`;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null as any);
      });

    logo.onload = async () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let pageNumber = 0;

      const headers = isRole3
        ? [
          [
            'Name',
            'Attendance Date',
            'End Date',
            'In Time',
            'Out Time',
            'Working Hours',
            'Total Working Hours',
            'Over Time',
            'Status',
          ],
        ]
        : [['Name', 'Attendance Date', 'End Date', 'Status']];

      const data = normalizedItems.map((item: any) => {
        const commonFields = [
          item.firstName || '',
          item.attendanceDate ? formatDate(item.attendanceDate) : '',
          item.endAttendanceDate ? formatDate(item.endAttendanceDate) : '',
        ];
        const status = item.type === 'Attendance' ? 'Present' : 'Absent';

        return isRole3
          ? [
            ...commonFields,
            formatTime(item.inTime),
            formatTime(item.outTime),
            formatTime(item.workingHours?.toString()) || '0',
            formatTime(item.totalWorkingHours?.toString()) || '0',
            formatTime(item.overTime?.toString()) || '0',
            status,
          ]
          : [...commonFields, status];
      });

      autoTable(doc, {
        head: headers,
        body: data,
        margin: { top: 60 },
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        didDrawPage: function () {
          pageNumber++;
          const centerX = pageWidth / 2;

          doc.addImage(logo, 'PNG', 15, 10, 40, 15);
          doc.setFontSize(12);
          doc.text(dayCareName, centerX, 15, { align: 'center' });

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Attendance Report', centerX, 22, { align: 'center' });

          doc.setFontSize(10);
          const splitInfo = doc.splitTextToSize(
            attendanceInfoText,
            pageWidth - 30
          );
          doc.text(splitInfo, 15, 40);

          doc.setFontSize(9);
          doc.text(`Page ${pageNumber}`, pageWidth - 30, pageHeight - 10);
        },
      });

      let finalY = (doc as any).lastAutoTable?.finalY || 70;
      let yOffset = finalY + 10;

      for (const item of normalizedItems) {
        const inImg = await loadImage(item.inDocumentImage);
        const outImg = await loadImage(item.outDocumentImage);

        doc.setFontSize(10);

        if (inImg) {
          doc.setFont('helvetica', 'bold');
          doc.text(`Name: ${item.firstName || ''}`, 15, yOffset);
          doc.text('In Image:', 15, yOffset + 6);
          doc.addImage(inImg, 'JPEG', 15, yOffset + 10, 40, 40);
        }

        if (outImg) {
          doc.text('Out Image:', 70, yOffset + 6);
          doc.addImage(outImg, 'JPEG', 70, yOffset + 10, 40, 40);
        }

        yOffset += 60;

        if (yOffset + 60 > pageHeight - 20) {
          doc.addPage();
          yOffset = 20;
        }
      }
      doc.save('Attendance_Report.pdf');
    };
  }

  getEmployeeLeave() {
    this.spinner.show();
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.formattedStartDate = this.formatDate(startDate);
    this.formattedEndDate = this.formatDate(endDate);

    this.applyService
      .getEmployeeLeave(
        0,
        parseInt(this.centreID),
        parseInt(this.userRoleID),
        this.formattedStartDate,
        this.formattedEndDate
      )
      .subscribe({
        next: (data) => {
          if (data.message === 'OK') {
            this.leaveList = data.result.totalLeaves || [];
            setTimeout(() => this.spinner.hide(), 500);
          } else {
            this.spinner.hide();
          }
        },
        error: (error) => {
          console.error('Error fetching leave data:', error);
          this.spinner.hide();
        },
      });
  }

  goToApplyLeave() {
    this.router.navigate(['/apply-leave']);
  }
}
