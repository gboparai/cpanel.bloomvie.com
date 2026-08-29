import {
  AfterViewInit,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ProfileService } from './profile.service';
import { CookieService } from 'ngx-cookie-service';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { UserRoleService } from '../../settings/Permission/user-role/user-role.service';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
import * as CryptoJS from 'crypto-js';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ManageStudentActivitiesComponent } from '../../day-care-management/classroom-management/manage-student-activities/manage-student-activities.component';
import { HeaderComponent } from '../../layout/header/header.component';
import * as fs from 'fs';
import { HttpClient } from '@microsoft/signalr';
import { firstValueFrom, throwIfEmpty } from 'rxjs';
import { TOCRegistrationComponent } from '../../toc-registration/toc-registration.component';
import { TocViewService } from '../../toc-view/toc-view.service';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HeaderServiceService } from '../../layout/header/header-service.service';
import { ChildParentService } from '../../parent-management/parent-onboarding/child-parent-details/child-parent.service';
import { CommonService } from '../common.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { DayCareDashboardService } from '../../day-care-management/daycare-dashboard/day-care-dashboard.service';

declare var $: any;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule,
    FlatpickrModule,
    NgSelectModule,
    RouterLink,
    RouterModule,
    ManageStudentActivitiesComponent,
    HeaderComponent,
    TOCRegistrationComponent,
    SkeletonLoaderComponent,
    ImageCropperComponent
  ],
  providers: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements AfterViewInit {
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  readonly rootUrl = environment.apiUrl.slice(0, -3);

  profileImage: any;
  UserId: any;
  profile: any;
  role: any;
  userRoleID: any;
  profileform: any;
  profilevalue: any;
  genderOptions = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Other', value: 'O' },
  ];
  pinCode: any;
  countryID: any;
  stateID: any;
  cityID: any;
  imageForm: any;
  getId: any;
  data: any;
  filteredDocuments: any;
  getIdList: any;
  documentImage: any;
  header: any;
  name: any;
  firstName: any;
  middleName: any;
  lastName: any;
  plan: any[] = [];
  UserRoleID: any;
  email: any;
  password: any;
  mobile: any;
  address: any;
  logoImage: any;
  dob: any;
  gender: any;
  Images: any;
  SelectedStudentId: any;
  profileImageSelected: boolean = false;
  IsImageAvailable: boolean = false;
  profileUrl: string = '';
  ImageExists: boolean = false;
  studentID: number = 0;
  activeTab: string = 'Active';
  addonPlans: any[] = [];
  regularPlans: any[] = [];
  TocUserDetailSkelton: boolean = false;
  profileDetailSkelton: boolean = false;

  //Arsh
  TocUserDetail: any;
  QualificationList: any;
  documentTypeList: any;
  TOCModalRegistration: any;
  TOCRegistration: any;
  expertise: any[] = [];
  centreID: any;
  viewDetails: any[] = [];
  EducationalCredentails: string = '';
  DocumentResumes: string = '';
  UploadedDocument: string = '';
  CheckTOCUserDetail: any;
  // previewUrl: string | null = null;
  previewUrl: SafeResourceUrl | null = null;
  isModalVisible = false;
  isClosing = false;
  imageFullPaths: any;
  EducationalCredentailsBlob: Blob | null = null;
  DocumentResumesBlob: Blob | null = null;
  UploadedDocumentBlob: Blob | null = null;
  previewMime: string | null = null;
  TOCUserCentreList: any;
  skeletonShow = 'Skelton';
  planInfoskeletonShow = "PlanInfo";
  imageChangedEvent: any;
  croppedImageBlob: any;
  countries: any[] = [];
  selectedCountry: any;
  dropdownOpen = false;
  centreName: any;
  fileName: string = '';
  fileType: string = '';



  constructor(
    private cdr: ChangeDetectorRef,
    private profileService: ProfileService,
    private cookies: CookieService,
    private roleservice: UserRoleService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private applicationService: ApplicationsSettingsService,
    private route: Router,
    private tocservice: TocViewService,
    private commonService: CommonService,
    private tocregistrationService: TocRegistrationService,
    private spinner: NgxSpinnerService,
    private headerservice: HeaderServiceService,
    private ChildParentService: ChildParentService,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer,
    private DayCareDashBoard: DayCareDashboardService
  ) {
    this.profileform = fb.group({
      id: [0],
      firstName: [''],
      middleName: [''],
      lastName: [''],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9.*%±]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}'),
        ],
      ],
      dob: [new Date(), Validators.required],
      address: ['', Validators.required],
      gender: ['', Validators.required],
      mobile: [
        '',
        [Validators.required, Validators.pattern(/^\d{3} \d{3} \d{4}$/)],
      ],
      name: ['', Validators.required],
      userRoleID: [0],
      pinCode: [
        '', [Validators.pattern(/^[A-Z]\d[A-Z] \d[A-Z]\d$/)],],
      countryID: [0],
      stateID: [0],
      cityID: [0],
    });
    this.imageForm = fb.group({
      id: [0],
      referenceTableID: [0],
      documentTypeID: [0],
      referenceTableName: [''],
      documentImage: [''],
      documentImagePath: [''],
    });
    //sg(07-03-2025)
    effect(() => {
      this.headerservice.switchProfile();
      this.getProfileDetails();
      this.getPlansDetails(this.activeTab);
    });
  }

  //Commneted 05/02/25
  // ngOnInit() {
  //

  //   this.UserRoleID = parseInt(this.cookies.get('userRoleID'),10);

  //   if(Number.isNaN(this.UserRoleID)){
  //     this.UserRoleID = parseInt(this.cookies.get('UserRoleId'),10);
  //   }
  //   this.UserId = parseInt(this.cookies.get('UserId'),10);

  //   this.getProfileDetails();
  //   this.getMasterDocumentID();
  //   this.getPlanDetail();

  //   if(this.UserRoleID == 8){
  //    //Arsh
  //    this.getQualifications();
  //    this.getDocumentTypeList();
  //    this.getByIDForView(this.UserId);

  //    //Added on 28/01/25
  //    this.tocregistrationService.hideModal$.subscribe(() => {
  //     this.hidetocuserform(); // Call the method to hide the modal
  //     this.getQualifications();
  //     this.getDocumentTypeList();
  //     this.getByIDForView(this.UserId);
  //   });
  // }
  // }


  //Commented on 01/07/25
  // ngOnInit() {
  //   const roleFromCookie =
  //     this.cookies.get('userRoleID') || this.cookies.get('UserRoleId');
  //   this.UserRoleID = roleFromCookie ? parseInt(roleFromCookie, 10) : null;
  //   if (Number.isNaN(this.UserRoleID)) {
  //     this.UserRoleID = null;
  //   }

  //   this.UserId = parseInt(this.cookies.get('UserId'), 10) || null;

  //   this.centreID = parseInt(this.cookies.get('CentreID'));
  //   if (this.UserRoleID !== null) {
  //     this.getProfileDetails();

  //     this.getMasterDocumentID(this.UserId, 'profileImage');
  //     this.getPlansDetails('Active');
  //     if (this.UserRoleID === 8) {
  //       //this.getTOCUserCentreListById(this.UserId);
  //       this.getTOCUserDetailByEmail(this.UserId);
  //       this.getAllAreaOfExpertise();
  //       this.getQualifications();
  //       this.getDocumentTypeList();
  //       this.getByIDForView(this.UserId);
  //       this.tocregistrationService.hideModal$.subscribe(() => {
  //         this.hidetocuserform();
  //         this.getAllAreaOfExpertise();
  //         this.getQualifications();
  //         this.getDocumentTypeList();
  //         this.getByIDForView(this.UserId);
  //       });
  //     }
  //   }
  // }


  //Added on 01/07/25

  async ngOnInit() {
    this.countries = this.commonService.getCountriesFlag();
    this.selectedCountry = this.commonService.getDefaultCountryFlag(1);
    const roleFromCookie = this.cookies.get('userRoleID') || this.cookies.get('UserRoleId');
    this.UserRoleID = roleFromCookie ? parseInt(roleFromCookie, 10) : null;
    if (Number.isNaN(this.UserRoleID)) {
      this.UserRoleID = null;
    }

    this.UserId = parseInt(this.cookies.get('UserId'), 10) || null;

    this.centreID = parseInt(this.cookies.get('CentreID'));
    if (this.UserRoleID !== null) {
      if (this.UserRoleID === 8) {
        //this.getTOCUserCentreListById(this.UserId);
        this.getDayCareByID(this.centreID);
        this.getTOCUserDetailByEmail(this.UserId);
        this.getAllAreaOfExpertise();
        this.getQualifications();
        this.getDocumentTypeList();
        await this.getByIDForView(this.UserId);
        this.tocregistrationService.hideModal$.subscribe(async () => {
          this.hidetocuserform();
          this.getAllAreaOfExpertise();
          this.getQualifications();
          this.getDocumentTypeList();
          await this.getByIDForView(this.UserId);
        });
      }
      this.getProfileDetails();
      this.getMasterDocumentID(this.UserId, 'profileImage');
      this.getPlansDetails('Active');
    }
  }

  ngAfterViewInit(): void {
    if (this.headerComponent) {
      this.headerComponent.getProfileDetailsHeaderComponent();
    }
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    (document.getElementById('dob') as any).flatpickr({
      dateFormat: 'd-m-Y',
      maxDate: maxDate,
    });
  }

  getDayCareByID(DayCareId: any) {
    this.DayCareDashBoard.getDayCareByID(DayCareId).subscribe((data: any) => {
      if (data.message == 'Success') {
        this.centreName = data.result.centreName;

      }
    });
  }

  getTOCUserDetailByEmail(userid: any) {
    var centreId = this.centreID != null ? this.centreID : 0;
    this.tocregistrationService.getTOCUserDetailByID(userid, centreId).subscribe(
      (data) => {
        if (data.message === 'ok') {
          this.CheckTOCUserDetail = data.result;
          if (this.CheckTOCUserDetail.partTimeStartDate != null) {
            $('#AvailabilityModal').modal('hide');
          } else {
            $('#AvailabilityModal').modal('show');
          }
        } else {
          this.CheckTOCUserDetail = [];
        }
      },
      (error) => {
        console.error('Error occurred while checking email:', error);
      }
    );
  }

  getTOCUserCentreListById(userid: any) {
    this.profileService.getTOCUserCentreListById(userid).subscribe(
      (data) => {
        if (data.message === 'ok') {
          this.TOCUserCentreList = data.result.centreList;

        } else {
          this.TOCUserCentreList = [];
        }
      },
      (error) => {
        console.error('Error occurred while checking email:', error);
      }
    );
  }
  onCentreChange(centreID: any): void {
    this.cookies.set('CentreID', centreID.id.toString());
    $('#chooseDayCareCentre').modal('hide');
  }


  Redirection() {
    this.route.navigate(['/TOC-registration']);
    this.tocregistrationService.triggerSidebarRefresh();
    this.cookies.set('Component', 'Complete Profile');
    $('#AvailabilityModal').modal('hide');
  }

  CloseModal() {
    $('#AvailabilityModal').modal('hide');
  }

  getQualifications() {
    this.tocservice.getQualifications().subscribe((data) => {
      if (data.message === 'OK') {
        this.QualificationList = data.result;
      }
    });
  }

  getAllAreaOfExpertise() {
    this.tocregistrationService
      .getAllAreaOfExpertise()
      .subscribe((result: any) => {
        if (result.message == 'Success') {
          this.expertise = result.result.filter(
            (item: any) => item.isActive == true
          );
        }
      });
  }

  getDocumentTypeList() {
    this.tocservice.getDocumentTypeList().subscribe({
      next: (response) => {
        if (response.message === 'OK') {
          this.documentTypeList = response.result;
        }
        setTimeout(() => { }, 300);
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  // Commented on 23/06/25
  // ConvertS3File(fileName: any) {
  //   let response = this.base64ToBlob(fileName);
  //   const imageUrl = URL.createObjectURL(response);
  //   return imageUrl;
  // }

  // Commented on 23/06/25
  // base64ToBlob(base64: any, mime = 'image/jpeg') {
  //   const byteCharacters = atob(base64);
  //   const byteArrays = [];

  //   for (let offset = 0; offset < byteCharacters.length; offset += 512) {
  //     const slice = byteCharacters.slice(offset, offset + 512);
  //     const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
  //     byteArrays.push(new Uint8Array(byteNumbers));
  //   }

  //   return new Blob(byteArrays, { type: mime });
  // }

  // Commented on 23/06/25
  // getByIDForView(id: any) {
  //   this.TocUserDetail = []; // Reset the TocUserDetail before making the API call
  //   this.tocservice.getAppliedJobTOByID(id).subscribe(
  //     (data: any) => {
  //       if (data.message === 'ok' && data.result && data.result.length > 0) {
  //         this.TocUserDetail = data.result.map((item: any) => {
  //           this.EducationalCredentails = item.educational_Credentails
  //             ? this.ConvertS3File(item.educational_Credentails)
  //             : '';

  //           this.DocumentResumes = item.documentResumes
  //             ? this.ConvertS3File(item.documentResumes)
  //             : '';

  //           this.UploadedDocument = item.uploadedDocument
  //             ? this.ConvertS3File(item.uploadedDocument)
  //             : '';

  //           return {
  //             ...item,
  //             Educational_Credentails: item.educational_Credentails
  //               ? this.ConvertS3File(item.educational_Credentails)
  //               : '',
  //             DocumentResumes: item.documentResumes
  //               ? this.ConvertS3File(item.documentResumes)
  //               : '',
  //             UploadedDocument: item.uploadedDocument
  //               ? this.ConvertS3File(item.uploadedDocument)
  //               : '',
  //           };
  //         })[0];
  //         // Handle qualifications
  //         if (this.QualificationList && this.TocUserDetail.qualification) {
  //           //Commented on 08/03/25
  //           // const qualificationIds = this.TocUserDetail.qualification
  //           //   .split(',')
  //           //   .map((id: string) => parseInt(id, 10));
  //           // this.TocUserDetail.qualificationNames =
  //           //   this.QualificationList.filter((item: any) =>
  //           //     qualificationIds.includes(item.id)
  //           //   )
  //           //     .map((item: any) => item.name)
  //           //     .join(', ');

  //           //Added on 08/03/25
  //           let qualificationIds: number[] = [];

  //           if (typeof this.TocUserDetail.qualification === 'string') {
  //             qualificationIds = this.TocUserDetail.qualification
  //               .split(',')
  //               .map((id: string) => parseInt(id, 10));
  //           } else if (typeof this.TocUserDetail.qualification === 'number') {
  //             qualificationIds = [this.TocUserDetail.qualification];
  //           }

  //           this.TocUserDetail.qualificationNames =
  //             this.QualificationList.filter((item: any) =>
  //               qualificationIds.includes(item.id)
  //             )
  //               .map((item: any) => item.name)
  //               .join(', ');
  //         } else {
  //           this.TocUserDetail.qualificationNames = 'No qualifications listed';
  //         }
  //         // Handle working days
  //         if (this.TocUserDetail.workingDays) {
  //           const workingDayIds = this.TocUserDetail.workingDays
  //             .split(',')
  //             .map((day: string) => parseInt(day, 10));
  //           const daysOfWeekMapping: any = {
  //             1: 'Monday',
  //             2: 'Tuesday',
  //             3: 'Wednesday',
  //             4: 'Thursday',
  //             5: 'Friday',
  //             6: 'Saturday',
  //             7: 'Sunday',
  //           };
  //           this.TocUserDetail.workingDaysNames = workingDayIds
  //             .map((id: number) => daysOfWeekMapping[id])
  //             .filter((day: string | undefined) => day) // Filter out undefined days
  //             .join(', ');
  //         } else {
  //           this.TocUserDetail.workingDaysNames = 'No working days listed';
  //         }
  //         if (
  //           this.TocUserDetail.uploadedDocumentType &&
  //           this.TocUserDetail.uploadedDocumentType.length > 0
  //         ) {
  //           const documentTypeIds = this.TocUserDetail.uploadedDocumentType[0];
  //           this.TocUserDetail.documentTypeNames =
  //             this.documentTypeList && Array.isArray(this.documentTypeList)
  //               ? this.documentTypeList.find(
  //                   (item) => item.id === documentTypeIds
  //                 )?.documentType || 'Unknown Document Type'
  //               : 'Unknown Document Type';
  //         } else {
  //           this.TocUserDetail.documentTypeNames = 'No document types listed';
  //         }
  //         // Group slots by working day name
  //         if (
  //           this.TocUserDetail.slots &&
  //           Array.isArray(this.TocUserDetail.slots)
  //         ) {
  //           const groupedSlots = this.TocUserDetail.slots.reduce(
  //             (acc: any, slot: any) => {
  //               if (!acc[slot.workingDayName]) {
  //                 acc[slot.workingDayName] = [];
  //               }
  //               acc[slot.workingDayName].push(
  //                 `${slot.startTime} -- ${slot.endTime}`
  //               );
  //               return acc;
  //             },
  //             {}
  //           );
  //           this.TocUserDetail.groupedSlots = Object.entries(groupedSlots).map(
  //             ([day, times]) => ({
  //               day,
  //               times,
  //             })
  //           );
  //         }

  //         //Arsh
  //         if (this.TocUserDetail.expertise) {
  //           let expertiseIds: number[] = [];

  //           if (typeof this.TocUserDetail.expertise === 'string') {
  //             expertiseIds = this.TocUserDetail.expertise
  //               .split(',')
  //               .map((id: string) => parseInt(id, 10));
  //           } else if (typeof this.TocUserDetail.expertise === 'number') {
  //             expertiseIds = [this.TocUserDetail.expertise];
  //           } else if (Array.isArray(this.TocUserDetail.expertise)) {
  //             expertiseIds = this.TocUserDetail.expertise.map((id: any) =>
  //               Number(id)
  //             );
  //           }

  //           // Ensure expertiseList exists and filter matching IDs
  //           if (
  //             this.expertise &&
  //             Array.isArray(this.expertise) &&
  //             expertiseIds.length > 0
  //           ) {
  //             this.TocUserDetail.expertiseNames = this.expertise
  //               .filter((item: any) => expertiseIds.includes(item.id))
  //               .map((item: any) => item.name)
  //               .join(', ');
  //           } else {
  //             this.TocUserDetail.expertiseNames = 'No expertise listed';
  //           }
  //         } else {
  //           this.TocUserDetail.expertiseNames = 'No expertise listed';
  //         }

  //       } else {
  //         this.TocUserDetail = []; // Reset if no data or invalid response
  //       }
  //     },
  //     (error) => {
  //       this.TocUserDetail = []; // Reset on error
  //     }
  //   );
  // }

  downloadFile(fileUrl: any) {
    const link = document.createElement('a');
    link.href = fileUrl;
    // link.target = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    link.download = 'documentFile';
    link.click();
  }

  S3FileName(fileName: any) {
    let response = this.base64ToBlob(fileName);
    const imageUrl = URL.createObjectURL(response);
    return imageUrl;
  }

  ConvertS3File(base64: string, mimeType: string = 'application/octet-stream') {
    const blob = this.base64ToBlob(base64, mimeType);
    const url = URL.createObjectURL(blob);
    return { url, blob };
  }

  base64ToBlob(base64: string, mime = 'application/octet-stream'): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mime });
  }

  //Commented on 01/07/25
  // getByIDForView(id: any) {
  //   this.spinner.show();
  //   this.TocUserDetail = [];
  //   this.tocservice.getAppliedJobTOByID(id).subscribe(
  //     (data: any) => {
  //       if (data.message === 'ok' && data.result && data.result.length > 0) {  
  //         const item = data.result[0];
  //         const eduMime = this.getMimeTypeFromExtension(
  //           item.educational_Credentails_ex || '.pdf'
  //         );
  //         const resumeMime = this.getMimeTypeFromExtension(
  //           item.documentResumes_ex || '.pdf'
  //         );
  //         const uploadedDocMime = this.getMimeTypeFromExtension(
  //           item.uploadedDocument_ex || '.pdf'
  //         );

  //         const eduFile = item.educational_Credentails
  //           ? this.ConvertS3File(item.educational_Credentails, eduMime)
  //           : null;

  //         const resumeFile = item.documentResumes
  //           ? this.ConvertS3File(item.documentResumes, resumeMime)
  //           : null;

  //         const uploadedDocFile = item.uploadedDocument
  //           ? this.ConvertS3File(item.uploadedDocument, uploadedDocMime)
  //           : null;

  //         // Assign URLs and Blobs
  //         this.EducationalCredentails = eduFile?.url || '';
  //         this.EducationalCredentailsBlob = eduFile?.blob || null;

  //         this.DocumentResumes = resumeFile?.url || '';
  //         this.DocumentResumesBlob = resumeFile?.blob || null;

  //         this.UploadedDocument = uploadedDocFile?.url || '';
  //         this.UploadedDocumentBlob = uploadedDocFile?.blob || null;

  //         // Main Detail
  //         this.TocUserDetail = {
  //           ...item,
  //           Educational_Credentails: eduFile?.url || '',
  //           DocumentResumes: resumeFile?.url || '',
  //           UploadedDocument: uploadedDocFile?.url || '',
  //         };

  //         // Handle qualifications
  //         if (this.QualificationList && this.TocUserDetail.qualification) {
  //           let qualificationIds: number[] = [];

  //           if (typeof this.TocUserDetail.qualification === 'string') {
  //             qualificationIds = this.TocUserDetail.qualification
  //               .split(',')
  //               .map((id: string) => parseInt(id, 10));
  //           } else if (typeof this.TocUserDetail.qualification === 'number') {
  //             qualificationIds = [this.TocUserDetail.qualification];
  //           }

  //           this.TocUserDetail.qualificationNames =
  //             this.QualificationList.filter((item: any) =>
  //               qualificationIds.includes(item.id)
  //             )
  //               .map((item: any) => item.name)
  //               .join(', ');
  //         } else {
  //           this.TocUserDetail.qualificationNames = 'No qualifications listed';
  //         }
  //         // Handle working days
  //         if (this.TocUserDetail.workingDays) {
  //           const workingDayIds = this.TocUserDetail.workingDays
  //             .split(',')
  //             .map((day: string) => parseInt(day, 10));
  //           const daysOfWeekMapping: any = {
  //             1: 'Monday',
  //             2: 'Tuesday',
  //             3: 'Wednesday',
  //             4: 'Thursday',
  //             5: 'Friday',
  //             6: 'Saturday',
  //             7: 'Sunday',
  //           };
  //           this.TocUserDetail.workingDaysNames = workingDayIds
  //             .map((id: number) => daysOfWeekMapping[id])
  //             .filter((day: string | undefined) => day) // Filter out undefined days
  //             .join(', ');
  //         } else {
  //           this.TocUserDetail.workingDaysNames = 'No working days listed';
  //         }
  //         if (
  //           this.TocUserDetail.uploadedDocumentType &&
  //           this.TocUserDetail.uploadedDocumentType.length > 0
  //         ) {
  //           const documentTypeIds = this.TocUserDetail.uploadedDocumentType[0];
  //           this.TocUserDetail.documentTypeNames =
  //             this.documentTypeList && Array.isArray(this.documentTypeList)
  //               ? this.documentTypeList.find(
  //                 (item) => item.id === documentTypeIds
  //               )?.documentType || 'Unknown Document Type'
  //               : 'Unknown Document Type';
  //         } else {
  //           this.TocUserDetail.documentTypeNames = 'No document types listed';
  //         }
  //         // Group slots by working day name
  //         if (
  //           this.TocUserDetail.slots &&
  //           Array.isArray(this.TocUserDetail.slots)
  //         ) {
  //           const groupedSlots = this.TocUserDetail.slots.reduce(
  //             (acc: any, slot: any) => {
  //               if (!acc[slot.workingDayName]) {
  //                 acc[slot.workingDayName] = [];
  //               }
  //               acc[slot.workingDayName].push(
  //                 `${slot.startTime} -- ${slot.endTime}`
  //               );
  //               return acc;
  //             },
  //             {}
  //           );
  //           this.TocUserDetail.groupedSlots = Object.entries(groupedSlots).map(
  //             ([day, times]) => ({
  //               day,
  //               times,
  //             })
  //           );
  //         }

  //         //Arsh
  //         if (this.TocUserDetail.expertise) {
  //           let expertiseIds: number[] = [];

  //           if (typeof this.TocUserDetail.expertise === 'string') {
  //             expertiseIds = this.TocUserDetail.expertise
  //               .split(',')
  //               .map((id: string) => parseInt(id, 10));
  //           } else if (typeof this.TocUserDetail.expertise === 'number') {
  //             expertiseIds = [this.TocUserDetail.expertise];
  //           } else if (Array.isArray(this.TocUserDetail.expertise)) {
  //             expertiseIds = this.TocUserDetail.expertise.map((id: any) =>
  //               Number(id)
  //             );
  //           }

  //           // Ensure expertiseList exists and filter matching IDs
  //           if (
  //             this.expertise &&
  //             Array.isArray(this.expertise) &&
  //             expertiseIds.length > 0
  //           ) {
  //             this.TocUserDetail.expertiseNames = this.expertise
  //               .filter((item: any) => expertiseIds.includes(item.id))
  //               .map((item: any) => item.name)
  //               .join(', ');
  //           } else {
  //             this.TocUserDetail.expertiseNames = 'No expertise listed';
  //           }
  //         } else {
  //           this.TocUserDetail.expertiseNames = 'No expertise listed';
  //         }

  //         setTimeout(() => {
  //        this.spinner.hide();
  //         }, 10);
  //       } 
  //       else {
  //         this.TocUserDetail = []; // Reset if no data or invalid response
  //       }
  //     },
  //     (error) => {
  //       this.TocUserDetail = []; // Reset on error
  //     }
  //   );
  // }


  //Updated on 01/07/25
  async getByIDForView(id: any) {
    try {

      this.TocUserDetailSkelton = false;

      this.TocUserDetail = [];
      const data: any = await firstValueFrom(this.tocservice.getAppliedJobTOByID(id, 0));

      if (data.message === 'ok' && data.result?.length > 0) {
        const item = data.result[0];
        const eduMime = this.getMimeTypeFromExtension(item.educational_Credentails_ex || '.pdf');
        const resumeMime = this.getMimeTypeFromExtension(item.documentResumes_ex || '.pdf');
        const uploadedDocMime = this.getMimeTypeFromExtension(item.uploadedDocument_ex || '.pdf');

        const eduFile = item.educational_Credentails ? this.ConvertS3File(item.educational_Credentails, eduMime) : null;
        const resumeFile = item.documentResumes ? this.ConvertS3File(item.documentResumes, resumeMime) : null;
        const uploadedDocFile = item.uploadedDocument ? this.ConvertS3File(item.uploadedDocument, uploadedDocMime) : null;

        this.EducationalCredentails = eduFile?.url || '';
        this.EducationalCredentailsBlob = eduFile?.blob || null;

        this.DocumentResumes = resumeFile?.url || '';
        this.DocumentResumesBlob = resumeFile?.blob || null;

        this.UploadedDocument = uploadedDocFile?.url || '';
        this.UploadedDocumentBlob = uploadedDocFile?.blob || null;

        this.TocUserDetail = {
          ...item,
          Educational_Credentails: eduFile?.url || '',
          DocumentResumes: resumeFile?.url || '',
          UploadedDocument: uploadedDocFile?.url || '',
        };

        // Call your helper functions here (e.g., for qualifications, expertise, etc.)
        this.TocUserDetail.qualificationNames = this.getQualificationNames(this.TocUserDetail.qualification);
        this.TocUserDetail.workingDaysNames = this.getWorkingDayNames(this.TocUserDetail.workingDays);
        this.TocUserDetail.groupedSlots = this.getGroupedSlots(this.TocUserDetail.slots);
        this.TocUserDetail.expertiseNames = this.getExpertiseNames(this.TocUserDetail.expertise);

        const docTypeId = this.TocUserDetail.uploadedDocumentType;
        this.TocUserDetail.documentTypeNames =
          this.documentTypeList?.find((item: { id: any; }) => item.id === docTypeId)?.documentType || 'Unknown Document Type';
        this.cdr.detectChanges();
        this.TocUserDetailSkelton = true;

      } else {
        this.TocUserDetail = [];
        this.TocUserDetailSkelton = true;

      }
    } catch (error) {
      console.error('Error:', error);
      this.TocUserDetail = [];
      this.TocUserDetailSkelton = true;

    } finally {
      this.TocUserDetailSkelton = true;

    }
  }

  getQualificationNames(qualification: any): string {
    if (!this.QualificationList || !qualification) return 'No qualifications listed';
    const ids = typeof qualification === 'string'
      ? qualification.split(',').map((x: string) => +x)
      : [Number(qualification)];
    return this.QualificationList.filter((x: any) => ids.includes(x.id)).map((x: any) => x.name).join(', ');
  }

  getWorkingDayNames(workingDays: string): string {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const ids = workingDays?.split(',').map((x: string) => +x) || [];
    return ids.map(id => daysOfWeek[id - 1]).filter(Boolean).join(', ') || 'No working days listed';
  }

  getGroupedSlots(slots: any[]): any[] {
    if (!Array.isArray(slots)) return [];
    const grouped = slots.reduce((acc: any, slot: any) => {
      if (!acc[slot.workingDayName]) acc[slot.workingDayName] = [];
      acc[slot.workingDayName].push(`${slot.startTime} -- ${slot.endTime}`);
      return acc;
    }, {});
    return Object.entries(grouped).map(([day, times]) => ({ day, times }));
  }

  getExpertiseNames(expertise: any): string {
    if (!this.expertise) return 'No expertise listed';
    const ids = typeof expertise === 'string'
      ? expertise.split(',').map((x: string) => +x)
      : Array.isArray(expertise)
        ? expertise.map((x: any) => +x)
        : [Number(expertise)];
    return this.expertise.filter((x: any) => ids.includes(x.id)).map((x: any) => x.name).join(', ') || 'No expertise listed';
  }


  getMimeTypeFromExtension(extension: string): string {
    switch (extension.toLowerCase()) {
      case '.pdf':
        return 'application/pdf';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.doc':
        return 'application/msword';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }

  getProfileDetails() {
    // this.spinner.show();
    this.skeletonShow = 'Skelton';
    this.profileDetailSkelton = false;
    this.profileService
      .GetUserById(this.UserId, this.UserRoleID)
      .subscribe(async (data) => {
        if (data.message == 'Success') {
          // let imageFullPaths: string;
          if (this.UserRoleID !== 5) {
            this.imageFullPaths =
              data.result.filePath + '/' + data.result.fileName;

            if (this.imageFullPaths) {
              this.getS3FileName(this.imageFullPaths);
            }
            this.profileDetailSkelton = true;
            this.skeletonShow = '';


          }
          if (this.UserRoleID === 5) {
            const studentID = parseInt(this.cookies.get('StudentID'));
            if (studentID) {
              this.data = await this.getStudentDetails(studentID);
              if (this.data) {
                this.imageFullPaths = this.data.s3ImageUrl;
                this.profileImage = this.imageFullPaths
                  ? this.S3FileName(this.imageFullPaths)
                  : '';
              }
              this.skeletonShow = '';
              this.profileDetailSkelton = true;

            }
          }
          else {
            if (
              data.result.documentImage === null ||
              data.result.documentImage === ''
            ) {
              $('#profileID').attr(
                'src',
                'data:image/jpeg;base64,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'
              );

              this.data = data.result;
              this.skeletonShow = '';
              this.profileDetailSkelton = true;



            } else {
              this.data = data.result;
              this.skeletonShow = '';
              this.profileDetailSkelton = true;



            }
          }

          this.skeletonShow = '';
          this.profileDetailSkelton = true;


        }
        this.skeletonShow = '';
        this.profileDetailSkelton = true;


      });
  }

  // getS3FileName(fileName: Blob) {
  //   this.commonService.getS3FileByName(fileName).subscribe(
  //     (blob: Blob) => {
  //       const imageUrl = URL.createObjectURL(blob);
  //       this.profileImage = imageUrl;
  //     },
  //     (error) => {
  //       console.error('Failed to fetch S3 image', error);
  //     }
  //   );
  // }

  getS3FileName(fileName: string) {
    this.commonService.getS3FileByName(fileName).subscribe(
      (blob: Blob) => {
        const imageUrl = URL.createObjectURL(blob);
        this.profileImage = imageUrl;
      },
      (error) => {
        console.error('Failed to fetch S3 image', error);
      }
    );
  }

  OnEdit() {
    this.spinner.show();
    this.getMasterDocumentID(this.centreID, 'Logos');

    this.profileService
      .GetUserById(this.UserId, this.UserRoleID)
      .subscribe((data) => {
        if (data.message == 'Success') {
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
          this.profilevalue = data.result;

          const user = {
            dob: data.result.dob,
          };
          //const { firstName, middleName, lastName } = this.profileform.value;
          //const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
          this.profileform.patchValue({
            id: this.profilevalue.id,
            firstName: this.profilevalue.firstName,
            middleName: this.profilevalue.middleName
              ? this.profilevalue.middleName
              : '',
            lastName: this.profilevalue.lastName
              ? this.profilevalue.lastName
              : '',
            // name: fullName,
            name:
              this.profilevalue.firstName +
              ' ' +
              this.profilevalue.middleName +
              ' ' +
              this.profilevalue.lastName,
            email: this.profilevalue.email,
            dob: this.formatDateForDisplay(user.dob),

            address: this.profilevalue.address,
            mobile: this.profilevalue.mobile,
            gender: this.profilevalue.gender,
          });
        } else {
          this.spinner.hide();
        }
      });
  }

  onSubmit() {
    this.spinner.show();
    const tokenString = this.cookies.get('UserInfo');
    const parsedToken = JSON.parse(tokenString);
    this.userRoleID = parsedToken.result.userRoleID;
    this.pinCode = parsedToken.result.pinCode;
    this.countryID = parsedToken.result.countryID;
    this.stateID = parsedToken.result.stateID;
    this.cityID = parsedToken.result.cityID;
    this.profileform.patchValue({
      userRoleID: this.UserRoleID,
      pinCode: this.pinCode,
      countryID: this.countryID,
      stateID: this.stateID,
      cityID: this.cityID,
    });
    if (this.profileform.valid) {
      const dob = this.profileform.value.dob;
      const formattedDob = this.formatDateForBackend(dob);
      const userData = {
        ...this.profileform.value,
        dob: formattedDob,
      };
      this.profileService.ManageUser(userData).subscribe((data) => {
        if (data.message == 'Success') {
          this.spinner.hide();
          this.toastr.success('Data updated successfully');
          this.headerComponent?.getProfileDetailsHeaderComponent();
        }

        this.getProfileDetails();
        $('#staticBackdrop').modal('hide');

        // this.cookies.set("userInfo",this.profileform.get('userInfo')?.value);
        this.profileform.reset();
      });
    } else {
      this.spinner.hide();
      this.profileform.markAllAsTouched();
    }
  }

  onNameInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const nameParts = inputElement.value.split(' ');
    this.profileform.patchValue(
      {
        firstName: nameParts[0] || '',
        middleName:
          nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '',
        lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
      },
      { emitEvent: false }
    );
  }

  get input() {
    return this.profileform.controls;
  }

  formatDateForBackend(date: string): string {
    let splittedDate = date.split('-');
    let spD = splittedDate[1] + '-' + splittedDate[0] + '-' + splittedDate[2];

    const dateObject = new Date(spD);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // validateNumber(event: KeyboardEvent): void {
  //   const charCode = event.key.charCodeAt(0);
  //   if (
  //     (charCode < 48 || charCode > 57) &&
  //     !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
  //       event.key
  //     )
  //   ) {
  //     event.preventDefault();
  //   }
  // }

  formatPhoneNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    let formattedNumber = '';

    if (input.length > 0) {
      formattedNumber = input.substring(0, 3);
    }
    if (input.length > 3) {
      formattedNumber += ' ' + input.substring(3, 6);
    }
    if (input.length > 6) {
      formattedNumber += ' ' + input.substring(6, 10);
    }

    event.target.value = formattedNumber.trim();
    this.profileform.controls['mobile'].setValue(formattedNumber);
  }

  CheckInterestedMobileExist(event: any): void {
    let mobile = this.profileform.value.mobile;
    if (mobile != '') {
      this.ChildParentService.CheckInterestedMobileExist(mobile).subscribe(
        (data) => {
          if (data.message === 'mobile exists') {
            this.toastr.warning('Mobile number already exists');
            this.profileform.get('mobile')?.reset();
          }
        }
      );
    }
  }

  formatDateForDisplay(dateString: string): string {
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, '0');
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async onFileSelected(event: any, type: string) {
    this.fileType = type;
    this.fileName = event.target.files[0].name;
    this.imageChangedEvent = event;
    $('#cropperModal').modal('show');
  }

  resetImage() {
    $('#profileUpload').val('');
  }
  // Commented by sahib
  // this.spinner.show();
  // this.getMasterDocumentID(this.UserId, type);


  // const file = event.target.files[0];
  // if (file) {
  //   const reader = new FileReader();
  //   reader.readAsDataURL(file);
  //   reader.onload = (e: any) => {
  //     if (type === 'Profile_Image') {
  //       this.profile = reader.result as string;
  //     }
  //   };
  //   const formData = new FormData();
  //   formData.append('files', file);
  //   formData.append('type', type);
  //   this.applicationService.uploadImages(formData, type).subscribe((data) => {
  //     if (data.message === 'OK') {
  //       if (type === 'Profile_Image') {
  //         const image = data.result;
  //         // const fileName = file.name;

  //         this.imageFullPaths =
  //           data.result[0].path + '/' + data.result[0].imageName;

  //         this.imageForm.patchValue({
  //           documentImage: image[0].imageName,
  //           documentImagePath: image[0].path,
  //           id: this.getId,
  //           referenceTableID: this.UserId,
  //           documentTypeID: 4,
  //           referenceTableName: 'UserMaster',
  //         });

  //         this.spinner.hide();
  //       } else if (type === 'Logos') {
  //         const image = data.result;
  //         this.imageFullPaths =
  //           data.result[0].path + '/' + data.result[0].imageName;

  //         if (this.imageFullPaths) {
  //           this.getS3FileName(this.imageFullPaths);

  //         }
  //         this.commonService.updateHeaderImage();

  //         this.imageForm.patchValue({
  //           documentImage: image[0].imageName,
  //           documentImagePath: image[0].path,
  //           id: this.getId,
  //           referenceTableID: this.centreID,
  //           documentTypeID: 5,
  //           referenceTableName: 'DaycareCentreRegistration',
  //         });

  //         // this.spinner.hide();
  //       }

  //       const documentList = [this.imageForm.value];

  //       this.profileService
  //         .ManageMasterDocument(documentList)
  //         .subscribe((response) => {
  //           if (response.success === true) {

  //             if (this.imageFullPaths) {
  //               this.getS3FileName(this.imageFullPaths);

  //             }
  //             this.toastr.success(response.message);
  //             this.getProfileDetails();

  //             const userID = type === 'Logos' ? this.centreID : this.UserId;
  //             this.getMasterDocumentID(userID, type);
  //             this.commonService.updateHeaderImage();

  //             // this.headerComponent?.getProfileDetailsHeaderComponent();
  //             setTimeout(() => {
  //               this.spinner.hide();
  //             }, 100);
  //           } else {
  //             this.spinner.hide();
  //           }
  //         });
  //     }
  //   });
  // }

  // hits while cropping
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob = event.blob;
  }

  // upload button
  uploadCroppedImage() {
    this.spinner.show();
    const file = this.commonService.blobToFile(this.croppedImageBlob, this.fileName);
    $('#profileInputId').val('');
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        if (this.fileType === 'Profile_Image') {
          this.profile = reader.result as string;
        }
      };
      const formData = new FormData();
      formData.append('files', file);
      formData.append('type', this.fileType);
      this.applicationService.uploadImages(formData, this.fileType).subscribe((data) => {
        if (data.message === 'OK') {
          if (this.fileType === 'Profile_Image') {
            const image = data.result;
            // const fileName = file.name;

            this.imageFullPaths =
              data.result[0].path + '/' + data.result[0].imageName;

            this.imageForm.patchValue({
              documentImage: image[0].imageName,
              documentImagePath: image[0].path,
              id: this.getId,
              referenceTableID: this.UserId,
              documentTypeID: 4,
              referenceTableName: 'UserMaster',
            });
            $('#cropperModal').modal('hide');

          } else if (this.fileType === 'Logos') {
            const image = data.result;
            this.imageFullPaths =
              data.result[0].path + '/' + data.result[0].imageName;

            if (this.imageFullPaths) {
              this.getS3FileName(this.imageFullPaths);

            }
            this.commonService.updateHeaderImage();

            this.imageForm.patchValue({
              documentImage: image[0].imageName,
              documentImagePath: image[0].path,
              id: this.getId,
              referenceTableID: this.centreID,
              documentTypeID: 5,
              referenceTableName: 'DaycareCentreRegistration',
            });

            // this.spinner.hide();
          }

          const documentList = [this.imageForm.value];

          this.profileService
            .ManageMasterDocument(documentList)
            .subscribe((response) => {
              if (response.success === true) {

                if (this.imageFullPaths) {
                  this.getS3FileName(this.imageFullPaths);

                }
                this.toastr.success(response.message);
                this.getProfileDetails();
                this.spinner.hide();
                const userID = this.fileType === 'Logos' ? this.centreID : this.UserId;
                this.getMasterDocumentID(userID, this.fileType);
                this.commonService.updateHeaderImage();

                // this.headerComponent?.getProfileDetailsHeaderComponent();
                setTimeout(() => {
                  this.spinner.hide();
                }, 100);
              } else {
                this.spinner.hide();
              }
            });
        }
      });
    }

  }


  private readFileAsync(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const filereader = new FileReader();
      filereader.onload = (data: any) => {
        resolve(data.target?.result);
      };
      filereader.onerror = (error) => {
        reject(error);
      };
      filereader.readAsDataURL(file);
    });
  }

  getMasterDocumentID(userID: any, type: any) {
    this.profileService
      .GetMasterDocumentbyId(userID, type)
      .subscribe((data) => {
        if (data.message == 'Ok') {

          const Document = data.result;
          this.getId = Document.id;

          let imageUrl = Document.s3ImageUrl
            ? this.commonService.convertS3File(Document.s3ImageUrl)
            : '';
          if (type == 'profileImage') {
            this.profileImage = imageUrl
              ? imageUrl
              : 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp';
          } else {
            this.logoImage = imageUrl
              ? imageUrl
              : 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp';
          }

        } else {
        }
      });
  }

  // getPlanDetail(tab: string) {
  //
  //   this.spinner.show();
  //   this.plan = [];
  //   this.activeTab = tab;
  //   const studentID = this.cookies.get('StudentID')
  //     ? parseInt(this.cookies.get('StudentID'))
  //     : '';
  //   this.profileService
  //     .getSubscriptionPlanByUserId(this.UserId, this.UserRoleID, tab, studentID)
  //     .subscribe((data) => {
  //       if (data.message != 'OK') {
  //         this.spinner.hide();
  //         return;
  //       }
  //       if (data.message === 'OK') {
  //         data.result.forEach((item: any) => {
  //           const isPlanExists = this.plan.find(
  //             (planInfo: any) => planInfo.planID == item.planID
  //           );
  //           this.spinner.hide();
  //           if (!isPlanExists) {
  //             this.plan.push(item);
  //           }
  //         });

  //         // Sort plans by ID (latest first)
  //         this.plan.sort((a: any, b: any) => b.id - a.id);
  //         //seperating add ons and regular plans...
  //         this.plan.forEach(item=>{
  //           if(item.planOwnerID>2){
  //             this.addonPlans.push(item);
  //           }
  //           if(item.planOwnerID<=2){
  //             this.regularPlans.push(item);
  //           }

  //         })

  //         //
  //         if (this.plan.length > 0) {
  //           const latestPlan = this.plan[0]; // Get the latest plan
  //           // Check if the latest plan has planOwnerID == 3
  //           if (latestPlan.planOwnerID == 3) {
  //             this.plan.slice(1).forEach((oldPlan: any) => {
  //               // Modify older plans
  //               oldPlan.featureList.forEach((feature: any) => {
  //                 if (
  //                   feature.featureName.toLowerCase().includes('job posting')
  //                 ) {
  //                   feature.featureName = feature.featureName; // Keep the name
  //                   feature.isJobPostingDisabled = true; // Add flag for strikethrough
  //                 }
  //               });
  //             });
  //           }
  //         }
  //       }
  //     });
  // }

  redirectToDaycare() {
    const tokenString = this.cookies.get('UserInfo');
    const parsedToken = JSON.parse(tokenString);
    this.email = parsedToken.result.email;
    this.password = 'Mind@4';
    // const encryptedEmail = this.commonService.encrypt(this.email);
    // const encryptedPassword = this.commonService.encrypt(this.password);

    const secretKey = 'encrypt!135790';
    const encryptedEmail = CryptoJS.AES.encrypt(this.email, secretKey);
    const encryptedPassword = CryptoJS.AES.encrypt(
      this.password.toString(),
      secretKey
    ).toString();
    const queryParams = {
      email: encryptedEmail,
      password: encryptedPassword,
    };

    if (this.UserRoleID === 3) {
      window.location.href = `${environment.frontEndWebUrl}daycare?email=${queryParams.email}&password=${queryParams.password}#section1`;
    } else if (this.UserRoleID === 5) {
      // Redirect to ForParent page  
      window.location.href = `${environment.Cpanel}parents?email=${queryParams.email}&password=${queryParams.password}`;
    }
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

  selectStudentDetails(id: any) {
    this.SelectedStudentId = id;
    const secretKey = 'encrypt001100!?';
    const encryptedID = CryptoJS.AES.encrypt(
      this.SelectedStudentId.toString(),
      secretKey
    ).toString();

    this.route.navigate(['/student-detail'], {
      queryParams: { ID: encryptedID, TYPE: 'detail', Update: 'update' },
    });

    // this.route.navigate(['/parent-onboarding'], {
    //   queryParams: { ID: encryptedID, TYPE: 'detail', Update: 'update' },
    // });
  }

  hidetocuserform() {
    $('#staticBackdropEdit').modal('hide');
  }

  //sg(06-03-2025)
  async getStudentDetails(id: number) {
    try {
      const data = await this.headerservice
        .getAllStudentsByParentID(this.UserId)
        .toPromise();
      if (data.message === 'Success') {
        const students = data.result;
        const student = students.find((student: any) => student.id === id);

        if (student) {
          return student;
        } else {
          return null;
        }
      } else {
        this.toastr.error('Failed to retrieve student details');
        return null;
      }
    } catch (error: any) {
      this.toastr.error(
        'Error occurred while fetching student details:',
        error
      );
      return null;
    }
  }

  async getPlansDetails(tab: string) {
    try {
      // this.spinner.show();
      this.planInfoskeletonShow = 'PlanInfo';
      this.plan = [];
      this.addonPlans = [];
      this.regularPlans = [];
      this.activeTab = tab;
      const studentID = this.cookies.get('StudentID')
        ? parseInt(this.cookies.get('StudentID'))
        : '';

      const data = await this.profileService
        .getSubscriptionPlanByUserId(
          this.UserId,
          this.UserRoleID,
          tab,
          studentID
        )
        .toPromise();
      if (data.message != 'OK') return;

      const existingPlanIDs = new Set(this.plan.map((plan) => plan.planID));
      data.result.forEach((item: any) => {
        if (!existingPlanIDs.has(item.planID)) {
          this.plan.push(item);
          existingPlanIDs.add(item.planID);
        }
      });

      this.plan.sort((a, b) => b.id - a.id);

      this.addonPlans = this.plan.filter((item) => item.planOwnerID > 2);
      this.regularPlans = this.plan.filter((item) => item.planOwnerID <= 2);

      // const latestPlan = this.plan[0];
      // if (latestPlan?.planOwnerID === 3) {
      //   this.plan.slice(1).forEach((oldPlan: any) => {
      //     oldPlan.featureList.forEach((feature: any) => {
      //       if (feature.featureName.toLowerCase().includes('job posting')) {
      //         feature.isJobPostingDisabled = true;
      //       }
      //     });
      //   });
      // }
      this.planInfoskeletonShow = '';

    } catch (error) {
      console.error('Error fetching plan details:', error);
      this.planInfoskeletonShow = '';

    } finally {
      this.planInfoskeletonShow = '';

    }
  }

  displayExpireDetails(info: any) {
    this.viewDetails = this.plan.filter(
      (item: any) => item.planID == info.planID
    );

    $('#staticBackdrop3').modal('show');
  }

  // openPreview(url: string) {
  //   this.previewUrl = url;
  //   this.isModalVisible = true;
  // }

  openPreview(url: string, mime: string) {
    this.previewMime = mime;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.isModalVisible = true;
  }

  closePreview() {
    this.isModalVisible = false;
    setTimeout(() => {
      this.previewUrl = null;
      this.previewMime = null;
    }, 300);
  }


  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;

  }

  selectCountry(country: any) {
    this.selectedCountry = country;
    this.dropdownOpen = true;
  }
}
