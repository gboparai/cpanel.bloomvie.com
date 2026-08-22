import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AddAgeGroupService } from './add-age-group.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";
declare var $: any;

@Component({
  selector: 'app-add-age-group',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ToastrModule,
    CommonModule,
    NgxPaginationModule,
    BreadcrumbComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './add-age-group.component.html',
  styleUrl: './add-age-group.component.css',
})
export class AddAgeGroupComponent {
  public ContentP: number = 1;
  public Contentsize: number = 5;

  public AgeGpFrom: any;
  public isEditMode: boolean = false;
  public ageGroupList: any;
  public AgeGpValues: any;
  private loginUserID: number = 0;
  skeletonShow = 'Skelton';

  constructor(
    private fb: FormBuilder,
    private ageGpService: AddAgeGroupService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cookie: CookieService
  ) {
    this.AgeGpFrom = fb.group({
      id: [0],
      // ageGroupTitle: ['', Validators.required],
      minAge: ['', Validators.required],
      maxAge: ['', Validators.required],
      loginUserId: [null],
    });
  }

  ngOnInit() {
    this.getAgeGroupList();
    if (this.cookie.check('UserId')) {
      this.loginUserID = parseInt(this.cookie.get('UserId'));
    }
  }

  onSubmit() {
    if (this.AgeGpFrom.valid) {
      this.spinner.show();
      this.AgeGpFrom.patchValue({
        id: this.AgeGpFrom.value.id ? this.AgeGpFrom.value.id : 0,
        loginUserId: this.loginUserID,
      });
      this.ageGpService
        .ManageAgeGroup(this.AgeGpFrom.value)
        .subscribe((data) => {
          if (data.message == 'Success') {
            this.toastr.success(data.activity);
            this.getAgeGroupList();
          } else {
            this.toastr.warning(data.message);
          }
          setTimeout(() => {
            $('#exampleModal').modal('hide');
            this.spinner.hide();
          }, 300);
          this.AgeGpFrom.reset();
          this.isEditMode = false;
        });
    }
    this.AgeGpFrom.markAllAsTouched();
  }

  get input() {
    return this.AgeGpFrom.controls;
  }

  getAgeGroupList() {
    this.skeletonShow = 'Skelton';

    this.ageGpService.GetAllAgeGroup().subscribe((data) => {
      if (data.message === 'Success') {
        this.ageGroupList = data.result;
        this.skeletonShow = '';

      }
    });
  }

  onEdit(ageGroupID: any) {
    this.ageGpService.GetAgeGroupByID(ageGroupID).subscribe((data) => {
      this.isEditMode = true;
      if (data.message === 'Success') {
        this.AgeGpValues = data.result;
        this.AgeGpFrom.patchValue({
          id: ageGroupID,
          // ageGroupTitle: this.AgeGpValues.ageGroupTitle,
          minAge: this.AgeGpValues.minAge,
          maxAge: this.AgeGpValues.maxAge,
        });
      }
    });
  }

  activeInactive(id: number, isActive: boolean) {
    var action = 'activated';
    Swal.fire({
      title: 'Confirmation',
      text: isActive
        ? 'Are you sure you want to deactivate the age group?'
        : 'Are you sure you want to activate the age group?',
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
        this.ageGpService.ActiveInactiveAgeGroup(id).subscribe((res) => {
          this.getAgeGroupList();
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

  cancel() {
    this.isEditMode = false;
    this.AgeGpFrom.reset();
  }
}
