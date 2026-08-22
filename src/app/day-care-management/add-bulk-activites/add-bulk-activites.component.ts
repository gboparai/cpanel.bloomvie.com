import { Component, ElementRef, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { FormBuilder } from '@angular/forms';
import * as XLSX from 'xlsx';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserRoleService } from '../../settings/Permission/user-role/user-role.service';
import { ManageStaffService } from '../staff-management/add-staff/manage-staff.service';
import { ActivatedRoute } from '@angular/router';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common-component/common.service';
import { ToastrService } from 'ngx-toastr';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { AddBulkActivityService } from './add-bulk-activity.service';
import { NgFor } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

declare var $: any;

interface excelSheets {
  NapTime: any[];
  Food: any[];
  Health: any[];
  Note: any[];
  Incident: any[];
  Medicine: any[];
}

@Component({
  selector: 'app-add-bulk-activites',
  standalone: true,
  imports: [BreadcrumbComponent, NgFor, NgxPaginationModule],
  providers: [DatePipe],
  templateUrl: './add-bulk-activites.component.html',
  styleUrl: './add-bulk-activites.component.css',
})
export class AddBulkActivitesComponent {
  contentSizeNapTime: number = 5;
  currentPageNapTime: number = 1;

  contentSizeFood: number = 5;
  currentPageFood: number = 1;

  contentSizeMedicine: number = 5;
  currentPageMedicine: number = 1;

  contentSizeHealth: number = 5;
  currentPageHealth: number = 1;

  contentSizeNote: number = 5;
  currentPageNote: number = 1;

  contentSizeIncident: number = 5;
  currentPageIncident: number = 1;

  centreID: any;
  loginUserID: any;
  Urls: string[] = [];
  imageMain: any;
  formData = new FormData();
  fileAcceptType: string = 'image/*, video/*';
  fileTypeUpload: string = 'bulk';
  bulkActivities: {} = {};
  entries: any[] = [];
  uploadedFiles: any;
  classList: any[] = [];
  sectionList: any = {};
  studentList: any = {};
  foodTypeList: any[] = [];
  mealTypeList: any[] = [];
  uploadedResponseFile: any[] = [];

  public NapTimeSkippedRecords: any[] = [];
  public FoodSkippedRecords: any[] = [];
  public HealthSkippedRecords: any[] = [];
  public NoteSkippedRecords: any[] = [];
  public IncidentSkippedRecords: any[] = [];
  public MedicineSkippedRecords: any[] = [];

  skipRecords: excelSheets = {
    NapTime: [],
    Food: [],
    Health: [],
    Note: [],
    Incident: [],
    Medicine: [],
  };

  excelData: excelSheets = {
    NapTime: [],
    Food: [],
    Health: [],
    Note: [],
    Incident: [],
    Medicine: [],
  };

  TeacherSectionRecord: any[] = [];
  validImagesForUploading: any[] = [];

