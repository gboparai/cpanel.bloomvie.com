import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterLink, RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { ChatboxComponent } from '../../common-component/chatbox/chatbox.component';
import { MailboxComponent } from '../../common-component/mailbox/mailbox.component';
import { TeacherDashboardServiceService } from './teacher-dashboard-service.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment.development';
import { NgFor, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { DayCareDashboardService } from '../../day-care-management/daycare-dashboard/day-care-dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { WorkTimingService } from '../../day-care-management/work-timings/work-timings.service';
import { CommonModule, DatePipe } from '@angular/common';
import { EventsComponent } from '../../common-component/events/events.component';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";

declare var $: any;

@Component({
  selector: 'app-teachers-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    BreadcrumbComponent,
    ChatboxComponent,
    MailboxComponent,
    FullCalendarModule,
    RouterModule,
    NgFor,
    NgIf,
    NgxSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    CommonModule,
    EventsComponent,
    SkeletonLoaderComponent
  ],
  providers: [DatePipe],
  templateUrl: './teachers-dashboard.component.html',
  styleUrls: ['./teachers-dashboard.component.css'],
})
export class TeachersDashboardComponent implements OnInit {
  @ViewChild('pdfCanvas')
  pdfCanvas!: ElementRef;

  userID: any;
  countResult: any;
  centreID: any;
  dayCareEvents: any[] = [];
  // rootUrl: any = environment.apiUrl;
  rootUrl: any = environment.apiUrl.slice(0, -3);
  dayCareActivity: any[] = [];
  teacherid: any;
  employeeJoining: any;

  letterAccepted: boolean = false;
  letterSignature: any;
  filePath: any;

