import { Component, Output, EventEmitter, NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import flatpickr from 'flatpickr';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DcAppointmentsListService } from '../../bloomvie-management/dc-appointments-list/dc-appointments-list.service';
import { DaycareManualAppointmentService } from '../../bloomvie-management/dc-appointments-list/daycare-manual-appointment/daycare-manual-appointment.service';
import { AssignUserPermissionService } from '../../settings/Permission/assign-user-permission/assign-user-permission.service';
import { TimeFormatPipe } from '../../bloomvie-management/dc-appointments-list/time-format.pipe';
import { PRIMARY_OUTLET } from '@angular/router';
import { ApplicationServiceService } from '../../application-status/application-service.service';
import * as CryptoJS from 'crypto-js';
import { NgxPaginationModule } from 'ngx-pagination';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { CommonService } from '../../common-component/common.service';

declare var $: any;

@Component({
  selector: 'app-daycare-manual-appointment',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    CommonModule,
    TimeFormatPipe,
    BreadcrumbComponent,
    NgxPaginationModule,
  ],
  templateUrl: './registered-to-new-daycare.component.html',
  styleUrl: './registered-to-new-daycare.component.css',
})
export class RegisteredToNewDaycareComponent {
  public addAppointmentForm: any;
  AllCenterTypes: any;
  UserID: any;
  UserRoleID: any;
  IncorrectMobileNumberFormat: boolean = false;
  selectedCounsellorControl = new FormControl(null);
  SlotTimeListDropdownControl = new FormControl(null);
  ContentsizePendingList: number = 5;
  ContentPendingList: number = 1;

  primaryDayCarelist: any[] = [];
  public enrollmentCapacity = [
    { id: 1, name: '1-9' },
    { id: 2, name: '10-19' },
    { id: 3, name: '20-50' },
    { id: 4, name: '50+' },
    { id: 5, name: 'More' },
  ];

  getPlansForDayCareList: any;
  planInformation: any;
  userRoleId: any;
  type: any;
  planDescriptionDetails: any;
  PlanID: any;
  daycareID: any;
  primaryDayCare: any;
  newEmail: any;

  constructor(
    private applicationService: ApplicationServiceService,
    private dccService: ApplicationServiceService,
    private fb: FormBuilder,
    private dcService: DcAppointmentsListService,
    private toastr: ToastrService,
    private service: DaycareManualAppointmentService,
    private cookie: CookieService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService
  ) {
    this.addAppointmentForm = this.fb.group({
      id: 0,
      centreEmail: ['', [Validators.required, Validators.email]],
      enrollmentCapacity: ['', Validators.required],
      centreName: ['', Validators.required],
      centreMobile: [
        '',
        [Validators.required, Validators.pattern(/^\d{3} \d{3} \d{4}$/)],
      ],
      name: ['', Validators.required],
      country: [{ value: '', disabled: true }],
      state: [{ value: '', disabled: true }],
      city: [{ value: '', disabled: true }],
      pinCode: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(\d{5}(-\d{4})?|[A-Z]\d[A-Z] \d[A-Z]\d)$/),
        ],
      ],
      DaycareTypeID: [null, Validators.required],
      plan: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.UserID = parseInt(this.cookie.get('UserId'), 10);
    this.UserRoleID = parseInt(this.cookie.get('UserRoleId'));
    this.daycareID = parseInt(this.cookie.get('CentreID'));
    this.getAllCentreTypes();

