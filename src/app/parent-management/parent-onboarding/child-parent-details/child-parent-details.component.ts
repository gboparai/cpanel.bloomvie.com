import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, effect } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, Validators } from '@angular/forms';
import { ChildParentService } from './child-parent.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from '../../../common-component/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
declare var $: any;
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../environments/environment';
import { HeaderServiceService } from '../../../layout/header/header-service.service';

interface Option {
  value: string;
  label: string;
}

interface Field {
  label: string;
  controlType: string;
  dropdownItems?: Option[];
  checkBoxItems?: Option[];
  radioItems?: Option[];
}

interface ApiResponse {
  message: string;
  result: Field[]; // Update this type according to the expected structure
  activity?: object; // Adjust if needed
  count?: number; // Adjust if needed
  token?: string; // Adjust if needed
}

@Component({
  selector: 'app-child-parent-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './child-parent-details.component.html',
  styleUrl: './child-parent-details.component.css',
})
export class ChildParentDetailsComponent {
  @Output() Update: EventEmitter<any> = new EventEmitter<any>();
  parentForm: FormGroup;
  studentForm: FormGroup;
  onBoarding: FormGroup;
  centreID: number = 0;
  loginUser: number = 0;
  centre: any;
  login: any;
  ageGroupList: any[] = [];
  ageGroup: any[] = [];
  profile: any;
  imageUrl: any;
  files: any;
  data: any;
  readFiles: any;
  selectedFile: any;
  public countryList: any[] = [];
  public stateList: any[] = [];
  public cityList: any[] = [];
  firstName: any;
  lastName: any;
  ParentEmail: any;
  pincodeValue: any;
  filteredAgeGroup: any[] = [];
  pincode: string | number | string[] | undefined;
  http: any;
  isLoading:boolean = true;
  email: any;
  myControlForm: FormGroup;
  LabelAndControlForm: FormGroup;
  readonly ImageRootURL = environment.apiUrl.slice(0, -3);
  ControlsSubmitForm: FormGroup;
  fields: any[] = [];
  parentChildDetail: any;
  ParentName: any;
  selectedStudentID: any;
  orderNumber: string = '';
  userRoleID: number = 0;
  countries: any[] = [];
  selectedCountry: any;
  dropdownOpen = false;
  constructor(    
    private toastr: ToastrService,
    private cookie: CookieService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private ChildParentService: ChildParentService,
    private commonService: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private headerservice: HeaderServiceService
  ) {  

    this.parentForm = this.fb.group({
      id: [0],
      studentID: [0],
      userRoleID: [5],
      firstName: ['', Validators.required],
      lastName: [''],
      address: ['', [Validators.required]],
      mobile: [
        '',
        [Validators.required, Validators.pattern(/^\d{3} \d{3} \d{4}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      country: [''],
      state: [''],
      city: [''],
      pinCode: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]\d[A-Z] \d[A-Z]\d$/)],
      ],

      relation: ['', Validators.required],
      loginUserID: [0],
    });

    this.studentForm = this.fb.group({
      firstName: ['', Validators.required],
      // sahib added on 06/11/2024
      lastName: [''],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      parentID: [0, Validators.required],
      centreID: [0, Validators.required],
      classID: [0, Validators.required],
      ageGroupID: [, Validators.required],
      profilePhoto: ['', Validators.required],
      profilePath: [''],
    });

    this.onBoarding = this.fb.group({
      userID: [0],
      userRoleID: [5],
      completedTab: [0],
      totalTab: [2],
    });

    this.ControlsSubmitForm = this.fb.group({
      labelName: [],
      ControlsDropdown: [''],
    });

    this.myControlForm = this.fb.group({
      dynamicFields: this.fb.array([]),
    });
    this.LabelAndControlForm = this.fb.group({
      LabelName: ['', [Validators.required]],
      ControlType: ['', [Validators.required]],
      Values: ['', []],
    });

