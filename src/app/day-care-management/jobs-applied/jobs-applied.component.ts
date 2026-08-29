import { Component, input, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { JobPortalServiceService } from '../job-portal-details/job-portal-service.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { SubscriptionPlansComponent } from '../subscription-plans/subscription-plans/subscription-plans.component';
import { ClassroomDetailsService } from '../classroom-management/classroom-details/classroom-details.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ViewStudentEnrollmentService } from '../student-management/view-student-enrollment/view-student-enrollment.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../common-component/common.service';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";
import { TooltipComponent } from '../../common-component/tooltip/tooltip.component';
declare var $: any;
@Component({
  selector: 'app-jobs-applied',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    CommonModule,
    NgFor,
    NgIf,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SkeletonLoaderComponent,
    TooltipComponent

  ],
  templateUrl: './jobs-applied.component.html',
  styleUrl: './jobs-applied.component.css',
})
export class JobsAppliedComponent implements OnInit {
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  ContentP: number = 1;
  Contentsize: number = 5;
  JobsApplied: any;
  userInfo: any;
  centerID: any;
  userRoleID: any;
  JobList: any;
  filteredJobList: any[] = [];
  TOCListing: any;
  ModalList: any = [];
  msg: any;
  approveForm: FormGroup;
  jobPostingList: any;
  searchText: any = '';
  classList: any;
  assignClassForm: FormGroup;
  sectionList: any;
  selectedSection: any;
  selectedClass: any;
  selectedTeacherName: any;
  selecteedSection: any;
  jobID: any;
  jobid: any;
  status: any;
  selectedTeachers: number[] = [];
  unselectedTeachers: number[] = [];
  selectJobID: number[] = [];
  selectAll: boolean = false;
  UserID: any;
  previousStatus: string = '';
  skeletonShow: string = 'Skelton';
  hoveredRow: any = null;



  statusOptions = [
    {
      label: 'Pending',
      value: 'Pending',
      cssClass: 'status-pending',
      disabled: true,
    },
    {
      label: 'Shortlisted',
      value: 'Shortlisted',
      cssClass: 'status-shortlisted',
    },
    { label: 'Approved', value: 'Approved', cssClass: 'status-approved' },
    { label: 'Reject', value: 'Reject', cssClass: 'status-rejected' },
    { label: 'OnHold', value: 'OnHold', cssClass: 'status-onhold' },
  ];

  // item = {
  //   status: 'Pending',
  //   teacherId: 1,
  //   userId: 123
  // };

  Shortlisted = [
    {
      label: 'Shortlisted',
      value: 'Shortlisted',
      cssClass: 'status-shortlisted',
      disabled: true,
    },
    { label: 'OnHold', value: 'OnHold', cssClass: 'status-onhold' },
    { label: 'Reject', value: 'Reject', cssClass: 'status-rejected' },
  ];

  approveTeacherList = [
    {
      label: 'Approved by Teacher',
      value: 'Approved by Teacher',
      cssClass: 'status-approved status-approved-by-teacher',
      disabled: true,
    },
    {
      label: 'Daycare Approval Complete',
      value: 'Approved',
      cssClass: 'status-approved status-approved-by-teacher',
    },
    {
      label: 'Daycare Rejection Finalized',
      value: 'Reject',
      cssClass: 'status-rejected',
    },
  ];

  inputField: any;

