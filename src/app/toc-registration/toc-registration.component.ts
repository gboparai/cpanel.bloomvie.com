import { ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';

import { NgSelectModule } from '@ng-select/ng-select';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
import { TocRegistrationService } from './toc-registration.service';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { ProfileComponent } from '../common-component/profile/profile.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonService } from '../common-component/common.service';
import { TimeFormatAmPmPipe } from '../bloomvie-management/dc-appointments-list/time-format.pipe';
import { TooltipComponent } from "../common-component/tooltip/tooltip.component";
declare var $: any;

export function commaSeparatedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const regex =
      /^([A-Z0-9]{3}(?:\s[A-Z0-9]{3})?)(\s*,\s*([A-Z0-9]{3}(?:\s[A-Z0-9]{3})?))*$/;
    const isValid = regex.test(value.trim());
    return isValid ? null : { commaSeparated: true };
  };
}

export function charOnlyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = /^[a-zA-Z\s]*$/.test(control.value);
    return isValid ? null : { charOnly: true };
  };
}

@Component({
  selector: 'app-toc-registration',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    RouterModule,
    NgSelectModule,
    CommonModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    FormsModule,
    NgxPaginationModule,
    BreadcrumbComponent,
    ProfileComponent,
    TimeFormatAmPmPipe,
    TooltipComponent
  ],
  providers: [DatePipe],
  templateUrl: './toc-registration.component.html',
  styleUrl: './toc-registration.component.css',
})
export class TOCRegistrationComponent {
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  @Input() userId: string | undefined;
  @Input() EducationalCredentails: string = '';
  @Input() DocumentResumes: string = '';
  @Input() UploadedDocument: string = '';

  expertise: any[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;
  availableDays: { date: string; dayName: string }[] = [];
  // selectedDay: string | null = null;
  // timeRows: { startTime: string; endTime: string }[] = [];

  selectedDay: string = '';
  timeRows: any[] = [];
  showBoxIndex: number | null = null; //

  // timeRows = [
  //   { startTime: '', endTime: '' }
  // ];

  filteredContent: any[] = [];
  contentBySection: { [key: string]: any[] } = {};
  readonly ImageRootURL = environment.apiUrl.slice(0, -3);
  contentByFooter: { [key: string]: any[] } = {};
  IncorrectMobileNumberFormat: boolean = false;
  dropdownOpen = false;
  hoveredRow: any = null;




  documentTypeList2 = [
    { id: 1, documentType: 'Canadian Passport' },
    { id: 2, documentType: "Driver's License" },
    { id: 3, documentType: 'Provincial or Territorial Photo ID Card' },
    { id: 4, documentType: 'Permanent Resident (PR) Card' },
    { id: 5, documentType: 'Canadian Citizenship Certificate with Photo' },
    { id: 6, documentType: 'Indigenous Status Card' },
  ];

  QualificationList: any;
  TOCRegistration: any;
  formData = new FormData();
  selectedFile: File | null = null;
  selectedFileDocument: File | null = null;
  selectedFileEducationalDocument: File | null = null;
  daysOfWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  daysOfWeekMapping: any = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };
  startDatePickerInstance: any;
  endDatePickerInstance: any;
  documentTypeList: any;
  CheckedUserData: any;
  isDisabled = false;
  SelectedDayForSlot!: string;
  timeRowsByDay: { [day: string]: { startTime: string; endTime: string }[] } =
    {};
  timeRowsByDayForBo: {
    [day: string]: { startTime: string; endTime: string }[];
  } = {};
  UserID: any;
  UserIDParam: any;
  UserDetail: any;
  SelectedDay: string | undefined;
  // timeRowsByDayForBoNew: any[] = []; // Holds processed slots for submission
  timeRowsByDayForBoNew: any[] | undefined; // Holds processed slots for submission

  selectedAvailableDay: string = '';
  TOCModalRegistration: any;
  ValidatorForAvailability: boolean = false;
  isSelectDay: boolean = true;
  isAddedSlot: boolean = true;
  daysCount: number | undefined;
  isSelectOption: boolean = true;
  SelectedWeekDays: any[] = [];
  availableWeeks: {
    week: string;
    days: { date: string; dayName: string }[];
  }[] = [];
  currentWeekIndex: number = 0;

  timeRowsByDayForList: any[] = [];
  groupedTimeSlots: {
    [key: string]: {
      dateRange: any;
      map(arg0: (record: { dayName: any }) => any): any;
      startTime: string;
      endTime: string;
      option: string;
      dayName: string;
      week: string;
    }[];
  } = {};
  editGroupIndex: number | null = null; // Index of the group being edited
  editRowIndex: number | null = null; // Index of the row being edited
  isEditMode: boolean = false; // Flag for edit mode
  filteredGroupedTimeSlots = {};

  SelectedWeek: string | undefined;
  dayIndex: number = 0;
  selectedWeekName: string = '';
  filteredGroupedTimeSlots2:
    | {
      startTime: string;
      endTime: string;
      option: string;
      dayName: string;
      week: string;
    }[]
    | undefined;
  isCurrentMonthOptionVisible: boolean = false;
  isFilteredNotNull: boolean = false;
  labelTextForSlider: string = '';
  dateRange: string = '';
  isCurrentWeekOptionVisible: boolean = false;
  CheckEndDate: Date | null = null;
  TOCUserDetail: any;
  selectedWorkingDays1: any;
  selectedDayRadio: any;
  IsPatchedValues: boolean = false;
  newRecords: any[] = [];
  IsApplyForAllDaysChecked: boolean = false;
  NearbyDayCareList: any;
  userLocationFromZipcode = { lat: 0, lon: 0 };
  radiusValue: any;
  isEnablelocation: boolean = false;
  userLocation = { lat: 0, lon: 0 };
  selectedDayCareIds: number[] = [];
  ContentP: number = 1;
  Contentsize: number = 10;
  filteredDayNameAfterAdded: string | undefined;
  filteredWeekAfterAdded: string | undefined;
  searchTerm: string = '';
  DayCaresForFilters: any;
  userRoleID: any;
  countries: any[] = [];
  selectedCountry: any;

  constructor(
    private spinner: NgxSpinnerService,
    private el: ElementRef,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private tocservice: TocRegistrationService,
    private router: Router,
    private cookie: CookieService,
    private commonService: CommonService
  ) {
    // this.addRow();
    this.TOCRegistration = this.fb.group({
      id: 0,
      qualificationID: ['', [Validators.required]],
      experience: [null, [Validators.required]],
      message: [''],
      isActive: true,
      jobPostID: [0],
      loginUserID: [0],
      firstName: ['', [Validators.required]],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile: [
        '',
        [Validators.required, Validators.pattern(/^\d{3} \d{3} \d{4}$/)],
      ],
      // partTimeStartDate: [null, [Validators.required]],
      // partTimeEndDate: [null,[Validators.required]],
      partTimeStartDate: [null],
      partTimeEndDate: [null],
      partTimeWorkingDays: ['', [Validators.required]],
      // areaOfExpertise: [''],
      // expertise:['',[Validators.required]],
      expertise: ['', [Validators.required]],
      uploadResume: [''],
      documentImagePath: [null],
      documentImage: [null, Validators.required],
      jobTypeID: [null],
      statusID: [3],
      documentTypeID: [null, [Validators.required]],
      documentResumePath: [null],
      documentResume: [null, Validators.required],
      documentEducationalCredentailsPath: [null],
      documentEducationalCredentails: [null],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pinCode: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(\d{5}(-\d{4})?|[A-Z]\d[A-Z] \d[A-Z]\d)$/),
        ],
      ],
      // preferredArea:["", Validators.required]
      // preferredArea: ['', [Validators.required, commaSeparatedValidator()]],