    effect(() => {
      this.headerservice.switchProfile();
      this.getStudentParentDetailsByParentID();
    });
  }

  // ngAfterViewInit() {
  //    setTimeout(() => {
  //       this.spinner.hide();
  //     }, 10000);
  // }


  async ngOnInit() {
     this.isLoading=true;
    this.countries = this.commonService.getCountriesFlag();
    this.selectedCountry = this.commonService.getDefaultCountryFlag(1);
    this.centre = parseInt(this.cookie.get('CentreID'));
    this.userRoleID = parseInt(this.cookie.get('UserRoleId'));
    if (this.userRoleID == 4) {
      this.login = parseInt(this.cookie.get('ParentID'));
    } else {
      this.login = parseInt(this.cookie.get('UserId'));
    }
    this.email = this.cookie.get('email');
    if (this.email) {
      this.parentForm.patchValue({ email: this.email });
    }
    const UserInfo = this.cookie.get('UserInfo');
    if (UserInfo) {
      const parsedInfo = JSON.parse(UserInfo);
      this.ParentEmail = parsedInfo.result.email;
      this.ParentName = parsedInfo.result.firstName;
      if (!this.centre) {
        this.centre = parsedInfo.result.centreID;
      }
    }
    this.parentForm.patchValue({
      email: this.ParentEmail,
      firstName: this.ParentName,
    });

    // this.spinner.show();
    try {
      await this.List();
      await this.getStudentParentDetailsByParentID();
    } catch (err) {
      
    } finally {     
    this.isLoading=false;
    }

    // this.getCountries();

    // sahib added on 14/10/2024
    //this.fetchFieldsFromBackend();
    //this.GetControlAndLabelForm();

    // Arsh

    let isUpdate: string = this.cookie.get('Update');
    // alert(isUpdate);
    // if (isUpdate == 'true') {

    // }

    const fieldTypeSelect = document.getElementById(
      'field-type'
    ) as HTMLSelectElement;
    const OptionsInput = document.getElementById(
      'options-input'
    ) as HTMLElement;
    const inputFieldContainer = document.getElementById(
      'input-field-container'
    ) as HTMLElement;

    if (fieldTypeSelect && OptionsInput && inputFieldContainer) {
      fieldTypeSelect.addEventListener('change', () => {
        // Clear previous input fields
        inputFieldContainer.innerHTML = '';

        // Display dropdown options if 'dropdown' is selected
        if (
          fieldTypeSelect.value === 'select' ||
          fieldTypeSelect.value === 'checkbox' ||
          fieldTypeSelect.value === 'radio'
        ) {
          OptionsInput.style.display = 'block';
        } else {
          OptionsInput.style.display = 'none';

          // Handle the creation of different input types
          if (
            fieldTypeSelect.value === 'radio' ||
            fieldTypeSelect.value === 'checkbox'
          ) {
            this.createMultipleInputs(
              fieldTypeSelect.value,
              inputFieldContainer
            );
          } else {
            // Create a single input field based on the selected type
            // const inputField = document.createElement('input');
            // inputField.type = fieldTypeSelect.value; // text, number, email, date, etc.
            // inputField.name = 'dynamic-input';
            // inputField.placeholder = `Enter ${fieldTypeSelect.value}...`;
            // inputField.classList.add('form-control');
            // // Append to input field container
            // inputFieldContainer.appendChild(inputField);
          }
        }
      });
    }

    const currentDate = new Date();
    // added on 06/11/2024
    flatpickr('#dobDatePicker', {
      dateFormat: 'd/m/Y',
      allowInput: true,
      maxDate: 'today',
    });
  }

  calculateAge(dob: Date): number {
    const today = new Date();

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      months--;
    }

    const totalMonths = years * 12 + months;

    return totalMonths < 0 ? 0 : totalMonths;
  }

  onDobChange(dobValue: any): void {
    if (dobValue) {
      let dob = typeof dobValue === 'string' ? dobValue : dobValue.target.value;

      // Convert "25/03/2023" → "2023-03-25"
      let formattedDob = '';
      if (dob.includes('/')) {
        const [day, month, year] = dob.split('/');
        formattedDob = `${year}-${month}-${day}`;
      } else {
        let date = new Date(dob);
        formattedDob = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;
      }

      const dateObj = new Date(formattedDob);

      // const dateObj = this.formatDate(dobValue);

      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date:', formattedDob);
      } else {
        const age = this.calculateAge(dateObj);
        this.filterAgeGroups(age);
      }
    }
  }

  filterAgeGroups(age: number) {
    // this.spinner.show();
    // let ageInMonth = age * 12;

    // this.filteredAgeGroup = this.ageGroupList.filter(
    //   (group: {
    //     minAge: number;
    //     maxAge: number;
    //     label: string;
    //     value: number;
    //   }) => {
    //     return ageInMonth >= group.minAge && ageInMonth <= group.maxAge;
    //   }
    // );

    this.filteredAgeGroup = this.ageGroupList.filter((group: any) => {
      if (group.isMonthly) {
        return age >= group.minAge && age <= group.maxAge;
      } else {
        const minAgeInMonth = this.convertYearsToMonths(group.minAge);
        const maxAgeInMonth = this.convertYearsToMonths(group.maxAge);

        return age >= minAgeInMonth && age <= maxAgeInMonth;
      }
    });

    if (this.filteredAgeGroup.length > 0) {
      this.ageGroup = this.filteredAgeGroup.map(
        (item: {
          id: any;
          minAge: any;
          maxAge: any;
          ageGroupTitle: any;
          isMonthly: boolean;
          label: string;
        }) => ({
          value: item.id,
          // label: `(${item.minAge} - ${item.maxAge}) Months`,
          //Added on 25/04/25
          label: item.label,
        })
      );

      // if(this.ageGroup.length > 0){
      //   this.spinner.hide();
      // }

    } else {
      this.studentForm.patchValue({
        ageGroupID: null,
      });
    }
  }

  convertYearToMonth(year: number): number {
    return year * 12;
  }

  convertMonthToYear(month: number): number {
    return parseFloat((month / 12).toFixed(1));
  }

  async onSubmit() {
    if (this.parentForm.valid && this.studentForm.valid) {
      try {
        this.spinner.show();
        const jsonData = this.parentForm.value;

        if (this.userRoleID != 4) {
          jsonData['loginUserID'] = this.login;
          jsonData['userRoleID'] = 5;
        } else {
          jsonData['loginUserID'] = this.cookie.get('UserId');
          jsonData['userRoleID'] = 4;
        }

        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('files', this.selectedFile);
          formData.append('type', 'Profile_Image');

          const fileResponse = await this.UploadFiles(formData);

          if (fileResponse?.message === 'OK') {
            this.studentForm.patchValue({
              profilePath: fileResponse.result[0].path,
              profilePhoto: fileResponse.result[0].imageName,
            });
          }
        }

        this.studentForm.patchValue({
          centreID: this.centre,
        });

        // jsonData['loginUserID'] = this.login;
        jsonData['centreID'] = this.centreID;

        // sahib added on 06/11/2024
        const dobParts = this.studentForm.value.dob.split('/');
        const [day, month, year] = dobParts;
        const manipulatedDob = `${year}-${month.padStart(
          2,
          '0'
        )}-${day.padStart(2, '0')}`;

        const manipulatedDob2 = `${day.padStart(2, '0')}/${month.padStart(
          2,
          '0'
        )}/${year}`;
        this.studentForm.patchValue({
          dob: manipulatedDob,
        });

        jsonData['child'] = this.studentForm.value;
        this.orderNumber = this.cookie.get('orderNumber');
        jsonData['orderNumber'] = this.orderNumber;

        this.ChildParentService.manageDetail(jsonData).subscribe({
          next: (data) => {
            if (data.message === 'Success') {
              setTimeout(() => {
                this.spinner.hide();
              }, 100);
              this.toastr.success(data.activity);
              // this.resetFormAndNavigate(data.result.studentID);
              this.studentForm.patchValue({
                dob: manipulatedDob2,
              });
              this.resetFormAndNavigate(data.result);

              // to change the color of next step tab

              this.Update.emit();
            } else {
              this.spinner.hide();
              this.toastr.warning(data.message);
              this.studentForm.patchValue({
                dob: manipulatedDob2,
              });
            }
          },
          error: (error) => {
            this.spinner.hide();
            this.toastr.error('Error registering');
            console.error('Error during submission:', error);
            this.studentForm.patchValue({
              dob: manipulatedDob2,
            });
          },
          complete: () => {
            this.spinner.hide();
          },
        });
      } catch (error) {
        this.spinner.hide();
        console.error('Submission error:', error);
        this.spinner.hide();
      }
    } else {
      this.parentForm.markAllAsTouched();
      this.studentForm.markAllAsTouched();
    }
  }

  resetFormAndNavigate(result: any) {
    const secretKey = 'encrypt001100!?';

    const encryptedStudentID = CryptoJS.AES.encrypt(
      result.studentID.toString(),
      secretKey
    ).toString();

    const encryptedParentID = CryptoJS.AES.encrypt(
      result.parentID.toString(),
      secretKey
    ).toString();

    const parentDetailsTab = document.getElementById(
      'child-parent-basic-deatils'
    );
    const childRoutineTab = document.getElementById('child-routine');

    if (parentDetailsTab && childRoutineTab) {
      parentDetailsTab.classList.remove('active');
      childRoutineTab.classList.add('active');
    }
    this.router.navigate([], {
      queryParams: {
        studentID: encryptedStudentID,
        parentID: encryptedParentID,
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.parentChildDetail.studentProfilePhoto = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.selectedFile = file;

      this.studentForm.get('profilePhoto')?.setValue(file);
    }
  }

  cancel() {
    this.parentForm.reset();
    this.studentForm.reset();
  }

  convertMonthsToYears(months: number): number {
    if (months < 0) {
      throw new Error('Invalid input: months cannot be negative.');
    }
    return Math.floor(months / 12);
  }

  convertYearsToMonths(years: number): number {
    if (years < 0) {
      throw new Error('Invalid input: years cannot be negative.');
    }
    return years * 12;
  }

  List() {
    this.ChildParentService.GetAllAgeGroup(this.centre).subscribe((data) => {
      if (data.message === 'Success') {
        // this.ageGroupList = data.result;

        this.ageGroupList = data.result.map((item: any) => {
          if (item.isMonthly == true) {
            let minYear = this.convertMonthsToYears(item.minAge);
            let maxYear = this.convertMonthsToYears(item.maxAge);
            return {
              ...item,
              label: `${item.minAge} - ${item.maxAge} Months ( ${minYear} - ${maxYear} Years)`,
            };
          } else {
            let minMonth = this.convertYearsToMonths(item.minAge);
            let maxMonth = this.convertYearsToMonths(item.maxAge);

            return {
              ...item,
              label: `${minMonth} - ${maxMonth} Months ( ${item.minAge} - ${item.maxAge} Years)`,
            };
          }
        });

        // this.ageGroup = this.ageGroupList;
        // this.ageGroup = this.ageGroupList.map((item: { id: any; minAge: any; maxAge: any; ageGroupTitle: any }) => ({
        //   value: item.id,
        //   label: ` ${item.ageGroupTitle} ( ${item.minAge}- ${item.maxAge} ) `
        // }));
      }
    });
  }

  async UploadFiles(data: any): Promise<any> {
    try {
      const response = await this.commonService.uploadImages(data).toPromise();
      return response;
    } catch (error) {
      this.spinner.hide();
      throw error;
    }
  }

  // getCountries() {
  //   this.spinner.show();
  //   this.commonService.getCountryList().subscribe({
  //     next: (response) => {
  //       if (response.message === 'Success') {
  //         this.countryList = response.result;
  //       }
  //       setTimeout(() => {
  //         this.spinner.hide();
  //       }, 300);
  //     },
  //     error: (err) => {
  //       this.toastr.error(err.message);
  //       this.spinner.hide();
  //     },
  //   });
  // }

  onChangeCountry(countryID: number) {
    const parentForm = this.parentForm;
    parentForm.get('stateID')?.reset();
    parentForm.get('cityID')?.reset();

    this.commonService.getStateListByCountryID(countryID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.stateList = response.result;
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  onChangeState(stateID: number) {
    const parentForm = this.parentForm;
    parentForm.get('cityID')?.reset();
    this.commonService.getCitiesListByStateID(stateID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.cityList = response.result;
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
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
      return;
    }

    const url = `https://api.zippopotam.us/${countryCode}/${apiPostalCode}`;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url);

    xhr.onload = () => {
      const targetForm = this.parentForm;

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
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: '<h3>Error!</h3>',
          text: 'Unable to fetch location data. Please try again later.',
        });
      }
    };

    xhr.onerror = () => {
      Swal.fire({
        icon: 'error',
        title: '<h3>Network Error!</h3>',
        text: 'Could not connect to the location API.',
      });
    };

    xhr.send();
  }

  CheckInterestedMobileExist(event: any): void {
    //const input = event.target.value;
    // commented by sahib on 20/1/2025
    // Allow only digits, spaces, dashes, and parentheses
    //event.target.value = input.replace(/[^0-9()-\s]/g, '');

    // added by sahib on 20/1/2025 // to check if mobile number exists
    let mobile = this.parentForm.value.mobile;
    if (mobile != '') {
      this.ChildParentService.CheckInterestedMobileExist(mobile).subscribe(
        (data) => {
          if (data.message === 'mobile exists') {
            this.toastr.warning('Mobile number already exists');
            this.parentForm.get('mobile')?.reset();
          }
        }
      );
    }
  }

  clearLocationFields() {
    this.parentForm.patchValue({
      cityID: '',
      stateID: '',
      countryID: '',
    });
  }

  showWarning(message: string) {
    Swal.fire({
      icon: 'warning',
      title: '<h3>Warning!</h3>',
      text: message,
    });
  }

  // onKeyDown(event: KeyboardEvent) {
  //   if (event.key === 'Enter') {
  //     this.fetchLocationData();
  //   }
  // }

  // validateNumberInput(event: KeyboardEvent) {
  //   const charCode = event.which ? event.which : event.keyCode;
  //   if (charCode < 48 || charCode > 57) {
  //     event.preventDefault();
  //   }
  // }

  // added by sahib for testing purpose
  onSubmitControl() {
    if (this.ControlsSubmitForm.valid) {
    }
  }

  createMultipleInputs(type: string, container: HTMLElement): void {
    // Create an example input for demonstration purposes
    // const label = document.createElement('label');
    // label.textContent = `Enter options for ${type === 'radio' ? 'Radio Buttons' : 'Checkboxes'}`;
    // container.appendChild(label);
    // const optionsInput = document.createElement('input');
    // optionsInput.type = 'text';
    // optionsInput.placeholder = 'Option1, Option2, ...';
    // optionsInput.classList.add('form-control');
    // container.appendChild(optionsInput);
    // Create a button to generate the radio buttons or checkboxes
    // const generateButton = document.createElement('button');
    // generateButton.textContent = 'Generate';
    // generateButton.classList.add('btn', 'btn-primary');
    // // Add margin-top of 10px to the generate button
    // generateButton.style.marginTop = '10px';
    //container.appendChild(generateButton);
    // generateButton.addEventListener('click', () => {
    //   const options = optionsInput.value.split(',').map(option => option.trim());
    //   container.innerHTML = ''; // Clear input field
    //   options.forEach(option => {
    //     const input = document.createElement('input');
    //     input.type = type; // radio or checkbox
    //     input.name = 'dynamic-input'; // Group name for radio buttons
    //     input.style.marginRight = '5px'; // Add margin-right of 5px
    //     const optionLabel = document.createElement('label');
    //     optionLabel.textContent = option;
    //     optionLabel.style.marginRight = '5px'; // Add margin-right of 5px to label
    //     // Append the input and label to the container
    //     container.appendChild(input);
    //     container.appendChild(optionLabel);
    //   });
    // });
  }

  // sahib added on 14/10/2024
  // fetchFieldsFromBackend() {
  //
  //   const backendResponse: Field[] = [
  //     { label: 'text type label', controlType: 'text' },
  //     { label: 'number type label', controlType: 'number' },
  //     { label: 'date type label', controlType: 'date' },
  //     {
  //       label: 'dropdown type label',
  //       controlType: 'select',
  //       options: [
  //         { value: 'red', label: 'Red' },
  //         { value: 'green', label: 'Green' },
  //         { value: 'blue', label: 'Blue' }
  //       ]
  //     },
  //     {
  //       label: 'checkbox type label',
  //       controlType: 'checkbox',
  //       options: [
  //         { value: 'hello', label: 'X' },
  //         { value: 'bye', label: 'Y' },
  //         { value: 'hello bye', label: 'Z' }
  //       ]
  //     },
  //     {
  //       label: 'radio type label',
  //       controlType: 'radio',
  //       options: [
  //         { value: 'yes', label: 'Yes' },
  //         { value: 'no', label: 'No' }

  //       ]
  //     },
  //   ];
  // }

  GetControlAndLabelForm() {
    let centreID = 2;
    this.commonService.GetControlAndLabelForm(centreID).subscribe(
      (data: ApiResponse) => {
        if (data.message === 'Success' && Array.isArray(data.result)) {
          this.fields = data.result.map((item) => ({
            label: item.label,
            controlType: item.controlType,
            options:
              item.controlType === 'select'
                ? item.dropdownItems
                : item.controlType === 'checkbox'
                ? item.checkBoxItems
                : item.controlType === 'radio'
                ? item.radioItems
                : [],
          }));

          if (this.fields) {
            this.populateForm();
          }
        } else {
          console.error('Unexpected response structure:', data);
        }
      },
      (e) => {
        console.error('Error while fetching data:', e);
      }
    );
  }

  populateForm() {
    const fieldsArray = this.myControlForm.get('dynamicFields') as FormArray;

    this.fields.forEach((field) => {
      if (field.controlType === 'checkbox') {
        const checkboxGroup = this.fb.group({});
        // Populate checkbox options
        field.checkboxItems.forEach((option: any) => {
          checkboxGroup.addControl(option.value, this.fb.control(false)); // Checkbox controls
        });
        fieldsArray.push(checkboxGroup); // Add the checkbox group to the FormArray
      } else if (field.controlType === 'radio') {
        // Push a single control for radio buttons
        fieldsArray.push(this.fb.control('')); // Radio buttons are handled as a single control
      } else if (field.controlType === 'select') {
        // For select dropdowns, create a control for the selection
        fieldsArray.push(this.fb.control('')); // Push a single control for dropdowns
      } else if (field.controlType === 'datetime') {
        fieldsArray.push(this.fb.control('')); // Add control for datetime
      } else if (field.controlType === 'email') {
        fieldsArray.push(this.fb.control('')); // Add control for datetime
      } else {
        // Handle other control types (text, number, date)
        fieldsArray.push(this.fb.control('')); // Default control for text/number/date
      }
    });
  }

  onSubmitControls() {
    if (this.myControlForm.valid) {
    }
  }

  // sahib added on 14/10/2024
  onLabelAndControlSubmit() {
    // an array to hold values for dropdown or checkboxes or radios
    let Values__ = [];
    // checks if form is valid
    if (this.LabelAndControlForm.valid) {
      if (
        this.LabelAndControlForm.value.Values !== '' &&
        this.LabelAndControlForm.value.Values !== null
      ) {
        const Values_ = this.LabelAndControlForm.value.Values.split(',').map(
          (value: string) => value.trim()
        );
        Values__ = Values_;
        let model = {
          labelName: this.LabelAndControlForm.value.LabelName,
          controlType: this.LabelAndControlForm.value.ControlType,
          values: Values__,
          userId: this.cookie.get('UserId'),
          userRoleId: this.cookie.get('UserRoleId'),
          //centreId:this.cookie.get('CentreID')
          centreId: 2, // for temp basis
        };
        // api calling
        this.commonService.SubmitControlTypeAndLabelName(model).subscribe(
          (data) => {
            if (data.message === 'Control Added Successfully') {
              this.GetControlAndLabelForm();

              this.toastr.success('Control Added Successfully');
            } else {
              this.toastr.info('Control Already Exists');
            }
          },
          (e) => {
            this.toastr.info('Internal Server Error');
          }
        );

        // reset the label name input
        const labelNameInput = document.getElementById(
          'labelName'
        ) as HTMLInputElement;
        if (labelNameInput) {
          labelNameInput.value = '';
        }
        // reset the values input
        const Values = document.getElementById('options') as HTMLInputElement;
        if (Values) {
          Values.value = '';
        }
        // Reset the Values control in the form
        this.LabelAndControlForm.patchValue({ Values: '' });
      } else {
        // object to pass the values to api
        let model = {
          labelName: this.LabelAndControlForm.value.LabelName,
          controlType: this.LabelAndControlForm.value.ControlType,
          values: [],
          userId: this.cookie.get('UserId'),
          userRoleId: this.cookie.get('UserRoleId'),
          //centreId:this.cookie.get('CentreID')
          centreId: 2, // for temp basis
        };
        // api calling
        this.commonService.SubmitControlTypeAndLabelName(model).subscribe(
          (data) => {
            if (data.message === 'Control Added Successfully') {
              this.GetControlAndLabelForm();

              this.toastr.success('Control Added Successfully');
            } else {
              this.toastr.info('Control Already Exists');
            }
          },
          (e) => {
            this.toastr.info('Internal Server Error');
          }
        );
        // if the value in Values control in form is empty, reset only the label name input
        const labelNameInput = document.getElementById(
          'labelName'
        ) as HTMLInputElement;
        if (labelNameInput) {
          labelNameInput.value = '';
        }
      }
    }
  }

  //Added by Arshdeep on 06/02/25
  async getStudentParentDetailsByParentID() {
    // this.spinner.show();

    this.selectedStudentID = this.cookie.get('StudentID')
      ? parseInt(this.cookie.get('StudentID'), 10)
      : 0;

    try {
      const data =
        await this.ChildParentService.getStudentParentDetailsByParentID(
          this.login,
          this.selectedStudentID
        ).toPromise();
      if (data.message === 'Success') {
        this.parentChildDetail = data.result[0];
        this.parentChildDetail.studentProfilePhoto = this.parentChildDetail
          .studentProfilePhoto
          ? this.ConvertS3File(this.parentChildDetail.studentProfilePhoto)
          : '';

        await this.onDobChange(this.parentChildDetail.studentDOB); // wait for this to complete
        this.PatchValue();
        this.commonService.loadStep1.set(true);
      } else {
        this.parentChildDetail = [];
        // this.spinner.hide();
      }
    } catch (error) {
      console.error(error);
    }
  }

  ConvertS3File(fileName: any) {
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

  PatchValue() {
    let formattedDOB;
    if (this.parentChildDetail.studentDOB) {
      formattedDOB = this.formatDate(this.parentChildDetail.studentDOB);
    }

    const selectedAgeGroup = this.ageGroup.find(
      (group: { value: any }) =>
        group.value === this.parentChildDetail.studentAgeGroupID
    );

    this.studentForm.patchValue({
      firstName: this.parentChildDetail.studentFirstName,
      lastName: this.parentChildDetail.studentLastName,
      dob: formattedDOB,
      gender: this.parentChildDetail.studentGender,
      parentID: this.parentChildDetail.parentID,
      ageGroupID: selectedAgeGroup ? selectedAgeGroup.value : null,
      // ageGroupID: this.parentChildDetail.studentAgeGroupID,
      profilePhoto: this.parentChildDetail.profilePhoto,
      profilePath: this.parentChildDetail.profilePhotoPath,
    });
    this.parentForm.patchValue({
      id: this.parentChildDetail.parentID,
      firstName: this.parentChildDetail.parentFirstName,
      lastName: this.parentChildDetail.parentLastName,
      address: this.parentChildDetail.address,
      mobile: this.parentChildDetail.contact,
      email: this.parentChildDetail.email,
      country: this.parentChildDetail.country,
      state: this.parentChildDetail.state,
      city: this.parentChildDetail.city,
      pinCode: this.parentChildDetail.pinCode,
      relation: this.parentChildDetail.relationToChild,
      studentID: this.parentChildDetail.studentID,
    });

    if (this.parentChildDetail.country == 'Canada') {
      this.selectedCountry = this.commonService.getDefaultCountryFlag(1);
    } else {
      this.selectedCountry = this.commonService.getDefaultCountryFlag(0);
    }
    const profilePhotoControl = this.studentForm.get('profilePhoto');
    if (this.parentChildDetail.profilePhoto) {
      profilePhotoControl?.clearValidators(); // Remove validation if image is present
    } else {
      profilePhotoControl?.setValidators([Validators.required]); // Set validation if no image
    }
    profilePhotoControl?.updateValueAndValidity();
  
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectCountry(country: any) {
    this.selectedCountry = country;
    this.dropdownOpen = true;
  }
}
