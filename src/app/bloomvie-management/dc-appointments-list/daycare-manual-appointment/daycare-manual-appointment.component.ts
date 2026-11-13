import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { DcAppointmentsListService } from '../dc-appointments-list.service';
import { ToastrService } from 'ngx-toastr';
import { DaycareManualAppointmentService } from './daycare-manual-appointment.service';
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
import { NgModule, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeFormatPipe } from '../time-format.pipe';
import { AssignUserPermissionService } from '../../../settings/Permission/assign-user-permission/assign-user-permission.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../../common-component/common.service';

declare var $: any;

@Component({
  selector: 'app-daycare-manual-appointment',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgSelectModule, CommonModule, TimeFormatPipe],
  templateUrl: './daycare-manual-appointment.component.html',
  styleUrl: './daycare-manual-appointment.component.css',
})
export class DaycareManualAppointmentComponent {
  @Output() Update: EventEmitter<any> = new EventEmitter();
  @Input() isDirectMode: boolean = false;
  @Input() set directMode(value: boolean) {
    this.setDirectModeActive(value);
  }
  public isDirectModeActive: boolean = false;
  public availablePlans: any[] = [];
  public addAppointmentForm: any;
  AllCenterTypes: any;
  availableSlots: any[] = [];
  selectedDate: string = '';
  UserID: any;
  UserRoleID: any;
  selectDateFlatPicker: any;
  slotID: any;
  ActiveCounsellorsList: any[] = [];
  IncorrectMobileNumberFormat: boolean = false;
  selectedCounsellorControl = new FormControl(null);
  SlotTimeListDropdownControl = new FormControl(null);
  public enrollmentCapacity = [
    { id: 1, name: '1-9' },
    { id: 2, name: '10-19' },
    { id: 3, name: '20-50' },
    { id: 4, name: '50+' },
    { id: 5, name: 'More' },
  ];
  CounsellorId: any;
  // regionID: number = 0;
  regionResponse: any;
  countries: any[] = [];
  selectedCountry: any;
  dropdownOpen = false;


  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private dcService: DcAppointmentsListService,
    private toastr: ToastrService,
    private service: DaycareManualAppointmentService,
    private cookie: CookieService,
    private assignuserservice: AssignUserPermissionService,
    private Dcservice: DcAppointmentsListService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
    this.addAppointmentForm = this.fb.group({
      id: 0,
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      enrollmentCapacity: ['', Validators.required],
      centreName: ['', Validators.required],
      mobile: [
        '',
        [Validators.required, Validators.pattern(/^\d{3} \d{3} \d{4}$/)],
      ],

      // mobile: ["", [Validators.required, Validators.pattern('^[0-9]{10}$')]],
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
      date: ['', Validators.required],
      counsellorID: 0,
      statusID: [6],
      slotID: [0, Validators.required],
      mode: 'offline',
      link: [''],
      isCurrentAppointment: [false],
      DaycareTypeID: [null, Validators.required],
      latitude: [0],
      longitude: [0],
      planID: [null],
      isTrial: [true],
      trialDays: [14],

      //availableCount:['']
    });
    effect(() => {
      let region = this.commonService.regionResponseSignal();
      if (region.offsetString != "") {
        this.regionResponse = region;
      }
    })
    // this.regionID = this.commonService.findRegion();
  }

  ngOnInit() {
    this.countries = this.commonService.getCountriesFlag();
    this.selectedCountry = this.commonService.getDefaultCountryFlag(1);
    this.UserID = parseInt(this.cookie.get('UserId'), 10);
    this.UserRoleID = parseInt(this.cookie.get('UserRoleId'), 10);
    this.resetConsullorSelectedValue();
    this.getActiveCounsellors();
    //this.getAvailableSlots()
    this.getAllCentreTypes();

    if (this.isDirectMode) {
      this.setDirectModeActive(true);
    }
  }

  setDirectModeActive(active: boolean) {
    this.isDirectModeActive = active;
    if (active) {
      this.addAppointmentForm.get('date')?.clearValidators();
      this.addAppointmentForm.get('date')?.updateValueAndValidity();
      this.addAppointmentForm.get('slotID')?.clearValidators();
      this.addAppointmentForm.get('slotID')?.updateValueAndValidity();
      this.selectedCounsellorControl.clearValidators();
      this.selectedCounsellorControl.updateValueAndValidity();
      if (this.availablePlans.length === 0) {
        this.getSubscriptionPlans();
      }
      setTimeout(() => {
        $('#selectDateDiv').hide();
        $('#selectSlotDiv').hide();
      });
    } else {
      if (!this.addAppointmentForm.get('isCurrentAppointment')?.value) {
        this.addAppointmentForm.get('date')?.setValidators([Validators.required]);
        this.addAppointmentForm.get('date')?.updateValueAndValidity();
        this.addAppointmentForm.get('slotID')?.setValidators([Validators.required]);
        this.addAppointmentForm.get('slotID')?.updateValueAndValidity();
        setTimeout(() => {
          $('#selectDateDiv').show();
          $('#selectSlotDiv').show();
        });
      }
    }
  }

  onModeChange(isDirect: boolean) {
    this.setDirectModeActive(isDirect);
  }

  getSubscriptionPlans() {
    this.service.getPlansForDaycare(this.UserRoleID || 1).subscribe({
      next: (res) => {
        if (res && res.result) {
          this.availablePlans = res.result;
        }
      },
      error: () => {}
    });
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

  onCheckOrUncheckToHideSlotDateAndSlotsDropdown(event: any) {

    if (event.target.checked) {
      // reset the slot date input
      this.addAppointmentForm.patchValue({
        date: '',
      });

      // reset the slotime dropdown input
      this.SlotTimeListDropdownControl.reset();

      // removed the validation of date and slot time

      this.addAppointmentForm.get('date')?.setValidators(null);
      this.addAppointmentForm.get('date')?.updateValueAndValidity();
      this.addAppointmentForm.get('slotID')?.setValidators(null);
      this.addAppointmentForm.get('slotID')?.updateValueAndValidity();

      // this.addAppointmentForm.get('date')?.updateValueAndValidity(); // Re-evaluate the control's validity

      $('#selectDateDiv').hide();
      $('#selectSlotDiv').hide();
    } else {
      $('#selectDateDiv').show();
      $('#selectSlotDiv').show();
      this.addAppointmentForm.get('date')?.setValidators([Validators.required]);
      this.addAppointmentForm.get('date')?.updateValueAndValidity();
      this.addAppointmentForm
        .get('slotID')
        .setValidators([Validators.required]);
      this.addAppointmentForm.get('slotID')?.updateValueAndValidity();
    }
  }

  async onSlotSelect(event: any) {

    // const selectedSlot = (event.target as HTMLSelectElement).value;
    const selectedSlot = event;
    this.slotID = selectedSlot;
    this.addAppointmentForm.patchValue({
      slotID: this.slotID,
    });

  }

  resetConsullorSelectedValue() {
    this.selectedCounsellorControl.reset();
  }

  async onSubmit() {
    if (this.addAppointmentForm.valid) {
      this.spinner.show();
      const formValue = this.addAppointmentForm.getRawValue();

      if (this.isDirectModeActive) {
        const directPayload = {
          id: 0,
          name: formValue.name,
          email: formValue.email,
          enrollmentCapacity: formValue.enrollmentCapacity,
          centreName: formValue.centreName,
          mobile: formValue.mobile,
          country: formValue.country,
          state: formValue.state,
          city: formValue.city,
          pinCode: formValue.pinCode,
          daycareTypeID: formValue.DaycareTypeID,
          latitude: formValue.latitude ? formValue.latitude.toString() : '0',
          longitude: formValue.longitude ? formValue.longitude.toString() : '0',
          isDirectAddDaycare: true,
          isTrial: formValue.isTrial !== false,
          trialDays: formValue.trialDays || 14,
          planID: formValue.planID || null,
          counsellorID: this.UserID || 0,
        };

        this.service.directAddDaycare(directPayload).subscribe({
          next: (data) => {
            this.spinner.hide();
            if (data.message === 'Success') {
              const result = data.result || {};
              const encryptedCentreId =
                result.encryptedCentreId ||
                (result.centreId
                  ? this.commonService.encrypt(result.centreId.toString())
                  : '');

              Swal.fire({
                title: 'Daycare Added Successfully!',
                html: `Daycare <b>${formValue.centreName}</b> and admin account have been created directly without booking an appointment.<br><br>An onboarding link has been sent to <b>${formValue.email}</b>.`,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText:
                  '<i class="fa fa-external-link me-1"></i> Go to Daycare Onboarding',
                cancelButtonText: 'Done',
                showDenyButton: !!result.onboardingLink,
                denyButtonText: '<i class="fa fa-copy me-1"></i> Copy Link',
              }).then((choice) => {
                if (choice.isConfirmed && encryptedCentreId) {
                  this.router.navigate(['/onboarding'], {
                    queryParams: { enc_id: encryptedCentreId },
                  });
                } else if (choice.isDenied && result.onboardingLink) {
                  navigator.clipboard?.writeText(result.onboardingLink);
                  this.toastr.success('Onboarding link copied to clipboard!');
                }
              });

              this.ResetForm();
              this.Update.emit();
              $('#addapoint').modal('hide');
            } else {
              this.toastr.error(data.message || 'Failed to add daycare directly.');
            }
          },
          error: (err) => {
            this.spinner.hide();
            console.error('Error adding daycare directly:', err);
            this.toastr.error(
              err?.error?.message ||
                'An error occurred while adding the daycare directly.'
            );
          },
        });
        return;
      }

      const mobile = formValue.mobile;
      const addAppointmentFormBO = {
        id: 0,
        name: formValue.name,
        email: formValue.email,
        enrollmentCapacity: formValue.enrollmentCapacity,
        centreName: formValue.centreName,
        mobile: mobile,
        country: formValue.country,
        state: formValue.state,
        city: formValue.city,
        pinCode: formValue.pinCode,
        counsellorID: this.UserID,
        statusID: 6,
        slotID: this.slotID,
        mode: 'offline',
        link: '',
        isCurrentAppointment: formValue.isCurrentAppointment,
        daycareTypeID: formValue.DaycareTypeID,
        latitude: formValue.latitude,
        longitude: formValue.longitude,
        regionHours: this.regionResponse.offsetHours,
        regionMinutes: this.regionResponse.offsetMinutes,
      };

      this.service
        .manageForDayCareInterestedUsers(addAppointmentFormBO)
        .subscribe({
          next: (data) => {
            if (data.message === 'Success') {
              this.toastr.success('Form submitted successfully!');
              this.addAppointmentForm.reset();
              this.assignCounsellor();
              this.Update.emit();
            } else {
              this.toastr.error(data.message);
            }
          },
          error: (err) => {
            console.error('Error:', err);
            this.toastr.error('An error occurred while submitting the form.');
          },
          complete: () => {
            this.spinner.hide();
          },
        });
    } else {
      this.addAppointmentForm.markAllAsTouched();
    }
  }

  ResetForm() {
    this.addAppointmentForm.reset({
      id: 0,
      mode: 'offline',
      statusID: 6,
      slotID: 0,
      isTrial: true,
      trialDays: 14,
      latitude: 0,
      longitude: 0,
    });
    this.addAppointmentForm.markAsUntouched();
    if (this.selectDateFlatPicker) {
      this.selectDateFlatPicker.clear();
    }
    if (this.isDirectMode) {
      this.setDirectModeActive(true);
    }
  }

  closeModal() {
    this.addAppointmentForm.reset();
    this.addAppointmentForm.markAsUntouched();
    if (this.selectDateFlatPicker) {
      this.selectDateFlatPicker.clear();
      this.Update.emit();
    }
  }

  async date(event: any) {


    this.selectedDate = event.target.value;

    if (this.UserRoleID == 6 || this.UserRoleID == 1) {
      this.getAvailableSlots();
    }
    this.SlotTimeListDropdownControl.reset();
  }

  async getActiveCounsellors() {
    this.assignuserservice.getEmployeeRole(6, 'True').subscribe({
      next: (data) => {
        if (data.message === 'OK') {
          this.ActiveCounsellorsList = data.result;
        } else {

        }
      },
      error: (err) => {
        console.error('API error', err);
      },
    });
  }

  async getCounsellorId(event: any) {
    this.UserID = event;

    if (this.selectedDate) {
      this.getAvailableSlots();
    }
  }

  async assignCounsellor() {
    this.Dcservice.dayCareAssignmentToCounsellor(this.UserID, 0).subscribe(
      (response) => {

      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }

  async getAvailableSlots() {

    this.service
      .getAvailableSlots(
        this.UserID,
        this.selectedDate,
        this.regionResponse.offsetHours,
        this.regionResponse.offsetMinutes
      )
      .subscribe({
        next: (data) => {
          if (data.message === 'OK') {
            this.availableSlots = data.result;
          } else {
            console.error('Error fetching slots:', data.message);
          }
        },
        error: (err) => {
          console.error('API Error:', err);
        },
      });
  }

  // date select

  ngAfterViewInit(): void {

    const currentDate = new Date();
    this.selectDateFlatPicker = flatpickr('#datePickerSelectDate', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: currentDate,
    });
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

  fetchLocationData(postalCode: string) {
    const canadianPattern = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
    const usaPattern = /^\d{5}$/;

    let url = '';
    if (canadianPattern.test(postalCode)) {
      const normalizedPostalCode = postalCode.split(' ')[0]; // Use first part only (e.g., "K1A")
      url = `https://api.zippopotam.us/ca/${normalizedPostalCode}`;
    } else if (usaPattern.test(postalCode)) {
      url = `https://api.zippopotam.us/us/${postalCode}`;
    } else {
      return; // Invalid format
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.places && response.places.length > 0) {
          const place = response.places[0];
          this.addAppointmentForm.patchValue({
            city: place['place name'],
            state: place['state'],
            country: response['country'],
            pinCode: postalCode,
            latitude: place['latitude'],
            longitude: place['longitude'],
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: '<h3>Error!</h3>',
          text: 'Unable to fetch data. Please try again later.',
        });
      }
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
