import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ClassroomDetailsService } from '../../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageStudentActivitiesComponent } from '../../../day-care-management/classroom-management/manage-student-activities/manage-student-activities.component';
import flatpickr from 'flatpickr';
import { ProfileService } from '../../profile/profile.service';
import { format, isThisSecond } from 'date-fns';
import { FormsModule } from '@angular/forms';
import { ThirdPartyDraggable } from '@fullcalendar/interaction';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { DcAppointmentsListService } from '../../../bloomvie-management/dc-appointments-list/dc-appointments-list.service';
import Swal from 'sweetalert2';
import { CommonService } from '../../common.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { tns } from 'tiny-slider/src/tiny-slider';
import '@fancyapps/fancybox/dist/jquery.fancybox.min.css';
import { TimeFormatAmPmPipe } from '../../../bloomvie-management/dc-appointments-list/time-format.pipe';
import { SkeletonLoaderComponent } from '../../skeleton-loader/skeleton-loader.component';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
declare var $: any;

interface ApiResponse {
  message: string | null;
  activity: string | undefined;
  result: any | null;
}

@Component({
  selector: 'app-child-report',
  standalone: true,
  imports: [
    NgSelectModule,
    CarouselModule,
    HttpClientModule,
    CommonModule,
    BreadcrumbComponent,
    ManageStudentActivitiesComponent,
    FormsModule,
    TimeFormatAmPmPipe,
    SkeletonLoaderComponent,
  ],
  providers: [DatePipe],
  templateUrl: './child-report.component.html',
  styleUrls: ['./child-report.component.css'],
})
export class ChildReportComponent implements AfterViewInit {
  readonly rootUrl = environment.apiUrl.slice(0, -3);

  @ViewChild('datePicker', { static: false }) dateInput!: ElementRef;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  selectedDate: any = '';

