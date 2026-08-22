import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { UserRoleService } from '../../settings/Permission/user-role/user-role.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { RoleSpecializationService } from './role-specialization.service';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";

declare var $: any;
@Component({
  selector: 'app-role-specialization',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ToastrModule, CommonModule, NgxPaginationModule, BreadcrumbComponent, NgSelectModule, SkeletonLoaderComponent],
  templateUrl: './role-specialization.component.html',
  styleUrl: './role-specialization.component.css'
})

export class RoleSpecializationComponent {
  ContentP: number = 1;
  Contentsize: number = 5;
  isEditMode: boolean = false;
  roleSpecializationValues: any;
  public RoleSpecializationForm: any;
  public userRoleList: any[] = [];
  public roleSpecializationList: any[] = [];
  skeletonShow = 'Skelton';


  constructor(private fb: FormBuilder, private userRoleService: UserRoleService, private roleSpecializationService: RoleSpecializationService, private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.RoleSpecializationForm = fb.group({
      id: [0],
      roleID: ['', Validators.required],
      name: [null, Validators.required],
      isActive: [true]
    })
  }
  ngOnInit() {
    this.getUserRoles();
    this.getAllRoleSpecializationList();
  }

  get RoleSpecializationFormControls() {
    return this.RoleSpecializationForm.controls;
  }

  get input() {
    return this.RoleSpecializationForm.controls;
  }

  getAllRoleSpecializationList() {

    this.skeletonShow = 'Skelton';

    this.roleSpecializationService.getAllRoleSpecializations().subscribe(data => {
      if (data.message == "Success") {
        this.roleSpecializationList = data.result;
        this.skeletonShow = '';


      }
    })
  }

  onSubmit() {
    if (this.RoleSpecializationForm.valid) {
      this.spinner.show()
      this.RoleSpecializationForm.patchValue({
        id: this.RoleSpecializationForm.value.id ?? 0
      });

      this.roleSpecializationService.ManageRoleSpecialization(this.RoleSpecializationForm.value).subscribe(data => {
        if (data.message == "Success") {
          this.spinner.hide();
          const message = this.RoleSpecializationForm.get('id').value > 0
            ? "Data updated successfully"
            : "Data saved successfully";
          this.toastr.success(message);
          $("#exampleModal").modal('hide');
          this.getAllRoleSpecializationList();
        }
        else {
          this.toastr.warning(data.message);
          $("#exampleModal").modal('hide');

        }
        this.RoleSpecializationForm.reset();
        this.isEditMode = false;
        this.spinner.hide();
        this.getAllRoleSpecializationList();
      });
    }
    this.RoleSpecializationForm.markAllAsTouched();
  }

  onEdit(roleSpecializationID: any) {
    this.roleSpecializationService.getRoleSpecializationByID(roleSpecializationID).subscribe(data => {
      this.isEditMode = true;
      if (data.message === "Success") {
        this.roleSpecializationValues = data.result;
        this.RoleSpecializationForm.patchValue({
          id: roleSpecializationID,
          roleID: this.roleSpecializationValues.roleID,
          name: this.roleSpecializationValues.name,
        })
      }
    })
  }
  activeInactive(id: number, isActive: boolean) {
    var action = 'activated';
    Swal.fire({
      title: "Confirmation",
      text: isActive ? "Are you sure you want to deactivate the role specialization?" : "Are you sure you want to activate the role specialization?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: isActive ? "Confirm" : "Confirm"
    }).then((result) => {

      if (result.isConfirmed) {
        if (isActive === true) {
          action = 'deactivated';
        }
        this.roleSpecializationService.activeInactiveRoleSpecialization(id).subscribe(res => {
          this.toastr.success("Role Specialization has been " + action + " successfully")
          this.getAllRoleSpecializationList();
        });
      }

      else {
        function check() {
          $('#checkBoxAinA' + id).prop("checked", true)
        };
        function uncheck() {
          $('#checkBoxAinA' + id).prop("checked", false)
        }
        isActive ? check() : uncheck();
      }
    })
  }

  cancel() {
    this.isEditMode = false;
    this.RoleSpecializationForm.reset();
  }

  getUserRoles() {
    // this.spinner.show();
    this.userRoleService.getAllUserRoles().subscribe({
      next: (response) => {
        if (response.message === 'OK') {
          const dataList = response.result
            .filter((item: { id: number; userRole: string }) =>
              item.userRole.toUpperCase().trim() === 'TEACHER' ||
              item.userRole.toUpperCase().trim() === 'OTHERS'
            )
            .map((item: { id: number; userRole: string }) => ({
              id: item.id,
              name: item.userRole,
            }));
          this.userRoleList = dataList;
        };
        // setTimeout(() => {
        //   this.spinner.hide();
        // }, 300);
      },
      error: (err) => {
        // this.spinner.hide();
        this.toastr.error(err.message);
      }
    })
  }


}
