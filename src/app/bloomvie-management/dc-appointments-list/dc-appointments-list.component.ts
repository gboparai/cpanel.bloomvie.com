import { Component, OnInit, ViewChild, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { DcAppointmentsListService } from './dc-appointments-list.service';
import { CommonModule, NgFor } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormBuilder, Validators } from '@angular/forms';
import { Toast, ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { TimeFormatAmPmPipe, TimeFormatPipe } from './time-format.pipe';
import { ActivatedRoute } from '@angular/router';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
import { DaycareManualAppointmentComponent } from './daycare-manual-appointment/daycare-manual-appointment.component';
import { DatePipe } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommonService } from '../../common-component/common.service';
import { SkeletonLoaderComponent } from '../../common-component/skeleton-loader/skeleton-loader.component';
import { TooltipComponent } from '../../common-component/tooltip/tooltip.component';

declare var $: any;
@Component({
  selector: 'app-dc-appointments-list',
  standalone: true,
  imports: [
    RouterLink,
    NgSelectComponent,
    BreadcrumbComponent,
    CommonModule,
    NgxPaginationModule,
    TimeFormatPipe,
    DaycareManualAppointmentComponent,
    NgxSpinnerModule,
    FormsModule,
    TimeFormatAmPmPipe,
    SkeletonLoaderComponent,
    TooltipComponent,
  ],
  providers: [DatePipe],
  templateUrl: './dc-appointments-list.component.html',
  styleUrl: './dc-appointments-list.component.css',
})
export class DcAppointmentsListComponent implements OnInit {
  @ViewChild(DaycareManualAppointmentComponent)
  daycareManualAppointmentChildComponent!: DaycareManualAppointmentComponent;
  DayCareAppointmentsAcceptedData: any = [];
  DayCareAppointmentsPendingData: any = [];
  filteredRecord: any = [];

  ContentsizeAcceptedList: number = 5;
  ContentAcceptedList: number = 1;

  ContentsizePendingList: number = 5;
  ContentPendingList: number = 1;
  Form: any;
  userRoleID: number = 0;
  UserID: any;
  filteredAcceptbyCounsellor: any;
  notification: any;
  fullName: any;
  InterestedUser: any;
  sendLink: any;
  viewAction: boolean = false;
  displayInterestedUser: any = null;
  statusId: any = 3;
  AppointmentListAcceptedLength: any;
  AppointmentListPendingLength: any;
  PlanData: any;
  region: any;
  visibleChangeRequestButton: boolean = true;
  DaycareIdUserID: any;
  zoomMeetingForm: any;
  pendingSearchItem: any;
  acceptedSearchItem: any;
  counsellorList: any = [];
  counsellorName: any;
  counsellorID: any;
  userOffset: string = '';
  skeletonShow = 'Skelton';
  hoveredRow: any = null;
  AcceptSkekletonLoader: boolean = true;

  constructor(
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private service: DcAppointmentsListService,
    private toastr: ToastrService,
    private cookie: CookieService,
    private Appservice: ApplicationsSettingsService,
    private route: ActivatedRoute,
    private commonservice: CommonService
  ) {
    this.Form = fb.group({
      id: [0],
      email: ['', Validators.required],
      counsellorID: [0],
      link: [''],
      hostLink: [''],
      regionHours: [0],
      regionMinutes: [0],
    });
    this.zoomMeetingForm = fb.group({
      topic: ['Daycare plan discussion'],
      type: ['2'],
      start_time: [''],
      duration: [''],
      timezone: ['Asia/Kolkata'],
    });

    effect(() => {
      let regionResponse = this.commonservice.regionResponseSignal();
      if (regionResponse.offsetString != '') {
        this.region = this.commonservice.regionResponseSignal();
        this.getAllDayCareAppointments('Pending', '');
      }
    });
  }

  ngOnInit() {
    if (performance.navigation.TYPE_RELOAD) {
      this.assignAction();
    }

    this.UserID = parseInt(this.cookie.get('UserId'), 10);
    this.userRoleID = parseInt(this.cookie.get('UserRoleId'));
    this.assignAction();
    const UserInfo = this.cookie.get('UserInfo');
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
    if (this.region) {
      this.getAllDayCareAppointments('Pending', '');
    }
  }

