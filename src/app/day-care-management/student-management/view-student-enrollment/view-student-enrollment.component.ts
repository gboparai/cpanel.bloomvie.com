import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { ViewStudentEnrollmentService } from './view-student-enrollment.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgFor, NgIf } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";

declare var $: any;

@Component({
  selector: 'app-view-student-enrollment',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    NgxPaginationModule,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    NgSelectModule,
    SkeletonLoaderComponent
  ],
  templateUrl: './view-student-enrollment.component.html',
  styleUrl: './view-student-enrollment.component.css',
})
export class ViewStudentEnrollmentComponent {
  Students: any;
  daycareID: any;

  ContentP: number = 1;
  Contentsize: number = 5;
  StudentParentDetail: any;
  assignClassForm: FormGroup;
  classList: any;
  sectionList: any;
  selectedClass: any;
  selectedSection: any;
  sectionID: any;
  skeletonShow: 'Skelton' | 'NoRecord' | '' = 'Skelton';

  constructor(
    private viewStudent: ViewStudentEnrollmentService,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private fb: FormBuilder
  ) {
    this.assignClassForm = this.fb.group({
      studentID: [''],
      studentName: [''],
      ageGroup: [''],
      classID: ['', [Validators.required]],
      // sectionID:['',[Validators.required]]
    });
  }

  ngOnInit(): void {
    this.daycareID = Number(this.cookieService.get('CentreID'));
    this.getStudentDetails(this.daycareID);
    // $('#exampleModal').modal('hide');
  }

  setDefaultValue(student: any) {
    // set default value
    this.assignClassForm.patchValue({
      studentID: student.studentID,
      studentName:
        (student.studentFirstName ? student.studentFirstName : '') +
        (student.studentLastName ? ' ' + student.studentLastName : ''),
      ageGroup: student.studentAgeGroup,
    });

    //get class List

    this.viewStudent
      .getClassList(this.daycareID, student.studentAgeGroupID)
      .subscribe((data) => {
        this.classList = data.result;
      });
  }

  // getSectionList(event:any) {
  //   this.viewStudent.getSectionList(event.id).subscribe((res:any)=>{
  //         this.sectionList = res.result;
  //   })
  // }

  resetDropdown() {
    this.sectionList = [];
    this.classList = [];

    this.selectedClass = null;
    this.selectedSection = null;
  }

  onSectionAdd(section: any) {
    this.sectionID = section.sectionID;
  }

  onSubmit() {
    // this.assignClassForm.patchValue({
    //   sectionID : this.sectionID
    //   });
    this.viewStudent
      .studentClassAssignment(this.assignClassForm.value)
      .subscribe((response) => {
        if (response.message == 'Success') {
          this.assignClassForm.reset();
          this.toastr.success('Class Assigned Successfully !', 'Success');
          $('#exampleModal2').modal('hide');
          this.getStudentDetails(this.daycareID);
        } else {
          this.toastr.error(
            'Class limit exceeded. You cannot enroll more student.'
          );
        }
      });
  }

  getStudentDetails(daycareID: number) {
    this.viewStudent.getStudent(daycareID).subscribe((data) => {
      if (data.message == 'Success') {
        this.Students = data.result;
        this.skeletonShow = this.Students.length === 0 ? 'NoRecord' : '';
      }
    });
  }

  getStudentParentDetailsByStudentID(studentID: number) {
    this.viewStudent
      .getStudentParentDetailsByStudentID(studentID)
      .subscribe((data) => {
        if (data.message == 'Success') {
          this.StudentParentDetail = data.result[0];
        }
      });
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }
}