  @ViewChild('pdfCanvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  pdfDoc: any = null;
  pageNum: number = 1;
  pageRendering: boolean = false;
  scale: number = 1.5;
  eventList: any;
  userRoleID: string | undefined;
  dashboardCounts: any;
  holidayList: any[] = [];
  pendingActivityDetails: any[] = [];
  pendingAttendanceDetails: any;
  skalatonShowCard = 'skalatonShowCard';
  skeletonShowList = "SkeltonList";
  skeletonShowList2 = "SkeltonList2";
  skeletonShowList3 = "SkeltonList3";

  skeletonShowCalenderCard="SkeltonCalenderCard"


  ngOnInit(): void {
    this.centreID = this.cookie.get('CentreID');
    this.userID = this.cookie.get('UserId');
    this.userRoleID = this.cookie.get('UserRoleId');
    this.getDashboardPendingStudentAttandanceByuserId();
    this.getTeacherDashboardCount();
    this.getDayCareActivities();
    this.getAllEventManagementType();
    this.getAllHolidayList();

    if (this.teacherid) {
      if (this.teacherid.isOfferLetterAccepted == 1) {
        $('#AgrrementLetter').modal('hide');
      }
    } else {
      this.getEmployeeJoiningDocuments();
    }
  }

  constructor(
    private sanitizer: DomSanitizer,
    private cookie: CookieService,
    private service: TeacherDashboardServiceService,
    private WorkTimingService: WorkTimingService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private tocregistrationservice: TocRegistrationService,
    private DayCareDashBoard: DayCareDashboardService,
    private Toaster: ToastrService,
    public onBoardingService: OnboardingService
  ) { }

  getTeacherDashboardCount() {
    this.userID = this.cookie.get('UserId');
    this.service
      .getTeacherDashboardCount(this.userID, this.centreID)
      .subscribe((data: any) => {
        if (data.message == 'Ok') {
          this.countResult = data.result;
        }
      });
  }

  getAllHolidayList() {

    this.skeletonShowCalenderCard="SkeltonCalenderCard";
    this.WorkTimingService.getCentreHolidayList(this.centreID).subscribe(
      (data: any) => {
        if (data.message == 'Success') {
          this.holidayList = data.result;
    this.skeletonShowCalenderCard="";

        } else {
          this.holidayList = [];
    this.skeletonShowCalenderCard="";

        }
      }
    );
  }

  getDashboardPendingStudentAttandanceByuserId() {
    this.skalatonShowCard = 'skalatonShowCard';
    this.skeletonShowList = 'SkeltonList';
    this.skeletonShowList3 = 'SkeltonList3';
    this.service
      .getDashboardPendingStudentAttandanceByuserId(
        Number(this.userID),
        Number(this.userRoleID),
        Number(this.centreID),
        ''
      )
      .subscribe((data) => {
        if (data.message == 'ok') {
          this.dashboardCounts = data.result;
          this.pendingActivityDetails =
            this.dashboardCounts.pendingActivityDetails;
          this.pendingAttendanceDetails =
            this.dashboardCounts.pendingAttendanceDetails;
          this.skeletonShowList3 = '';
          this.skeletonShowList = '';
          this.skalatonShowCard = '';
        } else {
          this.dashboardCounts = [];
          this.pendingActivityDetails = [];
          this.pendingAttendanceDetails = [];
          this.skeletonShowList3 = '';
          this.skeletonShowList = '';
          this.skalatonShowCard = '';


        }
      });
  }

  getPdfUrl(fileName: string): SafeResourceUrl {
    // const baseUrl = this.rootUrl + '/Content/Invoice/Raw_Invoice/';
    // const fullUrl = `${baseUrl}${fileName}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(fileName);
  }

  async getEmployeeJoiningDocuments() {
    this.service
      .getEmployeeJoiningDocuments(this.userID)
      .subscribe((data: any) => {
        if (data.message == 'OK') {
          this.teacherid = data.result;
          this.filePath = data.result.s3ImageUrl
            ? this.getPdfUrl(data.result.s3ImageUrl)
            : '';
          if (this.teacherid.isOfferLetterAccepted == null) {
            $('#AgrrementLetter').modal('show');
          }
        }
      });
  }

  // mohit

  async employeeJoiningDocuments(event: string) {
    this.spinner.show();
    const ipResponse = await fetch('https://api64.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const acceptanceIP = ipData.ip; // Get the public IP

    if (event === 'reject') {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to reject the offer. This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#e84646', // Custom red color for Reject button
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.letterAccepted = false;
          this.letterSignature = null;

          this.service
            .employeeJoiningDocuments(
              this.userID,
              this.letterAccepted,
              this.letterSignature,
              acceptanceIP
            )
            .subscribe(() => {
              Swal.fire({
                title: 'Rejected!',
                text: 'You have rejected the offer letter.',
                icon: 'warning',
              }).then(() => {
                this.getEmployeeJoiningDocuments();
                $('#AgrrementLetter').modal('hide');
                this.spinner.hide();

                window.location.href = '/login';
              });
            });
        }
      });
      return;
    }

