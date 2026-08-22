import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { ManageStudentGalleryService } from './manage-student-gallery.service';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import flatpickr from 'flatpickr';
import { CommonService } from '../../common-component/common.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { StudentEditGalleryComponent } from './student-edit-gallery/student-edit-gallery.component';
import { ClassroomDetailsService } from '../classroom-management/classroom-details/classroom-details.service';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-manage-student-gallery',
  standalone: true,
  imports: [
    NgSelectModule,
    RouterLink,
    RouterOutlet,
    BreadcrumbComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StudentEditGalleryComponent,
  ],
  templateUrl: './manage-student-gallery.component.html',
  styleUrl: './manage-student-gallery.component.css',
})
export class ManageStudentGalleryComponent {
  StudentGalleryForm: any;
  daycareID: any;
  classes: any = [];
  Token: any;
  // SelectedStudentId: any;
  // popupOpen=false;
  class: any;
  teacherID: any;
  classRoomID: any;
  classID: any;
  section: any;
  id: any;
  item: any;
  name: any;
  student: any;
  sectionID: any;
  selectedDate: any;
  activeDate: any;
  fileTypeLabel: any = [];
  fileList: any[] = [];

  Urls: string[] = [];
  formData = new FormData();
  @ViewChild('FileInput') FileInput!: ElementRef;
  fileInput: File | null = null;
  fileAcceptType: string = 'image/*, video/*';
  fileTypeUpload: string = 'bulk';
  userRoleId: any;
  thumbnail: any;
  studentIDs: any = [];
  // @ViewChild('FileInput') FileInput!: ElementRef;
  // selectedFileType: string = "image";

  constructor(
    private service: ManageStudentGalleryService,
    private classRoomDetials: ClassroomDetailsService,
    private fb: FormBuilder,
    private classroomDetailsService: ClassroomDetailsService,
    private cookie: CookieService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {
    this.StudentGalleryForm = this.fb.group({
      centreID: [0],
      classID: [0],
      classRoomID: ['', Validators.required],
      // sectionID: ['', Validators.required],
      teacherID: [0],
      fileType: [''],
      filePath: [''],
      // videoThumbnail: [""],
      activityDate: ['', Validators.required],
      createdBy: [0],
      studentID: [[], Validators.required],
      createdDate: [''],
      parentComment: [''],
      teacherComment: [''],
      activityName: ['', Validators.required],
    });
  }

  ngOnInit() {
    const daycare = this.cookie.get('CentreID');
    const teacherIDString = this.cookie.get('UserId');
    const teacherID = parseInt(teacherIDString);

    const userRoleIdString = this.cookie.get('UserRoleId');
    const userRoleId = parseInt(userRoleIdString);

    this.userRoleId = userRoleId;
    this.daycareID = daycare;
    this.teacherID = teacherID;

    this.getClassRoom();
  }

  // get class room

  //  async ClassRoomByTeacherID(teacherId: any) {
  //     this.service
  //       .getClassRoomByTeacherID(teacherId, this.userRoleId)
  //       .subscribe((response: any) => {
  //         if (response.message === 'OK') {
  //           this.class = response.result;
  //         }
  //       });
  //   }



  async getClassRoom() {

    this.spinner.show();
    try {
      await this.classroomDetailsService
        .getClassRoom(this.daycareID, this.teacherID, this.userRoleId)
        .subscribe((response: any) => {
          if (response.message === 'OK') {
            this.class = response.result;

            this.spinner.hide();
          }
        });
    } catch {
      console.error('data not fetch')
      this.spinner.hide();

    }

  }

  resetFileInput(): void {
    this.Urls = [];
    this.FileInput.nativeElement.value = '';
  }


  async onSelectClass(event: any) {
    if (
      this.StudentGalleryForm.value.classRoomID == '' ||
      this.StudentGalleryForm.value.classRoomID == null
    ) {
      this.StudentGalleryForm.patchValue({
        studentID: null,
        activityDate: null,
        filePath: null,
        fileType: null,
      });
      this.resetFileInput();
    }

    this.classID = parseInt(event.classroomID, 10);
    if (isNaN(this.classID)) {
      console.error('Invalid classID');
      return;
    }

    // this.getSectionByClassID();
    this.getStudentListByClass(this.classID);
  }

  async onSelectStudent(event: any[]) {
    // Manually extract `id` from each selected student object
    this.studentIDs = event.map(student => student.id);
  }





  // date select
  ngAfterViewInit(): void {
    const currentDate = new Date();

    flatpickr('#datePickerSelectDate', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: currentDate,
    });
  }


