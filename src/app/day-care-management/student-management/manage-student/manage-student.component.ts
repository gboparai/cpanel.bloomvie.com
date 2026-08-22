import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  viewChild,
} from '@angular/core';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { ManageStudentService } from './manage-student.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ManageClassroomService } from '../../classroom-management/manage-classroom/manage-classroom.service';
import { AddAgeGroupService } from '../../../master-settings/age-group/add-age-group/add-age-group.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../../common-component/common.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ViewStudentComponent } from '../view-student/view-student.component';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ManageStaffService } from '../../staff-management/add-staff/manage-staff.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { SubscriptionFeaturesService } from '../../subscription-plans/subscription-features/subscription-features.service';
import flatpickr from 'flatpickr';
import { DatePipe } from '@angular/common';
import { NgIf } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-manage-student',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    NgSelectComponent,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    ViewStudentComponent,
    CommonModule,
    NgIf,
  ],
  providers: [DatePipe],
  templateUrl: './manage-student.component.html',
  styleUrl: './manage-student.component.css',
})
export class ManageStudentComponent implements OnInit {
  dropdownOpen = false;

  public ageGroupList: any[] = [];
  public classList: any[] = [];
  public sectionList: any[] = [];
  public inValidRecords: any[] = [];
  public parentListFormChild: any[] = [];
  public relationTypeList: string[] = ['Mother', 'Father', 'Guardian'];
  public relationTypeListForAddParentModel: string[] = [
    'Mother',
    'Father',
    'Guardian',
  ];
  public relationTypeList2: string[] = [];
  private centreID: number = 0;
  private loginUserID: number = 0;
  public form: any;
  public parentForm: any;
  private base64String: any;
  ContentsizeAcceptedList: number = 5;
  currentPage: number = 1;
  StudentItem: any;
  public showSpecifyRelationship: boolean = false;
  public showSpecifyRelationship1: boolean = false;
  planList: any;
  startDateToggle: boolean = true;
  planInfo: any;
  endDateToggle: boolean = true;
  private file: any;
  planDuration: any;
  // datePickerEndDate: any;
  datePickerStartDate: any;
  viewDropDown: boolean = true;
  isUpdate: boolean = false;
  selectClassID: any;
  classDetails: any;
  IncorrectMobileNumberFormat: boolean = false;
  userRoleID: any;

  @ViewChild(ViewStudentComponent) childComponent!: ViewStudentComponent;
  daycarecentreDetails: any;
  studentInformation: any;
  countries: any[] = [];
  selectedCountry: any;

  constructor(
    private manageStudentService: ManageStudentService,
    private spinner: NgxSpinnerService,
    private planService: SubscriptionFeaturesService,
    private toastr: ToastrService,

    private route: ActivatedRoute,
    private cookie: CookieService,
    private datePipe: DatePipe,

    private commonService: CommonService,
    private fb: FormBuilder,
    public onBoardingService: OnboardingService,
    private cdRef: ChangeDetectorRef,
    private navigate: Router
  ) {
    this.form = fb.group({
      studentInformation: fb.group({
        id: [0],
        firstName: [null, [Validators.required]],
        lastName: [null],
        ageGroupID: [null, [Validators.required]],
        gender: [null, [Validators.required]],
        isActive: [null],
        dob: [null, [Validators.required]],
      }),
      parentInformation: fb.group({
        id: 0,
        firstName: [null, [Validators.required]],
        lastName: [null],
        email: ['', [Validators.required, Validators.email]],
        mobile: [null, [Validators.required, Validators.minLength(10)]],
        country: [null],
        state: [null],
        city: [null],
        pinCode: [
          null,
          [
            Validators.required,
            Validators.pattern(/^(\d{5}(-\d{4})?|[A-Z]\d[A-Z] \d[A-Z]\d)$/),
          ],
        ],

        relation: [null, [Validators.required]],
        address: [null, [Validators.required]],
        specifyRelationship: [null],
        planID: [null, [Validators.required]],
        PaymentDates: this.fb.array([]),
        // startDate: [null, [Validators.required]],
        // endDate: [null, [Validators.required]],
      }),
    });

    this.parentForm = fb.group({
      id: 0,
      firstName: [null, [Validators.required]],
      lastName: [null],
      email: [null, [Validators.required, Validators.email]],
      mobile: [
        '',
        [Validators.required, Validators.pattern(/^\d{3} \d{3} \d{4}$/)],
      ],
      country: [null],
      state: [null],
      city: [null],
      pinCode: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(\d{5}(-\d{4})?|[A-Z]\d[A-Z] \d[A-Z]\d)$/),
        ],
      ],