  onClose() {
    this.counsellorName = null;
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

  convertToTimeString(timeString: string): string {
    const baseDate = new Date('1970-01-01T' + timeString);
    const correctEndTime = baseDate.toISOString().substring(11, 16);
    return correctEndTime;
  }

  // Commented on 29/04/25
  getAllDayCareAppointments(status?: any, searchItem?: any) {
    this.skeletonShow = 'Skelton';
    if (status == 'Accepted') {
      this.pendingSearchItem = '';
      this.statusId = 6;
      this.service
        .getDayCareAppointments(
          this.statusId,
          searchItem,
          this.region.offsetHours,
          this.region.offsetMinutes
        )
        .subscribe((data: any) => {
          this.DayCareAppointmentsAcceptedData = data.result;
          this.AppointmentListAcceptedLength =
            this.DayCareAppointmentsAcceptedData.length;
          this.filteredAcceptbyCounsellor =
            this.DayCareAppointmentsAcceptedData.filter(
              (appointment: { counsellorID: any }) =>
                appointment.counsellorID === this.UserID
            );
          this.skeletonShow = '';
          this.getNotifications();
        });
    } else {
      this.acceptedSearchItem = '';
      this.statusId = 3;
      this.service
        .getDayCareAppointments(
          this.statusId,
          searchItem,
          this.region.offsetHours,
          this.region.offsetMinutes
        )
        .subscribe((data: any) => {
          if (data.message == 'Success') {
            let pendingList = data.result;
            if (this.userRoleID != 1) {
              const obj = {
                counsellorID: this.UserID,
                list: pendingList,
              };

              this.service.getFilteredData(obj).subscribe((filtered: any) => {
                if (filtered.message == 'Success') {
                  pendingList = filtered.result;
                  this.DayCareAppointmentsPendingData = pendingList.filter(
                    (res: any) => res.counsellorID !== this.UserID
                  );

                  this.skeletonShow = '';
                }
              });
            } else {
              this.skeletonShow = '';
              this.DayCareAppointmentsPendingData = pendingList;
            }
            this.AppointmentListPendingLength =
              this.DayCareAppointmentsPendingData.length;
            this.filteredAcceptbyCounsellor =
              this.DayCareAppointmentsPendingData.filter(
                (appointment: { counsellorID: any }) =>
                  appointment.counsellorID === this.UserID
              );
            this.skeletonShow = '';

            this.getNotifications();
          }
        });
    }
  }

  //Arsh Added on 29/04/25
  // getAllDayCareAppointments(status?: any, searchItem?: any) {
  //   // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //   this.spinner.show();

  //   if (status == 'Accepted') {
  //     this.pendingSearchItem = '';
  //     this.statusId = 6;

  //     this.service
  //       .getDayCareAppointments(this.statusId, searchItem, parseInt(region))
  //       .subscribe((data: any) => {
  //         if (data.message === 'Success') {
  //           this.AppointmentListAcceptedLength = data.result;

  //           // const filteredAcceptedList =
  //           //   this.commonservice.getUtcTime(acceptedList);
  //           // this.DayCareAppointmentsAcceptedData = filteredAcceptedList;

  //           this.AppointmentListAcceptedLength =
  //             this.DayCareAppointmentsAcceptedData.length;
  //           this.filteredAcceptbyCounsellor =
  //             this.DayCareAppointmentsAcceptedData.filter(
  //               (appointment: { counsellorID: any }) =>
  //                 appointment.counsellorID === this.UserID
  //             );

  //           this.spinner.hide();
  //           this.getNotifications();
  //         }
  //       });
  //   } else {
  //     this.acceptedSearchItem = '';
  //     this.statusId = 3;

  //     this.service
  //       .getDayCareAppointments(this.statusId, searchItem, parseInt(region))
  //       .subscribe((data: any) => {
  //         if (data.message == 'Success') {
  //           let pendingList = data.result;
  //           if (this.userRoleID != 1) {
  //             const obj = {
  //               counsellorID: this.UserID,
  //               list: pendingList,
  //             };

  //             this.service.getFilteredData(obj).subscribe((filtered: any) => {
  //               if (filtered.message == 'Success') {
  //                 pendingList = filtered.result;

  //                 const filteredPendingList =
  //                   this.commonservice.getUtcTime(pendingList);
  //                 this.DayCareAppointmentsPendingData =
  //                   filteredPendingList.filter(
  //                     (res: any) => res.counsellorID !== this.UserID
  //                   );

  //                 this.AppointmentListPendingLength =
  //                   this.DayCareAppointmentsPendingData.length;
  //                 this.filteredAcceptbyCounsellor =
  //                   this.DayCareAppointmentsPendingData.filter(
  //                     (appointment: { counsellorID: any }) =>
  //                       appointment.counsellorID === this.UserID
  //                   );

  //                 this.spinner.hide();
  //                 this.getNotifications();
  //               }
  //             });
  //           } else {
  //             const filteredPendingList =
  //               this.commonservice.getUtcTime(pendingList);
  //             this.DayCareAppointmentsPendingData = filteredPendingList;

  //             this.AppointmentListPendingLength =
  //               this.DayCareAppointmentsPendingData.length;
  //             this.filteredAcceptbyCounsellor =
  //               this.DayCareAppointmentsPendingData.filter(
  //                 (appointment: { counsellorID: any }) =>
  //                   appointment.counsellorID === this.UserID
  //               );

  //             this.spinner.hide();
  //             this.getNotifications();
  //           }
  //         }
  //       });
  //   }
  // }

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

  AssiggnCounsellor(InterestedUser: any) {
    this.spinner.show();

    const resultingDateTime = this.addDuration(
      InterestedUser.slotDate,
      InterestedUser.slotStartTime
    );
    const duration = this.calculateDuration(
      InterestedUser.slotStartTime,
      InterestedUser.slotEndTime
    );

    this.zoomMeetingForm.patchValue({
      start_time: resultingDateTime,
      duration: duration,
    });

    this.service
      .getZoomMeetingLink(this.zoomMeetingForm.value)
      .subscribe((res: any) => {
        if (res.message == 'Success') {
          let convertedResult = JSON.parse(res.result);
          if (this.userRoleID == 1) {
            this.Form.patchValue({
              email: InterestedUser.email,
              counsellorID: this.counsellorName
                ? this.counsellorName
                : this.UserID,
              link: convertedResult.join_url,
              hostLink: convertedResult.start_url,
              id: this.DaycareIdUserID > 0 ? this.DaycareIdUserID : 0,
              regionHours: this.region.offsetHours,
              regionMinutes: this.region.offsetMinutes,
            });

            this.assignCounsellor();
          } else {
            this.Form.patchValue({
              email: InterestedUser.email,
              counsellorID: this.UserID,
              link: convertedResult.join_url,
              hostLink: convertedResult.start_url,
              id: this.DaycareIdUserID > 0 ? this.DaycareIdUserID : 0,
              regionHours: this.region.offsetHours,
              regionMinutes: this.region.offsetMinutes,
            });

            this.assignCounsellor();
          }

          this.service
            .ManageCousellor(this.Form.value)
            .subscribe((data: any) => {
              if (data.message === 'Success') {
                this.getAllDayCareAppointments('Pending', '');
                this.pendingSearchItem = '';
                this.counsellorName = null;
                if (this.userRoleID == 1) {
                  $('#view-del1').modal('hide');
                  $('#slot-info').modal('hide');
                } else {
                  $('#slot-info').modal('hide');
                }

                this.toastr.success('Request Confirm');
                this.spinner.hide();

                this.pageControlPendingList();
                // (document.getElementById('meetingLink') as HTMLInputElement).value = '';
              } else {
                this.toastr.error(data.message);
                this.spinner.hide();
              }
            });
        } else {
          this.spinner.hide();
          this.toastr.error('Something wents wrong !!');
        }
      });

    // const meetingLink = (document.getElementById('meetingLink') as HTMLInputElement).value;
    // if (meetingLink != '') {

    // } else {
    //   this.toastr.error("Link cannot be Empty")
    // }
  }

  onCounsellorChange(Event: any) {
    this.counsellorID = Event.id;
  }

  getByID(ID: any) {
    this.DaycareIdUserID = ID;

    $('#slot-info').modal('show');
    this.AcceptSkekletonLoader = true;
    this.service
      .getIntersetedUserByID(
        ID,
        this.region.offsetHours,
        this.region.offsetMinutes
      )
      .subscribe((data) => {
        if (data.message === 'ok') {
          this.AcceptSkekletonLoader = false;
          this.InterestedUser = data.result;
          this.DaycareIdUserID = ID;
        }
      });
  }

  assignCounsellor() {
    this.service
      .dayCareAssignmentToCounsellor(this.counsellorID, this.DaycareIdUserID)
      .subscribe(
        (response) => {
        },
        (error) => {
          console.error('Error occurred:', error);
        }
      );
  }

  getByIDForView(ID: any, slotID?: number) {
    this.spinner.show();
    if (slotID) {
      this.service.getAllCounsellorBySlotID(slotID).subscribe((res: any) => {
        if (res.message == 'Success') {
          this.spinner.hide();
          this.counsellorList = res.result;
          setTimeout(() => {
            $('#view-del1').modal('show');
          }, 0);
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
    }
    this.service.getIntersetedUserByID(ID, this.region.offsetHours, this.region.offsetMinutes).subscribe((data) => {
      if (data.message === 'ok') {
        this.DaycareIdUserID = ID;
        this.displayInterestedUser = data.result;
        if (slotID) {
          setTimeout(() => {
            $('#view-del1').modal('show');
          }, 0);
        }
        else {
          setTimeout(() => {
            $('#view-del').modal('show');
          }, 0);
        }
        this.spinner.hide();
      }
    });
  }

  getCompleteButton(slotStartTime: any, slotDate: any) {
    let now = new Date();
    let currentTime = this.datePipe.transform(now, 'HH:mm:ss')!;
    let currentDate = this.datePipe.transform(now, 'MM-dd-yyyy');
    if (currentTime > slotStartTime && currentDate == slotDate) {
      // this.viewAction = false
      this.visibleChangeRequestButton = false;
    } else {
      this.visibleChangeRequestButton = true;
    }
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
              this.acceptedSearchItem = '';
              this.getAllDayCareAppointments('Accepted', '');
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

  getPendingSearchItem() {
    if (this.pendingSearchItem.trim().length >= 3) {
      this.getAllDayCareAppointments(
        'Pending',
        this.pendingSearchItem.toLowerCase()
      );
    } else {
      this.pendingSearchItem = '';
      this.getAllDayCareAppointments(
        'Pending',
        this.pendingSearchItem.toLowerCase()
      );
    }
  }

  getAcceptedSearchItem() {
    if (this.acceptedSearchItem.trim().length >= 3) {
      this.getAllDayCareAppointments(
        'Accepted',
        this.acceptedSearchItem.toLowerCase()
      );
    } else {
      this.acceptedSearchItem = '';
      this.getAllDayCareAppointments(
        'Accepted',
        this.acceptedSearchItem.toLowerCase()
      );
    }
  }

  // getPlan(id:any){
  //   this.service.getSubscriptionPlanByUserId(1).subscribe(data=>{
  //     if(data.message==="OK"){
  //       this.PlanData=data.result
  //        this.DayCareUserID = id;
  //     }
  //   })
  // }

  assignAction() {
    let UserRoleId = this.cookie.get('UserRoleId');
    if (UserRoleId == '1') {
      this.viewAction = true;
    } else {
      this.viewAction = false;
    }
  }

  changeAppointmentRequest(ID: number) {
    Swal.fire({
      title: `<span style='font-size: 17px'>Do you want to change the request ?<span>`,
      icon: `warning`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.service.changeDayCareRequest(ID).subscribe((result: any) => {
            if (result.message == 'Success') {
              this.acceptedSearchItem = '';
              this.getAllDayCareAppointments('Accepted', '');
              this.pageControlAcceptedList();
              Swal.fire('Request Changed successfully!', '', 'success');
            }
          });
        }
      },
      (error) => {
        this.toastr.error('Server not responding.', 'Service Error');
      }
    );
  }

  // joinZoomMeeting(ID:number) {
  //   this.spinner.show();
  //   this.service.getIntersetedUserByID(ID).subscribe(data => {
  //     if (data.message === "ok") {
  //       this.spinner.hide();
  //       let result = data.result;
  //       let hostLink = result.hostLink;
  //       window.open(hostLink,'_blank');
  //     }
  //   });
  // }

  joinZoomMeeting(ID: number) {
    Swal.fire({
      title: `<span style='font-size: 17px'>Do you want to join the meeting ?<span>`,
      icon: `warning`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.service.dayCareMeetingJoined(ID).subscribe((val: any) => {
            if (val.message == 'Success') {
              this.spinner.show();
              this.service
                .getIntersetedUserByID(
                  ID,
                  this.region.offsetHours,
                  this.region.offsetMinutes
                )
                .subscribe((data) => {
                  if (data.message === 'ok') {
                    this.spinner.hide();
                    let result = data.result;
                    let hostLink = result.hostLink;
                    window.open(hostLink, '_blank');

                    setTimeout(() => {
                      this.acceptedSearchItem = '';
                      this.getAllDayCareAppointments('Accepted', '');
                      this.pageControlAcceptedList();
                    }, 0);
                  } else {
                    this.spinner.hide();
                  }
                });
            }
          });
        }
      },
      (error) => {
        this.toastr.error('Server not responding.', 'Service Error');
      }
    );
  }

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

  closingManualAddAppointmentModal() {
    $('#addapoint').modal('hide');
  }
  resetConsullorSelectedValue() {
    // call child method here
    // this.daycareManualAppointmentChildComponent.addAppointmentForm.patchValue({
    //   mobile:'+1 '
    // })
    this.daycareManualAppointmentChildComponent.resetConsullorSelectedValue();
  }
}
