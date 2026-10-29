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
  selectedSection: any;
  sectionID: any;
  isAssigningClass = false;
  skeletonShow: 'Skelton' | 'NoRecord' | 'Error' | '' = 'Skelton';

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

    this.selectedSection = null;
  }

  onSectionAdd(section: any) {
    this.sectionID = section.sectionID;
  }

  onSubmit() {
    if (this.isAssigningClass) {
      return;
    }

    if (this.assignClassForm.invalid) {
      this.assignClassForm.markAllAsTouched();
      return;
    }

    this.isAssigningClass = true;
    this.viewStudent
      .studentClassAssignment(this.assignClassForm.value)
      .subscribe({
        next: (response) => {
          this.isAssigningClass = false;
          const message = response.message ?? response.Message;
          if (message === 'Success') {
            this.assignClassForm.reset();
            this.resetDropdown();
            this.toastr.success('Class Assigned Successfully !', 'Success');
            $('#exampleModal2').modal('hide');
            this.getStudentDetails(this.daycareID);
          } else {
            this.toastr.error(message || 'Unable to assign this student to the selected class.');
          }
        },
        error: (error) => {
          this.isAssigningClass = false;
          this.toastr.error(error?.message || 'Unable to assign this student to the selected class.');
        },
      });
  }

  getStudentDetails(daycareID: number) {
    this.viewStudent.getStudent(daycareID, true).subscribe({
      next: (data) => {
        const message = data.message ?? data.Message;
        if (message === 'Success') {
          const students = data.result ?? data.Result ?? [];
          this.Students = students.filter((student: any) => {
            const classID = student.classID ?? student.ClassID;
            return classID == null || Number(classID) === 0;
          });
          this.skeletonShow = this.Students.length === 0 ? 'NoRecord' : '';
        } else {
          this.Students = [];
          this.skeletonShow = 'Error';
          this.toastr.error(message || 'Failed to load student enrollment.');
        }
      },
      error: (error) => {
        this.Students = [];
        this.skeletonShow = 'Error';
        this.toastr.error(error?.message || 'Failed to load student enrollment.');
      },
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