  constructor(
    private spinner: NgxSpinnerService,
    private jobPortalservice: JobPortalServiceService,
    private viewStudent: ViewStudentEnrollmentService,
    private Toaster: ToastrService,
    private cookies: CookieService,
    private Classroom: ClassroomDetailsService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {
    (this.approveForm = this.formBuilder.group({
      id: 0,
      statusID: '',
      reason: '',
    })),
      (this.assignClassForm = this.formBuilder.group({
        id: 0,
        classID: '',
        // sectionID: '',
        teacherID: '',
      }));
  }

  async ngOnInit(): Promise<void> {
    try {
      const userInfoString = this.cookies.get('UserInfo');

      if (userInfoString) {
        const parsedInfo = JSON.parse(userInfoString);
        this.UserID = parsedInfo.result?.id || null;
        this.centerID = parsedInfo.result?.centreID || null;
        this.userRoleID = parsedInfo.result?.userRoleID || null;
      } else {
        console.warn('UserInfo cookie is empty or not set');
      }
      this.route.queryParams.subscribe((params) => {
        this.jobID = params['jobId'];
      });

      await this.JobAppliedList();

      if (this.centerID != null) {
        setTimeout(() => {
          this.getJobList('received');
        }, 500);
      }
    } catch (error) {
      console.error('Error initializing component:', error);
    }

    this.getDDCJobPosting();
  }

  JobAppliedList() {
    this.jobPortalservice.getAppliedJobPostings(1).subscribe(
      (data) => {
        if (data.message === 'ok') {
          this.JobsApplied = data.result;
        } else {
        }
      },
      (error) => {
        console.error('Error while fetching job postings:', error);
      }
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Shortlisted':
        return 'status-shortlisted';
      case 'Approved':
        return 'status-approved';
      case 'Reject':
        return 'status-rejected';
      case 'OnHold':
        return 'status-onhold';
      default:
        return '';
    }
  }

  // downloadResume(resume: any) {
  //   const fileUrl = `${this.rootUrl}${resume}`;
  //   this.downloadFile(fileUrl);
  // }

  // downloadFile(fileUrl: any) {
  //   const link = document.createElement('a');
  //   link.href = fileUrl;
  //   link.target = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
  //   link.click();
  // }

  onJobPost(event: any) {
    this.jobID = event.id;

    this.getJobList(this.status);
  }


  getJobList(status: any) {
    this.JobList = '';
    this.skeletonShow = 'Skelton';

    this.status = status;
    if (this.searchText.length >= 3 || this.searchText == '') {
      this.searchText = this.searchText != '' ? this.searchText : '';
      if (this.jobID == undefined) {
        this.jobID = '';
      } else {
        this.jobID;
      }

      this.jobPortalservice
        .getAppliedJobPosting(
          this.centerID,
          this.searchText,
          this.jobID,
          status
        )
        .subscribe((data) => {
          if (data.message == 'ok') {
            this.JobList = data.result;
            data.result.forEach((item: any) => {
              const exists = this.JobList.find(
                (val: { teacherId: any }) => val.teacherId == item.teacherId
              );
              if (!exists) {
                item['documentImageUrl'] = item.documentImageUrl
                  ? this.getS3FileName(item.documentImageUrl)
                  : '';
                this.JobList.push(item);
              }
            });
            this.filteredJobList = this.JobList;
            this.skeletonShow = '';

          } else if (data.message == 'No records found') {
            this.skeletonShow = '';

            this.JobList = '';

          }
          this.skeletonShow = '';

        });
    }
  }

  getS3FileName(fileName: any) {
    let response = this.base64ToBlob(fileName);
    const imageUrl = URL.createObjectURL(response);
    return imageUrl;
  }

  base64ToBlob(base64: string, mime = 'image/jpeg'): Blob {
    if (!base64 || typeof base64 !== 'string') return new Blob();
    try {
      const cleanedBase64 = base64.trim().replace(/\s/g, '');
      const byteCharacters = atob(cleanedBase64);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
        byteArrays.push(new Uint8Array(byteNumbers));
      }

      return new Blob(byteArrays, { type: mime });
    } catch (error) {
      console.error(
        'Failed to convert base64 to Blob:',
        error,
        base64.slice(0, 30)
      );
      return new Blob();
    }
  }

