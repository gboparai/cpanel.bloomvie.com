import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { ClassroomDetailsService } from '../../../classroom-management/classroom-details/classroom-details.service';
import * as CryptoJS from 'crypto-js';
import { NgIf,NgFor } from '@angular/common';
import { TimeFormatPipe } from '../../../../bloomvie-management/dc-appointments-list/time-format.pipe';
interface Label {
  labelName: string;
  answer: string;
}

interface Section {
  sectionID: number;
  sectionName: string;
  labels: Label[];
}

interface InputItem {
  sectionID: number;
  sectionName: string;
  labelName: string;
  answer: string;
}

@Component({
  selector: 'app-student-additional-information',
  standalone: true,
  imports: [
    RouterLink,
    RouterModule,
    RouterOutlet,
    NgIf,
    TimeFormatPipe,
    NgFor
  ],
  templateUrl: './student-additional-information.component.html',
  styleUrls: ['./student-additional-information.component.css']
})

export class StudentAdditionalInformationComponent {
  studentID: any;
  SelectedStudentId: any;
  item: any = [];

  constructor(private service: ClassroomDetailsService, private route: ActivatedRoute,) { }

  ngOnInit() {

    this.route.queryParams.subscribe((params: any) => {
      const encryptedID = params['ID'];
      if (encryptedID) {
        const secretKey = 'encrypt001100!?';
        try {
          const decryptedBytes = CryptoJS.AES.decrypt(encryptedID, secretKey);
          const decryptedID = decryptedBytes.toString(CryptoJS.enc.Utf8);
          this.studentID = parseInt(decryptedID, 10);
          this.SelectedStudentId = this.studentID;
          this.getChildDailyRoutine();
        } catch (error) {
          console.error("Error decrypting student ID:", error);
        }
      }
    });
  }

  getChildDailyRoutine(): void {
    this.service.getChildDailyRoutine(this.studentID).subscribe(
      (response: any) => {
        if (response.message === 'OK') {
          const groupedData: { [key: number]: Section } = {};

          response.result.forEach((item:any) => {
            const { sectionID, sectionName, labelName, answer } = item;

            if (!groupedData[sectionID]) {
              groupedData[sectionID] = { sectionID, sectionName, labels: [] };
            }
            groupedData[sectionID].labels.push({ labelName, answer });
          });
          
          this.item = Object.values(groupedData);
        }
      },
      (error) => {
        console.error('Error fetching daily routine:', error);
      }
    );
  }
}
