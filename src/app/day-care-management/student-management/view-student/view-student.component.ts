import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../../common-component/common.service';
import Swal from 'sweetalert2';
import { ManageStudentService } from '../manage-student/manage-student.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThirdPartyDraggable } from '@fullcalendar/interaction';
import { CommonModule, NgIf } from '@angular/common';
import { ManageStaffService } from '../../staff-management/add-staff/manage-staff.service';
import { NgSelectModule } from '@ng-select/ng-select';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../environments/environment';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";
import { TooltipComponent } from '../../../common-component/tooltip/tooltip.component';
declare var $: any;

@Component({
  selector: 'app-view-student',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    NgxPaginationModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    NgSelectModule,
    CommonModule,
    SkeletonLoaderComponent,
    TooltipComponent
  ],
  templateUrl: './view-student.component.html',
  styleUrl: './view-student.component.css',
})
export class ViewStudentComponent implements OnInit {
  @Output() update = new EventEmitter<any>();
  @Output() parentList = new EventEmitter<any>();
  public studentList: any[] = [];
  public studentID: number = 0;
  public isModalVisible: boolean = false;
  private centreID: number = 0;
  currentPage = 1;
  itemsPerPage: number = 5;
  private loginUserID: number = 0;
  public searchName: any = '';
  AllClassList: any;
  userRoleId: number | undefined;
  selectedClassId: any;
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  showBanner = true;
  types: any;
  trimmedSearch: any;
  typingTimeout: any;
  skeletonShow: 'Skelton' | 'NoRecord' | '' = '';
  hoveredRow: any = null;


