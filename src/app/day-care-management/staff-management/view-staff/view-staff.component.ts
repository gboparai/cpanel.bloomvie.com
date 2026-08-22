import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ManageStaffService } from '../add-staff/manage-staff.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../common-component/common.service';
import { CookieService } from 'ngx-cookie-service';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { response } from 'express';
import { NgxPaginationModule } from 'ngx-pagination';
import * as CryptoJS from 'crypto-js';

import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { environment } from '../../../../environments/environment.development';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  pipe,
  skip,
} from 'rxjs';
import { ManageClassroomService } from '../../classroom-management/manage-classroom/manage-classroom.service';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";
import { TooltipComponent } from '../../../common-component/tooltip/tooltip.component';
import { TimeFormatAmPmPipe, TimeFormatPipe } from '../../../bloomvie-management/dc-appointments-list/time-format.pipe';
declare var $: any;

interface Section {
  classSectionID: number;
  sectionID: number;
  sectionName: string;
}

interface Class {
  classID: number;
  className: string;
  sectionList: Section[];
}

@Component({
  selector: 'app-view-staff',
  standalone: true,
  imports: [
      TooltipComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    BreadcrumbComponent,
    NgxPaginationModule,
    NgSelectModule,
    NgFor,
    NgIf,
    SkeletonLoaderComponent,
    TimeFormatAmPmPipe,
    TimeFormatPipe
  ],
  templateUrl: './view-staff.component.html',
  styleUrl: './view-staff.component.css',
})
export class ViewStaffComponent implements OnInit {
  @Output() update = new EventEmitter<any>();
  public searchTerm: FormControl = new FormControl('');
  StaffNameToSearch: any;
  showBanner = true;
  private centreID: number = 0;
  private loginUserID: number = 0;
  ContentsizePendingList: number = 5;
  ContentPendingList: number = 1;
  public staffList: any[] = [];
  oldTeacherID: any;
  teacherResult: any;
  newTeacherID: any = null;
  classList: any[] = [];
  assignmentForm: any;
  isDuplicateEntry: any;
  assignmentList: any;
  arrIndex1: any;
  sectionList: any;
  assignmentFormControls: any;
  classID: any;
  sectionID: any;
  id: any;
  class: any;
  teacherID: any;
  alreadyAssignedList: any[] = [];
  activeOrInActive: boolean = true;
  sectionData: any;
  classRoomlist: any;
  AllClassList: any;
  classTiming: any;
  dataFromChild: any;
  userRoleID: number = 0;
  openedItemId: number | null = null;
  bloomvieStaff: any[] = [];
  BContentsizePendingList: number = 5;
  BContentPendingList: number = 1;
  cID: number = 0;
  itemIsActive: boolean = false;
  types: any;
  activeType: any;
  trimmedSearch: any;
  teacherViewDetail: any;
  toggleCollapse(itemId: number): void {
    this.openedItemId = this.openedItemId === itemId ? null : itemId;
  }
  counsellorList: any[] = [];
  daycareList: any[] = [];
  selectedCounsellor: any;
  dayCareCentreList: any[] = [];
  dAssignmentIsActive: boolean = false;
  dAssignmentID: number = 0;
  selectedAssignDaycare: number[] = [];
  skeletonShow = 'Skelton';
  skeletonShow2 = 'Skelton2';
  skeletonShow3 = 'Skelton3';
  hoveredRow:any=null;
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  constructor(
    private manageStaffSerivece: ManageStaffService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private cookie: CookieService,
    private router: Router,
    private classService: ManageClassroomService,
    public onBoardingService: OnboardingService,
    private fb: FormBuilder
  ) {
    this.assignmentForm = fb.group({
      teacherId: [null],
      classID: [null, [Validators.required]],
      sectionID: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let enc_id: any = params.get('enc_id');
      if (enc_id) {
        const decryptedId = this.commonService.decrypt(enc_id);
        this.centreID =
          decryptedId && !isNaN(Number(decryptedId))
            ? parseInt(decryptedId, 10)
            : 0;
      } else if (this.cookie.check('CentreID')) {
        this.centreID = parseInt(this.cookie.get('CentreID'));
      }
      // if (this.centreID) {
      if (this.cookie.check('UserId')) {
        this.loginUserID = parseInt(this.cookie.get('UserId'));
      }
      if (this.cookie.check('UserRoleId')) {
        this.userRoleID = parseInt(this.cookie.get('UserRoleId'));
      } else if (this.cookie.check('userRoleID')) {
        this.userRoleID = parseInt(this.cookie.get('userRoleID'));
      }

      this.getStaffList();
      this.searchTerm.valueChanges
        .pipe(debounceTime(1000))
        .subscribe((value: string) => {
          this.getStaffList();
        });
      // }
    });
  }
  closeBanner() {
    this.showBanner = false;
  }

