import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ManageStaffService } from '../add-staff/manage-staff.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../common-component/common.service';
import { CookieService } from 'ngx-cookie-service';
import { response } from 'express';
import { NgxPaginationModule } from 'ngx-pagination';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import flatpickr from 'flatpickr';
import { ApplicationServiceService } from '../../../application-status/application-service.service';
import { ProfileService } from '../../../common-component/profile/profile.service';
import { environment } from '../../../../environments/environment';
import { Action } from 'rxjs/internal/scheduler/Action';
import { ManageTeacherService } from '../../../teachers-management/manage-teacher/manage-teacher.service';

declare var $: any;

@Component({
  selector: 'app-view-staff',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    BreadcrumbComponent,
    NgxPaginationModule,
    NgSelectModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './transfer-staff.component.html',
  styleUrl: './transfer-staff.component.css',
})
export class TransferStaffComponent implements OnInit {
  @ViewChild('transferTab') transferTab!: ElementRef;
  @ViewChild('transferTab2') transferTab2!: ElementRef;
  @ViewChild('datePickerInput', { static: false }) datePickerInput!: ElementRef;
  @ViewChild('datePickerInput1', { static: false }) datePickerInput1!: ElementRef;
  readonly rootUrl = environment.apiUrl.slice(0, -3);

  // @ViewChild('transferDateInput') transferDateInput!: ElementRef;

  @Output() update = new EventEmitter<any>();
  StaffNameToSearch: any;
  private centreID: number = 0;
  ContentsizePendingList: number = 5;
  ContentPendingList: number = 1;
  public staffList: any[] = [];
  classList: any[] = [];
  selectStaff: any;
  transferForm: FormGroup;
  loginUserID: any;
  selectedTeacher: any;
  alreadyAssignedList: any[] = [];
  flatpickr1: any;
  departmentOptions = [
    { id: '1', name: 'Teacher' },
    // { id: '2', name: 'Information Technology' },
    // { id: '3', name: 'Finance Department' }
  ];
  primaryDayCarelist: any;
  employeeID: any;
  daycareID: any;
  userRoleID: any;
  selectDate: any;
  selectDepartment: any;
  selectDaycare: any;
  userRoleid: any;
  firstName: any;
  lastName: any;
  userRole: any;
  profileData: any;
  status: any;
  roleSpecializationList: any[] = [];
  assignmentList: any[] = [];
  selectedRoleId: any;
  teacherNameList: any[] = [];
  classAssignment: boolean = true;
  assignedClassTeacherName: any[] = [];
  flatpickr: any;
  transferRecordList: any;
  teacherID: any;

  constructor(
    private manageStaffSerivece: ManageStaffService,
    private manageteacherSerivece: ManageTeacherService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private cookie: CookieService,
    private router: Router,
    private fb: FormBuilder,
    private applicationService: ApplicationServiceService,
    private profileService: ProfileService
  ) {
    this.transferForm = this.fb.group({
      centreID: [0],
      employeeID: [0],
      departmentID: [0, Validators.required],
      replaceCentreID: [0, Validators.required],
      oldEmployeeID: [0],
      centreAdminID: [0],
      action: ['EMPLOYEE Transfer'],
      actionDate: ['', Validators.required],
      userRoleID: [0],
      status: [3],
      roleSpecializationID: [0, Validators.required],
    });
  }

  ngOnInit(): void {
    ;
    this.route.queryParamMap.subscribe((params) => {
      let enc_id: any = params.get('enc_id');
      if (enc_id) {
        const decryptedId = this.commonService.decrypt(enc_id);
        this.centreID = decryptedId && !isNaN(Number(decryptedId)) ? parseInt(decryptedId, 10) : 0;
      } else if (this.cookie.check('CentreID')) {
        this.centreID = parseInt(this.cookie.get('CentreID'));
      }
      if (this.centreID) {
        if (this.cookie.check('UserId')) {
          this.loginUserID = parseInt(this.cookie.get('UserId'));
        }
        this.getStaffList();

      }
    });
  }

