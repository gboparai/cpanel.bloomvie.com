import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserRoleService } from '../user-role/user-role.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';

import { CommonModule } from '@angular/common';
import { UserPermissionService } from '../user-permission/user-permission.service';
import { CookieService } from 'ngx-cookie-service';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { NgxSpinnerService } from 'ngx-spinner';

declare var $: any;
@Component({
  selector: 'app-role-based-permission',
  standalone: true,
  imports: [
    RouterLink,
    BreadcrumbComponent,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './role-based-permission.component.html',
  styleUrl: './role-based-permission.component.css'
})
export class RoleBasedPermissionComponent implements OnInit {
userRoleList: any;
  isManuPresent: any=false;
  data: any;
  ParentChildchecklist: any;
  UserID: any;
  RolePermissionForm: any;
  UserRoleID: any;
  isAllSelected = false;
  
constructor(private spinner:NgxSpinnerService,private userroleService:UserRoleService,private fb:FormBuilder, private userPermissionService : UserPermissionService
  ,private cookie: CookieService
){
  this.RolePermissionForm = this.fb.group({
    UserRoleID: [null, Validators.required],
  });
}

ngOnInit(): void {
  this.UserID = this.cookie.get('UserId');
  this.getUserRole();
 
}
  
getUserRole(){
  
  this.userroleService.getAllUserRoles().subscribe(data=>{
    if(data.message=='OK')
      {
        // this.userRoleList=data.result;
        this.userRoleList = data.result.filter((userRole: { isActive: any; }) => userRole.isActive);
  
      }
      else{
        console.error(data.message)
      }
  })


}



AssignConfirmation() {
  
  $('#submitMenuPermissionToRoleButton').prop('disabled',true);
 
  var UserID = this.UserRoleID;
  if (UserID == '') {
    // this.toastr.warning("Please Select Role")
    Swal.fire({
      icon: 'warning',
      title: '<h3>Warning!</h3>',
      text: 'Please select role.',
    });
  } else if (this.RolePermissionForm.valid) {
    Swal.fire({
      title:
        "<span style='font-size: 17px'>Existing users will be impacted, if the role-based permissions are changed.<span>",
      showCancelButton: true,
      icon: 'warning',
      confirmButtonText: 'Save',
      allowOutsideClick: false,
      // denyButtonText: `Don't save`,
    }).then((result) => {
      if (result.isConfirmed) {
       // $('#submitMenuPermissionToRoleButton').text('Wait...');
        this.AssignPermission();

      } else {
        $('#submitMenuPermissionToRoleButton').prop('disabled',false);
        //$('#submitMenuPermissionToRoleButton').text('Submit');
      }
    });
  } else {
    this.RolePermissionForm.markAllAsTouched();
  }
}


AssignPermission() {
  
  var UserID = this.UserRoleID;
  if (UserID == '') {
    // this.toastr.warning("Please Select Role")
    Swal.fire({
      icon: 'warning',
      title: '<h3>Warning!</h3>',
      text: 'Please select role.',
    });
  } else {
    this.spinner.show();
    this.userPermissionService
      .assignPermissionToRole(UserID, this.data.ParentChildchecklist)
      .subscribe(
        (data) => {
          if (data.message == 'ok') {
            this.spinner.hide();
            // this.toastr.success("Data Added Successfully");
            Swal.fire('Saved!', '', 'success');

            $('#submitMenuPermissionToRoleButton').prop('disabled',false);
            //$('#submitMenuPermissionToRoleButton').text('Submit');
            this.BindUserTypePermission('');


            // $("#BindUserTypePermission").val('');
          } else {
            // this.toastr.warning(data.Message);
            Swal.fire({
              icon: 'warning',
              title: '<h3>Warning!</h3>',
              text: data.message,
            });
          }
        },
        (err) => {}
      );
  }
}

Reset(){
  this.RolePermissionForm.reset();
  this.isManuPresent=false;
}

treeview(obj: any) {
  // 
  this.data = {};
  this.data.isAllSelected = false;
  this.data.isAllCollapsed = false;

  this.data.ParentChildchecklist = obj;
  var selectedmod = obj.filter((x: { isSelected: boolean; }) => x.isSelected == true);

  // this.selectemodules=obj.isSelected == true;
  this.isManuPresent = true
}

BindUserTypePermission(e: any) {
  if(e != undefined){
  this.UserRoleID = e.id;

  this.userPermissionService
    .getUserRolePermissionByUserRoleID(this.UserRoleID)
    .subscribe((data) => {
      if (data.message == 'ok') {
        this.treeview(data.result);
        this.isManuPresent=true;
        this.updateSelectAllStatus();

      }
    });
}else{
  this.isManuPresent=false;

}
}

parentCheck(parentObj: any) {
  // 
  for (var i = 0; i < parentObj.childList.length; i++) {
    parentObj.childList[i].isSelected = parentObj.isSelected;
    parentObj.childList[i].IsCustomized = parentObj.isSelected;
    for (var j = 0; j < parentObj.childList[i].nestedchildList.length; j++) {
      parentObj.childList[i].nestedchildList[j].isSelected =
        parentObj.childList[i].isSelected;
      parentObj.childList[i].nestedchildList[j].IsCustomized =
        parentObj.childList[i].isSelected;
    }
  }
  parentObj.IsCustomized = parentObj.isSelected;
}
childCheck(parentObj: any, childObj: any, ID: any) {
  
  parentObj.isSelected = childObj.some(function (itemChild: any) {
    return itemChild.isSelected == true;
  });
  parentObj.IsCustomized = childObj.some(function (itemChild: any) {
    return itemChild.isSelected == true;
  });

  for (let i = 0; i < childObj.length; i++) {
    if (childObj[i].id == ID) {
      childObj[i].IsCustomized = childObj[i].isSelected;
    }
  }
  for (var i = 0; i < childObj.length; i++) {
    for (var j = 0; j < childObj[i].nestedchildList.length; j++) {
      childObj[i].nestedchildList[j].isSelected = childObj[i].isSelected;
      childObj[i].nestedchildList[j].IsCustomized = childObj[i].isSelected;
    }
  }
  childObj.IsCustomized = childObj.isSelected;
}

nestedchildCheck(parentObj: any, childObj: any, ID: any) {
  
  parentObj.isSelected = childObj.some(function (itemChild: any) {
    return itemChild.isSelected == true;
  });
  parentObj.IsCustomized = childObj.some(function (itemChild: any) {
    return itemChild.isSelected == true;
  });

  for (let i = 0; i < childObj.length; i++) {
    if (childObj[i].id == ID) {
      childObj[i].IsCustomized = childObj[i].isSelected;
    }
  }
  for (var i = 0; i < childObj.length; i++) {
    for (var j = 0; j < childObj[i].nestedchildList.length; j++) {
      childObj[i].nestedchildList[j].isSelected = childObj[i].isSelected;
      childObj[i].nestedchildList[j].IsCustomized = childObj[i].isSelected;
    }
  }
  childObj.IsCustomized = childObj.isSelected;
}


toggleSelectAll(event: any) {
  const isChecked = event.target.checked;
  this.isAllSelected = isChecked;

  // Loop through all parent items
  this.data.ParentChildchecklist.forEach((item: any) => {
    item.isSelected = isChecked;

    // Loop through all child items
    item.childList.forEach((child: any) => {
      child.isSelected = isChecked;

      // Loop through all nested child items
      child.nestedchildList.forEach((nestedChild: any) => {
        nestedChild.isSelected = isChecked;
      });
    });
  });
}

updateSelectAllStatus() {
  // Check if every checkbox in the hierarchy is selected
  const allSelected = this.data.ParentChildchecklist.every((item: any) => {
    return item.isSelected && item.childList.every((child: any) => {
      return child.isSelected && child.nestedchildList.every((nestedChild: any) => nestedChild.isSelected);
    });
  });

  // Update the "Select All" checkbox
  this.isAllSelected = allSelected;
}


get input(){
  return this.RolePermissionForm.controls;
 }

}
