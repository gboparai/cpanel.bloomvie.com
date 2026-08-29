import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  CommonModule,
  DatePipe,
  formatDate,
  NgFor,
  NgIf,
} from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import mapboxgl from 'mapbox-gl';
import { point } from '@turf/helpers';
import flatpickr from 'flatpickr';
import { ChartComponent } from 'ng-apexcharts';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
} from 'ng-apexcharts';
import { NgxPaginationModule } from 'ngx-pagination';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AttendanceDashboardService } from '../../attendance-dashboard/attendance-dashboard.service';
import { ManageStaffService } from '../../../day-care-management/staff-management/add-staff/manage-staff.service';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import Swal from 'sweetalert2';
import { CommonService } from '../../common.service';
import { start } from 'node:repl';
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { LoginService } from '../../../login/login.service';
import { lastValueFrom } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { SkeletonLoaderComponent } from '../../skeleton-loader/skeleton-loader.component';
import { TooltipComponent } from "../../tooltip/tooltip.component";

declare var $: any;

export type ApexPieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-payroll-expense',
  standalone: true,
  imports: [
    FullCalendarModule,
    NgIf,
    NgFor,
    CommonModule,
    ChartComponent,
    NgxPaginationModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BreadcrumbComponent,
    StripeCardComponent,
    SkeletonLoaderComponent,
    TooltipComponent
],
  providers: [DatePipe],
  templateUrl: './payroll-expense.component.html',
  styleUrl: './payroll-expense.component.css',
})
export class PayrollExpenseComponent implements OnInit, AfterViewInit {
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  @ViewChild('fileInput', { static: false }) FileInput!: ElementRef;
  @ViewChild('cardElem') cardElement!: StripeCardComponent;

  ContentP: number = 1;
  Contentsize: number = 5;
  calendarOptions: any;
  loginUserId: number = 0;
  employeSalaryList: any[] = [];

  centreID: any | undefined;
  userRoleID: any | undefined;
  CentreName: any;
  public searchText: string = '';
  filteredpayroll: any[] = [];
  selectedStartDate: any = '';
  selectedEndDate: any = '';
  selectedEndMonth: any = '';
  selectedStartMonth: any = '';
  selectStartDate: any = '';
  selectEndDate: any = '';
  sDate: any = '';
  eDate: any = '';
  hoveredRow: any = null;

  startMonth: any = '';
  formattedStartDate: any;

  formattedEndDate: any;
  toDatePickerInstance: any;
  formdata = new FormData();
  monthsRange: any = '';
  endMonth: any;
  startDate: any = '';
  endDate: any = '';
  previewUrl: string | null = null;
  previewType: 'image' | 'pdf' | null = null;
  isClosing = false;
  skeletonShow: 'Skelton' | 'NoRecord' | '' = 'Skelton';

  public paySalaryForm!: FormGroup;
  public isPaymentModeOnline: boolean = false;
  public submitted: boolean = false;
  public connectedAccountId: string = '';
  public selectedTeacherDetails: { firstName: string; lastName: '' } = {
    firstName: '',
    lastName: '',
  };
  expandedReasonIndex: number | null = null;

