import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserRoleService } from './user-role.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";
declare let $: any;

interface userRoleAndRelationDataObj {
  RoleId: number;
  RoleBelongsTo: string;
  Activate: boolean;
}



@Component({
  selector: 'app-user-role',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    BreadcrumbComponent,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    SkeletonLoaderComponent
],
  templateUrl: './user-role.component.html',
  styleUrl: './user-role.component.css'
})
export class UserRoleComponent {
  checkBoxState: { [id: number]: { bloomvie: boolean, daycare: boolean } } = {};
  form: any;
  userRoleList: any[] = [];
  isEditMode: boolean = false;
  ContentP: number = 1;
  Contentsize: number = 5;
  feature: any;
  userRoleID:any;
  skeletonShow="Skelton";

  constructor(private userroleService: UserRoleService, private fb: FormBuilder, private toastr: ToastrService, private spinner: NgxSpinnerService, private cookie: CookieService) {
    this.form = this.fb.group({
      id: 0,
      userRole: ['', Validators.required],
      isActive: true,
    })
  }

  ngOnInit() {


    this.userRoleID = parseInt(this.cookie.get('UserRoleId'));

    this.GetUserRoles();
  }

  getCheckboxState() {
    this.skeletonShow="Skelton";

    if (this.userRoleList.length > 0) {
      this.userRoleList.forEach((state: any) => {
        if (!this.checkBoxState[state.id]) {
          this.checkBoxState[state.id] = {
            bloomvie: state.bloomvie,
            daycare: state.daycare
          }

    this.skeletonShow="";

        }
      });
         this.skeletonShow="";

    }
  }


  manageUserRole() {
    if (this.form.valid) {
      this.spinner.show();
      this.form.patchValue({
        id: this.form.value.id == null ? 0 : this.form.value.id,
        isActive: true
      })
      this.userroleService.ManageUserRole(this.form.value).subscribe(data => {
        if (data.message === 'Ok') {
          if (this.form.get('id').value > 0) {
            this.toastr.success("User Role has been updated successfully");
          }
          else {
            this.toastr.success("User Role has been added successfully");
          }
          this.spinner.hide();
          this.GetUserRoles();
          this.form.reset();
          this.isEditMode = false;
        } else if (data.message == 'Data already exist !') {
          Swal.fire({
            icon: 'warning',
            title: 'Duplicate Record',
            text: 'User Role already exists!'
          })
          this.isEditMode = false;
        }
        else {
          this.spinner.hide();
          this.toastr.error('Error fetching details', data.Message);
        }
        this.form.reset();
      });
      setTimeout(() => {
      }, 1000);
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  GetUserRoles() {
    this.userroleService.getAllUserRoles().subscribe(data => {
      if (data.message == 'OK') {
        this.userRoleList = data.result;
        this.getCheckboxState();
      }
      else {
        console.error(data.message)
      }
    })
  }

  onEdit(item: any) {
    this.isEditMode = true;
    this.form.patchValue({
      id: item.id,
      userRole: item.userRole,
      isActive: item.true
    })

  }


  Reset() {
    this.form.reset({
      id: 0,
      userRole: '',

    })
  }

  cancel() {
    this.isEditMode = false;
    this.Reset();
  }

  ActiveInactiveUserRole(id: number, isActive: boolean) {
    var action = 'activated';
    Swal.fire({
      title: isActive ? "Are you sure you want to deactivate the UserRole ? " : "Are you sure you want to activate the  UserRole?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#297084',
      cancelButtonColor: '#686767',
      confirmButtonText: isActive ? "Confirm" : "Confirm"
    }).then((result) => {

      if (result.isConfirmed) {
        if (isActive === true) {
          action = 'deactivated';
        }
        this.userroleService.activeInActiveUserRoleByID(id).subscribe(res => {
          this.GetUserRoles();
          this.toastr.success(' UserRole has been ' + action + ' successfully.');
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


  get input() {
    return this.form.controls;
  }

  // added by sahib on 22/01/2025
  userRoleRelation(event: any, roleID: number, type: string) {

    try {
      const isChecked = event.target.checked;
      let dataObject = { RoleId: roleID, RoleBelongsTo: type, Activate: isChecked === true ? true : false }

      this.userroleService.userRoleRelation(dataObject).subscribe((data) => {
        this.toastr.success(data.message);
        if (dataObject.RoleBelongsTo === "Daycare") {
          this.checkBoxState[roleID].daycare = event.target.checked;
        }
        else {
          this.checkBoxState[roleID].bloomvie = event.target.checked;
        }
      }, (e) => {
        
      })
    } catch (e) {
      
    }

  }

  pageChange(event: any) {
    this.getCheckboxState();
  }




}