      preferredArea: [''],
      radius: ['', Validators.required],
      isApplyforAllDays: false,
    });

    this.TOCModalRegistration = this.fb.group({
      partTimeStartDate: [null, [Validators.required]],
      partTimeEndDate: [null, [Validators.required]],
      option: [''],
    });
  }

  ngOnInit(): void {
    // Subscribe to route query parameters
    // this.route.queryParams.subscribe(params => {
    //   this.UserIDParam = params['id'];
    //   if (this.UserIDParam) {
    //     const secretKey = 'encrypt!135790';
    //     try {

    //       const bytes = CryptoJS.AES.decrypt(decodeURIComponent(this.UserIDParam), secretKey);
    //       this.UserID = bytes.toString(CryptoJS.enc.Utf8);
    //       if (!this.UserID) {
    //         console.error('Decryption failed: UserID is empty');
    //         return;
    //       }

    //     this.GetUserById(this.UserID);
    //     } catch (error) {
    //       // console.error('Error during decryption:', error.message);
    //     }
    //   } else {
    //     console.warn('No "id" found in query parameters.');
    //   }
    // });


    this.countries = this.commonService.getCountriesFlag();
    this.selectedCountry = this.commonService.getDefaultCountryFlag(1);

    this.UserID = parseInt(this.cookie.get('UserId'), 10);
    this.userRoleID = parseInt(this.cookie.get('UserRoleId'));
    // const UserInfo = this.cookie.get('UserInfo');

    this.GetUserById(this.UserID);
    this.getQualifications();
    // this.initDatePickers();
    this.getDocumentTypeList();

    // if(this.UserIDParam== undefined){
    //   this.getTOCUserDetailByID(this.userId);
    // }

    //For stop reload
    // window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    //Added on 28/01/25
    this.tocservice.refresh$.subscribe(() => {
      this.GetUserById(this.UserID);
      this.getQualifications();
      this.initDatePickers();
      this.getDocumentTypeList();
    });

    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 100);
    this.getAllAreaOfExpertise();
  }


  ngAfterViewInit(): void {
    this.initDatePickers();
  }


  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.isFilteredNotNull) {
      event.preventDefault();
      event.returnValue = '';
      window.removeEventListener(
        'beforeunload',
        this.handleBeforeUnload.bind(this)
      );
      window.location.reload();
    }
  }

  CheckingAddedSlotsRecords() {
    this.isFilteredNotNull =
      this.filteredGroupedTimeSlots2 !== undefined &&
      this.filteredGroupedTimeSlots2 !== null;
    if (this.isFilteredNotNull) {
      Swal.fire({
        title: 'Do you want to save the changes?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Save',
        denyButtonText: `Don't save`,
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Saved!', '', 'success');
        } else if (result.isDenied) {
          Swal.fire('Changes are not saved', '', 'info');
        }
      });
    }
  }

  getFrontentContentByType(Type: any) {
    // this.homeService.getFrontentContentByType(Type).subscribe(data => {
    //   if (data.message === "OK") {
    //     if (Type === "TOC Registration") {
    //       this.contentBySection = this.groupBySection(data.result);
    //       this.processContentBySection(this.contentBySection);
    //     }
    //     if (Type === "Footer") {
    //       this.contentByFooter = this.groupBySection(data.result);
    //       this.processContentBySection(this.contentByFooter);
    //     }
    //   }
    // });
  }

  processContentBySection(sectionData: any) {
    Object.keys(sectionData).forEach((sectionKey) => {
      if (sectionData[sectionKey] && sectionData[sectionKey].length > 0) {
        sectionData[sectionKey] = sectionData[sectionKey].map(
          (content: any) => {
            content.images = this.getAllImages(content.image);
            return content;
          }
        );
      } else {
        
      }
    });
  }

  getAllImages(imageString: string): string[] {
    if (!imageString) return [];
    return imageString.split(',');
  }

  groupBySection(records: any[]): { [key: string]: any[] } {
    return records.reduce((acc, record) => {
      const section = record.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(record);
      return acc;
    }, {});
  }

  initDatePickers(): void {
    const self = this;
    const currentDate = new Date();

    if (
      this.TOCModalRegistration &&
      this.TOCModalRegistration.get('partTimeStartDate') &&
      this.TOCModalRegistration.get('partTimeEndDate')
    ) {
      this.startDatePickerInstance = flatpickr('#startDate', {
        mode: 'single',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'F j, Y',
        allowInput: true,
        minDate: currentDate,
        onChange(selectedDates: any) {
          if (selectedDates.length === 1) {
            const selectedDate = selectedDates[0];
            const formattedStartDate = self.datePipe.transform(
              selectedDate,
              'yyyy-MM-dd'
            );
            if (formattedStartDate) {
              self.TOCModalRegistration.patchValue({
                partTimeStartDate: formattedStartDate,
              });
            }

            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            // self.endDatePickerInstance.set('minDate', nextDay);
            if (self.endDatePickerInstance && typeof self.endDatePickerInstance.set === 'function') {
              self.endDatePickerInstance.set('minDate', nextDay);
            }

          }
        },
        locale: {
          firstDayOfWeek: 1,
        },
      });

      // End Date Picker
      this.endDatePickerInstance = flatpickr('#endDate', {
        mode: 'single',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'F j, Y',
        allowInput: true,
        minDate: currentDate,
        onChange(selectedDates: any) {
          if (selectedDates.length === 1) {
            const selectedDate = selectedDates[0];
            const formattedEndDate = self.datePipe.transform(
              selectedDate,
              'yyyy-MM-dd'
            );
            if (formattedEndDate) {
              self.TOCModalRegistration.patchValue({
                partTimeEndDate: formattedEndDate,
              });
            }
          }
        },
        locale: {
          firstDayOfWeek: 1,
        },
      });
    } else {
      // console.error("FormGroup or controls are not properly initialized.");
    }
  }

  onExperienceInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
    this.TOCRegistration.get('experience')?.setValue(inputElement.value);
  }

  // getQualifications() {
  //   this.tocservice.getQualifications().subscribe((data) => {
  //     if (data.message === 'OK') {
  //       this.QualificationList = data.result;
  //     }
  //   });
  // }

  // mohit

  getQualifications(): void {
    const type = 'Day Care Admin';

    this.commonService
      .getMasterAllQualifications(this.UserID, this.userRoleID, type)
      .subscribe({
        next: (data) => {
          if (data.message === 'OK') {
            this.QualificationList = data.result;
          } else {
            console.error('Error:', data.message);
          }
        },
        error: (err) => {
          console.error('HTTP Error:', err);
        },
      });
  }

  getDocumentTypeList() {
    this.tocservice.getDocumentTypeList().subscribe({
      next: (response) => {
        if (response.message === 'OK') {
          this.documentTypeList = response.result.filter(
            (docType: any) =>
              docType.documentType !== 'Resume' &&
              docType.documentType !== 'ProfileImage' &&
              docType.documentType !== 'Logo' &&
              docType.documentType !== 'Educational Credentails'
          );
        }
        setTimeout(() => {
          // this.spinner.hide();
        }, 300);
      },
      error: (err) => {
        // this.spinner.hide();
        this.toastr.error(err.message);
      },
    });
  }

  async UploadFiles(): Promise<any> {
    if (!this.selectedFile) {
      // console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('files', this.selectedFile, this.selectedFile.name);
    formData.append('type', 'Resume');

    try {
      const response = await this.tocservice.uploadImages(formData).toPromise();
      return response;
    } catch (error) {
      // console.error('Error uploading file', error);
      throw error;
    }
  }

  onFileChange(event: any): void {
    let isFileValid = false;
    const file = event.target.files[0];
    if (file) {
      const validFileExtension = ['txt', 'png', 'jpeg', 'jpg', 'pdf'];
      let currentfileExtension = file.name;
      currentfileExtension = currentfileExtension.split('.')[1].toLowerCase();
      for (let i = 0; i < validFileExtension.length; i++) {
        if (currentfileExtension == validFileExtension[i]) {
          isFileValid = true;
        }
      }

      if (isFileValid === true) {
        this.selectedFile = file;
        this.TOCRegistration.controls.documentResume.clearValidators();
        this.TOCRegistration.controls.documentResume.setErrors(null);
        this.TOCRegistration.controls.documentResume.updateValueAndValidity();
      } else {
        $('#formFile').val('');
        Swal.fire({
          icon: 'error',
          title: 'Not Valid File',
          text: 'Only (txt, png, jpeg, jpg, pdf) files are valid',
        });
      }
    }

    // if (file) {
    //   this.selectedFile = file;
    //   this.TOCRegistration.controls.documentResume.clearValidators();
    //   this.TOCRegistration.controls.documentResume.setErrors(null);
    //   this.TOCRegistration.controls.documentResume.updateValueAndValidity();
    // }
  }

  onFileChangeDocument(event: any): void {
    let isFileValid = false;
    const file = event.target.files[0];
    if (file) {
      const validFileExtension = ['txt', 'png', 'jpeg', 'jpg', 'pdf'];
      let currentfileExtension = file.name;
      currentfileExtension = currentfileExtension.split('.')[1].toLowerCase();
      for (let i = 0; i < validFileExtension.length; i++) {
        if (currentfileExtension == validFileExtension[i]) {
          isFileValid = true;
        }
      }

      if (isFileValid === true) {
        this.selectedFileDocument = file;
        this.TOCRegistration.controls.documentImage.clearValidators();
        this.TOCRegistration.controls.documentImage.setErrors(null);
        this.TOCRegistration.controls.documentImage.updateValueAndValidity();
      } else {
        $('#formFileDocument').val('');
        Swal.fire({
          icon: 'error',
          title: 'Not Valid File',
          text: 'Only (txt, png, jpeg, jpg, pdf) files are valid',
        });
      }
    }

    // const file = event.target.files[0];
    // if (file) {
    //   this.selectedFileDocument = file;
    //   this.TOCRegistration.controls.documentImage.clearValidators();
    //   this.TOCRegistration.controls.documentImage.setErrors(null);
    //   this.TOCRegistration.controls.documentImage.updateValueAndValidity();
    // }
  }

  onFileChangeEducationalDocument(event: any): void {
    let isFileValid = false;
    const file = event.target.files[0];
    if (file) {
      const validFileExtension = ['txt', 'png', 'jpeg', 'jpg', 'pdf'];
      let currentfileExtension = file.name;
      currentfileExtension = currentfileExtension.split('.')[1].toLowerCase();
      for (let i = 0; i < validFileExtension.length; i++) {
        if (currentfileExtension == validFileExtension[i]) {
          isFileValid = true;
        }
      }

      if (isFileValid === true) {
        this.selectedFileEducationalDocument = file;
        this.TOCRegistration.controls.documentEducationalCredentails.clearValidators();
        this.TOCRegistration.controls.documentEducationalCredentails.setErrors(
          null
        );
        this.TOCRegistration.controls.documentEducationalCredentails.updateValueAndValidity();
      } else {
        $('#formFileEducationDocument').val('');
        Swal.fire({
          icon: 'error',
          title: 'Not Valid File',
          text: 'Only (txt, png, jpeg, jpg, pdf) files are valid',
        });
      }
    }

    // const file = event.target.files[0];
    // if (file) {
    //   this.selectedFileEducationalDocument = file;
    //   this.TOCRegistration.controls.documentEducationalCredentails.clearValidators();
    //   this.TOCRegistration.controls.documentEducationalCredentails.setErrors(null);
    //   this.TOCRegistration.controls.documentEducationalCredentails.updateValueAndValidity();
    // }
  }

  resetForm() {
    this.TOCRegistration.reset({
      id: 0,
      qualificationID: '',
      experience: null,
      message: '',
      isActive: true,
      jobPostID: 0,
      loginUserID: 0,
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      // partTimeStartDate: null,
      // partTimeEndDate: null,
      partTimeWorkingDays: '',
      expertise: '',
      uploadResume: '',
      documentImagePath: null,
      documentImage: null,
      jobTypeID: null,
      statusID: 3,
    });

    this.selectedFile = null;
    this.selectedFileDocument = null;
    this.selectedFileEducationalDocument = null;
    this.selectedDayCareIds = [];
    this.NearbyDayCareList = [];

    const fileInput = document.getElementById('formFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    const fileInputDocument = document.getElementById(
      'formFileDocument'
    ) as HTMLInputElement;
    if (fileInputDocument) {
      fileInputDocument.value = '';
    }

    const fileInputEducationDocument = document.getElementById(
      'formFileEducationDocument'
    ) as HTMLInputElement;
    if (fileInputEducationDocument) {
      fileInputEducationDocument.value = '';
    }

    this.daysOfWeek.forEach((day) => {
      const checkbox = document.getElementById(day) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = false;
      }
    });

    this.cdr.detectChanges();
    this.resetDatePickers();

    this.timeRowsByDay = {};
    this.timeRowsByDayForBo = {};
    this.ValidatorForAvailability = false;

    //forSlotmodal
    this.timeRows = [];
    this.showBoxIndex = null;
    this.selectedDay = '';
    this.availableDays = [];
    this.isAddedSlot = true;
    this.isSelectDay = true;
    this.isSelectOption = true;
    this.TOCModalRegistration.reset();
    this.addRow();
  }

  resetDatePickers(): void {
    // if (this.startDatePickerInstance) {
    //   this.startDatePickerInstance.clear();
    // }

    // if (this.endDatePickerInstance) {
    //   this.endDatePickerInstance.clear();
    // }

    if (this.startDatePickerInstance && typeof this.startDatePickerInstance.clear === 'function') {
      this.startDatePickerInstance.clear();
    }

    if (this.endDatePickerInstance && typeof this.endDatePickerInstance.clear === 'function') {
      this.endDatePickerInstance.clear();
    }

    this.TOCModalRegistration.patchValue({
      partTimeStartDate: null,
      partTimeEndDate: null,
    });
  }



  // mohit
  fetchLocationData(postalCode: string) {

    if (!postalCode) return;

    postalCode = postalCode.trim().toUpperCase();

    const caPattern = /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/; // Canadian postal code pattern
    const usPattern = /^\d{5}$/; // US ZIP code pattern

    let countryCode = '';
    let apiPostalCode = '';


    if (caPattern.test(postalCode)) {
      countryCode = 'ca';
      apiPostalCode = postalCode.split(' ')[0];
    } else if (usPattern.test(postalCode)) {
      countryCode = 'us';
      apiPostalCode = postalCode;
    } else {
      Swal.fire({
        icon: 'error',
        title: '<h3>Error!</h3>',
        text: 'Invalid postal/ZIP code format.',
      });

      this.TOCRegistration.patchValue({
        pinCode: [null],
      })

      return;

    }

    const url = `https://api.zippopotam.us/${countryCode}/${apiPostalCode}`;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url);

    xhr.onload = () => {
      const targetForm = this.TOCRegistration;

      targetForm.get('city')?.reset();
      targetForm.get('state')?.reset();
      targetForm.get('country')?.reset();

      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        const place = response?.places?.[0];

        if (place) {
          targetForm.patchValue({
            city: place['place name'],
            state: place['state'],
            country: response['country'],
            pinCode: postalCode,
          });

          (this.userLocationFromZipcode.lat = place['latitude']),
            (this.userLocationFromZipcode.lon = place['longitude']);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: '<h3>Error!</h3>',
          text: 'Unable to fetch location data. Please try again later.',
        });
        this.TOCRegistration.patchValue({
          pinCode: [null],
        })
      }
    };

    xhr.onerror = () => {
      Swal.fire({
        icon: 'error',
        title: '<h3>Network Error!</h3>',
        text: 'Could not connect to the location API.',
      });
      this.TOCRegistration.patchValue({
        pinCode: [null],
      })
    };

    xhr.send();
  }



  // fetchLocationData(postalCode: string) {
  //   const postalCodePattern = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
  //   if (!postalCodePattern.test(postalCode)) {
  //     return;
  //   }

  //   const normalizedPostalCode = postalCode.split(' ')[0];
  //   if (normalizedPostalCode.length === 3) {
  //     let url = `https://api.zippopotam.us/ca/${normalizedPostalCode}`;
  //     const xhr = new XMLHttpRequest();
  //     xhr.open('GET', url);
  //     xhr.onload = () => {
  //       if (xhr.status === 200) {
  //         const response = JSON.parse(xhr.responseText);
  //         if (response.places && response.places.length > 0) {
  //           const place = response.places[0];
  //           this.TOCRegistration.patchValue({
  //             city: place['place name'],
  //             state: place['state'],
  //             country: response['country'],
  //             pinCode: postalCode,
  //           });

  //           (this.userLocationFromZipcode.lat = place['latitude']),
  //             (this.userLocationFromZipcode.lon = place['longitude']);
  //         }
  //       } else {
  //         Swal.fire({
  //           icon: 'error',
  //           title: '<h3>Error!</h3>',
  //           text: 'Unable to fetch data. Please try again later.',
  //         });
  //       }
  //     };
  //     xhr.send();
  //   }
  // }

  checkStartDate() {
    var StartDateFromForm = this.TOCRegistration.value.partTimeStartDate;
    var EndDateFromForm = this.TOCRegistration.value.partTimeEndDate;
    var StartDate = this.CheckedUserData.partTimeStartDate.split('T')[0];

    if (
      this.CheckedUserData.partTimeEndDate != null &&
      this.CheckedUserData.partTimeEndDate != ''
    ) {
      var EndDate = this.CheckedUserData.partTimeEndDate.split('T')[0];
      if (
        (StartDateFromForm >= StartDate && StartDateFromForm <= EndDate) ||
        StartDateFromForm <= EndDate
      ) {
        Swal.fire({
          icon: 'error',
          title: 'InValid Date',
          text:
            'Select Date Greater than ' +
            this.datePipe.transform(EndDate, 'dd/MM/yyyy'),
        });
        this.resetDatePickers();
      }
    }
    // If End is Null
    else {
      if (
        StartDateFromForm <= StartDate &&
        StartDateFromForm <= StartDateFromForm
      ) {
        Swal.fire({
          icon: 'error',
          title: 'InValid Date',
          text:
            'Select Date Greater than ' +
            this.datePipe.transform(StartDate, 'dd/MM/yyyy'),
        });
        this.resetDatePickers();
      }
    }
  }

  onPlusClick(day: string, event: MouseEvent): void {
    event.stopPropagation();
    this.SelectedDayForSlot = day;

    if (!this.timeRowsByDay[day]) {
      this.timeRowsByDay[day] = [{ startTime: '', endTime: '' }];
    }

    this.timeRows = [...this.timeRowsByDay[day]];
    $('#TimeSlotModal2').modal('show');
  }

  showmodal() {
    // $('#TimeSlotModal').modal('show');
    if (this.TOCUserDetail == null) {
      if (this.TOCModalRegistration.value.partTimeStartDate == null) {
        if (this.TOCRegistration.value.partTimeWorkingDays == '') {
          Swal.fire({
            icon: 'warning',
            title: 'Attention',
            text: 'Select atleast one Working day',
          });
        }

        // if (this.startDatePickerInstance) {
        //   this.startDatePickerInstance.clear();
        // }

        // if (this.endDatePickerInstance) {
        //   this.endDatePickerInstance.clear();
        // }

        if (this.startDatePickerInstance && typeof this.startDatePickerInstance.clear === 'function') {
          this.startDatePickerInstance.clear();
        }

        if (this.endDatePickerInstance && typeof this.endDatePickerInstance.clear === 'function') {
          this.endDatePickerInstance.clear();
        }


        this.TOCModalRegistration.patchValue({
          partTimeStartDate: null,
          partTimeEndDate: null,
          option: '',
        });

        this.timeRows = [];
        this.showBoxIndex = null;
        this.selectedDay = '';
        this.availableDays = [];
        this.isAddedSlot = true;
        this.isSelectDay = true;
        this.isSelectOption = true;
        this.filteredDayNameAfterAdded = '';
        this.filteredWeekAfterAdded = '';
        this.addRow();

        if (this.TOCRegistration.value.partTimeWorkingDays == '') {
          $('#TimeSlotModal').modal('hide');
        } else {
          $('#TimeSlotModal').modal('show');
        }
      } else {
        $('#TimeSlotModal').modal('show');
      }
    } else {
      $('#TimeSlotModal').modal('show');
    }
  }

  isChecked(day: string): boolean {
    const selectedDays = this.TOCRegistration.get(
      'partTimeWorkingDays'
    ).value.split(',');
    return selectedDays.includes(this.daysOfWeekMapping[day].toString());
  }

  getAllAreaOfExpertise() {
    this.tocservice.getAllAreaOfExpertise().subscribe((result: any) => {
      if (result.message == 'Success') {
        this.expertise = result.result.filter(
          (item: any) => item.isActive == true
        );
      }
    });
  }

  GetUserById(userid: any) {
    this.tocservice.GetUserById(userid).subscribe((data) => {
      if (data.message == 'Success') {
        this.UserDetail = data.result;
        let expertise = this.UserDetail.expertise.split(',').map(Number);

        this.TOCRegistration.patchValue({
          firstName: this.UserDetail.firstName,
          lastName: this.UserDetail.lastName,
          email: this.UserDetail.email,
          expertise: expertise,
        });

        this.disableInputById('emailField');
        this.disableInputById('country');
        this.disableInputById('state');
        this.disableInputById('city');

        //Added on 28/01/25
        this.getTOCUserDetailByIDwithoutSlotData(this.userId);
      } else {
        this.UserDetail = [];
      }
    });
  }

  getTOCUserDetailByIDwithoutSlotData(userid: any) {
    this.tocservice.getTOCUserDetailByID(userid, 0).subscribe(
      (data) => {
        if (data.message === 'ok') {
          this.TOCUserDetail = data.result;
          this.IsPatchedValues = true;
          this.TOCRegistration.patchValue({
            id: this.TOCUserDetail.userMasterId,
            loginUserID: this.UserID,
            firstName: this.TOCUserDetail.firstName,
            lastName:
              this.TOCUserDetail.lastName != null
                ? this.TOCUserDetail.lastName
                : '',
            email: this.TOCUserDetail.email,
            mobile: this.TOCUserDetail.phone,
            pinCode: this.TOCUserDetail.pincode,
            preferredArea: this.TOCUserDetail.preferredArea,
            country: this.TOCUserDetail.country,
            state: this.TOCUserDetail.state,
            city: this.TOCUserDetail.city,
            message: this.TOCUserDetail.message,
            experience: this.TOCUserDetail.experience,
            documentImage: this.TOCUserDetail.uploadedDocument[0],
            documentResume: this.TOCUserDetail.documentResumes[0],
            radius: this.TOCUserDetail.radius
              ? this.TOCUserDetail.radius.toString()
              : '',
          });


          if (this.TOCUserDetail.country == 'Canada') {
            this.selectedCountry = this.commonService.getDefaultCountryFlag(1);
          } else {
            this.selectedCountry = this.commonService.getDefaultCountryFlag(0);
          }

          // var doc = this.TOCUserDetail.uploadedDocument[0] ? this.TOCUserDetail.uploadedDocument[0].split('/').pop() : '';
          // $('#formFileDocument').val(doc);
          this.disableInputById('emailField');
          this.disableInputById('radiusField');
          this.disableInputById('radiusCurrentlocation');

          if (this.QualificationList && this.TOCUserDetail.qualification) {
            //Commented on 08/03/25
            // const qualificationIds = this.TOCUserDetail.qualification
            //   .split(',')
            //   .map((id: string) => parseInt(id, 10));
            // this.TOCUserDetail.qualificationNames =
            //   this.QualificationList.filter((item: any) =>
            //     qualificationIds.includes(item.id)
            //   )
            //     .map((item: any) => item.name)
            //     .join(', ');

            //Added on 08/03/25
            let qualificationIds: number[] = [];
            if (typeof this.TOCUserDetail.qualification === 'string') {
              qualificationIds = this.TOCUserDetail.qualification
                .split(',')
                .map((id: string) => parseInt(id, 10));
            } else if (typeof this.TOCUserDetail.qualification === 'number') {
              qualificationIds = [this.TOCUserDetail.qualification];
            }
            this.TOCUserDetail.qualificationNames =
              this.QualificationList.filter((item: any) =>
                qualificationIds.includes(item.id)
              )
                .map((item: any) => item.name)
                .join(', ');
          } else {
            this.TOCUserDetail.qualificationNames = 'No qualifications listed';
          }

          //Commented on 28/01/25
          // const selectedQualification = this.QualificationList.find((q: { name: any; }) => q.name === this.TOCUserDetail.qualificationNames);
          // if (selectedQualification) {
          //   this.TOCRegistration.patchValue({
          //     qualificationID: [selectedQualification.id]
          //   });
          // }

          //Added on 28/01/25
          const qualificationNamesArray = this.TOCUserDetail.qualificationNames
            .split(',')
            .map((name: string) => name.trim()); // Split and trim the names
          const selectedQualifications = this.QualificationList.filter(
            (q: { name: string }) => qualificationNamesArray.includes(q.name)
          );

          if (selectedQualifications.length > 0) {
            const qualificationIDs = selectedQualifications.map(
              (q: { id: any }) => q.id
            ); // Extract IDs of matching qualifications
            this.TOCRegistration.patchValue({
              qualificationID: qualificationIDs,
            });
          } else {
            // console.error('No matching qualifications found');
          }

          const documentTypeID = this.TOCUserDetail.uploadedDocumentType[0];
          const documentType = this.documentTypeList.find(
            (doc: { id: number }) => doc.id === documentTypeID
          );

          if (documentType) {
            this.TOCRegistration.get('documentTypeID').patchValue(
              documentType.id
            );
          } else {
            // console.error('Document type not found');
          }

          if (this.TOCUserDetail.workingDays) {
            const daysOfWeekMapping: { [key: string]: string } = {
              '1': 'Monday',
              '2': 'Tuesday',
              '3': 'Wednesday',
              '4': 'Thursday',
              '5': 'Friday',
              '6': 'Saturday',
              '7': 'Sunday',
            };

            this.selectedWorkingDays1 = this.TOCUserDetail.workingDays
              .split(',')
              .map((day: string | number) => daysOfWeekMapping[day]);
            for (let i = 0; i < this.selectedWorkingDays1.length; i++) {
              this.SelectedWeekDays.push(this.selectedWorkingDays1[i]);
            }
          } else {
            this.TOCUserDetail.workingDaysNames = 'No working days listed';
          }

        } else {
          this.TOCUserDetail = [];
        }
      },
      (error) => {
        // console.error('Error occurred while checking email:', error);
      }
    );
  }

  //Also Slots Data
  getTOCUserDetailByID(userid: any) {
    this.tocservice.getTOCUserDetailByID(userid, 0).subscribe(
      (data) => {
        if (data.message === 'ok') {
          this.TOCUserDetail = data.result;
          this.TOCRegistration.patchValue({
            firstName: this.TOCUserDetail.firstName,
            email: this.TOCUserDetail.email,
            mobile: this.TOCUserDetail.phone,
            pinCode: this.TOCUserDetail.pincode,
            preferredArea: this.TOCUserDetail.preferredArea,
            country: this.TOCUserDetail.country,
            state: this.TOCUserDetail.state,
            city: this.TOCUserDetail.city,
            message: this.TOCUserDetail.message,
            experience: this.TOCUserDetail.experience,
          });


          if (this.TOCUserDetail.country == 'Canada') {
            this.selectedCountry = this.commonService.getDefaultCountryFlag(1);
          } else {
            this.selectedCountry = this.commonService.getDefaultCountryFlag(0);
          }
          this.disableInputById('emailField');
          if (this.QualificationList && this.TOCUserDetail.qualification) {
            const qualificationIds = this.TOCUserDetail.qualification
              .split(',')
              .map((id: string) => parseInt(id, 10));
            this.TOCUserDetail.qualificationNames =
              this.QualificationList.filter((item: any) =>
                qualificationIds.includes(item.id)
              )
                .map((item: any) => item.name)
                .join(', ');
          } else {
            this.TOCUserDetail.qualificationNames = 'No qualifications listed';
          }

          const selectedQualification = this.QualificationList.find(
            (q: { name: any }) =>
              q.name === this.TOCUserDetail.qualificationNames
          );
          if (selectedQualification) {
            this.TOCRegistration.patchValue({
              qualificationID: [selectedQualification.id],
            });
          }
          if (this.TOCUserDetail.workingDays) {
            const daysOfWeekMapping: { [key: string]: string } = {
              '1': 'Monday',
              '2': 'Tuesday',
              '3': 'Wednesday',
              '4': 'Thursday',
              '5': 'Friday',
              '6': 'Saturday',
              '7': 'Sunday',
            };

            this.selectedWorkingDays1 = this.TOCUserDetail.workingDays
              .split(',')
              .map((day: string | number) => daysOfWeekMapping[day]);
            for (let i = 0; i < this.selectedWorkingDays1.length; i++) {
              this.SelectedWeekDays.push(this.selectedWorkingDays1[i]);
            }
          } else {
            this.TOCUserDetail.workingDaysNames = 'No working days listed';
          }
          const documentTypeID = this.TOCUserDetail.uploadedDocumentType[0];
          const documentType = this.documentTypeList.find(
            (doc: { id: number }) => doc.id === documentTypeID
          );

          if (documentType) {
            this.TOCRegistration.get('documentTypeID').patchValue(
              documentType.id
            );
          } else {
            // console.error('Document type not found');
          }

          const self = this;
          const currentDate = new Date();
          this.startDatePickerInstance = flatpickr('#startDate', {
            mode: 'single',
            dateFormat: 'Y-m-d',
            altInput: true,
            altFormat: 'F j, Y',
            allowInput: true,
            minDate: this.TOCUserDetail.partTimeStartDate,
            onChange(selectedDates: any) {
              if (selectedDates.length === 1) {
                const selectedDate = selectedDates[0];
                self.TOCModalRegistration.patchValue({
                  partTimeStartDate: self.datePipe.transform(
                    selectedDate,
                    'yyyy-MM-dd'
                  ),
                });
              }
            },
            locale: {
              firstDayOfWeek: 1,
            },
          });

          this.endDatePickerInstance = flatpickr('#endDate', {
            mode: 'single',
            dateFormat: 'Y-m-d',
            altInput: true,
            altFormat: 'F j, Y',
            allowInput: true,
            minDate: currentDate,
            onChange(selectedDates: any) {
              if (selectedDates.length === 1) {
                const selectedDate = selectedDates[0];
                self.TOCModalRegistration.patchValue({
                  partTimeEndDate: self.datePipe.transform(
                    selectedDate,
                    'yyyy-MM-dd'
                  ),
                });
              }
            },
            locale: {
              firstDayOfWeek: 1,
            },
          });

          if (
            this.startDatePickerInstance &&
            this.TOCUserDetail.partTimeStartDate
          ) {
            const formattedStartDate = this.datePipe.transform(
              this.TOCUserDetail.partTimeStartDate,
              'yyyy-MM-dd'
            );
            // this.startDatePickerInstance.setDate(formattedStartDate);
            if (this.startDatePickerInstance && typeof this.startDatePickerInstance.setDate === 'function') {
              this.startDatePickerInstance.setDate(formattedStartDate);
            }

          }

          if (
            this.endDatePickerInstance &&
            this.TOCUserDetail.partTimeEndDate
          ) {
            const formattedEndDate = this.datePipe.transform(
              this.TOCUserDetail.partTimeEndDate,
              'yyyy-MM-dd'
            );
            // this.endDatePickerInstance.setDate(formattedEndDate);
            if (this.endDatePickerInstance && typeof this.endDatePickerInstance.setDate === 'function') {
              this.endDatePickerInstance.setDate(formattedEndDate);
            }

          }
          this.startDate = new Date(this.TOCUserDetail.partTimeStartDate);
          this.endDate = new Date(this.TOCUserDetail.partTimeEndDate);
          this.generateUniqueDays();

          let RadioVal = '';
          if (this.TOCUserDetail.slotOptionType == 'Apply For Whole Calendar') {
            RadioVal = 'Option 1';
          }
          if (this.TOCUserDetail.slotOptionType == 'Apply For Current Month') {
            RadioVal = 'Option 2';
          }
          if (this.TOCUserDetail.slotOptionType == 'Apply For Current Week') {
            RadioVal = 'Option 3';
          }
          if (this.TOCUserDetail.slotOptionType == 'None') {
            RadioVal = 'Option 4';
          }

          this.TOCModalRegistration.patchValue({
            option: RadioVal,
          });
          this.selectedDayRadio = this.selectedWorkingDays1[0].toString();

          for (
            let i = 0;
            i < this.TOCUserDetail.slotsGroupedByWeek.length;
            i++
          ) {
            const data = this.TOCUserDetail.slotsGroupedByWeek[i];
            const WeekName = data.weekName;

            for (let j = 0; j < data.slots.length; j++) {
              const st = data.slots[j].startTime;
              const et = data.slots[j].endTime;
              const wd = data.slots[j].workingDayName;

              if (this.selectedDayRadio == wd) {
                this.timeRows.push({
                  startTime: st,
                  endTime: et,
                });
              }
            }
          }

          const timeRowsByDay = this.timeRows.map((row) => ({
            startTime: row.startTime,
            endTime: row.endTime,
            option: this.TOCUserDetail.slotOptionType,
            dayName: this.selectedAvailableDay,
            week: this.selectedWeekName,
          }));

          this.timeRowsByDayForList.push(...timeRowsByDay);

          this.onDaySelect(this.selectedDayRadio?.toString());
        } else {
          this.TOCUserDetail = [];
        }
      },
      (error) => {
        // console.error('Error occurred while checking email:', error);
      }
    );
  }

  disableInputById(id: string): void {
    const inputElement = this.el.nativeElement.querySelector(`#${id}`);
    if (inputElement) {
      inputElement.disabled = true;
    }
  }
  enableInputById(id: string): void {
    const inputElement = this.el.nativeElement.querySelector(`#${id}`);
    if (inputElement) {
      inputElement.disabled = false;
    }
  }

  isDaySelected(day: string): boolean {
    return this.TOCRegistration.get('partTimeWorkingDays')
      .value.split(',')
      .includes(this.daysOfWeekMapping[day].toString());
  }

  onWorkingDaysChange(day: string, event: any): void {
   
    const workingDaysControl = this.TOCRegistration.get('partTimeWorkingDays');
    let currentWorkingDays = workingDaysControl.value || '';
    const dayId = this.daysOfWeekMapping[day].toString();

    if (event.target.checked) {
      if (!currentWorkingDays.includes(dayId)) {
        currentWorkingDays = currentWorkingDays
          ? `${currentWorkingDays},${dayId}`
          : dayId;
      }

      if (!this.SelectedWeekDays.includes(day)) {
        this.SelectedWeekDays.push(day);
      }
    } else {
      currentWorkingDays = currentWorkingDays
        .split(',')
        .filter((d: any) => d !== dayId)
        .join(',');
      delete this.timeRowsByDayForBo[dayId];
      delete this.timeRowsByDay[dayId];
      this.timeRowsByDay[day] = [{ startTime: '', endTime: '' }];

      this.SelectedWeekDays = this.SelectedWeekDays.filter(
        (selectedDay) => selectedDay !== day
      );
    }

    workingDaysControl.setValue(currentWorkingDays);
    this.SelectedDay = day;
  }

  onDateChange(type: 'start' | 'end', event: any): void {
  
    this.isCurrentMonthOptionVisible = false;
    const value = event.target.value;
    //Added on 25/07/25
    this.availableWeeks = [];
    this.availableDays = [];
    this.filteredGroupedTimeSlots2 = [];
    this.timeRows = [];
    this.showBoxIndex = null;
    this.selectedDay = '';
    this.availableDays = [];
    this.isAddedSlot = true;
    this.isSelectDay = true;
    this.isSelectOption = true;
    this.filteredDayNameAfterAdded = '';
    this.filteredWeekAfterAdded = '';
    this.addRow();

    if (type === 'start') {
      this.startDate = value ? new Date(value) : null;
    } else if (type === 'end') {
      this.endDate = value ? new Date(value) : null;
    }

    if (this.CheckEndDate != this.endDate) {
      this.TOCModalRegistration.patchValue({
        option: '',
      });
    }

    this.CheckEndDate = this.endDate;

    if (this.startDate && this.endDate) {
      this.generateUniqueDays();
      const isEndOfMonthOrNextMonth = this.isEndOfMonthOrFutureMonth(
        this.startDate,
        this.endDate
      );
      const IsDayOfCurentWeek = this.isEndOfWeekOrEarlier(
        this.startDate,
        this.endDate
      );
      this.isCurrentMonthOptionVisible = isEndOfMonthOrNextMonth;
      this.isCurrentWeekOptionVisible = IsDayOfCurentWeek;

      //Added on 8/1/25
      if (this.labelTextForSlider === 'Apply For Current Month') {
        if (this.startDate != null && this.endDate != null) {
          const lastDayOfStartMonth = new Date(
            this.startDate.getFullYear(),
            this.startDate.getMonth() + 1,
            0
          );

          if (this.endDate > lastDayOfStartMonth) {
            const startDateString = this.startDate.toDateString();
            const lastDayOfStartMonthString =
              lastDayOfStartMonth.toDateString();
            this.dateRange = `${startDateString} - ${lastDayOfStartMonthString}`;
          } else {
            const startDateString = this.startDate.toDateString();
            const endDateString = this.endDate.toDateString();
            this.dateRange = `${startDateString} - ${endDateString}`;
          }
        }
      }
    }
  }

  getWeekDifference(startDate: Date, endDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.abs(
      (endDate.getTime() - startDate.getTime()) / oneDay
    );
    return Math.ceil(diffDays / 7); // Return difference in weeks
  }

  isEndOfMonthOrFutureMonth(startDate: Date, endDate: Date): boolean {
    const currentMonthEndDate = new Date(startDate);
    currentMonthEndDate.setMonth(startDate.getMonth() + 1);
    currentMonthEndDate.setDate(0);
    const isEndDateValid = endDate <= currentMonthEndDate;
    return isEndDateValid;
  }

  isEndOfWeekOrEarlier(startDate: Date, endDate: Date): boolean {
    const endOfWeek = new Date(startDate);
    const dayOfWeek = endOfWeek.getDay();
    const daysUntilEndOfWeek = 7 - dayOfWeek;
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilEndOfWeek);
    return endDate <= endOfWeek;
  }

  generateUniqueDays(): void {
   
    if (this.startDate && this.endDate) {
      const uniqueDays: { date: string; dayName: string }[] = [];
      const weeksMap = new Map<
        string,
        {
          week: string;
          days: { date: string; dayName: string }[];
          startDate: string;
          endDate: string;
        }
      >();
      let daysAdded: Set<string> = new Set();

      let currentDate = new Date(this.startDate);
      const endDate = new Date(this.endDate);

      while (currentDate <= endDate) {
        let weekNumber = this.getWeekNumberInMonth(currentDate);
        let month = currentDate.getMonth() + 1; // Get month (1-12)
        let year = currentDate.getFullYear(); // Get year
        const weekKey = `${year}-${month}-Week ${weekNumber}`; // Differentiate weeks by year-month-weekNumber
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
        });

        if (
          this.SelectedWeekDays.includes(dayName) &&
          !daysAdded.has(dateStr)
        ) {
          daysAdded.add(dateStr);
          uniqueDays.push({ date: dateStr, dayName });

          if (!weeksMap.has(weekKey)) {
            weeksMap.set(weekKey, {
              week: '',
              days: [],
              startDate: '',
              endDate: '',
            });
          }

          let weekData = weeksMap.get(weekKey)!;
          weekData.days.push({ date: dateStr, dayName });
          weekData.startDate = weekData.days[0].date;
          weekData.endDate = weekData.days[weekData.days.length - 1].date;
          weekData.week = `Week ${weekNumber} (${weekData.startDate} - ${weekData.endDate})`;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.availableWeeks = Array.from(weeksMap.values());
   
    }
  }

  generateUniqueDays_Last(): void {
    
    if (this.startDate && this.endDate) {
      const uniqueDays: { date: string; dayName: string }[] = [];
      const weeksMap = new Map<
        string,
        {
          week: string;
          days: { date: string; dayName: string }[];
          startDate: string;
          endDate: string;
        }
      >();
      let daysAdded: Set<string> = new Set();
      let currentDate = new Date(this.startDate);
      const endDate = new Date(this.endDate);

      // Debugging: Ensure correct initial start and end dates
      let weekNumberFebruary = 2; // Start from Week 2 as per your request
      let weekNumberMarch = 1; // Week number for March
      let currentMonth = currentDate.getMonth(); // Track the current month

      // Loop through days from startDate to endDate
      while (currentDate <= endDate) {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const dateStr = currentDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        const dayName = currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
        });

        // Debugging: Output current date and day

        // Only add days that are selected and not already added
        if (
          this.SelectedWeekDays.includes(dayName) &&
          !daysAdded.has(dateStr)
        ) {
          daysAdded.add(dateStr);
          uniqueDays.push({ date: dateStr, dayName });

          // Handle week numbering based on the current month
          let weekNumber = month === 1 ? weekNumberFebruary : weekNumberMarch;

          // Create unique key for weeks based on year, month, and week number
          const weekKey = `${year}-${month + 1}-Week ${weekNumber}`;

          // Initialize the week in the map if not already present
          if (!weeksMap.has(weekKey)) {
            weeksMap.set(weekKey, {
              week: '',
              days: [],
              startDate: '',
              endDate: '',
            });
          }

          const weekData = weeksMap.get(weekKey)!;
          weekData.days.push({ date: dateStr, dayName });

          // Set the start date of the week for the first day in the week
          if (!weekData.startDate) {
            weekData.startDate = dateStr;
          }

          // Calculate the end date of the week (Sunday)
          let tempDate = new Date(dateStr);
          let daysUntilSunday = 7 - tempDate.getDay(); // Find days until Sunday
          let sundayDate = new Date(tempDate);
          sundayDate.setDate(tempDate.getDate() + daysUntilSunday);

          // Ensure the week ends before or on the selected endDate
          if (sundayDate > endDate) {
            sundayDate = new Date(endDate);
          }

          weekData.endDate = sundayDate.toISOString().split('T')[0];

          // Debugging: Output the calculated week data

          // Check and update week numbers based on the month
          if (month === 1 && sundayDate.getMonth() !== currentMonth) {
            weekNumberFebruary++; // Increment February's week number
            currentMonth = sundayDate.getMonth(); // Update to the new month
          }

          if (month === 2 && sundayDate.getMonth() !== currentMonth) {
            weekNumberMarch++; // Increment March's week number
            currentMonth = sundayDate.getMonth(); // Update to the new month
          }

          // Assign week label in the format "Week X (startDate - endDate)"
          weekData.week = `Week ${weekNumber} (${weekData.startDate} - ${weekData.endDate})`;
        }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Push the weeks into the availableWeeks array
      this.availableWeeks = Array.from(weeksMap.values());

      // Debugging: Output final weeks data
    }
  }

  getWeekNumberInMonth(date: Date): number {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstMonday = new Date(firstDayOfMonth);
    while (firstMonday.getDay() !== 1) {
      firstMonday.setDate(firstMonday.getDate() + 1);
    }
    return Math.ceil((date.getDate() - firstMonday.getDate() + 1) / 7) + 1;
  }

  // Get month name
  getMonthName(monthIndex: number): string {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return monthNames[monthIndex];
  }

  updateAvailableDays(): void {
   
    const currentWeek = this.availableWeeks[this.currentWeekIndex]?.days || [];
    if (
      this.labelTextForSlider === 'Apply For Whole Calendar' ||
      this.labelTextForSlider == 'Apply For Current Month'
    ) {
      let allDays: { date: string; dayName: string }[] = [];
      let seenDays = new Set<string>();
      for (let i = 0; i < this.availableWeeks.length; i++) {
        const nextWeek = this.availableWeeks[i]?.days || [];
        nextWeek.forEach((day) => {
          if (
            this.SelectedWeekDays.includes(day.dayName) &&
            !seenDays.has(day.dayName)
          ) {
            seenDays.add(day.dayName);
            allDays.push(day);
          }
        });
      }
      this.availableDays = allDays;
      this.availableDays.forEach((day) => {
  
      });
    } else {
      this.availableDays = currentWeek.filter((day) =>
        this.SelectedWeekDays.includes(day.dayName)
      );
    }
  }

  navigateWeek(direction: string) {
    
    if (
      direction === 'next' &&
      this.currentWeekIndex < this.availableWeeks.length - 1
    ) {
      this.currentWeekIndex++;
    } else if (direction === 'prev' && this.currentWeekIndex > 0) {
      this.currentWeekIndex--;
    }

    this.selectedDay = '';
    this.updateAvailableDaysAndSlots();
  }

  updateAvailableDaysAndSlots() {
    
    const week = this.availableWeeks[this.currentWeekIndex];
    this.SelectedWeek = week.week;
    this.availableDays = week.days; // Set available days based on the new week

    this.selectedWeekName =
      this.SelectedWeek.split(' ')[0] + ' ' + this.SelectedWeek.split(' ')[1];
    this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);

    // Reset time rows if needed
    this.timeRows = [];
    this.addRow();
  }

  getGroupedTimeSlotsForWeek(week: any) {
    
    return this.timeRowsByDayForList
      .filter((slot) => {
        return slot.week === week.week; // Ensure the slots match the current week's week value
      })
      .reduce((acc, current) => {
        const day = current.dayName;
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(current);
        return acc;
      }, {});
  }

  filterAvailableDays(): void {
    const currentWeek = this.availableWeeks[this.currentWeekIndex];
    if (currentWeek) {
      this.availableDays = currentWeek.days || [];
    } else {
      this.availableDays = [];
    }
  }

  updateSelectedDaysForCurrentWeek(): void {
    const currentWeek = this.availableWeeks[this.currentWeekIndex];
    const currentWeekDays = currentWeek.days.map((day) => day.dayName);
    this.SelectedWeekDays = currentWeekDays.filter((day) =>
      this.SelectedWeekDays.includes(day)
    );
  }

  removeRow(index: number): void {
    if (this.timeRows.length > 1) {
      this.timeRows.splice(index, 1);
    }
  }

  onDaySelect(day: string) {
    this.selectedDay = day;
    this.isSelectDay = true;

    if (this.selectedWeekName == '') {
      const week = this.availableWeeks[this.currentWeekIndex];
      this.SelectedWeek = week.week;
      this.selectedWeekName =
        this.SelectedWeek.split(' ')[0] + ' ' + this.SelectedWeek.split(' ')[1];
    }
    this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);
  }

  //added on 28/01/25
  addRow() {
    this.timeRows.push({
      startTime: '',
      endTime: '',
      isInvalid: false,
    });
  }

  validateTime(row: any): void {
    if (row.startTime && row.endTime && row.startTime >= row.endTime) {
      row.isInvalid = true;
    } else {
      row.isInvalid = false;
    }
  }

  toggleBox(index: number) {
    this.showBoxIndex = this.showBoxIndex === index ? null : index;
  }

  saveTimeRows(SubmitVal: string) {
    $('#Addupdateslotbutton').html('Add Slot');
    if (SubmitVal == 'submit') {
      if (this.timeRows[0].isInvalid) {
        return;
      }
      $('#TimeSlotModal').modal('hide');
    }

    if (!this.TOCModalRegistration.valid) {
      this.TOCModalRegistration.markAllAsTouched();
      return;
    }

    if (!this.TOCModalRegistration.value.option) {
      this.isSelectOption = false;
      this.isAddedSlot = false;
      return;
    }

    if (!this.selectedDay) {
      this.isSelectDay = false;
      return;
    }

    if (!this.timeRows[0]?.startTime || !this.timeRows[0]?.endTime) {
      this.isAddedSlot = false;
      return;
    }

    if (this.timeRows[0].isInvalid) {
      return;
    }

    this.ValidatorForAvailability = false;
    this.selectedAvailableDay = this.selectedDay;

    let labelText = '';
    switch (this.TOCModalRegistration.value.option) {
      case 'Option 1':
        labelText = 'Apply For Whole Calendar';
        break;
      case 'Option 2':
        labelText = 'Apply For Current Month';
        break;
      case 'Option 3':
        labelText = 'Apply For Current Week';
        break;
      case 'Option 4':
        labelText = 'None';
        break;
      default:
        labelText = 'Not Selected';
    }

    const week = this.availableWeeks[this.currentWeekIndex];
    this.SelectedWeek = week.week;
    this.selectedWeekName =
      this.SelectedWeek.split(' ')[0] + ' ' + this.SelectedWeek.split(' ')[1];
    this.dateRange = this.SelectedWeek.split('(')[1].split(')')[0];

    if (this.availableWeeks.length > 0) {
      if (labelText == 'Apply For Whole Calendar') {
        for (let i = 0; i < this.availableWeeks.length; i++) {
          const week = this.availableWeeks[i];
          const weekDays = week.days.map((day) => day.dayName); // Extract day names from the current week's days
          const SelectedWeek = week.week;
          const WeekName = `${SelectedWeek.split(' ')[0]} ${SelectedWeek.split(' ')[1]
            }`;
          const dateRange = SelectedWeek.split('(')[1].split(')')[0];

          if (weekDays.includes(this.selectedAvailableDay)) {
            const timeRowsByDay = this.timeRows.map((row) => ({
              startTime: row.startTime,
              endTime: row.endTime,
              option: labelText,
              dayName: this.selectedAvailableDay,
              week: WeekName,
              dateRange: dateRange,
            }));
            this.timeRowsByDayForList.push(...timeRowsByDay);
          }
        }
      } else if (labelText == 'Apply For Current Month') {
        //Added on 03/02/25
        const startDateString = this.startDate;
        const endDateString = this.endDate;
        this.dateRange = `${startDateString} - ${endDateString}`;

        if (this.isCurrentMonthOptionVisible) {
          const Firstweek = this.availableWeeks[0];
          for (let i = 0; i < this.availableWeeks.length; i++) {
            const week = this.availableWeeks[i];
            const SelectedWeek = week.week;
            const WeekName =
              SelectedWeek.split(' ')[0] + ' ' + SelectedWeek.split(' ')[1];
            const dateRange = SelectedWeek.split('(')[1].split(')')[0];

            //Added on 14/02/25
            const isDayPresent = week.days.some(
              (day) => day.dayName === this.selectedAvailableDay
            );
            const isWeekPresent = week.week == Firstweek.week;

            // && isWeekPresent commented on 03/02/25
            if (isDayPresent) {
              const timeRowsByDay = this.timeRows.map((row) => ({
                startTime: row.startTime,
                endTime: row.endTime,
                option: labelText,
                dayName: this.selectedAvailableDay,
                week: WeekName,
                dateRange: dateRange,
              }));
              this.timeRowsByDayForList.push(...timeRowsByDay);
            }
          }
        } else {
          if (this.startDate && this.endDate) {
            let startDate = new Date(this.startDate);
            let endDate = new Date(this.endDate);

            let lastDayPrevMonth = new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              0
            );
            let weeks = [];
            let current = new Date(startDate);
            let weekCount = 1;

            while (current <= lastDayPrevMonth) {
              weeks.push(`Week ${weekCount}`);
              current.setDate(current.getDate() + 7);
              weekCount++;
            }

            //Added on 17/2/25
            if (this.labelTextForSlider == 'Apply For Current Month') {
              weeks.splice(2);
            }

            //Commented on 14/02/25
            this.availableWeeks = this.availableWeeks.filter(
              (item, index) => index < weeks.length
            );

            //Added on 14/02/25
            // this.availableWeeks = this.availableWeeks.filter((item, index) => index <= weeks.length);
            const Firstweek = this.availableWeeks[0];

            for (let i = 0; i < this.availableWeeks.length; i++) {
              const week = this.availableWeeks[i];
              const SelectedWeek = week.week;
              const WeekName =
                SelectedWeek.split(' ')[0] + ' ' + SelectedWeek.split(' ')[1];
              const dateRange = SelectedWeek.split('(')[1].split(')')[0];

              const isDayPresent = week.days.some(
                (day) => day.dayName === this.selectedAvailableDay
              );
              const isWeekPresent = week.week == Firstweek.week;

              // && isWeekPresent commented on 03/02/25
              if (isDayPresent) {
                const timeRowsByDay = this.timeRows.map((row) => ({
                  startTime: row.startTime,
                  endTime: row.endTime,
                  option: labelText,
                  dayName: this.selectedAvailableDay,
                  week: WeekName,
                  dateRange: dateRange,
                }));
                this.timeRowsByDayForList.push(...timeRowsByDay);
              }
            }
          }
        }
      } else if (labelText == 'Apply For Current Week') {
        if (this.isCurrentWeekOptionVisible) {
          for (let i = 0; i < this.availableWeeks.length; i++) {
            const week = this.availableWeeks[i];
            const SelectedWeek = week.week;
            const WeekName =
              SelectedWeek.split(' ')[0] + ' ' + SelectedWeek.split(' ')[1];
            const dateRange = SelectedWeek.split('(')[1].split(')')[0];

            const timeRowsByDay = this.timeRows.map((row) => ({
              startTime: row.startTime,
              endTime: row.endTime,
              option: labelText,
              dayName: this.selectedAvailableDay,
              week: WeekName,
              dateRange: dateRange,
            }));
            this.timeRowsByDayForList.push(...timeRowsByDay);
          }
        } else {
          if (this.startDate && this.endDate) {
            let startDate = new Date(this.startDate);
            let endDate = new Date(this.endDate);

            let currentDayOfWeek = startDate.getDay(); // Get the day of the week for startDate
            let daysUntilEndOfWeek = (7 - currentDayOfWeek) % 7; // Calculate days until the end of the week (Sunday)
            let lastDayOfCurrentWeek = new Date(startDate);
            lastDayOfCurrentWeek.setDate(
              startDate.getDate() + daysUntilEndOfWeek
            );

            let weeks = [];
            let current = new Date(startDate);
            let weekCount = 1;

            if (currentDayOfWeek !== 1) {
              current.setDate(current.getDate() + ((8 - currentDayOfWeek) % 7));
            }

            while (current <= endDate) {
              let weekEndDate = new Date(current);
              weekEndDate.setDate(current.getDate() + 6);
              weeks.push(`Week ${weekCount}`);
              current.setDate(current.getDate() + 7);
              weekCount++;
            }

            //Added on 14/2/25
            if (this.labelTextForSlider == 'Apply For Current Week') {
              weeks.splice(1);
            }

            this.availableWeeks = this.availableWeeks.filter(
              (item, index) => index < weeks.length
            );
            for (let i = 0; i < this.availableWeeks.length; i++) {
              const week = this.availableWeeks[i];
              const SelectedWeek = week.week;
              const WeekName =
                SelectedWeek.split(' ')[0] + ' ' + SelectedWeek.split(' ')[1];
              const dateRange = SelectedWeek.split('(')[1].split(')')[0];

              const timeRowsByDay = this.timeRows.map((row) => ({
                startTime: row.startTime,
                endTime: row.endTime,
                option: labelText,
                dayName: this.selectedAvailableDay,
                week: WeekName,
                dateRange: dateRange,
              }));
              this.timeRowsByDayForList.push(...timeRowsByDay);
            }
          }
        }
      } else {
        const timeRowsByDay = this.timeRows.map((row) => ({
          startTime: row.startTime,
          endTime: row.endTime,
          option: labelText,
          dayName: this.selectedAvailableDay,
          week: this.selectedWeekName,
          dateRange: this.dateRange,
        }));
        this.timeRowsByDayForList.push(...timeRowsByDay);
      }
    }

    if (this.isEditMode && this.editRowIndex !== null) {
      if (labelText == 'None') {
        const filteredEditRecord = Object.entries(this.groupedTimeSlots)
          .filter(([week, days]) => week === this.selectedWeekName)
          .flatMap(([_, days]) =>
            Object.entries(days)
              .filter(([day]) => day === this.selectedDay)
              .flatMap(([_, records]) => records)
          );

        const removedRecord = filteredEditRecord.splice(
          this.editRowIndex,
          1
        )[0];
        const indexInList = this.timeRowsByDayForList.findIndex(
          (item) =>
            item.startTime === removedRecord.startTime &&
            item.endTime === removedRecord.endTime &&
            item.option === removedRecord.option &&
            item.dayName === removedRecord.dayName
        );

        if (indexInList !== -1) {
          this.timeRowsByDayForList.splice(indexInList, 1);
        }
      } else if (
        this.labelTextForSlider == 'Apply For Current Month' ||
        this.labelTextForSlider == 'Apply For Whole Calendar'
      ) {
        const filteredEditRecord = Object.entries(
          this.groupedTimeSlots
        ).flatMap(([_, days]) =>
          Object.entries(days)
            .filter(([day]) => day === this.selectedDay)
            .flatMap(([_, records]) => records)
        );

        if (
          this.editRowIndex < 0 ||
          this.editRowIndex >= filteredEditRecord.length
        ) {
          // console.error("Invalid editRowIndex:", this.editRowIndex);
          return;
        }

        const editRecord = filteredEditRecord[this.editRowIndex];
        this.timeRowsByDayForList = this.timeRowsByDayForList.filter(
          (item) =>
            !(
              item.startTime === editRecord.startTime &&
              item.endTime === editRecord.endTime &&
              item.option === editRecord.option &&
              item.dayName === editRecord.dayName
            )
        );
      
      } else {
        const filteredEditRecord = Object.entries(
          this.groupedTimeSlots
        ).flatMap(([_, days]) =>
          Object.entries(days)
            .filter(([day]) => day === this.selectedDay)
            .flatMap(([_, records]) => records)
        );

        const weeksCount = Object.keys(this.groupedTimeSlots).length;
        // const removedRecords = filteredEditRecord.splice(0, weeksCount);
        //Added on 03/2/25
        const removedRecords = filteredEditRecord.splice(
          this.editRowIndex,
          weeksCount
        );
        removedRecords.forEach((removedRecord) => {
          const indexInList = this.timeRowsByDayForList.findIndex(
            (item) =>
              item.startTime === removedRecord.startTime &&
              item.endTime === removedRecord.endTime &&
              item.option === removedRecord.option &&
              item.dayName === removedRecord.dayName
          );

          if (indexInList !== -1) {
            this.timeRowsByDayForList.splice(indexInList, 1);
          }
        });
      }

      this.isEditMode = false;
      this.editRowIndex = null;

      const timeRowsByDay = this.timeRows.map((row) => ({
        startTime: row.startTime,
        endTime: row.endTime,
        option: labelText,
        dayName: this.selectedAvailableDay,
        week: this.selectedWeekName,
      }));
      // this.timeRowsByDayForList.push(...timeRowsByDay);
    }

 
    this.groupedTimeSlots = this.timeRowsByDayForList.reduce((acc, current) => {
      const week = current.week;
      const day = current.dayName;
      if (!acc[week]) {
        acc[week] = {};
      }
      if (!acc[week][day]) {
        acc[week][day] = [];
      }
      acc[week][day].push(current);
      return acc;
    }, {});

    //Commented on 31/01/25
    //this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);

    //Added on 31/01/25
    if (this.labelTextForSlider == 'Apply For Whole Calendar') {
      var WeekNames = this.timeRowsByDayForList
        .filter((x) => x.dayName === this.selectedDay)
        .map((x) => x.week);
      this.filterRecordsByWeekAndDay(WeekNames[0], this.selectedDay);
    } else {
      this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);
    }


    this.timeRows = [];
    this.isAddedSlot = true;
    this.addRow();
    
  }

  calculateWeeks(startDate: Date, endDate: Date): string[] {
    const weeks: string[] = [];
    let currentDate = new Date(startDate);
    let weekCount = 1;
    while (currentDate <= endDate) {
      weeks.push(`Week ${weekCount}`);
      currentDate.setDate(currentDate.getDate() + 7);
      weekCount++;
    }
    return weeks;
  }

  //Added on 31/0/25
  filterRecordsByWeekAndDay(weekk: string, selectedDay: string): void {
    if (weekk == '') {
      this.filteredGroupedTimeSlots2 = Object.entries(this.groupedTimeSlots)
        .filter(([week, days]) => week === weekk)
        .flatMap(([_, days]) =>
          Object.entries(days)
            .filter(([day]) => day === selectedDay)
            .flatMap(([_, records]) => records)
        );
      this.isFilteredNotNull =
        this.filteredGroupedTimeSlots2 !== undefined &&
        this.filteredGroupedTimeSlots2 !== null;
    } else {
      let [baseWeek, weekNumber] = weekk.split(' ');
      let incrementedWeek = weekk;
      if (
        this.labelTextForSlider == 'Apply For Whole Calendar' ||
        this.labelTextForSlider == 'Apply For Current Month'
      ) {
        for (let i = 0; i < this.availableDays.length; i++) {
          const DN = this.availableDays[i].dayName;
          while (
            !this.groupedTimeSlots[incrementedWeek] &&
            this.groupedTimeSlots[`Week ${parseInt(weekNumber) + 1}`] &&
            DN == selectedDay
          ) {
            weekNumber = (parseInt(weekNumber) + 1).toString();
            incrementedWeek = `${baseWeek} ${weekNumber}`;
          }
        }

        for (let i = 0; i < this.availableDays.length; i++) {
          const DN = this.availableDays[i].dayName;
          while (
            this.groupedTimeSlots[incrementedWeek] &&
            this.groupedTimeSlots[`Week ${parseInt(weekNumber) + 1}`] &&
            DN == selectedDay
          ) {
            weekNumber = (parseInt(weekNumber) + 1).toString();
            incrementedWeek = `${baseWeek} ${weekNumber}`;
          }
        }

        this.filteredGroupedTimeSlots2 = Object.entries(this.groupedTimeSlots)
          .filter(([week, _]) => week === incrementedWeek)
          .flatMap(([_, days]) =>
            Object.entries(days)
              .filter(([day]) => day === selectedDay)
              .flatMap(([_, records]) => records)
          );

        this.filteredGroupedTimeSlots2 = this.filteredGroupedTimeSlots2.filter(
          (slot, index, self) =>
            index ===
            self.findIndex(
              (s) =>
                s.week === slot.week &&
                s.dayName === slot.dayName &&
                s.startTime === slot.startTime &&
                s.endTime === slot.endTime
            )
        );
      } else {
        this.filteredGroupedTimeSlots2 = Object.entries(this.groupedTimeSlots)
          .filter(([week, _]) => week === incrementedWeek)
          .flatMap(([_, days]) =>
            Object.entries(days)
              .filter(([day]) => day === selectedDay)
              .flatMap(([_, records]) => records)
          );
      }

      //Added on 01/04/25
      this.filteredDayNameAfterAdded =
        this.filteredGroupedTimeSlots2[0].dayName;
      this.filteredWeekAfterAdded = this.filteredGroupedTimeSlots2[0].week;

      // this.filteredGroupedTimeSlots2 = this.groupedTimeSlots[incrementedWeek]?.filter(slot => slot.dayName === selectedDay) || [];=
      this.isFilteredNotNull =
        this.filteredGroupedTimeSlots2 !== undefined &&
        this.filteredGroupedTimeSlots2 !== null;
    }
  }

  editRow(row: any, rowIndex: number) {
 
    this.timeRows = [
      {
        startTime: row.startTime,
        endTime: row.endTime,
      },
    ];
    this.selectedDay = row.dayName;
    this.editRowIndex = rowIndex;
    this.isEditMode = true;
    $('#Addupdateslotbutton').html('Update Slot');
  }

  // deleteRow(row: any, rowIndex: number) {
  //   // Remove from timeRowsByDayForList
  //   if (this.timeRowsByDayForList && Array.isArray(this.timeRowsByDayForList)) {
  //     let filteredRecords = this.timeRowsByDayForList.filter(record => record.dayName === row.dayName);
  //     if (rowIndex >= 0 && rowIndex < filteredRecords.length) {
  //       let recordToRemove = filteredRecords[rowIndex];
  //       let actualIndex = this.timeRowsByDayForList.findIndex(
  //         record => record.startTime === recordToRemove.startTime &&
  //                   record.endTime === recordToRemove.endTime &&
  //                   record.dayName === recordToRemove.dayName &&
  //                   record.week === recordToRemove.week
  //       );

  //       if (actualIndex !== -1) {
  //         this.timeRowsByDayForList.splice(actualIndex, 1);
  //       }
  //     } else {
  //       // console.error("Error: rowIndex out of bounds for dayName:", row.dayName);
  //     }
  //   }

  //   // Remove from groupedTimeSlots
  //   if (this.groupedTimeSlots && row.week in this.groupedTimeSlots) {
  //     let weekSlots = this.groupedTimeSlots[row.week];
  //     if (weekSlots && weekSlots[row.dayName] && Array.isArray(weekSlots[row.dayName])) {
  //       let daySlots = weekSlots[row.dayName];

  //       if (Array.isArray(daySlots) && rowIndex >= 0 && rowIndex < daySlots.length) {
  //         daySlots.splice(rowIndex, 1);
  //       }
  //     }
  //   }
  //   this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);
  // }

  deleteRow(row: any, rowIndex: number) {
    // Remove from timeRowsByDayForList
    if (this.labelTextForSlider != 'None') {
      if (
        this.timeRowsByDayForList &&
        Array.isArray(this.timeRowsByDayForList)
      ) {
        let filteredRecords = this.timeRowsByDayForList.filter(
          (record) => record.dayName === row.dayName
        );
        if (rowIndex >= 0 && rowIndex < filteredRecords.length) {
          let recordToRemove = filteredRecords[rowIndex];
          this.timeRowsByDayForList = this.timeRowsByDayForList.filter(
            (record) =>
              !(
                record.startTime === recordToRemove.startTime &&
                record.endTime === recordToRemove.endTime &&
                record.dayName === recordToRemove.dayName &&
                record.option === recordToRemove.option
              )
          );
          
        } else {
          // console.warn(`Error: rowIndex ${rowIndex} out of bounds for dayName: ${row.dayName}`);
        }
      }

      if (this.groupedTimeSlots) {
        Object.keys(this.groupedTimeSlots).forEach((week: string) => {
          let weekSlots = this.groupedTimeSlots[week];
          if (weekSlots && typeof weekSlots === 'object') {
            let daySlots = weekSlots[row.dayName];
            if (
              Array.isArray(daySlots) &&
              rowIndex >= 0 &&
              rowIndex < daySlots.length
            ) {
              daySlots.splice(rowIndex, 1);
              if (daySlots.length === 0) {
                delete weekSlots[row.dayName];
              }
            
            }
          }
        });
      }
    } else {
      if (
        this.timeRowsByDayForList &&
        Array.isArray(this.timeRowsByDayForList)
      ) {
        let filteredRecords = this.timeRowsByDayForList.filter(
          (record) => record.dayName === row.dayName
        );
        if (rowIndex >= 0 && rowIndex < filteredRecords.length) {
          let recordToRemove = filteredRecords[rowIndex];
          let actualIndex = this.timeRowsByDayForList.findIndex(
            (record) =>
              record.startTime === recordToRemove.startTime &&
              record.endTime === recordToRemove.endTime &&
              record.dayName === recordToRemove.dayName &&
              record.week === recordToRemove.week
          );

          if (actualIndex !== -1) {
            this.timeRowsByDayForList.splice(actualIndex, 1);
          }
        } else {
          // console.error("Error: rowIndex out of bounds for dayName:", row.dayName);
        }
      }

      // Remove from groupedTimeSlots
      if (this.groupedTimeSlots && row.week in this.groupedTimeSlots) {
        let weekSlots = this.groupedTimeSlots[row.week];
        if (
          weekSlots &&
          weekSlots[row.dayName] &&
          Array.isArray(weekSlots[row.dayName])
        ) {
          let daySlots = weekSlots[row.dayName];
          if (
            Array.isArray(daySlots) &&
            rowIndex >= 0 &&
            rowIndex < daySlots.length
          ) {
            daySlots.splice(rowIndex, 1);
          }
        }
      }
    }

    this.filteredDayNameAfterAdded = '';
    this.filteredWeekAfterAdded = '';
    this.filterRecordsByWeekAndDay(this.selectedWeekName, this.selectedDay);
  }

  async onSubmit() {
    this.spinner.show();
    if (this.TOCRegistration.valid) {
      if (
        this.TOCModalRegistration.value.partTimeStartDate == null ||
        this.TOCModalRegistration.value.partTimeStartDate == ''
      ) {
        this.ValidatorForAvailability = true;
        this.spinner.hide();
        return;
      }

      if (this.selectedDayCareIds.length == 0) {
        this.toastr.warning('Select atleast one day Care');
        this.spinner.hide();
        return;
      }

      this.TOCRegistration.patchValue({
        centerID: 0,
        jobPostID: 0,
        loginUserID: 0,
        jobTypeID: 3,
        preferredArea: this.selectedDayCareIds.toString(),
      });

      try {
        let uploadedResume = null;
        let uploadedDocument = null;
        let uploadedEducationalDocument = null;

        // Upload Resume File
        if (this.selectedFile != null) {
          const resumeFormData = new FormData();
          resumeFormData.append(
            'files',
            this.selectedFile,
            this.selectedFile.name
          );
          resumeFormData.append('type', 'Resume');

          const resumeResponse = await this.tocservice
            .uploadImages(resumeFormData)
            .toPromise();
          if (resumeResponse?.message === 'OK') {
            uploadedResume = resumeResponse.result.map((file: any) => ({
              name: file.imageName,
              path: file.path,
            }))[0];
          } else {
            this.spinner.hide();
            this.toastr.error('Resume upload failed');
            return;
          }
        }

        // Upload Document File
        if (this.selectedFileDocument != null) {
          const documentFormData = new FormData();
          documentFormData.append(
            'files',
            this.selectedFileDocument,
            this.selectedFileDocument.name
          );
          documentFormData.append('type', 'Document');

          const documentResponse = await this.tocservice
            .uploadImages(documentFormData)
            .toPromise();
          if (documentResponse?.message === 'OK') {
            uploadedDocument = documentResponse.result.map((file: any) => ({
              name: file.imageName,
              path: file.path,
            }))[0];
          } else {
            this.spinner.hide();
            this.toastr.error('Document upload failed');
            return;
          }
        }

        if (this.selectedFileEducationalDocument != null) {
          const documentFileEducationalData = new FormData();
          documentFileEducationalData.append(
            'files',
            this.selectedFileEducationalDocument,
            this.selectedFileEducationalDocument.name
          );
          documentFileEducationalData.append('type', 'Document');

          const FileEducationalResponse = await this.tocservice
            .uploadImages(documentFileEducationalData)
            .toPromise();
          if (FileEducationalResponse?.message === 'OK') {
            uploadedEducationalDocument = FileEducationalResponse.result.map(
              (file: any) => ({
                name: file.imageName,
                path: file.path,
              })
            )[0];
          } else {
            this.spinner.hide();
            this.toastr.error('Document upload failed');
            return;
          }
        }

        // Patch form values with uploaded file data
        if (uploadedResume) {
          this.TOCRegistration.patchValue({
            documentResume: uploadedResume.name,
            documentResumePath: uploadedResume.path,
          });
        }

        if (uploadedDocument) {
          this.TOCRegistration.patchValue({
            documentImage: uploadedDocument.name,
            documentImagePath: uploadedDocument.path,
          });
        }

        if (uploadedEducationalDocument) {
          this.TOCRegistration.patchValue({
            documentEducationalCredentails: uploadedEducationalDocument.name,
            documentEducationalCredentailsPath:
              uploadedEducationalDocument.path,
          });
        }

        this.TOCRegistration.patchValue({
          partTimeStartDate: this.TOCModalRegistration.value.partTimeStartDate,
          partTimeEndDate: this.TOCModalRegistration.value.partTimeEndDate,
        });

        // Convert qualificationID to a comma-separated string
        let commaSeparatedQualifications =
          this.TOCRegistration.value.qualificationID.join(',');

        this.TOCRegistration.patchValue({
          qualificationID: commaSeparatedQualifications,
        });

        let convertedExpertiseTostring =
          this.TOCRegistration.value.expertise.toString();
        this.TOCRegistration.patchValue({
          expertise: convertedExpertiseTostring,
        });

        //selected Day cares
        let commaSeparatedDaycares = this.selectedDayCareIds.join(',');

        this.TOCRegistration.patchValue({
          preferredArea: commaSeparatedDaycares,
        });

        const combinedData = {
          Data: this.TOCRegistration.value,
          SlotTime: this.groupedTimeSlots,
        };

        // Save the data to the server
        const data = await this.tocservice.ManageAppliedTOC(combinedData).toPromise();

        if (data.message === 'ok') {
          this.spinner.hide();
          this.toastr.success('Data saved successfully');
          $('#formFile').val('');
          const centreId = this.selectedDayCareIds[0];
          this.cookie.set('CentreID', centreId.toString());
          this.resetForm();
          this.spinner.hide();

          // this.route.navigate(['/view-student-detail'], {
          //   queryParams: { ID: encryptedID,TYPE:'detail' }
          // });


          // this.router.navigate(['/toc-schedule']);
          this.tocservice.triggerSidebarRefresh();
          // this.router.navigate(['/toc-dashboard']);
          this.router.navigate(['/profile']);
        } else {
          this.spinner.hide();
          this.toastr.error(data.message);
        }
      } catch (error) {
        this.spinner.hide();
        this.toastr.error('An error occurred while saving data');
        // console.error(error);
      }
    } else {
      this.TOCRegistration.markAllAsTouched();
      if (
        this.TOCModalRegistration.value.partTimeStartDate == null ||
        this.TOCModalRegistration.value.partTimeStartDate == ''
      ) {
        this.ValidatorForAvailability = true;
      }
      this.spinner.hide();
    }
  }

  IsAddedSlot() {
    this.isAddedSlot = true;
  }

  isSelectedRadio() {
   
    this.ResetSlotDataModal();
    this.currentWeekIndex = 0;
    switch (this.TOCModalRegistration.value.option) {
      case 'Option 1':
        this.labelTextForSlider = 'Apply For Whole Calendar';
        break;
      case 'Option 2':
        this.labelTextForSlider = 'Apply For Current Month';
        break;
      case 'Option 3':
        this.labelTextForSlider = 'Apply For Current Week';
        break;
      case 'Option 4':
        this.labelTextForSlider = 'None';
        break;
      default:
        this.labelTextForSlider = 'Not Selected';
    }

    if (this.labelTextForSlider === 'Apply For Current Month') {
      if (this.startDate != null && this.endDate != null) {
        const lastDayOfStartMonth = new Date(
          this.startDate.getFullYear(),
          this.startDate.getMonth() + 1,
          0
        );
        if (this.endDate > lastDayOfStartMonth) {
          const startDateString = this.startDate.toDateString();
          const lastDayOfStartMonthString = lastDayOfStartMonth.toDateString();
          this.dateRange = `${startDateString} - ${lastDayOfStartMonthString}`;
        } else {
          const startDateString = this.startDate.toDateString();
          const endDateString = this.endDate.toDateString();
          this.dateRange = `${startDateString} - ${endDateString}`;
        }
      }
    }

    //Added on 8/1/25
    //  this.availableDays = [];
    this.updateAvailableDays();
    this.isSelectOption = true;
  }

  ResetModalForm() {
    if (this.TOCUserDetail == null) {
      this.resetDatePickers();
      this.timeRowsByDay = {};
      this.timeRowsByDayForBo = {};
      this.ValidatorForAvailability = false;
      //forSlotmodal
      this.timeRows = [];
      this.showBoxIndex = null;
      this.selectedDay = '';
      this.availableDays = [];
      this.availableWeeks = [];
      this.isAddedSlot = true;
      this.isSelectDay = true;
      this.isSelectOption = true;
      this.filteredGroupedTimeSlots2 = [];
      this.TOCModalRegistration.reset();
      this.addRow();
      //Added on 04/02/25
      $('#TimeSlotModal').modal('hide');


      //Added on 25/07/25
      if (this.startDatePickerInstance && typeof this.startDatePickerInstance.clear === 'function') {
        this.startDatePickerInstance.clear();
      }

      if (this.endDatePickerInstance && typeof this.endDatePickerInstance.clear === 'function') {
        this.endDatePickerInstance.clear();
      }


      this.TOCModalRegistration.patchValue({
        partTimeStartDate: null,
        partTimeEndDate: null,
        option: '',
      });

      this.timeRows = [];
      this.showBoxIndex = null;
      this.selectedDay = '';
      this.availableDays = [];
      this.isAddedSlot = true;
      this.isSelectDay = true;
      this.isSelectOption = true;
      this.filteredDayNameAfterAdded = '';
      this.filteredWeekAfterAdded = '';
      this.addRow();

      //end
    }
    else {
      $('#TimeSlotModal').modal('hide');
    }

  }

  ResetSlotDataModal() {
    this.filteredGroupedTimeSlots2 = [];
    this.groupedTimeSlots = {};
    this.timeRowsByDayForList = [];
  }

  async onUpdate() {
   
    this.spinner.show();
    this.TOCRegistration.get('partTimeWorkingDays')?.clearValidators();
    this.TOCRegistration.get('partTimeWorkingDays')?.updateValueAndValidity();
    if (this.TOCRegistration.valid) {
      this.TOCRegistration.patchValue({
        centerID: 0,
        jobPostID: 0,
        loginUserID: 0,
        jobTypeID: 3,
      });

      try {
        let uploadedResume = null;
        let uploadedDocument = null;
        let uploadedEducationalDocument = null;

        // Upload Resume File
        if (this.selectedFile != null) {
          const resumeFormData = new FormData();
          resumeFormData.append(
            'files',
            this.selectedFile,
            this.selectedFile.name
          );
          resumeFormData.append('type', 'Resume');

          const resumeResponse = await this.tocservice
            .uploadImages(resumeFormData)
            .toPromise();
          if (resumeResponse?.message === 'OK') {
            uploadedResume = resumeResponse.result.map((file: any) => ({
              name: file.imageName,
              path: file.path,
            }))[0];
          } else {
            this.toastr.error('Resume upload failed');
            return;
          }
        }

        // Upload Document File
        if (this.selectedFileDocument != null) {
          const documentFormData = new FormData();
          documentFormData.append(
            'files',
            this.selectedFileDocument,
            this.selectedFileDocument.name
          );
          documentFormData.append('type', 'Document');

          const documentResponse = await this.tocservice
            .uploadImages(documentFormData)
            .toPromise();
          if (documentResponse?.message === 'OK') {
            uploadedDocument = documentResponse.result.map((file: any) => ({
              name: file.imageName,
              path: file.path,
            }))[0];
          } else {
            this.toastr.error('Document upload failed');
            return;
          }
        }

        if (this.selectedFileEducationalDocument != null) {
          const documentFileEducationalData = new FormData();
          documentFileEducationalData.append(
            'files',
            this.selectedFileEducationalDocument,
            this.selectedFileEducationalDocument.name
          );
          documentFileEducationalData.append('type', 'Document');

          const FileEducationalResponse = await this.tocservice
            .uploadImages(documentFileEducationalData)
            .toPromise();
          if (FileEducationalResponse?.message === 'OK') {
            uploadedEducationalDocument = FileEducationalResponse.result.map(
              (file: any) => ({
                name: file.imageName,
                path: file.path,
              })
            )[0];
          } else {
            this.toastr.error('Document upload failed');
            return;
          }
        }

        if (uploadedResume) {
          this.TOCRegistration.patchValue({
            documentResume: uploadedResume.name,
            documentResumePath: uploadedResume.path,
          });
        }

        if (uploadedDocument) {
          this.TOCRegistration.patchValue({
            documentImage: uploadedDocument.name,
            documentImagePath: uploadedDocument.path,
          });
        }

        if (uploadedEducationalDocument) {
          this.TOCRegistration.patchValue({
            documentEducationalCredentails: uploadedEducationalDocument.name,
            documentEducationalCredentailsPath:
              uploadedEducationalDocument.path,
          });
        }

        this.TOCRegistration.patchValue({
          partTimeStartDate: this.TOCModalRegistration.value.partTimeStartDate,
          partTimeEndDate: this.TOCModalRegistration.value.partTimeEndDate,
        });

        let commaSeparatedQualifications =
          this.TOCRegistration.value.qualificationID.join(',');
        this.TOCRegistration.patchValue({
          qualificationID: commaSeparatedQualifications,
        });

        let convertedExpertiseTostring =
          this.TOCRegistration.value.expertise.toString();
        this.TOCRegistration.patchValue({
          expertise: convertedExpertiseTostring,
        });

        const data = await this.tocservice
          .updateTocUserDetail(this.TOCRegistration.value)
          .toPromise();

        if (data.message === 'ok') {
          this.spinner.hide();
          this.toastr.success('Data update successfully');
          $('#formFile').val('');

          const fileInput = document.getElementById(
            'formFile'
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }

          const fileInputDocument = document.getElementById(
            'formFileDocument'
          ) as HTMLInputElement;
          if (fileInputDocument) {
            fileInputDocument.value = '';
          }

          const fileInputEducationDocument = document.getElementById(
            'formFileEducationDocument'
          ) as HTMLInputElement;
          if (fileInputEducationDocument) {
            fileInputEducationDocument.value = '';
          }

          this.tocservice.hideProfileModal();
          this.tocservice.refreshTocSubject();
        } else {
          this.spinner.hide();
          this.toastr.error(data.message);
        }
      } catch (error) {
        this.spinner.hide();
        this.toastr.error('An error occurred while saving data');
        // console.error(error);
      }
    } else {
      this.TOCRegistration.markAllAsTouched();
      this.spinner.hide();
    }
  }

  ApplytoAllworkingDays(event: any, selectedDayName: string) {
   
    if (event.target.checked) {
      if (this.labelTextForSlider != 'None') {
        let daysArray = this.availableWeeks.flatMap((week) =>
          week.days
            .filter((day) => day.dayName !== selectedDayName)
            .map((day) => ({ dayName: day.dayName, week: week.week }))
        );
       
        if (this.timeRowsByDayForList && this.timeRowsByDayForList.length > 0) {
          const referenceRecords = this.timeRowsByDayForList.filter(
            (day) => day.dayName === selectedDayName
          );
         
          let uniqueRecords = new Set();
          let newRecords: any[] = [];

          daysArray.forEach(({ dayName, week }) => {
            referenceRecords.forEach((record) => {
              let key = `${dayName}-${week}-${record.startTime}-${record.endTime}`;
              if (!uniqueRecords.has(key)) {
                uniqueRecords.add(key);
                newRecords.push({
                  ...record,
                  dayName,
                  week: week.split(' (')[0],
                  dateRange: week.split(' (')[1]?.replace(')', ''),
                });
              }
            });
          });

          //Commented on 10/02/25
          this.timeRowsByDayForList = [
            ...this.timeRowsByDayForList,
            ...newRecords,
          ];
        
        }
      } else {
        let daysArray = this.availableWeeks.flatMap((week) =>
          week.days.map((day) => ({
            date: day.date,
            dayName: day.dayName,
            week: week.week,
          }))
        );
      
        if (this.timeRowsByDayForList && this.timeRowsByDayForList.length > 0) {
          const referenceRecords = this.timeRowsByDayForList.filter(
            (day) => day.dayName === selectedDayName
          );
       
          let uniqueRecords = new Set();
          let newRecords: any[] = [];

          daysArray.forEach(({ date, dayName, week }) => {
            referenceRecords.forEach((record) => {
              let key = `${dayName}-${week}-${record.startTime}-${record.endTime}`;
              const recordExists = this.timeRowsByDayForList.some(
                (existingRecord) =>
                  existingRecord.dayName === dayName &&
                  existingRecord.week.split(' (')[0] === week.split(' (')[0] &&
                  existingRecord.startTime === record.startTime &&
                  existingRecord.endTime === record.endTime
              );

              if (!recordExists && !uniqueRecords.has(key)) {
                uniqueRecords.add(key);
                newRecords.push({
                  ...record,
                  date,
                  dayName,
                  week: week.split(' (')[0],
                });
              }
            });
          });

          // Merge only unique new records into the main list
          if (newRecords.length > 0) {
            this.timeRowsByDayForList = [
              ...this.timeRowsByDayForList,
              ...newRecords,
            ];
          }
          
        }
      }
      this.TOCRegistration.patchValue({
        isApplyforAllDays: true,
      });

      this.IsApplyForAllDaysChecked = true;
    } else {
      this.timeRowsByDayForList = this.timeRowsByDayForList.filter(
        (day) => day.dayName === selectedDayName
      );

      this.TOCRegistration.patchValue({
        isApplyforAllDays: false,
      });
      this.IsApplyForAllDaysChecked = false;
    }

    this.groupedTimeSlots = this.timeRowsByDayForList.reduce((acc, current) => {
      const week = current.week;
      const day = current.dayName;
      if (!acc[week]) {
        acc[week] = {};
      }
      if (!acc[week][day]) {
        acc[week][day] = [];
      }
      acc[week][day].push(current);
      return acc;
    }, {});

  }

  getUserCurrentLocation(event: any) {
    if (event.target.checked) {
      if (confirm('Do you want to enable location access?')) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              };
              this.isEnablelocation = true;
        
              this.GetAllDayCaresNearBy({
                target: { value: this.radiusValue || 10 },
              });
            },
            (error) => {
              event.target.checked = false;
              this.isEnablelocation = false;
            }
          );
        } else {
          event.target.checked = false;
          this.isEnablelocation = false;
        }
      } else {
        event.target.checked = false;
        this.isEnablelocation = false;
      }
    } else {
      this.userLocation = { lat: 0, lon: 0 };
      this.isEnablelocation = false;
      this.GetAllDayCaresNearBy({ target: { value: this.radiusValue || 10 } });
    }
  }

  GetAllDayCaresNearBy(event: any) {
    this.spinner.show();
    var lat = 0;
    var lng = 0;
    this.NearbyDayCareList = [];
    this.radiusValue = event.target.value;

    if (this.radiusValue == '') {
      this.spinner.hide();
    }

    if (this.isEnablelocation == true) {
      lat = this.userLocation.lat;
      lng = this.userLocation.lon;
    } else {
      lat = this.userLocationFromZipcode.lat;
      lng = this.userLocationFromZipcode.lon;
    }

    //Zip code A1A 1A1
    // lat = 49.171896;
    // lng = -123.053605;

    this.tocservice
      .GetAllDayCareWithInRadius(lat, lng, this.radiusValue)
      .subscribe((data) => {
        if (data.message == 'ok') {
          this.NearbyDayCareList = data.result;
          this.DayCaresForFilters = data.result;
        
          this.spinner.hide();
        } else {
          this.NearbyDayCareList = [];
          this.spinner.hide();
        }
      });
  }

  applyforParticularDC(event: any, id: number) {
  
    if (event.target.checked) {
      if (!this.selectedDayCareIds.includes(id)) {
        this.selectedDayCareIds.push(id);
      }
    } else {
      this.selectedDayCareIds = this.selectedDayCareIds.filter(
        (dcId) => dcId !== id
      );
    }
 
  }

  applyforAllDC(event: any) {
   
    if (event.target.checked) {
      if (this.NearbyDayCareList != null) {
        this.selectedDayCareIds = this.NearbyDayCareList.map(
          (dc: { id: any }) => dc.id
        );
      }
    } else {
      this.selectedDayCareIds = [];
    }

  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  filterNearbyDaycares() {
 
    if (this.searchTerm != '') {
      this.NearbyDayCareList = this.DayCaresForFilters;
      const term = this.searchTerm.toLowerCase();
      this.NearbyDayCareList = this.NearbyDayCareList.filter(
        (item: {
          centreName: string;
          centreEmail: string;
          centreMobile: string;
        }) =>
          item.centreName?.toLowerCase().includes(term) ||
          item.centreEmail?.toLowerCase().includes(term) ||
          item.centreMobile?.toLowerCase().includes(term)
      );
    } else {
      this.NearbyDayCareList = this.DayCaresForFilters;
    }
  }



  formatPhoneNumber(event: any) {
    const formatted = this.commonService.formatPhoneNumber(event.target.value);
    event.target.value = formatted;
    this.TOCRegistration.controls['mobile'].setValue(formatted);
  }

  formatPostalCode(event: any): void {
    const formatted = this.commonService.formatPostalCode(event.target.value);
    event.target.value = formatted;

    this.TOCRegistration.controls['pinCode'].setValue(formatted, {
      emitEvent: false,
    });
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
