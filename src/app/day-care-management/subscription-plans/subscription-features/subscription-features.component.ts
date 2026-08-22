import { Component, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SubscriptionFeaturesService } from './subscription-features.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule, NgFor } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { SubscriptionDetailsComponent } from '../subscription-details/subscription-details.component';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";

declare var $: any;
@Component({
  selector: 'app-subscription-features',
  standalone: true,
  imports: [
    SubscriptionDetailsComponent,
    ReactiveFormsModule,
    NgFor,
    ToastrModule,
    FormsModule,
    CommonModule,
    NgxPaginationModule,
    BreadcrumbComponent,
    SkeletonLoaderComponent
],
  templateUrl: './subscription-features.component.html',
  styleUrl: './subscription-features.component.css',
})
export class SubscriptionFeaturesComponent {
  numbers: number[] = Array.from({ length: 11 }, (_, i) => i); // Generates numbers from 0 to 10
  item: any;
  featureForm: any;
  featureName: any;
  id: any;
  featureDescription: any;
  features: any = [];
  index: any;
  getForm: any;
  isEditMode: boolean = false;
  Reset: any;
  Contentsize: number = 5;
  selectedEditSmtpId: any;
  ContentP: number = 1;
  loginUserId: any;
  UnitsList: any;
  expandedDescriptionIndex: number | null = null;
  isDisplaytheUnitField: boolean = false;
  @Output() detectChanges: any = new EventEmitter<any>();
  isLoading: any;
  UserRoleID: any;
  isVisible: boolean = false;
  CentreID: number = 0;
  skeletonShow = 'Skelton';


