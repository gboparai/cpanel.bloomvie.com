import {
  Component,
  ElementRef,
  Input,
  SimpleChange,
  ViewChild,
} from '@angular/core';
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
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonService } from '../../../common-component/common.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ClassroomDetailsService } from '../classroom-details/classroom-details.service';
import { ToastrService } from 'ngx-toastr';
import flatpickr from 'flatpickr';
import { log } from 'console';
import { environment } from '../../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';
import { firstValueFrom, startWith } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";
import { TooltipComponent } from '../../../common-component/tooltip/tooltip.component';
import { ImageCroppedEvent, ImageCropperComponent, OutputFormat } from 'ngx-image-cropper';
import { Interface } from 'readline';


declare var $: any;
interface ActivityFileCounter {
  type: string;
  count: number;
}

@Component({
  selector: 'app-manage-student-activities',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    AddStudentComponent,
    AddClassroomComponent,
    RouterLink,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    SkeletonLoaderComponent,
    TooltipComponent,
    ImageCropperComponent
  ],
  templateUrl: './manage-student-activities.component.html',
  styleUrls: ['./manage-student-activities.component.css'],
  providers: [DatePipe],
})


export class ManageStudentActivitiesComponent {
  MedicineForm: any;
  daycareID: any;
  classes: any = [];
  className: any;
  id: any;
  imageFiles: File[] = [];
  currentFileIndex = 0;
  hoveredRow: any;
  formData = new FormData();
  selectedFile: any;
  @Input() MasterActivityID!: number;
  // @Input() SelectedStudentId!: any;
  @Input() dynamicData!: 0;
  @Input() activityType!: any;
  @Input() activity: any;
  selectAll: any;
  SelectedStudentId: number[] = []; // popupOpen=false;

  readonly rootUrl = environment.apiUrl.slice(0, -3);

  selectedImages: File[] = [];
  Token: any;
  workTiming: any = {};
  uploadMediaForm: FormGroup;
  // Form
  NapTimeForm: FormGroup;
  FoodForm: FormGroup;
  classId: any;
  name: any;
  // NoteForm: FormGroup;
  MealCompletion: any[] = [
    {
      label: "10%",
      value: 10
    },
    {
      label: "20%",
      value: 20
    }, {
      label: "30%",
      value: 30
    },
    {
      label: "40%",
      value: 40
    },
    {
      label: "50%",
      value: 50
    },
    {
      label: "60%",
      value: 60
    }, {
      label: "70%",
      value: 70
    },
    {
      label: "80%",
      value: 80
    },
    {
      label: "90%",
      value: 90
    },
    {
      label: "100%",
      value: 100
    }
  ];
  // Image Url
  napUrls: string[] = [];
  foodUrls: string[] = [];
  noteUrls: string[] = [];
  healthUrls: string[] = [];
  incidentUrls: string[] = [];
  medsUrls: string[] = [];
  reminderUrls: string[] = [];
  uploadMediaUrls: string[] = [];
  fileList: any[] = [];
  StudentList: any[] = [];

  @ViewChild('napfileInput') napfileInput!: ElementRef;
  @ViewChild('foodFileInput') foodFileInput!: ElementRef;
  @ViewChild('noteFileInput') noteFileInput!: ElementRef;
  @ViewChild('healthFileInput') healthFileInput!: ElementRef;
  @ViewChild('incidentFileInput') incidentFileInput!: ElementRef;
  @ViewChild('medsFileInput') medsFileInput!: ElementRef;
  @ViewChild('reminderFileInput') reminderFileInput!: ElementRef;
  @ViewChild('upladMediaFileInput') upladMediaFileInput!: ElementRef;


  // @ViewChild('noteFileInput') noteFileInput!: ElementRef;

  ContentP: number = 1;
  ContentSize: number = 5;
  napStart: any;
  napEndTime: any;
  foodServingTime: any;
  noteTime: any;
  NoteForm: any;
  HealthForm: any;
  healthTime: any;
  IncidentForm: any;
  incidentTime: any;
  medsTime: any;
  teacherID: any;
  SlotForm: any;
  food: any;
  obj: any;
  foodData: any[] = [];
  classRoom: any;
  errorMessage: string = '';
  item: any;
  dateRangePicker: any;
  AcceptedMasterActivityID: number = 1;
  ReminderForm: any;
  reminderTime: any;
  CenterID: number = 0;
  currentDayTiming: any = {};
  gallery: any;
  activityID: any;
  galleryID: any;
  filePath: any;
  isTemperatureInvalid: boolean = false;
  UserRoleId: any;
  ClassAndSectionForm: any;
  centreID: any;
  teacherAvailabilityDays: any[] = [];
  skeletonShow = 'Skelton'
  imageChangedEvent: any;
  imageFileBlob: Blob[] = [];
  imageTypeFileForCrop: string = '';
  showUploadBtnToUploadCroppedImages: boolean = false;
  tempCroppedEvent: ImageCroppedEvent | null = null;
  singleImageUploadedFirst: boolean = false;
  videoFiles: File[] = [];
  activityTypeID: any;
  activityFileCounter: { [type: string]: number } = {};
  showFileCount: number = 0;
  extractedSizeOfDeletedVideo: number = 0;
  croppedImageType: OutputFormat = 'png';
  urlMap: { [key: string]: string[] } = {};
  maxTotalVideoSizeMB: number = 45;
  maxImageCount: number = 10;
  existingImageCount: any;
  existingVideoSizeMB: number = 0;
  isEditModeOn: boolean = false;
  videoSizeMap: any;

  fileSizeMB: number = 0;
  totalVideoSizeMB: number = 0;
  imageCount: number = 0;
  newTotalSize: number = 0;
  totalImageCount: number = 0;
  existingVideoCount: number = 0
  videoCount: number = 0;
  showVideoFileMB: number = 0;
  showVideoCount: number = 0;


  allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];



  activityMediaStats: {
    [key: string]: {
      imageCount: number;
      videoCount: number;
      videoSizeMB: number;
    };
  } = {
      Nap: { imageCount: 0, videoCount: 0, videoSizeMB: 0 },
      Food: { imageCount: 0, videoCount: 0, videoSizeMB: 0 },
      Note: { imageCount: 0, videoCount: 0, videoSizeMB: 0 },
      Health: { imageCount: 0, videoCount: 0, videoSizeMB: 0 },
      Incident: { imageCount: 0, videoCount: 0, videoSizeMB: 0 },
      Meds: { imageCount: 0, videoCount: 0, videoSizeMB: 0 },
      Reminder: { imageCount: 0, videoCount: 0, videoSizeMB: 0 },
      uploadMedia: { imageCount: 0, videoCount: 0, videoSizeMB: 0 },
    };


  constructor(
    private router: Router,

    private classroomDetailsService: ClassroomDetailsService,
    private spinner: NgxSpinnerService,
    private cookie: CookieService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private commonService: CommonService
  ) {
    this.NapTimeForm = fb.group({
      ID: [0],
      studentID: [0],
      napID: [0],
      napDate: ['', Validators.required],
      napStartTime: ['', Validators.required],
      napEndTime: ['', Validators.required],
      note: [''],
      createdBy: [0],
      images: [''],
    });

    this.FoodForm = fb.group({
      studentID: [0],
      foodID: [0],
      foodServingDate: ['', Validators.required],
      foodServingTime: ['', Validators.required],
      // foodTypeID: ['', Validators.required],
      mealCompletion: [''],
      mealTypeID: [''],
      mealItem: [''],
      createdBy: [0],
      note: [''],
      images: [''],
    });

    this.NoteForm = fb.group({
      studentID: [0],
      noteID: [0],
      noteDate: ['', Validators.required],
      noteTime: ['', Validators.required],
      createdBy: [0],
      images: [''],
      note: [''],
    });

    this.HealthForm = fb.group({
      studentID: [0],
      healthID: [0],
      healthDate: ['', Validators.required],
      healthTime: ['', Validators.required],
      bodyTemperature: [0, Validators.required],
      createdBy: [0],
      images: [''],
      note: [''],
    });

    this.IncidentForm = fb.group({
      studentID: [0],
      incidentDate: ['', Validators.required],
      incidentTime: ['', Validators.required],
      createdBy: [0],
      images: [''],
      note: [''],
    });

    this.MedicineForm = fb.group({
      studentID: [0],
      medsDate: ['', Validators.required],
      medsTime: ['', Validators.required],
      createdBy: [0],
      images: [''],
      note: [''],
    });

    this.ReminderForm = fb.group({
      studentID: [0],
      reminderDate: ['', Validators.required],
      reminderTime: ['', Validators.required],
      createdBy: [0],
      images: [''],
      note: ['', Validators.required],
    });

    this.uploadMediaForm = fb.group({
      studentID: [0],
      uploadMediaDate: ['', Validators.required],
      createdBy: [0],
      images: [''],
      note: [''],
    });

    this.ClassAndSectionForm = fb.group({
      // sectionID: [""],
      ageGroupID: [''],
      classroomID: [''],
    });
  }

  ngOnInit(): void {
    // this.activity
    this.AcceptedMasterActivityID = this.MasterActivityID;
    const teacherIDString = this.cookie.get('UserId');
    this.CenterID = parseInt(this.cookie.get('CentreID'));
    this.UserRoleId = parseInt(this.cookie.get('UserRoleId'));
    this.centreID = parseInt(this.cookie.get('CentreID'));

    this.teacherID = parseInt(teacherIDString);
    this.teacherID = this.teacherID;
    this.formData = new FormData();
    this.getFoodType();
    this.getDaycareWorkTimingByCentreID();

    // const activity = this.activity

    // this.NapTimeForm.get('napDate')?.disable();

    if (history.state.activityID) {

      this.activityID = history.state.activityID.id;
      this.activityTypeID = history.state.activityID.activityId;

      this.getStudentActivityByActivityID(this.activityID);



    } else {
      this.getClassRoom();
      this.getteacherAvailability();

    }


    if (this.AcceptedMasterActivityID == null) {
      this.AcceptedMasterActivityID = 1;
    }
  }

  getteacherAvailability() {
    this.classroomDetailsService.getTeacherAvailability(Number(this.teacherID), this.centreID)
      .subscribe((data) => {
        if ((data.message = 'Ok')) {
          this.teacherAvailabilityDays = data.result;
        } else {
          this.teacherAvailabilityDays = [];
        }
      });
  }

  patchActivityForm(activity: any) {

    switch (activity.activityId) {
      case 1: // Nap Time
        this.NapTimeForm.patchValue({
          napDate: this.datePipe.transform(activity.date, 'MM-dd-yyyy'),
          napStartTime: activity.startTime,
          napEndTime: activity.endTime,
          note: activity.note,
        });
        break;

      case 2: // Food
        this.FoodForm.patchValue({
          foodServingDate: this.datePipe.transform(activity.date, 'MM-dd-yyyy'),
          foodServingTime: activity.startTime,
          foodTypeID: activity.foodType,
          mealTypeID: activity.mealType,
          mealItem: activity.mealItem,
          note: activity.note,
        });
        break;

      case 3: // Note
        this.NoteForm.patchValue({
          noteDate: this.datePipe.transform(activity.date, 'MM-dd-yyyy'),
          noteTime: activity.startTime,
          note: activity.note,
        });
        break;

      case 4: // Health
        this.HealthForm.patchValue({
          healthDate: this.datePipe.transform(activity.date, 'MM-dd-yyyy'),
          healthTime: activity.startTime,
          bodyTemperature: activity.bodyTemperature,
          note: activity.note,
        });
        break;

      case 5: // Incident
        this.IncidentForm.patchValue({
          incidentDate: this.datePipe.transform(activity.date, 'MM-dd-yyyy'),
          incidentTime: activity.startTime,
          note: activity.note,
        });
        break;

      case 6: // Medicine
        this.MedicineForm.patchValue({
          medsDate: this.datePipe.transform(activity.date, 'MM-dd-yyyy'),
          medsTime: activity.startTime,
          note: activity.note,
        });
        break;

      case 7: // Reminder
        this.ReminderForm.patchValue({
          reminderDate: this.datePipe.transform(activity.date, 'MM-dd-yyyy'),
          reminderTime: activity.startTime,
          note: activity.note,
        });
        break;

      case 8:
        this.uploadMediaForm.patchValue({
          uploadMediaDate: this.datePipe.transform(activity.date, 'MM-dd-yyyy'),
          note: activity.note,
        });
        break;

      default:
        console.warn('Unknown activity type:', activity.activityId);
        break;
    }
  }

  ngAfterViewInit(): void {


    setTimeout(() => {
      const currentDate = new Date();

      flatpickr('#dateRangePicker', {
        dateFormat: 'm-d-Y',
        allowInput: true,
        maxDate: currentDate,
      });

      flatpickr('#reminderdateRangePicker', {
        dateFormat: 'm-d-Y',
        allowInput: true,
        minDate: 'today',
      });
    }, 1000);
  }

  initializeFlatpickr() {
    const currentDate = new Date();
    flatpickr('#dateRangePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      maxDate: currentDate,
    });

    flatpickr('#reminderdateRangePicker', {
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: 'today',
    });
  }

  getActivityDate(event: any) {

    const date = new Date(event.target.value);

    const jsDay = date.getDay();
    const dayId = jsDay === 0 ? 7 : jsDay;

    if (!this.teacherAvailabilityDays.includes(dayId)) {
      this.resetAllActivityForms();
      this.toastr.warning('Selected day is not available for the teacher.');
    }

    const days = ['sun', 'mon', 'tues', 'wed', 'thu', 'fri', 'sat'];
    const selectedDay = days[date.getDay()];

    switch (selectedDay) {
      case 'sun':
        if (this.workTiming.sun == true) {
          this.currentDayTiming.startTime = this.workTiming.sunStartTime;
          this.currentDayTiming.endTime = this.workTiming.sunEndTime;
        } else {
          this.currentDayTiming = {};
          this.resetAllActivityForms();
          $('.dateRangePickerClass').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'mon':
        if (this.workTiming.mon == true) {
          this.currentDayTiming.startTime = this.workTiming.monStartTime;
          this.currentDayTiming.endTime = this.workTiming.monEndTime;
        } else {
          this.currentDayTiming = {};
          $('.dateRangePickerClass').val(null);
          this.resetAllActivityForms();
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'tues':
        if (this.workTiming.tues == true) {
          this.currentDayTiming.startTime = this.workTiming.tuesStartTime;
          this.currentDayTiming.endTime = this.workTiming.tuesEndTime;
        } else {
          this.currentDayTiming = {};
          $('.dateRangePickerClass').val(null);
          this.resetAllActivityForms();
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'wed':
        if (this.workTiming.wed == true) {
          this.currentDayTiming.startTime = this.workTiming.wedStartTime;
          this.currentDayTiming.endTime = this.workTiming.wedEndTime;
        } else {
          this.currentDayTiming = {};
          $('.dateRangePickerClass').val(null);
          this.resetAllActivityForms();
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'thu':
        if (this.workTiming.thu == true) {
          this.currentDayTiming.startTime = this.workTiming.thuStartTime;
          this.currentDayTiming.endTime = this.workTiming.thuEndTime;
        } else {
          this.currentDayTiming = {};
          $('.dateRangePickerClass').val(null);
          this.resetAllActivityForms();
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'fri':
        if (this.workTiming.fri == true) {
          this.currentDayTiming.startTime = this.workTiming.friStartTime;
          this.currentDayTiming.endTime = this.workTiming.friEndTime;
        } else {
          this.currentDayTiming = {};
          $('.dateRangePickerClass').val(null);
          this.resetAllActivityForms();
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'sat':
        if (this.workTiming.sat == true) {
          this.currentDayTiming.startTime = this.workTiming.satStartTime;
          this.currentDayTiming.endTime = this.workTiming.satEndTime;
        } else {
          this.currentDayTiming = {};
          $('.dateRangePickerClass').val(null);
          this.resetAllActivityForms();
          this.toastr.error('The daycare is not operating today');
        }
        break;
    }
  }

  onClickToAddMasterActivityID(masterActivityID: number, type: string) {
    this.formData = new FormData();
    this.AcceptedMasterActivityID = masterActivityID;
    this.showFileCount = this.activityFileCounter[type] !== undefined ? this.activityFileCounter[type] : 0;

  }

  getFoodType(): void {
    this.classroomDetailsService.getFoodType().subscribe(
      (data) => {
        if (data.message === 'Success') {
          this.food = data.result;

        } else {
          console.error('Failed to retrieve student profile:', data.message);
        }
      },
      (error) => {
        console.error('Error fetching student profile:', error);
      }
    );
  }

  validatingBodyTemperature(event: any) {
    let value = event.target.value;

    if (isNaN(value)) {
      this.HealthForm.patchValue({
        bodyTemperature: null,
      });
    } else {
      if (value < 90 || value > 105) {
        this.isTemperatureInvalid = true;
        this.HealthForm.patchValue({
          bodyTemperature: null,
        });
      } else {
        this.isTemperatureInvalid = false;
      }
    }
  }

  getMimeType(mimeType: string): OutputFormat {

    const splittedMime = mimeType.split('/')[1].toLowerCase();
    switch (splittedMime) {
      case 'jpeg':
      case 'jpg':
      case 'jfif':
        return 'jpeg';

      case 'png':
        return 'png';

      case 'webp':
        return 'webp';

      case 'ico':
        return 'ico';

      case 'bmp':
        return 'bmp'

      default:
        return 'png';
    }

  }


  onFileSelection(event: any, type: string) {
    this.imageFiles = [];
    this.videoFiles = [];
    const dataTransfer = new DataTransfer();

    this.imageTypeFileForCrop = type;
    const selectedFiles: File[] = Array.from(event.target.files);
    const allowedVideoTypes = [
      'video/mp4',
      'video/quicktime', // .mov
      'video/webm',
      'video/x-msvideo', // .avi
    ];


    for (let file of selectedFiles) {
      if (allowedVideoTypes.includes(file.type)) {
        this.videoFiles.push(file);

      } else {
        this.imageFiles.push(file);
      }
    }
    this.fileChangeHandler();
    this.videoFiles = [];
    if (this.imageFiles.length > 0) {
      if (this.imageFiles.length === 1) {
        const file = this.imageFiles[0];
        this.croppedImageType = this.getMimeType(file.type);
        dataTransfer.items.add(file);
        const inputEvent = { target: { files: dataTransfer.files } };
        this.imageChangedEvent = inputEvent;
        $("#cropperModalForSingleImage").modal('show');
      }
      else {
        const file = this.imageFiles[this.currentFileIndex];
        this.croppedImageType = this.getMimeType(file.type);
        dataTransfer.items.add(file);
        const inputEvent = { target: { files: dataTransfer.files } };
        this.imageChangedEvent = inputEvent;
        $("#cropperModal").modal('show');
        this.showUploadBtnToUploadCroppedImages = false;
      }
    }


  }

  storeTempCrop(event: ImageCroppedEvent) {
    this.tempCroppedEvent = event;
  }

  processCroppedImageForSingle() {

    if (this.tempCroppedEvent?.blob) {
      this.imageFileBlob = [];
      this.imageFileBlob.push(this.tempCroppedEvent?.blob);
      this.fileChangeHandler();
      this.singleImageUploadedFirst = true;
    }

  }

  processCroppedImage() {

    const dataTransfer = new DataTransfer();

    if (this.tempCroppedEvent?.blob) {

      if (this.singleImageUploadedFirst) {
        this.imageFileBlob.shift();
        this.singleImageUploadedFirst = false;
      }

      this.imageFileBlob.push(this.tempCroppedEvent?.blob);
      this.currentFileIndex++;

      if (this.currentFileIndex < this.imageFiles.length) {
        const file = this.imageFiles[this.currentFileIndex];
        this.croppedImageType = this.getMimeType(file.type);
        dataTransfer.items.add(file);
        const inputEvent = { target: { files: dataTransfer.files } };
        this.imageChangedEvent = inputEvent;
        this.showUploadBtnToUploadCroppedImages = false;
      }
      else {
        this.currentFileIndex = 0;
        this.imageFiles = [];
        this.showUploadBtnToUploadCroppedImages = true;
      }
    }
  }




  isEditMode(type: string) {
    if (this.activityTypeID && this.activity?.imageEdit?.length) {
      const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const allowedVideoExtensions = ['.mp4', '.mov', '.avi', '.webm'];




      let imageCount = 0;
      this.videoCount = 0;
      let totalVideoSizeMB = 0;

      for (let data of this.activity.imageEdit) {
        const fileName = data.documentImage?.toLowerCase() || '';
        const fileSizeMB = parseFloat(data.fileSize || '0'); // already in MB

        const isImage = allowedImageExtensions.some(ext => fileName.endsWith(ext));
        const isVideo = allowedVideoExtensions.some(ext => fileName.endsWith(ext));
        this.imageTypeFileForCrop = data.documentPath

        if (isImage) {
          imageCount++;
        } else if (isVideo) {
          this.videoCount++;
          totalVideoSizeMB += fileSizeMB;
        }
      }

      // Store the existing counts
      this.existingImageCount = imageCount;
      this.existingVideoSizeMB = totalVideoSizeMB;
      this.showFileCount = this.existingImageCount;
      this.showVideoCount = this.videoCount;
      this.showVideoFileMB = Math.round((this.existingVideoSizeMB) * 100) / 100;

      // sahib added on 05_08_2025 
      let stats = this.activityMediaStats[type];
      stats.imageCount = imageCount;
      stats.videoCount = this.videoCount;
      stats.videoSizeMB = totalVideoSizeMB;

    }
  }


  getActivityTypebyId(id: number): string {
    const type = id == 1 ? "Nap"
      : id == 2 ? "Food"
        : id == 3 ? "Note"
          : id == 4 ? "Health"
            : id == 5 ? "Incident"
              : id == 6 ? "Meds"
                : id == 7 ? "Reminder"
                  : "uploadMedia";
    return type;
  }


  // 🟢 Main handler
  fileChangeHandler() {
    const type = this.imageTypeFileForCrop;
    const files: Blob[] = this.imageFileBlob;

    if (this.videoFiles.length > 0) {
      files.push(...this.videoFiles);
    }

    if (!this.urlMap[type]) this.urlMap[type] = [];

    let imageCount = this.urlMap[type].filter((url: any) => !url.includes('data:video')).length || 0;
    let videoCount = this.urlMap[type].filter((url: any) => url.includes('data:video')).length || 0;

    let currentImageCount = this.isEditModeOn ? (this.existingImageCount || 0) : 0;
    let currentVideoSizeMB = this.isEditModeOn ? (this.existingVideoSizeMB || 0) : 0;
    let currentVideoCount = this.isEditModeOn ? (this.showVideoCount || 0) : 0;
    let totalVideoSizeMB = 0;
    const existingVideoFiles = this.fileList.filter(
      (f: any) => f.type === type && this.allowedVideoTypes.includes(f.files.type)
    );

    for (const f of existingVideoFiles) {
      totalVideoSizeMB += f.files.size / (1024 * 1024);
    }

    const newFilesToProcess = [];

    for (let index = 0; index < files.length; index++) {
      const item = files[index];
      const fileType = item.type;
      const fileSizeMB = item.size / (1024 * 1024);
      const isImage = this.allowedImageTypes.includes(fileType);
      const isVideo = this.allowedVideoTypes.includes(fileType);

      const stats = this.activityMediaStats[type];

      if (isImage) {
        const totalImages = currentImageCount + imageCount;
        if (totalImages >= this.maxImageCount) {
          Swal.fire({
            icon: 'warning',
            title: 'Image Limit Reached',
            text: `Max ${this.maxImageCount} images. Already uploaded: ${totalImages}.`,
          });
          continue;
        }
        imageCount++;
      } else if (isVideo) {
        const combinedSize = currentVideoSizeMB + totalVideoSizeMB + fileSizeMB;
        if (combinedSize > this.maxTotalVideoSizeMB) {
          Swal.fire({
            icon: 'warning',
            title: 'Video Size Limit Exceeded',
            text: `Total video size must be under ${this.maxTotalVideoSizeMB} MB. Current: ${(currentVideoSizeMB + totalVideoSizeMB).toFixed(2)} MB`,
          });
          continue;
        }
        totalVideoSizeMB += fileSizeMB;
        videoCount++;
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Unsupported File',
          text: 'Only image and video files are allowed.',
        });
        continue;
      }

      newFilesToProcess.push(item);
    }

    for (const item of newFilesToProcess) {
      this.fileList.push({ files: item, type: type });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.urlMap[type].push(e.target.result);
      };
      reader.readAsDataURL(item);
    }

    this.resetModalAndFileCount(
      currentImageCount + imageCount, +(currentVideoSizeMB + totalVideoSizeMB).toFixed(2),
      currentVideoCount + videoCount,
      type
    );
  }

  resetModalAndFileCount(totalImageCount: number, totalVideoSizeMB: number, videoCount: number, type: string) {
    $('#cropperModalForSingleImage').modal('hide');
    $('#cropperModal').modal('hide');
    this.imageFileBlob = [];

    const stats = this.activityMediaStats[type];
    stats.imageCount = totalImageCount;
    stats.videoCount = videoCount;
    stats.videoSizeMB = totalVideoSizeMB;

    this.activityFileCounter[type] = totalImageCount + videoCount;
    $('#' + type + 'FileElement').val('');
  }





  async UploadFiles(data: any): Promise<any> {

    try {
      const response = await this.commonService.uploadImages(data).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  // getting the day care working days and timings
  getDaycareWorkTimingByCentreID() {
    this.classroomDetailsService
      .getCentreWorkingDaysByCentreID(this.CenterID)
      .subscribe((item: any) => {
        if (item.message == 'Success') {
          let keys = Object.keys(item.result);
          keys.forEach((element: any) => {
            this.workTiming[element] = item.result[element];
          });
        }
      });
  }

  editStudentActivity: any;

  getStudentActivityByActivityID(activityID: any) {
    this.skeletonShow = 'Skelton';
    this.classroomDetailsService.getStudentActivityByActivityID(activityID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.activity = response.result.activity;
          this.editStudentActivity = response.result.activityImages;

          this.activity.imageUrl = [];
          this.activity.imageEdit = [];

          for (const image of response.result.activityImages || []) {
            const rawUrl = image?.base64Image;

            try {

              if (typeof rawUrl === 'string' && (rawUrl.startsWith('data:image') || rawUrl.startsWith('data:video'))) {
                const fileStartWith = rawUrl.startsWith('data:image') ? 'data:image' : 'data:video';

                this.activity.imageUrl.push(rawUrl); // use base64 directly, no Blob

                this.activity.imageEdit.push({
                  documentPath: image.documentPath,
                  documentImage: image.documentImage,
                  imageID: image.id,
                  imageUrl: image.imageUrl,
                  fileSize: image.fileSizeMB,
                  fileStartWith: fileStartWith
                });

                const masterActivityId = this.activity.activityId;

                const type = this.getActivityTypebyId(masterActivityId);

                this.isEditMode(type);
                this.isEditModeOn = true;

              } else {
                console.warn('Skipping invalid base64:', rawUrl);
              }
            } catch (err) {
              console.error('Error handling base64 image:', rawUrl, err);
            }
          }

          this.patchActivityForm(this.activity);
          this.skeletonShow = '';
        } else {
          this.errorMessage = response.message;
          this.skeletonShow = '';
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch data: ' + err.message;
        this.skeletonShow = '';
      }
    });
  }

  base64ToBlob(base64String: string, mime = 'image/jpeg'): Blob {
    const byteCharacters = atob(base64String);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mime });
  }

  // time

  changeTime(event: any, type: any) {

    const timeValue = event.target.value;
    if (type == 'StartTime') {
      if (this.NapTimeForm.get('napDate')?.value) {
        if (
          `${timeValue}:00` >= this.currentDayTiming.startTime &&
          `${timeValue}:00` <= this.currentDayTiming.endTime
        ) {
          this.napStart = `${timeValue}:00`;
          this.napStart = `${timeValue}:00`;
        } else {
          this.currentDayTiming = {};
          this.NapTimeForm.reset();
          this.resetAllActivityForms();
          this.toastr.warning('Day care timing does not exists!');
        }
      } else {
        this.currentDayTiming = {};
        this.NapTimeForm.reset();
        this.resetAllActivityForms();
        this.toastr.warning('Please select Date first !');
      }
    }
    if (type == 'EndTime') {
      if (this.NapTimeForm.get('napDate')?.value) {
        if (
          `${timeValue}:00` >= this.currentDayTiming.startTime &&
          `${timeValue}:00` <= this.currentDayTiming.endTime
        ) {
          this.napEndTime = `${timeValue}:00`;
          this.napEndTime = `${timeValue}:00`;
        } else {
          this.currentDayTiming = {};
          this.NapTimeForm.reset();
          this.resetAllActivityForms();
          this.toastr.warning('Day care timing does not exists!');
        }
      } else {
        this.currentDayTiming = {};
        this.NapTimeForm.reset();
        this.resetAllActivityForms();
        this.toastr.warning('Please select Date first !');
      }
    }
    if (type == 'FoodTime') {
      if (this.FoodForm.get('foodServingDate')?.value) {
        if (
          `${timeValue}:00` >= this.currentDayTiming.startTime &&
          `${timeValue}:00` <= this.currentDayTiming.endTime
        ) {
          this.foodServingTime = `${timeValue}:00`;
        } else {
          this.currentDayTiming = {};
          this.FoodForm.reset();
          this.resetAllActivityForms();
          this.toastr.warning('Day care timing does not exists!');
        }
      } else {
        this.currentDayTiming = {};
        this.FoodForm.reset();
        this.resetAllActivityForms();
        this.toastr.warning('Please select Date first !');
      }
    }
    if (type == 'NoteTime') {
      if (this.NoteForm.get('noteDate')?.value) {
        if (
          `${timeValue}:00` >= this.currentDayTiming.startTime &&
          `${timeValue}:00` <= this.currentDayTiming.endTime
        ) {
          this.noteTime = `${timeValue}:00`;
        } else {
          this.currentDayTiming = {};
          this.NoteForm.reset();
          this.resetAllActivityForms();
          this.toastr.warning('Day care timing does not exists!');
        }
      } else {
        this.currentDayTiming = {};
        this.NoteForm.reset();
        this.resetAllActivityForms();
        this.toastr.warning('Please select Date first !');
      }
    }
    if (type == 'HealthTime') {
      if (this.HealthForm.get('healthDate')?.value) {
        if (
          `${timeValue}:00` >= this.currentDayTiming.startTime &&
          `${timeValue}:00` <= this.currentDayTiming.endTime
        ) {
          this.healthTime = `${timeValue}:00`;
        } else {
          this.currentDayTiming = {};
          this.resetAllActivityForms();
          this.HealthForm.reset();
          this.toastr.warning('Day care timing does not exists!');
        }
      } else {
        this.currentDayTiming = {};
        this.HealthForm.reset();
        this.resetAllActivityForms();
        this.toastr.warning('Please select Date first !');
      }
    }
    if (type == 'IncidentTime') {
      if (this.IncidentForm.get('incidentDate')?.value) {
        if (
          `${timeValue}:00` >= this.currentDayTiming.startTime &&
          `${timeValue}:00` <= this.currentDayTiming.endTime
        ) {
          this.incidentTime = `${timeValue}:00`;
        } else {
          this.currentDayTiming = {};
          this.resetAllActivityForms();
          this.IncidentForm.reset();
          this.toastr.warning('Day care timing does not exists!');
        }
      } else {
        this.currentDayTiming = {};
        this.resetAllActivityForms();
        this.IncidentForm.reset();
        this.toastr.warning('Please select Date first !');
      }
    }

    if (type == 'MedsTime') {
      if (this.MedicineForm.get('medsDate')?.value) {
        if (
          `${timeValue}:00` >= this.currentDayTiming.startTime &&
          `${timeValue}:00` <= this.currentDayTiming.endTime
        ) {
          this.medsTime = `${timeValue}:00`;
        } else {
          this.currentDayTiming = {};
          this.resetAllActivityForms();
          this.MedicineForm.reset();
          this.toastr.warning('Day care timing does not exists!');
        }
      } else {
        this.resetAllActivityForms();
        this.currentDayTiming = {};
        this.MedicineForm.reset();
        this.toastr.warning('Please select Date first !');
      }
    }

    if (type == 'ReminderTime') {
      if (this.ReminderForm.get('reminderDate')?.value) {
        if (
          `${timeValue}:00` >= this.currentDayTiming.startTime &&
          `${timeValue}:00` <= this.currentDayTiming.endTime
        ) {
          this.reminderTime = `${timeValue}:00`;
        } else {
          this.currentDayTiming = {};
          this.resetAllActivityForms();
          this.ReminderForm.reset();
          this.toastr.warning('Day care timing does not exists!');
        }
      } else {
        this.currentDayTiming = {};
        this.ReminderForm.reset();
        this.resetAllActivityForms();
        this.toastr.warning('Please select Date first !');
      }
    }
  }



  async studentGalleryDelete(data: any, image: any): Promise<void> {
    try {

      this.spinner.show();

      const imageData = {
        id: image.imageID,
        filePath: image.documentPath,
        folderName: image.documentImage,
      };

      this.classroomDetailsService
        .studentActivityImageDelete(imageData)
        .subscribe(
          (response: any) => {
            if (response?.message === 'Success') {
              this.toastr.success(
                'Gallery item deleted successfully!',
                'Success'
              );
              // this.gallery = this.gallery.filter((item: any) => item.id !== data.id);
              this.spinner.hide();


            } else {
              this.toastr.warning(
                response?.message || 'Delete failed',
                'Warning'
              );
            }
          },
          (error: any) => {
            this.toastr.error(
              'An error occurred while deleting the gallery item.',
              'Error'
            );
            console.error('Error:', error);
          }
        );
    } catch (error) {
      this.toastr.error('Unexpected error occurred.', 'Error');
      console.error('Unexpected error:', error);
    }
  }

  // activity add and update

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

  async handleStudentActivitySubmit(
    form: FormGroup,
    activityType: any,
    imageUrlsArray: string[],
    fileInputRef: ElementRef,
    extraFields?: any
  ): Promise<void> {

    if (!form.valid) {
      form.markAllAsTouched();
      return;
    }

    if (this.activityID) {
      this.SelectedStudentId = [1];
    }

    if (this.SelectedStudentId.length == 0) {
      this.toastr.warning('Please select a student before proceeding.');
      return;
    }

    this.spinner.show();

    form.patchValue({ studentID: this.SelectedStudentId });

    // Patch specific fields based on activityType
    switch (activityType) {
      case 'NapTime':
        form.patchValue({
          napStartTime: this.napStart,
          napEndTime: this.napEndTime,
          createdBy: this.teacherID,
        });
        break;
      case 'Food':
        form.patchValue({ foodServingTime: this.foodServingTime });
        break;
      case 'Note':
        form.patchValue({ noteTime: this.noteTime });
        break;
      case 'Health':
        form.patchValue({ healthTime: this.healthTime });
        break;
      case 'Incident':
        form.patchValue({ incidentTime: this.incidentTime });
        break;
      case 'Medicine':
        form.patchValue({ medsTime: this.medsTime });
        break;
      case 'Reminder':
        form.patchValue({ reminderTime: this.reminderTime });
        break;
    }

    try {
      const uploadedImages: string[] = [];


      this.fileList.forEach((item: any) => {
        this.formData.append('files', item.files);
        this.formData.append('type', item.type);
      });
      const fileResponse = await this.UploadFiles(this.formData);

      if (fileResponse?.message === 'OK') {
        uploadedImages.push(
          ...fileResponse.result.map((f: any) => f.imageName)
        );
        form.patchValue({ images: uploadedImages });
        this.formData = new FormData();
      }

      const dateFieldMap: any = {
        NapTime: form.value.napDate,
        Food: form.value.foodServingDate,
        Note: form.value.noteDate,
        Health: form.value.healthDate,
        Incident: form.value.incidentDate,
        Medicine: form.value.medsDate,
        Reminder: form.value.reminderDate,
        uploadMedia: form.value.uploadMediaDate,
      };

      const timeMap: any = {
        NapTime: {
          start: this.napStart ?? this.activity?.startTime,
          end: this.napEndTime ?? this.activity?.endTime,
        },
        Food: { start: this.foodServingTime, end: this.foodServingTime },
        Note: { start: this.noteTime, end: this.noteTime },
        Health: { start: this.healthTime, end: this.healthTime },
        Incident: { start: this.incidentTime, end: this.incidentTime },
        Medicine: { start: this.medsTime, end: this.medsTime },
        Reminder: { start: this.reminderTime, end: this.reminderTime },
        uploadMedia: { start: null, end: null },
      };

      const activityLabelMap: any = {
        NapTime: 'Added Nap Time',
        Food: 'Added Food',
        Note: 'Added Note',
        Health: 'Added Health',
        Incident: 'Added Incident',
        Medicine: 'Added Medicine',
        Reminder: 'Added Reminder',
        UploadMedia: 'Added UploadMedia',
      };

      // const date = new Date(dateFieldMap[activityType]);

      const activityDate = this.datePipe.transform(
        dateFieldMap[activityType],
        'yyyy-MM-dd'
      );

      const studentActivityBO: any = {
        studentID: this.SelectedStudentId ?? [this.activity?.studentID],
        teacherID: this.teacherID ?? this.activity?.teacherID,
        activity: activityLabelMap[activityType],
        startTime: timeMap[activityType].start ?? this.activity?.startTime,
        endTime: timeMap[activityType].end ?? this.activity?.endTime,
        masterActivityID:
          this.AcceptedMasterActivityID ?? this.activity?.activityId,
        images: fileResponse?.result ?? [],
        date: activityDate || this.activity?.activityDate,
        note: form.value.note ?? this.activity?.note,
        // foodTypeID: parseInt(form.value.foodTypeID) || null,
        mealTypeID: parseInt(form.value.mealTypeID) || null,
        mealItem: form.value.mealItem || null,
        mealCompletion: form.value.mealCompletion || null,
        ...extraFields,
      };

      if (this.activity?.id) {
        studentActivityBO.id = this.activity.id;
        // studentActivityBO.images =
      }

      this.classroomDetailsService
        .manageStudentActivity(studentActivityBO)
        .subscribe(
          (data) => {
            this.spinner.hide();
            if (data.message === 'Success') {
              form.reset();
              this.fileList = [];
              this.showFileCount = 0;
              this.activityFileCounter = {};
              this.urlMap = {};
              imageUrlsArray.length = 0;
              fileInputRef.nativeElement.value = '';
              this.SelectedStudentId = [];
              this.selectAll = false;
              this.StudentList.forEach((student) => (student.selected = false));
              this.toastr.success(`${activityType} saved successfully`);
              $('#addingStudentActivityModal').modal('hide');
            } else if (data.message === 'Update') {
              this.fileList = [];
              this.toastr.success(`${activityType} Update successfully`);
              const secretKey = 'encrypt001100!?';
              const encryptedID = CryptoJS.AES.encrypt(
                this.activity?.studentID.toString(),
                secretKey
              ).toString();

              this.router.navigate(['/view-student-detail'], {
                queryParams: { ID: encryptedID, TYPE: 'detail' },
              });
              this.spinner.hide();
            } else {
              // this.toastr.error('Unexpected error occurred');
              this.toastr.warning(data.message);
            }
          },
          () => {
            this.spinner.hide();
            this.toastr.error(`Error while saving ${activityType}`);
          }
        );
    } catch (error) {
      console.error('File upload error:', error);
      this.toastr.error('Error occurred during file upload.');
      this.spinner.hide();
    }
  }

  async NapTimeSubmit(): Promise<void> {

    await this.handleStudentActivitySubmit(
      this.NapTimeForm,
      'NapTime',
      this.napUrls,
      this.napfileInput,
      {
        napEndTime: this.napEndTime,
        createdBy: this.teacherID,
      }
    );
  }

  async foodSubmit(): Promise<void> {

    await this.handleStudentActivitySubmit(
      this.FoodForm,
      'Food',
      this.foodUrls,
      this.foodFileInput
    );
  }

  async noteSubmit(): Promise<void> {

    await this.handleStudentActivitySubmit(
      this.NoteForm,
      'Note',
      this.noteUrls,
      this.noteFileInput
    );
  }

  async uploadMediaSubmit(): Promise<void> {

    await this.handleStudentActivitySubmit(
      this.uploadMediaForm,
      'uploadMedia',
      this.uploadMediaUrls,
      this.upladMediaFileInput
    );
  }

  async healthSubmit(): Promise<void> {

    await this.handleStudentActivitySubmit(
      this.HealthForm,
      'Health',
      this.healthUrls,
      this.healthFileInput,
      {
        bodyTemperature: this.HealthForm.value.bodyTemperature,
      }
    );
  }

  async IncidentSubmit(): Promise<void> {

    await this.handleStudentActivitySubmit(
      this.IncidentForm,
      'Incident',
      this.incidentUrls,
      this.incidentFileInput,
      {
        incidentType: this.IncidentForm.value.incidentType,
        incidentLocation: this.IncidentForm.value.incidentLocation,
      }
    );
  }

  async MedicineSubmit(): Promise<void> {

    await this.handleStudentActivitySubmit(
      this.MedicineForm,
      'Medicine',
      this.medsUrls,
      this.medsFileInput,
      {
        medicineName: this.MedicineForm.value.medicineName,
        dosage: this.MedicineForm.value.dosage,
      }
    );
  }

  async ReminderSubmit(): Promise<void> {

    await this.handleStudentActivitySubmit(
      this.ReminderForm,
      'Reminder',
      this.reminderUrls,
      this.reminderFileInput,
      {
        reminderTitle: this.ReminderForm.value.reminderTitle,
      }
    );
  }

  resetAllActivityForms() {
    this.NapTimeForm.reset();
    this.NoteForm.reset();
    this.FoodForm.reset();
    this.IncidentForm.reset();
    this.HealthForm.reset();
    this.MedicineForm.reset();
    this.ReminderForm.reset();
    this.uploadMediaForm.reset();
    this.SelectedStudentId = [];
    this.uploadMediaUrls = [];
    this.napUrls = [];
    this.noteUrls = [];
    this.foodUrls = [];
    this.incidentUrls = [];
    this.healthUrls = [];
    this.medsUrls = [];
    this.reminderUrls = [];
    this.fileList = [];
    this.formData = new FormData();

    if (this.napfileInput) this.napfileInput.nativeElement.value = '';
    if (this.foodFileInput) this.foodFileInput.nativeElement.value = '';
    if (this.noteFileInput) this.noteFileInput.nativeElement.value = '';
    if (this.healthFileInput) this.healthFileInput.nativeElement.value = '';
    if (this.incidentFileInput) this.incidentFileInput.nativeElement.value = '';
    if (this.medsFileInput) this.medsFileInput.nativeElement.value = '';
    if (this.reminderFileInput) this.reminderFileInput.nativeElement.value = '';
    if (this.upladMediaFileInput)
      this.upladMediaFileInput.nativeElement.value = '';
  }

  getFileSizeFromDataUrl(fileUrl: string): number {
    const base64String = fileUrl.split(',')[1];
    const padding = (base64String.match(/=*$/) || [''])[0].length;
    const bytes = (base64String.length * 3) / 4 - padding;
    const megabytes = bytes / (1024 * 1024);
    return parseFloat(megabytes.toFixed(2));
  }

  // deleteImage(type: string, index: number, fileUrl: string): void {
  //   let fileInput: any;



  //   switch (type) {

  //     case 'Nap':
  //       fileInput = this.napfileInput;
  //       this.showFileCount--
  //       this.showFileCount = this.showFileCount;
  //       this.activityFileCounter[type] = this.showFileCount;
  //       if (fileUrl.startsWith('data:video')) {
  //         this.extractedSizeOfDeletedVideo += this.getFileSizeFromDataUrl(fileUrl);
  //         // this.newTotalSize = this.newTotalSize - this.fileSizeMB

  //       }
  //       break;
  //     case 'Food':
  //       fileInput = this.foodFileInput;
  //       this.showFileCount--
  //       this.showFileCount = this.showFileCount;
  //       this.activityFileCounter[type] = this.showFileCount;
  //       if (fileUrl.startsWith('data:video')) {
  //         this.extractedSizeOfDeletedVideo += this.getFileSizeFromDataUrl(fileUrl);
  //       }
  //       break;
  //     case 'Note':
  //       fileInput = this.noteFileInput;
  //       this.showFileCount--
  //       this.showFileCount = this.showFileCount;
  //       this.activityFileCounter[type] = this.showFileCount;
  //       if (fileUrl.startsWith('data:video')) {
  //         this.extractedSizeOfDeletedVideo += this.getFileSizeFromDataUrl(fileUrl);
  //       }
  //       break;
  //     case 'Health':
  //       fileInput = this.healthFileInput;
  //       this.showFileCount--
  //       this.showFileCount = this.showFileCount;
  //       this.activityFileCounter[type] = this.showFileCount;
  //       if (fileUrl.startsWith('data:video')) {
  //         this.extractedSizeOfDeletedVideo += this.getFileSizeFromDataUrl(fileUrl);
  //       }
  //       break;
  //     case 'Incident':
  //       fileInput = this.incidentFileInput;
  //       this.showFileCount--
  //       this.showFileCount = this.showFileCount;
  //       this.activityFileCounter[type] = this.showFileCount;
  //       if (fileUrl.startsWith('data:video')) {
  //         this.extractedSizeOfDeletedVideo += this.getFileSizeFromDataUrl(fileUrl);
  //       }
  //       break;
  //     case 'Meds':
  //       fileInput = this.medsFileInput;
  //       this.showFileCount--
  //       this.showFileCount = this.showFileCount;
  //       this.activityFileCounter[type] = this.showFileCount;
  //       if (fileUrl.startsWith('data:video')) {
  //         this.extractedSizeOfDeletedVideo += this.getFileSizeFromDataUrl(fileUrl);
  //       }
  //       break;

  //     case 'Reminder':
  //       fileInput = this.reminderFileInput;
  //       this.showFileCount--
  //       this.showFileCount = this.showFileCount;
  //       this.activityFileCounter[type] = this.showFileCount;
  //       if (fileUrl.startsWith('data:video')) {
  //         this.extractedSizeOfDeletedVideo += this.getFileSizeFromDataUrl(fileUrl);
  //       }
  //       break;

  //     case 'uploadMedia':
  //       fileInput = this.upladMediaFileInput;
  //       this.showFileCount--
  //       this.showFileCount = this.showFileCount;
  //       this.activityFileCounter[type] = this.showFileCount;
  //       if (fileUrl.startsWith('data:video')) {
  //         this.extractedSizeOfDeletedVideo += this.getFileSizeFromDataUrl(fileUrl);
  //       }
  //       break;

  //     default:
  //       return;
  //   }

  //   this.urlMap[type].splice(index, 1);
  //   this.fileList.splice(index, 1);
  //   if (this.fileList.length == 0) {
  //     this.resetAllActivityUrl(type);
  //   }
  //   fileInput.nativeElement.value = '';
  //   const imageOrVideo = fileUrl.startsWith('data:video') ? 'Video' : 'Image';
  //   this.toastr.success(`${imageOrVideo} deleted successfully.`);
  // }


  getFileSizeMBFromUrl(fileUrl: string): number {
    if (fileUrl.startsWith('data:video')) {
      return this.getFileSizeFromDataUrl(fileUrl); // base64 video
    } else if (fileUrl.startsWith('http')) {
      // try to get stored file size from your map if available
      const match = this.videoSizeMap?.find((v: { url: string; }) => v.url === fileUrl);
      if (match) {
        return match.sizeMB;
      } else {
        return 0;
      }
    }
    return 0;
  }


  deleteFile(galleryID: number, fileUrl: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.galleryID = galleryID;
        this.filePath = fileUrl;

        try {
          const data: any = await this.studentGalleryDelete(this.galleryID, this.filePath);


          // ✅ Determine file type
          const isVideo = this.filePath.documentImage.startsWith('data:video') || this.filePath.documentImage.includes('.mp4') || this.filePath.documentImage.includes('.webm');
          const stats = this.activityMediaStats[this.filePath.documentPath];
          if (stats) {
            if (isVideo) {

              stats.videoSizeMB = Math.max(0, Math.round((stats.videoSizeMB - fileUrl.fileSize) * 100) / 100);
              stats.videoCount = Math.max(0, stats.videoCount - 1);
            } else {
              stats.imageCount = Math.max(0, stats.imageCount - 1);
              this.totalImageCount = Math.max(0, this.totalImageCount - 1);
              this.activityFileCounter[this.filePath.documentPath] = stats.imageCount;
            }
          }
          this.getStudentActivityByActivityID(this.activityID)

          if (data === 'Sucess') {

            // ✅ Success toast
            const fileType = isVideo ? 'Video' : 'Image';
            this.toastr.success(`${fileType} deleted successfully.`);
            Swal.fire('Deleted!', `${fileType} has been deleted.`, 'success');

            // Optionally remove file from array (UI sync)
            const fileArray = this.urlMap[this.filePath.documentPath];
            const index = fileArray.indexOf(this.filePath.documentImage);
            if (index !== -1) {
              fileArray.splice(index, 1);
            }


          }


        } catch (error) {
          Swal.fire('Error!', 'An unexpected error occurred while deleting the file.', 'error');
        }
      }
    });
  }


  deleteImage(type: string, index: number, fileUrl: string): void {
    const inputMap: { [key: string]: ElementRef } = {
      Nap: this.napfileInput,
      Food: this.foodFileInput,
      Note: this.noteFileInput,
      Health: this.healthFileInput,
      Incident: this.incidentFileInput,
      Meds: this.medsFileInput,
      Reminder: this.reminderFileInput,
      uploadMedia: this.upladMediaFileInput
    };

    const fileInput = inputMap[type];
    if (!fileInput) return;

    const stats = this.activityMediaStats[type];
    if (!stats) return;

    const isVideo = fileUrl.startsWith('data:video') || fileUrl.includes('.mp4') || fileUrl.includes('.webm');

    if (isVideo) {
      const deletedSizeMB = this.getFileSizeMBFromUrl(fileUrl);
      stats.videoSizeMB = Math.max(0, Math.round((stats.videoSizeMB - deletedSizeMB) * 100) / 100);
      stats.videoCount = Math.max(0, stats.videoCount - 1);
    } else {
      stats.imageCount = Math.max(0, stats.imageCount - 1);
      this.totalImageCount = Math.max(0, this.totalImageCount - 1);
      this.activityFileCounter[type] = stats.imageCount;
    }

    // Remove file from lists
    if (this.urlMap[type]) this.urlMap[type].splice(index, 1);
    if (this.fileList.length > index) this.fileList.splice(index, 1);

    // If no files left for the type, reset
    if (!this.urlMap[type] || this.urlMap[type].length === 0) {
      this.resetAllActivityUrl(type);
    }

    fileInput.nativeElement.value = '';

    const fileType = isVideo ? 'Video' : 'Image';
    this.toastr.success(`${fileType} deleted successfully.`);
  }


  resetAllActivityUrl(type: string) {
    this.napUrls = [];
    this.noteUrls = [];
    this.foodUrls = [];
    this.incidentUrls = [];
    this.healthUrls = [];
    this.medsUrls = [];
    this.reminderUrls = [];
    this.fileList = [];
    this.uploadMediaUrls = [];
    this.formData = new FormData();
    this.showFileCount = 0;
    this.activityFileCounter[type] = 0;
    this.urlMap[type] = [];

    if (this.napfileInput) this.napfileInput.nativeElement.value = '';
    if (this.foodFileInput) this.foodFileInput.nativeElement.value = '';
    if (this.noteFileInput) this.noteFileInput.nativeElement.value = '';
    if (this.healthFileInput) this.healthFileInput.nativeElement.value = '';
    if (this.incidentFileInput) this.incidentFileInput.nativeElement.value = '';
    if (this.medsFileInput) this.medsFileInput.nativeElement.value = '';
    if (this.reminderFileInput) this.reminderFileInput.nativeElement.value = '';
    if (this.upladMediaFileInput) this.upladMediaFileInput.nativeElement.value = '';
  }



  // noteDeleteImage(index:number){
  //   if(index >=0 && index < this.noteUrls.length){
  //     this.noteUrls.splice(index, 1);
  //     this.toastr.success('Image deleted sucessfully')

  //     this.noteFileInput.nativeElement.value = '';
  //   }
  // }

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

  convertMonthsToYears(months: number): number {
    if (months < 0) {
      throw new Error('Invalid input: months cannot be negative.');
    }
    return Math.floor(months / 12);
  }

  convertYearsToMonths(years: number): number {
    if (years < 0) {
      throw new Error('Invalid input: years cannot be negative.');
    }
    return years * 12;
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
    this.StudentList = [];
    if (this.name == undefined) {
      this.name = '';
    }

    this.skeletonShow = 'Skelton'

    try {
      const response: any = await firstValueFrom(this.classroomDetailsService.getStudentByClassID(this.centreID, this.classId, this.name));

      if (response.message === 'Success') {
        this.StudentList = response.result;
        this.StudentList = this.StudentList.map((item: any) => {
          if (item.ageGroup) {
            const [minMonthStr, maxMonthStr] = item.ageGroup
              .split('-')
              .map((val: string) => val.trim());
            const minMonth = parseInt(minMonthStr);
            const maxMonth = parseInt(maxMonthStr);
            const minYear = this.convertMonthsToYears(minMonth);
            const maxYear = this.convertMonthsToYears(maxMonth);

            return {
              ...item,
              label: `${minMonth} - ${maxMonth} Months ( ${minYear} - ${maxYear} Years )`,
            };
          } else {
            const minMonth = this.convertYearsToMonths(item.minAge);
            const maxMonth = this.convertYearsToMonths(item.maxAge);
            const minYear = this.convertMonthsToYears(minMonth);
            const maxYear = this.convertMonthsToYears(maxMonth);

            return {
              ...item,
              label: `${minMonth} - ${maxMonth} Months ( ${minYear} - ${maxYear} Years )`,
            };
          }
        });

        this.StudentList.forEach((student) => {
          student.imageUrl = [];

          const rawUrl = student?.profileImage;

          try {
            if (typeof rawUrl === 'string' && rawUrl.startsWith('data:image')) {
              const [header, data] = rawUrl.split(',');
              const mimeMatch = header.match(/data:(.*);base64/);
              const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

              const blob = this.base64ToBlob(data, mimeType);
              const objectUrl = URL.createObjectURL(blob);

              student.imageUrl.push(objectUrl);
            } else {
              console.warn('Skipping invalid or non-base64 image:', rawUrl);
            }
          } catch (err) {
            console.error('Error converting base64 to Blob:', rawUrl, err);
          }
        });

        this.skeletonShow = '';
      } else {
        this.skeletonShow = '';
      }
    } catch (error) {
      console.error('Error fetching student list:', error);
      this.skeletonShow = '';

    }
  }

  selectClassRoom(id: any) {
    this.SelectedStudentId = id;
    const secretKey = 'encrypt001100!?';
    const encryptedID = CryptoJS.AES.encrypt(
      this.SelectedStudentId.toString(),
      secretKey
    ).toString();

    this.router.navigate(['/view-student-detail'], {
      queryParams: { ID: encryptedID, TYPE: 'detail' },
    });
  }

  async getClassRoom(): Promise<void> {
    // this.spinner.show();
    try {
      const response: any = await firstValueFrom(
        this.classroomDetailsService.getClassRoom(
          this.centreID,
          this.teacherID,
          this.UserRoleId
        )
      );

      if (response.message === 'OK') {
        this.classRoom = response.result;
        // Auto-select if there's only one classroom
        if (this.classRoom.length === 1) {
          const firstClassroom = this.classRoom[0];
          this.ClassAndSectionForm.get('classroomID')?.setValue(
            firstClassroom.classroomID
          );
          this.onSelectClass(firstClassroom);



        }

        if (this.classRoom.length === 0) {
          this.skeletonShow = '';

        }
      } else {
        this.skeletonShow = '';

      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      this.skeletonShow = '';
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

  isDisable(): boolean {
    return this.SelectedStudentId.length > 0 ? false : true;
  }
}
