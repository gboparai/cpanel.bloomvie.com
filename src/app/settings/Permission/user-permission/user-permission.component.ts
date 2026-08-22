import { BreadcrumbComponent } from './../../../common-component/breadcrumb/breadcrumb.component';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserPermissionService } from './user-permission.service';
import { CookieService } from 'ngx-cookie-service';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserRoleService } from '../user-role/user-role.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $:any

@Component({
  selector: 'app-user-permission',
  standalone: true,
  imports: [
    RouterLink,
    BreadcrumbComponent,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './user-permission.component.html',
  styleUrl: './user-permission.component.css'
})
export class UserPermissionComponent implements OnInit {
  uid: any;
  UserIDInt: any;
  data: any;
  IsMenuPresent: boolean = true;
  Permission: any;
  UserList: any;
  UserRoleList: any;
  userID: any;
  userId: any;
  constructor( private fb: FormBuilder,
    private service: UserPermissionService,
    private cookies:CookieService,private userroleService : UserRoleService, private spinner:NgxSpinnerService){

      this.Permission = this.fb.group({
        RoleID: [null, Validators.required],
        UserID: [null, Validators.required],
      });
    }
  ngOnInit(): void {
    this.getAllUsers();
    this.getAllUserRole();
  }

    getAllUsers() {
      
      this.service.getAllUsers().subscribe((data) => {
        if (data.message == 'Success') {
          this.UserList = data.result.map((user: { firstName: any; middleName: string; lastName: any; }) => ({
            ...user,
            fullName: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName ? user.lastName + ' ' : ''}`
          }));
        
        }
      });
    }

    getAllUserRole() {
      
      this.userroleService.getAllUserRoles().subscribe((data) => {
        if (data.message == 'OK') {
          // this.UserRoleList = data.result;
  
          this.UserRoleList = data.result.filter((userRole: { isActive: any; }) => userRole.isActive);
      
        }
      });
    }


    AssignConfirmation() {
      
      // var UserID = $('#BindUserTypePermission').val();
      var userRoleID= this.uid;
      if (userRoleID == '') {
        // this.toastr.warning("Please Select Role")
        Swal.fire({
          icon: 'warning',
          title: '<h3>Warning!</h3>',
          text: 'Please select role.',
        });
      } else {
        if (this.Permission.valid) {
          Swal.fire({
            title:
              "<span style='font-size: 17px'>Existing users will be impacted, if the user permissions are changed.<span>",
            showCancelButton: true,
            icon: 'warning',
            confirmButtonText: 'Save',
            // denyButtonText: `Don't save`,
          }).then((result) => {
            if (result.isConfirmed) {
              this.AssignPermission();
            } else {
            }
          });
        } else {
          this.Permission.markAllAsTouched();
        }
      }
    }
    BindUser(selectedItem:any) {
      
      this.userId = selectedItem ? selectedItem.id : null;
      
    }
    AssignPermission() {
      this.userID = this.userId
      var a = parseInt(this.userID, 10);
  
      if (this.Permission.valid) {
        this.spinner.show();
        this.service
          .assignRolePermissionToUser(this.Permission.value)
          .subscribe((data) => {
            if (data.message == 'ok') {
              this.spinner.hide();
              Swal.fire('Saved!', '', 'success');
              // this.toastr.success("User Permission assigned successfully",'Success');
              Swal.fire({
                icon: 'success',
                title: '<h3>Success!</h3>',
                text: 'User permission assigned successfully.',
              });
              this.BindUserTypePermission('');
              this.Permission.reset();
  
              // $("#BindUserTypePermission").val('');
            }
          });
      } else {
        this.Permission.markAllAsTouched();
      }
    }
    treeview(obj: any) {
      this.data = {};
      this.data.isAllSelected = false;
      this.data.isAllCollapsed = false;
      this.data.ParentChildchecklist = obj;
    }

    BindUserTypePermission(selectedItem: any) {
      
      // this.uid = $('#BindUserTypePermission').val();
      this.uid = selectedItem ? selectedItem.id : null;
      this.UserIDInt = parseInt(this.uid, 10);
  if(this.UserIDInt == ''){

    this.service
      .getUserRolePermissionByUserRoleID(this.UserIDInt)
      .subscribe((data) => {
        if (data.message == 'ok') {
          this.treeview(data.result);
          this.IsMenuPresent = true;
        }
      });
  }
    }

    Reset(){
      this.Permission.reset();
    }
    get input(){
      return this.Permission.controls;
     }

}
