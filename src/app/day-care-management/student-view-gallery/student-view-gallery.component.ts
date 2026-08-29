import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common-component/common.service';
import { ManageStudentGalleryService } from '../manage-student-gallery/manage-student-gallery.service';
import flatpickr from 'flatpickr';
import { response } from 'express';
import { environment } from '../../../environments/environment';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { ClassroomDetailsService } from '../classroom-management/classroom-details/classroom-details.service';
import { log } from 'console';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

declare var $: any;

interface ApiResponse {
  message: string | null;
  activity: string | undefined;
  result: any | null;
}

@Component({
  selector: 'app-student-view-gallery',
  standalone: true,
  imports: [RouterLink, RouterOutlet, BreadcrumbComponent, NgSelectModule, FormsModule, NgFor, CommonModule,
    ReactiveFormsModule,],
  templateUrl: './student-view-gallery.component.html',
  styleUrl: './student-view-gallery.component.css',
  providers: [DatePipe]
})
export class StudentViewGalleryComponent {


  StudentViewGalleryForm: any;
  student: any;
  parentID: any;
  daycareID: any;
  studentID: any;
  teacherName: any;
  date: any[] = [];
  gallery: any[] = [];

  showAllImages = false;

  readonly rootUrl = environment.apiUrl.slice(0, -3);

  newCommentTexts: { [key: string]: string } = {};
  editText: any;
  flatpickrInstance: any;

  isEditing: any;
  isModalOpen = false;
  commentText = '';
  parentName: any;
  comments: any;
  userRoleId: any;
  action: any;
  addcomment: any;
  comment: any;
  startDate: any;
  endDate: any;
  studentActivityFlatpickrInstance: any;
  selectedDate: any;
  studentDetails: any[] = [];
  selectedImagePaths: any[] = [];
  fullFileSize: any;
  studentGalleryData: any;
  fileSize: any;
  bloomvieSettings: any;
  totalCost: any;
  centreID: any;
  newSelectedDate: any;
  firstStartDate: any;
  selectedFirstStartDate: any;
  selectedFirstEndDate: any;
  firstEndDate: any;
  commentAddDate: any;
  selectedStartDate: any = '';
  selectedEndDate: any = '';
  formattedStartDate: any;
  formattedEndDate: any;
  today: any;
  showDownloadButton: boolean = false;
  selectNewDate: any;
  frontEndWebUrl: string = environment.frontEndWebUrl;
  encryptEndDate: any;
  encryptStartDate: any;






  constructor(private service: ManageStudentGalleryService, private fb: FormBuilder, private cookie: CookieService, private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private toastr: ToastrService, private profileService: ClassroomDetailsService, private classRoomService: ClassroomDetailsService,



  ) {

  }

  ngOnInit() {


    const daycare = this.cookie.get("CentreID")
    const parentIDString = this.cookie.get("UserId");
    const parentID = parseInt(parentIDString);
    const userRoleIdString = this.cookie.get("UserRoleId");
    this.studentID = this.cookie.get("StudentID");
    const userRoleId = parseInt(userRoleIdString);
    this.userRoleId = userRoleId
    const AdminName = this.cookie.get("AdminName");
    this.parentName = AdminName
    this.daycareID = daycare
    this.parentID = parentID
    this.getStudent();
    this.getStudentGallery();
    this.getTeacherDetails()
    this.today = new Date();

  }



  ngAfterViewInit(): void {
    const today = new Date();
    const firstDatePicker = (startDateSelect: string, endDateSelect: string, callback: () => void, disableLast7Days = false) => {
      const today = new Date();

      const selectFrom: any = {
        mode: 'single',
        dateFormat: 'm-d-Y',
        allowInput: true,
        maxDate: today,
        defaultDate: this.selectedFirstStartDate,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 1) {
            this.firstStartDate = this.formatDate(new Date(selectedDates[0].getTime() + 86400000));
            this.selectedFirstStartDate = this.firstStartDate;
            this.selectedFirstStartDate = `${this.selectedFirstStartDate}`;

            this.firstEndDate = this.firstStartDate


            callback();
          }
        }
      };