  async getStudentList() {

    this.spinner.show();


    await this.service.getStudentBySectionID(this.sectionID).subscribe(
      (response: any) => {
        if (response.message === 'Success') {
          this.student = response.result;
          this.spinner.hide();
        } else {
          console.error('Failed to fetch student list:', response.message);
          this.spinner.hide();

        }
      },
      (error) => {
        console.error('Error fetching student list:', error);
      }
    );
  }

  async getStudentListByClass(classId: any) {

    this.spinner.show();

    await this.classRoomDetials
      .getStudentByClassID(this.daycareID, classId, '')
      .subscribe((data) => {
        if (data.message == 'Success') {
          this.student = data.result;
          this.spinner.hide();

        }
      });
  }

  async onChangeDate(event: any): Promise<void> {
    this.selectedDate = event.target.value;
  }




  generateVideoThumbnail(videoSrc: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.src = videoSrc;
      video.currentTime = 3;

      video.onloadeddata = () => {
        canvas.width = 1080;
        canvas.height = 1080;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg');
        resolve(thumbnail);
      };

      video.onerror = (error) => {
        reject(error);
      };
    });
  }

  async UploadFiles(data: any): Promise<any> {
    try {
      const response = await this.commonService.uploadImages(data).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async onSubmit() {
    if (this.StudentGalleryForm.valid) {
      this.spinner.show();

      try {


        const uploadedImages: string[] = [];

        this.fileList.forEach((item: any) => {
          this.formData.append('files', item.files);
          this.formData.append('type', item.type);
        });

        const fileResponse = await this.UploadFiles(this.formData);

        if (fileResponse?.message === 'OK') {
          uploadedImages.push(
            ...fileResponse.result.map((f: any) => f.imageName) // or f.filePath
          );
          this.StudentGalleryForm.patchValue({ images: uploadedImages });
          this.formData = new FormData();
        }

        this.StudentGalleryForm.patchValue({
          centreID: parseInt(this.daycareID),
          teacherID: this.teacherID,
          activityDate: new Date(
            new Date(this.selectedDate).setDate(
              new Date(this.selectedDate).getDate() + 1
            )
          ),
          createdBy: this.teacherID,
          createdDate: this.activeDate,
          filePath: uploadedImages.join(','),
          fileType: this.fileTypeUpload,
          studentID: this.studentIDs,
          classID: parseInt(this.StudentGalleryForm.value.classRoomID),
          sectionID: parseInt(this.StudentGalleryForm.value.sectionID),
        });




        // Submit the form
        this.service
          .dayCareCentreStudentGallery(this.StudentGalleryForm.value)
          .subscribe(
            (data) => {
              if (data.message === 'OK') {
                this.toastr.success(data.activity);
                this.StudentGalleryForm.reset();
                this.Urls = [];
                this.fileList = [];
                this.formData = new FormData();

                this.FileInput.nativeElement.value = '';
              } else {
                this.StudentGalleryForm.markAllAsTouched();
              }
              this.spinner.hide();
            },
            () => {
              this.toastr.error('Error occurred while submitting bulk File.');
              this.fileList = [];
              this.formData = new FormData();
              this.spinner.hide();



            }
          );
      } catch (error) {
        console.error('File upload error:', error);
        this.toastr.error('Error occurred during file upload.');
        this.spinner.hide();
      }
    } else {
      this.StudentGalleryForm.markAllAsTouched();
    }
  }

  // onFileTypeChange(fileType: string): void {
  //   this.fileAcceptType =
  //     fileType === 'image' ? 'image/*' :
  //     fileType === 'video' ? 'video/*' :
  //     'image/*,video/*';

  //   this.fileTypeLabel =
  //     fileType === 'image' ? 'Images' :
  //     fileType === 'video' ? 'Videos' :
  //     'Images & Videos';

  //     this.fileTypeUpload =
  //     fileType === 'image' ? 'image' :
  //     fileType === 'video' ? 'video' :
  //     ' bulk';
  // }




  FileChange(event: any, type: any) {
    const files: FileList = event.target.files;
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];

    const maxImageCount = 10;
    const maxTotalVideoSizeMB = 50;
    let totalVideoSizeMB = 0;

    if (!this.Urls) this.Urls = [];

    // Count current images
    let imageCount = this.Urls.filter((url: string) => !url.startsWith('data:video')).length;

    // Get existing video size
    const existingFiles = this.formData.getAll('files') || [];
    for (let file of existingFiles as File[]) {
      if (allowedVideoTypes.includes(file.type)) {
        totalVideoSizeMB += file.size / (1024 * 1024);
      }
    }

    // Pre-calculate total new video size
    let newVideoSizeMB = 0;
    for (let item of Array.from(files)) {
      if (allowedVideoTypes.includes(item.type)) {
        newVideoSizeMB += item.size / (1024 * 1024);
      }
    }

    // Strict check: total videos (existing + new) must be within 50 MB
    if ((totalVideoSizeMB + newVideoSizeMB) > maxTotalVideoSizeMB) {
      Swal.fire({
        icon: 'warning',
        title: 'Video Size Limit Exceeded',
        text: `Total video size exceeds the 50 MB limit. Please reduce the video size.`,
      });
      this.Urls = [];
      this.formData = new FormData();
      this.FileInput.nativeElement.value = '';
      return;
    }

    // Process files
    for (let item of Array.from(files)) {
      const fileType = item.type;
      const fileSizeMB = item.size / (1024 * 1024);
      const isImage = allowedImageTypes.includes(fileType);
      const isVideo = allowedVideoTypes.includes(fileType);

      if (isImage) {
        if (imageCount >= maxImageCount) {
          Swal.fire({
            icon: 'warning',
            title: 'Image Limit Reached',
            text: `You can upload a maximum of ${maxImageCount} images.`,
          });
          return;
        }
        imageCount++;
      } else if (!isVideo) {
        Swal.fire({
          icon: 'warning',
          title: 'Unsupported File',
          text: `File "${item.name}" is not a supported format.`,
        });
        return;
      }

      const obj = {
        files: item,
        type: type,
      };
      this.fileList.push(obj);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result;
        const fileMainType = item.type.split('/')[0];

        if (type === 'bulkUpload') {
          if (fileMainType === 'image') {
            this.Urls.push(base64);
          } else if (fileMainType === 'video') {
            this.generateVideoThumbnail(base64).then((thumbnail: string) => {
              this.Urls.push(thumbnail);
            });
          }
        }
      };
      reader.readAsDataURL(item);
    }
  }


  clearImagePath() {
    this.formData = new FormData();
    this.FileInput.nativeElement.value = '';
  }


  ResetForm() {
    // this.StudentGalleryForm.reset();
    // this.Urls = [];
    // this.FileInput.nativeElement.value = '';


    this.StudentGalleryForm.reset();
    this.Urls = [];
    this.formData = new FormData();
    this.FileInput.nativeElement.value = '';

  }

  DeleteFile(index: number) {
    if (index >= 0 && index < this.Urls.length) {
      this.Urls.splice(index, 1);
      if (this.Urls.length === 0 && this.FileInput) {
        this.FileInput.nativeElement.value = '';
      }

      this.Urls.splice(index, 1);
      this.fileList.splice(index, 1);

      // if(this.fileList.length == 0){
      //   this.resetAllActivityUrl();
      // }

    }
  }

  get fileCount() {
    return this.Urls.length;
  }
}
