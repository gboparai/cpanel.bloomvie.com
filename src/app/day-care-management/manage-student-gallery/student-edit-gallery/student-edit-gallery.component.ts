import { Component, ElementRef, ViewChild, } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { ManageStudentGalleryService } from '../manage-student-gallery.service';
import { CommonService } from '../../../common-component/common.service';
import { environment } from '../../../../environments/environment.development';
import { NgxPaginationModule } from 'ngx-pagination';
import { ClassroomDetailsService } from '../../classroom-management/classroom-details/classroom-details.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-student-edit-gallery',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgSelectModule, NgxPaginationModule, BreadcrumbComponent, CommonModule, NgIf, FormsModule, ReactiveFormsModule,],
  templateUrl: './student-edit-gallery.component.html',
  styleUrl: './student-edit-gallery.component.css',
  providers: [DatePipe]
})
export class StudentEditGalleryComponent {
  StudentGalleryForm: any;
  daycareID: any;
  classes: any = [];
  // SelectedStudentId: any;
  // popupOpen=false;
  class: any;
  teacherID: any;
  classRoomID: any;
  classID: any;
  section: any;
  id: any;
  name: any;
  student: any;
  startDate: any;
  userRoleId: any;
  gallery: any;
  currentPage: number = 1;
  ContentSize: number = 5;

  newCommentText = "";


  readonly rootUrl = environment.apiUrl.slice(0, -3);
  galleryID: any;
  filePath: any;
  itemsPerPage: string | number | undefined;
  comment: any;
  teacherName: any;
  parent: any;
  studentID: any;
  action: any;
  updatecomment: any;
  classRoom: any;
  StudentList: any;
  selectStudent: any;
  formattedDate: any;
  formatted: any;
  endDate: any;
  newSelectedDate: any;
  selectedFirstStartDate: any;
  firstStartDate: any;
  firstEndDate: any;
  selectedFirstEndDate: any;
  fetchStudentImages: any;
  studentActivityFlatpickrInstance: any;
  flatpickrInstance: any;

  selectedStartDate: any = '';
  selectedEndDate: any = '';
  formattedStartDate: any;
  formattedEndDate: any;



  constructor(private datePipe: DatePipe, private service: ManageStudentGalleryService, private fb: FormBuilder, private cookie: CookieService, private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private classroomDetailsService: ClassroomDetailsService


  ) {
    this.StudentGalleryForm = this.fb.group({
      centreID: [0],
      classRoomID: ['', Validators.required],
      teacherID: [0],
      activityDate: ['', Validators.required],
      studentID: ['', Validators.required],
    });


    let currentDate = new Date();
    this.formattedDate = this.datePipe.transform(currentDate, 'd/M/yyyy');

  }



  ngOnInit() {
    const daycare = this.cookie.get("CentreID")
    const teacherIDString = this.cookie.get("UserId");
    const teacherID = parseInt(teacherIDString);
    const userRoleIdString = this.cookie.get("UserRoleId");
    const AdminName = this.cookie.get("AdminName");

    const userRoleId = parseInt(userRoleIdString);

    this.teacherName = AdminName

    this.userRoleId = userRoleId
    this.daycareID = daycare
    this.teacherID = teacherID

    // this.ClassRoomByTeacherID(teacherID);

    this.getClassRoom();


  }




  // get class room

  // ClassRoomByTeacherID(teacherId:any): void { 
  //   this.service.getClassRoomByTeacherID(teacherId, this.userRoleId).subscribe((response: any) => {
  //     if (response.message === 'OK') {
  //       this.class = response.result;
  //     };
  //   },
  //   );
  // }

  async onSelectClass(event: any) {
    this.classID = event.classroomID
    if (isNaN(this.classID)) {
      console.error('Invalid classID');
      return;
    }

    this.getStudentByClassID()
  }


  async onSelectStudent(event: any) {
    this.selectStudent = parseInt(event.id);
  }


  async getClassRoom() {
    this.spinner.show();

    try {
      await this.classroomDetailsService.getClassRoom(this.daycareID, this.teacherID, this.userRoleId).subscribe((response: any) => {
        if (response.message === 'OK') {
          this.classRoom = response.result;
          this.spinner.hide();
        };
      },
      );
    } catch {
      console.error('data not found')
      this.spinner.hide();

    }


  }


  async getStudentByClassID() {

    this.spinner.show();
    if (this.name == undefined) {
      this.name = ''
    }
    try {
      await this.classroomDetailsService.getStudentByClassID(this.daycareID, this.classID, this.name).subscribe((response: any) => {
        if (response.message === 'Success') {
          this.StudentList = response.result;
          this.spinner.hide();
        };
      },
      );
    } catch {
      console.error('data not found')
      this.spinner.hide();

    }



  }



  ngAfterViewInit(): void {
    const currentDate = new Date();

    flatpickr("#selectToDate", {
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: currentDate,
    });

    flatpickr("#selectFromDate", {
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: currentDate,
    });


  }


  async onSelectStartDate(event: any): Promise<void> {
    this.startDate = event.target.value;

    if (this.endDate == null) {
      this.endDate = this.startDate
    }

    if (this.startDate) {
      this.endDate = ''
    }

    this.getStudentGallery();
  }



  async onSelectEndDate
    (event: any): Promise<void> {
    this.endDate = event.target.value;
    // alert(this.startDate);
    this.getStudentGallery();
  }



