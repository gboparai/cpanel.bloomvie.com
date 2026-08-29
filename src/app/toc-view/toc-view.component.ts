import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TocViewService } from './toc-view.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { TimeFormatAmPmPipe, TimeFormatPipe } from '../bloomvie-management/dc-appointments-list/time-format.pipe';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import flatpickr from 'flatpickr';
import { CommonService } from '../common-component/common.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TooltipComponent } from '../common-component/tooltip/tooltip.component';
declare var $: any;

@Component({
  selector: 'app-toc-view',
  standalone: true,
  imports: [
    NgSelectModule,
    NgIf,
    NgFor,
    BreadcrumbComponent,
    NgxPaginationModule,
    TimeFormatPipe,
    CommonModule,
    FormsModule,
    TooltipComponent,
    TimeFormatAmPmPipe
  ],
  providers: [DatePipe],
  templateUrl: './toc-view.component.html',
  styleUrl: './toc-view.component.css',
})
export class TocViewComponent {
  AppliedJobTocList: any;
  ContentP: number = 1;
  Contentsize: number = 5;
  TocDetail: any;
  QualificationList: any;
  public Name: any = '';
  readonly ImageRootURL = environment.apiUrl.slice(0, -3);
  statusId: any = 3;
  documentTypeList: any;
  PinCode: any;
  UserID: number | undefined;
  TOCUserDetail: any;
  isExpanded: boolean = true;
  uniqueWorkingDayNames: string[] | undefined;
  filteredSlotsByDay: any;
  StatusList: any;
  currentExpandedDay: {
    slotIndex: number;
    dayName: string;
    weekName: string;
  } | null = null;
  expertise: any[] = [];
  selectedWorkingDays: any;
  CentreID: number | undefined;
  selectedWeeks: string[] = [];
  selectedDays: { [weekName: string]: string[] } = {};
  DayList: any;
  selectedQualification: any;
  selectedDay: any;
  StartDate: any
  EndDate: any
  isFilterVisible: boolean = false;
  toDatePickerInstance: any;
  //  previewUrl: string | null = null;
  previewUrl: SafeResourceUrl | null = null;
  isModalVisible = false;
  isClosing = false;
  userRoleID: any;
  slotTeacherID: any;
  EducationalCredentails: string = '';
  DocumentResumes: string = '';
  UploadedDocument: string = '';
  EducationalCredentailsBlob: Blob | null = null;
  DocumentResumesBlob: Blob | null = null;
  UploadedDocumentBlob: Blob | null = null;
  previewMime: string | null = null;
  hoveredRow: any = null;
 TocContentP: number = 1;
  TocContentSize: number = 5;


  constructor(
    private tocservice: TocViewService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private cookie: CookieService,
    private tocregistrationservice: TocRegistrationService,
    private datePipe: DatePipe,
    private common: CommonService, private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {
    this.UserID = parseInt(this.cookie.get('UserId'), 10);
    this.CentreID = parseInt(this.cookie.get('CentreID'), 10);
    this.userRoleID = parseInt(this.cookie.get('UserRoleId'), 10);
    this.GetAllDays();
    this.getAllMasterStatus();
    this.getQualifications();
    this.getDocumentTypeList();
    this.getAllAreaOfExpertise();
    this.getAppliedJobTOCList('Accepted');



    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 0);
  }

  ngAfterViewInit(): void {
    //this.initDateRangePicker();
    // this.initStartdate();
    this.dateRangePicker();
  }

  dateRangePicker() {
    const today = new Date();
    let toDatePickerInstance: flatpickr.Instance;

    // Start Date Picker
    flatpickr('#startdatePicker', {
      mode: 'single',
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: today,
      onChange: (selectedDates: Date[]) => {
        if (selectedDates.length) {
          const startDate = selectedDates[0];
          this.StartDate = this.datePipe.transform(startDate, 'MM-dd-yyyy');
          this.EndDate = ''
          // Dynamically update minDate for To Date Picker
          if (this.toDatePickerInstance) {
            this.toDatePickerInstance.set('minDate', startDate);
          }
        }
      }
    });

    // End Date Picker (To Date)
    this.toDatePickerInstance = flatpickr('#enddatePicker', {
      mode: 'single',
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: today,
      onChange: (selectedDates: Date[]) => {
        if (selectedDates.length) {
          this.EndDate = this.datePipe.transform(selectedDates[0], 'MM-dd-yyyy');
        }
      }
    });

  }