  constructor(
    private service: AttendanceDashboardService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private manageStaffSerivece: ManageStaffService,
    private cookieService: CookieService,
    private fb: FormBuilder,
    private loginService: LoginService,
    public sanitizer: DomSanitizer,
    public commonService: CommonService,
    private stripeService: StripeService
  ) {
    this.paySalaryForm = this.fb.group({
      employeeID: [0],
      paidAmount: [0, [Validators.required, Validators.min(1)]],
      startDate: [null],
      endDate: [null],
      payrollFrequency: [null],
      receiptImagePath: [],
      receiptImage: [],
      description: ['', [Validators.required]],
      userRoleID: [0],
      centreID: [0],
      paymentType: ['cash'],
      totalWorkingHours: [null],
      totalWorkingDays: [null],
      status: [''],
      createdBy: [0],
      onlinePaymentDetails: this.fb.group({
        firstName: [''],
        lastName: [''],
        email: [''],
        phoneNumber: [''],
      }),
      receiptFile: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    (
      this.paySalaryForm.get('paymentType') as FormControl
    ).valueChanges.subscribe((value) => {
      this.isPaymentModeOnline = value !== 'cash';
      const onlineGroup = this.paySalaryForm.get(
        'onlinePaymentDetails'
      ) as FormGroup;



      if (this.isPaymentModeOnline) {
        onlineGroup.get('firstName')?.setValidators([Validators.required]);
        onlineGroup.get('lastName')?.setValidators([Validators.required]);
        onlineGroup
          .get('email')
          ?.setValidators([Validators.required, Validators.email]);
        onlineGroup
          .get('phoneNumber')
          ?.setValidators([
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/),
          ]);
      } else {
        onlineGroup.get('firstName')?.clearValidators();
        onlineGroup.get('lastName')?.clearValidators();
        onlineGroup.get('email')?.clearValidators();
        onlineGroup.get('phoneNumber')?.clearValidators();
      }

      Object.keys(onlineGroup.controls).forEach((controlName) => {
        onlineGroup.get(controlName)?.updateValueAndValidity();
      });
    });

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      weekends: false,
      responsive: true,
      events: [{ title: 'Meeting', start: new Date() }],
    };

    this.loginUserId = this.loginService.authData?.userId || 0;
    this.centreID = parseInt(this.cookieService.get('CentreID'));

    // setTimeout(() => {
    this.userRoleID = parseInt(this.cookieService.get('UserRoleId'));
    // }, 10);

    const UserInfo = this.cookieService.get('UserInfo');
    if (UserInfo) {
      const parsedInfo = JSON.parse(UserInfo);
      const firstName = parsedInfo.result.firstName;
      const MiddleName = parsedInfo.result.middleName;
      const lastName = parsedInfo.result.lastName;
    }

    if (this.centreID != null) {
      this.getDayCareByID();
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    this.selectedStartMonth = `${year}-${month}`;

    this.selectedEndMonth = `${year}-${month}`;

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDate =
      this.selectedStartDate == ''
        ? this.formatDateToString(startOfMonth)
        : this.formatDateToString(new Date(this.selectedStartDate));

    this.endDate =
      this.selectedStartDate == ''
        ? this.formatDateToString(endOfMonth)
        : this.formatDateToString(new Date(this.selectedStartDate));

    const startDate = this.selectedStartDate ?? this.selectedStartDate;
    const endDate = this.selectedEndDate ?? this.selectedEndDate;

    this.sDate = this.startDate == null ? startDate : this.startDate;
    this.eDate = this.endDate == null ? endDate : this.endDate;

    this.getAllEmployeeSalary();
  }

  ngAfterViewInit() {
    const today = new Date();

    const logMonthsBetween = (startStr: string, endStr: string) => {
      if (!startStr || !endStr) return;

      let [startMonth, startYear] = startStr.split('.').map(Number);
      const [endMonth, endYear] = endStr.split('.').map(Number);

      const months = [];
      while (
        startYear < endYear ||
        (startYear === endYear && startMonth <= endMonth)
      ) {
        months.push(`${startMonth.toString().padStart(2, '0')}.${startYear}`);
        startMonth++;
        if (startMonth > 12) {
          startMonth = 1;
          startYear++;
        }
      }
      
    };

    const initMonthYearOnlyPicker = (
      selector: string,
      modelField: 'selectedStartDate' | 'selectedEndDate'
    ) => {
      flatpickr(selector, {
        dateFormat: 'm.Y',
        altInput: true,
        altFormat: 'F Y',
        defaultDate: today,
        maxDate: today,
        onChange: ([selected]) => {
          if (!selected) return;
          this[modelField] = this.datePipe.transform(selected, 'MM.yyyy')!;
          if (this.selectedStartDate && this.selectedEndDate) {
            logMonthsBetween(this.selectedStartDate, this.selectedEndDate);
          }
        },
        onReady: (_, __, instance) => {
          const calendarContainer = instance.calendarContainer;

          // Hide day grid and weekdays
          const days = calendarContainer.querySelector('.flatpickr-days');
          const weekdays = calendarContainer.querySelector(
            '.flatpickr-weekdays'
          );
          if (days) (days as HTMLElement).style.display = 'none';
          if (weekdays) (weekdays as HTMLElement).style.display = 'none';

          // Automatically open month view when calendar opens
          setTimeout(() => {
            instance.changeMonth(0); // Force render
            const monthDropdown = calendarContainer.querySelector(
              '.flatpickr-monthDropdown-months'
            );
            if (monthDropdown) {
              (monthDropdown as HTMLElement).focus();
            }
          });
        },
      });
    };

    initMonthYearOnlyPicker('#selectFromDate', 'selectedStartDate');
    initMonthYearOnlyPicker('#selectToDate', 'selectedEndDate');
  }

  today = new Date();
  onMonthChange(dateType: 'start' | 'end') {
    if (!this.selectedStartMonth) {
      console.warn('Start date not selected.');
      return;
    }

    const startParts = this.selectedStartMonth.split('-');
    let startMonth = +startParts[1];
    let startYear = +startParts[0];

    let endMonth = startMonth;
    let endYear = startYear;

    if (this.selectedEndMonth) {
      const endParts = this.selectedEndMonth.split('-');
      endMonth = +endParts[1];
      endYear = +endParts[0];
    }

    // If start > end, reset end = start
    if (
      startYear > endYear ||
      (startYear === endYear && startMonth > endMonth)
    ) {
      endMonth = startMonth;
      endYear = startYear;
    }

    // Prepare months list
    const months = [];
    let currentYear = startYear;
    let currentMonth = startMonth;

    while (
      currentYear < endYear ||
      (currentYear === endYear && currentMonth <= endMonth)
    ) {
      months.push(`${currentMonth.toString().padStart(2, '0')}.${currentYear}`);
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    this.monthsRange = months;
    this.startMonth = months[0];
    this.endMonth = months[months.length - 1];

    // 🔹 Convert startMonth and endMonth to full Date ranges
    const [startM, startY] = this.startMonth.split('.');
    const [endM, endY] = this.endMonth.split('.');

    const startDate = new Date(+startY, +startM - 1, 1); // First day of start month
    const endDate = new Date(+endY, +endM, 0); // Last day of end month

    this.selectedStartDate = this.formatDateToString(startDate);
    this.selectedEndDate = this.formatDateToString(endDate);

    this.getAllEmployeeSalary();
  }

  // Utility function to format date as yyyy-MM-dd
  formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDayCareByID() {
    this.service.getDayCareByID(this.centreID).subscribe((data) => {
      if (data.message == 'Success') {
        this.CentreName = data.result.centreName;
      } else {
        this.CentreName = [];
      }
    });
  }

  async submitPayment() {
    if (this.paySalaryForm.invalid) {
      this.paySalaryForm.markAllAsTouched();
      return;
    }

    this.submitted = true;
    this.spinner.show();
    try {
      const response = await this.commonService
        .uploadImages(this.formdata)
        .toPromise();
      const uploaded = response?.result?.[0];

      if (!uploaded) {
        this.toastr.error('Image upload failed.');
        return;
      }

      let paymentIntentId: string | null = null;
      let paymentStatus: string | null = null;
      let paymentMethod: string | null = null;
      let currency: string | null = null;
      let amountInCents: number | null = null;

      if (this.isPaymentModeOnline) {
        const clientSecret = await this.createPaymentIntent();
        const confirmResult = await this.confirmPayment(clientSecret);

        paymentIntentId = confirmResult?.paymentIntentId ?? null;
        paymentStatus = confirmResult?.status ?? null;
        paymentMethod = confirmResult?.payment_method ?? null;
        currency = confirmResult?.currency ?? null;
        amountInCents = confirmResult?.amountInCents ?? null;


        switch (paymentStatus) {
          case 'succeeded':
            await this.transferToConnectedAccount(
              paymentIntentId!,
              amountInCents!
            );
           
            break;

          case 'requires_payment_method':
            await Swal.fire({
              icon: 'warning',
              title: 'Payment Incomplete',
              text: 'Payment requires a valid payment method.',
              confirmButtonText: 'Update Payment Method',
            });
            return;

          case 'canceled':
            await Swal.fire({
              icon: 'info',
              title: 'Payment Cancelled',
              text: 'You have cancelled the payment process.',
              confirmButtonText: 'OK',
            });
            return;

          default:
            await Swal.fire({
              icon: 'error',
              title: 'Payment Failed',
              text: `The payment status is "${paymentStatus}". Please try again.`,
              confirmButtonText: 'OK',
            });
            return;
        }
      }

      const salaryId = await this.handleEmployeeSalary(uploaded);
      if (salaryId && this.isPaymentModeOnline && paymentIntentId) {
        await this.handlePayment(
          [salaryId],
          paymentIntentId,
          paymentStatus!,
          paymentMethod!,
          currency!
        );
      }

      Swal.fire({
        title: 'Payment Successful!',
        text: `Payment for ${this.selectedTeacherDetails?.firstName} ${this.selectedTeacherDetails?.lastName} is completed.`,
        icon: 'success',
        confirmButtonText: 'OK',
      });
      $('#purchased').modal('hide');
      this.selectedTeacherDetails = { firstName: '', lastName: '' };
      this.ResetForm();
      this.connectedAccountId = '';
      this.getAllEmployeeSalary();
    } catch (error) {
      console.error('Payment error:', error);
      this.toastr.error('An error occurred while processing the request');
    } finally {
      this.spinner.hide();
      this.submitted = false;
    }
  }

  async handleEmployeeSalary(uploadResponse: any): Promise<number | null> {
    try {
      this.paySalaryForm.patchValue({
        createdBy: this.loginUserId,
        centreID: this.centreID,
        userRoleID: this.userRoleID,
        status: 'paid',
        receiptImage: uploadResponse.imageName,
        receiptImagePath: uploadResponse.path,
      });

      const response: any = await this.commonService
        .dayCareEmployeeSalary(this.paySalaryForm.value)
        .toPromise();
      return response.result?.id ?? null;
    } catch (error) {
      console.error('Error processing salary payment:', error);
      throw error;
    }
  }

  async confirmPayment(clientSecret: string): Promise<{
    paymentIntentId: string | null;
    status: string | null;
    payment_method: string | any;
    currency: string | any;
    amountInCents: number | any;
  }> {
    try {
      const { firstName, lastName, email, phoneNumber } = (
        this.paySalaryForm.get('onlinePaymentDetails') as FormGroup
      ).value;
      const result = await this.stripeService
        .confirmCardPayment(clientSecret, {
          payment_method: {
            card: this.cardElement.element,
            billing_details: {
              name: `${firstName} ${lastName}`,
              email,
              phone: phoneNumber,
            },
          },
        })
        .toPromise();

      if (result?.error) {
        this.spinner.hide();
        console.error('Stripe Error:', result.error.message);
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: result.error.message,
        });
        return {
          paymentIntentId: null,
          status: 'failed',
          payment_method: null,
          currency: null,
          amountInCents: 0,
        };
      }

      const paymentIntentId = result?.paymentIntent?.id || null;
      const paymentStatus = result?.paymentIntent?.status || null;
      const totalAmountInCents = result?.paymentIntent?.amount || 0;

      if (!paymentIntentId) {
        this.spinner.hide();
        console.warn('Payment Intent ID not received.');
        Swal.fire({
          icon: 'warning',
          title: 'Payment Incomplete',
          text: 'We could not confirm your payment. Please try again.',
        });

        return {
          paymentIntentId: null,
          status: paymentStatus,
          payment_method: null,
          currency: null,
          amountInCents: 0,
        };
      }
      return {
        paymentIntentId,
        status: paymentStatus,
        payment_method: result?.paymentIntent?.payment_method,
        currency: result?.paymentIntent.currency,
        amountInCents: totalAmountInCents,
      };
    } catch (error) {
      this.spinner.hide();
      console.error('Payment Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An error occurred while confirming the payment.',
      });
      return {
        paymentIntentId: null,
        status: null,
        payment_method: null,
        currency: null,
        amountInCents: 0,
      };
    }
  }

  async transferToConnectedAccount(
    paymentIntentId: string,
    totalAmountInCents: number
  ): Promise<any> {
    try {
      const platformFeeInCents = Math.round(totalAmountInCents * (this.commonService.platFormFee() / 100))
      const payload = {
        connectAccountId: this.connectedAccountId,
        totalAmountInCents,
        platformFeeInCents,
        paymentIntentId,
      };
      const response = await this.commonService
        .transferToConnectedAccount(payload)
        .toPromise();
      if (response.message == 'Success') {
        return response;
      } else {
        this.toastr.error('some thing wents wrong !!');
      }
    } catch (error) {
      throw error;
    }
  }

  async createPaymentIntent(): Promise<string> {
    const payload = {
      amount: this.paySalaryForm.get('paidAmount')?.value,
      connectedAccountId: this.connectedAccountId,
    };
    const response = await lastValueFrom(
      this.commonService.createPaymentIntent(payload)
    );
    return response.clientSecret;
  }

  async handlePayment(
    subscriptionPlanPaymentId: number[],
    transactionId: string,
    paymentStatus: string,
    paymentMethod: string,
    currency: string
  ): Promise<any | null> {
    try {
      const formValues = (
        this.paySalaryForm.get('onlinePaymentDetails') as FormGroup
      ).value;
      const payload = {
        firstName: formValues.firstName?.trim() || '',
        lastName: formValues.lastName?.trim() || '',
        email: formValues.email?.toLowerCase() || '',
        subscriptionPlanPaymentId,
        paymentStatus: paymentStatus,
        paymentIntentId: transactionId,
        currency: currency,
        paymentMethod: paymentMethod,
        amount: (this.paySalaryForm.get('paidAmount') as FormControl).value,
        phoneNumber: formValues.phoneNumber || '',
      };

      const paymentResponse = await this.commonService
        .createPayment(payload)
        .toPromise();
      return paymentResponse.result;
    } catch (error) {
      throw error;
    }
  }

  onSelectSalaryDate(salary: any, data: any) {
    this.paySalaryForm.patchValue({
      startDate: salary.startDate,
      endDate: salary.endDate,
      payrollFrequency: salary.payrollFrequency,
      employeeID: data.teacherID,
      totalWorkingHours: salary.allWorkingHours,
      totalWorkingDays: salary.totalWorkingDays,
      paidAmount: salary.totalSalary,
    });
    this.connectedAccountId = data.connectedAccountId;
    this.selectedTeacherDetails = {
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
    };

    $('#purchased').modal('show');
  }

  downloadOneEmployeePdf(teacherID: number, salaryDate?: any) {
    const doc = new jsPDF();
    const img = new Image();
    img.src = 'assets/img/logo-new.png';

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let pageNumber = 1;

      const centreName = this.CentreName || 'Daycare Centre';
      const startDate = this.selectedStartDate || this.sDate;
      const endDate = this.selectedEndDate || this.sDate;

      const locale = 'en-US';
      const formattedStart = formatDate(startDate, 'dd MMM', locale);
      const formattedEnd = formatDate(endDate, 'dd MMM yyyy', locale);

      const teacher = this.displayedpayroll.find(
        (t: any) => t.teacherID === teacherID
      );

      if (!teacher) {
        console.error('Teacher not found!');
        return;
      }

      const fullName = teacher.lastName
        ? `${teacher.firstName} ${teacher.lastName}`
        : teacher.firstName;
      const address =
        [teacher.city, teacher.state, teacher.country]
          .filter(Boolean)
          .join(', ') || '--';

      const drawHeader = () => {
        doc.addImage(img, 'PNG', 15, 10, 40, 15);

        const centerX = pageWidth / 2;
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.text(centreName, centerX, 15, { align: 'center' });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Employee Salary Report', centerX, 22, { align: 'center' });

        doc.setFontSize(10);

        // const payrollFrequency = salaryDate?.payrollFrequency ?? '--';

        const infoText =
          `Date Range: ${formattedStart} to ${formattedEnd}` +
          (salaryDate?.startDate
            ? ` | Period: ${formatDate(
              salaryDate.startDate,
              'dd MMM',
              locale
            )} to ${formatDate(salaryDate.endDate, 'dd MMM yyyy', locale)}}`
            : '') +
          (salaryDate?.payrollFrequency
            ? ` | Payroll: ${salaryDate?.payrollFrequency ?? '--'}`
            : '');

        const splitInfo = doc.splitTextToSize(infoText, pageWidth - 30);
        doc.text(splitInfo, 15, 40);

        doc.text(`Name: ${fullName}`, 15, 47);
        doc.text(
          `Mobile: ${teacher.mobile ? '+1 ' + teacher.mobile : 'N/A'}`,
          15,
          53
        );

        doc.text(`Email: ${teacher.email}`, 15, 59);
        doc.text(`Address: ${teacher.address ?? '--'}`, 15, 65);

        doc.setFontSize(9);
        doc.text(`Page ${pageNumber}`, pageWidth - 30, pageHeight - 10);
      };

      // Filter monthlyDetails by selectedMonth if provided
      let filteredMonths = teacher.monthlyDetails;
      if (salaryDate?.startDate) {
        filteredMonths = teacher.monthlyDetails.filter(
          (m: any) => m.startDate === salaryDate.startDate
        );
      }

      const data: any[] = [];

      filteredMonths.forEach((month: any) => {
        const formatValue = (val: any) => {
          return val === '0' || val === 0 || val === '0.0' || val === '0.0 hr'
            ? '--'
            : val;
        };

        const locale = 'en-US';
        const formattedStart = formatDate(month.startDate, 'dd MMM', locale);
        const formattedEnd = formatDate(month.endDate, 'dd MMM yyyy', locale);

        data.push([
          `${formattedStart} to ${formattedEnd}`,
          formatValue(
            month.payrollFrequency || salaryDate?.payrollFrequency || '--'
          ),

          month.totalWorkingDays == 0
            ? '--'
            : formatValue(month.totalWorkingDays) + ' days',
          month.totalWorkingDays == 0
            ? '--'
            : formatValue(month.allWorkingHours) + ' hr',
          month.totalWorkingDays == 0
            ? '--'
            : '$ ' + formatValue(month.totalSalary),
          month.totalWorkingDays == 0
            ? '--'
            : '$ ' + formatValue(month.deductionAmount),
          month.totalWorkingDays == 0
            ? '--'
            : '$ ' + formatValue(month.paidAmount),
          formatValue(month.status),
        ]);
      });

      if (data.length === 0) {
        drawHeader();
        doc.setFontSize(12);
        doc.text(
          'No salary data available for the selected period.',
          pageWidth / 2,
          80,
          { align: 'center' }
        );
      } else {
        drawHeader();
        autoTable(doc, {
          head: [
            [
              'Month',
              'Frequency',
              'Working Days',
              'Working Hours',
              'Total Salary',
              'Deduction Amount',
              'Total Paid Amount',
              'Status',
            ],
          ],
          body: data,
          startY: 70,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [22, 160, 133] },
          margin: { top: 70 },
        });
      }

      doc.save(`Salary_Report_${fullName.replace(/\s+/g, '_')}.pdf`);
    };
  }

  PrintPdfView() {
    const doc = new jsPDF();
    const img = new Image();
    img.src = 'assets/img/logo-new.png';

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let pageNumber = 0;

      const centreName = this.CentreName || 'Daycare Centre';
      const startDate = this.selectedStartDate || this.sDate;
      const endDate = this.selectedEndDate || this.eDate;

      const locale = 'en-US';
      const formattedStart = formatDate(startDate, 'dd MMM', locale);
      const formattedEnd = formatDate(endDate, 'dd MMM yyyy', locale);

      const drawHeader = (teacher: any) => {
        pageNumber++;
        doc.addImage(img, 'PNG', 15, 10, 40, 15);

        const centerX = pageWidth / 2;
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.text(centreName, centerX, 15, { align: 'center' });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Employee Salary Report', centerX, 22, { align: 'center' });

        doc.setFontSize(10);
        const infoText = `Date Range: ${formattedStart} to ${formattedEnd}`;
        const splitInfo = doc.splitTextToSize(infoText, pageWidth - 30);
        doc.text(splitInfo, 15, 40);

        // Teacher Info
        const address = [teacher.city, teacher.state, teacher.country]
          .filter(Boolean)
          .join(', ');
        doc.setFontSize(10);
        doc.text(
          `Name: ${teacher.firstName} ${teacher.lastName ?? ''}`,
          15,
          47
        );
        doc.text(
          `Mobile: ${teacher.mobile ? '+1 ' + teacher.mobile : 'N/A'}`,
          15,
          53
        );

        doc.text(`Email: ${teacher.email || 'N/A'}`, 15, 59);
        doc.text(`Address: ${address || 'N/A'}`, 15, 65);

        // Footer
        doc.setFontSize(9);
        doc.text(`Page ${pageNumber}`, pageWidth - 30, pageHeight - 10);
      };

      // Loop through each employee
      this.displayedpayroll.forEach((teacher: any, index: number) => {
        const data: any[] = [];
        teacher.monthlyDetails.forEach((month: any) => {
          const formatValue = (val: any) => {
            if (val === '0' || val === 0 || val === '0.0' || val === 0.0) {
              return '--';
            }
            return val;
          };

          const locale = 'en-US';
          const formattedStart = formatDate(month.startDate, 'dd MMM', locale);
          const formattedEnd = formatDate(month.endDate, 'dd MMM yyyy', locale);

          data.push([
            `${formattedStart} to ${formattedEnd}`,
            month.payrollFrequency || '--',
            month.totalWorkingDays == 0
              ? '--'
              : formatValue(month.totalWorkingDays) + ' days',
            month.totalWorkingDays == 0
              ? '--'
              : formatValue(month.allWorkingHours) + ' hr',
            month.totalWorkingDays == 0
              ? '--'
              : '$ ' + formatValue(month.totalSalary),
            month.totalWorkingDays == 0
              ? '--'
              : '$ ' + formatValue(month.deductionAmount),
            month.totalWorkingDays == 0
              ? '--'
              : '$ ' + formatValue(month.paidAmount),
            month.status,
          ]);
        });

        if (index > 0) doc.addPage();

        drawHeader(teacher);

        autoTable(doc, {
          head: [
            [
              'Month',
              'Frequency',
              'Working Days',
              'Working Hours',
              'Total Salary',
              'Deduction Amount',
              'Total Paid Amount',
              'Status',
            ],
          ], // Added Frequency column here
          body: data,
          startY: 70,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [22, 160, 133] },
          margin: { top: 70 },
        });
      });

      doc.save('Employee_Salary_Report.pdf');
    };
  }

  resetfilter() {
    this.selectedStartDate = '';
    this.selectedEndDate = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedStartMonth = '';
    this.selectedEndDate = '';

    this.getAllEmployeeSalary();
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  getAllEmployeeSalary() {
    this.skeletonShow = 'Skelton';

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDate =
      this.selectedStartDate == ''
        ? this.formatDateToString(startOfMonth)
        : this.formatDateToString(new Date(this.selectedStartDate));

    this.endDate =
      this.selectedStartDate == ''
        ? this.formatDateToString(endOfMonth)
        : this.formatDateToString(new Date(this.selectedStartDate));

    if (this.selectedStartDate) {
      this.startDate = null;
      this.endDate = null;
    }

    const startDate = this.selectedStartDate ?? this.selectedStartDate;
    const endDate = this.selectedEndDate ?? this.selectedEndDate;

    const sDate = this.startDate == null ? startDate : this.startDate;
    const eDate = this.endDate == null ? endDate : this.endDate;
    const classId = 0;

    var employeeID = this.userRoleID == 4 ? this.loginUserId : [];

    this.service
      .getEmployeeAllDetails(
        Number(this.centreID),
        sDate,
        eDate,
        Number(this.userRoleID),
        employeeID
      )
      .subscribe((response) => {
        if (response.message === 'OK') {
          this.employeSalaryList = response.result;

          this.employeSalaryList.forEach((item: any) => {
            item.employeeProfileUrl = item.employeeProfileUrl
              ? this.commonService.convertS3File(item.employeeProfileUrl)
              : '';

            item.monthlyDetails?.forEach((detail: any) => {
              // Default values
              detail.salarySlipType = '';
              detail.salarySlipUrl = '';

              const slip = detail.salarySlip;

              // If base64 string exists
              if (slip?.startsWith('data:')) {
                detail.salarySlipUrl = this.commonService.base64ToBlobUrl(slip);

                if (slip.startsWith('data:image')) {
                  detail.salarySlipType = 'image';
                } else if (slip.startsWith('data:application/pdf')) {
                  detail.salarySlipType = 'pdf';
                }
              } else {
                detail.salarySlipUrl = '';
                detail.salarySlipType = '';
              }
            });
          });

          this.skeletonShow = '';
        } else {
          this.employeSalaryList = [];
          this.skeletonShow = '';
        }
      });
  }

  onFileChange(event: Event) {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const file = target.files;
    if (!file) {
      console.error('No file selected');
      return;
    }

    this.paySalaryForm.patchValue({ receiptFile: file });
    this.paySalaryForm.get('receiptFile')?.markAsTouched();
    const formdata = new FormData();
    formdata.append('files', file[0], file[0].name);
    formdata.append('type', 'CapitalPayroll');
    this.formdata = formdata;
  }

  // async UploadFiles(data: any): Promise<any> {
  //   try {
  //     const response = await this.commonService.uploadImages(data).toPromise();

  //     return response;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  applyFilter() {
    const term = this.searchText.trim().toLowerCase();

    this.filteredpayroll = this.employeSalaryList.filter(
      (item: any) =>
        item.firstName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term)
    );

    this.ContentP = 1;
  }

  get displayedpayroll() {
    return this.searchText?.trim()
      ? this.filteredpayroll
      : this.employeSalaryList;
  }

  ResetForm() {
    this.paySalaryForm.reset();
    this.formdata = new FormData();

    if (this.FileInput && this.FileInput.nativeElement) {
      this.FileInput.nativeElement.value = '';
    }

    this.paySalaryForm.markAsPristine();
    this.paySalaryForm.markAsUntouched();
  }

  // getAllExpenseTypes() {
  //   this.supplyServie.getAllExpenseTypes().subscribe({
  //     next: (data: any) => {
  //       if (data.message == "Success") {
  //         this.expenseType = data.result;
  //       } else {
  //       }
  //     }, error: (err) => {
  //       this.toaster.error("An error occurred while processing the request");
  //       console.error(err);
  //     }
  //   })
  // }

  openPreview(url: string, type: 'image' | 'pdf') {
    this.previewUrl = url;
    this.previewType = type;
    this.isClosing = false;
  }

  closePreview() {
    this.isClosing = true;
    setTimeout(() => {
      this.previewUrl = null;
      this.previewType = null;
      this.isClosing = false;
    }, 300);
  }
}
