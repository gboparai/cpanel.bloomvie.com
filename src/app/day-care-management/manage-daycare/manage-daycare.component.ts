import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { CommonService } from '../../common-component/common.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as flatpickr from 'flatpickr';

import { FlatpickrModule } from 'angularx-flatpickr';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { promises } from 'dns';
import { ManageDaycareService } from './manage-daycare.service';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { ProfileService } from '../../common-component/profile/profile.service';

import { isatty } from 'tty';
declare const $: any;
@Component({
  selector: 'app-manage-daycare',
  standalone: true,
  imports: [
    NgSelectModule,
    NgSelectModule,
    FlatpickrModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './manage-daycare.component.html',
  styleUrl: './manage-daycare.component.css',
  providers: [DatePipe],
})
export class ManageDaycareComponent implements OnInit, AfterViewInit {
  public form: any;
  public adminForm: any;
  case: string = '';
  public readFiles: { centreLogo: any; profile: any; document: any } = {
    centreLogo: 'assets/img/image-sel.png',
    profile: 'assets/img/image-selector-profile.jpg',
    document: 'assets/img/image-selector3.jpg',
  };
  private files: { centreLogo: any; profile: any; document: any } = {
    centreLogo: null,
    profile: null,
    document: null,
  };
  public filesErrors: { centreLogo: any; profile: any; document: any } = {
    centreLogo: null,
    profile: null,
    document: null,
  };
  public dayCareID: number = 0;
  public loginUserID: number = 0;
  public baseURL: string = environment.apiUrl.slice(0, -3);
  UserIdBYFrontend: any;
  daycare: any;
  UserRoleID: any;
  UserId: any;
  Userdata: any;
  countries: any[] = [];
  selectedCountry: any;
  dropdownOpen = false;

  constructor(
    private commonservice: CommonService,
    private spinner: NgxSpinnerService,
    private profileService: ProfileService,
    private fb: FormBuilder,
    private managedaycareservice: ManageDaycareService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private cookie: CookieService,
    public onBoardingService: OnboardingService
  ) {
    this.form = fb.group({
      id: [0],
      centreName: [null, [Validators.required]],
      address: [null, [Validators.required]],
      filePath: [null],
      fileName: [null],
      documentPath: [null],
      documentName: [null],
      country: [null, [Validators.required]],
      state: [null, [Validators.required]],
      city: [null, [Validators.required]],
      loginUserID: [null],
      adminInformation: [null],
      description: [null, [Validators.required]],
      pinCode: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(\d{5}(-\d{4})?|[A-Z]\d[A-Z] \d[A-Z]\d)$/),
        ],
      ],
    });

    this.adminForm = fb.group({
      id: [0],
      userRoleID: [3],
      firstName: [null, [Validators.required]],
      country: [null, [Validators.required]],
      state: [null, [Validators.required]],
      city: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      dob: [null, [Validators.required]],
      address: [null, [Validators.required]],
      mobile: [
        null,
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(14),
        ],
      ],
      filePath: [null],
      fileName: [null],
      pinCode: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(\d{5}(-\d{4})?|[A-Z]\d[A-Z] \d[A-Z]\d)$/),
        ],
      ],
      DocumentTypeID: [4],
    });
  }

  ngOnInit(): void {
    this.countries = this.commonservice.getCountriesFlag();
    this.selectedCountry = this.commonservice.getDefaultCountryFlag(1);
    this.patchLoginLoginUserID();
    if (this.cookie.get('UserRoleId') != '1') {
      this.UserId = parseInt(this.cookie.get('UserId'), 10);
    }
    if (this.UserId != null) {
      this.getDayCareByCentreAdminID();
    } else {
      console.error('Invalid UserId: Unable to convert to a number.');
    }

    if (!this.UserId) {
      const enc_id = this.route.snapshot.queryParamMap.get('enc_id');
      this.case = this.route.snapshot.queryParamMap.get('enc_edit_dcc')
        ? 'update'
        : 'add';
      const centreAdminID =
        this.route.snapshot.queryParamMap.get('centreAdminID');
      if (enc_id) {
        const decryptedId = this.commonservice.decrypt(enc_id);
        this.dayCareID =
          decryptedId && !isNaN(Number(decryptedId))
            ? parseInt(decryptedId, 10)
            : 0;

        const userId =
          centreAdminID && this.commonservice.decrypt(centreAdminID);
        this.UserId =
          userId && !isNaN(Number(userId)) ? parseInt(userId, 10) : 0;

        // this.getDaycareCenterInfo();
        this.getDayCareByCentreAdminID();
        // alert(this.centreID)
      }
    }

    // this.UserIdBYFrontend = this.cookie.get('UserId');
    this.UserIdBYFrontend = this.UserId;
    if (this.UserIdBYFrontend > 0) {
      this.getUserDetailByUserID();
    }
  }

  ngAfterViewInit(): void {
    const today = new Date();
    const maxDate = today;

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100); // Optional: limit past 100 years

    const latestEligibleDob = new Date();
    latestEligibleDob.setFullYear(latestEligibleDob.getFullYear() - 18);

    (document.getElementById('dob') as any).flatpickr({
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: minDate,
      maxDate: latestEligibleDob,
    });
  }

  get centreFormControls() {
    return this.form.controls;
  }
  get adminFormControls() {
    return this.adminForm.controls;
  }

  formatPhoneNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    let formattedNumber = '';

    if (input.length > 0) {
      formattedNumber = input.substring(0, 3);
    }
    if (input.length > 3) {
      formattedNumber += ' ' + input.substring(3, 6);
    }
    if (input.length > 6) {
      formattedNumber += ' ' + input.substring(6, 10);
    }

    event.target.value = formattedNumber.trim();
    this.adminForm.controls['mobile'].setValue(formattedNumber);
  }

  getUserDetailByUserID() {
    this.UserRoleID = this.cookie.get('userRoleID');
    this.profileService
      .GetUserById(this.UserIdBYFrontend, this.UserRoleID)
      .subscribe((data) => {
        if (data.message == 'Success') {
          this.Userdata = data.result;
          this.adminForm.patchValue({
            id: this.Userdata.id,
            firstName:
              this.Userdata.firstName +
              (this.Userdata.middleName ? ' ' + this.Userdata.middleName : '') +
              (this.Userdata.lastName ? ' ' + this.Userdata.lastName : ''),
            email: this.Userdata.email,
          });
          this.adminFormControls.firstName.disable();
          this.adminFormControls.email.disable();
        } else {
          this.adminFormControls.firstName.enable();
          this.adminFormControls.email.enable();
        }
      });
  }

  getDayCareByCentreAdminID(): void {
    if (!this.UserId) {
      console.error('UserId is required to fetch daycare details.');
      return;
    }
    this.managedaycareservice.getDayCareByCentreAdminID(this.UserId).subscribe(
      (response: any) => {
        if (response && response.message === 'OK') {
          this.readFiles.centreLogo = response.result[0].centreLogos3
            ? this.commonservice.convertS3File(response.result[0].centreLogos3)
            : this.readFiles.centreLogo;

          this.readFiles.profile = response.result[0].adminProfileS3
            ? this.commonservice.convertS3File(
              response.result[0].adminProfileS3
            )
            : this.readFiles.profile;

          if (
            response.result[0].documentPath !== null &&
            response.result[0].documentName !== null
          ) {
            this.readFiles.document = 'assets/img/pdf-logo.png';
          }
          this.daycare = response.result[0];

          if (this.daycare) {
            // Patch the form with the daycare details
            this.form.patchValue({
              id: this.daycare.id || null,
              centreName: this.daycare.centreName || null,
              address: this.daycare.centreAddress || null,
              country: this.daycare.centreCountry || null,
              state: this.daycare.centreState || null,
              city: this.daycare.centreCity || null,
              description: this.daycare.centreDescription || null,
              pinCode: this.daycare.centrePinCode || null,
              filePath: this.daycare.centerLogoPath || null,
              fileName: this.daycare.centerLogo || null,
              documentPath: this.daycare.documentPath || null,
              documentName: this.daycare.documentName || null,
            });

            this.adminForm.patchValue({
              firstName: this.daycare.firstName || null,
              email: this.daycare.email || null,
              mobile: this.daycare.mobile || null,
              address: this.daycare.address || null,
              country: this.daycare.country || null,
              state: this.daycare.state || null,
              city: this.daycare.city || null,
              pinCode: this.daycare.pinCode || null,
              dob: this.daycare.dob
                ? this.datePipe.transform(this.daycare.dob, 'MM-dd-YYYY')
                : null,
              filePath: this.daycare.adminProfilePath || null,
              fileName: this.daycare.adminProfile || null,
            });

            if (this.daycare.country == 'Canada') {
              this.selectedCountry =
                this.commonservice.getDefaultCountryFlag(1);
            } else {
              this.selectedCountry =
                this.commonservice.getDefaultCountryFlag(0);
            }
          } else {
            console.warn('No daycare details found in the response.');
          }
        } else {
          console.warn('Unexpected response or status:', response);
        }
      },
      (error: any) => {
        console.error('Error fetching daycare details:', error);
      }
    );
  }

  patchLoginLoginUserID() {
    if (this.cookie.check('UserId')) {
      this.loginUserID = parseInt(this.cookie.get('UserId'));
      this.form.get('loginUserID').setValue(this.loginUserID);
    }
  }

  get isValidForm(): boolean {
    return (
      this.form.valid &&
      this.adminForm.valid &&
      this.readFiles.centreLogo != null &&
      this.readFiles.document != null &&
      this.readFiles.profile != null
    );
  }

  async onFileChange(IsCenter: boolean, event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Only JPEG, PNG, and GIF are allowed.',
      });
      return;
    }

    const fileContent = await this.readFileAsync(file);
    if (fileContent) {
      if (IsCenter) {
        this.readFiles.centreLogo = fileContent;
        this.files.centreLogo = file;
        this.filesErrors.centreLogo = null;
      } else {
        this.readFiles.profile = fileContent;
        this.files.profile = file;
        this.filesErrors.profile = null;
      }
    }
  }

  async onSelectDocument(event: any) {
    const document: File = event.target.files[0];
    if (!document) return;
    if (document.type !== 'application/pdf') {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please upload a valid PDF file.',
      });
      return;
    }
    this.readFiles.document = 'assets/img/pdf-logo.png';
    this.files.document = document;
  }

  private readFileAsync(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const filereader = new FileReader();
      filereader.onload = (data: any) => {
        resolve(data.target?.result);
      };
      filereader.onerror = (error) => {
        reject(error);
      };
      filereader.readAsDataURL(file);
    });
  }

  // onChangeAddress(value: string) {
  //   this.adminForm.get('address').setValue(value);
  // }

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

  validateForms(): boolean {
    if (
      this.form.invalid ||
      this.adminForm.invalid ||
      ((!this.files.centreLogo || !this.files.profile) &&
        this.form.get('id').value < 1)
    ) {
      this.form.markAllAsTouched();
      this.adminForm.markAllAsTouched();
      if (
        (!this.files.centreLogo ||
          !this.files.profile ||
          !this.files.document) &&
        this.form.get('id').value < 1
      ) {
        if (!this.files.centreLogo)
          this.filesErrors.centreLogo = 'This field is required.';
        if (!this.files.profile)
          this.filesErrors.profile = 'This field is required.';
      }
      return false;
    }
    this.filesErrors.centreLogo = null;
    this.filesErrors.profile = null;

    return true;
  }

  async manageCentre() {
    if (this.validateForms()) {
      this.spinner.show();
      // Manage Files
      if (this.files.centreLogo || this.files.profile || this.files.document) {
        const formData = new FormData();
        if (this.files.centreLogo) {
          formData.append('files', this.files.centreLogo);
          formData.append('type', 'Logos');
        }
        if (this.files.profile) {
          formData.append('files', this.files.profile);
          formData.append('type', 'Profile_Image');
        }
        if (this.files.document) {
          formData.append('files', this.files.document);
          formData.append('type', 'Centre_Documents');
        }
        const fileResponse = await this.UploadFiles(formData);
        if (fileResponse.message === 'OK') {
          fileResponse.result.map((item: any) => {
            if (item.type === 'Logos') {
              this.form.get('filePath').setValue(item.path);
              this.form.get('fileName').setValue(item.imageName);
            } else if (item.type === 'Profile_Image') {
              this.adminForm.get('filePath').setValue(item.path);
              this.adminForm.get('fileName').setValue(item.imageName);
            } else {
              this.form.get('documentPath').setValue(item.path);
              this.form.get('documentName').setValue(item.imageName);
            }
          });

          this.callManageDCCApi();
        }
      } else {
        this.spinner.hide();
        this.callManageDCCApi();
      }
    }
  }

  callManageDCCApi() {
    const dateString = this.adminForm.get('dob').value;
    const [day, month, year] = dateString.split('/');
    const parsedDate = new Date(`${year}-${month}-${day}`);
    const formattedDate = this.datePipe.transform(parsedDate, 'yyyy-MM-dd');
    // this.getUserDetailByUserID();
    const JsonData = this.form.value;
    const JsonAdminInfo = this.adminForm.value;
    JsonAdminInfo['dob'] = formattedDate;
    JsonData['adminInformation'] = JsonAdminInfo;
    this.managedaycareservice.manageDayCare(JsonData).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.commonservice.updateHeaderImage();
          this.commonservice.updateTriggerLogoSignal();
          const { centreId, onBoardingLink, connectedAccountId, isOnboarded } =
            response.result;
          if (onBoardingLink.length && connectedAccountId && !isOnboarded) {
            this.onBoardingService.connectedAccountId.set(connectedAccountId);
            this.onBoardingService.isOnboardedAccount.set(isOnboarded);
            this.onBoardingService.stripeOnboardingUrl.set(onBoardingLink);
          }
          this.dayCareID = centreId;
          this.form.get('id').setValue(centreId);

          // for onboarding process
          if (this.onBoardingService.isOnboarding) {
            // const enc_id = this.commonservice.encrypt(centreId.toString());
            // this.router.navigate(['/onboarding'], {
            //   queryParams: { enc_id: enc_id },
            // });
            if (!this.onBoardingService.onBoardingData.isCompleteStep1) {
              this.onBoardingService.onBoardingData.isCompleteStep1 = true;
              this.onBoardingService.handleNext('Tab-1');
            } else {
              this.toastr.success(response.activity);
              this.onBoardingService.getCurrentTab();
            }
          } else {
            this.toastr.success(response.activity);
            this.router.navigate(['/view-daycare']);
          }
        } else {
          this.toastr.warning(response.message);
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

  async UploadFiles(data: any): Promise<any> {
    this.spinner.show();
    try {
      const response = await this.commonservice.uploadImages(data).toPromise();
      return response;
    } catch (error) {
      this.spinner.hide();
      throw error;
    }
  }

  formatPostalCode(event: any, pincode: any): void {
    const formatted = this.commonservice.formatPostalCode(event.target.value);
    event.target.value = formatted;

    if (pincode == 'centre') {
      this.form.controls['pinCode'].setValue(formatted, {
        emitEvent: false,
      });
    } else {
      this.adminForm.controls['pinCode'].setValue(formatted, {
        emitEvent: false,
      });
    }
  }

  fetchLocationData(postalCode: string, isAdmin: boolean) {
    if (!postalCode) return;

    postalCode = postalCode.trim().toUpperCase();

    const caPattern = /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/; // Canadian postal code pattern
    const usPattern = /^\d{5}$/; // US ZIP code pattern

    let countryCode = '';
    let apiPostalCode = '';

    if (caPattern.test(postalCode)) {
      countryCode = 'ca';
      apiPostalCode = postalCode.split(' ')[0]; // Use first 3 characters
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
      const targetForm = isAdmin ? this.adminForm : this.form;

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

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectCountry(country: any) {
    this.selectedCountry = country;
    this.dropdownOpen = true;
  }
}