  // initStartdate(){
  //   this.selectedStartDate = flatpickr("#startdatePicker", {
  //     dateFormat: 'm-d-Y',
  //     allowInput: true,          
  //   });

  //   this.selectedEndDate = flatpickr("#enddatePicker", {
  //     dateFormat: 'm-d-Y',
  //     allowInput: true,          
  //   });

  // }

  // onstartDateChange(event:any): void {

  //   this.StartDate = event.target.value;
  // }

  // onendDateChange(event:any): void {
  //   this.EndDate = event.target.value;
  // }

  // initDateRangePicker() {
  //   const self = this;
  //   const currentDate = new Date(); // Get the current date

  //   flatpickr('#dateRangePicker', {
  //     mode: 'range', // Enables range selection
  //     dateFormat: 'd/m/Y', // Date format
  //     allowInput: true, // Allow manual input if needed
  //     //minDate: currentDate, // Disable past dates
  //     onClose(selectedDates) {
  //       if (selectedDates.length === 2) {
  //         const startDate = selectedDates[0];
  //         const endDate = selectedDates[1];
  //         // self.SlotForm.patchValue({
  //         //   startDate: self.datePipe.transform(startDate, 'yyyy-MM-dd'),
  //         //   endDate: self.datePipe.transform(endDate, 'yyyy-MM-dd'),
  //         // });

  //         self.StartDate = self.datePipe.transform(startDate, 'yyyy-MM-dd');
  //         self.EndDate = self.datePipe.transform(endDate, 'yyyy-MM-dd');

  //       } else {
  //         // self.SlotForm.patchValue({
  //         //   startDate: null,
  //         //   endDate: null,
  //         //   dateRange: '',
  //         // });
  //         self.StartDate = null;
  //         self.EndDate = null;
  //       }
  //     },
  //     locale: {
  //       firstDayOfWeek: 1, // Start week on Monday
  //     },
  //   });
  // }


  Onsearchclick() {
    this.spinner.show();
    var formattedstartDate: any = ''
    var endstartDate: any = ''
    if (this.StartDate && this.EndDate) {
      formattedstartDate = this.datePipe.transform(this.StartDate, 'YYYY-MM-dd');
      endstartDate = this.datePipe.transform(this.EndDate, 'YYYY-MM-dd');
    }
    var obj = {
      startDate: formattedstartDate,
      endDate: endstartDate,
      qualification: this.selectedQualification,
      day: this.selectedDay,
      time: $('#timeId').val(),
      centreid: this.CentreID
    }

    this.tocservice.getTocUserFilter(obj).subscribe(data => {
      if (data.message == "ok") {
        this.AppliedJobTocList = data.result;
        this.spinner.hide();
      }
      else {
        this.AppliedJobTocList = [];
        this.spinner.hide();
      }
    })
  }

  toggleFilter(): void {
    this.isFilterVisible = !this.isFilterVisible;
    // this.initStartdate();
    this.dateRangePicker();


  }

  resetfilter() {
    //(document.getElementById('dateRangePicker') as HTMLInputElement).value = '';
    this.StartDate = '';
    this.EndDate = '';
    (document.getElementById('startdatePicker') as HTMLInputElement).value = '';
    (document.getElementById('enddatePicker') as HTMLInputElement).value = '';
    this.selectedQualification = null;
    this.selectedDay = null;
    (document.getElementById('timeId') as HTMLInputElement).value = '';
    this.getAppliedJobTOCList('Accepted');
    //this.initDateRangePicker();
    // this.initStartdate();
  }


  getQualifications() {
    this.tocservice.getQualifications().subscribe((data) => {
      if (data.message === 'OK') {
        this.QualificationList = data.result;
      }
    });
  }

  GetAllDays() {
    this.tocservice.GetAllDays().subscribe((data) => {
      if (data.message === 'Success') {
        this.DayList = data.result;
      }
    });
  }