    this.getPlansForDaycare();
    this.getPrimaryDayCareList();
  }

  getAllCentreTypes() {
    this.service.getAllCentreTypes().subscribe(
      (data) => {
        if (data.message === 'OK') {
          this.AllCenterTypes = data.result;
        }
      },
      (error) => { }
    );
  }

  getPlanId(event: any) {
    this.PlanID = event.id;

    this.applicationService
      .getSubscriptionPlansByID(event.id)
      .subscribe((res: any) => {
        if (res.message == 'Success') {
          this.planDescriptionDetails = res.result;
        }
      });
  }

  getPlansForDaycare() {
    this.userRoleId = 6;
    this.applicationService
      .getPlansForDaycare(this.userRoleId)
      .subscribe((data) => {
        if (data.message === 'OK') {
          this.getPlansForDayCareList = data.result.filter(
            (item: any) => !item.isDefault
          );
        } else {

        }
      });
  }

  async getPrimaryDayCareList() {
    var type = 'registeredNewDaycare';

    this.applicationService
      .getPrimaryDayCareList(this.daycareID, type)
      .subscribe((data) => {
        if (data.message === 'OK' && data.result) {
          this.primaryDayCarelist = data.result;
        } else {
          console.warn('Data not found.');
        }
      });
  }

  async onSubmit() {
    if (!this.addAppointmentForm.valid) {
      this.addAppointmentForm.markAllAsTouched();
      return;
    }
    this.spinner.show();
    const formValue = this.addAppointmentForm.getRawValue();
    this.dccService
      .primaryDaycareCentreRegistration(formValue, this.daycareID)
      .subscribe({
        next: (data) => {

          if (data.message === 'Success') {
            this.toastr.success(data.message);
            this.addAppointmentForm.reset({ id: 0 });
            this.getPrimaryDayCare(formValue.centreEmail);
            this.sendMailPrimaryDaycareCentre(
              data.result,
              formValue.centreEmail
            );
          } else {
            this.toastr.warning(data.message);
          }
        },
        error: (err) => {
          const errorMessage =
            err?.error?.message ||
            'An error occurred while submitting the form.';
          this.toastr.error(errorMessage);
        },
        complete: () => this.spinner.hide(),
      });
  }

  getPrimaryDayCare(email: string) {
    if (!email) {
      console.error('No email provided to getPrimaryDayCare');
      return;
    }

    this.applicationService.getPrimaryDayCareID(email).subscribe((data) => {
      if (data.message === 'OK' && data.result) {
        this.primaryDayCare = data.result;
        this.getPrimaryDayCareList();
      } else {
        console.warn('No daycare found for the provided email.');
      }
    });
  }

  sendMailPrimaryDaycareCentre(createdDaycareId: number, email: string) {
    const secretKey = 'encrypt135790';
    const dayCareUserEncryptID = CryptoJS.AES.encrypt(
      String(createdDaycareId),
      secretKey
    )
      .toString()
      .replace(/\+/g, '%2B');

    const planEncryptID = CryptoJS.AES.encrypt(String(this.PlanID), secretKey)
      .toString()
      .replace(/\+/g, '%2B');

    const DayCareType = 'PrimaryDayCare';
    this.applicationService
      .sendMailPrimaryDaycareCentre(
        planEncryptID,
        dayCareUserEncryptID,
        email,
        DayCareType
      )
      .subscribe((data) => {
        if (data.message === 'OK') {

        } else {

        }
      });
  }

  ResetForm() {
    this.addAppointmentForm.reset();
    this.addAppointmentForm.markAsUntouched();
  }


  CheckInterestedEmailExist() {
    var Email = this.addAppointmentForm.value.email;
    this.dcService.CheckInterestedEmailExist(Email).subscribe((data) => {
      if (data.message != 'Ok') {
        this.toastr.warning(data.message);
        this.addAppointmentForm.get('email').reset();
      }
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
      const targetForm = this.addAppointmentForm;

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

  onEnterMobileNumber(event: any) {
    const mobileNumber = event.target.value;
    let correctedMobileNum = mobileNumber.trim();
    if (correctedMobileNum.length > 12) {
      this.IncorrectMobileNumberFormat = true;
    } else {
      this.IncorrectMobileNumberFormat = false;
    }
  }


  formatPhoneNumber(event: any) {
    const formatted = this.commonService.formatPhoneNumber(event.target.value);
    event.target.value = formatted;
    this.addAppointmentForm.controls['mobile'].setValue(formatted);
  }

  formatPostalCode(event: any): void {
    const formatted = this.commonService.formatPostalCode(event.target.value);
    event.target.value = formatted;

    this.addAppointmentForm.controls['pinCode'].setValue(formatted, {
      emitEvent: false,
    });
  }

  onBlurMobileNumber(event: any) {
    // const mobileNumber = event.target.value;
    // let correctedMobileNum = mobileNumber.trim();
    // if(correctedMobileNum.length === 10 && /^[0-9]+$/.test(correctedMobileNum)){
    //   // add space on 4th character or 3rd index
    // correctedMobileNum = correctedMobileNum.slice(0, 3) + ' ' + correctedMobileNum.slice(3, 6) + ' ' + correctedMobileNum.slice(6);
    //   // add space on 8th character or 7th index
    //   this.IncorrectMobileNumberFormat = false;
    // }
    // else{
    //   //this.IncorrectMobileNumberFormat = true;
    //   event.target.value = correctedMobileNum.trim();
    // }
    // event.target.value = correctedMobileNum;
  }
}