  // get counsellor list
  getCounsellorList(cID: number) {
    this.manageStaffSerivece.getCounsellorList(cID).subscribe((result: any) => {
      if (result.message == 'Success') {
        this.counsellorList = result.result;
      }
    });
  }

  getDaycareClassList() {

    this.skeletonShow2 = 'Skelton2'
    this.spinner.show();
    this.manageStaffSerivece.getDaycareClasses(this.centreID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.classList = response.result;
        }

        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
      },
    });
  }


  displayModalsAccToCondition(ID: any, isActive: boolean) {



    let ActivateMessage = isActive == true ? 'Deactivate' : 'Activate';
    let successMessage = isActive == true ? 'Deactivated' : 'Activated';

    Swal.fire({
      title: `<span style='font-size: 17px'>Do you want to ${ActivateMessage} the teacher account ?<span>`,
      icon: `info`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.manageStaffSerivece
          .activeInactiveStaff(ID)
          .subscribe((res: any) => {
            if (res.message == 'Success') {
              Swal.fire(
                `Account ${successMessage} Successfully`,
                '',
                'success'
              );
              this.commonService.trigger();
              this.getStaffList();
            }
          });
      } else {
        const checkbox: any = document.getElementById('check' + ID);
        if (checkbox) {
          checkbox.checked = true;
          $('#exampleModal').modal('hide');
        }
      }
    });
    // } else {
    //   $('#exampleModal1').modal('show');
    // }
  }

  filterActiveDeactive(type: any) {

    // const types = type
    this.types = type;
    this.getStaffList();
  }



  base64ToBlob(base64: any, mime = 'image/jpeg') {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mime });
  }

  getS3FileName(fileName: any) {
    let response = this.base64ToBlob(fileName);
    const imageUrl = URL.createObjectURL(response);
    return imageUrl;
  }

  async getStaffList() {
    this.skeletonShow = 'Skelton';
    this.bloomvieStaff = [];
    this.staffList = [];
    // this.spinner.show();
    this.activeType = this.types ?? 'active';
    this.manageStaffSerivece.getCentreStaffList(this.centreID, this.searchTerm.value, this.activeType,false)
      .subscribe({
        next: async (response) => {
          if (response.message === 'Success') {
            if (this.userRoleID === 1) {
              this.bloomvieStaff = response.result.map((item: any) => {
                const staffProfile = item.s3ImageUrl
                  ? this.getS3FileName(item.s3ImageUrl)
                  : '';
                return {
                  ...item,
                  staffProfile: staffProfile,
                };
              });
            } else {
              this.staffList = response.result.map((item: any) => {
                const staffProfile = item.s3ImageUrl
                  ? this.getS3FileName(item.s3ImageUrl)
                  : '';
                return {
                  ...item,
                  staffProfile: staffProfile,
                  dayName : item.teacherAvailability?.map((item: any) => item.dayName).toString()
                };
              });

            }
          }
          // setTimeout(() => {
          //   this.spinner.hide();
          // }, 300);

          this.skeletonShow = '';
        },
        error: (err) => {
          // this.spinner.hide();
          this.skeletonShow = '';

          this.toastr.error(err.message);
        },
      });
  }


  viewTeacherDetail(teacherId : any){
    $('#staticBackdrop65').modal('show');
    this.teacherViewDetail = this.staffList.find(x=> x.id == teacherId);
  }

  getClassListByTeacherID(id: any) {
    this.skeletonShow2 = 'Skelton2';

    this.AllClassList = [];
    this.manageStaffSerivece
      .getClassListByTeacherID(id, this.centreID)
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.AllClassList = response.result;
            this.skeletonShow2 = '';

          }


          this.skeletonShow2 = '';

        },
        error: (err) => {
          this.skeletonShow2 = '';

          this.toastr.error(err.message);
        },
      });
  }

  onClassNameClick(id: any) {
        this.skeletonShow3 = 'Skelton3';

    this.classService.getSectionByClassID(id).subscribe({
      next: (response) => {
        if (response.message === 'OK') {
          this.classTiming = response.result;
        }
               this.skeletonShow3 = '';

      },
      error: (err) => {
               this.skeletonShow3 = '';
        this.toastr.error(err.message);
      },
    });
  }

  onCloseModal() {
    const checkbox: any = document.getElementById('check' + this.cID);
    if (checkbox) {
      checkbox.checked = this.itemIsActive;
    }
  }

  async onEdit(item: any) {
    await this.onClassNameClick(item.id);
    item.daycareSection = this.classTiming;

    this.dataFromChild.emit(item);
    this.router.navigate(['/manage-classroom']);
  }

  async activeInactive(ID: any, isActive: boolean) {

    this.classList = [];
    this.teacherID = ID;

    // this.activeOrInActive = isActive;

    const newState = !isActive;

    if (!newState) {
      this.oldTeacherID = ID;
      // this.getAllTeachers();
      // await this.getAllClasses();
      // if (this.classList.length > 0) {
      //   this.activeOrInActive = !isActive;
      // }
    } else {
      this.oldTeacherID = ID;
      this.getDaycareClassList();
    }

    this.displayModalsAccToCondition(ID, isActive);
  }

  deactivatingAccount() {
    Swal.fire({
      title: `<span style='font-size: 17px'>Do you want to deactivate the Staff Account ?<span>`,
      icon: `info`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((res: any) => {
      if (res.isConfirmed) {
        this.manageStaffSerivece
          .assignDayCareByCounsellorID(this.selectedCounsellor, this.cID)
          .subscribe((result: any) => {
            if (result.message == 'Success') {
              this.manageStaffSerivece
                .activeInactiveStaff(this.cID)
                .subscribe((response: any) => {
                  if (response.message == 'Success') {
                    $('#exampleModal5').modal('hide');
                    Swal.fire(
                      'Account Deactivated Successfully !!',
                      '',
                      'success'
                    );
                    this.getStaffList();
                  } else {
                    $('#exampleModal5').modal('hide');
                    this.selectedCounsellor = null;
                    Swal.fire(response.message, '', 'error');
                  }
                });
            } else {
              $('#exampleModal5').modal('hide');
              this.selectedCounsellor = null;
              Swal.fire(result.message, '', 'error');
            }
          });
      } else {
        this.selectedCounsellor = null;
      }
    });
  }

  daycareAssignment() {

    let userID = this.loginUserID ? this.loginUserID : 1;

    this.manageStaffSerivece
      .AssignDaycareToCounsellorAfterActivate(
        userID,
        this.dAssignmentID,
        this.selectedAssignDaycare
      )
      .subscribe((response: any) => {
        if (response.message == 'Success') {
          this.manageStaffSerivece
            .activeInactiveStaff(this.dAssignmentID)
            .subscribe((result: any) => {
              if (result.message == 'Success') {
                this.getStaffList();
                $('#exampleModal6').modal('hide');
                Swal.fire(
                  'Staff Account Activated Successfully',
                  '',
                  'success'
                );
                this.selectedAssignDaycare = [];
              } else {
                this.getStaffList();
                $('#exampleModal6').modal('hide');
                Swal.fire('Something wents wrong !!', '', 'error');
              }
            });
        } else {
          this.toastr.error(response.message);
        }
      });
  }


  onChangeClass(ID: any) {

    this.classID = ID;
    this.sectionList = [];
    this.assignmentForm.get('sectionID').reset();
    this.manageStaffSerivece.getDaycareClassSections(ID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.sectionList = response.result;
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  activeInactiveBloomvieStaff(Item: any) {

    if (Item.isActive == true) {
      if (Item.userRoleID != 6) {
        Swal.fire({
          title: `<span style='font-size: 17px'>'Do you want to Deactivate the staff Account?'<span>`,
          icon: `info`,
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
        }).then((result: any) => {
          if (result.isConfirmed) {
            this.manageStaffSerivece
              .activeInactiveStaff(Item.id)
              .subscribe((result: any) => {
                if (result.message == 'Success') {
                  this.getStaffList();
                  Swal.fire(
                    'Staff Account Deactivated Successfully !!',
                    '',
                    'success'
                  );
                } else {
                  const checkbox: any = document.getElementById(
                    'check' + Item.id
                  );
                  if (checkbox) {
                    checkbox.checked = !Item.isActive;
                  }
                }
              });
          } else {
            const checkbox: any = document.getElementById('check' + Item.id);
            if (checkbox) {
              checkbox.checked = Item.isActive;
            }
          }
        });
      } else {
        if (Item.assignDaycare.length > 0) {
          this.cID = Item.id;
          this.itemIsActive = Item.isActive;
          this.getCounsellorList(this.cID);
          this.daycareList = Item.assignDaycare;
          $('#exampleModal5').modal('show');
        } else {
          Swal.fire({
            title: `<span style='font-size: 17px'>'Do you want to Deactivate the staff Account?'<span>`,
            icon: `info`,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
          }).then((result: any) => {
            if (result.isConfirmed) {
              this.manageStaffSerivece
                .activeInactiveStaff(Item.id)
                .subscribe((result: any) => {
                  if (result.message == 'Success') {
                    $('#exampleModal5').modal('hide');
                    Swal.fire(
                      'Staff Account Deactivated Successfully !!',
                      '',
                      'success'
                    );
                    this.getStaffList();
                  } else {
                    const checkbox: any = document.getElementById(
                      'check' + Item.id
                    );
                    if (checkbox) {
                      checkbox.checked = !Item.isActive;
                    }
                  }
                });
            } else {
              $('#exampleModal5').modal('hide');
              const checkbox: any = document.getElementById('check' + Item.id);
              if (checkbox) {
                checkbox.checked = Item.isActive;
              }
            }
          });
        }
      }
    } else {
      Swal.fire({
        title: `<span style='font-size: 17px'>'Do you want to Activate the staff Account?'<span>`,
        icon: `info`,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then((result: any) => {
        if (result.isConfirmed) {
          // ask for that you want to assign daycare
          Swal.fire({
            title: `<span style='font-size: 17px'>'Do you want to Assign Day care to this Counsellor?'<span>`,
            icon: `info`,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
          }).then((res: any) => {
            if (res.isConfirmed) {
              this.dAssignmentIsActive = Item.isActive;
              this.dAssignmentID = Item.id;
              this.getDayCare(Item.id);
              $('#exampleModal6').modal('show');
            } else {
              this.manageStaffSerivece
                .activeInactiveStaff(Item.id)
                .subscribe((info: any) => {
                  if (info.message == 'Success') {
                    this.getStaffList();
                    Swal.fire(
                      'Staff Account Activated Successfully!!',
                      '',
                      'success'
                    );
                  } else {
                    Swal.fire(info.message, '', 'error');
                  }
                });
            }
          });
        } else {
          const checkbox: any = document.getElementById('check' + Item.id);
          if (checkbox) {
            checkbox.checked = Item.isActive;
          }
        }
      });
    }
  }

  getDayCare(cID: number) {
    this.manageStaffSerivece.getDayCare('false', cID).subscribe((res: any) => {
      if (res.message == 'Success') {
        this.dayCareCentreList = res.result;
      }
    });
  }

  onCloseDaycareAssignmentModal() {
    this.selectedAssignDaycare = [];
    const checkbox: any = document.getElementById('check' + this.dAssignmentID);
    if (checkbox) {
      checkbox.checked = this.dAssignmentIsActive;
    }
  }

  // onChangeSection(sectionID: any) {
  //   
  //   this.sectionID = sectionID;
  // }

  ClassSectionAssignment() {

    this.spinner.show();

    this.manageStaffSerivece
      .TeacherClassSectionAssignment(this.teacherID, this.classID)
      .subscribe(
        (response) => {
          if (response.message == 'Success') {
            this.getStaffList();
            this.spinner.hide();
            Swal.fire('Staff Account Activated Successfully !!', '', 'success');
            $('#exampleModal1').modal('hide');
          } else {
            this.spinner.hide();
            $('#exampleModal1').modal('hide');
            this.toastr.error(response.message);
          }
        },
        (error) => {
          console.error('Error updating class assignment:', error);

          this.spinner.hide();

          this.toastr.error(
            'Error updating class assignment. Please try again.'
          );
        }
      );
  }

  assignedClass() {


    if (this.newTeacherID != null) {
      this.spinner.show();

      this.manageStaffSerivece
        .assignedClassToNewTeacher(
          this.oldTeacherID,
          this.newTeacherID,
          'terminate'
        )
        .subscribe((res: any) => {
          if (res.message == 'Success') {
            this.manageStaffSerivece
              .activeInactiveStaff(this.oldTeacherID)
              .subscribe((response: any) => {
                if (response.message == 'Success') {
                  this.alreadyAssignedList = [];
                  this.newTeacherID = null;
                  this.spinner.hide();
                  this.toastr.success('Record inactive successfully');
                  this.getStaffList();
                  $('#exampleModal').modal('hide');
                } else {
                  this.spinner.hide();
                  this.toastr.error(res.message);
                }
              });
          } else {
            this.spinner.hide();
            this.toastr.error(res.message);
          }
        });
    } else {
      this.toastr.error('Field is mandatory');
    }
  }

  onClose() {
    this.newTeacherID = null;
    this.alreadyAssignedList = [];
    const checkbox: any = document.getElementById('check' + this.oldTeacherID);
    if (checkbox) {
      checkbox.checked = true;
      $('#exampleModal').modal('hide');
    }
  }

  onClose1() {

    const checkbox: any = document.getElementById('check' + this.oldTeacherID);
    if (checkbox) {
      checkbox.checked = false;
      $('#exampleModal1').modal('hide');
    }
  }

  getAllTeachers() {

    this.manageStaffSerivece
      .getAllTeachersNameByCentreID(this.centreID, this.oldTeacherID)
      .subscribe((res: any) => {
        if (res.message == 'Success') {
          this.teacherResult = res.result;

        }
      });
  }

  employeeJourneyDetails(id: any) {

    const encryptedId = CryptoJS.AES.encrypt(
      id.toString(),
      environment.secretKey
    ).toString();
    this.router.navigate(['/teachers-journey'], {
      queryParams: { id: encryptedId },
    });
  }

  // check class assignment
  checkClassAssignment() {

    this.alreadyAssignedList = [];
    this.manageStaffSerivece
      .checkClassAlreadyAssignOrNot(this.oldTeacherID, this.newTeacherID)
      .subscribe((item: any) => {
        if (item.message == 'Success') {
        } else {
          this.alreadyAssignedList = item.result;
        }
      });
  }

  async getAllClasses() {

    let res = await this.manageStaffSerivece
      .getAllClassesByTeacherID(this.oldTeacherID)
      .toPromise();
    if (res.message == 'Success') {
      this.classList = res.result;
      // const classMap: { [key: number]: Class } = {};

      // res.result.forEach((cls: any) => {
      //   if (!classMap[cls.classID]) {
      //     classMap[cls.classID] = {
      //       ...cls,
      //       sectionList: [...cls.sectionList],
      //     };
      //   } else {
      //     classMap[cls.classID].sectionList.push(...cls.sectionList);
      //   }
      // });

      // this.classList = Object.values(classMap);
    }
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

  // selectItem(item: any) {
  //   
  //   const newItem = JSON.stringify(item);
  //   this.cookie.set("staffData", newItem);
  //   this.update.emit();
  //   this.router.navigate(['/staff-enrollment']);

  // }

  selectItem(item: any) {

    const { s3ImageUrl, assignmentList, ...rest } = item;
    const newItem = JSON.stringify(rest);
    // this.cookie.set('staffData', newItem);
    localStorage.setItem('staffData', newItem);
    let url = this.router.url.split('?')[0].split(';')[0];
    if (url == '/onboarding') {
      this.update.emit();
    } else {
      this.update.emit();
      this.router.navigate(['/staff-enrollment']);
    }
  }

  getClassTimings(classID: number) {
    return this.classTiming.filter((ct: any) => ct.classID === classID);
  }

  getDayNames(i:number): string {
    let data  = this.staffList[i]?.teacherAvailability?.map((item: any) => item.dayName);
    return data;
  }
}