      const selectTo: any = {
        mode: 'single',
        dateFormat: 'm-d-Y',
        allowInput: true,
        maxDate: today,
        defaultDate: this.selectedFirstEndDate,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 1) {
            this.firstEndDate = this.formatDate(new Date(selectedDates[0].getTime() + 86400000));
            this.selectedFirstEndDate = this.firstEndDate;

            this.selectedFirstEndDate = `${this.firstEndDate}`;

            callback();
          }
        }
      };


      if (disableLast7Days) {
        const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000);
        selectFrom.disable = [
          (date: Date) => {
            return date >= sevenDaysAgo && date < today;
          }
        ];

        selectTo.disable = [
          (date: Date) => {
            return date >= sevenDaysAgo && date < today;
          }
        ];
      }

      const startDateInstance = flatpickr(startDateSelect, selectFrom);
      const endDateInstance = flatpickr(endDateSelect, selectTo);

      this.selectedFirstStartDate = `${this.selectedFirstStartDate}`;
      this.selectedFirstEndDate = `${this.selectedFirstEndDate}`;


      return {
        startDate: this.selectedFirstStartDate,
        endDate: this.selectedFirstEndDate
      };
    };



    const secondDatePicker = (startDateSelect: string, endDateSelect: string, callback: () => void) => {
      const today = new Date();

      const selectFrom: any = {
        mode: 'single',
        dateFormat: 'm-d-Y',
        allowInput: true,
        maxDate: today,
        defaultDate: this.formattedStartDate,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 1) {
            this.startDate = this.formatDate(new Date(selectedDates[0].getTime() + 86400000));
            this.selectedStartDate = this.startDate;
            this.selectedStartDate = this.formattedStartDate;
            callback();
          }
        }
      };

      const selectTo: any = {
        mode: 'single',
        dateFormat: 'm-d-Y',
        allowInput: true,
        maxDate: today,
        defaultDate: this.formattedEndDate,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 1) {
            this.endDate = this.formatDate(new Date(selectedDates[0].getTime() + 86400000));
            this.selectedEndDate = this.endDate;

            this.selectedEndDate = `${this.formattedEndDate}`;

            callback();
          }
        }
      };

      const startDateInstance = flatpickr(startDateSelect, selectFrom);
      const endDateInstance = flatpickr(endDateSelect, selectTo);

      this.selectedStartDate = `${this.formattedStartDate}`;
      this.selectedEndDate = `${this.formattedEndDate}`;



      return {
        startDate: this.selectedStartDate,
        endDate: this.selectedEndDate
      };
    };


    this.selectedDate = ''

    this.flatpickrInstance = firstDatePicker('#firstToDate', '#firstFromDate', this.fetchStudentImages.bind(this), true);

    this.studentActivityFlatpickrInstance = secondDatePicker(
      '#selectFromDate',
      '#selectToDate',
      this.getStudentGallery.bind(this)
    );

  }



  checkDate(selectedDate: any) {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const inputDate = new Date(selectedDate); // Convert input to Date object
    inputDate.setHours(0, 0, 0, 0); // Normalize time to avoid issues
    today.setHours(0, 0, 0, 0);

    // Check if selected date is between sevenDaysAgo and today
    this.showDownloadButton = inputDate >= sevenDaysAgo && inputDate <= today;
  }


  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }


  goToPreviousDate(): void {
    const previous = new Date(this.formattedStartDate);
    previous.setDate(previous.getDate() - 1);
    this.formattedStartDate = this.formatDate(previous);
    this.newSelectedDate = this.formatDate(previous);
    this.selectedStartDate = `${this.datePipe.transform(this.newSelectedDate, 'yyyy-MM-dd')}`;
    this.getStudentGallery();
  }

  isNextDateDisabled(): boolean {
    const today = new Date();
    const todayStr = this.formatDate(today); // Format: 'YYYY-MM-DD'

    // Fallback: use selectedStartDate if selectedEndDate is empty
    const dateToCheck = this.selectedEndDate || this.selectedStartDate;

    // If still empty, allow next button (don’t disable)
    if (!dateToCheck) return false;

    return dateToCheck >= todayStr;
  }

  goToNextDate(): void {
    const next = new Date(this.formattedStartDate);
    next.setDate(next.getDate() + 1);

    this.formattedStartDate = this.formatDate(next);
    this.newSelectedDate = this.formatDate(next);

    this.selectedStartDate = `${this.datePipe.transform(this.newSelectedDate, 'yyyy-MM-dd')}`;
    this.getStudentGallery();
  }



  async getStudentGallery(): Promise<void> {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate());
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    this.formattedStartDate = this.formatDate(startDate);
    this.formattedEndDate = this.formatDate(endDate);


    if (this.startDate) {
      this.formattedStartDate = ''
      this.formattedEndDate = ''
      this.selectedEndDate = ''
      this.newSelectedDate = ''
      this.endDate = ''
    }
    if (this.newSelectedDate) {
      this.formattedStartDate = this.newSelectedDate
      this.formattedEndDate = this.formattedStartDate
      this.selectedEndDate = ''

      if (this.startDate == null) {
        this.endDate = this.endDate
        this.startDate = this.formattedStartDate
        this.formattedEndDate = ''
        this.formattedEndDate = ''
      }
    } else if (this.startDate) {
      this.formattedStartDate = this.startDate
      this.formattedEndDate = this.formattedStartDate

      this.startDate = ''
      this.startDate = ''
    } else if (this.selectedEndDate) {
      this.formattedStartDate = this.selectedEndDate
    } else if (this.commentAddDate) {
      this.formattedStartDate = this.commentAddDate
      this.formattedEndDate = '';
    }

    this.spinner.show();
    this.service.getStudentGalleryByStudentID(this.studentID, this.startDate ? this.startDate : this.formattedStartDate, this.endDate ? this.endDate : this.formattedEndDate).subscribe(
      (response: any) => {
        if (response.message === 'Success') {
          this.gallery = response.result;
          this.studentDetails = []
          this.checkDate(this.startDate ? this.startDate : this.formattedStartDate);
          this.spinner.hide();
        } else {
          this.gallery = []
        }

        this.spinner.hide();

      }


    );
  }


  // isWithinLast7Days(dateString: string): boolean {

  //   if (!dateString) return false;
  //   const itemDate = new Date(dateString);
  //   const today = new Date();
  //   const sevenDaysAgo = new Date();
  //   sevenDaysAgo.setDate(today.getDate() - 7);
  //   return itemDate >= sevenDaysAgo && itemDate <= today;
  // }


  disableRightClick(event: MouseEvent): void {
    event.preventDefault();
  }


  disableDrag(event: DragEvent): void {
    event.preventDefault();
  }


  autoSelectAndDownload() {
    this.autoSelectAllImages();
    this.downloadAllImages();
  }

  autoSelectAllImages() {
    this.selectedImagePaths = [];
    this.studentDetails = [];

    this.gallery.forEach((monthData: any) => {
      monthData.days.forEach((day: any) => {
        day.studentGalleryData.forEach((student: any) => {
          if (student.filePath) {
            this.studentDetails.push(student);
            const images = student.filePath.split(',');

            this.selectedImagePaths.push(
              ...images.map((image: string) =>
                `${student.documentPath}/${image.trim()}`
              )
            );
          }
        });
      });
    });
  }

  async downloadAllImages() {

    this.spinner.show()
    if (!this.selectedImagePaths.length) return;

    const zip = new JSZip();
    let totalSize = 0;
    for (const studentData of this.studentDetails) {

      const folderPath = studentData.documentPath == null
        ? 'Content/Image/BulkUpload/'
        : studentData.documentPath;

      const folderName = `${studentData.studentName}/${folderPath}/${studentData.activityDate}`;
      const folder = zip.folder(folderName);

      if (folder && studentData.filePath) {
        const images = studentData.filePath.split(',').map((img: string) => img.trim());

        for (const image of images) {
          // Skip this image if expired
          const isNotExpired = studentData.expiryDate
            ? new Date(studentData.expiryDate) >= new Date()
            : false;

          if (!isNotExpired) {
            console.warn(`Skipping expired image: ${image}`);
            continue;
          }

          const fullPath = `${folderPath}/${image}`;
          const imageUrl = `${this.rootUrl}${fullPath}`;

          try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);

            const blob = await response.blob();
            const imageName = image.split('/').pop() || 'image.jpg';
            folder.file(imageName, blob); // Assuming JSZip

            totalSize += blob.size;
          } catch (error) {
            console.error(`Error downloading image: ${imageUrl}`, error);
          }
        }
      }

    }

    const totalSizeInMB = totalSize / 1024 / 1024;
    this.fullFileSize = totalSizeInMB.toFixed(2);

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `Student_Activity.zip`;
      link.click();
      this.spinner.hide()

      this.toastr.success("All images have been successfully downloaded!", "Download Complete");
    });
  }




  studentActivityDownloadRequest() {
    if (!this.firstStartDate || !this.firstEndDate) {
      this.toastr.warning("Please select a start and end date.", "Warning");
      return;
    }
    this.spinner.show();


    const formattedStartDate = this.datePipe.transform(this.firstStartDate, 'yyyy-MM-dd');
    if (formattedStartDate) {
      const isoDate = new Date(`${formattedStartDate}T00:00:00Z`).toISOString().split('T')[0];
      this.encryptStartDate = this.commonService.encrypt(isoDate);
    }

    const formattedEndDate = this.datePipe.transform(this.firstEndDate, 'yyyy-MM-dd');
    if (formattedEndDate) {
      const isoDate = new Date(`${formattedEndDate}T00:00:00Z`).toISOString().split('T')[0];
      this.encryptEndDate = this.commonService.encrypt(isoDate);
    }

    const userEncryptID = this.commonService.encrypt(this.parentID.toString());
    const encryptPlanID = this.commonService.encrypt(this.totalCost.toString());
    const encryptGb = this.commonService.encrypt(this.fileSize.toString());
    const type = this.commonService.encrypt('downloadBulkFile');
    const encryptedStudentID = this.commonService.encrypt(this.studentID.toString());



    const paymentUrl = `${this.frontEndWebUrl}payment-details?planPrice=${encryptPlanID}&id=${userEncryptID}&type=${type}&fileSize=${encryptGb}&SDate=${this.encryptStartDate}&EDate=${this.encryptEndDate}&OnSelectStudentID=${encryptedStudentID}`;

    const requestData = {
      StartDate: this.firstStartDate,
      EndDate: this.firstEndDate,
      ParentID: this.parentID ? parseInt(this.parentID, 10) : null,
      StudentID: this.studentID,
      CreatedBy: this.parentID ? parseInt(this.parentID, 10) : null,
      CentreID: this.daycareID,
      FileSize: this.fileSize.toString(),
      Price: this.totalCost,
      PaymentUrl: paymentUrl
    };


    this.profileService.manageStudentRequest(requestData).subscribe(
      (data) => {
        this.spinner.hide();

        if (data.message === 'OK') {
          // this.data = data.result;
          $('#view-del').modal('hide');
          this.clearForm()
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 100);

        } else {
          this.toastr.error("Failed to send download request.", "Error");
        }
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error("An error occurred. Please try again.", "Error");
        console.error("Error:", error);
      }
    );
  }


  clearForm() {
    this.firstStartDate = ''
    this.firstEndDate = ''
    this.selectedFirstStartDate = ''
    this.selectedFirstEndDate = ''
  }

  clearDatepicker() {
    this.firstStartDate = ''
    this.firstEndDate = ''
    this.selectedFirstStartDate = ''
    this.selectedFirstEndDate = ''
  }


  fetchStudentImages() {
    if (!this.firstStartDate || !this.firstEndDate) {
      alert('Please select both start and end dates.');
      return;
    }

    //   if(this.firstStartDate == this.firstEndDate){
    //     // this.formattedStartDate = ''
    //     // this.formattedEndDate = ''
    //     this.selectedFirstEndDate = ''
    //     this.firstEndDate = ''
    // } 

    this.service.getStudentGalleryByStudentID(this.studentID,
      this.firstStartDate ? this.firstStartDate : this.selectedFirstStartDate
      , this.firstEndDate ? this.firstEndDate : this.selectedFirstEndDate
    ).subscribe({
      next: (data) => {
        if (data.message === 'Success') {
          let allImages: any[] = [];

          for (const student of data.result) {
            for (const day of student.days) {
              for (const activity of day.studentGalleryData) {
                const activityDate = new Date(activity.activityDate);
                const start = new Date(this.firstStartDate);
                // const end = new Date(this.firstEndDate);

                let end: Date;
                if (this.firstEndDate) {
                  end = new Date(this.firstEndDate);
                } else {
                  end = new Date(this.firstStartDate);
                }

                if (activityDate >= start && activityDate <= end) {
                  allImages.push({
                    url: activity.filePath,
                    size: activity.fileSize || 0,
                    date: activity.activityDate
                  });
                }
              }
            }
          }
          const totalSizeMB = parseFloat(
            allImages.reduce((sum, img) => sum + parseFloat(img.size || "0"), 0).toFixed(3)
          );
          this.fileSize = totalSizeMB
          this.getBloomvieSettings()
        } else {
          console.error('Failed to retrieve student data:', data.message);
        }
      },
      error: (error) => {
        console.error('Error fetching student data:', error);
      }
    });
  }

  getBloomvieSettings() {
    this.commonService.getBloomvieSettings(1).subscribe((response: ApiResponse) => {
      if (response.message == 'Success') {
        this.bloomvieSettings = response.result;

        if (this.bloomvieSettings[0].costPerGB) {
          this.totalCost = (this.fileSize / 1024) * this.bloomvieSettings[0].costPerGB;
          this.totalCost = Math.trunc(this.totalCost);
        }
      }
    });
  }


  shouldShowDownloadButton(item: any): boolean {
    return item.expiryDate
      ? new Date(item.expiryDate) >= new Date()
      : false;
  }


  blurGalleryDownloadRequest(date: any): void {

    this.selectNewDate = date

    this.clearForm();
    Swal.fire({
      icon: 'info',
      title: 'Unlock Photo',
      text: 'This photo is blurred. To view it in full resolution, please purchase it. Please upgrade your plan to continue.',
      showCancelButton: true,
      confirmButtonText: 'Purchase & Unlock',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Open the modal using Bootstrap JS

        this.selectedFirstStartDate = `${this.datePipe.transform(this.selectNewDate, 'yyyy-MM-dd')}`;
        this.firstStartDate = this.selectNewDate;
        this.firstEndDate = this.selectNewDate;
        this.formattedStartDate = this.selectNewDate;
        this.fetchStudentImages();

        $('#view-del').modal('show');
      }
    });
  }

  // clearDate(){
  //   this.firstStartDate = this.selectNewDate;
  //   this.firstEndDate = this.selectNewDate;
  //   this.formattedStartDate = this.selectNewDate;
  //   this.selectedFirstStartDate = '';
  //   this.selectedFirstEndDate = '';
  //   this.fetchStudentImages();

  // }





  async downloadImages(item: any, selectPath: any) {
    this.spinner.show()
    if (!selectPath) return;
    const zip = new JSZip();
    const folderPath = item.documentPath == null
      ? 'Content/Image/BulkUpload/'
      : item.documentPath;
    const folderName = `${item.studentName}/${folderPath}/${item.activityDate}`;
    const folder = zip.folder(folderName);
    const imagePaths = selectPath.includes(',')
      ? selectPath.split(',').map((img: string) => img.trim())
      : [selectPath.trim()];

    let totalSizeBytes = 0;

    try {
      for (const imagePath of imagePaths) {
        const imageUrl = `${this.rootUrl}${folderPath}/${imagePath}`;

        const response = await fetch(imageUrl);
        if (!response.ok) {
          console.error(`Failed to fetch image: ${imageUrl}`);
          continue;
        }

        const blob = await response.blob();
        totalSizeBytes += blob.size;

        const imageName = imagePath.split('/').pop() || 'image.jpg';
        folder?.file(imageName, blob);
      }

      const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(3);
      this.fullFileSize = totalSizeMB;

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${item.studentName}.zip`);
      this.toastr.success("Download completed successfully!", "Download Successful");
      this.spinner.hide()


    } catch (error) {
      this.spinner.hide()

      console.error("An error occurred while downloading images:", error);
      this.toastr.error("Download failed. Please try again.", "Error");
    }
  }



  // ngAfterViewInit(): void {
  //   const currentDate = new Date();

  //   flatpickr("#datePickerSelectDate", {
  //     dateFormat: 'm-d-Y',
  //     allowInput: true,
  //     maxDate: currentDate,
  //   });
  // }

  // video play code 

  isVideo(file: string): boolean {

    const videoExtensions = ['mp4', 'avi', 'mov', 'webm'];
    const extension = file?.split('.').pop()?.toLowerCase();
    return videoExtensions.includes(extension || '');
  }


  isTodayOrWithinLast7Days(date: Date | string): boolean {
    const selected = new Date(date);
    const today = new Date();

    // Reset time for accurate comparison
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffInTime = today.getTime() - selected.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);

    return diffInDays >= 0 && diffInDays <= 7;
  }



  getStudent() {
    this.gallery = []
    this.service.getStudentByParentID(this.parentID,).subscribe(
      (response: any) => {
        if (response.message === 'Success') {
          this.student = response.result;
        } else {
          console.error('Failed to fetch student list:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching student list:', error);
      }
    );
  }

  // async onStudentID(event: any): Promise<void> {

  //   this.date = [];
  //   this.studentID = event;
  //   this.getStudent();

  // }

  async onDateSelect(event: any): Promise<void> {
    this.gallery = [];
    this.date = event.target.value;
  }

  onSubmit() {

    this.getStudent();

    this.getComment();

    this.getTeacherDetails()

    this.getStudentGallery();
  }



  commentAdd(comment: any, action: any, commentAddDate: any): void {

    this.spinner.show();

    var comment = comment ?? this.newCommentTexts

    if (comment) {
      const ID = this.parentID;
      const date = commentAddDate;
      const type = 'parent';

      this.commentAddDate = commentAddDate

      this.service.ManageComment(ID, comment, action, date, type).subscribe(
        (response: any) => {

          if (response.message === 'comment added successfully.') {

            this.newCommentTexts = {};
            // this.startDate = this.formattedStartDate
            // this.endDate = this.formattedEndDate
            this.getStudentGallery();
            this.spinner.hide();
            comment.isEditing = false;

          } else if (response.message === 'comment updated successfully.') {
            this.newCommentTexts = {};


            this.formattedStartDate = '';
            this.formattedEndDate = '';
            this.selectedEndDate = '';
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

  cancelComment(): void {
    this.newCommentTexts = {};
  }

  enableEditComment(comment: any): void {
    comment.isEditing = true;
    // this.newCommentText = comment.parentComment;
    comment.editText = comment.parentComment;

  }

  cancelEditComment(comment: any): void {
    comment.isEditing = false;

  }


  async getComment(): Promise<void> {
    this.service.GetComment(this.parentID, this.date).subscribe(
      (response: any) => {
        if (response.message === 'Success') {
          this.comments = response.result;

        }
      }
    );
  }

  async getTeacherDetails(): Promise<void> {
    this.spinner.show();
    this.service.getTeacherDetailByParentID(this.parentID, this.studentID).subscribe(
      (response: any) => {
        if (response.message === 'Success') {
          this.teacherName = response.result;
          this.spinner.hide();

        }
      }
    );
  }

}


