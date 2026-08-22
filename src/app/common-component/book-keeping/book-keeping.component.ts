import { CommonModule, DatePipe } from '@angular/common';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { RouterLink, RouterModule } from '@angular/router';
import { ManageExpenseComponent } from '../../day-care-management/manage-expense/manage-expense.component';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { BookKeepingService } from './book-keeping.service';
import { FormBuilder, FormControl, ReactiveFormsModule, FormGroup, Validators, RequiredValidator } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { FormsModule } from '@angular/forms';
import { error } from 'node:console';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CookieService } from 'ngx-cookie-service';
import { userInfo } from 'node:os';
import { environment } from '../../../environments/environment.development';
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";
import { TooltipComponent } from '../tooltip/tooltip.component';


@Component({
  selector: 'app-book-keeping',
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
    FullCalendarModule,
    SkeletonLoaderComponent,
    TooltipComponent
  ],
  providers: [DatePipe],
  templateUrl: './book-keeping.component.html',
  styleUrl: './book-keeping.component.css'
})
export class BookKeepingComponent {

  readonly URL = environment.apiUrl.slice(0, environment.apiUrl.indexOf('api'));
  userRoleId: any;
  userID: any | null = null;
  Name: any;
  Name2: any;
  SubscriptionDetailsList: any[] = []
  UpcomingPaymentsList: any[] = []
  currentPage: number = 1;
  currentPageSecond: number = 1;
  itemsPerPage: number = 5; // Maximum rows per page
  TotalCount: number = 0;
  totalCount: number = 0;
  startDate: any;
  endDate: any;
  startDate2: any;
  endDate2: any;
  invoice: any;
  skeletonShow = 'Skelton';
  hoveredRow: any = null;

  constructor(private service: BookKeepingService, private toastr: ToastrService, private spinner: NgxSpinnerService,
    private datepipe: DatePipe, private cookieService: CookieService) {

  }
  ngOnInit() {

    //read ID from cookie
    let userRoleId = this.cookieService.get('UserRoleId');
    if (userRoleId) {
      this.userRoleId = parseInt(userRoleId, 10)
    }
    //for parents case   
    this.userID = this.cookieService.get('UserId');
    this.userID = parseInt(this.userID, 10)



    this.SubscriptionDetailsOnLogin(this.startDate, this.endDate, this.Name, this.userRoleId, this.userID);
    this.intitDatePicker();
    this.intitDatePicker2();

  }

