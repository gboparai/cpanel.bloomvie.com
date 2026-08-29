import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { CapitalExpenseService } from '../capital-expense/capital-expense.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../../environments/environment';
import { timeStamp } from 'console';
import {
  CommonModule,
  DatePipe,
  formatDate,
  NgFor,
  NgIf,
} from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import flatpickr from 'flatpickr';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonService } from '../../common.service';
import { SkeletonLoaderComponent } from '../../skeleton-loader/skeleton-loader.component';
import { TooltipComponent } from '../../tooltip/tooltip.component';
@Component({
  selector: 'app-operating-expense',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    CommonModule,
    NgFor,
    NgIf,
    NgxSpinnerModule,
    NgxPaginationModule,
    FormsModule,
    SkeletonLoaderComponent,
    TooltipComponent,
  ],
  providers: [DatePipe],
  templateUrl: './operating-expense.component.html',
  styleUrl: './operating-expense.component.css',
})
export class OperatingExpenseComponent {
  readonly URL = environment.apiUrl.slice(0, -3);
  operatingExpenseList: any[] = [];
  userID: number = 0;
  public Contentsize = 5;
  public ContentP = 1;
  startDate: any;
  endDate: any;
  toDatePickerInstance: any;
  searchText: string = '';
  typingTimeout: any;
  skeletonShow: 'Skelton' | 'NoRecord' | '' = 'Skelton';

  constructor(
    private capitalExpenseService: CapitalExpenseService,
    private toastr: ToastrService,
    private cookie: CookieService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private commonService: CommonService
  ) { }
  ngOnInit() {
    this.userID = parseInt(this.cookie.get('UserId'));
    this.getOperatingExpensesList();
    this.dateRangePicker();

    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    this.startDate = this.datePipe.transform(oneMonthAgo, 'MM-dd-YYYY');
    this.endDate = this.datePipe.transform(today, 'MM-dd-YYYY');
  }

  getOperatingExpensesList() {
    this.skeletonShow = 'Skelton';

    var formattedstartDate: any = '';
    var endstartDate: any = '';
    if (this.startDate && this.endDate) {
      formattedstartDate = this.datePipe.transform(
        this.startDate,
        'YYYY-MM-dd'
      );
      endstartDate = this.datePipe.transform(this.endDate, 'YYYY-MM-dd');
    }
    this.capitalExpenseService
      .getAllExpensesListBasedOnType(
        this.userID,
        'Operating Expense',
        formattedstartDate,
        endstartDate,
        this.searchText
      )
      .subscribe({
        next: (data: any) => {
          if (data.message == 'Success')
            this.operatingExpenseList = data.result;
          this.operatingExpenseList.forEach((item) => {
            if (item?.cost != null) {
              const costNum = Number(item.cost);
              item.cost = costNum.toLocaleString('en-CA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            }
          });

          this.skeletonShow = '';
        },
        error: (err) => {
          // this.toastr.error('An error occurred while processing the Operating Expenses.');
          this.skeletonShow = '';

          console.error(err);
        },
      });
  }

  downloadReceipt(item: any) {
    // const URL = this.URL + item.receiptImagePath + item.receiptImage;
    const URL = this.commonService.convertS3File(item.receiptImage);
    window.open(URL, '_blank');
  }

  dateRangePicker() {
    const today = new Date();
    let toDatePickerInstance: flatpickr.Instance;

    // Start Date Picker
    flatpickr('#selectFromDate', {
      mode: 'single',
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: today,
      onChange: (selectedDates: Date[]) => {
        if (selectedDates.length) {
          const startDate = selectedDates[0];
          this.startDate = this.datePipe.transform(startDate, 'MM-dd-yyyy');
          this.endDate = '';
          // Dynamically update minDate for To Date Picker
          if (this.toDatePickerInstance) {
            this.toDatePickerInstance.set('minDate', startDate);
          }
        }
      },
    });

    // End Date Picker (To Date)
    this.toDatePickerInstance = flatpickr('#selectToDate', {
      mode: 'single',
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: today,
      onChange: (selectedDates: Date[]) => {
        if (selectedDates.length) {
          this.endDate = this.datePipe.transform(
            selectedDates[0],
            'MM-dd-yyyy'
          );
          this.getOperatingExpensesList();
        }
      },
    });
    //   let self = this;
    //   flatpickr('#dateRangePicker', {
    //     mode: 'range',
    //     dateFormat: 'm/d/y',
    //     allowInput: false,

    //     onClose(selectedDates: Date[]) {
    //       if (selectedDates.length == 2) {
    //         const formatDate = (date: any) => {
    //           const year = date.getFullYear();
    //           const month = String(date.getMonth() + 1).padStart(2, '0');
    //           const day = String(date.getDate()).padStart(2, '0');
    //           return `${year}/${month}/${day}`;
    //         };
    //         self.startDate = formatDate(selectedDates[0]);
    //         self.endDate = formatDate(selectedDates[1]);
    //       } else {
    //         self.startDate = null;
    //         self.endDate = null;
    //       }
    //     },
    //   });
    // }
  }

  onSearchInput() {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.getOperatingExpensesList();
    }, 1500);
  }