  downloadResume(base64Data: string, fileName: string) {
    try {
      const extension = fileName.split('.').pop()?.toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        txt: 'text/plain',
        csv: 'text/csv',
        zip: 'application/zip',
        mp4: 'video/mp4',
        mp3: 'audio/mpeg',
        // Add more types as needed
      };

      const mimeType = mimeTypes[extension || ''] || 'application/octet-stream';

      const base64Index = base64Data.indexOf('base64,');
      const cleanBase64 =
        base64Index !== -1 ? base64Data.substring(base64Index + 7) : base64Data;

      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();

      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download error:', error);
    }
  }


  getDDCJobPosting(): void {
    this.skeletonShow = 'Skelton';
    this.jobPortalservice.getDaycareCentreJobPosting(this.centerID).subscribe({
      next: (data) => {
        this.jobPostingList = data.result ?? [];
        this.skeletonShow = '';

      },
      error: (err) => {
        console.error(err);
        this.skeletonShow = '';

      }
    });
  }


  SelectedTeacher(teacherId: any) {
    this.ModalList = this.JobList.filter((x: any) => x.teacherId === teacherId);
  }




  onStatusChange(
    teacherId: any,
    status: string,
    userId: any,
    index?: any,
    tab?: any
  ) {
   
    if (status === 'Shortlisted') {
      this.approveShortlist(teacherId, 'received', userId);
    } else if (status === 'Reject') {
      this.rejectShortlist(teacherId, 'daycareReject', userId, index, tab);
    } else if (status === 'OnHold') {
      this.approveOnHold(teacherId, 'shortlisted', userId);
    } else if (status === 'Approved') {
      this.approveDaycare(teacherId, 'approved', userId, index);
    }
  }

  async approveShortlist(id: any, type: any, encryptedUserID: any) {
  
    Swal.fire({
      html: `
      <div class="swal-static-container" style="    display: flex
;
    flex-direction: column;
    justify-content: center;
    align-items: center;">
        <div class="swal2-icon swal2-question" style="display: flex; margin: 0.5em 6.7em 1.1em 5.6em !important;">
          <div class="swal2-icon-content">?</div>
        </div>
        <div class="swal-static-content">
          <h2 class="swal-static-title">Confirmation</h2>
          <p class="swal-static-text">Please confirm if you would like to approve this candidate.</p>
        </div>
      </div>
    `,
      showConfirmButton: true,
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setTimeout(() => {
          this.ApprovedReject(id, 9, '', type, encryptedUserID);
        }, 500);
        this.getDDCJobPosting();
      }
    });
  }

  async rejectShortlist(
    id: any,
    type: any,
    encryptedUserID: any,
    index?: any,
    tab?: any
  ) {
    
    Swal.fire({
      html: `
        <div class="swal-static-container" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div class="swal2-icon swal2-question" style="display: flex; margin: 0.5em 6.7em 1.1em 5.6em !important;">
            <div class="swal2-icon-content">?</div>
          </div>
          <div class="swal-static-content">
            <h2 class="swal-static-title">Confirmation</h2>
            <p class="swal-static-text">Please confirm if you would like to reject this candidate.</p>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showDenyButton: true,
      showCancelButton: true,
      denyButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      denyButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
        denyButton: 'swal-deny-btn',
        cancelButton: 'swal-cancel-btn',
      },
    }).then((result) => {
      if (result.isDenied) {
        Swal.fire({
          title: 'Enter Reason for Rejection',
          input: 'textarea',
          inputPlaceholder: 'Type your reason here...',
          inputAttributes: {
            'aria-label': 'Type your reason here',
          },
          showCancelButton: true,
          cancelButtonColor: '#6c757d',
          cancelButtonText: 'Cancel',
          preConfirm: (inputValue) => {
            if (!inputValue || inputValue.trim() === '') {
              Swal.showValidationMessage(
                'Reason for rejection cannot be empty!'
              );
              return false;
            }
            return inputValue;
          },
        }).then((reasonResult) => {
          if (reasonResult.isConfirmed && reasonResult.value) {
            const reason = reasonResult.value.trim();
            this.ApprovedReject(id, 2, reason, type, encryptedUserID);
            this.getDDCJobPosting();

            if (tab == 'Shortlisted') {
              this.getJobList('shortlisted');
            }
          } else if (
            result.dismiss === Swal.DismissReason.cancel &&
            tab == 'Shortlisted'
          ) {
            this.getJobList('shortlisted');
          }
        });
      }
    });
  }

  async approveOnHold(id: any, type: any, encryptedUserID: any) {
   
    Swal.fire({
      html: `
        <div class="swal-static-container" style="    display: flex
;
    flex-direction: column;
    justify-content: center;
    align-items: center;">
  <div class="swal2-icon swal2-question" style="display: flex; margin: 0.5em 6.7em 1.1em 5.6em !important;">
    <div class="swal2-icon-content">?</div>
  </div>
  <div class="swal-static-content">
    <h2 class="swal-static-title">Confirmation</h2>
    <p class="swal-static-text">Please confirm if you would like to send the teacher's terms and conditions to this candidate.</p>
  </div>
</div>

      `,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Approved',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // setTimeout(() => {
        this.ApprovedReject(id, 11, '', type, encryptedUserID);
        // }, 500);
      }
      // else if (result.dismiss === Swal.DismissReason.cancel) {
      //   this.getJobList('shortlisted');
      // }
    });
  }

  async approveDaycare(id: any, type: any, encryptedUserID: any, index?: any) {
   
    Swal.fire({
      html: `
        <div class="swal-static-container" style="    display: flex
;
    flex-direction: column;
    justify-content: center;
    align-items: center;">
          <div class="swal2-icon swal2-question" style="display: flex; margin: 0.5em 6.7em 1.1em 5.6em !important;">
            <div class="swal2-icon-content">?</div>
          </div>
          <div class="swal-static-content">
            <h2 class="swal-static-title">Confirmation</h2>
            <p class="swal-static-text">Please confirm if you would like to approve this candidate for daycare.</p>
          </div>
        </div>
      `,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setTimeout(() => {
          this.ApprovedReject(id, 1, '', type, encryptedUserID);
        }, 500);
        this.getDDCJobPosting();
      } else {
        // Revert selection
        this.JobList[index].status = this.previousStatus;
      }
    });
  }

  resetDropdown() {
    
    this.sectionList = [];
    this.classList = [];
    this.selectedTeacherName = '';
    this.selectedClass = null;
    this.selectedSection = null;
  }

  onSubmit() {
    
    // this.assignClassForm.patchValue({
    //   sectionID: this.selecteedSection
    // });

    this.viewStudent
      .assignTeacherForClass(this.assignClassForm.value)
      .subscribe((response) => {
        if (response.message == 'OK') {
          this.Toaster.success('Class Assigned Successfully !', 'Success');
          this.resetDropdown();
          $('#exampleModal2').modal('hide');
          // this.getStudentDetails(this.daycareID);
        } else if (response.message == 'Duplicate entry exists') {
          this.Toaster.warning('Teacher is already Assigned to this section');
          this.resetDropdown();

          $('#exampleModal2').modal('hide');
        } else {
          this.Toaster.error(response.message, 'Error');
        }
      });
  }

  ApprovedReject(id: any, approved: any, reason: any, type: any, userId: any) {
   
    // if (type == 'received') {
    //   this.msg = approved == 4 ? 2 : approved == 2 ? 9 : 3;
    // } else {
    //   this.msg = approved == 4 ? 2 : approved == 2 ? 1 : 3;
    // }

    // if (type == 'received') {
    //   this.msg =
    //     approved == 4 ? 2 : approved == 2 ? 9 : approved == 11 ? 11 : 3;
    // } else {
    //   this.msg =
    //     approved == 4 ? 2 : approved == 2 ? 1 : approved == 11 ? 11 : 3;
    // }

    // if (type == 'approved') {
    //   this.msg = 1;
    // }

    this.spinner.show();

    var approveForm = {
      id: id,
      statusID: approved,
      centreID: this.UserID,
      reason: reason,
    };

    const secretKey = 'encrypt!135790';
    const encryptedUserID = CryptoJS.AES.encrypt(
      userId.toString(),
      secretKey
    ).toString();
    const encryptedCentreID = CryptoJS.AES.encrypt(
      this.UserID.toString(),
      secretKey
    ).toString();

    this.jobPortalservice
      .manageApproval(approveForm, type, encryptedUserID, encryptedCentreID)
      .subscribe((data) => {
        if (data.message == 'Success') {
          if (approved == 11) {
            if (type == 'received') {
              Swal.fire({
                icon: 'success',
                title: 'Terms and Conditions',
                text: 'Please review and accept the Terms and Conditions to proceed. You can either accept or proceed with the process.',
                showDenyButton: true,
                confirmButtonText: 'Accept',
                denyButtonText: 'Proceed',
                confirmButtonColor: '#3085d6',
                denyButtonColor: '#28a745',
              }).then((result) => {
                if (result.isConfirmed) {
                  $('a[href="#basictab3"]').tab('show');
                  this.getJobList('shortlisted');
                }
              });
            } else {
              Swal.fire({
                icon: 'success',
                title: '<h3>Success!</h3>',
                text: "Candidate approved successfully. Let's wait for the teacher to accept the terms and conditions",
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  // this.getJobList('received');
                  $('a[href="#basictab3"]').tab('show');
                  this.getJobList('shortlisted');
                }
              });
            }
          } else if (approved == 9) {
            if (type == 'received') {
              Swal.fire({
                icon: 'success',
                title: 'Candidate Shortlisted',
                text: 'The candidate has been successfully shortlisted for the interview process. Please proceed with the interview process.',
                showDenyButton: true,
                confirmButtonText: 'OK',
                denyButtonText: 'Proceed',
                confirmButtonColor: '#3085d6',
                denyButtonColor: '#28a745',
              }).then((result) => {
                if (result.isDenied) {
                  $('a[href="#basictab3"]').tab('show');
                  this.getJobList('shortlisted');
                }
              });
            } else {
              Swal.fire({
                icon: 'success',
                title: '<h3>Success!</h3>',
                text: 'Candidate approved successfully.',
              });
            }
          } else if (approved == 1) {
            if (type == 'approved') {
              Swal.fire({
                icon: 'success',
                title: 'Teacher Job Approved',
                text: 'The teacher application has been successfully approved.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
              }).then((result) => {
                if (result.isConfirmed) {
                  this.commonService.trigger();
                  $('a[href="#basictab3"]').tab('show');
                  this.getJobList('shortlisted');
                }
              });
            } else {
              Swal.fire({
                icon: 'success',
                title: '<h3>Success!</h3>',
                text: 'Candidate approved successfully.',
              });
            }
          } else {
            Swal.fire({
              icon: 'success',
              title: '<h3>Rejected!</h3>',
              text: 'Job rejected successfully.',
            }).then((result) => {
              if (result.isConfirmed) {
                $('a[href="#basictab3"]').tab('show');
                this.getJobList('shortlisted');
              }
            });
          }

          this.spinner.hide();

          // this.getJobList('shortlisted');
        }
      });

    // this.JobList=[];
    // this.getJobList(type);
  }

  getSectionList(event: any) {
    this.viewStudent.getSectionList(event.id).subscribe((res: any) => {
      this.sectionList = res.result;
    });
  }

  // setDefaultValue(teacher: any) {
  //   this.selectedTeacherName = teacher.teacherName;

  //   // Patch the teacher ID to the form
  //   this.assignClassForm.patchValue({
  //     teacherID: teacher.teacherId,
  //     // sectionID: this.selecteedSection
  //   });

  //   //get class List

  //   this.Classroom.getClassListByCentreId(this.centerID).subscribe((data) => {
  //     this.classList = data.result;
  //   });
  // }

  selectedsSection(event: any) {
    this.selecteedSection = event.sectionID;
  }


  applyFilter() {
    const term = this.searchText.trim().toLowerCase();

    this.filteredJobList = this.JobList.filter(
      (item: any) =>
        item.teacherName?.toLowerCase().includes(term) ||
        item.teacherEmail?.toLowerCase().includes(term)
    );

    this.ContentP = 1;
  }

  get displayedJobList() {
    return this.searchText?.trim()
      ? this.filteredJobList
      : this.JobList;
  }
}