  constructor(
    private formBuilder: FormBuilder,
    private subscriptionFeaturesService: SubscriptionFeaturesService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cookies: CookieService,
    private router: Router
  ) {
    // this.featureForm = this.formBuilder.group({
    //   id: [0],
    //   featureName: ['', Validators.required],
    //   featureDescription: ['', Validators.required],
    //   LoginUserID:[0]
    // });
    // this.featureForm = this.formBuilder.group({
    //   id: [0],
    //   featureName: ['', Validators.required],
    //   featureDescription: [''],
    //   Quantity:[''],
    //   Units:[null],
    //   LoginUserID:[0]
    // });
    this.featureForm = this.formBuilder.group({
      id: [0],
      featureName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z_][a-zA-Z0-9$%()/\-_+{}\\?'`:.,& ]*$/),
          Validators.maxLength(50),
        ],
      ],

      featureDescription: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9$%()/\-_+{}\\?'`:.,& ]*$/),
          Validators.maxLength(500),
          this.noWhitespaceValidator,
        ],
      ],

      Capacity: [null],
      Unit: [null],
      LoginUserID: [0],
      jobType: [false],
      centerID: [0],
      featureCount: [0],
      storageType: [false],
      enrollmentType: [false],
    });
    this.getForm = this.formBuilder.group({
      searchText: [''],
      isActive: null,
      loginUserID: this.loginUserId,
    });
  }

  ngOnInit() {
    this.loginUserId = this.cookies.get('UserId');
    this.UserRoleID = this.cookies.get('UserRoleId');
    if (this.UserRoleID == '') {
      this.UserRoleID = this.cookies.get('userRoleID');
    }
    this.CentreID = parseInt(this.cookies.get('CentreID'));
    this.getData();
    this.getAllUnits();
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  async getData() {
    this.skeletonShow = 'Skelton';
    await this.getForm.patchValue({
      loginUserID: this.loginUserId,
    });
    this.subscriptionFeaturesService.getFeatures(this.getForm.value).subscribe({
      next: (data) => {
        if (data.message == 'Ok') {
          this.features = data.result;
          this.skeletonShow = '';
        } else {
          this.skeletonShow = '';
        }
      },
    });
  }

  getAllUnits() {
    this.subscriptionFeaturesService.getAllUnits().subscribe((data) => {
      if (data.message == 'OK') {
        this.UnitsList = data.result;
      } else {
        this.UnitsList = [];
      }
    });
  }

  // input Validators

  onInputValidation(event: Event, type: any): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    let value = input.value;

    if (type === 'feature') {
      value = value.replace(/[^a-zA-Z0-9$%()/\-_+{}\\?'`:.,& ]/g, '');
      value = value.replace(/^[0-9]+/, '');
      value = value.substring(0, 50);

      if (value.length > 0) {
        value = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }

    if (type === 'description') {
      value = value.replace(/[^a-zA-Z0-9$%()/\-_+{}\\?'`:.,& ]/g, '');
      value = value.replace(/^[0-9]+/, '');
      value = value.substring(0, 500);
    }

    input.value = value;
    const controlName =
      type === 'feature' ? 'featureName' : 'featureDescription';
    this.featureForm.get(controlName)?.setValue(value);
  }

  //Arsh Added on 26/05/25
  preventMoreThan4Digits(event: any): void {
    const value = event.target.value;
    if (value <= 0) {
      event.target.value = '';
      this.featureForm.get('Capacity')?.setValue(null);
    }
    if (value.length >= 4) {
      event.target.value = value.slice(0, 4);
      this.featureForm.get('Capacity')?.setValue(event.target.value);
    }
  }

  onSubmit() {
    if (this.featureForm.valid) {
      const formValue = { ...this.featureForm.value };
      formValue.id = formValue.id || 0;
      formValue.isActive = true;
      formValue.jobType = formValue.jobType == null ? false : formValue.jobType;
      formValue.LoginUserID = this.loginUserId;
      formValue.centerID = this.CentreID;
      formValue.featureCount = this.features.length;
      formValue.storageType =
        formValue.storageType == null ? false : formValue.storageType;

      this.spinner.show();

      const handleSuccess = (message: string, isUpdate: boolean = false) => {
        this.toastr.success(message);
        this.detectChanges.emit('Ok');

        $('#exampleModal').modal('hide');
        this.featureForm.reset({
          id: 0,
          featureName: '',
          featureDescription: '',
          Unit: '',
          Capacity: '',
          isActive: true,
          LoginUserID: this.loginUserId,
        });

        this.spinner.hide();

        if (!isUpdate) {
          if (parseInt(this.UserRoleID) == 3) {
            this.router.navigate(['/subscription-features']).then(() => {
              Swal.fire({
                title: 'Feature Added!',
                text: 'Your feature has been added successfully. Create a new plan now!',
                icon: 'success',
                confirmButtonText: 'Create Plan',
                showCancelButton: true,
                cancelButtonText: 'Maybe Later',
              }).then((result) => {
                if (result.isConfirmed) {
                  this.router.navigate(['/subscription-plans']);
                }
              });
            });
          } else {
            Swal.fire({
              title: 'Feature Added!',
              text: 'Your feature has been Added successfully .',
              icon: 'info',
              confirmButtonText: 'OK',
            });
          }
        } else {
          Swal.fire({
            title: 'Feature Updated!',
            text: 'Your feature has been updated successfully .',
            icon: 'info',
            confirmButtonText: 'OK',
          });
        }
      };

      if (formValue.id && formValue.id > 0) {
        this.subscriptionFeaturesService
          .subscriptionFeature(formValue)
          .subscribe({
            next: (data) => {
              if (data.message === 'Ok') {
                this.resetFormValidation();
                $('#storageTypeCheckbox').show();
                $('#enrollmentTypeCheckbox').show();
                $('#jobTypeCheckbox').show();

                handleSuccess('Data updated successfully', true);
                this.getData();
              } else if (data.message === 'Error') {
                this.toastr.error(data.Activity);
              } else {
                this.toastr.error('Error');
              }
            },
            error: () => {
              this.toastr.error('Error occurred while updating data');
              this.spinner.hide(); // Hide spinner on error
            },
          });
      } else {
        this.subscriptionFeaturesService
          .subscriptionFeature(formValue)
          .subscribe({
            next: (data) => {
              if (data.message === 'Ok') {
                this.resetFormValidation();
                $('#storageTypeCheckbox').show();
                $('#enrollmentTypeCheckbox').show();
                $('#jobTypeCheckbox').show();
                let result = data.result;
                this.getData();
                if (result != null) {
                  if (
                    (result.featureAdd == null ||
                      result.featureAdd == undefined) &&
                    this.features.length == 2
                  ) {
                    handleSuccess('Data submitted successfully', false);
                    this.spinner.hide();
                  } else {
                    this.spinner.hide();
                    this.toastr.success('Data submitted successfully');
                    this.detectChanges.emit('Ok');
                    $('#exampleModal').modal('hide');
                  }
                } else {
                  handleSuccess('Data submitted successfully', false);
                  this.spinner.hide();
                }
              } else {
                this.toastr.error(
                  'This feature already exists. Please enter a unique feature.'
                );
                this.spinner.hide();
              }
            },
            error: () => {
              this.toastr.error('Error occurred while submitting data');
              this.spinner.hide(); // Hide spinner on error
            },
          });
      }
    } else {
      this.featureForm.markAllAsTouched();
    }
  }

  cancel() {
    this.isEditMode = false;
    this.featureForm.reset({
      id: 0,
      featureName: '',
      featureDescription: '',
      Unit: '',
      Capacity: '',
      isActive: true,
      LoginUserID: this.loginUserId,
    });

    this.resetFormValidation();
  }

  onDelete(id: any) {
    this.spinner.show();
    this.subscriptionFeaturesService.deleteFeature(id).subscribe({
      next: (data: any) => {
        if (data.message === 'Feature deleted successfully.') {
          this.toastr.success('Feature deleted successfully');
          this.spinner.hide();
          this.getData();
        }
      },
      error: (err) => {
        this.spinner.hide();

        this.toastr.error('Error deleting feature:', err);
      },
    });
  }

  onStorageTypeCheckboxClick(event: any) {
    this.featureForm.markAsUntouched();
    if (event.target.checked) {
      this.isDisplaytheUnitField = true;
      this.featureForm.get('Capacity').setValidators([Validators.required]);
      this.featureForm.get('Capacity').updateValueAndValidity();
      this.featureForm.get('Unit').setValidators([Validators.required]);
      this.featureForm.get('Unit').updateValueAndValidity();
      // $('#jobTypeCheckbox').hide();
      // $('#enrollmentTypeCheckbox').hide();

      const checked = (event.target as HTMLInputElement).checked;
      this.selectedCheckbox = checked ? 'storageType' : null;
      this.updateCheckboxStates();
    } else {
      this.isDisplaytheUnitField = false;
      this.featureForm.get('Capacity').clearValidators();
      this.featureForm.get('Capacity').updateValueAndValidity();
      this.featureForm.get('Unit').clearValidators();
      this.featureForm.get('Unit').updateValueAndValidity();
      // $('#jobTypeCheckbox').show();
      // $('#enrollmentTypeCheckbox').show();
      const checked = (event.target as HTMLInputElement).checked;
      this.selectedCheckbox = checked ? 'storageType' : null;
      this.updateCheckboxStates();
    }
  }
  onJobTypeCheckboxClick(event: any) {
    this.featureForm.markAsUntouched();
    if (event.target.checked) {
      this.isDisplaytheUnitField = true;
      this.featureForm.get('Capacity').setValidators([Validators.required]);
      this.featureForm.get('Capacity').updateValueAndValidity();
      this.featureForm.get('Unit').setValidators([Validators.required]);
      this.featureForm.get('Unit').updateValueAndValidity();
      // $('#storageTypeCheckbox').hide();
      // $('#enrollmentTypeCheckbox').hide();

      const checked = (event.target as HTMLInputElement).checked;
      this.selectedCheckbox = checked ? 'jobType' : null;
      this.updateCheckboxStates();
    } else {
      this.isDisplaytheUnitField = false;
      this.featureForm.get('Capacity').clearValidators();
      this.featureForm.get('Capacity').updateValueAndValidity();
      this.featureForm.get('Unit').clearValidators();
      this.featureForm.get('Unit').updateValueAndValidity();
      // $('#storageTypeCheckbox').show();
      // $('#enrollmentTypeCheckbox').show();
      const checked = (event.target as HTMLInputElement).checked;
      this.selectedCheckbox = checked ? 'jobType' : null;
      this.updateCheckboxStates();
    }
  }

  selectedCheckbox: string | null = null;

  resetFormValidation() {
    this.isDisplaytheUnitField = false;
    this.featureForm.get('Capacity').clearValidators();
    this.featureForm.get('Capacity').updateValueAndValidity();
    this.featureForm.get('Unit').clearValidators();
    this.featureForm.get('Unit').updateValueAndValidity();

    const form = this.featureForm;
    form.get('jobType')?.enable({ emitEvent: false });
    form.get('storageType')?.enable({ emitEvent: false });
    form.get('enrollmentType')?.enable({ emitEvent: false });
  }

  updateCheckboxStates(): void {
    const form = this.featureForm;
    form.get('jobType')?.enable({ emitEvent: false });
    form.get('storageType')?.enable({ emitEvent: false });
    form.get('enrollmentType')?.enable({ emitEvent: false });

    if (this.selectedCheckbox && this.selectedCheckbox !== 'jobType') {
      form.get('jobType')?.disable({ emitEvent: false });
    }
    if (this.selectedCheckbox && this.selectedCheckbox !== 'storageType') {
      form.get('storageType')?.disable({ emitEvent: false });
    }
    if (this.selectedCheckbox && this.selectedCheckbox !== 'enrollmentType') {
      form.get('enrollmentType')?.disable({ emitEvent: false });
    }
  }

  onEnrollmentTypeCheckBoxClick(event: any) {
    this.featureForm.markAsUntouched();

    if (event.target.checked) {
      this.isDisplaytheUnitField = true;
      this.featureForm.get('Capacity').setValidators([Validators.required]);
      this.featureForm.get('Capacity').updateValueAndValidity();
      this.featureForm.get('Unit').setValidators([Validators.required]);
      this.featureForm.get('Unit').updateValueAndValidity();
      // $('#storageTypeCheckbox').hide();
      // $('#jobTypeCheckbox').hide();

      const checked = (event.target as HTMLInputElement).checked;
      this.selectedCheckbox = checked ? 'enrollmentType' : null;
      this.updateCheckboxStates();
    } else {
      this.isDisplaytheUnitField = false;
      this.featureForm.get('Capacity').clearValidators();
      this.featureForm.get('Capacity').updateValueAndValidity();
      this.featureForm.get('Unit').clearValidators();
      this.featureForm.get('Unit').updateValueAndValidity();
      // $('#storageTypeCheckbox').show();
      // $('#jobTypeCheckbox').show();
      const checked = (event.target as HTMLInputElement).checked;
      this.selectedCheckbox = checked ? 'enrollmentType' : null;
      this.updateCheckboxStates();
    }
  }

  // onEdit(item: any) {
  //   this.isVisible = false;
  //   this.isEditMode = true;
  //   this.featureForm.patchValue({
  //     id: item.id,
  //     featureName: item.featureName,
  //     featureDescription: item.featureDescription,
  //     isActive: item.isActive,
  //     Capacity: item.capacity,
  //     Unit: item.unit,
  //   });
  //   if (item.storageType == true) {
  //     this.featureForm.patchValue({
  //       storageType: true,

  //     });
  //   }

  //   if (item.enrollmentType == true) {
  //     this.featureForm.patchValue({
  //       enrollmentType: true,

  //     });
  //   }
  //   if (item.jobPostType == true) {
  //     this.featureForm.patchValue({
  //       jobType: true,

  //     });

  //   }

  // }

  onEdit(item: any) {
    this.isVisible = false;
    this.isEditMode = true;

    this.getData();
    // Reset the form values
    this.featureForm.patchValue({
      id: item.id,
      featureName: item.featureName,
      featureDescription: item.featureDescription,
      isActive: item.isActive,
      Capacity: item.capacity,
      featureCount: this.features.length,
      Unit: item.unit,
      LoginUserID: this.loginUserId,
      jobType: item.jobPostType === true ? true : false,
      storageType: item.storageType === true ? true : false,
      enrollmentType: item.enrollmentType === true ? true : false,
    });

    if (item.jobPostType === true) {
      this.featureForm.get('jobType')?.disable({ emitEvent: false });

      this.featureForm.get('storageType')?.disable({ emitEvent: false });
      this.featureForm.get('enrollmentType')?.disable({ emitEvent: false });
      this.featureForm.patchValue({ jobType: item.jobPostType });
    } else if (item.storageType === true) {
      this.featureForm.get('jobType')?.disable({ emitEvent: false });
      this.featureForm.get('storageType')?.disable({ emitEvent: false });
      this.featureForm.get('enrollmentType')?.disable({ emitEvent: false });
      this.featureForm.patchValue({ storageType: item.storageType });
    } else if (item.enrollmentType === true) {
      this.featureForm.get('jobType')?.disable({ emitEvent: false });
      this.featureForm.get('storageType')?.disable({ emitEvent: false });
      this.featureForm.get('enrollmentType')?.disable({ emitEvent: false });
      this.featureForm.patchValue({ enrollmentType: item.enrollmentType });
    }
  }

  ActiveInactiveUserRole(id: number, isActive: boolean) {
    var action = 'activated';
    Swal.fire({
      title: 'Confirmation',
      text: isActive
        ? 'Are you sure you want to deactivate this feature ? '
        : 'Are you sure you want to activate the feature?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: isActive ? 'Confirm' : 'Confirm',
    }).then((result) => {
      if (result.isConfirmed) {
        if (isActive === true) {
          action = 'deactivated';
        }
        this.subscriptionFeaturesService
          .activeInActiveSubscriptionFeaturesByID(id)
          .subscribe((res) => {
            this.getData();
          });
      } else {
        function check() {
          $('#checkBoxAinA' + id).prop('checked', true);
        }
        function uncheck() {
          $('#checkBoxAinA' + id).prop('checked', false);
        }
        isActive ? check() : uncheck();
      }
    });
  }

  openAddActivityModal() {
    this.isVisible = false;
    this.isEditMode = false;
    this.featureForm.reset({
      id: 0,
      featureName: '',
      featureDescription: '',
      Unit: '',
      Capacity: null,
      isActive: true,
      LoginUserID: this.loginUserId,
    });
    $('#exampleModal').modal('show');
  }
}
