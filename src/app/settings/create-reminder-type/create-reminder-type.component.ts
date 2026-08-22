import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ReminderTypeServiceService } from './reminder-type-service.service';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { SwitcherComponentComponent } from '../../common-component/switcher-component/switcher-component.component';
import { SkeletonLoaderComponent } from '../../common-component/skeleton-loader/skeleton-loader.component';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
@Component({
  selector: 'app-create-reminder-type',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    SwitcherComponentComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './create-reminder-type.component.html',
  styleUrl: './create-reminder-type.component.css',
})
export class CreateReminderTypeComponent {
  public createReminderForm: any;
  public reminderTypeList: any[] = [];
  public overallCount: number = 5;
  public currentPage: number = 1;
  skeletonShow = 'Skelton';

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private reminderTypeService: ReminderTypeServiceService
  ) {
    this.createReminderForm = this.fb.group({
      id: [0],
      reminderType: ['', [Validators.required]],
      isBloomvie: [false],
      isDaycare: [false],
      isActive: [true],
    });
  }

  resetForm() {
    this.createReminderForm.reset();
    this.createReminderForm.patchValue({
      id: 0,
      isActive: true,
      isBloomvie: false,
      isDaycare: false,
    });
  }

  ngOnInit() {
    this.getAllReminderTypeList();
  }

  getAllReminderTypeList() {
    this.skeletonShow = 'Skelton';

    this.reminderTypeList = [];

    this.reminderTypeService.getAllReminderType().subscribe((response: any) => {
      if (response.message == 'Success') {
        this.reminderTypeList = response.result;
        this.skeletonShow = '';
      } else {
        this.skeletonShow = '';
      }
    });
  }

  editReminderType(reminderType: any) {
    this.createReminderForm.patchValue({
      id: reminderType.id,
      reminderType: reminderType.reminderType,
      isBloomvie: reminderType.isBloomvie,
      isDaycare: reminderType.isDaycare,
      isActive: reminderType.isActive,
    });
  }

  async manageReminderType() {
    if (this.createReminderForm.valid) {
      if (
        this.createReminderForm.value.isBloomvie == false &&
        this.createReminderForm.value.isDaycare == false
      ) {
        this.toastr.warning(
          'Kindly choose a reminder type: Bloomvie or Daycare.'
        );
      } else {
        this.spinner.show();
        this.reminderTypeService
          .manageReminderTypes(this.createReminderForm.value)
          .subscribe((response: any) => {
            if (response.message == 'Success') {
              this.getAllReminderTypeList();
              this.spinner.hide();
              this.resetForm();
              this.toastr.success(response.activity);
            } else {
              this.spinner.hide();
              this.toastr.error(response.message);
            }
          });
      }
    } else {
      this.createReminderForm.markAllAsTouched();
    }
  }

  activeInActiveReminderType(item: any, event: any) {
    const isActive: boolean = event.target.checked;
    let message =
      item.isActive == true
        ? `<span style='font-size: 17px'>Do you want to Inactive the Reminder Type ?<span>`
        : `<span style='font-size: 17px'>Do you want to Active the Reminder Type ?<span>`;

    Swal.fire({
      title: message,
      icon: `warning`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result: any) => {
      if (result.isConfirmed) {
        let ID = item.id;
        let isActive = item.isActive == true ? false : true;

        this.reminderTypeService
          .activeInActiveReminderType(ID, isActive)
          .subscribe((res: any) => {
            if (res.message == 'Success') {
              this.getAllReminderTypeList();
              Swal.fire('Reminder Type Inactive successfully!', '', 'success');
            } else {
              const checkbox: any = document.getElementById('check' + item.id);
              if (checkbox) {
                checkbox.checked = !isActive;
              }
            }
          });
      } else {
        const checkbox: any = document.getElementById('check' + item.id);
        if (checkbox) {
          checkbox.checked = !isActive;
        }
      }
    });
  }
}