  onChangeRole() {
    this.roleSpecializationList = [];
    this.manageStaffSerivece
      .getRoleSpecializationList(this.userRoleid)
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.roleSpecializationList = response.result;
          } else {
            this.roleSpecializationList = [];
          }
        },
        error: (err) => {
          this.toastr.error(err.message);
        },
      });
    // if (data.name.toUpperCase().trim() === 'TEACHER') {
    //   // this.isAssignmentVisible = true;
    // } else {
    //   // this.isAssignmentVisible = false;
    //   this.assignmentList = [];
    // }
  }

  selectedRole(e: any) {
    ;
    this.selectedRoleId = e.id;
  }

  // ngAfterViewInit(): void {
  //   //  
  //   const currentDate = new Date();
  //   flatpickr('#transferDateInput', {
  //     dateFormat: 'm-d-Y',
  //     allowInput: true,
  //     minDate: currentDate,
  //   });
  // }

  getPrimaryDayCareList() {
    ;

    var type = 'transferstaff'

    this.applicationService
      .getPrimaryDayCareList(this.centreID, type)
      .subscribe((data) => {
        if (data.message === 'OK' && data.result) {
          this.primaryDayCarelist = data.result;
        } else {
          console.warn('Data not found.');
        }
      });
  }

  onSearchNameAndEmail() {
    ;

    let trimmedNameOrEmail = this.StaffNameToSearch?.trim();

    if (!trimmedNameOrEmail) {
      this.getStaffList();
      return;
    }

    if (trimmedNameOrEmail.length > 3) {
      this.manageStaffSerivece
        .getStaffAccToNameAndEmailSearch(trimmedNameOrEmail, this.centreID)
        .subscribe({
          next: (data) => {
            if (data?.message === 'Success') {
              this.staffList = data.result ?? [];

              this.ContentPendingList = 1
            }
          },
          error: (error) => {
            console.error('Error fetching staff list:', error);
          }
        });
    } else {
      this.getStaffList();
    }
  }


  async getAllClassesByTeacherID() {
    ;
    let item = await this.manageStaffSerivece
      .getAllClassesByTeacherID(this.employeeID)
      .toPromise();
    if (item.message == 'Success') {
      this.classList = item.result;
    }
  }


  previousTab() {
    ;
    setTimeout(() => {
      if (this.transferTab2) {
        (this.transferTab2.nativeElement as HTMLElement).click(); // Click to activate tab
      }
    }, 0);
  }


  onSelectedTeacher(newTeacherID: any) {
    ;
    this.teacherID = newTeacherID;

    this.cookie.set('newTeacherID', this.teacherID);

    this.redirectToNextPage();
  }



  assignClassToOtherTeacher() {
    ;

    if (this.selectedTeacher != null) {
      Swal.fire({
        title: `<span style='font-size: 17px'>Do you want to Transfer the classes?<span>`,
        icon: `info`,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `<span style='font-size: 17px'>Transfer Classes Successfully..<span>`,
            icon: `success`,
            confirmButtonText: 'OK',
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((res) => {
            if (res.isConfirmed) {
              this.classAssignment = false;
              this.selectedTeacher = null;
              this.redirectToNextPage(); // Redirect function
            }
          });
        }
      });
    } else {
      this.redirectToNextPage();
    }
  }

  redirectToNextPage() {
    setTimeout(() => {
      if (this.transferTab) {
        (this.transferTab.nativeElement as HTMLElement).click();
      }
    }, 0);
  }




  // assignClassToOtherTeacher() {
  //    ;
  //   if (this.selectedTeacher != null) {
  //     Swal.fire({
  //       title: `<span style='font-size: 17px'>Do you want to Transfer the classes ?<span>`,
  //       icon: `info`,
  //       showCancelButton: true,
  //       confirmButtonText: 'Yes',
  //       cancelButtonText: 'No',
  //     }).then(
  //       (result) => {
  //         if (result.isConfirmed) {
  //           this.manageStaffSerivece
  //             .assignedClassToNewTeacher(
  //               this.employeeID,
  //               this.selectedTeacher,
  //               'transfer'
  //             )
  //             .subscribe((item: any) => {
  //               if (item.message == 'Success') {
  //                 Swal.fire({
  //                   title: `<span style='font-size: 17px'>Transfer Classes Successfully..<span>`,
  //                   icon: `success`,
  //                   confirmButtonText: 'ok',
  //                   allowEscapeKey: false,
  //                   allowOutsideClick: false,
  //                 }).then((res) => {
  //                   if (res.isConfirmed) {
  //                     this.classAssignment = false;

  //                     this.assignedClassTeacherName =
  //                       this.teacherNameList.filter(
  //                         (data: any) => data.teacherID == this.selectedTeacher
  //                       );
  //                     this.selectedTeacher = null;
  //                     setTimeout(() => {
  //                       if (this.transferTab) {
  //                         (
  //                           this.transferTab.nativeElement as HTMLElement
  //                         ).click();
  //                       }
  //                     }, 0);
  //                   }
  //                 });
  //               }
  //             });
  //         }
  //       },
  //       (error) => {
  //         this.toastr.error('Server not responding.', 'Service Error');
  //       }
  //     );
  //   } else {
  //     setTimeout(() => {
  //       if (this.transferTab) {
  //         (this.transferTab.nativeElement as HTMLElement).click();
  //       }
  //     }, 0);
  //   }
  // }

  async getAllTeacherNameByCenterID() {
    ;
    let item = await this.manageStaffSerivece
      .getAllTeachersNameByCentreID(this.centreID, this.employeeID)
      .toPromise();
    if (item.message == 'Success') {
      this.teacherNameList = item.result;
      await this.getAllClassesByTeacherID();
    } else {
      await this.getAllClassesByTeacherID();
    }
  }

  async onSelectStaff(event: any, item: any) {
    ;
    this.employeeID = item.id;
    this.daycareID = item.centreID;
    this.userRoleid = item.userRoleID;
    this.firstName = item.firstName;
    this.lastName = item.firstName;
    this.userRole = item.userRole;
    await this.getAllTeacherNameByCenterID();

    this.onChangeRole();
    this.getPrimaryDayCareList();
    this.getProfileDetails();
    event.preventDefault();
    if (this.classList.length > 0) {
      $('#exampleModal').modal('show');
    } else {
      $('#transfer-teacher').modal('show');
    }
  }

  getStaffList() {
    ;
    // this.spinner.show();

    var type = 'transferStaff'
    this.manageStaffSerivece
      .getCentreStaffList(this.centreID, '', '', true)
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.spinner.hide();
            this.staffList = response.result;

          }

        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err.message);
        },
      });
  }

  ngAfterViewInit(): void {
    ;
    this.flatpickr = flatpickr(this.datePickerInput.nativeElement, {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: new Date(),
      onChange: (selectedDates, dateStr) => {
        this.transferForm.controls['actionDate'].setValue(dateStr);
        this.selectDate = dateStr;
      },
    });

    this.flatpickr1 = flatpickr(this.datePickerInput1.nativeElement, {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: new Date(),
      onChange: (selectedDates, dateStr) => {
        this.transferForm.controls['actionDate'].setValue(dateStr);
        this.selectDate = dateStr;
      },
    });
  }

  onSelectDate(event: any) {
    ;
    if (event?.target?.value) {
      this.selectDate = event.target.value; // Get selected date from input event
    } else {
      this.selectDate = null;
    }
  }

  onSelectDepartment(event: any) {
    ;
    this.selectDepartment = parseInt(event.id);
  }

  checkClassAssignment() {
    ;
    this.alreadyAssignedList = [];
    this.manageStaffSerivece
      .checkClassAlreadyAssignOrNot(this.employeeID, this.selectedTeacher)
      .subscribe((item: any) => {
        if (item.message == 'Success') {
        } else {
          this.alreadyAssignedList = item.result;
        }
      });
  }

  onSelectdaycare(event: any) {
    ;
    this.selectDaycare = event.id;
  }

  submitForm() {
    ;

    this.spinner.show();

    this.transferForm.patchValue({
      centreID: this.daycareID,
      employeeID: this.employeeID,
      oldEmployeeID: this.teacherID,
      departmentID: this.selectDepartment,
      userRoleID: this.userRoleid,
      centreAdminID: this.primaryDayCarelist[0].centreAdminID,
      replaceCentreID: this.selectDaycare,
      actionDate: this.selectDate ? new Date(this.selectDate) : null,
      roleSpecializationID: this.selectedRoleId,

      action: 'EMPLOYEE Transfer',
      status: 3,
    });

    this.commonService
      .manageEmployeeJourney(this.transferForm.value)
      .subscribe(
        (response) => {
          if (response.message === 'OK') {
            ;
            setTimeout(() => {
              if (this.transferTab2) {
                (this.transferTab2.nativeElement as HTMLElement).click();
              }
            }, 0);
            this.classAssignment = true;
            this.toastr.success('Staff transferred successfully!');
            this.transferForm.reset();
            $('#exampleModalLabel1').modal('hide');
            $('#exampleModal').modal('hide');
            $('#exampleModalLabel').modal('hide');
            $('#transfer-teacher').modal('hide');
            this.getStaffList();


          } else {
            this.toastr.error('Failed to transfer staff.', 'Error');
            this.getStaffList();

          }
        },
        (error) => {
          this.toastr.error(
            'An error occurred while processing the request.',
            'Error'
          );
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }



  getStaffTransferedDetailsByCentreID() {

    // this.spinner.show();


    var status = 'pending'
    var type = 'allStaff'

    this.manageteacherSerivece.getStaffTransferedDetailsByCentreID(this.centreID, 3, status, type).subscribe((item: any) => {
      if (item.message == 'Success') {
        this.transferRecordList = item.result;
        // this.spinner.hide();
      }
    })
  }

  getProfileDetails() {
    this.profileService.GetUserById(this.employeeID, this.userRoleid).subscribe(
      (response) => {
        if (response.message === 'Success' && response.result) {
          this.profileData = response.result;
        } else {
          console.warn('Profile data not found.');
        }
      },
      (error) => {
        console.error('Error fetching profile details:', error);
      }
    );
  }

  onClose() {
    this.transferForm.reset();
    $('#exampleModalLabel').modal('hide');
  }

  sendEmail(userID: any) {
    Swal.fire({
      title: `<span style='font-size: 17px'>Do you want to send an Email ?<span>`,
      icon: `info`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.spinner.show();
          this.commonService
            .sendEmailToParentAndStudent(userID)
            .subscribe((response: any) => {
              if (response.message == 'OK') {
                this.spinner.hide();

                Swal.fire('Email Send Successfully!', '', 'success');
              } else {
                Swal.fire(`${response.message}`, '', 'error');
              }
            });
        }
      },
      (error) => {
        this.toastr.error('Server not responding.', 'Service Error');
      }
    );
  }

  selectItem(item: any) {
    const newItem = JSON.stringify(item);
    this.cookie.set('staffData', newItem);
    this.update.emit();
    this.router.navigate(['/staff-enrollment']);
  }
}
