import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule, Validators, FormBuilder, FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TeacherAreaOfExpertiseService } from './teacher-area-of-expertise.service';
import Swal from 'sweetalert2';
import { SwitcherComponentComponent } from '../../common-component/switcher-component/switcher-component.component';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";

interface ApiResponse {
  message: string | null;
  activity: string | undefined;
  result: any | null;
}

@Component({
  selector: 'app-teacher-area-of-expertise',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    SwitcherComponentComponent,
    ReactiveFormsModule,
    NgxPaginationModule,
    CommonModule,
    FormsModule,
    SkeletonLoaderComponent
  ],
  templateUrl: './teacher-area-of-expertise.component.html',
  styleUrl: './teacher-area-of-expertise.component.css',
})
export class TeacherAreaOfExpertiseComponent {
  public areaOfExpertiseForm: any;
  public expertise: any[] = [];
  public ContentP: number = 1;
  public Contentsize: number = 5;
  public isEditMode: boolean = false;
  searchText: string = '';
  public typingTimeout: any;
  skeletonShow = 'Skelton';

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private areaExpertiseService: TeacherAreaOfExpertiseService
  ) {
    this.areaOfExpertiseForm = this.fb.group({
      id: [0],
      areaOfExpertise: ['', [Validators.required]],
      isActive: [true],
    });
  }

  ngOnInit() {
    this.getAllAreaOfExpertise();
  }

  reset() {
    this.areaOfExpertiseForm.patchValue({
      areaOfExpertise: '',
      isActive: true,
      id: 0,
    });
    this.isEditMode = false;
  }

  onEdit(item: any) {
    this.isEditMode = true;
    this.areaOfExpertiseForm.patchValue({
      id: item.id,
      areaOfExpertise: item.name,
      isActive: item.isActive,
    });
  }

  getAllAreaOfExpertise() {
    this.skeletonShow = 'Skelton';
    this.areaExpertiseService
      .getAreaOfExpertise(this.searchText)
      .subscribe((response: ApiResponse) => {
        if (response.message == 'Success') {
          this.expertise = response.result;
          this.skeletonShow = '';
        } else {
          this.expertise = [];
          this.skeletonShow = '';
        }
      });
  }

  manageAreaOfExpertise() {
     
    if (this.areaOfExpertiseForm.valid) {
      this.spinner.show();
      this.areaExpertiseService
        .manageAreaOfExpertise(this.areaOfExpertiseForm.value)
        .subscribe((response: ApiResponse) => {
          if (response.message == 'Success') {
            this.getAllAreaOfExpertise();
            this.isEditMode = false;
            this.spinner.hide();
            this.areaOfExpertiseForm.reset();
            this.reset();
            this.toastr.success(response.activity);
          } else {
            this.spinner.hide();
            this.toastr.warning(response.activity);
          }
        });
    } else {
      this.areaOfExpertiseForm.markAllAsTouched();
    }
  }

  activeInactiveExpertise(event: any, item: any) {
     
    Swal.fire({
      title: item.isActive
        ? 'Are you sure you want to deactivate the Area of Expertise ? '
        : 'Are you sure you want to activate the Area of Expertise?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: item.isActive ? 'Confirm' : 'Confirm',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.areaExpertiseService
          .activeInActiveAreaOfExpertise(item.id)
          .subscribe((response: ApiResponse) => {
            if (response.message == 'Success') {
              Swal.fire(response.activity, '', 'success');
              this.getAllAreaOfExpertise();
            } else {
              Swal.fire('Something wents wrong !!', '', 'error');
            }
          });
      } else {
        const checkbox: any = document.getElementById('check' + item.id);
        if (checkbox) {
          checkbox.checked = item.isActive;
        }
      }
    });
  }

  onSearchInput() {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.getAllAreaOfExpertise()
    }, 1000);
  }
}
