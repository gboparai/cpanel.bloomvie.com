import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ContentManagementService } from './content-management.service';
import {
  CKEditor4,
  CKEditorComponent,
  CKEditorModule,
} from 'ckeditor4-angular';
import { ApplicationsSettingsService } from '../settings/application-settings/applications-settings/applications-settings.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule } from '@wfpena/angular-wysiwyg';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgFor, NgIf } from '@angular/common';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { ChangeDetectorRef } from '@angular/core';
import { SkeletonLoaderComponent } from '../common-component/skeleton-loader/skeleton-loader.component';
import { ImageCroppedEvent, ImageCropperComponent, OutputFormat } from 'ngx-image-cropper';
import { CommonService } from '../common-component/common.service';
import { firstValueFrom } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CKEditorModule,
    FormsModule,
    NgSelectModule,
    HttpClientModule,
    AngularEditorModule,
    NgxPaginationModule,
    BreadcrumbComponent,
    NgFor,
    NgIf,
    SkeletonLoaderComponent,
    ImageCropperComponent
  ],
  templateUrl: './content-management.component.html',
  styleUrls: [
    './content-management.component.css',
    '../common-component/breadcrumb/breadcrumb.component.css',
  ],
})
export class ContentManagementComponent implements OnInit, OnDestroy {
  htmlContent: string = '';
  // editorConfig = {

  // };
  uploadImageResponse: any[] = [];
  imagePreviews: any[] = [];
  fileNameDisplay: any;
  editorConfig: any = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    defaultParagraphSeparator: '',
    defaultFontName: '',
    toolbarHiddenButtons: [
      ['strikeThrough'], // Corrected name
      ['undo'], // Corrected name
      ['redo'], // Corrected name
      ['subscript'],
      ['superscript'],
      ['backgroundColor'],
      ['fontName'],
      ['insertImage'],
      ['heading'],
      ['fontSize'],
      ['insertVideo'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
      ['indent', 'outdent'],
      ['horizontalRule'], // Corrected name
      ['removeFormat'], // Corrected name
      ['source'], // Corrected name
    ],
    toolbar: [
      ['bold', 'italic'], // Corrected bold inclusion
      ['insertOrderedList', 'insertUnorderedList'], // Numbered and Bulleted lists
      // Remove formatBlock if it's referring to Standard
      ['link', 'unlink'], // Add Link and Unlink
    ],
  };
  ContentP: number = 1;
  Contentsize: number = 5;
  submitButtonText: string = 'Submit';
  statusOptions = [
    { value: true, label: 'Active List' },
    { value: false, label: 'Deactive List' },
    { value: null, label: 'All' },
  ];

  sections: string[] = [
    'Section 1',
    'Section 2',
    'Section 3',
    'Section 4',
    'Section 5',
    'Section 6',
    'Section 7',
    'Section 8',
    'Section 9',
    'Section 10',
    'Section 11',
    'Section 12',
    'Section 13',
    'Section 14',
    'Section 15',
    'Section 16',
    'Section 17',
    'Section 18',
    'Section 19',
    'Section 20',
  ];

  form: any;
  previewUrl: string[] = [];
  selectedFile1: File | null = null;
  private navigationSubscription: any;
  readonly ImageRootURL = environment.apiUrl.slice(0, -3);

  formsData = new FormData();
  ImageRecord: any;
  loginUserId: any;
  FrontEndContent: any;
  //public listHomePageSection: Array<string> = [];
  listHomePageSection: any[] = [];
  public listHomePageSectionandType: any[] = [];
  menuType: any;
  selectedSectionId: any;
  selectedStatusId: boolean = true;
  Active: any;
  UserRoleId: any;
  public fileNamesDisplay: string = '';