  SubscriptionDetailsOnLogin(startDate: any, endDate: any, Name: any, userRoleid: any, userid: any) {

    this.skeletonShow = 'Skelton';
    if (startDate == undefined) {
      startDate = ''
    }
    if (endDate == undefined) {
      endDate = ''
    }
    if (Name == undefined) {
      Name = ''
    }
    this.service.getSubscriptionDetails(startDate, endDate, Name, userRoleid, userid).subscribe(data => {
      if (data.message === "OK") {
        this.SubscriptionDetailsList = data.result.map((item: any) => ({
          ...item,
          formattedPurchasedDate: this.datepipe.transform(item.purchaseDate, 'MM-dd-yyyy'),
          formattedExpiryDate: this.datepipe.transform(item.expiryDate, 'MM-dd-yyyy'),


          profileImage: item.profile ? this.getS3FileName(item.profile) : '', //Added on 28/07/25
        }));

        this.SubscriptionDetailsList.forEach(item => {
          if (item?.amount != null) {
            const costNum = Number(item.amount);
            item.amount = costNum.toLocaleString('en-CA', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          }
        });

        this.totalCount = this.SubscriptionDetailsList.length || 0;
        this.skeletonShow = '';

      } else {
        this.SubscriptionDetailsList = [];
        this.totalCount = 0;
        this.skeletonShow = '';

      }
    })

  }

  getS3FileName(fileName: any) {
    let response = this.base64ToBlob(fileName);
    const imageUrl = URL.createObjectURL(response);
    return imageUrl;
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

  getUpcomingPaymentDetails(startDate2: any, endDate2: any, Name2: any, userRoleid: any, userid: any) {

    this.skeletonShow = 'Skelton';
    if (startDate2 == undefined) {
      startDate2 = ''
    }
    if (endDate2 == undefined) {
      endDate2 = ''
    }
    if (Name2 == undefined) {
      Name2 = ''
    }
    this.service.getUpcomingPaymentDetails(startDate2, endDate2, Name2, userRoleid, userid).subscribe(data => {
      if (data.message === "OK") {
        this.UpcomingPaymentsList = data.result.map((item: any) => ({
          ...item,
          formattedPurchaseDate: this.datepipe.transform(item.purchaseDate, 'MM-dd-yyyy'),
          formattedExpiryDate: this.datepipe.transform(item.expiryDate, 'MM-dd-yyyy'),

          profileImage: item.profile ? this.getS3FileName(item.profile) : '', //Added on 28/07/25
        }));

        this.UpcomingPaymentsList.forEach(item => {
          if (item?.amount != null) {
            const costNum = Number(item.amount);
            item.amount = costNum.toLocaleString('en-CA', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          }
        });
        this.skeletonShow = '';
        this.TotalCount = this.UpcomingPaymentsList.length || 0;

      } else {
        this.UpcomingPaymentsList = [];
        this.TotalCount = 0;
        this.skeletonShow = '';
      }
    })
  }

  onSearchName() {

    if (!this.Name || this.Name.trim().length < 3) {
      this.Name = '';
      this.SubscriptionDetailsOnLogin(this.startDate, this.endDate, this.Name, this.userRoleId, this.userID);
      this.Name = '';
      return;
    }
    else {
      this.SubscriptionDetailsOnLogin(this.startDate, this.endDate, this.Name, this.userRoleId, this.userID);
      // this.Name = '';
    }
  }
  onSearchName2() {

    if (!this.Name2 || this.Name2.trim().length < 3) {
      this.Name2 = '';
      this.getUpcomingPaymentDetails(this.startDate2, this.endDate2, this.Name2, this.userRoleId, this.userID);
      this.Name2 = '';
      return;
    }
    else {
      this.getUpcomingPaymentDetails(this.startDate2, this.endDate2, this.Name2, this.userRoleId, this.userID);
      // this.Name2 = '';
    }
  }

  intitDatePicker() {

    let self = this;

    flatpickr("#dateRangePicker", {
      mode: "range",
      dateFormat: "m/d/y",
      // allowInput: false,
      allowInput: true,

      onClose(selectedDates: Date[]) {
        if (selectedDates.length === 2) {
          const formatDate = (date: any) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
            const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
            return `${year}/${month}/${day}`;
          };
          self.startDate = formatDate(selectedDates[0]);
          self.endDate = formatDate(selectedDates[1]);

        } else {
          self.startDate = null;
          self.endDate = null;


        }

      },
    });
  }

  intitDatePicker2() {
    let self = this;

    flatpickr("#dateRangePicker2", {
      mode: "range",
      dateFormat: "m/d/y",
      // allowInput: false,
      allowInput: true,

      onClose(selectedDates: Date[]) {
        if (selectedDates.length === 2) {
          const formatDate = (date: any) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
            const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
            return `${year}/${month}/${day}`;
          };
          self.startDate2 = formatDate(selectedDates[0]);
          self.endDate2 = formatDate(selectedDates[1]);
        } else {
          self.startDate2 = null;
          self.endDate2 = null;

        }

      },
    });
  }

  downloadInvoice(orderID: any) {
    this.spinner.show();
    this.service.getInvoice(orderID).subscribe((response) => {
      if (response.message === 'OK') {
        this.invoice = response.result;
        const fileUrl = `${this.URL}/Content/Invoice/${this.invoice}`;

        this.downloadFile(fileUrl);
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.toastr.error(response.message);

      }
    });
  }

  downloadFile(fileUrl: any) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    link.click();
  }


}