  @ViewChild('FileInput') FileInput!: ElementRef;
  @ViewChild('FileInputBulk') FileInputBulk!: ElementRef;
  UploadedFile: any;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private userRoleService: UserRoleService,
    private Appservice: ApplicationsSettingsService,
    private manageStaffSerivece: ManageStaffService,
    private addBulkServices: AddBulkActivityService,
    private route: ActivatedRoute,
    private cookie: CookieService,
    private commonService: CommonService,
    public onBoardingService: OnboardingService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let enc_id: any = params.get('enc_id');
      if (enc_id) {
        const decryptedId = this.commonService.decrypt(enc_id);
        this.centreID = decryptedId && !isNaN(Number(decryptedId)) ? parseInt(decryptedId, 10) : 0;
      } else if (this.cookie.check('CentreID')) {
        this.centreID = parseInt(this.cookie.get('CentreID'));
      }
      if (this.centreID) {
        if (this.cookie.check('UserId')) {
          this.loginUserID = parseInt(this.cookie.get('UserId'));
        }
      }
      this.getTeacherAssignments();
      this.getFoodType();
      this.getMealType();
    });
  }

  onBulkUploadClick(): void {
    const modalTrigger = document.getElementById('exampleModal');
    if (modalTrigger) {
      const modal = $('#exampleModal').modal('show');
      modal.show();
    }
  }

  // async fileChange(event: any, type: string) {
  //   const files = event.target.files;

  //   // Check if files are selected
  //   if (!files || files.length === 0) return;

  //   for (let index = 0; index < files.length; index++) {
  //     const file = files[index];
  //     const fileType = file.type.split('/')[0]; // "image" or "video"

  //     // Append to FormData
  //     this.formData.append('files', file);
  //     this.formData.append('type', type);

  //     const reader = new FileReader();
  //     reader.onload = async (e: any) => {
  //       try {
  //         if (type === "bulkUpload") {
  //           // Lazy initialization of URLs
  //           if (!this.Urls) {
  //             this.Urls = [];
  //           }

  //           if (fileType === "image") {
  //             // Directly add the image preview
  //             this.Urls.push(e.target.result);
  //           } else if (fileType === "video") {
  //             // Generate thumbnail for video
  //             const thumbnail = await this.generateVideoThumbnail(e.target.result);
  //             this.Urls.push(thumbnail);
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Error processing file:", error);
  //       }
  //     };

  //     reader.readAsDataURL(file);
  //   }

  //   // // Upload files after loop
  //   // try {
  //   //   const fileResponse = await this.uploadFiles(this.formData);
  //   //   if (fileResponse?.message === 'OK') {
  //   //     // Process uploaded file names
  //   //     const uploadedImages = fileResponse.result.map((res: any) => res.imageName).join(',');
  //   //     this.formData = new FormData(); // Reset FormData after successful upload
  //   //   }
  //   // } catch (error) {
  //   //   console.error("Error uploading files:", error);
  //   // }
  // }

  fileChange(event: any) {
    if (event.target.files.length > 0) {
      this.uploadedFiles = event.target.files;

    }
  }

  async uploadFiles(data: FormData): Promise<any> {
    try {
      const response = await this.commonService.uploadImages(data).toPromise();
      return response;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  async checkAndUploadFileOnServer(validImage: string[]) {
    validImage.forEach((item: any) => {
      const file = Array.from(this.uploadedFiles as FileList).find(
        (f) => f.name.toLowerCase() === item
      );
      if (file) {
        this.formData.append('files', file);
        this.formData.append('type', 'bulk-activites-upload');
      }
    });

    try {
      const fileResponse = await this.uploadFiles(this.formData);
      if (fileResponse?.message === 'OK') {
        this.uploadedResponseFile = fileResponse.result;
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }

  // generateVideoThumbnail(videoSrc: string): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const video = document.createElement('video');
  //     const canvas = document.createElement('canvas');
  //     const context = canvas.getContext('2d');

  //     video.src = videoSrc;
  //     video.currentTime = 3;

  //     video.onloadeddata = () => {
  //       canvas.width = 1080;
  //       canvas.height = 1080;
  //       context?.drawImage(video, 0, 0, canvas.width, canvas.height);
  //       const thumbnail = canvas.toDataURL('image/jpeg');
  //       resolve(thumbnail);
  //     };

  //     video.onerror = (error) => {
  //       reject(error);
  //     };
  //   });
  // }

  // DeleteFile(index: number) {
  //   if (index >= 0 && index < this.Urls.length) {
  //     this.Urls.splice(index, 1);
  //     if (this.Urls.length === 0 && this.FileInput) {
  //       this.FileInput.nativeElement.value = '';
  //     }
  //   }
  // }

  // get fileCount() {
  //   return this.Urls.length;
  // }

  downloadBulkFormatSheet() {
    this.spinner.show();
    this.manageStaffSerivece
      .downloadBulkUploadSheetForActivites(this.centreID, this.loginUserID)
      .subscribe({
        next: (response) => {
          const base64String = response.result;
          const byteCharacters = atob(base64String);

          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'BulkUploadActivites.xlsx';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.spinner.hide();
        },
        error: (err) => {
          this.toastr.error('Failed to download the Excel file.');
          console.error(err);
          this.spinner.hide();
        },
      });
  }

  getTeacherAssignments() {
    this.addBulkServices
      .getTeacherAssignments(this.loginUserID, this.centreID)
      .subscribe((data: any) => {
        if (data.message == 'OK') {
          this.TeacherSectionRecord = data.result;

          this.TeacherSectionRecord.forEach((item: any) => {
            this.classList.push(item.className);
            item.sections.forEach((innerItem: any) => {
              this.studentList[item.className] = innerItem.students;
            });
          });

          // this.TeacherSectionRecord.forEach((item: any) => {
          //   this.classList.push(item.className);
          //   let sectionArray: any = [];

          //   let sectionObj: any = {};

          //   item.sections.forEach((section: any) => {
          //     sectionArray.push(section.sectionName);
          //     let studentArray: any = [];
          //     section.students.forEach((studentName: any) => {
          //       studentArray.push(studentName);
          //     });

          //     sectionObj[section.sectionName] = studentArray;
          //   });

          //   this.studentList[item.className] = sectionObj;
          //   this.sectionList[item.className] = sectionArray;
          // });


        } else {

        }
      });
  }

  getFoodType() {
    this.addBulkServices.getFoodType().subscribe((data: any) => {
      if (data.message == 'Success') {
        data.result.forEach((item: any) => {
          this.foodTypeList.push(item.foodType + ' | ' + item.id);
        });

      }
    });
  }

  getMealType() {
    this.addBulkServices.getMealType().subscribe((data: any) => {
      if (data.message == 'Success') {

        data.result.forEach((item: any) => {
          this.mealTypeList.push(item.mealType);
        });

      }
    });
  }

  selectUploadedFile(event: any) {
    if (this.uploadedFiles != undefined) {
      this.UploadedFile = event.target.files[0];
      this.UploadBulkExternalEmployeeDetail();
    } else {
      Swal.fire('Image not found!', 'please upload image', 'error');
      event.target.value = '';
    }
  }

  convertFractionalTimeToString(value: number): string {
    if (value < 0 || value >= 1) {
      throw new Error(
        'Invalid Excel time value. Must be a fraction of a day (0 <= value < 1).'
      );
    }

    const totalSeconds = Math.round(value * 24 * 60 * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  convertExcelDate(numericDate: number, format: string): string {
    const baseDate = new Date(1900, 0, 1);

    baseDate.setDate(baseDate.getDate() + numericDate - 2);

    return this.datePipe.transform(baseDate, format) || '';
  }

  isValidExcelDate(value: any): boolean {
    return !isNaN(value) && Number(value) > 0;
  }

  isValidDateString(value: any): boolean {
    const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    return typeof value === 'string' && datePattern.test(value.trim());
  }

  isValidExcelTime(value: any): boolean {
    return !isNaN(value) && Number(value) > 0 && Number(value) < 1;
  }

  isValidTimeString(value: any): boolean {
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    return typeof value === 'string' && timePattern.test(value.trim());
  }

  UploadBulkExternalEmployeeDetail() {
    const fileReader = new FileReader();
    // let value: excelSheets = {
    //   NapTime: [],
    //   Food: [],
    //   Health: [],
    //   Note: [],
    //   Incident: [],
    //   Medicine: []
    // };

    fileReader.readAsBinaryString(this.UploadedFile);
    fileReader.onload = async (event) => {
      let binaryData = event.target?.result;
      let workbook = XLSX.read(binaryData, { type: 'binary' });

      let imageNameArray: any = [];

      Array.from(this.uploadedFiles).forEach((item: any) => {
        imageNameArray.push(item.name);
      });

      workbook.SheetNames.forEach((sheet, i) => {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
          defval: '',
        });

        const pattern = /^[a-zA-Z\s]+\s*\|\s*\d+$/i;
        const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
        const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        const allowedClasses = this.classList;
        const allowedSections: any = this.sectionList;
        const allowedStudents: any = this.studentList;

        switch (sheet) {
          // Nap time Activity
          case 'Nap Time':
            const validRecordsForNapTime = data.filter((item: any) => {
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const dateValue = item['Select Date'];
              const napStartTimeValue = item['Nap Start Time'];
              const napEndTimeValue = item['Nap End Time'];
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              const isValidClass = allowedClasses.includes(classValue);

              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);

              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              if (isValidImage) {
                ImageSplitArray.forEach((value: any) => {
                  if (!this.validImagesForUploading.includes(value)) {
                    this.validImagesForUploading.push(value);
                  }
                });
              }

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedStartTime = this.isValidExcelTime(
                napStartTimeValue
              )
                ? this.convertFractionalTimeToString(napStartTimeValue)
                : this.isValidTimeString(napStartTimeValue)
                  ? napStartTimeValue.trim()
                  : '';

              const convertedEndTime = this.isValidExcelTime(napEndTimeValue)
                ? this.convertFractionalTimeToString(napEndTimeValue)
                : this.isValidTimeString(napEndTimeValue)
                  ? napEndTimeValue.trim()
                  : '';

              const isTimeRangeValid =
                convertedStartTime && convertedEndTime
                  ? new Date(`1970-01-01T${convertedStartTime}`) <
                  new Date(`1970-01-01T${convertedEndTime}`)
                  : false;

              return (
                Images !== '' &&
                isValidImage &&
                classValue !== '' &&
                isValidClass &&
                isValidStudent &&
                studentValue !== '' &&
                pattern.test(studentValue) &&
                convertedDate !== '' &&
                datePattern.test(convertedDate) &&
                !isNaN(new Date(convertedDate).getTime()) &&
                convertedStartTime !== '' &&
                convertedEndTime !== '' &&
                timePattern.test(convertedStartTime) &&
                timePattern.test(convertedEndTime) &&
                isTimeRangeValid
              );
            });

            const invalidRecordsForNapTime = data.filter((item: any) => {
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const dateValue = item['Select Date'];
              const napStartTimeValue = item['Nap Start Time'];
              const napEndTimeValue = item['Nap End Time'];
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedStartTime = this.isValidExcelTime(
                napStartTimeValue
              )
                ? this.convertFractionalTimeToString(napStartTimeValue)
                : this.isValidTimeString(napStartTimeValue)
                  ? napStartTimeValue.trim()
                  : '';

              const convertedEndTime = this.isValidExcelTime(napEndTimeValue)
                ? this.convertFractionalTimeToString(napEndTimeValue)
                : this.isValidTimeString(napEndTimeValue)
                  ? napEndTimeValue.trim()
                  : '';

              const isTimeRangeValid =
                convertedStartTime && convertedEndTime
                  ? new Date(`1970-01-01T${convertedStartTime}`) <
                  new Date(`1970-01-01T${convertedEndTime}`)
                  : false;

              return (
                Images === '' ||
                !isValidImage ||
                classValue === '' ||
                !isValidClass ||
                !isValidStudent ||
                studentValue === '' ||
                !pattern.test(studentValue) ||
                convertedDate === '' ||
                !datePattern.test(convertedDate) ||
                isNaN(new Date(convertedDate).getTime()) ||
                convertedStartTime === '' ||
                convertedEndTime === '' ||
                !timePattern.test(convertedStartTime) ||
                !timePattern.test(convertedEndTime) ||
                !isTimeRangeValid
              );
            });

            if (invalidRecordsForNapTime.length > 0) {
              this.skipRecords.NapTime = invalidRecordsForNapTime;
            }
            this.excelData.NapTime = validRecordsForNapTime;
            break;

          // food Activity
          case 'Food':
            const validRecordsForFood = data.filter((item: any) => {
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const foodTypeValue = item['Food Type']
                ? item['Food Type'].trim()
                : '';
              const dateValue = item['Select Date'];
              const timeValue = item['Select Time'];
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const mealTypeValue = item['Meal Type']
                ? item['Meal Type'].trim()
                : '';
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              if (isValidImage) {
                ImageSplitArray.forEach((value: any) => {
                  if (!this.validImagesForUploading.includes(value)) {
                    this.validImagesForUploading.push(value);
                  }
                });
              }

              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const isValidFoodType = this.foodTypeList.includes(foodTypeValue);
              const isValidMealType = this.mealTypeList.includes(mealTypeValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedTime = this.isValidExcelTime(timeValue)
                ? this.convertFractionalTimeToString(timeValue)
                : this.isValidTimeString(timeValue)
                  ? timeValue.trim()
                  : '';

              return (
                Images !== '' &&
                isValidImage &&
                mealTypeValue !== '' &&
                isValidMealType &&
                isValidFoodType &&
                classValue !== '' &&
                isValidClass &&
                isValidStudent &&
                studentValue !== '' &&
                pattern.test(studentValue) &&
                foodTypeValue !== '' &&
                pattern.test(foodTypeValue) &&
                convertedDate !== '' &&
                datePattern.test(convertedDate) &&
                !isNaN(new Date(convertedDate).getTime()) &&
                convertedTime !== '' &&
                timePattern.test(convertedTime)
              );
            });

            const invalidRecordsForFood = data.filter((item: any) => {
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const foodTypeValue = item['Food Type']
                ? item['Food Type'].trim()
                : '';
              const dateValue = item['Select Date'];
              const timeValue = item['Select Time'];
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const mealTypeValue = item['Meal Type']
                ? item['Meal Type'].trim()
                : '';

              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const isValidFoodType = this.foodTypeList.includes(foodTypeValue);
              const isValidMealType = this.mealTypeList.includes(mealTypeValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedTime = this.isValidExcelTime(timeValue)
                ? this.convertFractionalTimeToString(timeValue)
                : this.isValidTimeString(timeValue)
                  ? timeValue.trim()
                  : '';

              return (
                Images === '' ||
                !isValidImage ||
                mealTypeValue === '' ||
                !isValidMealType ||
                !isValidFoodType ||
                classValue === '' ||
                !isValidClass ||
                !isValidStudent ||
                studentValue === '' ||
                !pattern.test(studentValue) ||
                foodTypeValue === '' ||
                !pattern.test(foodTypeValue) ||
                convertedDate === '' ||
                !datePattern.test(convertedDate) ||
                isNaN(new Date(convertedDate).getTime()) ||
                convertedTime === '' ||
                !timePattern.test(convertedTime)
              );
            });

            if (invalidRecordsForFood.length > 0) {
              this.skipRecords.Food = invalidRecordsForFood;
            }

            this.excelData.Food = validRecordsForFood;
            break;

          // health activity
          case 'Health':
            const validRecordsForHealth = data.filter((item: any) => {
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const dateValue = item['Select Date'];
              const timeValue = item['Select Time'];
              const bodyTemperatureValue = item['Body Temperature'];
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              if (isValidImage) {
                ImageSplitArray.forEach((value: any) => {
                  if (!this.validImagesForUploading.includes(value)) {
                    this.validImagesForUploading.push(value);
                  }
                });
              }

              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const isValidBodyTemperature =
                bodyTemperatureValue !== '' &&
                !isNaN(bodyTemperatureValue) &&
                /^(\d+(\.\d+)?)?$/.test(bodyTemperatureValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedTime = this.isValidExcelTime(timeValue)
                ? this.convertFractionalTimeToString(timeValue)
                : this.isValidTimeString(timeValue)
                  ? timeValue.trim()
                  : '';

              return (
                Images !== '' &&
                isValidImage &&
                classValue !== '' &&
                isValidClass &&
                isValidStudent &&
                studentValue !== '' &&
                pattern.test(studentValue) &&
                convertedDate !== '' &&
                datePattern.test(convertedDate) &&
                !isNaN(new Date(convertedDate).getTime()) &&
                convertedTime !== '' &&
                timePattern.test(convertedTime) &&
                isValidBodyTemperature
              );
            });

            const invalidRecordsForHealth = data.filter((item: any) => {
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const dateValue = item['Select Date'];
              const timeValue = item['Select Time'];
              const bodyTemperatureValue = item['Body Temperature'];
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const isInvalidBodyTemperature =
                bodyTemperatureValue === '' ||
                isNaN(bodyTemperatureValue) ||
                !/^(\d+(\.\d+)?)?$/.test(bodyTemperatureValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedTime = this.isValidExcelTime(timeValue)
                ? this.convertFractionalTimeToString(timeValue)
                : this.isValidTimeString(timeValue)
                  ? timeValue.trim()
                  : '';

              return (
                Images === '' ||
                !isValidImage ||
                classValue === '' ||
                !isValidClass ||
                !isValidStudent ||
                studentValue === '' ||
                !pattern.test(studentValue) ||
                convertedDate === '' ||
                !datePattern.test(convertedDate) ||
                isNaN(new Date(convertedDate).getTime()) ||
                convertedTime === '' ||
                !timePattern.test(convertedTime) ||
                isInvalidBodyTemperature
              );
            });

            if (invalidRecordsForHealth.length > 0) {
              this.skipRecords.Health = invalidRecordsForHealth;
            }
            this.excelData.Health = validRecordsForHealth;
            break;

          // Note Activity
          case 'Note':
            const validRecordsForNote = data.filter((item: any) => {
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const dateValue = item['Select Date'];
              const timeValue = item['Time'];
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              if (isValidImage) {
                ImageSplitArray.forEach((value: any) => {
                  if (!this.validImagesForUploading.includes(value)) {
                    this.validImagesForUploading.push(value);
                  }
                });
              }
              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedTime = this.isValidExcelTime(timeValue)
                ? this.convertFractionalTimeToString(timeValue)
                : this.isValidTimeString(timeValue)
                  ? timeValue.trim()
                  : '';

              return (
                Images !== '' &&
                isValidImage &&
                classValue !== '' &&
                isValidClass &&
                isValidStudent &&
                studentValue !== '' &&
                pattern.test(studentValue) &&
                convertedDate !== '' &&
                datePattern.test(convertedDate) &&
                !isNaN(new Date(convertedDate).getTime()) &&
                convertedTime !== '' &&
                timePattern.test(convertedTime)
              );
            });

            const invalidRecordsForNote = data.filter((item: any) => {
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const dateValue = item['Select Date'];
              const timeValue = item['Time'];
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedTime = this.isValidExcelTime(timeValue)
                ? this.convertFractionalTimeToString(timeValue)
                : this.isValidTimeString(timeValue)
                  ? timeValue.trim()
                  : '';

              return (
                Images === '' ||
                !isValidImage ||
                classValue === '' ||
                !isValidClass ||
                !isValidStudent ||
                studentValue === '' ||
                !pattern.test(studentValue) ||
                convertedDate === '' ||
                !datePattern.test(convertedDate) ||
                isNaN(new Date(convertedDate).getTime()) ||
                convertedTime === '' ||
                !timePattern.test(convertedTime)
              );
            });
            if (invalidRecordsForNote.length > 0) {
              this.skipRecords.Note = invalidRecordsForNote;
            }
            this.excelData.Note = validRecordsForNote;

            break;

          // Incident Activity
          case 'Incident':
            const validRecordsForIncident = data.filter((item: any) => {
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const dateValue = item['Select Date'];
              const timeValue = item['Select Time'];
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              if (isValidImage) {
                ImageSplitArray.forEach((value: any) => {
                  if (!this.validImagesForUploading.includes(value)) {
                    this.validImagesForUploading.push(value);
                  }
                });
              }

              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedTime = this.isValidExcelTime(timeValue)
                ? this.convertFractionalTimeToString(timeValue)
                : this.isValidTimeString(timeValue)
                  ? timeValue.trim()
                  : '';

              return (
                Images !== '' &&
                isValidImage &&
                classValue !== '' &&
                isValidClass &&
                isValidStudent &&
                studentValue !== '' &&
                pattern.test(studentValue) &&
                convertedDate !== '' &&
                datePattern.test(convertedDate) &&
                !isNaN(new Date(convertedDate).getTime()) &&
                convertedTime !== '' &&
                timePattern.test(convertedTime)
              );
            });

            const invalidRecordsForIncident = data.filter((item: any) => {
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const dateValue = item['Select Date'];
              const timeValue = item['Select Time'];
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedTime = this.isValidExcelTime(timeValue)
                ? this.convertFractionalTimeToString(timeValue)
                : this.isValidTimeString(timeValue)
                  ? timeValue.trim()
                  : '';

              return (
                Images === '' ||
                !isValidImage ||
                classValue === '' ||
                !isValidClass ||
                !isValidStudent ||
                studentValue === '' ||
                !pattern.test(studentValue) ||
                convertedDate === '' ||
                !datePattern.test(convertedDate) ||
                isNaN(new Date(convertedDate).getTime()) ||
                convertedTime === '' ||
                !timePattern.test(convertedTime)
              );
            });

            if (invalidRecordsForIncident.length > 0) {
              this.skipRecords.Incident = invalidRecordsForIncident;
            }
            this.excelData.Incident = validRecordsForIncident;

            break;

          // Medicine Activity
          case 'Medicine':
            const validRecordsForMedicine = data.filter((item: any) => {
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const dateValue = item['Select Date'];
              const timeValue = item['Select Time'];
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              if (isValidImage) {
                ImageSplitArray.forEach((value: any) => {
                  if (!this.validImagesForUploading.includes(value)) {
                    this.validImagesForUploading.push(value);
                  }
                });
              }

              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedTime = this.isValidExcelTime(timeValue)
                ? this.convertFractionalTimeToString(timeValue)
                : this.isValidTimeString(timeValue)
                  ? timeValue.trim()
                  : '';

              return (
                Images !== '' &&
                isValidImage &&
                classValue !== '' &&
                isValidClass &&
                isValidStudent &&
                studentValue !== '' &&
                pattern.test(studentValue) &&
                convertedDate !== '' &&
                datePattern.test(convertedDate) &&
                !isNaN(new Date(convertedDate).getTime()) &&
                convertedTime !== '' &&
                timePattern.test(convertedTime)
              );
            });

            const invalidRecordsForMedicine = data.filter((item: any) => {
              const studentValue = item['Students']
                ? item['Students'].trim()
                : '';
              const dateValue = item['Select Date'];
              const timeValue = item['Select Time'];
              const classValue = item['Class'] ? item['Class'].trim() : '';
              // const sectionValue = item['Section']
              //   ? item['Section'].trim()
              //   : '';
              const Images = item['Images'];

              let ImageSplitArray = Images.split(',');
              let isValidImage: boolean = true;

              ImageSplitArray.forEach((value: any) => {
                if (!imageNameArray.includes(value)) {
                  isValidImage = false;
                  return;
                }
              });

              const isValidClass = allowedClasses.includes(classValue);
              // const isValidSection =
              //   isValidClass &&
              //   allowedSections[classValue]?.includes(sectionValue);
              const isValidStudent =
                isValidClass &&
                allowedStudents[classValue]?.includes(studentValue);

              const convertedDate = this.isValidExcelDate(dateValue)
                ? this.convertExcelDate(dateValue, 'MM/dd/yyyy')
                : this.isValidDateString(dateValue)
                  ? dateValue.trim()
                  : '';

              const convertedTime = this.isValidExcelTime(timeValue)
                ? this.convertFractionalTimeToString(timeValue)
                : this.isValidTimeString(timeValue)
                  ? timeValue.trim()
                  : '';

              return (
                Images === '' ||
                !isValidImage ||
                classValue === '' ||
                !isValidClass ||
                !isValidStudent ||
                studentValue === '' ||
                !pattern.test(studentValue) ||
                convertedDate === '' ||
                !datePattern.test(convertedDate) ||
                isNaN(new Date(convertedDate).getTime()) ||
                convertedTime === '' ||
                !timePattern.test(convertedTime)
              );
            });

            if (invalidRecordsForMedicine.length > 0) {
              this.skipRecords.Medicine = invalidRecordsForMedicine;
            }

            this.excelData.Medicine = validRecordsForMedicine;
            break;

          default:
            break;
        }
      });

      let excelFormatData: any = this.excelData;

      await this.checkAndUploadFileOnServer(this.validImagesForUploading);
      let newObj: any[] = [];

      for (let sheet in excelFormatData) {
        let MasterActivityID =
          sheet == 'NapTime'
            ? 1
            : sheet == 'Food'
              ? 2
              : sheet == 'Health'
                ? 4
                : sheet == 'Note'
                  ? 3
                  : sheet == 'Incident'
                    ? 5
                    : sheet == 'Medicine'
                      ? 6
                      : 0;
        if (excelFormatData[sheet].length > 0) {
          let napEndTime: string = '';
          let napStartTime: string = '';
          let FoodType: string = '';
          let MealType: string = '';
          let MealItem: string = '';
          let BodyTemperature: string = '';
          let Activity: string = '';
          let ImageArray: any[] = [];

          excelFormatData[sheet].forEach((val: any) => {
            switch (sheet) {
              case 'NapTime':
                if (val['Nap End Time'] && val['Nap Start Time']) {
                  napEndTime = this.convertFractionalTimeToString(
                    val['Nap End Time']
                  );
                  napStartTime = this.convertFractionalTimeToString(
                    val['Nap Start Time']
                  );
                } else if (val['Nap End Time']) {
                  napEndTime = this.convertFractionalTimeToString(
                    val['Nap End Time']
                  );
                  napStartTime = '';
                } else if (val['Nap Start Time']) {
                  napStartTime = this.convertFractionalTimeToString(
                    val['Nap Start Time']
                  );
                  napEndTime = '';
                } else {
                  napEndTime = '';
                  napStartTime = '';
                }

                Activity = 'Added Nap Time';
                break;

              case 'Food':
                if (
                  val['Select Time'] &&
                  val['Food Type'] &&
                  val['Meal Type']
                ) {
                  napStartTime = this.convertFractionalTimeToString(
                    val['Select Time']
                  );
                  let foodTypeID = val['Food Type'].split('|');
                  FoodType = foodTypeID[1].trim();
                  MealType =
                    val['Meal Type'].toLowerCase() == 'breakfast'
                      ? '2'
                      : val['Meal Type'].toLowerCase() == 'lunch'
                        ? '1'
                        : '3';
                } else if (val['Select Time']) {
                  napStartTime = this.convertFractionalTimeToString(
                    val['Select Time']
                  );
                } else if (val['Food Type']) {
                  let foodTypeID = val['Food Type'].split('|');
                  FoodType = foodTypeID[1].trim();
                } else if (val['Meal Type']) {
                  MealType =
                    val['Meal Type'].toLowerCase() == 'breakfast'
                      ? '2'
                      : val['Meal Type'].toLowerCase() == 'lunch'
                        ? '1'
                        : '3';
                } else {
                  napStartTime = '';
                  MealType = '';
                  FoodType = '';
                }

                MealItem = val['Meal Item'];
                Activity = 'Added Food Activity';
                break;

              case 'Health':
                if (val['Select Time']) {
                  napStartTime = this.convertFractionalTimeToString(
                    val['Select Time']
                  );
                } else {
                  napStartTime = '';
                }

                BodyTemperature = val['Body Temperature'];
                Activity = 'Added Health Activity';
                break;

              case 'Note':
                if (val['Time']) {
                  napStartTime = this.convertFractionalTimeToString(
                    val['Time']
                  );
                } else {
                  napStartTime = '';
                }

                Activity = 'Added Note Activity';
                break;

              case 'Incident':
                if (val['Select Time']) {
                  napStartTime = this.convertFractionalTimeToString(
                    val['Select Time']
                  );
                } else {
                  napStartTime = '';
                }
                Activity = 'Added Incident Activity';
                break;

              case 'Medicine':
                if (val['Select Time']) {
                  napStartTime = this.convertFractionalTimeToString(
                    val['Select Time']
                  );
                } else {
                  napStartTime = '';
                }

                Activity = 'Added Medicine Activity';
                break;

              default:
                break;
            }

            let studentID = [];
            if (val['Students']) {
              let splitStudentName = val['Students'].split('|');
              studentID.push(splitStudentName[1].trim());
            } else {
              studentID = [];
            }
            let Date = '';
            if (val['Select Date']) {
              Date = this.convertExcelDate(val['Select Date'], 'MM/dd/yyyy');
            } else {
              Date = '';
            }

            let Note = val['Note'];
            let Image = val['Images'];

            // let ImagePath =val["ImagePath"]

            // Handle images (if applicable)
            // if (val["Images"] && val["ImagePath"]) {
            //   const images = val["Images"].split("|");
            //   const imagePaths = val["ImagePath"].split("|");

            //   images.forEach((imageName: string, index: number) => {
            //     ImageArray.push({
            //       imageName: imageName.trim(),
            //       path: imagePaths[index]?.trim() || '',
            //       type: 'jpeg', // Set type dynamically if needed
            //       base64Data: '', // Add base64 data if required
            //     });
            //   });
            // } else {
            //   ImageArray = [];
            // }

            if (this.uploadedResponseFile.length > 0) {
              this.uploadedResponseFile.forEach((item: any) => {
                const splitImageArray = Image.split(',');
                splitImageArray.forEach((subItem: any) => {
                  if (item.originalImageName == subItem) {
                    let imageType = item.imageName.split('.');

                    ImageArray.push({
                      imageName: item.imageName,
                      path: item.path,
                      type: imageType[1],
                    });
                  }
                });
              });
            } else {
              ImageArray = [];
            }

            const storedObj = {
              studentID: studentID,
              activity: Activity,
              teacherID: this.loginUserID,
              startTime: napStartTime,
              endTime: napEndTime,
              masterActivityID: MasterActivityID,
              note: Note,
              foodTypeID: FoodType,
              mealTypeID: MealType,
              mealItem: MealItem,
              bodyTemperature: BodyTemperature,
              date: Date,
              images: ImageArray,
            };

            const cleanedObj = Object.fromEntries(
              Object.entries(storedObj).filter(
                ([key, value]) =>
                  value !== '' && value !== null && value !== undefined
              )
            );

            newObj.push(cleanedObj);
          });
        }
      }

      this.entries = newObj;

      const bodyObj = {
        obj: newObj,
      };
      this.bulkActivities = bodyObj;
    };
  }

  clearFileInput() {
    this.FileInput.nativeElement.value = '';
    this.FileInputBulk.nativeElement.value = '';

    this.UploadedFile = null;
    this.uploadedFiles = null;
  }

  // download Invalid Record
  downloadInvalidRecordsSheet() {
    this.spinner.show();
    this.viewFoodRecord();
    this.viewHealthRecord();
    this.viewIncidentRecord();
    this.viewMedicineRecord();
    this.viewNoteRecord();

    const obj = {
      napTime: this.NapTimeSkippedRecords,
      food: this.FoodSkippedRecords,
      medicine: this.MedicineSkippedRecords,
      health: this.HealthSkippedRecords,
      note: this.NoteSkippedRecords,
      incident: this.IncidentSkippedRecords,
    };

    let centreID = this.centreID;
    let teacherID = this.loginUserID;
    this.addBulkServices
      .downloadInvalidRecordsSheet(obj, centreID, teacherID)
      .subscribe((response: any) => {
        if (response.message == 'Success') {
          const base64String = response.result;
          const byteCharacters = atob(base64String);

          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'InvalidBulkUploadActivites.xlsx';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.spinner.hide();
        }
      });
  }

  manageBulkUpload() {
    ;
    this.spinner.show();
    if (this.UploadedFile) {
      if (this.entries.length > 0) {
        this.Appservice.UploadBulkActivitesOfStudent(
          this.bulkActivities
        ).subscribe((data: any) => {
          if (data.message == 'OK') {
            this.spinner.hide();
            this.toastr.success('Bulk Uploaded Successfully');
            this.clearFileInput();
            $('#exampleModal').modal('hide');

            this.skipRecords.NapTime.forEach((item: any) => {
              let itemObj: any = {};

              // getting student details
              let studentArray = item['Students']
                ? item['Students'].split(' | ')
                : '';
              let studentName = studentArray[0];
              let studentID = studentArray[1];
              itemObj.studentName = studentName;
              itemObj.studentID = studentID;

              // getting date of nap time
              let validDate = item['Select Date']
                ? this.isValidExcelDate(item['Select Date'])
                  ? this.convertExcelDate(item['Select Date'], 'MM/dd/yyyy')
                  : this.isValidDateString(item['Select Date'])
                    ? item['Select Date'].trim()
                    : ''
                : '';

              itemObj.Date = validDate;

              // getting start time
              let validStartTime = item['Nap Start Time']
                ? this.isValidExcelTime(item['Nap Start Time'])
                  ? this.convertFractionalTimeToString(item['Nap Start Time'])
                  : this.isValidTimeString(item['Nap Start Time'])
                    ? item['Nap Start Time'].trim()
                    : ''
                : '';

              itemObj.startTime = validStartTime;

              // getting end time
              let validEndTime = item['Nap End Time']
                ? this.isValidExcelTime(item['Nap End Time'])
                  ? this.convertFractionalTimeToString(item['Nap End Time'])
                  : this.isValidTimeString(item['Nap End Time'])
                    ? item['Nap End Time'].trim()
                    : ''
                : '';

              itemObj.endTime = validEndTime;

              // other details
              itemObj.note = item['Note'];
              itemObj.Image = item['Images'];
              itemObj.Class = item['Class'];
              // itemObj.Section = item['Section'];

              this.NapTimeSkippedRecords.push(itemObj);
            });

            $('#exampleModal8').modal('show');
          } else {
            this.spinner.hide();
            this.toastr.error('Something went wrong !!');
          }
        });
      } else {
        this.spinner.hide();
        Swal.fire(
          'File is Empty!',
          'please fill the data then upload',
          'error'
        );
      }
    } else {
      this.spinner.hide();
      Swal.fire('No file Selected!', 'please select file and upload', 'error');
    }
  }

  viewFoodRecord() {
    this.FoodSkippedRecords = [];
    this.skipRecords.Food.forEach((item: any) => {
      let itemObj: any = {};

      // getting student details
      let studentArray = item['Students'] ? item['Students'].split(' | ') : '';
      let studentName = studentArray[0];
      let studentID = studentArray[1];
      itemObj.studentName = studentName;
      itemObj.studentID = studentID;

      // getting date of nap time
      let validDate = item['Select Date']
        ? this.isValidExcelDate(item['Select Date'])
          ? this.convertExcelDate(item['Select Date'], 'MM/dd/yyyy')
          : this.isValidDateString(item['Select Date'])
            ? item['Select Date'].trim()
            : ''
        : '';

      itemObj.Date = validDate;

      // getting start time
      let validStartTime = item['Select Time']
        ? this.isValidExcelTime(item['Select Time'])
          ? this.convertFractionalTimeToString(item['Select Time'])
          : this.isValidTimeString(item['Select Time'])
            ? item['Select Time'].trim()
            : ''
        : '';
      itemObj.startTime = validStartTime;

      // getting food type
      let FoodTypeArray = item['Food Type']
        ? item['Food Type'].split(' | ')
        : '';
      let foodType = FoodTypeArray[0];
      let foodTypeID = FoodTypeArray[1];

      itemObj.foodType = foodType;
      itemObj.foodTypeID = foodTypeID;

      // other details
      itemObj.note = item['Note'];
      itemObj.Image = item['Images'];
      itemObj.Class = item['Class'];
      // itemObj.Section = item['Section'];
      itemObj.mealType = item['Meal Type'];
      itemObj.mealItem = item['Meal Item'];

      this.FoodSkippedRecords.push(itemObj);
    });
  }

  viewMedicineRecord() {
    this.MedicineSkippedRecords = [];
    this.skipRecords.Medicine.forEach((item: any) => {
      let itemObj: any = {};

      // getting student details
      let studentArray = item['Students'] ? item['Students'].split(' | ') : '';
      let studentName = studentArray[0];
      let studentID = studentArray[1];
      itemObj.studentName = studentName;
      itemObj.studentID = studentID;

      // getting date of nap time
      let validDate = item['Select Date']
        ? this.isValidExcelDate(item['Select Date'])
          ? this.convertExcelDate(item['Select Date'], 'MM/dd/yyyy')
          : this.isValidDateString(item['Select Date'])
            ? item['Select Date'].trim()
            : ''
        : '';

      itemObj.Date = validDate;

      // getting start time
      let validStartTime = item['Select Time']
        ? this.isValidExcelTime(item['Select Time'])
          ? this.convertFractionalTimeToString(item['Select Time'])
          : this.isValidTimeString(item['Select Time'])
            ? item['Select Time'].trim()
            : ''
        : '';
      itemObj.startTime = validStartTime;

      // other details
      itemObj.note = item['Note'];
      itemObj.Image = item['Images'];
      itemObj.Class = item['Class'];
      // itemObj.Section = item['Section'];

      this.MedicineSkippedRecords.push(itemObj);
    });
  }

  viewHealthRecord() {
    this.HealthSkippedRecords = [];
    this.skipRecords.Health.forEach((item: any) => {
      let itemObj: any = {};

      // getting student details
      let studentArray = item['Students'] ? item['Students'].split(' | ') : '';
      let studentName = studentArray[0];
      let studentID = studentArray[1];
      itemObj.studentName = studentName;
      itemObj.studentID = studentID;

      // getting date of nap time
      let validDate = item['Select Date']
        ? this.isValidExcelDate(item['Select Date'])
          ? this.convertExcelDate(item['Select Date'], 'MM/dd/yyyy')
          : this.isValidDateString(item['Select Date'])
            ? item['Select Date'].trim()
            : ''
        : '';

      itemObj.Date = validDate;

      // getting start time
      let validStartTime = item['Select Time']
        ? this.isValidExcelTime(item['Select Time'])
          ? this.convertFractionalTimeToString(item['Select Time'])
          : this.isValidTimeString(item['Select Time'])
            ? item['Select Time'].trim()
            : ''
        : '';
      itemObj.startTime = validStartTime;

      // other details
      itemObj.bodyTemp = item['Body Temperature'];
      itemObj.note = item['Note'];
      itemObj.Image = item['Images'];
      itemObj.Class = item['Class'];
      // itemObj.Section = item['Section'];

      this.HealthSkippedRecords.push(itemObj);
    });
  }

  viewNoteRecord() {
    this.NoteSkippedRecords = [];
    this.skipRecords.Note.forEach((item: any) => {
      let itemObj: any = {};

      // getting student details
      let studentArray = item['Students'] ? item['Students'].split(' | ') : '';
      let studentName = studentArray[0];
      let studentID = studentArray[1];
      itemObj.studentName = studentName;
      itemObj.studentID = studentID;

      // getting date of nap time
      let validDate = item['Select Date']
        ? this.isValidExcelDate(item['Select Date'])
          ? this.convertExcelDate(item['Select Date'], 'MM/dd/yyyy')
          : this.isValidDateString(item['Select Date'])
            ? item['Select Date'].trim()
            : ''
        : '';

      itemObj.Date = validDate;

      // getting start time
      let validStartTime = item['Time']
        ? this.isValidExcelTime(item['Time'])
          ? this.convertFractionalTimeToString(item['Time'])
          : this.isValidTimeString(item['Time'])
            ? item['Time'].trim()
            : ''
        : '';
      itemObj.startTime = validStartTime;

      // other details
      itemObj.note = item['Note'];
      itemObj.Image = item['Images'];
      itemObj.Class = item['Class'];
      // itemObj.Section = item['Section'];

      this.NoteSkippedRecords.push(itemObj);
    });
  }

  viewIncidentRecord() {
    this.IncidentSkippedRecords = [];
    this.skipRecords.Incident.forEach((item: any) => {
      let itemObj: any = {};

      // getting student details
      let studentArray = item['Students'] ? item['Students'].split(' | ') : '';
      let studentName = studentArray[0];
      let studentID = studentArray[1];
      itemObj.studentName = studentName;
      itemObj.studentID = studentID;

      // getting date of nap time

      let validDate = item['Select Date']
        ? this.isValidExcelDate(item['Select Date'])
          ? this.convertExcelDate(item['Select Date'], 'MM/dd/yyyy')
          : this.isValidDateString(item['Select Date'])
            ? item['Select Date'].trim()
            : ''
        : '';

      itemObj.Date = validDate;

      // getting start time
      let validStartTime = item['Select Time']
        ? this.isValidExcelTime(item['Select Time'])
          ? this.convertFractionalTimeToString(item['Select Time'])
          : this.isValidTimeString(item['Select Time'])
            ? item['Select Time'].trim()
            : ''
        : '';

      itemObj.startTime = validStartTime;

      // other details
      itemObj.note = item['Note'];
      itemObj.Image = item['Images'];
      itemObj.Class = item['Class'];
      // itemObj.Section = item['Section'];

      this.IncidentSkippedRecords.push(itemObj);
    });
  }

  // UploadBulkExternalEmployeeDetail() {
  //   const fileReader = new FileReader();

  //   fileReader.readAsBinaryString(this.UploadedFile);
  //   fileReader.onload = (event) => {
  //     let binaryData = event.target?.result;
  //     let workbook = XLSX.read(binaryData, { type: 'binary' });
  //     workbook.SheetNames.forEach((sheet) => {
  //       const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
  //       switch (sheet) {
  //         case "Nap Time":
  //           this.excelData.NapTime = data;
  //           break;
  //         case "Food":
  //           this.excelData.Food = data;
  //           break;
  //         case "Health":
  //           this.excelData.Health = data;
  //           break;
  //         case "Note":
  //           this.excelData.Note = data;
  //           break;
  //         case "Incident":
  //           this.excelData.Incident = data;
  //           break;
  //         case "Medicine":
  //           this.excelData.Medicine = data;
  //           break;
  //         default:
  //           break;
  //       }
  //     });

  //     let excelFormatData: any = this.excelData;
  //     let newObj: any[] = [];

  //     for (let sheet in this.excelData) {
  //       let MasterActivityID = sheet == "NapTime" ? 1 : sheet == "Food" ? 2 : sheet == "Health" ? 4 :
  //         sheet == "Note" ? 3 : sheet == "Incident" ? 5 : sheet == "Medicine" ? 6 : 0;

  //       if (excelFormatData[sheet].length > 0) {
  //         excelFormatData[sheet].forEach((val: any) => {
  //           let napEndTime: string = "";
  //           let napStartTime: string = "";
  //           let FoodType: string = '';
  //           let MealType: string = '';
  //           let MealItem: string = '';
  //           let BodyTemperature: string = '';
  //           let Activity: string = '';
  //           let ImageArray: any[] = [];

  //           // Construct activity-specific values
  //           switch (sheet) {
  //             case "NapTime":
  //               napEndTime = this.convertFractionalTimeToString(val["Nap End Time"]);
  //               napStartTime = this.convertFractionalTimeToString(val["Nap Start Time"]);
  //               Activity = 'Added Nap Time';
  //               break;

  //             case "Food":
  //               napStartTime = this.convertFractionalTimeToString(val["Select Time"]);
  //               let foodTypeID = val["Food Type"].split("|");
  //               FoodType = foodTypeID[1].trim();
  //               MealType = val["Meal Type"] == "Breakfast" ? '2' : val["Meal Type"] == "Lunch" ? '1' : '3';
  //               MealItem = val["Meal Item"];
  //               Activity = 'Added Food Activity';
  //               break;

  //             case "Health":
  //               napStartTime = this.convertFractionalTimeToString(val["Select Time"]);
  //               BodyTemperature = val["Body Temperature"];
  //               Activity = 'Added Health Activity';
  //               break;

  //             case "Note":
  //               napStartTime = this.convertFractionalTimeToString(val["Time"]);
  //               Activity = 'Added Note Activity';
  //               break;

  //             case "Incident":
  //               napStartTime = this.convertFractionalTimeToString(val["Select Time"]);
  //               Activity = 'Added Incident Activity';
  //               break;

  //             case "Medicine":
  //               napStartTime = this.convertFractionalTimeToString(val["Select Time"]);
  //               Activity = 'Added Medicine Activity';
  //               break;

  //             default:
  //               break;
  //           }

  //           // Parse student details and date
  //           let splitStudentName = val["Students"].split("|");
  //           let studentID = splitStudentName[1].trim();
  //           let Date = this.convertExcelDate(val["Select Date"], 'MM/dd/yyyy');
  //           let Note = val["Note"];

  //           // Handle images (if applicable)
  //           if (val["Images"] && val["ImagePath"]) {
  //             const images = val["Images"].split("|");
  //             const imagePaths = val["ImagePath"].split("|");

  //             images.forEach((imageName: string, index: number) => {
  //               ImageArray.push({
  //                 imageName: imageName.trim(),
  //                 path: imagePaths[index]?.trim() || '',
  //                 type: 'jpeg', // Set type dynamically if needed
  //                 base64Data: '', // Add base64 data if required
  //               });
  //             });
  //           }

  //           // Construct the object according to Swagger specification
  //           const storedObj = {
  //             studentID: parseInt(studentID),
  //             teacherID: this.loginUserID,
  //             activity: Activity,
  //             startTime: {
  //               ticks: 0, // Update with actual ticks if needed
  //               days: 0,
  //               hours: parseInt(napStartTime.split(":")[0]) || 0,
  //               minutes: parseInt(napStartTime.split(":")[1]) || 0,
  //               seconds: 0,
  //               milliseconds: 0,
  //             },
  //             endTime: {
  //               ticks: 0, // Update with actual ticks if needed
  //               days: 0,
  //               hours: parseInt(napEndTime.split(":")[0]) || 0,
  //               minutes: parseInt(napEndTime.split(":")[1]) || 0,
  //               seconds: 0,
  //               milliseconds: 0,
  //             },
  //             masterActivityID: MasterActivityID,
  //             images: ImageArray,
  //             date: Date,
  //             note: Note,
  //             foodTypeID: parseInt(FoodType) || 0,
  //             mealTypeID: parseInt(MealType) || 0,
  //             mealItem: MealItem,
  //             bodyTemperature: parseFloat(BodyTemperature) || 0,
  //           };

  //           // Clean up null, undefined, or empty values
  //           const cleanedObj = Object.fromEntries(
  //             Object.entries(storedObj).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
  //           );

  //           newObj.push(cleanedObj);
  //         });
  //       }
  //     }

  //     const bodyObj = {
  //       obj: newObj,
  //     };

  //     this.Appservice.UploadBulkActivitesOfStudent(bodyObj).subscribe((data: any) => {
  //       if (data.message === 'Ok') {
  //       }
  //     });
  //   };
  // }
}
