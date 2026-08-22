import { Component, ElementRef, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  FormGroup,
  Validators,
  RequiredValidator,
  NgForm,
} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { error } from 'node:console';
import { AssignUserPermissionService } from './assign-user-permission.service';

declare var $: any;

@Component({
  selector: 'app-assign-user-permission',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    RouterLink,
    RouterOutlet,
    ReactiveFormsModule,
    NgFor,
    CommonModule,
    NgSelectModule,
    NgIf,
    NgxPaginationModule,
    ToastrModule,
    NgxSpinnerModule,
    FormsModule,
  ],
  templateUrl: './assign-user-permission.component.html',
  styleUrl: './assign-user-permission.component.css',
})
export class AssignUserPermissionComponent {
  key: any;
  user: any;
  UserRoleList: any;
  userRoleId: any;
  isActive: boolean | null = null;
  EmployeeRoleList: any[] = [];
  currentPage: number = 1; // Current page number
  itemsPerPage: number = 5; // Maximum rows per page
  totalCount: number = 0;
  assignEmployeeRole: any;
  currentUserRoleId: any = 0;
  currentisActive: any = '';
  selectedDayCare: any;
  disableMark: boolean = false;

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];
  selectStatusId: any;
  @ViewChild('formSection') formSection!: ElementRef;
  DayCareList: any;
  isCounsellorSelected: boolean = false;
  DayCareID: any;
  id: any;
  daycare: any;
  type: any;
  constructor(
    private service: AssignUserPermissionService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.assignEmployeeRole = new FormGroup({
      id: new FormControl(0, [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      contact: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/),
      ]),
      UserRoleId: new FormControl('', [Validators.required]),
      CentreID: new FormControl(''),
    });
  }
  ngOnInit() {
    this.getAllUserRoles();
    this.getAllEmployeeRole();
    //this.filterEmployeeRoles(this.userRoleId,this.isActive);
  }

  getAllUserRoles() {
    this.service.getUserRole().subscribe((data) => {
      if (data.message === 'OK') {
        this.UserRoleList = data.result.filter((role: any) =>
          [6, 9, 10, 11].includes(role.id)
        );
       
      }
    });
  }

  getAllDayCare(type: any) {
    this.service.getDayCare(type).subscribe((data) => {
      if (data.message === 'Success') {
        this.DayCareList = data.result;
        
      }
    });
  }

  // Filter(key:any,type:string){
  //   if(type==='ACTIVE-INACTIVE'){
  //    this.isActive=key;
  //    };
  //   this.filterEmployeeRoles(this.userRoleId,this.isActive);
  // }

  //Sorting

  compareByIdDescending(a: any, b: any) {
    return b.id - a.id;
  }
  sortEmployeeRoleList() {
    this.EmployeeRoleList.sort(this.compareByIdDescending);
  }
  //
  getAllEmployeeRole() {
    this.service.getEmployeeRole('', '').subscribe((data) => {
      if (data.message === 'OK') {
        this.EmployeeRoleList = data.result;

        this.totalCount = this.EmployeeRoleList.length || 0;
        //sorting:
        this.sortEmployeeRoleList();
      } else {
        this.totalCount = 0;
      }
    });
  }

  filterEmployeeRoles(userRoleId?: any, isActive?: any): void {
    this.EmployeeRoleList = [];
    this.totalCount = 0;
    let finaluserRoleId =
      userRoleId > 0 ? userRoleId : this.currentUserRoleId || 0;
    let finalisActive =
      isActive == true || isActive == false
        ? isActive
        : this.currentisActive || '';

    // If both parameters are null, return all records
    if (finaluserRoleId == 0 && finalisActive == null) {
      this.service.getEmployeeRole(0, '').subscribe({
        next: (roles) => {
          this.EmployeeRoleList = roles;
          this.totalCount = this.EmployeeRoleList.length || 0;
          // this.toastr.success('All employee roles fetched successfully!');
          this.sortEmployeeRoleList();
        },
        error: (err) => {
          this.EmployeeRoleList = [];
          this.totalCount = 0;
          this.toastr.error('Failed to fetch employee roles.');
          console.error('Error fetching employee roles:', err);
        },
      });
    } else {

      // filtering based on provided parameters
      this.service.getEmployeeRole(finaluserRoleId, finalisActive).subscribe({
        next: (roles) => {
          
          this.EmployeeRoleList = roles.result;
          this.totalCount = this.EmployeeRoleList.length || 0;
          // this.toastr.success('Employee roles fetched successfully!');
        },
        error: (err) => {
          this.EmployeeRoleList = [];
          this.totalCount = 0;
          this.toastr.error('Failed to fetch employee roles.');
          console.error('Error fetching employee roles:', err);
        },
      });
    }

    this.currentUserRoleId = finaluserRoleId;
    this.currentisActive = finalisActive;
  }

  activeInactiveEmployeeStatus(id: any, currentStatus: any) {
    let newStatus = !currentStatus.checked; // Toggle status
    let action = '';
    if (currentStatus.checked == false) {
      action = 'deactivate';
    }
    if (currentStatus.checked == true) {
      action = 'activate';
    }
    // var action = newStatus ? 'activate' : 'deactivate';
    let confirmText = `Are you sure you want to ${action} the user?`;

    //confirmation alert

    Swal.fire({
      title: `<span style='font-size: 17px'>${confirmText} <span>`,
      icon: `warning`,
      showCancelButton: true,
      confirmButtonText: 'Save',
      // allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.service
          .activeInActiveEmployeeStatusByID(id, currentStatus)
          .subscribe(
            (response) => {
              if (response.message === 'OK') {
                // Success
                const employee = this.EmployeeRoleList.find((e) => e.id === id);
                if (employee) {
                  employee.isActive = newStatus;
                }
                Swal.fire('User Status Updated successfully!', '', 'success');
              } else {
                //error alert
                this.toastr.error(
                  'Failed to update the status. Please try again.',
                  'Error'
                );
              }
            },
            (error) => {
              this.toastr.error('Server not responding.', 'Service Error');
            }
          );
      } else {
        
        //user selects cancel
        Swal.fire('Action cancelled', '', 'info');
        function check() {
          $('#checkBoxAinA' + id).prop('checked', true);
        }
        function uncheck() {
          $('#checkBoxAinA' + id).prop('checked', false);
        }
        currentStatus.checked ? check() : uncheck();
      }
    });
  }

  removeValidation() {
  
    this.assignEmployeeRole.reset();
    this.disableMark = true;
    this.assignEmployeeRole.get('CentreID').clearValidators();
    // this.assignEmployeeRole
    //   .get('CentreID')
    //   .setValidators([Validators.required]);
  }

  onRoleChange(event: any, type: any) {
  
    // Check if the selected role is 'Counsellor'

    this.type = type;
    var selectedRole = event.userRole;
    if (selectedRole === 'Counsellor') {
      this.isCounsellorSelected = true;
      this.getAllDayCare(type);
    } else {
      this.isCounsellorSelected = false;
      this.assignEmployeeRole.get('CentreID').clearValidators();
    }

    this.assignEmployeeRole.get('CentreID').updateValueAndValidity();
  }

  manageEmployeeData() {
    if (this.assignEmployeeRole.valid) {
      this.spinner.show();
      if (this.assignEmployeeRole.CentreID == '') {
        this.assignEmployeeRole.patchValue({
          CentreID: 0,
        });
      }
      this.service.EmployeeRole(this.assignEmployeeRole.value).subscribe(
        (result: any) => {
          if (result.message == 'Ok') {
            this.spinner.hide();
            this.toastr.success('Submitted data successfully!', 'Success');
            this.resetForm();
            $('#assEmpRole').modal('hide');

            this.getAllEmployeeRole();
          } else if (result.message === 'Email ALready Exists') {
            this.spinner.hide();
            this.toastr.warning('Email already exists.');
          } else {
            this.spinner.hide();
            this.toastr.error(
              'An unexpected error occurred. Please try again.',
              'Error'
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            'Failed to submit data. Please try again later.',
            'Service Error'
          );
          console.error('Error:', error);
        }
      );
    } else {
      this.assignEmployeeRole.markAllAsTouched();
    }
  }

  onEditEmployee(employee: any, type: any) {
    this.type = type;

    this.getAllDayCare(type);
    $('#assEmpRole').modal('show');
    if (employee.userRoleID == 6) {
      this.disableMark = false;
      this.isCounsellorSelected = true;
      this.assignEmployeeRole
        .get('CentreID')
        .setValidators([Validators.required]);
    } else {
      this.isCounsellorSelected = false;
    }

    var ar: any[] = [];
    employee.centreDetails.forEach((element: { centreID: any }) => {
      ar.push(element.centreID);
      //  alert(element.centreID)
    });

    // Patching
    this.assignEmployeeRole.patchValue({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      contact: employee.contact,
      UserRoleId: employee.userRoleID,
      CentreID: ar,
      // CentreID: this.DayCareList.id,
    });
    this.formSection.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    // this.selectedEmployeeId = employee.id;
  }

  resetAndClose() {
    // Hide the modal using jQuery
    $('#assEmpRole').modal('hide');
    this.assignEmployeeRole.reset();
  }

  onDayCareChange() {
    let selectedDayCares = this.assignEmployeeRole.value.CentreID;
    let index = selectedDayCares[selectedDayCares.length - 1];
    this.service.validateDayCareAssignment(index).subscribe((result: any) => {
      if (result.message === 'Invalid') {
        let updateddayCares = selectedDayCares.filter(
          (dayCare: any) => dayCare != index
        );
        this.assignEmployeeRole.get('CentreID')?.setValue(updateddayCares);
        this.toastr.error('Daycare already assigned to another counsellor');
      } else {
        this.assignEmployeeRole.get('CentreID')?.patchValue(selectedDayCares);
      }
    });
  }

  resetForm() {
    this.assignEmployeeRole.reset({
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      contact: '',
      UserRoleId: '',
    });
  }

  clearUserRoleId() {}
}

// constructor(private fb:FormBuilder){
//   this.user = this.fb.group(){
//     firstName : []
//   }
//      }