  formatDate(arg0: Date): any {
    throw new Error('Method not implemented.');
  }


  async onStudentID(event: any) {
    this.studentID = parseInt(event.target.value, 10);
  }

  async getStudentGallery(): Promise<void> {
    this.getParentDetails();

    try {
      await this.spinner.show();
      this.service.getStudentGalleryByStudentID(this.selectStudent, this.startDate, this.endDate).subscribe(
        (response: any) => {
          if (response.message === 'Success') {
            this.gallery = response.result;
            this.spinner.hide();
            // this.studentDetails = []
          } else {
            this.gallery = []
          }
          this.spinner.hide();
        }
      );
    } catch {
      console.error('not found')
    }

  }




  isVideo(file: string): boolean {
    const videoExtensions = ['mp4', 'avi', 'mov', 'webm'];
    const extension = file.split('.').pop()?.toLowerCase();
    return videoExtensions.includes(extension || '');
  }


  deleteFile(galleryID: number, file: string): void {
    if (!file || file.trim() === '') {
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.galleryID = galleryID;
        this.filePath = file;

        try {
          await this.studentGalleryDelete(this.galleryID, this.filePath);

          Swal.fire(
            'Deleted!',
            'Your image/video has been deleted.',
            'success'
          );
        } catch (error) {
          Swal.fire(
            'Error!',
            'An unexpected error occurred while deleting the image.',
            'error'
          );
        }
      }
    });
  }



  enableEditComment(item: any) {
    item.isEditing = true;
    item.editText = item.teacherComment;


  }



  cancelEditComment(item: any) {
    item.isEditing = false;
    item.editText = '';
  }



  async studentGalleryDelete(galleryID: any, filePath: any): Promise<void> {
    try {
      this.spinner.show()

      await this.service.studentGalleryDelete(galleryID, filePath).subscribe(
        (response: any) => {
          if (response?.message === 'Success') {
            this.toastr.success('Gallery item deleted successfully!', 'Success');
            this.gallery = this.gallery.filter((item: any) => item.id !== galleryID); // Update gallery list
            this.getStudentGallery();
            this.spinner.hide()


          } else {
            this.toastr.warning(response?.message || 'Delete failed', 'Warning');
          }
        },
        (error: any) => {
          this.toastr.error('An error occurred while deleting the gallery item.', 'Error');
          console.error('Error:', error);
        }
      );
    } catch (error) {
      this.toastr.error('Unexpected error occurred.', 'Error');
      console.error('Unexpected error:', error);
    }
  }

  // commentAdd(item: any, action: string) {
  //   if (action === 'update') {
  //     item.teacherComment = item.editText;
  //     item.teacherModifiedDate = new Date().toISOString(); // or your own format
  //     item.isEditing = false;
  //   }
  // }


  commentAdd(comment: any, action: any, commentAddDate: any): void {

    this.spinner.show();

    var newcomment = comment ?? this.newCommentText

    if (newcomment) {
      const ID = this.teacherID;
      const date = commentAddDate;
      const type = 'teacher';
      // comment.teacherCreatedDate = new Date().toISOString();

      this.service.ManageComment(ID, newcomment, action, date, type).subscribe(
        (response: any) => {
          if (response.message === 'comment added successfully.') {

            this.newCommentText = '';
            // this.startDate = commentAddDate
            // this.endDate = this.formattedEndDate

            this.getStudentGallery();
            this.getStudentGallery();
            this.spinner.hide();
            comment.isEditing = false;
          } else if (response.message === 'comment updated successfully.') {
            this.newCommentText = '';
            // this.startDate = commentAddDate
            // this.endDate = this.formattedEndDate
            this.getStudentGallery();
            this.spinner.hide();
            comment.isEditing = false;
          }
          else {
            console.error('error add comment', response.message);
          }

        },
        (error) => {
          console.error('API error:', error);
        }
      );
    }
  }


  // commentAdd(comment: any, action:any, date:any): void {

  //   this.spinner.show()

  //     comment.teacherComment = comment.editText;
  //     comment.teacherModifiedDate = new Date().toISOString(); // or your own format
  //     comment.isEditing = false;


  //   if (this.newCommentText) {
  //     const ID = this.teacherID;

  //     const type = 'teacher'; 

  //     this.service.ManageComment(ID, this.newCommentText, action, date, type).subscribe(
  //       (response: any) => {
  //         if (response.result) {

  //           this.newCommentText = ''; 
  //           comment.isEditing = false;
  //    this.spinner.hide()




  // this.getStudentGallery(); 

  //         } else {
  //           console.error('Error adding comment:', response.message);
  //         }
  //       },
  //       (error) => {
  //         console.error('API error:', error);
  //       }
  //     );
  //   }
  // }




  cancelComment(): void {
    this.newCommentText = "";
  }




  async getComment(): Promise<void> {
    this.spinner.show()

    this.service.GetComment(this.teacherID, this.startDate).subscribe(
      (response: any) => {
        if (response.message === 'Success') {
          this.comment = response.result;
          this.spinner.hide()
        }
      }
    );
  }


  async getParentDetails(): Promise<void> {
    this.spinner.show()
    this.service.getParentDetails(this.selectStudent).subscribe(
      (response: any) => {
        if (response.message === 'Success') {
          this.parent = response.result;
          this.spinner.hide()
        }
      }
    );
  }


  ResetForm() {
    this.StudentGalleryForm.reset();
  }

}
