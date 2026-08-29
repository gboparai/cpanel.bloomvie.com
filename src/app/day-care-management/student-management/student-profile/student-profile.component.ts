import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterEvent, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { ClassroomDetailsService } from '../../classroom-management/classroom-details/classroom-details.service';
import * as CryptoJS from 'crypto-js';
import { ViewStudentEnrollmentService } from '../view-student-enrollment/view-student-enrollment.service';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    RouterLink,
    RouterModule,
    RouterOutlet,
    CommonModule,
    DatePipe,
  ],
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.css']
})


export class StudentProfileComponent implements OnInit {

  readonly rootUrl = environment.apiUrl.slice(0, -3);

  data: any;
  type: string | undefined;
  studentID: any;
  SelectedStudentId: number | undefined;
  classes: any = [];
  previewUrl: string | null = null;
  isModalVisible = false;
  isClosing = false;

  constructor(private spinner: NgxSpinnerService, private service: ClassroomDetailsService, private route: ActivatedRoute, private commonSerive: CommonService) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      const encryptedID = params['ID'];
      this.type = params['TYPE'];
      if (encryptedID) {
        const secretKey = 'encrypt001100!?';
        try {
          const decryptedBytes = CryptoJS.AES.decrypt(encryptedID, secretKey);
          const decryptedID = decryptedBytes.toString(CryptoJS.enc.Utf8);
          this.studentID = parseInt(decryptedID, 10);
          this.SelectedStudentId = this.studentID;
        } catch (error) {
          console.error("Error decrypting student ID:", error);
        }
      }
    });
    if (this.studentID > 0) {
      this.getStudentProfileByStudentID();
    }
    // this.getSection();
    // this.getStudentParentDetailsByStudentID();
  }


  getStudentProfileByStudentID() {

    this.spinner.show();

    if (this.studentID) {
      this.service.getStudentProfileByStudentID(this.studentID).subscribe(data => {
        if (data.message === 'OK') {
          this.data = data.result;

          this.data.studentProfilePhoto = this.data.studentProfilePhoto
            ? this.commonSerive.convertS3File(this.data.studentProfilePhoto)
            : '';
          this.spinner.hide();
        }
      });
    } else {
      console.error("Student ID is undefined.");
      this.spinner.hide();

    }
  }



}