  PrintPdfView() {
    let daycareCentreInformation =
      this.commonService.daycareCentreInformation();
    const doc = new jsPDF();
    const img = new Image();
    img.src = daycareCentreInformation.dayCareCentreLogo
      ? daycareCentreInformation.dayCareCentreLogo
      : 'assets/img/logo-new.png';

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let pageNumber = 0;

      const centreName = daycareCentreInformation.dayCareCentreName;
      const startDate = this.startDate;
      const endDate = this.endDate;

      const locale = 'en-US';
      const safeDate = (date: any) =>
        date instanceof Date ? date : new Date(date);
      const formattedStart = formatDate(
        safeDate(startDate),
        'dd MMM yyyy',
        locale
      );
      const formattedEnd = formatDate(safeDate(endDate), 'dd MMM yyyy', locale);

      const drawHeader = () => {
        pageNumber++;
        doc.addImage(img, 'PNG', 15, 10, 40, 15);

        const centerX = pageWidth / 2;
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.text(centreName, centerX, 15, { align: 'center' });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Operating Expenses Report', centerX, 22, { align: 'center' });

        doc.setFontSize(10);
        const infoText = `Date Range: ${formattedStart} to ${formattedEnd}`;
        const splitInfo = doc.splitTextToSize(infoText, pageWidth - 30);
        doc.text(splitInfo, 15, 40);

        doc.setFontSize(9);
        doc.text(`Page ${pageNumber}`, pageWidth - 30, pageHeight - 10);
      };

      const chunkArray = <T>(arr: T[], size: number): T[][] =>
        arr.reduce(
          (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
          [] as T[][]
        );

      // Divide into chunks of 6
      const chunks = chunkArray(this.operatingExpenseList, 10);
      chunks.forEach((expenseChunk, index) => {
        if (index > 0) doc.addPage();
        drawHeader();

        const data = expenseChunk.map((exp) => [
          // formatDate(safeDate(exp.date), 'dd MMM yyyy', locale),
          exp.createdBy || '--',
          exp.itemName || '--',
          exp.description || '--',
          '--',
          exp.quantityPurchased || '--',
          exp.expenseType || '--',
          exp.cost ? `$${exp.cost}` : '--',
        ]);

        autoTable(doc, {
          head: [
            [
              'Recorded By',
              'Item Name	',
              'Description	',
              'Date',
              'Purchased Qty',
              'Expense Type',
              'Cost',
            ],
          ],
          body: data,
          startY: 70,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185] },
          margin: { top: 70 },
        });
      });

      doc.save('Operating_Expenses_Report.pdf');
    };
  }
}
