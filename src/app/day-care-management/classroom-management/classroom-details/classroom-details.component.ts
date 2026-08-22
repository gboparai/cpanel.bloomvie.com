import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { AddStudentComponent } from '../../student-management/add-student/add-student.component';
import {
  ActivatedRoute,
  Route,
  RouterLink,
  RouterModule,
  Router,
} from '@angular/router';
import { AddClassroomComponent } from '../add-classroom/add-classroom.component';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule, DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../common-component/common.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import * as CryptoJS from 'crypto-js';
import { ManageStudentActivitiesComponent } from '../manage-student-activities/manage-student-activities.component';
import { ClassroomDetailsService } from './classroom-details.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

declare var $: any;
@Component({
  selector: 'app-classroom-details',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    FormsModule,
    AddStudentComponent,
    AddClassroomComponent,
    RouterLink,
    RouterModule,
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    NgxSpinnerModule,
    ManageStudentActivitiesComponent,
    NgxPaginationModule,
    NgSelectModule,
  ],
  templateUrl: './classroom-details.component.html',
  styleUrl: './classroom-details.component.css',
})
export class ClassroomDetailsComponent {
  SectionDropdownInput = new FormControl(null);
  StudentList: any[] = [];
  daycareID: any;
  classes: any = [];
  Token: any;
  SelectedStudentId: number[] = []; // popupOpen=false;
  class: any;
  teacherID: any;
  classID: any;
  ClassAndSectionForm: any;
  section: any;
  classroomID: any;
  id: any;
  item: any;
  UserRoleId: any;

  ContentP: number = 1;
  ContentSize: number = 5;
  popupOpen: boolean = false;
  name: any;
  MasterActivityID: number = 0;
  ageGroup: any;
  classRoom: any;
  classRoomID: any;
  studentList: any;
  classId: any;
  selectInput: any;

  selectAll = false;

  // SelectedStudentId: any;

  constructor(
    private route: Router,
    private classroomDetailsService: ClassroomDetailsService,
    private cookie: CookieService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
  ) {
    this.ClassAndSectionForm = fb.group({
      // sectionID: [""],
      ageGroupID: [''],
      classroomID: [''],
    });
  }

  ngOnInit() {
    const daycare = this.cookie.get('CentreID');
    const teacherIDString = this.cookie.get('UserId');
    const teacherID = parseInt(teacherIDString);
    this.daycareID = daycare;
    this.teacherID = teacherID;
    this.UserRoleId = this.cookie.get('UserRoleId');
    this.getClassRoom();
  }



  async getClassRoom(): Promise<void> {
    this.spinner.show();
    try {
      const response: any = await firstValueFrom(
        this.classroomDetailsService.getClassRoom(this.daycareID, this.teacherID, this.UserRoleId)
      );

      if (response.message === 'OK') {
        this.classRoom = response.result;
        // Auto-select if there's only one classroom
        if (this.classRoom.length === 1) {
          const firstClassroom = this.classRoom[0];
          this.ClassAndSectionForm.get('classroomID')?.setValue(firstClassroom.classroomID);
          this.onSelectClass(firstClassroom);

        }
        this.spinner.hide();

      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      this.spinner.hide();

    }
  }



  onSearchName(e: any) {
    if (e.target.value.length > 3) {
      this.name = e.target.value;
      this.getStudentByClassID();
    } else if (e.target.value.length === 0) {
      this.getStudentByClassID();
    }
  }

  onSelectClass(event: any) {
    if (
      this.ClassAndSectionForm.value.classroomID == '' ||
      this.ClassAndSectionForm.value.classRoomID == null
    ) {
      this.StudentList = [];
    }

    this.classId = event.classroomID;
    this.getStudentByClassID();
  }





  async getStudentByClassID() {
    this.spinner.show();

    this.StudentList = [];
    if (this.name == undefined) {
      this.name = '';
    }

    try {
      const response: any = await firstValueFrom(
        this.classroomDetailsService.getStudentByClassID(this.daycareID, this.classId, this.name)
      );

      if (response.message === 'Success') {
        this.StudentList = response.result;
        this.spinner.hide();

      }
    } catch (error) {
      console.error('Error fetching student list:', error);
      this.spinner.hide();

    }
  }


  // onSelectInput(e: any) {
  //   this.SelectedStudentId = e
  // }

  isDisable(): boolean {
    return this.SelectedStudentId.length > 0 ? false : true;
  }

  onSelectInput(studentId: number, isChecked: boolean): void {
    if (isChecked) {
      this.SelectedStudentId.push(studentId);
    } else {
      const index = this.SelectedStudentId.indexOf(studentId);
      if (index > -1) {
        this.SelectedStudentId.splice(index, 1);
      }
    }

    this.selectAll = this.StudentList.every((student) => student.selected);
  }

  onSelectAllChange() {
    this.StudentList.forEach((student) => {
      student.selected = this.selectAll;
    });

    if (this.selectAll) {
      this.SelectedStudentId = this.StudentList.map((student) => student.id);
    } else {
      this.SelectedStudentId = [];
    }
  }

  formatTime(time: string): string {
    if (time) {
      const [hour, minute] = time.split(':').map(Number);
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${this.padZero(formattedHour)}:${this.padZero(minute)} ${period}`;
    } else {
      return '';
    }
  }
  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  modalOpen(id: any) {
    this.SelectedStudentId;
    this.MasterActivityID = 1;
    $('#addingStudentActivityModal').modal('show');
    this.popupOpen = true;
  }
  modalClose(event: any) {
    this.popupOpen = false;
  }

  selectClassRoom(id: any) {
    this.SelectedStudentId = id;
    const secretKey = 'encrypt001100!?';
    const encryptedID = CryptoJS.AES.encrypt(
      this.SelectedStudentId.toString(),
      secretKey
    ).toString();

    this.route.navigate(['/view-student-detail'], {
      queryParams: { ID: encryptedID, TYPE: 'detail' },
    });
  }
}
