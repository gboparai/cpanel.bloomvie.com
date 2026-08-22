
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { ManageExpenseComponent } from '../../day-care-management/manage-expense/manage-expense.component';
import { ChangeDetectorRef, Component,ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl , ReactiveFormsModule,FormGroup,Validators, RequiredValidator } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
import {ToastrService,ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { FormsModule } from '@angular/forms';
import { error } from 'node:console';
import { FullCalendarModule } from '@fullcalendar/angular'; 
import { CookieService } from 'ngx-cookie-service';
import { userInfo } from 'node:os';
import { environment } from '../../../environments/environment.development';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { BookKeepingService } from '../../common-component/book-keeping/book-keeping.service';
import { ClassroomDetailsService } from '../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { ApplicationServiceService } from '../../application-status/application-service.service';
import { DcAppointmentsListService } from '../dc-appointments-list/dc-appointments-list.service';
import { CommonService } from '../../common-component/common.service';

declare var $: any;


@Component({
  selector: 'app-student-media-request',
  standalone: true,
  imports: [    
    RouterModule,
    ManageExpenseComponent,
    BreadcrumbComponent,
    RouterLink,
    ReactiveFormsModule,
    NgFor,
    CommonModule,
    NgSelectModule,
    NgIf,
    NgxPaginationModule,
    ToastrModule,
    NgxSpinnerModule,
    FormsModule,
    FullCalendarModule
  ],
  providers:[DatePipe],
  templateUrl: './student-media-request.component.html',
  styleUrl: './student-media-request.component.css'
})
export class StudentMediaRequestComponent {

  readonly URL = environment.apiUrl.slice(0, environment.apiUrl.indexOf('/api'));
  userRoleId :any;
  userID : any | null = null;
  Name: any;
  Name2 : any;
  SubscriptionDetailsList: any[]=[]
  UpcomingPaymentsList: any[]=[]
  currentPage: number = 1;
  currentPageSecond: number = 1; 
  itemsPerPage: number = 5; // Maximum rows per page
  TotalCount:number=0;
  totalCount:number=0;
  startDate: any;
  endDate: any;

  StudentMediaRequest: any;

  planForm: FormGroup;
  planOptions = ['Basic', 'Standard', 'Premium'];
  modalInstance: any;
  planInformation: any;
  getPlansForDayCareList: any;
  getPlansList: any;
  selectedStartDate: any;
  selectedEndDate: any;
  selectedFileSize: any;
  onSelectPlan: any;
  centreID: any;
  parentID: any;

  

  constructor(private fb: FormBuilder, private service:BookKeepingService,private toastr : ToastrService,private spinner: NgxSpinnerService,
     private datepipe:DatePipe,     private applicationService: ApplicationServiceService,
        private cdr: ChangeDetectorRef,
     private cookieService: CookieService,     private ClassRoomservice: ClassroomDetailsService,
     private dcService: DcAppointmentsListService, private commonService: CommonService
     )
  {
    this.planForm = this.fb.group({
      plan: ['']
    });
  }
  ngOnInit(){
    
    //read ID from cookie
    let userRoleId = this.cookieService.get('UserRoleId');
      if(userRoleId){
        this.userRoleId = parseInt(userRoleId,10)
      }
      
    //for parents case   
      this.userID = this.cookieService.get('UserId');
      this.userID = parseInt(this.userID,10)
     
this.getStudentMediaRequest();

this.getPlan();
this.cdr.detectChanges();
   
  }

  formattedStartDate: string = '';
  formattedEndDate: string = '';
  duration: number = 0;
  fileSize: any;

  openModal(data:any) {
    this.parentID = data.parentID;
    this.centreID = data.centreID;
    this.selectedStartDate = data.startDate;
    this.selectedEndDate = data.endDate;
    this.selectedFileSize = data.fileSize
    this.formattedStartDate = this.formatDate(this.selectedStartDate);
    this.formattedEndDate = this.formatDate(this.selectedEndDate);
    this.duration = this.calculateDays(this.selectedStartDate, this.selectedEndDate);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }

  calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }


  getPlan() {
    // this.IntrestedDaycare(completedItem.id);
    // this.dayCareInformation = completedItem;
    // this.DayCareUserID = completedItem.id;
    this.applicationService
      .getAllStudentMediaPlans(this.userRoleId)
      .subscribe((data) => {
        if (data.message === 'OK') {

          this.getPlansList = data.result;

          // this.getPlansForDayCareList = data.result.filter(
          //   (res: any) => res.isDefault != true
          // );

          // this.defaultPlanList = data.result.filter(
          //   (res: any) => res.isDefault == true
          // );

          // this.DayCareUserID = completedItem.id;
        } else {
          
        }
      });
  }



  sendEmailStudentMediaRequest() {
    const userencryptID = this.commonService.encrypt(this.parentID.toString());
    const encryptPlanID = this.commonService.encrypt(this.onSelectPlan.toString());

    // let encryptedDiscountAmount = '';
    // let finalDiscountAmount = '';
    // let discountValue = this.calculatedDisCountValue.discountAmount
    //   ? this.calculatedDisCountValue.discountAmount
    //   : '0';

    // if (this.calculatedDisCountValue.discountAmount) {
    //   encryptedDiscountAmount = this.commonService.encrypt(
    //     this.calculatedDisCountValue.discountAmount.toString()
    //   );
    //   finalDiscountAmount = encryptedDiscountAmount;
    // }

    const Type = this.commonService.encrypt('studentMediaRequest');
    this.commonService
      .sendEmailStudentMediaRequest(this.parentID, this.onSelectPlan, encryptPlanID, userencryptID, Type
      )
      .subscribe((data) => {
        if (data.message === 'Success') {
          this.spinner.hide();
         
          this.toastr.success('Email Sent Successfully');

          $('#activate-plan').modal('hide');
          this.resetData();
        } else {
          this.spinner.hide();
          this.toastr.error('Something wents wrong !!');
        }
      });
  }


  submitPlan() {

    if (this.planInformation) {
      this.resetData(); 
      (document.getElementById('activate-plan') as any)?.modal('hide'); 
    }
  }
  
  resetData() {
    this.planInformation = null; 
  }


  onPlanSelect(event: any) {
   this.onSelectPlan = event.id
  }
  
  

  // SendEmailAfterMeeting() {
  //   // const encryptID = this.commonService.encrypt(this.DayCareUserID.toString());
  //   // const encryptPlanID = this.commonService.encrypt(this.PlanID.toString());

  //   // let encryptedDiscountAmount = '';
  //   // let finalDiscountAmount = '';
  //   // let discountValue = this.calculatedDisCountValue.discountAmount
  //   //   ? this.calculatedDisCountValue.discountAmount
  //   //   : '0';

  //   // if (this.calculatedDisCountValue.discountAmount) {
  //   //   encryptedDiscountAmount = this.commonService.encrypt(
  //   //     this.calculatedDisCountValue.discountAmount.toString()
  //   //   );
  //   //   finalDiscountAmount = encryptedDiscountAmount;
  //   // }

  //   // const daycareType = this.commonService.encrypt('MainDayCare');
  //   this.dcService.SendEmailAfterMeeting(this.DayCareUserID, this.PlanID, encryptPlanID, encryptID, '', '', '', '', ''
  //     )
  //     .subscribe((data) => {
  //       if (data.message === 'Success') {
  //         // this.spinner.hide();
  //         // this.getAllDayCareAppointments('Completed');
  //         // this.pageControlAcceptedList();
  //         // $('.apoint-button').prop('disabled', false);
  //         // this.toastr.success('Email Sent Successfully');

  //         // $('#activate-plan').modal('hide');
  //         // this.resetData();
  //       } else {
  //         this.spinner.hide();
  //         this.toastr.error('Something wents wrong !!');
  //       }
  //     });
  // }



getStudentMediaRequest(){
  this.ClassRoomservice.getStudentMediaRequest(this.userRoleId).subscribe(
    (data) => {
      if(data.message === 'OK'){
        this.StudentMediaRequest = data.result;
        
      } else {
        console.error('not found Data:', data.message);

      }
    }
  )
}


  



  // intitDatePicker(){
  //   let self = this;
           
  //     flatpickr("#dateRangePicker",{
  //       mode:"range",
  //       dateFormat:"m/d/y",
  //       allowInput:false,
        
  //       onClose(selectedDates : Date[]){
  //         if(selectedDates.length===2){
  //           const formatDate = (date:any) => {
  //             const year = date.getFullYear();
  //             const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
  //             const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
  //             return `${year}/${month}/${day}`;
  //           };
  //           self.startDate = formatDate(selectedDates[0]);
  //           self.endDate = formatDate(selectedDates[1]);
            
  //         }else{
  //             self.startDate = null;
  //             self.endDate = null;
              

  //         }
          
  //       },
  //     });
  // }



  
}