  isCentreIdInRequest(requestByDayCare: string | null | undefined): boolean {
    return (
      requestByDayCare?.split(',').includes(this.CentreID?.toString() || '') ??
      false
    );
  }

  isCentreIdRejected(rejectedByUser: string | null | undefined): boolean {
    return (
      rejectedByUser?.split(',').includes(this.CentreID?.toString() || '') ??
      false
    );
  }

  //Added on 05/02/25
  async getAppliedJobTOCList(status?: any) {
    const UserInfo = this.cookie.get('UserInfo');
    if (UserInfo) {
      // this.spinner.show();
      const parsedInfo = JSON.parse(UserInfo);
      this.PinCode = parsedInfo.result.pinCode;

      if (status == 'Accepted') {
        this.statusId = 6;
      } else if (status == 'Pending') {
        this.statusId = 3;
      } else {
        this.statusId = 0;
      }

      try {
        const data = await this.tocservice
          .getAppliedJobTOCList(this.Name, this.statusId, this.CentreID)
          .toPromise();
        if (data.message == 'ok') {
          setTimeout(() => {
            this.spinner.hide();
          }, 0);
          this.AppliedJobTocList = data.result;

          if (status == 'Pending') {
          }
        } else {
          this.spinner.hide();
          this.AppliedJobTocList = [];
        }
      } catch (error) {
        this.spinner.hide();
        // console.error("Error fetching job list:", error);
        this.AppliedJobTocList = [];
      }
    }
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
          this.ApprovedReject(teacherId, type, masterUserID, this.UserID);
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
          }
        });
      } else {
      }
    });
  }

  ApprovedReject(teacherId: any, type: any, masterUserID: any, UserID: any) {
    if (type == 'Pending') {
      const obj = {
        teacherId: teacherId,
        statusId: 1,
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
          } else {
            Swal.fire({
              icon: 'success',
              title: '<h3>Success!</h3>',
              text: "Candidate approved successfully. Let's wait for the teacher to accept the terms and conditions",
            });
            this.getAppliedJobTOCList('Pending');
          }
        } else {
        }
      });
    }
  }

  onSearchName() {
    if (this.statusId == 3) {
      if (!this.Name || this.Name.trim().length < 3) {
        this.Name = '';
        this.getAppliedJobTOCList('Pending');
        this.Name = '';
        return;
      } else {
        this.getAppliedJobTOCList('Pending');
      }
    } else {
      if (!this.Name || this.Name.trim().length < 3) {
        this.Name = '';
        this.getAppliedJobTOCList('Accepted');
        this.Name = '';
        return;
      } else {
        this.getAppliedJobTOCList('Accepted');
      }
    }
  }

  getDocumentTypeList() {
    this.tocservice.getDocumentTypeList().subscribe({
      next: (response) => {
        if (response.message === 'OK') {
          this.documentTypeList = response.result;
        }
        setTimeout(() => { }, 300);
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  getAllAreaOfExpertise() {
    this.tocregistrationservice
      .getAllAreaOfExpertise()
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          this.expertise = result.result.filter(
            (item: any) => item.isActive == true
          );
        }
      });
  }


  // getByIDForView(id: any) {
  //   this.spinner.show();
  //   this.TocDetail = {};

  //   this.tocservice.getAppliedJobTOByID(id).subscribe(
  //     (data: any) => {
  //       if (data.message === 'ok' && data.result && data.result.length > 0) {
  //         this.TocDetail = data.result[0];

  //         // ✅ Convert S3 file paths
  //         this.TocDetail.Educational_Credentails = this.TocDetail.educational_Credentails
  //           ? this.common.convertS3File(this.TocDetail.educational_Credentails)
  //           : '';

  //         this.TocDetail.DocumentResumes = this.TocDetail.documentResumes
  //           ? this.common.convertS3File(this.TocDetail.documentResumes)
  //           : '';

  //         this.TocDetail.UploadedDocument = this.TocDetail.uploadedDocument
  //           ? this.common.convertS3File(this.TocDetail.uploadedDocument)
  //           : '';

  //         // ✅ Qualification handling
  //         if (this.QualificationList && this.TocDetail.qualification) {
  //           const qualificationIds = this.TocDetail.qualification
  //             .split(',')
  //             .map((id: string) => parseInt(id, 10));
  //           this.TocDetail.qualificationNames = this.QualificationList.filter(
  //             (item: any) => qualificationIds.includes(item.id)
  //           )
  //             .map((item: any) => item.name)
  //             .join(', ');
  //         } else {
  //           this.TocDetail.qualificationNames = 'No qualifications listed';
  //         }

  //         // ✅ Working days
  //         if (this.TocDetail.workingDays) {
  //           const workingDayIds = this.TocDetail.workingDays
  //             .split(',')
  //             .map((day: string) => parseInt(day, 10));
  //           const daysOfWeekMapping: any = {
  //             1: 'Monday',
  //             2: 'Tuesday',
  //             3: 'Wednesday',
  //             4: 'Thursday',
  //             5: 'Friday',
  //             6: 'Saturday',
  //             7: 'Sunday',
  //           };

  //           this.TocDetail.workingDaysNames = workingDayIds
  //             .map((id: number) => daysOfWeekMapping[id])
  //             .filter((day: string | undefined) => day)
  //             .join(', ');
  //         } else {
  //           this.TocDetail.workingDaysNames = 'No working days listed';
  //         }

  //         // ✅ Document type
  //         if (
  //           this.TocDetail.uploadedDocumentType &&
  //           this.TocDetail.uploadedDocumentType.length > 0
  //         ) {
  //           const documentTypeIds = this.TocDetail.uploadedDocumentType[0];
  //           this.TocDetail.documentTypeNames =
  //             this.documentTypeList && Array.isArray(this.documentTypeList)
  //               ? this.documentTypeList.find(
  //                 (item) => item.id === documentTypeIds
  //               )?.documentType || 'Unknown Document Type'
  //               : 'Unknown Document Type';
  //         } else {
  //           this.TocDetail.documentTypeNames = 'No document types listed';
  //         }

  //         // ✅ Expertise
  //         if (this.TocDetail.expertise) {
  //           let expertiseIds: number[] = [];

  //           if (typeof this.TocDetail.expertise === 'string') {
  //             expertiseIds = this.TocDetail.expertise
  //               .split(',')
  //               .map((id: string) => parseInt(id, 10));
  //           } else if (typeof this.TocDetail.expertise === 'number') {
  //             expertiseIds = [this.TocDetail.expertise];
  //           } else if (Array.isArray(this.TocDetail.expertise)) {
  //             expertiseIds = this.TocDetail.expertise.map((id: any) =>
  //               Number(id)
  //             );
  //           }

  //           if (
  //             this.expertise &&
  //             Array.isArray(this.expertise) &&
  //             expertiseIds.length > 0
  //           ) {
  //             this.TocDetail.expertiseNames = this.expertise
  //               .filter((item: any) => expertiseIds.includes(item.id))
  //               .map((item: any) => item.name)
  //               .join(', ');
  //           } else {
  //             this.TocDetail.expertiseNames = 'No expertise listed';
  //           }
  //         } else {
  //           this.TocDetail.expertiseNames = 'No expertise listed';
  //         }

  //         this.spinner.hide();
  //       } else {
  //         this.TocDetail = [];
  //         this.spinner.hide();
  //       }
  //     },
  //     (error) => {
  //       this.spinner.hide();
  //       this.TocDetail = [];
  //     }
  //   );
  // }

  // mohit


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

  getMimeTypeFromExtension(extension: string): string {
    switch (extension.toLowerCase()) {
      case '.pdf': return 'application/pdf';
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      case '.png': return 'image/png';
      case '.doc': return 'application/msword';
      case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default: return 'application/octet-stream';
    }
  }

  openPreview(url: string, mime: string) {
    this.previewMime = mime;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.isModalVisible = true;
  }

  getByIDForView(id: any) {
    this.spinner.show();
    this.TocDetail = {};
     let centreId: number = 0;
    if (typeof this.CentreID === 'number' && !isNaN(this.CentreID)) {
      centreId = this.CentreID
    }

    this.tocservice.getAppliedJobTOByID(id,centreId).subscribe(
      (data: any) => {
        if (data.message === 'ok' && data.result && data.result.length > 0) {
          // this.TocDetail = data.result[0];
          this.spinner.hide();
          $("#view-del").modal('show');
          const item = data.result[0];
          const eduMime = this.getMimeTypeFromExtension(item.educational_Credentails_ex || '.pdf');
          const resumeMime = this.getMimeTypeFromExtension(item.documentResumes_ex || '.pdf');
          const uploadedDocMime = this.getMimeTypeFromExtension(item.uploadedDocument_ex || '.pdf');

          const eduFile = item.educational_Credentails ? this.ConvertS3File(item.educational_Credentails, eduMime) : null;

          const resumeFile = item.documentResumes ? this.ConvertS3File(item.documentResumes, resumeMime) : null;

          const uploadedDocFile = item.uploadedDocument ? this.ConvertS3File(item.uploadedDocument, uploadedDocMime) : null;

          // Assign URLs and Blobs
          this.EducationalCredentails = eduFile?.url || '';
          this.EducationalCredentailsBlob = eduFile?.blob || null;

          this.DocumentResumes = resumeFile?.url || '';
          this.DocumentResumesBlob = resumeFile?.blob || null;

          this.UploadedDocument = uploadedDocFile?.url || '';
          this.UploadedDocumentBlob = uploadedDocFile?.blob || null;

          // Main Detail
          this.TocDetail = {
            ...item,
            Educational_Credentails: eduFile?.url || '',
            DocumentResumes: resumeFile?.url || '',
            UploadedDocument: uploadedDocFile?.url || '',
          };


          // ✅ Qualification handling
          if (this.QualificationList && this.TocDetail.qualification) {
            const qualificationIds = this.TocDetail.qualification
              .split(',')
              .map((id: string) => parseInt(id, 10));
            this.TocDetail.qualificationNames = this.QualificationList.filter(
              (item: any) => qualificationIds.includes(item.id)
            )
              .map((item: any) => item.name)
              .join(', ');
          } else {
            this.TocDetail.qualificationNames = 'No qualifications listed';
          }

          // ✅ Working days
          if (this.TocDetail.workingDays) {
            const workingDayIds = this.TocDetail.workingDays
              .split(',')
              .map((day: string) => parseInt(day, 10));
            const daysOfWeekMapping: any = {
              1: 'Monday',
              2: 'Tuesday',
              3: 'Wednesday',
              4: 'Thursday',
              5: 'Friday',
              6: 'Saturday',
              7: 'Sunday',
            };

            this.TocDetail.workingDaysNames = workingDayIds
              .map((id: number) => daysOfWeekMapping[id])
              .filter((day: string | undefined) => day)
              .join(', ');
          } else {
            this.TocDetail.workingDaysNames = 'No working days listed';
          }

          // ✅ Document type
          if (this.TocDetail.uploadedDocumentType && this.TocDetail.uploadedDocumentType > 0) {
            const documentTypeIds = this.TocDetail.uploadedDocumentType;
            this.TocDetail.documentTypeNames =
              this.documentTypeList && Array.isArray(this.documentTypeList)
                ? this.documentTypeList.find(
                  (item) => item.id === documentTypeIds
                )?.documentType || 'Unknown Document Type'
                : 'Unknown Document Type';
          } else {
            this.TocDetail.documentTypeNames = 'No document types listed';
          }

          // ✅ Expertise
          if (this.TocDetail.expertise) {
            let expertiseIds: number[] = [];

            if (typeof this.TocDetail.expertise === 'string') {
              expertiseIds = this.TocDetail.expertise
                .split(',')
                .map((id: string) => parseInt(id, 10));
            } else if (typeof this.TocDetail.expertise === 'number') {
              expertiseIds = [this.TocDetail.expertise];
            } else if (Array.isArray(this.TocDetail.expertise)) {
              expertiseIds = this.TocDetail.expertise.map((id: any) =>
                Number(id)
              );
            }

            if (
              this.expertise &&
              Array.isArray(this.expertise) &&
              expertiseIds.length > 0
            ) {
              this.TocDetail.expertiseNames = this.expertise
                .filter((item: any) => expertiseIds.includes(item.id))
                .map((item: any) => item.name)
                .join(', ');
            } else {
              this.TocDetail.expertiseNames = 'No expertise listed';
            }
          } else {
            this.TocDetail.expertiseNames = 'No expertise listed';
          }

          this.spinner.hide();
        } else {
          this.TocDetail = [];
          this.spinner.hide();
        }
      },
      (error) => {
        this.spinner.hide();
        this.TocDetail = [];
      }
    );
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

  closePreview() {
    this.isModalVisible = false;
    this.previewUrl = null;
    this.previewMime = null;
    $('#view-del').modal('show');
  }

  onclick() {
    $('#view-del').modal('hide');
  }

 onPageChangeToc(page: number): void {
    this.TocContentP = page;
  }

  getTOCUserDetailByID(userid: any) {
    this.spinner.show();
    this.TOCUserDetail = [];
    let centreId: number = 0;
    if (typeof this.CentreID === 'number' && !isNaN(this.CentreID)) {
      centreId = this.CentreID
    }

    this.tocregistrationservice.getTOCUserDetailByID(userid,centreId).subscribe(
      (data) => {
        if (data.message === 'ok') {
          this.spinner.hide();
          $("#staticBackdropEdit").modal('show');
          this.TOCUserDetail = data.result.slotsGroupedByWeek;
          //Added on 16/07/25
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0); 
          this.TOCUserDetail = this.TOCUserDetail.filter((item: any) => {
            const [startStr, endStr] = item.dateRange.split(' - ');
            const startDate = new Date(startStr);
            const endDate = new Date(endStr);
            endDate.setHours(0, 0, 0, 0); 
            return endDate >= todayDate;
          });
          // End

          this.slotTeacherID = data.result.userMasterId;
          if (this.isExpanded) {
            if (data.result.workingDays) {
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
              this.selectedWorkingDays = data.result.workingDays
                .split(',')
                .map((day: string | number) => daysOfWeekMapping[+day]);
            }
            this.expandFirstRecord();
          }
          this.spinner.hide();
        } else {
          $("#staticBackdropEdit").modal('show');
          this.slotTeacherID = [];
          this.TOCUserDetail = [];
          this.spinner.hide();
        }
      },
      (error) => {
        // console.error('Error occurred while checking email:', error);
      }
    );
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

  expandFirstRecord() {
    if (this.TOCUserDetail && this.TOCUserDetail.length > 0) {
      const firstSlot = this.TOCUserDetail[0];
      if (
        firstSlot &&
        this.selectedWorkingDays &&
        this.selectedWorkingDays.length > 0
      ) {
        this.currentExpandedDay = {
          slotIndex: 0,
          dayName: this.selectedWorkingDays[0],
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

  onPlusClick(slotDetail: any, index: number) {
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

  getFilteredSlots(slotDetail: any, dayName: string) {
    return slotDetail.slots.filter(
      (slot: any) => slot.workingDayName === dayName
    );
  }

  filterStatus(StatusId: any): string | null {
    const status = this.StatusList.find(
      (data: { id: any }) => data.id === StatusId
    );
    return status ? status.status : null;
  }

  getAllMasterStatus() {
   
    this.tocregistrationservice.getAllMasterStatus().subscribe((data) => {
      if (data.message == 'OK') this.StatusList = data.result;
    });
  }


  SendTOCRequestToUser(slotid: any) {
    this.spinner.show();
    this.tocservice.SendTOCRequestToUser(slotid, this.UserID).subscribe((data) => {
      if (data.message == 'OK') {
        this.toastr.success(data.activity);
        $('#staticBackdropEdit').modal('hide');
        this.spinner.hide();
      } else {
        this.toastr.success(data.activity);
        this.spinner.hide();
      }
    });
  }

  isAllSelected(): boolean {
    return this.selectedWeeks.length === this.TOCUserDetail.length;
  }


  onWeekCheckboxChange(weekName: string, event: any): void {
    
    if (!this.uniqueWorkingDayNames || this.uniqueWorkingDayNames.length === 0) return;
    if (event.target.checked) {
      if (!this.selectedWeeks.includes(weekName)) {
        this.selectedWeeks.push(weekName);
      }
      this.selectedDays[weekName] = [...(this.uniqueWorkingDayNames || [])];
    } else {
      this.selectedWeeks = this.selectedWeeks.filter(week => week !== weekName);
      delete this.selectedDays[weekName];
    }
  }

  onDayCheckboxChange(weekName: string, dayName: string, event: any): void {
    if (!this.selectedDays[weekName]) {
      this.selectedDays[weekName] = [];
    }
    if (event.target.checked) {
      if (!this.selectedDays[weekName].includes(dayName)) {
        this.selectedDays[weekName].push(dayName);
      }
      if (!this.selectedWeeks.includes(weekName)) {
        this.selectedWeeks.push(weekName);
      }
    } else {
      this.selectedDays[weekName] = this.selectedDays[weekName].filter(day => day !== dayName);
      if (this.selectedDays[weekName].length === 0) {
        this.selectedWeeks = this.selectedWeeks.filter(week => week !== weekName);
      }
    }
  }

  onSelectAllChange(event: any): void {
    if (!this.uniqueWorkingDayNames) return;
    if (event.target.checked) {
      this.selectedWeeks = this.TOCUserDetail.map((slot: { weekName: any; }) => slot.weekName);
      this.selectedDays = {};
      this.selectedWeeks.forEach(week => {
        this.selectedDays[week] = [...(this.uniqueWorkingDayNames || [])];
      });
    } else {
      this.selectedWeeks = [];
      this.selectedDays = {};
    }
  }


  SendRequestAtOnce() {
    this.spinner.show();
    const requestData = this.selectedWeeks.map(week => ({
      weekName: week,
      userId: this.UserID,
      // tocuserId: this.TocDetail.userMasterId,
      tocuserId: this.slotTeacherID,
      selectedDays: this.selectedDays[week] || []
    }));

    this.tocservice.SendSlotRequestToUserAtOnce(requestData).subscribe(data => {
      if (data.message === "OK") {
        this.toastr.success(data.activity);
        this.spinner.hide();
        $('#staticBackdropEdit').modal('hide');
      } else {
        this.toastr.error(data.activity);
      }
      this.spinner.hide();
      this.selectedWeeks = [];
      this.selectedDays = {};
    });
  }


  // containsRequestByDayCare(slots: any[], dayName?: string): boolean {
  //   if (!slots || slots.length === 0) {
  //     return false;
  //   }
  //   return slots.some(slot => 
  //     slot.requestByDayCare == this.CentreID 
  //     && (!dayName || slot.workingDayName === dayName)
  //   );
  // }

  containsRequestByDayCare(slots: any[], dayName?: string): boolean {
    if (!slots || slots.length === 0) {
      return false;
    }
    return slots.some(slot => {
      if (!slot.requestByDayCare) {
        return false;
      }

      const requestedByDayCareList = slot.requestByDayCare.split(',').map((id: string) => id.trim());
      return requestedByDayCareList.includes(String(this.CentreID)) &&
        (!dayName || slot.workingDayName === dayName);
    });
  }



  isAllWeeksChecked(): boolean {
    if (!this.TOCUserDetail || this.TOCUserDetail.length === 0) {
      return false;
    }
    return this.TOCUserDetail.every((week: { weekName: string; slots: any[]; }) => this.selectedWeeks.includes(week.weekName) || this.containsRequestByDayCare(week.slots));
  }

  isAllWeeksDisabled(): boolean {
    if (!this.TOCUserDetail || this.TOCUserDetail.length === 0) {
      return false;
    }
    return this.TOCUserDetail.every((week: { slots: any[]; }) => this.containsRequestByDayCare(week.slots));
  }

  isWeekFullyCheckedAndDisabled(week: any): boolean {
    if (!week.slots || week.slots.length === 0) return false;
    const days = this.uniqueWorkingDayNames || [];
    return days.length > 0 && days.every(dayName =>
      this.containsRequestByDayCare(week.slots, dayName)
    );
  }

  isAllWeeksCheckedAndDisabled(): boolean {
    return this.TOCUserDetail && this.TOCUserDetail.length > 0 &&
      this.TOCUserDetail.every((week: any) => this.isWeekFullyCheckedAndDisabled(week));
  }

}
