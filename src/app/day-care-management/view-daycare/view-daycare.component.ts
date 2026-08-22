import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { ViewDaycareService } from './view-daycare.service';
import { SplitInterpolation } from '@angular/compiler';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../common-component/common.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment.development';
import { NgxPaginationModule } from 'ngx-pagination';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipComponent } from '../../common-component/tooltip/tooltip.component';
import { SkeletonLoaderComponent } from '../../common-component/skeleton-loader/skeleton-loader.component';
declare var $: any;
@Component({
  selector: 'app-view-daycare',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    NgxPaginationModule,
    CommonModule,
    FormsModule,
    TooltipComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './view-daycare.component.html',
  styleUrl: './view-daycare.component.css',
})
export class ViewDaycareComponent implements OnInit {
  frontendWebUrl: string = environment.frontEndWebUrl;
  centreName: string = '';
  public dayCareList: any[] = [];
  private loginUserId: number = 0;
  private userRoleId: number = 0;
  public RootURL: string = environment.apiUrl.slice(0, -3);
  public paginationConfig = {
    totalItems: 0,
    itemsPerPage: 5,
    currentPage: 1,
    id: 'view-Daycare',
  };
  public daycareDetail: any;
  public typingTimeout: any;
  public searchText: string = '';
  hoveredRow: any = null;
  skeletonShow = 'Skelton';