  foodServingTime: any;
  currentDate = new Date();
  studentID: any;
  studentData: any[] = [];
  popupOpen = false;
  @Input() SelectedStudentId!: any;
  firstStartDate: any;
  selectedFirstStartDate: any;
  selectedFirstEndDate: any;
  firstEndDate: any;
  listStudentData: any;
  MasterActivityID: any;
  frontEndWebUrl: string = environment.frontEndWebUrl;
  activity: any;
  showDownloadButton: boolean = false;
  selectNewDate: any;
  visibleCount: number = 3;
  currentIndex: number = 0;
  dynamicData: any;
  ActivityType: any;
  type: any;
  data: any;
  teacher: any;
  currentMonth: any;
  displayText: any;
  CurrentDate: any;
  formattedDate: any;
  current: any;
  startDate: any;
  endDate: any;
  currentDateValue: any;
  showAllImages = false;
  studentDetails: any[] = [];
  userRoleId: any;
  selectedStudentIds: number[] = [];
  fileSize: any;
  totalSizeMB: number = 0;
  imageData: any[] = [];
  selectedImagePaths: any[] = [];
  isAllSelected: boolean = false;
  parentID: any;
  flatpickrInstance: any;
  centreID: any;
  filterImages: any;
  filteredImages: any;
  fullFileSize: any;
  storageSize: any;
  bloomvieSettings: any;
  totalCost: any;
  studentActivityFlatpickrInstance: any;
  createDate: any;
  mediaDownload: any;
  showDownloadAllButton: boolean = false;
  newSelectedDate: any;
  formattedStartDate: any;
  formattedEndDate: any;
  selectedStartDate: any = '';
  selectedEndDate: any = '';
  selectedActivity: any = null;
  selectedDay: any = null;
  encryptStartDate: any;
  encryptEndDate: any;
  activityPath: any;
  DayCareAdminID: any;
  recordNotFound: boolean = true;
  isToggler: boolean = true;
  urlToken: any;
  skeletonShow = 'Skelton';
  private _activityCount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private service: ClassroomDetailsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private profileService: ClassroomDetailsService,
    private datePipe: DatePipe,
    private cookieService: CookieService,
    private commonService: CommonService,
    private router: Router
  ) {
    this.displayText = 'Today';
    this.CurrentDate = new Date();
    this.formattedDate = this.CurrentDate.toISOString().split('T')[0];
    this.current = this.formattedDate;
  }

  customOptionsnew: OwlOptions = {
    loop: true,
    mouseDrag: true,
    dots: false,
    autoplay: true,
    margin: 10,
    navSpeed: 700,
    navText: [
      '<i class="fa-solid fa-less-than"></i>',
      '<i class="fa-solid fa-greater-than"></i>',
    ],
    responsive: {
      0: {
        items: 4,
      },
      400: {
        items: 4,
      },
      740: {
        items: 4,
      },
      940: {
        items: 4,
      },
    },

    nav: true,
  };

  ngOnInit(): void {
    const studentIDCookie = this.cookieService.get('StudentID');

    if (studentIDCookie) {
      this.studentID = parseInt(studentIDCookie, 10); // 10 is the radix for decimal
    }

    const UserInfo = this.cookieService.get('UserInfo');
    if (UserInfo) {
      const parsedInfo = JSON.parse(UserInfo);
      this.urlToken = parsedInfo.result.urlToken;
    }

    this.route.queryParams.subscribe((params: any) => {
      const encryptedID = params['ID'];
      this.type = params['TYPE'];

      this.userRoleId = this.cookieService.get('UserRoleId') || null;
      this.parentID = this.cookieService.get('UserId') || null;
      this.centreID = this.cookieService.get('CentreID') || null;
      if (encryptedID) {
        const secretKey = 'encrypt001100!?';
        try {
          const decryptedBytes = CryptoJS.AES.decrypt(encryptedID, secretKey);
          const decryptedID = decryptedBytes.toString(CryptoJS.enc.Utf8);
          this.studentID = parseInt(decryptedID, 10);
          this.SelectedStudentId = this.studentID;
        } catch (error) {
          console.error('Error decrypting student ID:', error);
        }
      }

      this.getStudentData();
    });

    this.showDownloadAllButton = this.studentData?.some((student) =>
      student.days?.some((day: { studentData: any[] }) =>
        day.studentData?.some((item: any) =>
          this.shouldShowDownloadButton(item)
        )
      )
    );

    // this.calculateSevenDays();
    this.getStudentData();
    this.getStudentProfileDetails();

    this.currentDateValue = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    // this.getTeacherProfileByStudentID();A
  }

  scrollRight() {
    const container = this.scrollContainer.nativeElement;
    const itemWidth = container.querySelector('li').offsetWidth;
    const maxIndex = container.children.length - this.visibleCount;

    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
      container.style.transform = `translateX(-${this.currentIndex * itemWidth
        }px)`;
    }
  }

  scrollLeft() {
    const container = this.scrollContainer.nativeElement;
    const itemWidth = container.querySelector('li').offsetWidth;

    if (this.currentIndex > 0) {
      this.currentIndex--;
      container.style.transform = `translateX(-${this.currentIndex * itemWidth
        }px)`;
    }
  }

  // download button show
  isWithinLast7Days(dateString: string): boolean {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return itemDate >= sevenDaysAgo && itemDate <= today;
  }

  disableRightClick(event: MouseEvent): void {
    event.preventDefault();
  }

  disableDrag(event: DragEvent): void {
    event.preventDefault();
  }

  openNapModal(activity: any) {
    for (const data of activity) {
      for (const media of data?.imageUrl || []) {
        if (media.type === 'video' && media.url) {
          this.getVideoThumbNail(media.url);
        }
      }
    }

    this.selectedActivity = activity;
  }

  // isVideo(file: string): boolean {
  //   const videoExtensions = ['mp4', 'avi', 'mov', 'webm'];
  //   const extension = file.split('.').pop()?.toLowerCase();
  //   return videoExtensions.includes(extension || '');
  // }

  get activityName(): string {
    switch (this.selectedActivity?.activityId) {
      case 1:
        return 'Nap Time';
      case 2:
        return 'Food';
      case 3:
        return 'Note';
      case 4:
        return 'Health';
      case 5:
        return 'Incident';
      case 6:
        return 'Medicine';
      case 7:
        return 'Reminder';
      default:
        return 'Activity';
    }
  }

  getActivityName(activity: any, index: number): string {
    // Check if the index + 1 is 1, and if so, omit the index

    if (index === 0) {
      switch (activity?.activityId) {
        case 1:
          return `Nap`; // For Nap Time, no index
        case 2:
          return `Food`; // For Food, no index
        case 3:
          return `Note`; // For Note, no index
        case 4:
          return `Health`; // For Health, no index
        case 5:
          return `Incident`; // For Incident, no index
        case 6:
          return `Medicine`; // For Medicine, no index
        case 7:
          return `Reminder`; // For Reminder, no index
        default:
          return `Activity`; // Default case, no index
      }
    } else {
      // If the index is not 0, include the index in the name
      switch (activity?.activityId) {
        case 1:
          return `Nap ${index + 1}`; // For Nap Time, include index
        case 2:
          return `Food ${index + 1}`; // For Food, include index
        case 3:
          return `Note ${index + 1}`; // For Note, include index
        case 4:
          return `Health ${index + 1}`; // For Health, include index
        case 5:
          return `Incident ${index + 1}`; // For Incident, include index
        case 6:
          return `Medicine ${index + 1}`; // For Medicine, include index
        case 7:
          return `Reminder ${index + 1}`; // For Reminder, include index
        default:
          return `Activity ${index + 1}`; // Default case with index
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      $('[data-fancybox="gallery"]').fancybox({
        loop: true,
        buttons: ['zoom', 'slideShow', 'thumbs', 'close'],
        animationEffect: 'zoom',
        transitionEffect: 'fade',
      });
    }, 500);

    // ----- First Picker Function -----
    const firstDatePicker = (
      startDateSelect: string,
      endDateSelect: string,
      callback: () => void,
      disableLast7Days = false
    ) => {
      const today = new Date();
      let startDateInstance: any;
      let endDateInstance: any;

      const selectFrom: any = {
        mode: 'single',
        dateFormat: 'm-d-Y',
        allowInput: true,
        maxDate: today,
        defaultDate: this.selectedFirstStartDate ?? this.selectNewDate,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 1) {
            this.firstStartDate = this.formatDate(
              new Date(selectedDates[0].getTime() + 86400000)
            );
            this.selectedFirstStartDate = `${this.firstStartDate}`;
            this.firstEndDate = this.firstStartDate;

            if (endDateInstance) {
              endDateInstance.set('minDate', selectedDates[0]); // ✅ Set minDate
            }

            callback();
          }
        },
      };

      const selectTo: any = {
        mode: 'single',
        dateFormat: 'm-d-Y',
        allowInput: true,
        maxDate: today,
        defaultDate: this.selectedFirstEndDate,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 1) {
            this.firstEndDate = this.formatDate(
              new Date(selectedDates[0].getTime() + 86400000)
            );
            this.selectedFirstEndDate = `${this.firstEndDate}`;
            callback();
          }
        },
      };

      // Optional: Disable last 7 days
      if (disableLast7Days) {
        const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000);
        const disableFn = (date: Date) => date >= sevenDaysAgo && date < today;
        selectFrom.disable = [disableFn];
        selectTo.disable = [disableFn];
      }

      startDateInstance = flatpickr(startDateSelect, selectFrom);
      endDateInstance = flatpickr(endDateSelect, selectTo);

      this.selectedFirstStartDate = `${this.selectedFirstStartDate}`;
      this.selectedFirstEndDate = `${this.selectedFirstEndDate}`;

      return {
        startDate: this.selectedFirstStartDate,
        endDate: this.selectedFirstEndDate,
      };
    };

    // ----- Second Picker Function -----
    const secondDatePicker = (
      startDateSelect: string,
      endDateSelect: string,
      callback: () => void
    ) => {
      const today = new Date();
      let endDateInstance: any;

      const selectFrom: any = {
        mode: 'single',
        dateFormat: 'm-d-Y',
        allowInput: true,
        maxDate: today,
        defaultDate: this.formattedStartDate,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 1) {
            this.startDate = this.formatDate(
              new Date(selectedDates[0].getTime() + 86400000)
            );
            this.selectedStartDate =
              this.datePipe.transform(this.formattedStartDate, 'MM-dd-yyyy') ??
              '';

            if (endDateInstance) {
              endDateInstance.set('minDate', selectedDates[0]); // ✅ Set minDate
            }

            callback();
          }
        },
      };

      const selectTo: any = {
        mode: 'single',
        dateFormat: 'm-d-Y',
        allowInput: true,
        maxDate: today,
        defaultDate: this.formattedEndDate,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 1) {
            this.endDate = this.formatDate(
              new Date(selectedDates[0].getTime() + 86400000)
            );
            this.selectedEndDate =
              this.datePipe.transform(this.formattedEndDate, 'MM-dd-yyyy') ??
              '';
            callback();
          }
        },
      };

      flatpickr(startDateSelect, selectFrom);
      endDateInstance = flatpickr(endDateSelect, selectTo);

      this.selectedStartDate =
        this.datePipe.transform(this.formattedStartDate, 'MM-dd-yyyy') ?? '';
      this.selectedEndDate =
        this.datePipe.transform(this.formattedEndDate, 'MM-dd-yyyy') ?? '';

      return {
        startDate: this.selectedStartDate,
        endDate: this.selectedEndDate,
      };
    };

    // ----- Call Both Pickers -----
    this.flatpickrInstance = firstDatePicker(
      '#firstToDate',
      '#firstFromDate',
      this.fetchStudentImages.bind(this),
      true
    );

    this.studentActivityFlatpickrInstance = secondDatePicker(
      '#selectFromDate',
      '#selectToDate',
      this.getStudentData.bind(this)
    );
  }

  onMouseWheel(event: WheelEvent, scrollContainer: HTMLElement): void {
    event.preventDefault();
    scrollContainer.scrollLeft += event.deltaY; // Horizontal scroll on wheel
  }

  scrollNext(scrollContainer: HTMLElement): void {
    scrollContainer.scrollLeft += 500; // Scroll right by 500px (you can adjust)
  }

  scrollPrev(scrollContainer: HTMLElement): void {
    scrollContainer.scrollLeft -= 500; // Scroll left by 300px
  }

  goToPreviousDate(): void {
    const previous = new Date(this.formattedStartDate);
    previous.setDate(previous.getDate() - 1);

    this.formattedStartDate = this.formatDate(previous);
    this.newSelectedDate = this.formatDate(previous);

    let startDate = this.datePipe.transform(this.newSelectedDate, 'MM-dd-yyyy');

    this.selectedStartDate = `${startDate}`;

    this.getStudentData();
  }

  isNextDateDisabled(): boolean {
    const today = new Date();
    const todayStr = this.formatDate(today); // Format: 'YYYY-MM-DD'

    // Fallback: use selectedStartDate if selectedEndDate is empty
    const dateToCheck = this.selectedEndDate || this.selectedStartDate;

    // If still empty, allow next button (don’t disable)
    if (!dateToCheck) return false;

    return dateToCheck >= todayStr;
  }

  goToNextDate(): void {
    const next = new Date(this.formattedStartDate);
    next.setDate(next.getDate() + 1);

    this.formattedStartDate = this.formatDate(next);
    this.newSelectedDate = this.formatDate(next);

    let startDate = this.datePipe.transform(this.newSelectedDate, 'MM-dd-yyyy');

    this.selectedStartDate = `${startDate}`;

    this.getStudentData();
  }

  getStudentData(): void {
    this.skeletonShow = 'Skelton';

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate());
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    this.formattedStartDate = this.formatDate(startDate);
    this.formattedEndDate = this.formatDate(endDate);

    if (this.startDate) {
      this.formattedStartDate = '';
      this.formattedEndDate = '';
      this.selectedEndDate = '';
      this.newSelectedDate = '';
      this.endDate = '';
    }
    if (this.newSelectedDate) {
      this.formattedStartDate = this.newSelectedDate;
      this.formattedEndDate = this.formattedStartDate;
      this.selectedEndDate = '';

      if (this.startDate == null) {
        this.endDate = this.endDate;
        this.startDate = this.formattedStartDate;
        this.formattedEndDate = '';
        this.formattedEndDate = '';
      }
    } else if (this.startDate) {
      this.formattedStartDate = this.startDate;
      this.formattedEndDate = this.formattedStartDate;

      this.startDate = '';
      this.startDate = '';
    } else if (this.selectedEndDate) {
      this.formattedStartDate = this.selectedEndDate;
    }

    if (this.studentID) {
      this.service
        .getStudentDetails(
          this.studentID,
          this.startDate ? this.startDate : this.formattedStartDate,
          this.endDate ? this.endDate : this.formattedEndDate
        )
        .subscribe({
          next: (data: any) => {
            if (data.message === 'OK') {
              this.studentData = data.result;

              this.endDate = '';
              this.checkDate(
                this.startDate ? this.startDate : this.formattedStartDate
              );

              this.base64toblobimage(data.result);

              this.skeletonShow = '';
            } else {
              this.studentData = [];
              this.skeletonShow = '';
            }
            // this.spinner.hide();
            this.skeletonShow = '';
          },
          error: () => {
            console.error('Error fetching student data.');
            // this.spinner.hide();
            this.skeletonShow = '';
          },
        });
    }
  }

  isVideo(media: any): boolean {
    return media?.type === 'video';
  }

  base64toblobimage(imageData: any) {
    for (const student of imageData) {
      for (const day of student.days) {
        for (const item of day.activities) {
          for (const activity of item.studentData) {
            activity.imageUrl = []; // Initialize

            for (const image of activity.activityImages || []) {
              const rawUrl = image?.base64Image;

              try {
                if (typeof rawUrl === 'string' && rawUrl.startsWith('data:')) {
                  const [header, data] = rawUrl.split(',');
                  const mimeMatch = header.match(/data:(.*);base64/);
                  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

                  const blob = this.base64ToBlob(data, mimeType);
                  const objectUrl = URL.createObjectURL(blob);

                  // Push Blob URL to imageUrl array
                  activity.imageUrl.push({
                    url: objectUrl,
                    type: mimeType.startsWith('video/') ? 'video' : 'image',
                    path: image?.imagePath || '', // Add path here
                  });
                } else {
                  console.warn('Skipping invalid or non-base64 URL:', rawUrl);
                }
              } catch (err) {
                console.error('Error converting base64 to Blob:', rawUrl, err);
              }
            }
          }
        }
      }
    }
  }

  base64ToBlob(base64String: string, mimeType: string): Blob {
    if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/')) {
      console.warn('Unsupported MIME type:', mimeType);

      mimeType = 'application/octet-stream';
    }

    const byteCharacters = atob(base64String);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mimeType });
  }


  studentActivityDownloadRequest() {
    if (!this.firstStartDate || !this.firstEndDate) {
      this.toastr.warning('Please select a start and end date.', 'Warning');
      return;
    }
    this.spinner.show();

    const formattedStartDate = this.datePipe.transform(
      this.firstStartDate,
      'yyyy-MM-dd'
    );
    if (formattedStartDate) {
      const isoDate = new Date(`${formattedStartDate}T00:00:00Z`)
        .toISOString()
        .split('T')[0];
      this.encryptStartDate = this.commonService.encrypt(isoDate);
    }

    const formattedEndDate = this.datePipe.transform(
      this.firstEndDate,
      'yyyy-MM-dd'
    );
    if (formattedEndDate) {
      const isoDate = new Date(`${formattedEndDate}T00:00:00Z`)
        .toISOString()
        .split('T')[0];
      this.encryptEndDate = this.commonService.encrypt(isoDate);
    }

    // const encryptEndDate = this.commonService.encrypt(
    //   new Date(this.firstEndDate).toISOString().split('T')[0]
    // );

    const userEncryptID = this.commonService.encrypt(this.parentID.toString());
    const encryptPlanID = this.commonService.encrypt(this.totalCost.toString());
    const encryptGb = this.commonService.encrypt(this.fileSize.toString());

    const type = this.commonService.encrypt('studentMediaRequest');
    const DayCareID = this.commonService.encrypt(this.DayCareAdminID);
    const encryptedStudentID = this.commonService.encrypt(
      this.studentID.toString()
    );

    // const paymentUrl = `http://localhost:4201/payment-details?planPrice=${encryptPlanID}&id=${userEncryptID}&type=${type}&fileSize=${encryptGb}`;
    let paymentUrl = `${this.frontEndWebUrl}payment-details?planPrice=${encryptPlanID}&id=${userEncryptID}&DayCareID=${DayCareID}&type=${type}&fileSize=${encryptGb}&SDate=${this.encryptStartDate}&EDate=${this.encryptEndDate}&OnSelectStudentID=${encryptedStudentID}&urlToken=${this.urlToken}`;

    const requestData = {
      StartDate: this.firstStartDate,
      EndDate: this.firstEndDate,
      ParentID: this.parentID ? parseInt(this.parentID, 10) : null,
      StudentID: this.studentID,
      CreatedBy: this.parentID ? parseInt(this.parentID, 10) : null,
      CentreID: this.centreID,
      FileSize: this.fileSize.toString(),
      Price: this.totalCost,
      PaymentUrl: paymentUrl,
    };

    this.profileService.manageStudentRequest(requestData).subscribe(
      (data) => {
        if (data.message === 'OK') {
          this.data = data.result;
          this.clearForm();

          $('#view-del').modal('hide');
          this.spinner.hide();

          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 100);
        } else {
          this.toastr.error('Failed to send download request.', 'Error');
        }
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error('An error occurred. Please try again.', 'Error');
        console.error('Error:', error);
      }
    );
  }

  clearForm() {
    this.firstStartDate = '';
    this.firstEndDate = '';
    this.selectedFirstStartDate = '';
    this.selectedFirstEndDate = '';
  }

  clearDate() {
    this.firstStartDate = this.selectNewDate;
    this.firstEndDate = this.selectNewDate;
    this.formattedStartDate = this.selectNewDate;
    this.selectedFirstStartDate = '';
    this.selectedFirstEndDate = '';
    this.fetchStudentImages();
  }

  clearDatepicker() {
    this.firstStartDate = '';
    this.firstEndDate = '';
    this.selectedFirstStartDate = '';
    this.selectedFirstEndDate = '';
  }

  fetchStudentImages() {
    if (!this.firstStartDate || !this.firstEndDate) {
      alert('Please select both start and end dates.');
      return;
    }

    this.spinner.show();

    this.service
      .getStudentDetails(
        this.studentID,
        this.firstStartDate || this.selectedFirstStartDate,
        this.firstEndDate || this.selectedFirstEndDate
      )
      .subscribe({
        next: (data) => {
          if (data.message === 'OK') {
            let allImages: any[] = [];

            for (const student of data.result) {
              for (const day of student.days) {
                for (const item of day.activities) {
                  for (const activity of item.studentData) {
                    const activityDate = new Date(activity.activityDate);
                    const mediaDownloadDate = new Date(
                      activity.mediaDownloadDate
                    );

                    const today = new Date();

                    if (today < mediaDownloadDate) {
                      continue; // Skip expired media
                    }

                    this.DayCareAdminID = activity.dayCareAdminID;

                    const start = new Date(this.selectedFirstStartDate);
                    const end = new Date(
                      this.selectedFirstEndDate || this.firstEndDate
                    );

                    if (activityDate >= start && activityDate <= end) {
                      allImages.push({
                        size: parseFloat(activity.fileSize || '0'),
                      });
                    }
                  }
                }
              }
            }

            if (allImages.length > 0) {
              const totalSizeMB = parseFloat(
                allImages
                  .reduce((sum, img) => sum + (img.size || 0), 0)
                  .toFixed(3)
              );
              this.fileSize = totalSizeMB;
              this.recordNotFound = false;
            } else {
              this.fileSize = 0;
              this.recordNotFound = false;
            }

            this.getBloomvieSettings();
          } else if (data.message === 'Record Not Found') {
            this.spinner.hide();
            this.recordNotFound = true;
          }

          this.spinner.hide();
        },
        error: (error) => {
          console.error('Error fetching student data:', error);
          this.spinner.hide();
          this.isToggler = false;
        },
      });
  }

  checkDate(selectedDate: any) {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const inputDate = new Date(selectedDate);
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    this.showDownloadButton = inputDate >= sevenDaysAgo && inputDate <= today;
  }

  getBloomvieSettings() {
    this.commonService
      .getBloomvieSettings(1)
      .subscribe((response: ApiResponse) => {
        if (response.message == 'Success') {
          this.bloomvieSettings = response.result;

          if (this.bloomvieSettings.costPerGB) {
            this.totalCost =
              (this.fileSize / 1024) * this.bloomvieSettings.costPerGB;
            this.totalCost = Math.trunc(this.totalCost);
          }
        }
      });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  submitDate() {
  }

  onEdit(activity: any) {
    const activityID = activity;
    $('#activityModal').modal('hide');

    this.router.navigate(['/manage-student-activity'], {
      state: { activityID },
    });
  }

  getStudentProfileDetails() {
    this.profileService.getStudentProfileByStudentID(this.studentID).subscribe(
      (data) => {
        if (data.message === 'OK') {
          this.data = data.result;
        } else {
          console.error('Failed to retrieve student profile:', data.message);
        }
      },
      (error) => {
        console.error('Error fetching student profile:', error);
      }
    );
  }

  downloadRequest(items: any[]): boolean {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const filteredItems = items.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= sevenDaysAgo && itemDate <= today;
    });
    return filteredItems.length > 0;
  }

  autoSelectAndDownload() {
    this.autoSelectAllImages();
    this.downloadAllImages();
  }

  autoSelectAllImages() {
    this.selectedImagePaths = [];
    this.studentDetails = [];

    const studentIdsAdded = new Set();

    this.studentData.forEach((monthData: any) => {
      monthData.days.forEach((day: any) => {
        day.activities.forEach((activities: any) => {
          activities.studentData.forEach((student: any) => {
            if (student.imageUrl && student.mediaDownloadDate) {
              if (new Date(student.mediaDownloadDate) < new Date()) {
                return; // Skip expired
              }

              if (!studentIdsAdded.has(student.studentID)) {
                this.studentDetails.push(student);
                studentIdsAdded.add(student.studentID);
              }

              const imageList = (student.imageUrl || [])
                .filter((media: any) => media.url && media.type) // don't filter out path here
                .map((media: any) => ({
                  ...media,
                  path: media.path ?? 'Activity Image',
                }));

              for (const media of imageList) {
                this.selectedImagePaths.push({ media, student });
              }
            }
          });
        });
      });
    });
  }

  async downloadAllImages() {
    if (!this.selectedImagePaths.length) return;

    this.spinner.show();

    const zip = new JSZip();
    let totalSize = 0;
    const allFetchPromises: Promise<void>[] = [];

    for (const { media, student } of this.selectedImagePaths) {
      const formattedDate = format(
        new Date(student.activityDate),
        'MM-dd-yyyy'
      );
      const folderName = `${student.studentName}/${media.path}/${formattedDate}`;
      const folder = zip.folder(folderName);

      if (!folder) continue;

      const promise = new Promise<void>(async (resolve) => {
        try {
          const response = await fetch(media.url);
          if (!response.ok)
            throw new Error(`Failed to fetch file: ${media.url}`);

          const blob = await response.blob();

          // Generate a unique file name
          let originalName =
            media.url.split('/').pop() ||
            (media.type === 'video' ? 'video.mp4' : 'image.jpg');
          if (media.url.startsWith('blob:')) {
            const extension = media.type === 'video' ? 'mp4' : 'jpg';
            originalName = `${media.type}-${Date.now()}-${Math.floor(
              Math.random() * 1000
            )}.${extension}`;
          }

          folder.file(originalName, blob);
          totalSize += blob.size;
        } catch (error) {
          console.error(`Error fetching file: ${media.url}`, error);
        }

        resolve();
      });

      allFetchPromises.push(promise);
    }

    await Promise.all(allFetchPromises);

    const totalSizeInMB = totalSize / 1024 / 1024;
    this.fullFileSize = totalSizeInMB.toFixed(2);

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `Student_Activity.zip`;
      link.click();

      this.spinner.hide();
      this.toastr.success(
        'All media files have been successfully downloaded!',
        'Download Complete'
      );
    });
  }

  downloadImages(item: any, image?: any) {
    if (!item) return;

    const zip = new JSZip();
    const allFetchPromises: Promise<void>[] = [];
    let totalSize = 0;

    this.spinner.show();

    const mediaList = image
      ? [{ media: image, student: item }]
      : (item.imageUrl || [])
        .filter((m: any) => m.url && m.type && m.path)
        .map((media: any) => ({ media, student: item }));

    for (const { media, student } of mediaList) {
      const formattedDate = format(
        new Date(student.activityDate),
        'MM-dd-yyyy'
      );
      const folderName = `${student.studentName}/${media.path}/${formattedDate}`;
      const folder = zip.folder(folderName);
      if (!folder) continue;

      const promise = new Promise<void>(async (resolve) => {
        try {
          const response = await fetch(media.url);
          if (!response.ok) throw new Error(`Failed to fetch: ${media.url}`);

          const blob = await response.blob();

          let fileName =
            media.url.split('/').pop() ||
            (media.type === 'video' ? 'video.mp4' : 'image.jpg');
          if (media.url.startsWith('blob:')) {
            const ext = media.type === 'video' ? 'mp4' : 'jpg';
            fileName = `${media.type}-${Date.now()}-${Math.floor(
              Math.random() * 1000
            )}.${ext}`;
          }

          folder.file(fileName, blob);
          totalSize += blob.size;
        } catch (err) {
          console.error(`Download failed: ${media.url}`, err);
        }
        resolve();
      });

      allFetchPromises.push(promise);
    }

    Promise.all(allFetchPromises).then(() => {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        const name = `${item.studentName}_media.zip`;
        saveAs(content, name);
        this.spinner.hide();
        this.toastr.success('Download complete!', 'Success');
      });
    });
  }

  studentDownloadActivity(item: any): boolean {
    return item && item.isDownloadAllowed;
  }

  shouldShowDownloadButton(item: any): boolean {
    return this.userRoleId === '5' && item.mediaDownloadDate
      ? new Date(item.mediaDownloadDate) >= new Date()
      : false;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  trackByDay(index: number, day: any): any {
    return day;
  }

  trackByItem(index: number, item: any): any {
    return item;
  }

  trackByDate(index: number, item: any): string {
    return item.date;
  }

  trackByNestedDate(index: number, item: any): string {
    return item;
  }

  blurGalleryDownloadRequest(date: any): void {
    this.selectNewDate = date;
    Swal.fire({
      icon: 'info',
      title: 'Unlock Photo',
      text: 'This photo is blurred. To view it in full resolution, please purchase it. Please upgrade your plan to continue.',
      showCancelButton: true,
      confirmButtonText: 'Purchase & Unlock',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Open the modal using Bootstrap JS
        this.clearDate();

        $('#activityModal').modal('hide');
        this.selectedFirstStartDate = `${this.datePipe.transform(
          this.selectNewDate,
          'MM-dd-yyyy'
        )}`;

        $('#view-del').modal('show');
      }
    });
  }

  videoThumbnail: any = 'assets/video-thumb.png'; // default fallback

  getVideoThumbNail(blobUrl: string) {
    const video = document.createElement('video');
    video.src = blobUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    video.addEventListener('loadeddata', () => {
      video.currentTime = 2; // capture frame at 2 seconds
    });

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob = canvas.toDataURL('image/png');
        this.videoThumbnail = this.base64ToBlob(
          this.videoThumbnail,
          'image/png'
        );
      }
    });
  }

  getFirstTwoImages(item: any): string[] {
    return item.incidentImage ? item.incidentImage.split(',').slice(0, 2) : [];
  }
}