      relation: [null, [Validators.required]],
      address: [null, [Validators.required]],
      specifyRelationship: [null],
    });
  }

  ngOnInit(): void {
    this.countries = this.commonService.getCountriesFlag();
    this.selectedCountry = this.commonService.getDefaultCountryFlag(1);

    // const navigation = window.history.state;
    if (this.cookie.get('studentData')) {
      let studentInformation = this.cookie.get('studentData');
      this.StudentItem = JSON.parse(studentInformation);
      this.cdRef.detectChanges();
      this.cookie.delete('studentData');
    }

    this.userRoleID = this.cookie.get('UserRoleId');
    // if (navigation && navigation['data']) {
    //   this.StudentItem = navigation['data'];
    // }

    if (this.cookie.get('ShowModel') == 'true') {
      let parentList = this.cookie.get('parentList');
      this.parentListFormChild = JSON.parse(parentList);
      this.filterRelation();
      $('#more-parent').modal('show');
      this.cookie.delete('ShowModel');
      this.cookie.delete('parentList');
    }

    this.route.queryParamMap.subscribe((params) => {
      let enc_id: any = params.get('enc_id');
      if (enc_id) {
        const decryptedId = this.commonService.decrypt(enc_id);
        this.centreID =
          decryptedId && !isNaN(Number(decryptedId))
            ? parseInt(decryptedId, 10)
            : 0;
      } else if (this.cookie.check('CentreID')) {
        this.centreID = parseInt(this.cookie.get('CentreID'));
      }
      if (this.centreID) {
        if (this.cookie.check('UserId')) {
          this.loginUserID = parseInt(this.cookie.get('UserId'));
        }
        this.getAgeGroupList();
      }
    });
    this.getAllAddedPlans();
    this.getDayCareCentreDetails();
    if (this.StudentItem) {
      this.onEditStudent(this.StudentItem);
    }
    // this.cdRef.detectChanges();
  }

  ngAfterViewInit(): void {
    const currentDate = new Date();
    this.datePickerStartDate = flatpickr('#datePickerStartDate', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: currentDate,
    });

    flatpickr('#dobDatePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: 'today',
    });
    // this.datePickerEndDate = flatpickr('#datePickerEndDate', {
    //   dateFormat: 'm-d-Y',
    //   allowInput: true,
    // });
  }

  getAllAddedPlans() {
    this.planService
      .GetSubscriptionPlanandFeaturesByUserId(this.loginUserID, 'daycare')
      .subscribe((val: any) => {
        if (val.message == 'OK') {

          this.planList = val.result;
        }
      });
  }

  getPlanDetails(event: any) {
    this.planInfo = event.planId;
    this.planDuration = event.duration.toLowerCase();
    if (!this.planInfo) {
      this.startDateToggle = true;
    } else {
      this.startDateToggle = false;
    }
  }

  onClearClass() {
    this.classDetails = '';
  }

  onClear() {
    this.startDateToggle = true;
  }

  // adding the month on the start date
  addOneMonth(dateString: string): string {
    // const dateParts = dateString.split('-');
    // const month = parseInt(dateParts[0], 10) - 1;
    // const day = parseInt(dateParts[1], 10);
    // const year = parseInt(dateParts[2], 10);

    // let date = new Date(year, month, day);

    // date.setMonth(date.getMonth() + 1);

    // if (date.getDate() !== day) {
    //   date.setDate(0);
    // }

    // const newMonth = ('0' + (date.getMonth() + 1)).slice(-2);
    // const newDay = ('0' + date.getDate()).slice(-2);
    // const newYear = date.getFullYear();

    // return `${newMonth}-${newDay}-${newYear}`;

    const [monthStr, dayStr, yearStr] = dateString.split('-');
    const month = parseInt(monthStr, 10) - 1; // JavaScript months are 0-based
    const year = parseInt(yearStr, 10);

    // Create a date pointing to the first day of the **next month**
    const nextMonth = new Date(year, month + 1, 1);

    // Set day to 0 to get the **last day of the current month**
    nextMonth.setDate(0);

    const lastMonth = ('0' + (nextMonth.getMonth() + 1)).slice(-2);
    const lastDay = ('0' + nextMonth.getDate()).slice(-2);
    const lastYear = nextMonth.getFullYear();

    return `${lastMonth}-${lastDay}-${lastYear}`;
  }

  // calculate the endDate on the basis of the year
  addOneYear(dateString: string): string {
    const dateParts = dateString.split('-');
    const month = parseInt(dateParts[0], 10) - 1;
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    let date = new Date(year, month, day);

    date.setFullYear(date.getFullYear() + 1);

    const newMonth = ('0' + (date.getMonth() + 1)).slice(-2);
    const newDay = ('0' + date.getDate()).slice(-2);
    const newYear = date.getFullYear();

    return `${newMonth}-${newDay}-${newYear}`;
  }

  // calculating the number of days in selected month
  getDaysInSelectedMonth(billingDate: Date) {
    const selectedDate = new Date(billingDate);
    const selectedMonth = selectedDate.getMonth();
    const nextMonth = selectedMonth + 1;
    const firstDayOfNextMonth: any = new Date(
      selectedDate.getFullYear(),
      nextMonth,
      1
    );
    const lastDayOfSelectedMonth = new Date(firstDayOfNextMonth - 1);

    return lastDayOfSelectedMonth.getDate();
  }

  // calculating how many days left in the month
  getDaysLeftInMonth(selectedDate: Date) {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDayOfNextMonth: any = new Date(year, month + 1, 1);

    const lastDayOfSelectedMonth = new Date(firstDayOfNextMonth - 1);
    const timeDifference =
      lastDayOfSelectedMonth.getTime() - selectedDate.getTime();
    const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));

    return daysLeft;
  }

  get paymentDates(): FormArray {
    return this.form.get('parentInformation.PaymentDates') as FormArray;
  }

  getPlanEndDate(event: any) {
    let endDate = '';
    let InvoicePrice: number = 0;

    this.paymentDates.clear();
    if (this.planDuration == 'monthly') {
      let isDateValidToCalculate = new Date(event.target.value);
      let planInformation = this.planList.filter(
        (item: any) => item.planId == this.planInfo
      );
      if (isDateValidToCalculate.getDate() == 1) {
        endDate = this.addOneMonth(event.target.value);
        InvoicePrice = planInformation[0].price;

        let formatedStartDate = this.datePipe.transform(
          event.target.value,
          'yyyy-MM-dd'
        );

        let formatedEndDate = this.datePipe.transform(endDate, 'yyyy-MM-dd');

        const OneToOneCylceGroup = this.fb.group({
          PaymentAmount: [planInformation[0].price, [Validators.required]],
          PaymentDate: [formatedStartDate, [Validators.required]],
          DueDate: [formatedEndDate, [Validators.required]],
        });

        this.paymentDates.push(OneToOneCylceGroup);
      } else {
        let currentMonthDays = this.getDaysInSelectedMonth(event.target.value);

        let planPricePerDay = Math.round(
          planInformation[0].price / currentMonthDays
        );
        let numberOfDaysLeftInTheMonth: any = this.getDaysLeftInMonth(
          new Date(event.target.value)
        );

        let formatedFirstStartDate = this.datePipe.transform(
          event.target.value,
          'yyyy-MM-dd'
        );

        InvoicePrice = planPricePerDay * numberOfDaysLeftInTheMonth;

        let FirstdueDate = new Date(event.target.value);

        FirstdueDate.setDate(
          FirstdueDate.getDate() + (numberOfDaysLeftInTheMonth - 1)
        );
        let formatedEndDate = this.datePipe.transform(
          FirstdueDate,
          'yyyy-MM-dd'
        );

        const FirstpaymentGroup = this.fb.group({
          PaymentAmount: [InvoicePrice, [Validators.required]],
          PaymentDate: [formatedFirstStartDate, [Validators.required]],
          DueDate: [formatedEndDate, [Validators.required]],
        });

        this.paymentDates.push(FirstpaymentGroup);

        let secondStartDate = new Date(FirstdueDate);
        secondStartDate.setDate(secondStartDate.getDate() + 1);

        let formatedSecondStartDate = this.datePipe.transform(
          secondStartDate,
          'yyyy-MM-dd'
        );
        let secondEndDate = this.addOneMonth(
          this.datePipe.transform(secondStartDate, 'MM-dd-yyyy') || ''
        );
        let formatedSecondEndDate = this.datePipe.transform(
          secondEndDate,
          'yyyy-MM-dd'
        );

        const SecondpaymentGroup = this.fb.group({
          PaymentAmount: [planInformation[0].price, [Validators.required]],
          PaymentDate: [formatedSecondStartDate, [Validators.required]],
          DueDate: [formatedSecondEndDate, [Validators.required]],
        });

        this.paymentDates.push(SecondpaymentGroup);
      }
    } else if (this.planDuration == 'yearly') {
      endDate = this.addOneYear(event.target.value);
    }
    // if (this.datePickerEndDate) {
    //   this.datePickerEndDate.setDate(endDate);
    // }

    // let formattedEndDate = this.datePipe.transform(endDate, 'yyyy-MM-dd');

    // this.form.get('parentInformation').patchValue({
    //   startDate: formatedStartDate,
    //   endDate: formattedEndDate,
    // });
  }

  changeFormat(value: any) {
    let dob = value;
    let formatedDOB = this.datePipe.transform(dob, 'yyyy-MM-dd');
    return formatedDOB;
  }

  getFormGroup(groupName: string) {
    return this.form.get(groupName);
  }

  get studentFormControls() {
    return this.form.get('studentInformation').controls;
  }
  get parentFormControls() {
    return this.form.get('parentInformation').controls;
  }

  get parentFormControls1() {
    return this.parentForm.controls;
  }

  onChangeRelationType(value: string) {
    const relationToStudentControl = (
      this.getFormGroup('parentInformation') as FormGroup
    ).get('specifyRelationship') as FormControl;
    if (value === 'Guardian') {
      this.showSpecifyRelationship = true;
      relationToStudentControl.addValidators([Validators.required]);
    } else {
      this.showSpecifyRelationship = false;
      relationToStudentControl.removeValidators([Validators.required]);
    }
    relationToStudentControl.updateValueAndValidity();
  }

  onChangeRelationType1(value: string) {
    const relationToStudentControl = (this.parentForm as FormGroup).get(
      'specifyRelationship'
    ) as FormControl;
    if (value === 'Guardian') {
      this.showSpecifyRelationship1 = true;
      relationToStudentControl.addValidators([Validators.required]);
    } else {
      this.showSpecifyRelationship1 = false;
      relationToStudentControl.removeValidators([Validators.required]);
    }
    relationToStudentControl.updateValueAndValidity();
  }

  getAgeGroupList() {
    // this.spinner.show();
    this.manageStudentService.GetAllAgeGroup(this.centreID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.ageGroupList = response.result;
          // this.ageGroupList = this.ageGroupList.map(item => ({ id: item.id, name: item.ageGroupTitle + " " + "(" + item.minAge + "-" + item.maxAge + ")" }));
          this.ageGroupList = this.ageGroupList.map((item) => ({
            id: item.id,
            // name: `(${item.minAge}-${item.maxAge} ) Months`,

            //Added on 25/04/25
            name: `${item.minAge} - ${item.maxAge} ${item.isMonthly ? 'Month' : 'Year'
              } (${item.isMonthly
                ? this.convertMonthToYear(item.minAge) +
                ' - ' +
                this.convertMonthToYear(item.maxAge) +
                ' Year'
                : this.convertYearToMonth(item.minAge) +
                ' - ' +
                this.convertYearToMonth(item.maxAge) +
                ' Month'
              })`,
          }));
        }
        // setTimeout(() => {
        //   this.spinner.hide();
        // }, 300);
      },
      error: (err) => {
        this.toastr.error(err.message);
        // this.spinner.hide();
      },
    });
  }

  convertYearToMonth(year: number): number {
    return year * 12;
  }

  convertMonthToYear(month: number): number {
    return parseFloat((month / 12).toFixed(1));
  }

  getClassesByAgeGroup(ageGroupID: number) {
    // this.form.get('studentInformation').get('classID').reset();
    // this.form.get('studentInformation').get('sectionID').reset();
    this.classList = [];
    this.sectionList = [];
    this.manageStudentService
      .getClassesByAgeGroup(this.centreID, ageGroupID)
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.classList = response.result;

          }
        },
        error: (err) => { },
      });
  }

  getDayCareCentreDetails() {
    this.manageStudentService
      .getDayCareCentreClassDetails(this.selectClassID)
      .subscribe({
        next: (response) => {
          if (response.message === 'OK') {
            this.classDetails = response.result;
          }
        },
        error: (err) => { },
      });
  }

  onChangeClass(ID: number) {
    this.selectClassID = ID;

    this.getDayCareCentreDetails();
    // this.getFormGroup('studentInformation').get('sectionID').reset();
    // this.sectionList = [];
    // this.manageStaffService.getDaycareClassSections(ID).subscribe({
    //   next: (response) => {
    //     if (response.message === 'Success') {
    //       this.sectionList = response.result;
    //     }
    //   },
    //   error: (err) => {},
    // });
  }

  onAddStudent() {
    if (
      this.getFormGroup('studentInformation').valid &&
      this.getFormGroup('parentInformation').valid
    ) {
      this.spinner.show();
      const jsonData = this.getFormGroup('studentInformation').value;

      jsonData['dob'] = this.changeFormat(jsonData.dob);
      const parentData = this.getFormGroup('parentInformation').value;
      jsonData.loginUserID = this.loginUserID;
      jsonData.centreID = this.centreID;
      if (!jsonData.id && !parentData.id) {
        jsonData.id = 0;
        parentData.id = 0;
      }
      jsonData['parent'] = parentData;
      if (this.showSpecifyRelationship) {
        jsonData.relation = jsonData.specifyRelationship;
      }

      this.manageStudentService.manageStudentEnrollment(jsonData).subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            if (this.userRoleID == 3) {
              this.getFormGroup('studentInformation').reset({
                id: 0,
                parentID: 0,
              });
              this.getFormGroup('parentInformation').reset({ id: 0 });
              this.onChangeRelationType('Other');
              this.datePickerStartDate.clear();
              this.classDetails = '';

              this.getAgeGroupList();
              this.viewDropDown = true;
              this.isUpdate = false;
              this.childComponent.getStudentList();
              this.toastr.success(response.activity);
              this.getDayCareCentreDetails();
            } else {
              this.getFormGroup('studentInformation').reset({
                id: 0,
                parentID: 0,
              });
              this.getFormGroup('parentInformation').reset({ id: 0 });
              this.datePickerStartDate.clear();
              this.viewDropDown = true;
              this.isUpdate = false;
              this.classDetails = '';
              this.toastr.success(response.activity);
              if (
                window.location.href ===
                window.location.origin + '/student-enrollment'
              ) {
                this.navigate.navigate(['/view-student']);
              }
            }
          } else if (response.message === 'This DayCare is already full.') {
            this.toastr.error('This DayCare is already full.');
          } else {
            this.toastr.error(response.message);
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
        error: (err) => {
          this.toastr.error(err.message);
        },
      });
    } else {
      this.getFormGroup('studentInformation').markAllAsTouched();
      this.getFormGroup('parentInformation').markAllAsTouched();
    }
  }

  proceededOnBoarding() {
    this.spinner.show();
    this.commonService
      .manageDaycareOnBoarding(this.centreID, 'ManageDaycareClildEnrollment')
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            if (!this.onBoardingService.onBoardingData.isCompleteStep6) {
              this.onBoardingService.onBoardingData.isCompleteStep6 = true;
              this.onBoardingService.handleNext('Tab-6');
            } else {
              this.toastr.success(response.activity);
              this.onBoardingService.getCurrentTab();
            }
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err.message);
        },
      });
  }

  onReceiveParentList(parentList: any[]) {
    let relationList: any[] = [];

    this.parentListFormChild = parentList;
    this.filterRelation();
    // for(let i = 0;i <= parentList.length; i++){
    //   relationList.push(parentList[i].relation);
    // }

    // for(let i = 0; i <= relationList.length; i++){
    //   if(relationList[i].contains("Father")){
    //     // this.relationTypeList2 = this.relationTypeList.filter

    //     // filter
    //   }
    // }
  }

  filterRelation() {
    let relationDropDown = this.parentListFormChild;
    if (relationDropDown.length > 0) {
      this.relationTypeList = ['Mother', 'Father', 'Guardian'];

      this.parentListFormChild.forEach((val: any) => {
        if (val.relation == 'Father' || val.relation == 'Mother') {
          this.relationTypeList = this.relationTypeList.filter(
            (res: any) => res != val.relation
          );
        }
      });
    } else {
      this.relationTypeList = ['Mother', 'Father', 'Guardian'];
    }
  }

  onEditParent(parent: any) {
    const parentFormGroup = this.parentForm as FormGroup;
    const isSpeceficRelation = this.relationTypeList.find(
      (x) => x === parent.relation
    );
    if (!isSpeceficRelation) {
      this.showSpecifyRelationship1 = true;
    }

    parentFormGroup.patchValue({
      id: parent.id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      mobile: parent.mobile,
      country: parent.country,
      state: parent.state,
      city: parent.city,
      pinCode: parent.pinCode,
      relation: isSpeceficRelation ? isSpeceficRelation : 'Guardian',
      address: parent.address,
      specifyRelationship: !isSpeceficRelation ? parent.relation : null,
    });

    $('#relationDropdownDiv');
  }
  formatPhoneNumber(event: any) {
    const formatted = this.commonService.formatPhoneNumber(event.target.value);
    event.target.value = formatted;
    this.parentForm.controls['mobile'].setValue(formatted);
  }

  formatPostalCode(event: any): void {
    const formatted = this.commonService.formatPostalCode(event.target.value);
    event.target.value = formatted;

    this.parentForm.controls['pinCode'].setValue(formatted, {
      emitEvent: false,
    });
  }

  onEditStudent(jsonData: any) {
    this.isUpdate = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const studentFormGroup = this.getFormGroup(
      'studentInformation'
    ) as FormGroup;
    const parentFormGroup = this.getFormGroup('parentInformation') as FormGroup;
    const studentInformation = jsonData;
    this.studentInformation = studentInformation;
    const parentInformation = jsonData.parentList[0];
    // this.getClassesByAgeGroup(studentInformation.ageGroupID);
    this.onChangeClass(studentInformation.classID);
    const isSpeceficRelation = this.relationTypeList.find(
      (x) => x === parentInformation.relation
    );
    if (!isSpeceficRelation) {
      this.showSpecifyRelationship = true;
    }

    const startDateForm = this.datePipe.transform(
      studentInformation.startDate,
      'yyyy-MM-dd'
    );
    const endDateForm = this.datePipe.transform(
      studentInformation.endDate,
      'yyyy-MM-dd'
    );

    const startDate = this.datePipe.transform(
      studentInformation.startDate,
      'MM-dd-yyyy'
    );
    const endDate = this.datePipe.transform(
      studentInformation.endDate,
      'MM-dd-yyyy'
    );

    this.viewDropDown = false;
    setTimeout(() => {
      const planName = document.getElementById('planName') as HTMLInputElement;
      if (planName) {
        planName.value = studentInformation.planName
          ? studentInformation.planName
          : '';
      }
      this.datePickerStartDate.setDate(startDate);
      // this.datePickerEndDate.setDate(endDate);
    }, 0);

    // this.planInfo = studentInformation.planName;
    setTimeout(() => {
      studentFormGroup.patchValue({
        id: studentInformation.id,
        firstName: studentInformation.firstName,
        lastName: studentInformation.lastName,
        classID: studentInformation.classID,
        ageGroupID: studentInformation.ageGroupID,
        dob: this.datePipe.transform(studentInformation.dob, 'MM-dd-yyyy'),
        gender: studentInformation.gender,
        isActive: studentInformation.isActive,
      });
      parentFormGroup.patchValue({
        id: parentInformation.id,
        firstName: parentInformation.firstName,
        lastName: parentInformation.lastName,
        email: parentInformation.email,
        mobile: parentInformation.mobile,
        country: parentInformation.country,
        state: parentInformation.state,
        city: parentInformation.city,
        pinCode: parentInformation.pinCode,
        relation: isSpeceficRelation ? isSpeceficRelation : 'Guardian',
        address: parentInformation.address,
        specifyRelationship: !isSpeceficRelation
          ? parentInformation.relation
          : null,
        planID: studentInformation.planID,
        startDate: startDateForm,
        endDate: endDateForm,
      });
    }, 0);

    if (parentInformation.country == 'Canada') {
      this.selectedCountry = this.commonService.getDefaultCountryFlag(1);
    } else {
      this.selectedCountry = this.commonService.getDefaultCountryFlag(0);
    }
  }

  addParent(): void {
    if (this.parentForm?.valid) {
      this.spinner.show();
      if (this.showSpecifyRelationship1) {
        this.parentForm
          .get('relation')
          ?.setValue(this.parentForm.get('specifyRelationship')?.value);
      }
      this.manageStudentService
        .manageParent(this.parentForm.value, this.childComponent.studentID)
        .subscribe({
          next: (response) => {
            if (response.message === 'Success') {
              this.toastr.success(response.activity);

              $('#more-parent').modal('hide');
              this.childComponent.getStudentList();
              this.removeRelationControlValidator1();
              this.parentForm.reset({ id: 0 });
              this.showSpecifyRelationship1 = false;
            } else if (response.message == 'Email already exists.') {
              this.toastr.warning('Email already exists.');
            } else if (response.message == 'Mobile number already exists.') {
              this.toastr.warning('Mobile number already exists.');
            } else {
              this.toastr.warning(response.message);
            }
            setTimeout(() => {
              this.spinner.hide();
            }, 300);
          },
          error: (error) => {
            // handle error
          },
        });
    } else {
      this.parentForm.markAllAsTouched();
    }
  }

  removeRelationControlValidator() {
    const relationToStudnetFormControl = (
      this.getFormGroup('parentInformation') as FormGroup
    ).get('relation') as FormControl;
    relationToStudnetFormControl.removeValidators([Validators.required]);
    relationToStudnetFormControl.updateValueAndValidity();
  }
  removeRelationControlValidator1() {
    const relationToStudnetFormControl = (this.parentForm as FormGroup).get(
      'relation'
    ) as FormControl;
    relationToStudnetFormControl.removeValidators([Validators.required]);
    relationToStudnetFormControl.updateValueAndValidity();
  }

  allowOnlyNumericInput(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (
      (charCode < 48 || charCode > 57) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
        event.key
      )
    ) {
      event.preventDefault();
    }
  }

  downloadBulkFormatSheet() {
    this.spinner.show();
    this.manageStudentService
      .downloadBulkUploadFormatSheet(this.centreID, this.loginUserID)
      .subscribe({
        next: (response) => {
          const base64String = response.result;
          const byteCharacters = atob(base64String);

          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'StudentData.xlsx';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.spinner.hide();
        },
        error: (err) => {
          this.toastr.error('Failed to download the Excel file.');
          console.error(err);
          this.spinner.hide();
        },
      });
  }

  excelSerialToDate(serial: number, format: string = 'yyyy-MM-dd'): string {
    const excelStartDate = new Date(1899, 11, 30);
    const date = new Date(excelStartDate.getTime() + serial * 86400000);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format
      .replace('yyyy', String(year))
      .replace('MM', month)
      .replace('dd', day);
  }

  isValidExcelDate(value: any): boolean {
    return !isNaN(value) && Number(value) > 0;
  }

  onChangeFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedMimeType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExtension = file.name.split('.').pop();
      if (file.type !== allowedMimeType && fileExtension !== 'xlsx') {
        Swal.fire({
          icon: 'error',
          title: 'Invalid file type',
          text: 'Please upload a valid Excel file (.xlsx)',
        });
        return;
      }
      this.file = file;
    }
  }

  uploadBulkStudent() {
    if (!this.file) {
      Swal.fire({
        icon: 'error',
        title: 'No File Selected',
        text: 'Please choose a file to upload!',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.spinner.show();
    const formData = new FormData();
    formData.append('file', this.file);
    this.manageStudentService
      .uploadBulkStudent(formData, this.centreID, this.loginUserID)
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.toastr.success(response.activity);
            if (response.result.skipRecords.length > 0) {
              // this.inValidRecords = response.result.skipRecords;
              response.result.skipRecords.forEach((item: any) => {
                const isValidDateString = this.isValidExcelDate(item.date);
                if (item.date && isValidDateString) {
                  let date = this.excelSerialToDate(item.date, 'MM/dd/yyyy');
                  item.date = date;
                  this.inValidRecords.push(item);
                } else {
                  this.inValidRecords.push(item);
                }
              });

              this.base64String = response.result.base64String;
            } else {
              $('#exampleModal').modal('hide');
              $('#formFile').val('');
            }
            this.childComponent.getStudentList();
            this.file = null;
          } else {
            this.toastr.warning(response.message);
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
        error: (err) => {
          this.toastr.error(err.message);
          this.spinner.hide();
        },
      });
  }

  downloadSkipRecordsSheet() {
    if (this.base64String) {
      const byteCharacters = atob(this.base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Invalid_StudentData.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  checkEmailExistsForEnrollmentRequest() {
    let email: string = this.form.value.parentInformation.email;
    const parentFormGroup = this.getFormGroup('parentInformation') as FormGroup;

    this.manageStudentService
      .checkEmailExistsForEnrollmentRequest(email)
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          parentFormGroup.patchValue({
            id: result.result.id,
            firstName: result.result.firstName,
            lastName: result.result.lastName,
            email: result.result.email,
            mobile: result.result.mobile,
            country: result.result.country,
            state: result.result.state,
            city: result.result.city,
            pinCode: result.result.pinCode,
            relation: result.result.relationToChild,
            address: result.result.address,
          });
        }
      });
  }

  onModalClose() {
    this.childComponent.studentID = 0;
    this.parentForm.reset({ id: 0 });
    this.childComponent.isModalVisible = false;
    $('#more-parent').modal('hide');
  }
  onBulkUploadModalClose() {
    this.base64String = undefined;
    this.inValidRecords = [];
    this.file = undefined;
  }

  fetchLocationData(postalCode: string) {
    const trimmedPostalCode = postalCode?.trim()?.toUpperCase();
    if (!trimmedPostalCode) return;

    const isCanada = /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(trimmedPostalCode);
    const isUSA = /^\d{5}$/.test(trimmedPostalCode);

    let url = '';
    if (isCanada) {
      const normalized = trimmedPostalCode.split(' ')[0];
      url = `https://api.zippopotam.us/ca/${normalized}`;
    } else if (isUSA) {
      url = `https://api.zippopotam.us/us/${trimmedPostalCode}`;
    } else {
      this.getFormGroup('parentInformation').patchValue({
        pinCode: null,
      });
      return; // invalid format, do nothing
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      const parentFormGroup = this.getFormGroup(
        'parentInformation'
      ) as FormGroup;
      const formGroupToUse = this.childComponent?.isModalVisible
        ? this.parentForm
        : parentFormGroup;

      formGroupToUse.get('city')?.reset();
      formGroupToUse.get('state')?.reset();
      formGroupToUse.get('country')?.reset();

      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.places && response.places.length > 0) {
          const place = response.places[0];

          formGroupToUse.patchValue({
            city: place['place name'],
            state: place['state'],
            country: response['country'],
          });
        }
      } else {
        formGroupToUse.patchValue({
          pinCode: null,
        });
        Swal.fire({
          icon: 'error',
          title: '<h3>Error!</h3>',
          text: 'Unable to fetch data. Please try again later.',
        });
      }
    };
    xhr.onerror = () => {
      Swal.fire({
        icon: 'error',
        title: '<h3>Error!</h3>',
        text: 'Network error. Please try again later.',
      });
    };
    xhr.send();
  }

  resetForm() {
    this.isUpdate = false;
  }

  onEnterMobileNumber(event: any) {
    const mobileNumber = event.target.value;
    let correctedMobileNum = mobileNumber.trim();
    if (correctedMobileNum.length > 12) {
      this.IncorrectMobileNumberFormat = true;
    } else {
      this.IncorrectMobileNumberFormat = false;
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectCountry(country: any) {
    this.selectedCountry = country;

    this.dropdownOpen = true;
  }
}
