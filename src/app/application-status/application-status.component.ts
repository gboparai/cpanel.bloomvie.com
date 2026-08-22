import { Component, OnInit, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormBuilder, Validators } from '@angular/forms';
import { Toast, ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { ApplicationServiceService } from './application-service.service';
import { ApplicationsSettingsService } from '../settings/application-settings/applications-settings/applications-settings.service';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import {
  TimeFormatAmPmPipe,
  TimeFormatPipe,
} from '../bloomvie-management/dc-appointments-list/time-format.pipe';
import { DcAppointmentsListService } from '../bloomvie-management/dc-appointments-list/dc-appointments-list.service';
import flatpickr from 'flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { DaycareManualAppointmentService } from '../bloomvie-management/dc-appointments-list/daycare-manual-appointment/daycare-manual-appointment.service';
import { ReactiveFormsModule } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { AppService } from '../app.service';
import { CommonService } from '../common-component/common.service';
import { AddDiscountService } from '../day-care-management/add-discount/add-discount.service';
import { SkeletonLoaderComponent } from '../common-component/skeleton-loader/skeleton-loader.component';
import { TooltipComponent } from '../common-component/tooltip/tooltip.component';

declare var $: any;
interface discountInfo {
  planAmount: string;
  discountPercantage: string;
  discountAmount: string;
  finalAmount: string;
}

@Component({
  selector: 'app-application-status',
  standalone: true,
  imports: [
    RouterLink,
    BreadcrumbComponent,
    CommonModule,
    NgxPaginationModule,
    TimeFormatAmPmPipe,
    NgSelectModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    FormsModule,
    SkeletonLoaderComponent,
    TooltipComponent,
  ],
  templateUrl: './application-status.component.html',
  styleUrl: './application-status.component.css',
})
export class ApplicationStatusComponent implements OnInit {
  isMeetAttempList: any = [];
  completeList: any = [];
  getPlansForDayCareList: any[] = [];
  ContentsizeAcceptedList: number = 5;
  ContentAcceptedList: number = 1;
  ContentsizePendingList: number = 5;
  ContentPendingList: number = 1;
  UserID: any;
  filteredAcceptbyCounsellor: any;
  notification: any;
  fullName: any;
  InterestedUser: any;
  sendLink: any;
  viewAction: any;
  displayInterestedUser: any = null;
  statusId: any = 7;
  AppointmentListAcceptedLength: any;
  AppointmentListPendingLength: any;
  PlanData: any;
  DayCareUserID: any;
  availableSlots: any;
  selectedDate: any;
  rescheduleForm: any;
  userRoleId: any;
  PlanID: any;
  zoomMeetingForm: any;
  rescheduleSearchItem: any;
  completeSearchItem: any;
  planDescriptionDetails: any;
  dayCareInformation: any;
  planInformation: any;
  discountPercantage: any;
  discountPercantageList: any[] = [];
  viewDiscountSheet: boolean = false;
  calculatedDisCountValue: discountInfo = {
    planAmount: '',
    discountPercantage: '',
    discountAmount: '',
    finalAmount: '',
  };
  intresetedDayCareId: any;
  messages: any;
  defaultPlanList: any[] = [];
  selectedDefaultPlan: any;
  userOffset: string = '';
  // regionID: number = 0;
  skeletonShow = 'Skelton';
  hoveredRow: any = null;
  regionResponse: any;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private applicationService: ApplicationServiceService,
    private dcmanualService: DaycareManualAppointmentService,
    private spinner: NgxSpinnerService,
    private cookie: CookieService,
    private Appservice: ApplicationsSettingsService,
    private service: DcAppointmentsListService,
    private commonService: CommonService,
    private discountService: AddDiscountService
  ) {
    this.rescheduleForm = this.fb.group({
      dayCareId: ['', [Validators.required]],
      slotId: ['', [Validators.required]],
      link: ['', [Validators.required]],
      slotDate: ['', [Validators.required]],
      counsellorID: [''],
    });

    this.zoomMeetingForm = fb.group({
      topic: ['Daycare plan discussion'],
      type: ['2'],
      start_time: [''],
      duration: [''],
      timezone: ['Asia/Kolkata'],
    });
    effect(() => {
      let region = this.commonService.regionResponseSignal();
      if (region.offsetString != '') {
        this.regionResponse = this.commonService.regionResponseSignal();
        this.getAllDayCareAppointments('Reschedule');
      }
    });
  }

  trailDays: number | null = null;
  errorMessage: string = '';

  validateTrailDays() {
    if (this.trailDays !== null) {
      if (this.trailDays < 1) {
        this.trailDays = 1;
        this.errorMessage = 'Value cannot be less than 1.';
      } else if (this.trailDays > 15) {
        this.trailDays = 15;
        this.errorMessage = 'Value cannot be more than 15.';
      } else {
        this.errorMessage = ''; // Clear the error message if valid
      }
    }
  }

  ngOnInit() {
    this.UserID = parseInt(this.cookie.get('UserId'), 10);
    const UserInfo = this.cookie.get('UserInfo');
    this.userRoleId = parseInt(this.cookie.get('UserRoleId'));
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
    this.userOffset = this.getGMTOffsetString();
    if (this.regionResponse) {
      this.getAllDayCareAppointments('Reschedule');
    }
    this.assignAction();
    $('.apoint-button').prop('disabled', true);
  }

  ngAfterViewInit(): void {
    const currentDate = new Date();
    flatpickr('#datePickerSelectDate', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: currentDate,
    });
  }

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

  //Commented on 30/04/25
  getAllDayCareAppointments(status: any, searchItem?: any) {
    // let region = this.commonService.findRegion();
    let searchValue = !searchItem ? '' : searchItem;
    this.skeletonShow = 'Skelton';
    if (status == 'Reschedule') {
      this.statusId = 7;
      this.completeSearchItem = '';
      this.applicationService
        .getAppointmentList(
          this.statusId,
          searchValue,
          this.regionResponse.offsetHours,
          this.regionResponse.offsetMinutes
        )
        .subscribe((data: any) => {
          this.isMeetAttempList = data.result;
          this.skeletonShow = '';
          this.filteredAcceptbyCounsellor = this.isMeetAttempList.filter(
            (appointment: { counsellorID: any }) =>
              appointment.counsellorID === this.UserID
          );
          this.getNotifications();
        });
    } else {
      this.statusId = 8;
      this.rescheduleSearchItem = '';
      this.applicationService
        .getAppointmentList(
          this.statusId,
          searchValue,
          this.regionResponse.offsetHours,
          this.regionResponse.offsetMinutes
        )
        .subscribe((data: any) => {
          this.completeList = data.result;
          this.skeletonShow = '';
          this.filteredAcceptbyCounsellor = this.completeList.filter(
            (appointment: { counsellorID: any }) =>
              appointment.counsellorID === this.UserID
          );
          this.getNotifications();
        });
    }
  }

  //Arsh Added on 30/04/25
  // getAllDayCareAppointments(status: any, searchItem?: any) {
  //   let searchValue = !searchItem ? '' : searchItem;
  //   this.spinner.show();

  //   if (status === 'Reschedule') {
  //     this.statusId = 7;
  //     this.completeSearchItem = '';
  //     this.applicationService
  //       .getAppointmentList(this.statusId, searchValue, this.userOffset)
  //       .subscribe((data: any) => {
  //         if (data?.result && data.result.length > 0) {
  //           const filteredByUtc = this.commonService.getUtcTime(data.result);
  //           this.isMeetAttempList = filteredByUtc;

  //           this.filteredAcceptbyCounsellor = this.isMeetAttempList.filter(
  //             (appointment: { counsellorID: any }) =>
  //               appointment.counsellorID === this.UserID
  //           );
  //         } else {
  //           this.isMeetAttempList = [];
  //           this.filteredAcceptbyCounsellor = [];
  //         }

  //         this.spinner.hide();
  //         this.getNotifications();
  //       });
  //   } else {
  //     this.statusId = 8;
  //     this.rescheduleSearchItem = '';
  //     this.applicationService
  //       .getAppointmentList(this.statusId, searchValue, this.userOffset)
  //       .subscribe((data: any) => {
  //         if (data?.result && data.result.length > 0) {
  //           const filteredByUtc = this.commonService.getUtcTime(data.result);
  //           this.completeList = filteredByUtc;

  //           this.filteredAcceptbyCounsellor = this.completeList.filter(
  //             (appointment: { counsellorID: any }) =>
  //               appointment.counsellorID === this.UserID
  //           );
  //         } else {
  //           this.completeList = [];
  //           this.filteredAcceptbyCounsellor = [];
  //         }

  //         this.spinner.hide();
  //         this.getNotifications();
  //       });
  //   }
  // }

  addDuration(dateTime: string, duration: string): string {
    const initialDate = new Date(dateTime);
    const [hours, minutes, seconds] = duration.split(':').map(Number);

    initialDate.setUTCHours(initialDate.getUTCHours() + hours);
    initialDate.setUTCMinutes(initialDate.getUTCMinutes() + minutes);
    initialDate.setUTCSeconds(initialDate.getUTCSeconds() + seconds);

    initialDate.setUTCHours(initialDate.getUTCHours() + 5);
    initialDate.setUTCMinutes(initialDate.getUTCMinutes() + 30);

    return initialDate.toISOString().split('.')[0];
  }

  calculateDuration(slotStartTime: string, slotEndTime: string): string {
    const start = new Date(`2024-12-09T${slotStartTime}Z`);
    const end = new Date(`2024-12-09T${slotEndTime}Z`);

    const diffInMs = end.getTime() - start.getTime();

    const durationInMinutes = Math.floor(diffInMs / (1000 * 60));
    const durationInSeconds = Math.floor(diffInMs / 1000);

    return `${durationInMinutes}`;
  }

  getDayCareID(isMeetAttempt: any) {

    if (isMeetAttempt.counsellorID == null) {
      this.rescheduleForm.patchValue({
        dayCareId: isMeetAttempt.id,
        counsellorID: this.UserID,
      });
    } else {
      this.rescheduleForm.patchValue({
        dayCareId: isMeetAttempt.id,
      });
    }
  }

  date(event: any) {
    this.selectedDate = event.target.value;

    if (this.selectedDate) {
      this.getAvailableSlots();
    }
  }

  formatLabel(slot: any): string {
    return `${slot.slotStartTime} - ${slot.slotEndTime}`;
  }

  onReschedule() {
    this.spinner.show();
    let slotData = this.availableSlots.filter(
      (val: any) => val.slotID == this.rescheduleForm.value.slotId
    );
    let startTime = this.addDuration(
      slotData[0].slotDate,
      slotData[0].slotStartTime
    );
    let duration = this.calculateDuration(
      slotData[0].slotStartTime,
      slotData[0].slotEndTime
    );

    this.zoomMeetingForm.patchValue({
      start_time: startTime,
      duration: duration,
    });

    this.service
      .getZoomMeetingLink(this.zoomMeetingForm.value)
      .subscribe((res: any) => {
        if (res.message == 'Success') {
          let convertedResult = JSON.parse(res.result);
          let obj = {};

          if (this.rescheduleForm.value.counsellorID == '') {
            obj = {
              dayCareId: this.rescheduleForm.value.dayCareId,
              slotId: this.rescheduleForm.value.slotId,
              link: convertedResult.join_url,
              hostLink: convertedResult.start_url,
              // regionID: this.regionID,
              regionHours: this.regionResponse.offsetHours,
              regionMinutes: this.regionResponse.offsetMinutes,
            };
          } else {
            obj = {
              dayCareId: this.rescheduleForm.value.dayCareId,
              slotId: this.rescheduleForm.value.slotId,
              link: convertedResult.join_url,
              hostLink: convertedResult.start_url,
              counsellorID: this.rescheduleForm.value.counsellorID,
              regionHours: this.regionResponse.offsetHours,
              regionMinutes: this.regionResponse.offsetMinutes,
            };
          }

          this.applicationService
            .rescheduleMeeting(obj)
            .subscribe((response: any) => {
              if (response.message == 'Success') {
                this.toastr.success('Meeting Rescheduled Successfully');
                $('#view-del3').modal('hide');
                this.rescheduleForm.reset();
                this.availableSlots = [];
                this.getAllDayCareAppointments('Reschedule');
                this.pageControlAcceptedList();
                this.spinner.hide();
              } else {
                this.toastr.error('Something wents wrong !!');
                this.spinner.hide();
              }
            });
        } else {
          this.spinner.hide();
          this.toastr.error('Something wents wrong !!');
        }
      });
  }

  onClose() {
    this.rescheduleForm.reset();
    $('#view-del3').modal('hide');
  }

  getAvailableSlots() {
    this.dcmanualService
      .getAvailableSlots(
        this.UserID,
        this.selectedDate,
        this.regionResponse.offsetHours,
        this.regionResponse.offsetMinutes
      )
      .subscribe({
        next: (data) => {
          if (data.message === 'OK') {
            this.availableSlots = data.result;
          } else {
            console.error('Error fetching slots:', data.message);
          }
        },
        error: (err) => {
          console.error('API Error:', err);
        },
      });
  }

  public searchText: string = '';
  filteredcompleteList: any;
  filteredisMeetAttempList: any;

  applyFilter() {
    const term = this.searchText.trim().toLowerCase();

    this.filteredcompleteList = this.completeList.filter(
      (item: any) =>
        item.name?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.centreName?.toLowerCase().includes(term)
    );

    this.ContentAcceptedList = 1;
  }

  get displayedcompleteList() {
    return this.searchText?.trim()
      ? this.filteredcompleteList
      : this.completeList;
  }

  getRescheduleSearchItem() {
    const term = this.searchText.trim().toLowerCase();

    this.filteredisMeetAttempList = this.isMeetAttempList.filter(
      (item: any) =>
        item.name?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.centreName?.toLowerCase().includes(term)
    );

    this.ContentAcceptedList = 1;
  }

  get displayedMeetAttempList() {
    return this.searchText?.trim()
      ? this.filteredisMeetAttempList
      : this.isMeetAttempList;
  }

  updateMessage(event: any) {
    const trialDays = event.target.value;
    if (trialDays && !isNaN(trialDays) && trialDays > 0) {
      this.messages = `Your payment will start getting deducted after ${trialDays} days.`;
    } else {
      let inputField = <HTMLInputElement>document.getElementById('trailDays');
      if (inputField) {
        inputField.value = '';
        this.messages = '';
      }
    }
  }

  istrialSubmitButton(): boolean {
    var trailsDays = $('#trailDays').val();
    if (
      this.selectedDefaultPlan != null &&
      this.selectedDefaultPlan != '' &&
      trailsDays != ''
    ) {
      return false;
    } else {
      return true;
    }
  }

  TrialDuration() {
    // isha
    this.spinner.show();
    var trailsDays = $('#trailDays').val();
    if (this.intresetedDayCareId > 0)
      this.applicationService
        .activateTrial(this.intresetedDayCareId, trailsDays)
        .subscribe((data) => {
          if (data.message == 'OK') {
            $('.apoint-button').prop('disabled', true);
            const secretKey = 'encrypt135790';
            // this.DayCareUserID = 51;
            // this.PlanID = 1;
            const encryptID = CryptoJS.AES.encrypt(
              this.DayCareUserID.toString(),
              secretKey
            ).toString();
            // alert(encryptID);
            // const dayCareUserencryptID = encryptID.replace(/\+/g, '%2B');
            // const encryptPlanID = CryptoJS.AES.encrypt(
            //   this.selectedDefaultPlan.toString(),
            //   secretKey
            // ).toString();
            // const planencryptID = encryptPlanID.replace(/\+/g, '%2B');

            const dayCareUserencryptID = this.commonService.encrypt(
              this.DayCareUserID.toString()
            );
            const planencryptID = this.commonService.encrypt(
              this.selectedDefaultPlan.toString()
            );

            const encryptedTrialDays = this.commonService.encrypt(trailsDays);

            // let encryptedTrialDays = CryptoJS.AES.encrypt(
            //   trailsDays.toString(),
            //   secretKey
            // ).toString();

            // encryptedTrialDays = encryptedTrialDays.replace(/\+/g, '%2B');

            let encryptedDiscountAmount = '';
            let finalDiscountAmount = '';

            let discountValue = this.calculatedDisCountValue.discountAmount
              ? this.calculatedDisCountValue.discountAmount
              : '0';

            if (this.calculatedDisCountValue.discountAmount) {
              const encryptedDiscountAmount = this.commonService.encrypt(
                this.calculatedDisCountValue.discountAmount.toString()
              );

              // encryptedDiscountAmount = CryptoJS.AES.encrypt(
              //   this.calculatedDisCountValue.discountAmount.toString(),
              //   secretKey
              // ).toString();

              finalDiscountAmount = encryptedDiscountAmount.replace(
                /\+/g,
                '%2B'
              );
            }

            const DayCareType = this.commonService.encrypt('MainDayCare');

            this.service
              .SendEmailAfterMeeting(
                this.DayCareUserID,
                this.selectedDefaultPlan,
                planencryptID,
                dayCareUserencryptID,
                finalDiscountAmount,
                DayCareType,
                discountValue,
                encryptedTrialDays,
                trailsDays
              )
              .subscribe((data) => {
                if (data.message === 'Success') {
                  this.spinner.hide();
                  this.getAllDayCareAppointments('Completed');
                  this.pageControlAcceptedList();
                  $('.apoint-button').prop('disabled', false);
                  this.toastr.success('Email Sent Successfully');

                  $('#Free-trial').modal('hide');
                  this.resetData();
                } else {
                  this.spinner.hide();
                  this.toastr.error('Something wents wrong !!');
                }
              });
          } else {
            this.spinner.hide();
            this.toastr.error('Daycare not found');
          }
        });
  }

  isButtonActive(): boolean {
    return this.planInformation ? false : true;
  }
  IntrestedDaycare(id: any) {
    this.intresetedDayCareId = id;
  }

  completeMeeting(ID: any) {
    Swal.fire({
      title: `<span style='font-size: 17px'>Do you want to Complete the daycare meeting ?<span>`,
      icon: `warning`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.service.completeDaycareMeeting(ID).subscribe((result: any) => {
            if (result.message == 'Success') {
              this.getAllDayCareAppointments('Reschedule');
              this.pageControlAcceptedList();
              Swal.fire('Meeting Completed successfully!', '', 'success');
            }
          });
        }
      },
      (error) => {
        this.toastr.error('Server not responding.', 'Service Error');
      }
    );
  }

  getNotifications() {
    this.Appservice.GetNofications(this.UserID).subscribe((data) => {
      if (data.message === 'ok') {
        this.notification = data.result;
      }
    });
  }

  isAccepted(appointmentId: number): boolean {
    return this.filteredAcceptbyCounsellor.some(
      (appointment: { id: number }) => appointment.id === appointmentId
    );
  }

  // AssiggnCounsellor(email :any ){
  //   const meetingLink = (document.getElementById('meetingLink') as HTMLInputElement).value;
  //   if(meetingLink != '') {
  //     this.Form.patchValue({
  //       email: email,
  //       counsellorID:this.UserID,
  //       link: meetingLink
  //     })
  //     this.service.ManageCousellor(this.Form.value).subscribe((data: any) => {
  //       if (data.message === "Success") {
  //         this.toastr.success('Request Confirm');
  //         $('#slot-info').modal('hide');
  //       //  this.getAllDayCareAppointments();
  //        this.pageControlPendingList();
  //        (document.getElementById('meetingLink') as HTMLInputElement).value = '';

  //       } else {
  //          this.toastr.error(data.message);
  //       }
  //     })
  //   }else{
  //     this.toastr.error("Link cannot be Empty")
  //   }

  // }

  // getByID(ID :any)
  // {

  //     $('#slot-info').modal('show');

  //   this.service.getIntersetedUserByID(ID).subscribe(data => {
  //     if (data.message === "ok") {
  //       this.InterestedUser = data.result;

  //     }
  //   });
  // }

  getByIDForView(ID: any) {
    this.spinner.show();
    const region = this.commonService.regionResponseSignal();
    this.service.getIntersetedUserByID(ID, region.offsetHours, region.offsetMinutes).subscribe((data) => {
      if (data.message === 'ok') {
        this.displayInterestedUser = data.result;
        $('#view-del').modal('show');
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    });
  }

  selectFreeTrial() {
    $('#select-option').modal('hide');
    $('#Free-trial').modal('show');
  }

  selectActivatePlan() {
    $('#select-option').modal('hide');
    $('#activate-plan').modal('show');
  }
  // SendEmailAfterMeeting() {
  //   var DDLval = $("#planSelect").val();
  //   this.service.SendEmailAfterMeeting(this.DayCareUserID, DDLval).subscribe(data => {
  //     if (data.message === "Success") {
  //       // this.displayInterestedUser = data.result;
  //       this.getAllDayCareAppointments("Completed");
  //       this.pageControlAcceptedList();
  //       this.toastr.success('Email Sent Successfully');

  //       $("#view-del2").modal('hide');
  //     }
  //   });
  // }

  // SendEmailAfterMeeting() {
  //   this.spinner.show();
  //   var trailsDays = $('#trailDays').val();
  //   if (this.intresetedDayCareId > 0)
  //     this.applicationService
  //       .activateTrial(this.intresetedDayCareId, trailsDays)
  //       .subscribe((data) => {
  //         if (data.message == 'OK') {
  //           $('.apoint-button').prop('disabled', true);
  //           const secretKey = 'encrypt135790';
  //           // this.DayCareUserID = 51;
  //           // this.PlanID = 1;
  //           const encryptID = CryptoJS.AES.encrypt(
  //             this.DayCareUserID.toString(),
  //             secretKey
  //           ).toString();
  //           // alert(encryptID);
  //           const dayCareUserencryptID = encryptID.replace(/\+/g, '%2B');
  //           const encryptPlanID = CryptoJS.AES.encrypt(
  //             this.PlanID.toString(),
  //             secretKey
  //           ).toString();
  //           const planencryptID = encryptPlanID.replace(/\+/g, '%2B');

  //           let encryptedDiscountAmount = '';
  //           let finalDiscountAmount = '';
  //           let discountValue = this.calculatedDisCountValue.discountAmount
  //             ? this.calculatedDisCountValue.discountAmount
  //             : '0';

  //           if (this.calculatedDisCountValue.discountAmount) {
  //             encryptedDiscountAmount = CryptoJS.AES.encrypt(
  //               this.calculatedDisCountValue.discountAmount.toString(),
  //               secretKey
  //             ).toString();

  //             finalDiscountAmount = encryptedDiscountAmount.replace(
  //               /\+/g,
  //               '%2B'
  //             );
  //           }

  //           const DayCareType = 'MainDayCare';
  //           this.service
  //             .SendEmailAfterMeeting(
  //               this.DayCareUserID,
  //               this.PlanID,
  //               planencryptID,
  //               dayCareUserencryptID,
  //               finalDiscountAmount,
  //               DayCareType,
  //               discountValue
  //             )
  //             .subscribe((data) => {
  //               if (data.message === 'Success') {
  //                 this.spinner.hide();
  //                 this.getAllDayCareAppointments('Completed');
  //                 this.pageControlAcceptedList();
  //                 $('.apoint-button').prop('disabled', false);
  //                 this.toastr.success('Email Sent Successfully');

  //                 $('#view-del2').modal('hide');
  //                 this.resetData();
  //               } else {
  //                 this.spinner.hide();
  //                 this.toastr.error('Something wents wrong !!');
  //               }
  //             });
  //         } else {
  //           this.spinner.hide();
  //           this.toastr.error('Daycare not found');
  //         }
  //       });
  // }

  SendEmailAfterMeeting() {
    $('.apoint-button').prop('disabled', true);
    const encryptID = this.commonService.encrypt(this.DayCareUserID.toString());
    const encryptPlanID = this.commonService.encrypt(this.PlanID.toString());

    let encryptedDiscountAmount = '';
    let finalDiscountAmount = '';
    let discountValue = this.calculatedDisCountValue.discountAmount
      ? this.calculatedDisCountValue.discountAmount
      : '0';

    if (this.calculatedDisCountValue.discountAmount) {
      encryptedDiscountAmount = this.commonService.encrypt(
        this.calculatedDisCountValue.discountAmount.toString()
      );
      finalDiscountAmount = encryptedDiscountAmount;
    }

    const daycareType = this.commonService.encrypt('MainDayCare');

    this.service
      .SendEmailAfterMeeting(
        this.DayCareUserID,
        this.PlanID,
        encryptPlanID,
        encryptID,
        finalDiscountAmount,
        daycareType,
        discountValue,
        '',
        ''
      )
      .subscribe((data) => {
        if (data.message === 'Success') {
          this.spinner.hide();
          this.getAllDayCareAppointments('Completed');
          this.pageControlAcceptedList();
          $('.apoint-button').prop('disabled', false);
          this.toastr.success('Email Sent Successfully');

          $('#activate-plan').modal('hide');
          this.resetData();
        } else {
          this.spinner.hide();
          this.toastr.error('Something wents wrong !!');
        }
      });
  }

  getPlansForDaycare(completedItem: any) {
    this.IntrestedDaycare(completedItem.id);
    this.dayCareInformation = completedItem;
    this.DayCareUserID = completedItem.id;
    this.applicationService
      .getPlansForDaycare(this.userRoleId)
      .subscribe((data) => {
        if (data.message === 'OK') {
          this.getPlansForDayCareList = data.result.filter(
            (res: any) => res.isDefault != true
          );

          this.defaultPlanList = data.result.filter(
            (res: any) => res.isDefault == true
          );
          this.DayCareUserID = completedItem.id;
        } else {

        }
      });
  }

  resetData() {
    this.planInformation = null;
    this.planDescriptionDetails = null;
    this.discountPercantage = null;
    this.calculatedDisCountValue = {
      planAmount: '',
      discountPercantage: '',
      discountAmount: '',
      finalAmount: '',
    };
    $('#trailDays').val(null);
    this.selectedDefaultPlan = null;
  }

  viewDiscountData() {
    this.viewDiscountSheet = false;
    this.calculatedDisCountValue.discountPercantage = '';
    this.calculatedDisCountValue.discountAmount = '';
    this.calculatedDisCountValue.finalAmount = '';
    this.calculatedDisCountValue.planAmount = '';
  }

  // getDiscountAmount() {
  //   this.calculatedDisCountValue.discountPercantage = this.discountPercantage;
  //   let discountArray = this.discountPercantage.split(' ');
  //   let discountValue = discountArray[0];

  //   let discountAmount = Math.round(this.planDescriptionDetails.price * (discountValue / 100));

  //   this.calculatedDisCountValue.discountAmount = discountAmount.toString();

  //   let finalAmount = this.planDescriptionDetails.price - discountAmount;

  //   this.calculatedDisCountValue.finalAmount = finalAmount.toString();
  //   this.calculatedDisCountValue.planAmount = this.planDescriptionDetails.price;
  //   if (this.calculatedDisCountValue) {
  //     this.viewDiscountSheet = true;
  //   }
  // }

  getDiscountAmount() {
    this.calculatedDisCountValue.discountPercantage = this.discountPercantage;

    let discountArray = this.discountPercantage.split(' ');
    let discountValue = parseFloat(discountArray[0]);

    let discountAmount =
      this.planDescriptionDetails.price * (discountValue / 100);

    this.calculatedDisCountValue.discountAmount = discountAmount.toFixed(2);

    let finalAmount = this.planDescriptionDetails.price - discountAmount;

    this.calculatedDisCountValue.finalAmount = finalAmount.toFixed(2);
    this.calculatedDisCountValue.planAmount = this.planDescriptionDetails.price;

    if (this.calculatedDisCountValue) {
      this.viewDiscountSheet = true;
    }
  }

  getPlanId(event: any) {
    if (event.id != undefined) {
      this.spinner.show();
    }

    // for (let i = 1; i < 100; i++) {
    //   this.discountPercantageList.push({
    //     label: `${i} %`,
    //   });
    // }

    $('.apoint-button').prop('disabled', false);
    this.PlanID = event.id;
    this.applicationService
      .getSubscriptionPlansByID(event.id)
      .subscribe((res: any) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 0);

        if (res.message == 'Success') {
          this.planDescriptionDetails = res.result;
          this.getDiscountsForSelectedPlan(this.PlanID);
        }
      });
  }

  resetTrialForm() {
    setTimeout(() => {
      let inputField = <HTMLInputElement>document.getElementById('trailDays');
      if (inputField) {
        inputField.value = '';
        this.messages = '';
        this.selectedDefaultPlan = null;
      }
    }, 0);
  }

  getPlan() {
    this.service.getSubscriptionPlanByUserId(1).subscribe((data) => {
      if (data.message === 'OK') {
        this.PlanData = data.result;
      }
    });
  }

  assignAction() {
    let userRoleId = this.cookie.get('UserRoleId');

    if (userRoleId == '1') {
      this.viewAction = true;
    } else {
      this.viewAction = false;
    }
  }

  // changeAppointmentRequest(ID : number) {
  //   Swal.fire({
  //       title:`<span style='font-size: 17px'>Do you want to change the request ?<span>`,
  //       icon:`warning`,
  //       showCancelButton: true,
  //       confirmButtonText: 'Yes',
  //       cancelButtonText :'No'
  //     }).then((result)=>{
  //       if(result.isConfirmed){
  //           this.service.changeDayCareRequest(ID).subscribe((result:any) => {
  //             if(result.message == 'Success')
  //             {
  //               // this.getAllDayCareAppointments("Accepted");
  //               this.pageControlAcceptedList();
  //               Swal.fire('Request Changed successfully!', '', 'success');
  //             }
  //           })
  //       }
  //       },
  //       error =>{
  //         this.toastr.error('Server not responding.','Service Error');
  //       }
  //     );
  // }

  pageControlAcceptedList() {
    const totalPage = Math.ceil(
      (this.AppointmentListAcceptedLength - 1) / this.ContentsizeAcceptedList
    );
    if (this.ContentAcceptedList > totalPage) {
      this.ContentAcceptedList = 1;
    } else {

    }
  }

  pageControlPendingList() {
    const totalPage = Math.ceil(
      (this.AppointmentListPendingLength - 1) / this.ContentsizePendingList
    );
    if (this.ContentPendingList > totalPage) {
      this.ContentPendingList = 1;
    } else {

    }
  }

  getDiscountsForSelectedPlan(planID: number): void {
    this.spinner.show();
    this.discountService.geDiscountByPlanID(planID).subscribe({
      next: (data: any) => {
        if (data?.message === 'Success') {
          this.discountPercantageList = data.result.map((plan: any) => ({
            label: `${plan.discountValue} %`,
          }));
        } else {
          console.warn('Unexpected response:', data);
          this.discountPercantageList = [];
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Failed to fetch discounts:', err);
        this.discountPercantageList = [];
      },
    });
  }
}