  constructor(
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    private manageStudentService: ManageStudentService,
    private manageStaffSerivece: ManageStaffService,
    private toastr: ToastrService,
    private cookie: CookieService,
    private onBoardingService: OnboardingService,
    private router: Router
  ) { }

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
      if (this.centreID) {
        if (this.cookie.check('UserId')) {
          this.loginUserID = parseInt(this.cookie.get('UserId'));
          this.userRoleId = parseInt(this.cookie.get('UserRoleId'));
        }
        this.getStudentList();
      }
    });
    this.getClassListByTeacherID();
  }

  // selectedClass(selectedClassId: any) {

  //   this.selectedClassId = selectedClassId.classID;
  //   this.getStudentList();
  // }

  closeBanner() {
    this.showBanner = false;
  }

  selectedClass(event: any) {
    if (event) {
      this.selectedClassId = event.classID;
    } else {
      this.selectedClassId = 0;
    }
    this.getStudentList();
  }

  convertMonthsToYears(months: number): number {
    if (months < 0) {
      throw new Error('Invalid input: months cannot be negative.');
    }
    return Math.floor(months / 12);
  }

  convertYearsToMonths(years: number): number {
    if (years < 0) {
      throw new Error('Invalid input: years cannot be negative.');
    }
    return years * 12;
  }

  filterActiveDeactive(type: any) {
    // const types = type
    this.types = type;
    this.getStudentList();
  }

  // async getS3FileName(fileName: Blob) {

  //   // let blob = await this.commonService.getS3FileByName(fileName).toPromise();

  //   if (fileName) {
  //     const imageUrl = URL.createObjectURL(fileName);
  //     return imageUrl;
  //   } else {
  //     return 'Failed to fetch S3 image';
  //   }
  // }

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

  getStudentList() {
    this.skeletonShow = 'Skelton'
    const type = this.types ?? 'active';

    this.studentList = [];

    const classId = this.selectedClassId != null ? this.selectedClassId : 0;

    this.manageStudentService
      .getDaycareStudentList(
        this.centreID,
        this.searchName,
        Number(this.userRoleId),
        Number(this.loginUserID),
        Number(classId),
        type
      )
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            // this.studentList = response.result;

            // setTimeout(() => {

            // response.result.forEach( (item: any) => {
            //   const exists = this.studentList.find((val) => val.id == item.id);
            //   if (!exists) {
            //     item['studentProfileImage'] = item.studentProfileUrl
            //       ?  this.getS3FileName(item.studentProfileUrl)
            //       : '';
            //     this.studentList.push(item);
            //   }
            // });

            this.studentList = response.result.map((item: any) => {
              if (item.isMonthly == true) {
                let minYear = this.convertMonthsToYears(item.minAge);
                let maxYear = this.convertMonthsToYears(item.maxAge);
                return {
                  ...item,
                  label: `${item.minAge} - ${item.maxAge} Months ( ${minYear} - ${maxYear} Years)`,
                  studentProfileImage: item.studentProfileUrl
                    ? this.getS3FileName(item.studentProfileUrl)
                    : '',
                };
              } else {
                let minMonth = this.convertYearsToMonths(item.minAge);
                let maxMonth = this.convertYearsToMonths(item.maxAge);

                return {
                  ...item,
                  label: `${minMonth} - ${maxMonth} Months ( ${item.minAge} - ${item.maxAge} Years)`,
                  studentProfileImage: item.studentProfileUrl
                    ? this.getS3FileName(item.studentProfileUrl)
                    : '',
                };
              }
            });

            // this.skeletonShow = ''

            this.skeletonShow = '';

          } else {
            this.studentList = [];
            this.skeletonShow = '';

          }
        },
        error: (err) => {
          // this.toastr.error(err.message);
          this.skeletonShow = '';

        },
      });
  }

  getClassListByTeacherID() {
    this.manageStaffSerivece
      .getClassListByuserRoleID(
        Number(this.loginUserID),
        Number(this.centreID),
        Number(this.userRoleId)
      )
      .subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            this.AllClassList = response.result;

          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
        error: (err) => {
          this.spinner.hide();
          // this.toastr.error(err.message);
        },
      });
  }

  // onInputChange(){

  //   if(this.searchName.length >= 3) {
  //     this.manageStudentService.getDaycareStudentList(this.centreID,this.searchName).subscribe({
  //       next: (response) => {
  //         if (response.message === 'Success') {
  //           this.studentList = response.result;
  //         };
  //       },
  //       error: (err) => {
  //         this.toastr.error(err.message);
  //       }
  //     })
  //   } else {
  //     this.searchName = "";
  //     this.manageStudentService.getDaycareStudentList(this.centreID,this.searchName).subscribe({
  //       next: (response) => {
  //         if (response.message === 'Success') {
  //           this.studentList = response.result;
  //         };
  //       },
  //       error: (err) => {
  //         this.toastr.error(err.message);
  //       }
  //     })
  //   }
  // }

  // onInputChange() {

  //   const Search = this.searchName?.trim() || '';
  //   this.trimmedSearch = Search;
  //   if (Search.length < 3) {
  //     this.searchName = '';
  //     this.getStudentList();
  //   } else {
  //     this.getStudentList();
  //   }
  // }

  onInputChange() {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.getStudentList();
    }, 1100);
  }

  selectItem(item: any) {
    this.update.emit(item);
    if (this.userRoleId == 4 || this.userRoleId == 3) {
      if (!this.onBoardingService.isOnboarding) {
        if (window.location.href === window.location.origin + '/view-student') {
          const { studentProfileUrl, ...rest } = item;
          const getValue = JSON.stringify(rest);
          this.cookie.set('studentData', getValue);
          this.router.navigate(['/student-enrollment']);
        }
      }
    }

    // else {
    //   let StudentId = item.id;
    //   this.cookie.set('StudentID', StudentId);
    //   this.cookie.set('ParentID', item.parentID);

    //   const secretKey = 'encrypt001100!?';
    //   const encryptedID = CryptoJS.AES.encrypt(
    //     StudentId.toString(),
    //     secretKey
    //   ).toString();

    //   this.router.navigate(['/parent-onboarding'], {
    //     queryParams: { ID: encryptedID, TYPE: 'detail', Update: 'update' },
    //   });
    // }
  }

  onOpenModal(item: any) {
    this.studentID = item.id;
    this.parentList.emit(item.parentList);
    this.isModalVisible = true;
    if (window.location.href.includes('/view-student')) {
      this.cookie.set('ShowModel', 'true');
      const jsonValue = JSON.stringify(item.parentList);
      this.cookie.set('parentList', jsonValue);
      this.router.navigate(['/student-enrollment']);
    }
  }

  sendMailToParentAndTeacherForPassword(studentRecord: any) {
    this.spinner.show();

    let parentId = studentRecord.parentList.map((parent: any) => parent.id);
    this.manageStudentService
      .sendMailToParentAndTeacherForPassword(parentId)
      .subscribe(
        (data) => {
          if (data.message === 'OK') {
            this.spinner.hide();

            this.toastr.success('Mail Sent Successfully');
          }
        },
        (e) => { }
      );
  }

  activeInactive(ID: number, event: any) {
    const isActive: boolean = event.checked;
    Swal.fire({
      title: 'Confirmation',
      text: isActive
        ? 'Are you sure you want to activate this item?'
        : 'Are you sure you want to inactivate this item?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.manageStudentService.activeInactiveEnrolledStudent(ID).subscribe({
          next: (response) => {
            if (response.message === 'Success') {
              this.toastr.success(response.activity);
            }
            setTimeout(() => {
              this.spinner.hide();
            }, 200);
          },
          error: (err) => {
            this.spinner.hide();
            this.toastr.error(err.message);
          },
        });
      } else {
        const checkbox: any = document.getElementById('check' + ID);
        if (checkbox) {
          checkbox.checked = !isActive;
        }
      }
    });
  }
}
