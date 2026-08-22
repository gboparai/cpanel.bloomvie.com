import { Component } from '@angular/core';
import { JobPortalServiceService } from '../../job-portal-details/job-portal-service.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router
import CryptoJS from 'crypto-js';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { ViewStudentEnrollmentService } from '../../student-management/view-student-enrollment/view-student-enrollment.service';
import { TimeFormatAmPmPipe } from '../../../bloomvie-management/dc-appointments-list/time-format.pipe';
declare var $: any;
@Component({
  selector: 'app-job-post-teacher-approval',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, TimeFormatAmPmPipe],
  providers: [DatePipe],
  templateUrl: './job-post-teacher-approval.component.html',
  styleUrl: './job-post-teacher-approval.component.css',
})
export class JobPostTeacherApprovalComponent {
  private welcomepage = environment.Cpanel;
  private frontendWebsite = environment.frontEndWebUrl;
  msg: any;
  teacherID: any;

  approveForm: any;
  id: any;
  token: any;
  isToken = false;
  viewThankYou: boolean = false;
  centreID: any;
  centreid: any;
  DayCareDetail: any;
  isAcceptedRejected: boolean = false;
  teacherjobPostId: any;

  constructor(
    private jobPortalservice: JobPortalServiceService,
    private viewStudent: ViewStudentEnrollmentService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) {
    this.approveForm = this.formBuilder.group({
      id: 0,
      statusID: '',
      reason: '',
      isActive: '',
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['Token'];
      this.teacherID = params['id'];
      this.centreID = params['CentreID'];
    });
    const secretKey = 'encrypt!135790';
    this.teacherID = CryptoJS.AES.decrypt(this.teacherID, secretKey).toString(
      CryptoJS.enc.Utf8
    );

    this.centreid = CryptoJS.AES.decrypt(this.centreID, secretKey).toString(
      CryptoJS.enc.Utf8
    );
    this.tokenMatch();
  }

  //Arsh
  getDayCarefortermsconditionsByCentreAdminID() {
    const adminId: number = parseInt(this.centreid, 10);
    this.viewStudent.getDayCarefortermsconditionsByCentreAdminID(adminId).subscribe(data => {
      if (data.message == "OK") {
        this.DayCareDetail = data.result.map((item: { workingDays: any[]; }) => ({
          ...item,
          workingDays: item.workingDays.map(day => ({
            ...day,
            startTime: day.startTime ? day.startTime.substring(0, 5) : '',
            endTime: day.endTime ? day.endTime.substring(0, 5) : ''
          }))
        }));

        this.DayCareDetail = this.DayCareDetail.filter((x: { jobPostId: any; }) => x.jobPostId == this.teacherjobPostId);
      }
      else {
        this.DayCareDetail = [];
      }
    })
  }

  getTeacherStatusbyId() {
    this.viewStudent.getTeacherStatusbyId(this.teacherID).subscribe(data => {
      if (data.message == "ok") {
        if (data.result.statusID == 18) {
          this.viewThankYou = true;
        }
        if (data.result.statusID == 10) {
          this.viewThankYou = false;
        }
        this.teacherjobPostId = data.result.jobPostID;
      }
      else {
        this.teacherjobPostId = [];
      }
    })
  }

  RedirectToFrontendWebsite() {
    const FrontendUrl = this.frontendWebsite;
    window.location.href = FrontendUrl;
  }

  tokenMatch() {
    this.jobPortalservice
      .ValidateToken(this.teacherID, this.token)
      .subscribe((data) => {
        if (data.message === 'OK') {
          this.isToken = true;
          this.getTeacherStatusbyId();
          this.getDayCarefortermsconditionsByCentreAdminID();
        } else {
          this.getTeacherStatusbyId();
        }
      });
  }

  async approveReject(id: any, isActive: any, type: any) {
    Swal.fire({
      title: 'Terms accepted!',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      background: '#d4edda',
    }).then((result) => {
      if (result.isConfirmed) {
        this.viewThankYou = true;
        this.ApprovedReject(this.teacherID, id, isActive, '', type);
        Swal.fire({
          title: 'Action Confirmed!',
          icon: 'success',
          confirmButtonText: 'OK',
          background: '#d4edda',
        });
      } else if (result.isDismissed) {
        Swal.fire({
          title: 'Action Canceled!',
          icon: 'error',
          confirmButtonText: 'OK',
          background: '#f8d7da',
        });
      }
    });
  }

  cancelTerms(id: any, isActive: any, type: any) {
    Swal.fire({
      title: 'Rejection Cancelled',
      text: 'Are you sure you want to cancel the rejection?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      background: '#f0f0f0',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Enter Reason for Cancellation',
          input: 'textarea',
          inputPlaceholder: 'Type your reason here...',
          inputAttributes: { 'aria-label': 'Type your reason here' },
          showCancelButton: true,
          confirmButtonText: 'Submit',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#6c757d',
          cancelButtonText: 'Cancel',
          preConfirm: (inputValue) => {
            if (!inputValue || inputValue.trim() === '') {
              Swal.showValidationMessage(
                'Reason for cancellation cannot be empty!'
              );
              return false;
            }
            return inputValue;
          },
        }).then((reasonResult) => {
          if (reasonResult.isConfirmed && reasonResult.value) {
            this.viewThankYou = false;
            const reason = reasonResult.value.trim();
            this.ApprovedReject(this.teacherID, id, isActive, reason, type);
            Swal.fire({
              title: 'Action Confirmed!',
              text: 'Your cancellation has been processed successfully.',
              icon: 'success',
              confirmButtonText: 'OK',
              background: '#f0f0f0',
            });
          }
        });
      } else if (result.isDismissed) {
        Swal.fire({
          title: 'Action Canceled!',
          text: 'No changes have been made.',
          icon: 'error',
          confirmButtonText: 'OK',
          background: '#f8d7da',
        });
      }
    });
  }

  ApprovedReject(id: any, approved: any, isActive: any, reason: any, type: any) {
    this.tokenMatch();
    this.msg = approved;
    const approveForm = {
      id: id,
      statusID: this.msg,
      reason: reason,
      centreID: parseInt(this.centreid),
      isActive: isActive,
    };

    this.jobPortalservice.manageTeacherApproval(approveForm, type).subscribe((data) => {
      if (data.message === 'Success') {
        this.isToken = false;
      }
    });
  }

  RedirectToAdminPannel() {
    const adminUrl = this.welcomepage;
    window.location.href = adminUrl; // Redirect to the admin panel
  }
}
