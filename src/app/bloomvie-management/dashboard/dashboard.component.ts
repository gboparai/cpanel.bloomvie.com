import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { ChatboxComponent } from '../../common-component/chatbox/chatbox.component';
import { MailboxComponent } from '../../common-component/mailbox/mailbox.component';
import { JobPortalServiceService } from '../../day-care-management/job-portal-details/job-portal-service.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule, NgFor } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { DashboardService } from './dashboard.service';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { DcAppointmentsListService } from '../dc-appointments-list/dc-appointments-list.service';
import { log } from 'console';
import { TocViewService } from '../../toc-view/toc-view.service';
import { environment } from '../../../environments/environment.development';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../common-component/common.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TooltipComponent } from '../../common-component/tooltip/tooltip.component';
import { SkeletonLoaderComponent } from '../../common-component/skeleton-loader/skeleton-loader.component';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    BreadcrumbComponent,
    ChatboxComponent,
    MailboxComponent,
    BaseChartDirective,
    FullCalendarModule,
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    TooltipComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  calendarOptions: any;

  public Name: any = '';
  expertise: any[] = [];
  readonly ImageRootURL = environment.apiUrl.slice(0, -3);

  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Daycare centres' },
      // { data: [ 28, 48, 40, 19, 86, 27, 90 ], label: 'Teacher' },
      // { data: [ 28, 48, 40, 19, 86, 27, 90 ], label: 'Admin' }
    ],
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
  };

  jobs: any[] = [];
  dayCare: number = 0;
  job: any;
  id: number = 0;
  // Contentsize: number = 5;
  approveForm: FormGroup;
  msg: any;
  AppointmentCount: any;
  item: any;
  data: any;
  ContentP: number = 1;
  ContentSize: number = 5;

  TocContentP: number = 1;
  TocContentSize: number = 5;
  userTimeZone: any;
  CookiesUserRoleId: any;
  CookiesUserId: any;
  DayCareCount: any;
  Tocjobs: any[] = [];
  TocDetail: any;
  QualificationList: any;
  documentTypeList: any;
  // previewUrl: string | null = null;
  previewUrl: SafeResourceUrl | null = null;
  isModalVisible = false;
  isClosing = false;
  userRoleID: any;
  hoveredRow: any;

  @ViewChild('jobListContainer', { static: false }) jobListContainer:
    | ElementRef
    | undefined;
  userOffset: string = '';
  EducationalCredentails: string = '';
  DocumentResumes: string = '';
  UploadedDocument: string = '';
  EducationalCredentailsBlob: Blob | null = null;
  DocumentResumesBlob: Blob | null = null;
  UploadedDocumentBlob: Blob | null = null;
  previewMime: string | null = null;
  skalatonShowCard = 'skalatonShowCard';
  skeletonShow = 'Skelton';
  skalatonShowToc = 'skalatonShowToc';
  skalatonShowtoday = 'skalatonShowtoday';

  constructor(
    private jobPortalDetailService: JobPortalServiceService,
    private cookie: CookieService,
    private dashboardService: DashboardService,
    private tocservice: TocViewService,
    private formBuilder: FormBuilder,
    private dcservice: DcAppointmentsListService,
    private cdr: ChangeDetectorRef,
    private tocRegistrationservice: TocRegistrationService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.approveForm = this.formBuilder.group({
      id: 0,
      statusID: '',
    });
  }

  ngOnInit(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin], // Include interactionPlugin if needed
      initialView: 'dayGridMonth',
      weekends: false,
      responsive: true,
      events: [{ title: 'Meeting', start: new Date() }],
    };
    const centreId = parseInt(this.cookie.get('CentreID'));
    this.dayCare = centreId;
    this.CookiesUserRoleId = parseInt(this.cookie.get('UserRoleId'));
    this.CookiesUserId = parseInt(this.cookie.get('UserId'));
    if (this.CookiesUserRoleId > 0) {
      this.getDashBoardCount();
    }
    this.getQualifications();
    this.getDocumentTypeList();
    this.getAllAreaOfExpertise();

    // this.getJobsList();

    this.userOffset = this.getGMTOffsetString();

    this.getAppliedJobTOCListByStatus();
    this.getAllDayCareAppointmentsCount();
    this.getInterestedDayCare('');
    this.userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // getJobsList() {
  //   const sortOrder = 'desc';
  //   this.dashboardService.getAllJobs("",sortOrder).subscribe((data) => {
  //     if (data.message == "Success") {
  //       this.jobs = data.result
  //     }
  //   })
  // }

  // getJobsList() {
  // this.dashboardService.getAllJobs(3).subscribe((data) => {
  //   if (data.message === 'Success') {
  //     this.jobs = data.result;
  //     this.cdr.detectChanges();
  //     this.scrollToJobs();
  //   }
  // });
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

  getAppliedJobTOCListByStatus() {
    this.skalatonShowToc = 'skalatonShowToc';
    this.skeletonShow = 'Skelton';

    this.dashboardService
      .getAppliedJobTOCListByStatus(this.Name, 3)
      .subscribe((data) => {
        if (data.message === 'ok') {
          this.Tocjobs = data.result;
          this.skalatonShowToc = '';
          this.skeletonShow = '';

          this.cdr.detectChanges();
          //this.scrollToJobs();
        } else {
          this.skalatonShowToc = '';
          this.skeletonShow = '';

          this.Tocjobs = [];
        }
      });
  }

  scrollToJobs() {
    const jobListElement = document.getElementById('jobListContainer');
    if (jobListElement) {
      jobListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getInterestedDayCare(name: any) {
    this.dashboardService.getInterestedDayCare(1, name).subscribe((data) => {
      if (data.message == 'OK') {
        this.data = data.result;

      }
    });
  }

  onSearchName(e: any) {
    if (e.target.value.length > 3) {
      this.getInterestedDayCare(e.target.value);
    } else if (e.target.value == '') {
      this.getInterestedDayCare('');
    }
  }

  openJobDetails(jobsData: any[]) {
    this.jobs = jobsData;
  }
  formatDate(dateString: string): string | null {
    if (!dateString) {
      return null;
    }
    return dateString.split('T')[0];
  }

  loadJobDetails(id: any) {
    this.jobPortalDetailService.getJobByID(id).subscribe(
      (data) => {
        this.job = data.result[0];

      },
      (error) => {
        console.error('Error fetching job details:', error);
      }
    );
  }

  // for pagination
  onPageChange(page: number): void {
    this.ContentP = page;
  }

  onPageChangeToc(page: number): void {
    this.TocContentP = page;
  }

  getAllDayCareAppointmentsCount() {
    this.skalatonShowtoday = 'skalatonShowtoday';
    let region = this.commonService.regionResponseSignal();

    this.dcservice
      .getDayCareAppointments('', '', region.offsetHours, region.offsetMinutes)
      .subscribe((data: any) => {
        this.AppointmentCount = data.result.length;
        this.skalatonShowtoday = '';
      });
    this.skalatonShowtoday = '';
  }

  getDashBoardCount() {
    this.skalatonShowCard = 'skalatonShowCard';
    this.dashboardService
      .getDashBoardCount(this.CookiesUserRoleId, this.CookiesUserId)
      .subscribe((data) => {
        if (data.message == 'OK') {
          this.DayCareCount = data.result;
          this.skalatonShowCard = '';
        }
        this.skalatonShowCard = '';
      });
  }

  scrollToPendingApproval(): void {
    if (this.jobListContainer) {
      this.jobListContainer.nativeElement.scrollIntoView({
        behavior: 'smooth', // Enables smooth scrolling
        block: 'start', // Scroll to the top of the element
      });
    }
  }

  getQualifications() {
    this.tocservice.getQualifications().subscribe((data) => {
      if (data.message === 'OK') {
        this.QualificationList = data.result;
      }
    });
  }

  getDocumentTypeList() {
    this.tocservice.getDocumentTypeList().subscribe({
      next: (response) => {
        if (response.message === 'OK') {
          this.documentTypeList = response.result;

        }
        setTimeout(() => { }, 300);
      },
      error: (err) => { },
    });
  }

  getAllAreaOfExpertise() {
    this.tocRegistrationservice
      .getAllAreaOfExpertise()
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          this.expertise = result.result.filter(
            (item: any) => item.isActive == true
          );
        }
      });
  }

  getMimeTypeFromExtension(extension: string): string {
    switch (extension.toLowerCase()) {
      case '.pdf':
        return 'application/pdf';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.doc':
        return 'application/msword';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }

  ConvertS3File(base64: string, mimeType: string = 'application/octet-stream') {
    const blob = this.base64ToBlob(base64, mimeType);
    const url = URL.createObjectURL(blob);
    return { url, blob };
  }

  base64ToBlob(base64: string, mime = 'application/octet-stream'): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mime });
  }

  getByIDForView(id: any) {
    this.spinner.show();
    this.TocDetail = []; // Reset before API call

    this.tocservice.getAppliedJobTOByID(id, this.dayCare).subscribe(
      (data: any) => {
        this.spinner.hide();
        if (data.message === 'ok' && data.result?.length > 0) {
          $("#view-del").modal('show');
          const item = data.result[0];
          const eduMime = this.getMimeTypeFromExtension(
            item.educational_Credentails_ex || '.pdf'
          );
          const resumeMime = this.getMimeTypeFromExtension(
            item.documentResumes_ex || '.pdf'
          );
          const uploadedDocMime = this.getMimeTypeFromExtension(
            item.uploadedDocument_ex || '.pdf'
          );

          const eduFile = item.educational_Credentails
            ? this.ConvertS3File(item.educational_Credentails, eduMime)
            : null;

          const resumeFile = item.documentResumes
            ? this.ConvertS3File(item.documentResumes, resumeMime)
            : null;

          const uploadedDocFile = item.uploadedDocument
            ? this.ConvertS3File(item.uploadedDocument, uploadedDocMime)
            : null;

          // Assign URLs and Blobs
          this.EducationalCredentails = eduFile?.url || '';
          this.EducationalCredentailsBlob = eduFile?.blob || null;

          this.DocumentResumes = resumeFile?.url || '';
          this.DocumentResumesBlob = resumeFile?.blob || null;

          this.UploadedDocument = uploadedDocFile?.url || '';
          this.UploadedDocumentBlob = uploadedDocFile?.blob || null;

          // Handle qualification names
          let qualificationIds: number[] = [];

          if (typeof item.qualification === 'string') {
            qualificationIds = item.qualification
              .split(',')
              .map((id: string) => parseInt(id, 10));
          } else if (typeof item.qualification === 'number') {
            qualificationIds = [item.qualification];
          }

          item.qualificationNames =
            this.QualificationList?.filter((q: any) =>
              qualificationIds.includes(q.id)
            )
              .map((q: any) => q.name)
              .join(', ') || 'No qualifications listed';

          // Handle working days
          if (item.workingDays) {
            const workingDayIds = item.workingDays
              .split(',')
              .map((d: string) => parseInt(d, 10));
            const daysOfWeekMapping: any = {
              1: 'Monday',
              2: 'Tuesday',
              3: 'Wednesday',
              4: 'Thursday',
              5: 'Friday',
              6: 'Saturday',
              7: 'Sunday',
            };

            item.workingDaysNames = workingDayIds
              .map((id: number) => daysOfWeekMapping[id])
              .filter((day: string | undefined) => day)
              .join(', ');
          } else {
            item.workingDaysNames = 'No working days listed';
          }

          // Document type names
          // if (item.uploadedDocumentType?.length > 0) {
          //   const docTypeId = item.uploadedDocumentType[0];
          //   item.documentTypeNames =
          //     this.documentTypeList?.find((dt: any) => dt.id === docTypeId)
          //       ?.documentType || 'Unknown Document Type';
          // }
          if (item.uploadedDocumentType> 0) {
            const docTypeId = item.uploadedDocumentType;
            item.documentTypeNames =  this.documentTypeList?.find((dt: any) => dt.id === docTypeId) ?.documentType || 'Unknown Document Type';
          }
           else {
            item.documentTypeNames = 'No document types listed';
          }

          // Group slots by working day
          if (Array.isArray(item.slots)) {
            const groupedSlots = item.slots.reduce((acc: any, slot: any) => {
              if (!acc[slot.workingDayName]) {
                acc[slot.workingDayName] = [];
              }
              acc[slot.workingDayName].push(
                `${slot.startTime} -- ${slot.endTime}`
              );
              return acc;
            }, {});

            item.groupedSlots = Object.entries(groupedSlots).map(
              ([day, times]) => ({ day, times })
            );
          }

          // Handle expertise
          let expertiseIds: number[] = [];

          if (typeof item.expertise === 'string') {
            expertiseIds = item.expertise
              .split(',')
              .map((id: string) => parseInt(id, 10));
          } else if (typeof item.expertise === 'number') {
            expertiseIds = [item.expertise];
          } else if (Array.isArray(item.expertise)) {
            expertiseIds = item.expertise.map((id: any) => Number(id));
          }

          item.expertiseNames =
            this.expertise
              ?.filter((e: any) => expertiseIds.includes(e.id))
              .map((e: any) => e.name)
              .join(', ') || 'No expertise listed';

          // this.TocDetail = item;

          this.TocDetail = {
            ...item,
            educational_Credentails: eduFile?.url || '',
            documentResumes: resumeFile?.url || '',
            uploadedDocument: uploadedDocFile?.url || '',
          };

        } else {
          this.TocDetail = [];
        }
      },
      (error) => {
        console.error('Error fetching TOC detail:', error);
        this.TocDetail = [];
        this.spinner.hide();
      }
    );
  }

  tocApproveReject(teacherId: any, type: any, masterUserID: any) {
    Swal.fire({
      html: `
          <div class="swal-static-container">
            <div class="swal2-icon swal2-question " style="display: flex;  margin: 0.5em 6.7em 1.1em 5.6em !important;"><div class="swal2-icon-content">?</div></div>
            <div class="swal-static-content">
              <h2 class="swal-static-title">Confirmation</h2>
              <p class="swal-static-text">Please confirm if you would like to select this candidate.</p>
            </div>
          </div>
        `,
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Approve',
      denyButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      denyButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
        confirmButton: 'swal-confirm-btn',
        denyButton: 'swal-deny-btn',
        cancelButton: 'swal-cancel-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setTimeout(() => {
          // this.ApprovedReject(id, 2, '', type, encryptedUserID);
          this.TOCApprovedReject(
            teacherId,
            type,
            masterUserID,
            this.CookiesUserId,
            ''
          );
        }, 500);
      } else if (result.isDenied) {
        Swal.fire({
          title: 'Enter Reason for Rejection',
          input: 'textarea',
          inputPlaceholder: 'Type your reason here...',
          inputAttributes: {
            'aria-label': 'Type your reason here',
          },
          showCancelButton: true,
          confirmButtonText: 'Submit',
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          cancelButtonText: 'Cancel',
          preConfirm: (inputValue) => {
            if (!inputValue || inputValue.trim() === '') {
              Swal.showValidationMessage(
                'Reason for rejection cannot be empty!'
              );
              return false;
            }
            return inputValue;
          },
        }).then((reasonResult) => {
          if (reasonResult.isConfirmed && reasonResult.value) {
            var reason = reasonResult.value.trim();
            // this.ApprovedReject(id, 4, reason, type, encryptedUserID);
            this.TOCApprovedReject(
              teacherId,
              type,
              masterUserID,
              this.CookiesUserId,
              reason
            );
          }
        });
      } else {
      }
    });
  }

  TOCApprovedReject(
    teacherId: any,
    type: any,
    masterUserID: any,
    UserID: any,
    reason: any
  ) {
    if (type == 'Pending') {
      const obj = {
        teacherId: teacherId,
        // statusId: 1,
        statusId: reason == '' ? 6 : 2,
        masterUserID: masterUserID,
        AcceptRejectBy: UserID,
      };
      this.tocservice.tocApprovedReject(obj).subscribe((data) => {
        if (data.message == 'ok') {
          if (type == 'received') {
            Swal.fire({
              icon: 'success',
              title: 'Terms and Conditions',
              text: 'Please review and accept the Terms and Conditions to proceed. You can either accept or proceed with the process.',
              showDenyButton: true,
              confirmButtonText: 'Accept',
              denyButtonText: 'Proceed',
              confirmButtonColor: '#3085d6',
              denyButtonColor: '#28a745',
            }).then((result) => {
              if (result.isDenied) {
                $('a[href="#basictab3"]').tab('show');
              }
            });
          }
          if (reason == '') {
            {
              Swal.fire({
                icon: 'success',
                title: '<h3>Success!</h3>',
                text: 'Candidate approved successfully.',
              }).then((res) => {
                if (res.isConfirmed) {
                  this.getAppliedJobTOCListByStatus();
                }
              });
            }
          } else {
            Swal.fire({
              icon: 'success',
              title: '<h3>Success!</h3>',
              text: 'Candidate rejected successfully.',
            }).then((res) => {
              if (res.isConfirmed) {
                this.getAppliedJobTOCListByStatus();
              }
            });
          }
        } else {
        }
      });
    }
  }

  onTocSearchName() {
    if (!this.Name || this.Name.trim().length < 3) {
      this.Name = '';
      this.getAppliedJobTOCListByStatus();
      this.Name = '';
      return;
    } else {
      this.getAppliedJobTOCListByStatus();
    }
  }

  downloadFile(fileUrl: any) {
    const link = document.createElement('a');
    link.href = fileUrl;
    // link.target = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    link.download = 'documentFile';
    link.click();
  }

  // openPreview(url: string) {
  //   this.previewUrl = url;
  //   this.isModalVisible = true;
  // }

  openPreview(url: string, mime: string) {
    this.previewMime = mime;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.isModalVisible = true;
  }

  closePreview() {
    this.isModalVisible = false;
    this.previewUrl = null;
    this.previewMime = null;

    $('#view-del').modal('show');
  }

  onclick() {
    $('#view-del').modal('hide');
  }

  navigate() {
    this.router.navigate(['/chatbox']);
  }
}