    if (event === 'accept') {
      // Validate before proceeding
      if (!this.letterAccepted || !this.letterSignature) {
        Swal.fire({
          title: 'Incomplete!',
          text: 'Please accept the offer and sign before proceeding.',
          icon: 'warning',
        });
        return;
      }
      Swal.fire({
        title: 'Confirm Acceptance',
        text: 'Are you sure you want to accept this offer?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Accept',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.service
            .employeeJoiningDocuments(
              this.userID,
              this.letterAccepted,
              this.letterSignature,
              acceptanceIP
            )
            .subscribe((data: any) => {
              if (data.message == 'OK') {
                this.employeeJoining = data.result;
                this.getEmployeeJoiningDocuments();

                $('#AgrrementLetter').modal('hide');
                this.spinner.hide();

                Swal.fire({
                  title: 'Welcome, Teacher!',
                  text: 'Your offer letter has been successfully accepted.',
                  icon: 'success',
                  confirmButtonText: 'OK',
                });
              }
            });
        }
      });
    }
    this.spinner.hide();
  }

  //   AcceptDocumentLetterByEmployeeID(type:any,isAccept:any)
  //   {
  //     //;
  //     var ipAddress= this.ipadd;
  //     var data1=$('#signature').val();

  //     var UserId = JSON.parse(this.UserId);
  //     const acceptanceDate = new Date().toLocaleString('en-US', {
  //       day: '2-digit',
  //       month: '2-digit',
  //       year: 'numeric',
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: true
  //     });// Get current date in 'YYYY-MM-DD' format

  //     if (isAccept === false) {
  //       Swal.fire({
  //         title: '<h3>Reject Confirmation</h3>',
  //         text: `Are you sure you want to reject this offer letter?`,
  //         icon: 'warning',
  //         showCancelButton: true,
  //         confirmButtonText: 'Yes',
  //         cancelButtonText: 'No',
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           if(type=="OfferLetter"){
  //             this.IsOfferTouch = true;
  //           }

  //           this.headerService.AcceptDocumentLetterByEmployeeID(UserId, type, isAccept,ipAddress,data1).subscribe((data) => {

  //             if (data.message == "OK") {
  //               this.toastr.error("Offer Letter rejected successfully")
  //                 // 'Rejected'
  //             }
  //             $("#AgrrementLetter").modal("hide");
  //             setTimeout(() => {
  //               this.router.navigate(['login']);
  //             }, 100);
  //           });
  //         }
  //       });
  //     }else{
  //       if ($('#exampleCheckbox').is(":checked") == true && data1!="") {

  //         this.headerService.AcceptDocumentLetterByEmployeeID(UserId, type, isAccept,ipAddress,data1).subscribe((data) => {

  //           if (data.message == "OK") {
  //             Swal.fire({
  //               title: '<h3>Accepted</h3>',
  //               text: `Thankyou for accepting the offer letter. You have accepted this offer on ${acceptanceDate}`,
  //               icon: 'success',
  //             }).then((result) => {
  //             });
  //             setTimeout(() => {
  //               $("#info-alert-modal").modal("show");
  //             }, 100);
  //           }
  //           $("#AgrrementLetter").modal("hide");
  //         });
  //         // 'Accepted'
  //       $("#AgrrementLetter").modal("hide");
  //       }else{
  //        if(data1==""){this.toastr.error("Please provide your signature")};
  //         if($('#exampleCheckbox').is(":checked")!=true)
  //         {
  //           Swal.fire({
  //             title: 'Confirmation',
  //             text: 'Please mark the checkbox to signify your acceptance.',
  //             icon: 'info',
  //             confirmButtonText: 'Okay',
  //           });
  //         }
  //     }

  //   }
  // }

  // handleCheckboxClick() {

  //   if ($('#exampleCheckbox').is(':checked')) {
  //     Swal.fire({
  //       // title: '<h3>Confirmation</h3>',
  //       text: 'Make sure you have read the offer letter completely by scrolling it till the end.',
  //       icon: 'info',
  //       confirmButtonText: 'Okay',
  //     });
  //   }
  // }

  handleKeyPress(event: KeyboardEvent): boolean {
    const inputChar = event.key;
    // Check if the input character is alphabetic (a-zA-Z) or a space
    const alphabeticRegex = /^[a-zA-Z\s]*$/;
    return alphabeticRegex.test(inputChar);
  }

  // loadPdfFromUrl(url: string, type: any): void {
  //   var base64 = "";
  //   fetch(url)
  //     .then(response => response.blob())
  //     .then(blob => {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         base64 = 'data:application/pdf;base64,' + reader.result?.toString().split(',')[1] || '';
  //         setTimeout(() => {
  //           this.pdfObject = type === "offerLetter" ? PDFObject.embed(base64, '#pdfContainer2') : PDFObject.embed(base64, '#pdfContractLetter');
  //         }, 500);
  //       };
  //       reader.readAsDataURL(blob);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching or embedding PDF:', error);
  //     });
  // }

  getDayCareActivities() {
    this.skeletonShowList2 = "SkeltonList2";
    this.service.getDayCareActivities(this.centreID).subscribe((data: any) => {
      this.dayCareActivity = data.result;
      this.skeletonShowList2 = "";
    });
  }

  getAllEventManagementType() {
    this.DayCareDashBoard.getAllEventManagementType().subscribe((data: any) => {
      if (data.message == 'Ok') {
        this.eventList = data.result;
      } else {
        this.eventList = [];
      }
    });
  }

  navigateToStripeOnboarding() {
    window.location.href =
      this.onBoardingService.onboardingState().stripeOnboardingUrl;
  }
}
