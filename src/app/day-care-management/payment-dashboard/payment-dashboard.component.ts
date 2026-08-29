import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { PaymnetsService } from './paymnets.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment';
import { CommonService } from '../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FlatpickrModule } from 'angularx-flatpickr';
import flatpickr from 'flatpickr';
import { saveAs } from 'file-saver';
import { NgSelectModule } from '@ng-select/ng-select';
import { BloomvieInvoiceComponent } from "../invoices/bloomvie-invoice/bloomvie-invoice.component";
import { ManageExpenseComponent } from '../manage-expense/manage-expense.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
declare var $: any;
@Component({
  selector: 'app-payment-dashboard',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    RouterLink,
    NgSelectModule,
    NgxPaginationModule,
    FlatpickrModule,
    CommonModule,
    RouterModule,
    BloomvieInvoiceComponent,
    ManageExpenseComponent,
    BaseChartDirective
  ],
  templateUrl: './payment-dashboard.component.html',
  styleUrl: './payment-dashboard.component.css'
})
export class PaymentDashboardComponent implements OnInit {
  getSubscriptionPlanList: any;


  public pieChartLegend = true;
  public barChartPlugins = [];

  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Sliver ', 'Gold ', 'Platinum '],
    datasets: [
      { data: [40, 50, 20], label: 'Total User' },
      //  { data: [ 28, 48, 40, 19, 86, 27, 90 ], label: 'Teacher' },
      //  { data: [ 28, 48, 40, 19, 86, 27, 90 ], label: 'Admin' }
    ]
  };

  public barChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
  };


  public RootURL: string = environment.apiUrl.slice(0, -3);
  public paginationConfig = {
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
  }
  public paginationbo: any = {
    pageIndex: 1,
    pageSize: 10,
    status: "",
    sortBy: "",
    searchText: "",
    userTypeID: 0,
    startDate: null,
    endDate: null
  }
  isDateChecked = false;
  selectedDate = false;
  DateFromFlatpicker: any;
  DateToFlatpicker: any;
  StatusList: any;
  selectedStatusFromDropDown: any;




  constructor(private paymentService: PaymnetsService, private spinner: NgxSpinnerService,
    private router: Router, private route: ActivatedRoute, private commonservice: CommonService) {


  }



  ngOnInit(): void {
    this.getAllSubscriptionPlans();
    this.getAllMasterStatus();
  }

  ngAfterViewInit(): void {

    this.initializeFlatpickr();

  }
  selectStatus(e: any) {
    this.selectedStatusFromDropDown = e.toString();
    this.paginationbo.status = this.selectedStatusFromDropDown
    if (this.selectedStatusFromDropDown > 0) {
      this.getAllSubscriptionPlans();
    }
  }


  CheckBoxChecked(value: any) {
    if (value === 'Date') {
      this.isDateChecked = !this.isDateChecked;
      if (this.isDateChecked) {
        this.selectedDate = true;
        this.initializeFlatpickr();
      }
    }
  }

  initializeFlatpickr() {
    flatpickr("#startDate", {
      dateFormat: 'Y-m-d',
      mode: 'range',  // Enable date range selection
      onChange: (selectedDates, dateStr, instance) => {
        if (selectedDates.length === 2) {
          this.DateFromFlatpicker = this.formatDate(selectedDates[0]);
          this.DateToFlatpicker = this.formatDate(selectedDates[1]);
        }
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  applyFilters(e: any) {
    if (this.DateFromFlatpicker != null) {
      this.paginationbo.startDate = this.DateFromFlatpicker;
      this.paginationbo.endDate = this.DateToFlatpicker
      if (this.paginationbo.startDate != null && this.paginationbo.endDate) {
        this.getAllSubscriptionPlans();
      }
    }

  }

  getAllSubscriptionPlans() {
    var searchtext = $('#search').val();

    if (searchtext.length >= 3 || searchtext == "") {
      if (searchtext == "") {
        this.spinner.show();
      }
      this.paginationbo.searchText = searchtext
      this.spinner.hide()
    }
    else {
      this.paginationbo.searchText = "";
    }

    this.paymentService.getAllSubscriptionPlans(this.paginationbo).subscribe(data => {
      if (data.message == "OK") {
        this.getSubscriptionPlanList = data.result
      }
      else if (data.message == "Not found") {
        this.getSubscriptionPlanList = []
      }
    })
  }

  getAllMasterStatus() {
    this.paymentService.getAllMasterStatus().subscribe(data => {
      if (data.message == "OK")
        this.StatusList = data.result
    })
  }


  filter(key: string, value: any) {
    if (key === 'by-pagination') {
      this.paginationConfig.currentPage = value;
    };

  }

  getSubscriptionByID(id: any) {
    this.paymentService.getSubscriptionByID(id).subscribe(data => {
      if (data.message == "OK") {
        const enc_id = this.commonservice.encrypt(data.result.id.toString());
        this.router.navigate(['/view-invoice'], { queryParams: { enc_id: enc_id } });
      }
    })
  }

  //  downloadImageFile() {
  //   const url = this.RootURL + "Content/Image/Invoice/b7bd8d98-a0a7-445c-8dba-0df1f19c70dc.png";
  //   saveAs(url, 'invoice.pdf');
  // }


  downloadImageFile() {
    const url = this.RootURL + "Content/Image/Invoice/b7bd8d98-a0a7-445c-8dba-0df1f19c70dc.png";

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob'; // Set response type to blob

    xhr.onload = function () {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'invoice.png';
        link.click();
        window.URL.revokeObjectURL(link.href);
      } else {
        console.error('Failed to fetch the file');
      }
    };

    xhr.onerror = function () {
      console.error('Error during the XMLHttpRequest');
    };

    xhr.send();
  }
}