  @ViewChild('CMSImageinput') CMSImageinput!: ElementRef;
  DayCareCentreContent: any;
  DayCareCentreID: any;
  gallery: any;
  ContentMasterID: any;
  ImagePath: any;
  imagePath: any;
  id: any;
  Content: any;
  daycare: any;
  DayCareCentre: any;
  footer: any;
  Urls: any;
  Testimonails: any;
  skeletonShow = 'Skelton';
  fileName: string = '';
  imageChangedEvent: any;
  tempCroppedEvent!: ImageCroppedEvent;
  fileList: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cookies: CookieService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private contentManagementService: ContentManagementService,
    private spinner: NgxSpinnerService,
    private Appservice: ApplicationsSettingsService,
    private changeDetectorRef: ChangeDetectorRef,
    private commonService: CommonService
  ) {
    this.form = this.fb.group({
      ID: [0],
      Title1: [''],
      Title2: [''],
      Title3: [''],
      Description: ['', Validators.required],
      Author: [''],
      DayCareCentreID: [''],
      Type: [''],
      Testimonails: [''],
      Image: [''],
      Section: ['', Validators.required],
      UserRoleId: [0],
      UserId: [0],
    });
  }

  ngOnInit(): void {
    this.loginUserId = this.cookies.get('UserId');
    const UserInfo = this.cookies.get('UserInfo');

    if (UserInfo) {
      const parsedInfo = JSON.parse(UserInfo);
      this.UserRoleId = parsedInfo.result.userRoleID;
      this.DayCareCentreID = parsedInfo.result.centreID;
    }

    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.handleQueryParams();
      }
    });

    this.handleQueryParams();
    this.selectedSectionId = 'All';
    this.Active = true;

    if (this.menuType === 'DayCareWelcome' || this.UserRoleId == 3) {
      this.form.patchValue({
        Section: 'Section 1',
      });
    }
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  private handleQueryParams(): void {
    const param = this.route.snapshot.queryParamMap.get('Type');
    if (param) {
      this.menuType = param;
      this.getHomePageSection(this.menuType, this.loginUserId);
    }
  }

  onEdit(footer: any): void {
    this.imagePreviews = [];
    this.footer = footer;
    this.id = footer.id;

    if (footer.image) {
      const filePaths = footer.image.split(',');
      const fileNames = filePaths.map((path: string) => path.split('/').pop());
      this.fileNamesDisplay = fileNames.join(', ');
      if (this.fileNamesDisplay.length > 1) {
        this.fileNamesDisplay = fileNames.length.toString();
      }

      if (footer.s3Urls && footer.s3Urls.length > 0) {
        footer.s3Urls.forEach((url: string, index: number) => {
          this.imagePreviews.push({
            s3Url: url,
            imagePath: filePaths[index] || ''
          });
        });
      } else {

        filePaths.forEach((path: string) => {
          this.imagePreviews.push({
            s3Url: '',
            imagePath: path,
          });
        });
      }

    }

    this.form.patchValue({
      Title1: footer.title1,
      Title2: footer.title2,
      Title3: footer.title3,
      Section: footer.section,
      Description: footer.description,
      Testimonails: footer.testimonails,
      ID: footer.id,
      Author: footer.author,
      Image: footer.image,
      UserRoleId: this.UserRoleId,
      UserId: this.loginUserId,
    });



    ///only for daycare case edit
    // this.getDayCareGallery();

    $('#Section').prop('disabled', true);

    this.submitButtonText = 'Update';
    this.spinner.hide();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    // this.getSectionListBySectionAndType();
  }

  CancelClick(): void {
    this.form.reset();
    this.submitButtonText = 'Submit';
    this.fileNamesDisplay = '';
  }

  ActiveInactive(
    ContentID: any,
    IsActive: boolean,
    event: any,
    ActiveInactiveContent: any
  ): void {
    const originalState = IsActive; // Store the original state of IsActive
    Swal.fire({
      title: 'Confirmation',
      text: IsActive
        ? 'Are you sure you want to inactivate this content?'
        : 'Are you sure you want to activate this content?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.contentManagementService
          .ActiveInactiveContent(ContentID, ActiveInactiveContent)
          .subscribe(
            () => {
              this.toastr.success(
                'Menu ' +
                (IsActive ? 'Inactivated' : 'Activated') +
                ' successfully'
              );
              this.spinner.hide();
              this.getHomePageSection(this.menuType, this.loginUserId);
            },
            (error) => {
              this.toastr.error('', 'Not Responding');
              this.spinner.hide();
              // Revert the checkbox to its original state on error
              event.target.checked = originalState;
            }
          );
      } else {
        // Revert the checkbox to its original state if canceled
        event.target.checked = originalState;
        this.spinner.hide();
      }
    });
  }


  uploadfiles(files: FileList): void {
    this.spinner.show();
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);

      if (this.menuType === 'Resources') {
        formData.append('type', 'Resources');
      } else {
        formData.append('type', 'ContentManagement');
      }
    }
    this.Appservice.uploadImages(formData, '').subscribe(
      (response) => {
        this.uploadImageResponse = response.result;
        this.spinner.hide();
      },
      (error) => {
        console.error('Files upload failed', error);
        this.spinner.hide();
      }
    );
  }

  uploadImages(formsData: FormData): Promise<any> {
    return new Promise((resolve, reject) => {
      this.Appservice.uploadImages(formsData, '').subscribe({
        next: (data) => {
          this.ImageRecord = data;

          resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }

  DeleteImage(index: number) {

    if (index >= 0 && index < this.imagePreviews.length) {
      const removedRange = this.imagePreviews.splice(index, 1)[0];
      const remainingImagePaths = this.imagePreviews.length ? this.imagePreviews.map(img => img.imagePath).join(',') : null;
      this.form.patchValue({
        Image: remainingImagePaths
      });


      this.toastr.success('Image deleted successfully.');
      if (this.imagePreviews.length === 0) {
        this.CMSImageinput.nativeElement.value = '';
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.spinner.hide();
      return;
    }

    this.spinner.show();
    try {
      const response = await firstValueFrom(
        this.Appservice.uploadImages(this.formsData, '')
      );

      this.uploadImageResponse = response.result;

      if (this.uploadImageResponse && this.uploadImageResponse.length > 0) {
        if (this.uploadImageResponse.length === 1) {
          this.form.patchValue({
            Image:
              this.uploadImageResponse[0].path +
              '/' +
              this.uploadImageResponse[0].imageName,
            UserId: this.loginUserId,
            UserRoleId: this.UserRoleId,
            Type: this.menuType,
          });
        } else {
          const imagePaths = this.uploadImageResponse
            .map((img: any) => img.path + '/' + img.imageName)
            .join(',');
          this.form.patchValue({
            Image: imagePaths,
            UserId: this.loginUserId,
            UserRoleId: this.UserRoleId,
            Type: this.menuType,
          });
        }
      } else {
        this.form.patchValue({
          UserId: this.loginUserId,
          UserRoleId: this.UserRoleId,
          Type: this.menuType,
        });
      }

      const data = await firstValueFrom(
        this.contentManagementService.manageContent(this.form.value)
      );

      if (data.message === 'OK') {
        this.toastr.success('', data.activity);
        this.getHomePageSection(this.menuType, this.loginUserId);

        this.formsData = new FormData();
        this.form.reset({
          Section: '',
          ID: 0,
          Title2: '',
          Title3: '',
          Author: '',
          Image: '',
        });
        $('#Image').val('');
        // this.CMSImageinput.nativeElement.value = '';
        this.imageFileBlob = [];
        this.fileList = [];
        this.imagePreviews = [];
        window.scroll(0, 0);
        this.submitButtonText = 'Submit';
        $('#Section').prop('disabled', false);
      } else {
        this.toastr.error('', data.activity);
      }
    } catch (error) {
      console.error(error);
      this.toastr.error('', 'An error occurred');
    } finally {
      this.spinner.hide();
    }

  }

  getFrontentContentByType() {
    this.contentManagementService
      .getFrontentContentByType(this.menuType)
      .subscribe((data) => {
        if (data.message == 'OK') {
          this.FrontEndContent = data.result;
        } else {
        }
      });
  }

  // mohit
  getDayCareGallery() {
    this.contentManagementService
      .getDayCareGallery(this.id, this.menuType)
      .subscribe(
        (data) => {
          if (data.message === 'OK') {
            this.daycare = data.result;

          } else {
            console.error('Failed to fetch gallery content:', data.message);
          }
        },
        (error) => {
          console.error(
            'An error occurred while fetching gallery content:',
            error
          );
        }
      );
  }

  // mohit
  async onDayCareContent(): Promise<void> {
    this.ContentP = 1;
    if (this.form.valid) {
      this.spinner.show();
      // Process uploaded images if available
      if (this.uploadImageResponse.length !== 0) {
        if (this.uploadImageResponse.length === 1) {
          this.form.patchValue({
            Image: `${this.uploadImageResponse[0].path}${this.uploadImageResponse[0].imageName}`,
            UserId: this.loginUserId,
            UserRoleId: this.UserRoleId,
            DayCareCentreID: this.DayCareCentreID,
            Type: this.menuType,
          });
        } else {
          const imagePaths = this.uploadImageResponse
            .map((img) => `${img.path}${img.imageName}`)
            .join(',');
          this.form.patchValue({
            Image: imagePaths,
            UserId: this.loginUserId,
            UserRoleId: this.UserRoleId,
            DayCareCentreID: this.DayCareCentreID,
            Type: this.menuType,
          });
        }
      } else {
        this.form.patchValue({
          UserId: this.loginUserId,
          DayCareCentreID: this.DayCareCentreID,
          UserRoleId: this.UserRoleId,
          Type: this.menuType,
        });
      }

      // Call the API to manage content

      this.contentManagementService
        .dayCareCentreContentMaster(this.form.value)
        .subscribe(
          (response) => {
            if (response.message === 'OK') {
              this.toastr.success('', response.activity);
              this.getHomePageSection(this.menuType, this.loginUserId);
              this.formsData = new FormData();
              this.form.reset({
                Section: '',
                ID: 0,
                Title2: '',
                Title3: '',
                Author: '',
                Image: '',
              });
              $('#Image').val('');
              window.scroll(0, 0);
              this.submitButtonText = 'Submit';
              $('#Section').prop('disabled', false);
              this.imagePreviews = [];
              this.CMSImageinput.nativeElement.value = '';
            } else {
              this.toastr.error('', response.activity);
            }
            this.spinner.hide();
          },
          (error) => {
            this.toastr.error('', 'An error occurred');
            this.spinner.hide();
          }
        );
    } else {
      this.form.markAllAsTouched();
      this.spinner.hide();
    }
  }

  getSectionListBySectionAndType() {
    this.ContentP = 1;
    this.skeletonShow = 'Skelton';
    let dropdowntext = this.selectedSectionId;
    this.Active = this.selectedStatusId;
    let Type2 = 'Admin';
    var bo = {
      type: this.menuType,
      sectionName: dropdowntext,
      type2: 'Admin',
      active: this.Active,
      userRoleId: this.UserRoleId,
      userId: this.loginUserId,
    };
    this.contentManagementService
      .GetSectionListBySectionAndTypeName(bo)
      .subscribe((data) => {
        if (data.message === 'OK') {
          this.listHomePageSectionandType = data.result;
          this.listHomePageSectionandType = data.result.map((item: any) => {
            const s3Urls = Array.isArray(item.s3ImageUrl)
              ? item.s3ImageUrl.map((img: string) => this.commonService.convertS3File(img))
              : [];
            return {
              ...item,
              s3Urls,
            };
          });
          this.skeletonShow = '';
        } else {
          this.skeletonShow = '';
          this.listHomePageSectionandType = [];
        }
      });
  }

  //  mohit
  getDayCareCentreContentMaster() {
    this.skeletonShow = 'Skelton';

    let dropdowntext = this.selectedSectionId;
    this.Active = this.selectedStatusId;
    let Type2 = 'Admin';
    var bo = {
      type: this.menuType,
      sectionName: dropdowntext,
      type2: 'Admin',
      active: this.Active,
      userRoleId: this.UserRoleId,
      userId: this.loginUserId,
    };
    this.contentManagementService
      .getDayCareCentreContentMaster(bo)
      .subscribe((data) => {
        if (data.message === 'Success') {
          this.DayCareCentreContent = data.result;
          this.DayCareCentreContent = data.result.map((item: any) => {
            const s3Urls = Array.isArray(item.s3ImageUrl)
              ? item.s3ImageUrl.map((img: string) => this.commonService.convertS3File(img))
              : [];
            return {
              ...item,
              s3Urls,
            };
          });
          this.skeletonShow = '';
        } else {
          this.DayCareCentreContent = [];
          this.skeletonShow = '';
        }
        this.skeletonShow = '';
      });
    this.skeletonShow = '';

  }

  get fileCount() {
    return this.Urls.length;
  }

  deleteFile(id: any, image: any): void {
    this.ContentMasterID = id;
    this.imagePath = image;
    this.DaycareGalleryDelete(this.ContentMasterID, this.imagePath);
  }

  // mohit
  async DaycareGalleryDelete(
    ContentMasterID: any,
    imagePath: any
  ): Promise<void> {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this gallery item? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      });

      // Proceed only if the user confirms
      if (result.isConfirmed) {
        this.contentManagementService
          .DaycareGalleryDelete(ContentMasterID, imagePath)
          .subscribe(
            (response: any) => {
              if (response?.message === 'Success') {
                Swal.fire(
                  'Deleted!',
                  'Gallery item deleted successfully.',
                  'success'
                );
                this.onEdit(this.footer);

                // Uncomment and update if you need to filter items
                // this.imagePath = this.imagePath.filter((item: any) => item.ContentMasterID !== ContentMasterID);
              } else {
                Swal.fire(
                  'Warning',
                  response?.message || 'Delete failed.',
                  'warning'
                );
              }
            },
            (error: any) => {
              Swal.fire(
                'Error',
                'An error occurred while deleting the gallery item.',
                'error'
              );
              console.error('Error:', error);
            }
          );
      }
    } catch (error) {
      Swal.fire('Error', 'Unexpected error occurred.', 'error');
      console.error('Unexpected error:', error);
    }
  }

  getHomePageSection(type: string, UserID: number) {
    const uniqueSections: { [key: string]: boolean } = {};
    this.contentManagementService
      .GetHomePageSection(type, UserID)
      .subscribe((data) => {
        if (data.message === 'OK') {
          this.listHomePageSection = data.result.filter(
            (item: { section: string | number }) => {
              if (!uniqueSections[item.section]) {
                uniqueSections[item.section] = true;
                return true;
              }
              return false;
            }
          );

          this.listHomePageSection.unshift('All');
          if (this.menuType === 'DayCareWelcome' || this.UserRoleId == 3) {
            this.getDayCareCentreContentMaster();
          } else {
            this.getSectionListBySectionAndType();
          }
        } else {
          this.listHomePageSection = [];
          this.listHomePageSectionandType = [];
        }
        setTimeout(() => {
          this.spinner.hide();
        }, 200);
      });
  }

  isSectionDisabled(section: string): boolean {
    return this.listHomePageSection.some((item) => item.section === section);
  }

  Filter(key: any, type: string) {
    if (type === 'ACTIVE-INACTIVE') {
      this.Active = key;
    }
    this.getHomePageSection(this.menuType, this.loginUserId);
  }

  get CMSFormControls() {
    return this.form.controls;
  }

  ///////MULTIPLE CROPPER FILES CODE


  imageFiles: File[] = [];
  croppedImageType: any;
  currentFileIndex = 0;
  showUploadBtnToUploadCroppedImages = false;
  imageFileBlob: Blob[] = [];
  singleImageUploadedFirst = false;


  storeTempCrop(event: ImageCroppedEvent) {
    this.tempCroppedEvent = event;
  }

  onFileSelection(event: any) {
    this.imageFiles = [];
    const dataTransfer = new DataTransfer();
    const selectedFiles: File[] = Array.from(event.target.files);

    for (let file of selectedFiles) {
      this.imageFiles.push(file);
    }

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

  processCroppedImageForSingle() {
    if (this.tempCroppedEvent?.blob) {
      this.imageFileBlob = [];
      this.imageFileBlob.push(this.tempCroppedEvent?.blob);

      this.fileChangeHandler();
      this.singleImageUploadedFirst = true;
    } else {
     
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



  fileChangeHandler() {
    this.fileList = [];
    const files = this.imageFileBlob;
    // if (!files) return;
    //this.fileNamesDisplay = file.name;
    const typestring: string[] = [];
    for (let f = 0; f < files.length; f++) {
      // const file = this.commonService.blobToFile(files[f], this.fileName);
      const file = files[f];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push({
          s3Url: e.target.result,
          imagePath: null
        });
      };

      reader.readAsDataURL(file);
      this.fileList.push(file);
      this.formsData.append('files', file);
      if (this.menuType === 'Resources') {
        this.formsData.append('type', 'Resources');
      } else {
        this.formsData.append('type', 'ContentManagement');
      }

    }

    $("#cropperModalForSingleImage").modal('hide');
    $("#cropperModal").modal('hide');
  }
}
