import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { TimeFormatAmPmPipe, TimeFormatPipe } from '../bloomvie-management/dc-appointments-list/time-format.pipe';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TocSlotRequestsService } from './toc-slot-requests.service';
import { CookieService } from 'ngx-cookie-service';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { TocRegistrationService } from '../toc-registration/toc-registration.service';
import { SkeletonLoaderComponent } from "../common-component/skeleton-loader/skeleton-loader.component";

declare var $: any;

@Component({
  selector: 'app-toc-slot-requests',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgxPaginationModule,
    TimeFormatPipe,
    CommonModule,
    FormsModule,
    BreadcrumbComponent,
    SkeletonLoaderComponent,
    TimeFormatAmPmPipe
  ],
  templateUrl: './toc-slot-requests.component.html',
  styleUrl: './toc-slot-requests.component.css',
})
export class TocSlotRequestsComponent {
  UserID: number | undefined;
  TocSlotRequests: any;
  public Name: any = '';
  centreID: number = 0;
  ContentP: number = 1;
  Contentsize: number = 5;
  skeletonShow = 'Skelton';
  TocSlotList: any;

  constructor(
    private tocrequestservice: TocSlotRequestsService,
    private toastr: ToastrService,
    private cookie: CookieService,
    private spinner: NgxSpinnerService,
    private tocservice: TocRegistrationService
  ) { }

  async ngOnInit() {
    this.UserID = parseInt(this.cookie.get('UserId'), 10);
    this.centreID = parseInt(this.cookie.get('CentreID'));
    await this.getTocSlotbyUserid();

    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 0);
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  async getTocSlotbyUserid() {
    this.skeletonShow = 'Skelton';
    let data = await this.tocrequestservice.getTocSlotbyUserid(this.UserID,this.centreID).toPromise();
    if (data.message == 'OK') {
      this.skeletonShow = '';
      // this.TocSlotRequests = data.result;
      this.TocSlotRequests = data.result.filter(
        (x: { centreId: number }) => x.centreId == this.centreID
      );

      this.TocSlotList = data.activity;
    } 
    else {
      this.skeletonShow = '';
      this.TocSlotRequests = [];
      this.TocSlotList = [];
    }
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
  // commented on 22/07/25
  // isDisabled(tocrequestlist: any): boolean {
  //   const currentSlot = {
  //     startTime: tocrequestlist.startTime,
  //     endTime: tocrequestlist.endTime,
  //     week: tocrequestlist.week,
  //     workingDayName: tocrequestlist.workingDayName,
  //   };

  //   const isSlotAlreadyAccepted = this.TocSlotRequests.some(
  //     (item: any) =>
  //       item.acceptedByUser &&
  //       item.acceptedByUser !== '' &&
  //       item.startTime === currentSlot.startTime &&
  //       item.endTime === currentSlot.endTime &&
  //       item.week === currentSlot.week &&
  //       item.workingDayName === currentSlot.workingDayName
  //   );

  //   return isSlotAlreadyAccepted;
  // }

  //updated on 22/07/25
  
  
  isDisabled(tocrequestlist: any): boolean {
  const currentSlot = {
    startTime: tocrequestlist.startTime,
    endTime: tocrequestlist.endTime,
    week: tocrequestlist.week,
    workingDayName: tocrequestlist.workingDayName,
  };

  const isSlotAlreadyAccepted = this.TocSlotList.some((item: any) =>
    item.acceptedByUser && item.acceptedByUser !== '' &&
    item.startTime === currentSlot.startTime &&
    item.endTime === currentSlot.endTime &&
    item.week === currentSlot.week &&
    item.workingDayName === currentSlot.workingDayName
  );
  return isSlotAlreadyAccepted;
}

isShowTooltip(tocrequestlist: any): boolean{
    const currentSlot = {
    startTime: tocrequestlist.startTime,
    endTime: tocrequestlist.endTime,
    week: tocrequestlist.week,
    workingDayName: tocrequestlist.workingDayName,
  };

  const isSlotAlreadyAccepted = this.TocSlotList.some((item: any) =>
    item.requestByDayCare != this.centreID &&
    // item.acceptedByUser && item.acceptedByUser !== '' &&
     item.acceptedByUser != null &&
    item.startTime === currentSlot.startTime &&
    item.endTime === currentSlot.endTime &&
    item.week === currentSlot.week &&
    item.workingDayName === currentSlot.workingDayName
  );
  return isSlotAlreadyAccepted;
}


  getAcceptedByDaycareName(tocrequestlist: any): string | null {
    const currentSlot = {
      startTime: tocrequestlist.startTime,
      endTime: tocrequestlist.endTime,
      week: tocrequestlist.week,
      workingDayName: tocrequestlist.workingDayName,
    };

    const acceptedSlot = this.TocSlotRequests.find(
      (item: any) =>
        item.acceptedByUser &&
        item.acceptedByUser !== '' &&
        item.startTime === currentSlot.startTime &&
        item.endTime === currentSlot.endTime &&
        item.week === currentSlot.week &&
        item.workingDayName === currentSlot.workingDayName
    );

    return acceptedSlot ? acceptedSlot.centreName : null;
  }

  onSearchName() {
    if (!this.Name || this.Name.trim().length < 3) {
      this.Name = '';
      this.getTocSlotbyUserid();
      this.Name = '';
      return;
    } else {
      this.getTocSlotbyUserid();
    }
  }

  SendSlotRequestToDayCare(centreId: any, slotId: any, AcceptReject: any) {
    this.tocrequestservice
      .SendSlotRequestToDayCare(centreId, slotId, this.UserID, AcceptReject)
      .subscribe((data) => {
        if (data.message == 'OK') {
          if (AcceptReject == 'Accepted') {
            Swal.fire({
              icon: 'success',
              title: '<h3>Success!</h3>',
              text: 'Request Accepted successfully.',
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: '<h3>Success!</h3>',
              text: 'Request Rejected successfully.',
            });
          }

          this.toastr.success(data.activity);
          this.cookie.set('isSlotAccepted', String('true'));
          this.tocservice.triggerSidebarRefresh();
          this.getTocSlotbyUserid();
        } else {
          this.toastr.warning(data.message);
        }
      });
  }

  slotApproveReject(centreId: any, slotId: any) {
    Swal.fire({
      html: `
          <div class="swal-static-container">
            <div class="swal2-icon swal2-question " style="display: flex;  margin: 0.5em 6.7em 1.1em 5.6em !important;"><div class="swal2-icon-content">?</div></div>
            <div class="swal-static-content">
              <h2 class="swal-static-title">Confirmation</h2>
              <p class="swal-static-text">Please confirm if you would like to accept this request.</p>
            </div>
          </div>
        `,
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Accept',
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
          this.SendSlotRequestToDayCare(centreId, slotId, 'Accepted');
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
            this.SendSlotRequestToDayCare(centreId, slotId, 'Rejected');
          }
        });
      } else {
      }
    });
  }
}