  constructor(
    private viewdaycareservice: ViewDaycareService,
    private spinner: NgxSpinnerService,
    private commonservice: CommonService,
    private toastr: ToastrService,
    private cookie: CookieService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.cookie.check('UserId') && this.cookie.check('UserRoleId')) {
      this.loginUserId = parseInt(this.cookie.get('UserId'));
      this.userRoleId = parseInt(this.cookie.get('UserRoleId'));
      this.getDaycareCenterList();
    }
  }

  getDaycareCenterList() {
    this.skeletonShow = 'Skelton';
    this.viewdaycareservice
      .getDayCareList(
        this.loginUserId,
        this.userRoleId,
        this.paginationConfig.itemsPerPage,
        this.paginationConfig.currentPage,
        this.searchText
      )
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.dayCareList = response.result;
            this.skeletonShow = '';

            this.dayCareList = response.result.map((item: any) => {
              return {
                ...item,
                s3Url: item.centreLogoBytes
                  ? this.getS3FileName(item.centreLogoBytes)
                  : '',
              };
            });
          }
          this.paginationConfig.totalItems = response.count;
          this.skeletonShow = '';
        },
        error: (err) => {
          this.skeletonShow = '';

          this.toastr.error(err.message);
        },
      });
  }

  base64ToBlob(base64: any, mime = 'image/jpeg') {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mime });
  }

  getS3FileName(fileName: any) {
    let response = this.base64ToBlob(fileName);
    const imageUrl = URL.createObjectURL(response);
    return imageUrl;
  }

  filter(key: string, value: any) {
    if (key === 'by-pagination') {
      this.paginationConfig.currentPage = value;
    }
    this.getDaycareCenterList();
  }

  onEdit(item: any) {
    const enc_id = this.commonservice.encrypt(item.id.toString());
    const centreAdminID = this.commonservice.encrypt(item.adminInfo.id);
    const enc_edit_dcc = this.commonservice.encrypt('editDayCare');

    this.router.navigate(['/manage-daycare'], {
      queryParams: { enc_id: enc_id, enc_edit_dcc, centreAdminID },
    });
  }

  //Arsh on 21/04/25
  onSuspendPlan(centreID: number, IsSuspend: boolean) {
    Swal.fire({
      title: 'Confirmation',
      // text: IsSuspend
      //   ? 'Are you sure you want to un-suspend plan?'
      //   : 'Are you sure you want to suspend plan?',
      text: IsSuspend
        ? 'Are you sure you want to unsuspend this plan? All associated daycare users will be reactivated.'
        : 'Are you sure you want to suspend this plan? All associated daycare users will be deactivated.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.viewdaycareservice.onSuspendPlan(centreID, IsSuspend).subscribe({
          next: (response) => {
            if (response.message === 'Success') {
              this.toastr.success(response.activity);
              this.getDaycareCenterList();
            }
            setTimeout(() => {
              this.spinner.hide();
            }, 200);
          },
          error: (err) => {
            this.spinner.hide();
            this.toastr.error(err.message);
          },
        });
      } else {
      }
    });
  }

  //Arsh on 21/04/25
  onPlanPayment(userID: number, latestPlanId: number) {
    Swal.fire({
      title: 'Subscription Expired!',
      html: `
          <p>Subscription has expired. Please renew your plan.</p>
        `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      const planencryptID = this.commonservice.encrypt(String(latestPlanId));
      const dayCareUserencryptID = this.commonservice.encrypt(String(userID));
      if (result.isConfirmed) {
        const encNewType = this.commonservice.encrypt('encType');
        const daycareType = this.commonservice.encrypt('Re-Subscribe');
        let params = `Userid=${dayCareUserencryptID}&daycareType=${daycareType}&planid=${planencryptID}&enc_type=${encNewType}`;
        window.location.href =
          this.frontendWebUrl + 'payment-details?' + params;
      } else {
        this.router.navigate(['bloomvie-plan'], {
          queryParams: {
            enc: dayCareUserencryptID,
            enc_plan: planencryptID,
          },
        });
      }
    });
  }

  shouldDisablePayment(dueDate: string, isSuspend: boolean | null): boolean {
    const today = new Date();
    const planDueDate = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    planDueDate.setHours(0, 0, 0, 0);

    return planDueDate > today && (isSuspend === null || isSuspend === false);
  }

  handlePlanPayment(item: any): void {
    const shouldDisable = this.shouldDisablePayment(
      item.latestPlan.dueDate,
      item.latestPlan.isSuspend
    );
    if (shouldDisable) return;
    this.onPlanPayment(item.adminInfo.id, item.latestPlan.subscriptionPlanID);
  }

  activeInactiveCentre(ID: number, isActive: boolean) {
    Swal.fire({
      title: 'Confirmation',
      text: isActive
        ? 'Are you sure you want to inactivate this centre?'
        : 'Are you sure you want to activate this centre?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.viewdaycareservice.activeInactiveDaycare(ID).subscribe({
          next: (response) => {
            if (response.message === 'Success') {
              this.toastr.success(response.activity);
              this.getDaycareCenterList();
            }
            setTimeout(() => {
              this.spinner.hide();
            }, 200);
          },
          error: (err) => {
            this.spinner.hide();
            this.toastr.error(err.message);
          },
        });
      } else {
        const checkbox: any = document.getElementById('check' + ID);
        if (checkbox) {
          checkbox.checked = isActive;
        }
      }
    });
  }

  // onSearchDaycare(event:any){
  //   let inputValue = event.target.value;
  //   let centreName = inputValue.trim();
  //   if(centreName != ""){
  //       this.viewdaycareservice.onSearchDaycare(centreName).subscribe((data)=>{
  //          if(data.message === "OK"){
  //           this.dayCareList = [];
  //             this.dayCareList =  data.result;
  //             this.cdr.detectChanges();
  //          }
  //          else{
  //            this.dayCareList = [];
  //          }
  //       },(e)=>{

  //       })
  //   }
  //   else{
  //     this.getDaycareCenterList();
  //   }
  // }

  // onSearchDaycare(event: any) {
  //   const searchString: string = event.target.value;
  //   if (searchString) {
  //     this.searchString = searchString;
  //     this.getDaycareCenterList();
  //     this.searchString = '';
  //   }
  //   else {
  //     this.searchString = '';
  //   }
  // }

  onSearchDaycare() {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.getDaycareCenterList();
    }, 500);
  }

  getDaycareDetail(centreID: number) {
    this.viewdaycareservice.getDaycareDetail(centreID).subscribe(
      (response) => {
        if (response.message === 'Success') {
          // assign the object into variable
          this.daycareDetail = response.result;
          $('#view-daycare-detail-popup').modal('show');
        }
      },
      (e) => { }
    );
  }
}
