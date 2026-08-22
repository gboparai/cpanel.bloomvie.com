import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ManageMasterLeaveService } from '../../bloomvie-management/manage-master-leave/manage-master-leave.service';
import { CookieService } from 'ngx-cookie-service';
import { finalize } from 'rxjs';
import flatpickr from 'flatpickr';
import { ApplyleaveService } from './applyleave.service';
import { CommonService } from '../common.service';
import { ApplicationsSettingsService } from '../../settings/application-settings/applications-settings/applications-settings.service';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { DomSanitizer } from '@angular/platform-browser';
import { ClassroomDetailsService } from '../../day-care-management/classroom-management/classroom-details/classroom-details.service';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
declare var $: any;
@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [
    NgSelectComponent,
    FormsModule,
    CommonModule,
    NgxPaginationModule,
    NgFor,
    NgIf,
    NgxSpinnerModule,
    ReactiveFormsModule,
    SkeletonLoaderComponent,
    TooltipComponent,
    BreadcrumbComponent,
    ImageCropperComponent
  ],
  providers: [DatePipe],

  templateUrl: './apply-leave.component.html',
  styleUrl: './apply-leave.component.css',
})
export class ApplyLeaveComponent {
  daycareCentreId: any;
  leaveTypeList: any = [];
  endDatePickerInstance: any;
  teacherID: any;
  public fileNamesDisplay: string = '';
  imagePreviews: any[] = [];
  formsData = new FormData();
  fileAcceptType: string = 'image/*, video/*';
  @ViewChild('FileInput') FileInput!: ElementRef;
  fileInput: File | null = null;
  fileList: any[] = [];
  userRoleId: any;
  leaveList: any;
  public ContentP: number = 1;
  public Contentsize: number = 5;
  expandedReasonIndex: number | null = null;
  LeaveFrom: any;
  leaveID: number | null = null;
  uniqueStartDateInstance: any;
  uniqueSelectedStartDate: any;
  uniqueEndDateInstance: any;
  uniqueSelectedEndDate: any;
  startDate: any | null = null;
  endDate: any | null = null;
  formattedStartDate: any;
  formattedEndDate: any;
  SelectStartDate: any;
  newSelectEndDate: any;
  newSelectStartDate: any;
  SelectEndDate: any;
  public searchText: string = '';
  filteredApplyLeave: any;
  leaveSubPages: { [key: number]: number } = {};

  innerPageMap: { [key: number]: number } = {};
  innerPageSize: number = 5;
  fullImagePath: any;
  isClosing = false;
  startDatePickerInstance: any;

  previewUrl: string | null = null;
  previewType: 'image' | 'pdf' | null = null;
  teacherAvailabilityDays: any[] = [];
  workTiming: any = {};
  currentDayTiming: any = {};
  TOCUserDetail: any;
  TocSlotList: any;
  teacherWeekDaysIDs: any;
  selectedTeacherRoleID: any;
  skeletonShow = 'Skelton';
  hoveredRow: any = null;

  imageChangedEvent: any;
  imageFileBlob: Blob[] = [];
  imageTypeFileForCrop: string = '';
  showUploadBtnToUploadCroppedImages: boolean = false;
  tempCroppedEvent: any;
  singleImageUploadedFirst: boolean = false;
  currentFileIndex: number = 0;
  imageFiles: File[] = [];
  fileName: string = '';

  constructor(
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private leaveTypeService: ManageMasterLeaveService,
    private cookie: CookieService,
    private applyService: ApplyleaveService,
    public sanitizer: DomSanitizer,
    private classroomDetailsService: ClassroomDetailsService,
    private tocregistrationService: TocRegistrationService
  ) {
    this.LeaveFrom = this.fb.group({
      id: [0],
      loginUserID: [0],
      employeeId: [0],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      // centreid: [0],
      centreID: [0],
      typeOfLeave: ['', Validators.required],
      reason: ['', Validators.required],
      uploadDocument: [''],
      appliedLeaveDays: [0],
    });
  }

  ngOnInit() {
    this.daycareCentreId = this.cookie.get('CentreID')
      ? parseInt(this.cookie.get('CentreID'), 10)
      : 0;

    this.teacherID = parseInt(this.cookie.get('UserId'));
    this.userRoleId = parseInt(this.cookie.get('UserRoleId'));

    if (this.daycareCentreId > 0) {
      this.getLeaveTypeList();
      this.getDaycareWorkTimingByCentreID();
    }
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today);
    this.formattedStartDate = this.formatDate(startDate);
    this.formattedEndDate = this.formatDate(endDate);

    if (this.userRoleId != 3) {
      this.getteacherAvailability();
    }
    this.getEmployeeLeave();

    if (this.userRoleId == 8) {
      this.getTOCUserDetailByID(this.teacherID);
      this.getTocSlotbyUserid();
    }
  }

  ngAfterViewInit() {
    if (this.userRoleId != 8) {
      this.initializeFlatpickr2();
    }
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  onSelectActivityName(event: any) {
    this.LeaveFrom.patchValue({
      typeOfLeave: event.id,
    });
  }

  onReasonInput(event: Event, type: any): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.LeaveFrom.patchValue({
      reason: value,
    });

    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    const data = this.commonService.validateInput(input.value, type);

    input.value = data;

    const controlName = type === 'description' ? 'reason' : '';
    this.LeaveFrom.get(controlName)?.setValue(data);
  }

  async manageLeaves() {
    if (this.LeaveFrom.invalid) {
      this.LeaveFrom.markAllAsTouched();
      return;
    }

    this.spinner.show();
    if (this.userRoleId == 4 || this.userRoleId == 8) {
      this.formsData = new FormData();
      if (this.fileList.length > 0) {
        const { file, type } = this.fileList[0];
        this.formsData.append('files', file);
        this.formsData.append('type', type);
      }
    }

    try {
      if (this.userRoleId == 4 || this.userRoleId == 8) {
        const fileResponse = await this.UploadFiles(this.formsData);
        const uploaded = fileResponse?.result?.[0];
        this.fullImagePath = `${uploaded.path}/${uploaded.imageName}`;
        if (!uploaded?.path) throw new Error('Invalid file upload response');
      }
      this.LeaveFrom.patchValue({
        employeeId: this.teacherID,
        loginUserID: this.teacherID,
        startDate: this.datePipe.transform(
          this.LeaveFrom.value.startDate,
          'yyyy-MM-dd'
        ),
        endDate: this.datePipe.transform(
          this.LeaveFrom.value.endDate,
          'yyyy-MM-dd'
        ),
        uploadDocument: this.fullImagePath,
        centreID: this.daycareCentreId,
      });

      this.applyService.manageLeaves(this.LeaveFrom.value).subscribe({
        next: (data) => {
          if (data.message === 'OK') {
            this.toastr.success('Leave request submitted successfully.');
            this.clearForm();
            this.getEmployeeLeave();
          } else {
            if (data.message === 'Update') {
              this.toastr.success('Leave update successfully.');
              this.clearForm();
              $('#openModal').modal('hide');
              this.getEmployeeLeave();
            }
          }
          this.spinner.hide();
        },
        error: (error) => {
          this.toastr.error('Error submitting leave request');
          console.error(error);
          this.spinner.hide();
        },
      });
    } catch (error) {
      this.toastr.error('File upload failed');
      console.error(error);
    }
  }

  async UploadFiles(data: FormData): Promise<any> {
    try {
      return await this.commonService.uploadImages(data).toPromise();
    } catch (error) {
      throw error;
    }
  }

  // fileList: any[] = [];
  // formsData = new FormData();
  // imagePreviews: string[] = [];
  // fileNamesDisplay: string = '';
  // teacherID: string = ''; // Ensure this is set somewhere

  clearForm() {
    this.LeaveFrom.reset({
      id: 0,
      loginUserID: 0,
      employeeId: 0,
      startDate: '',
      endDate: '',
      status: '',
      typeOfLeave: '',
      reason: '',
      uploadDocument: '',
    });
    // this.formsData = new FormData();
    const fileInput = document.getElementById(
      'file-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.fileList = [];
    $('#file-upload').val('');

    //Added on 24/07/25
    this.LeaveFrom.patchValue({
      employeeId: this.teacherID,
      loginUserID: this.teacherID,
      centreID: this.daycareCentreId,
    });
  }

  FileSelectionBeforeCrop(event: any) {
    this.fileName = event.target.files[0].name;
    this.imageChangedEvent = event;
    $("#cropperModal").modal('show');
  }

  storeTempCrop(event: ImageCroppedEvent) {
    this.tempCroppedEvent = event.blob;
  }

  fileChangeHandler(type: string) {
    const file = this.commonService.blobToFile(this.tempCroppedEvent, this.fileName);
    if (!file) return;
    this.fileNamesDisplay = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviews = [e.target.result];
    };

    reader.readAsDataURL(file);
    this.fileList = [];
    this.formsData = new FormData();
    this.fileList.push({ file, type });
    this.formsData.append('files', file);
    this.formsData.append('type', type);

    // this.LeaveFrom.controls.uploadDocument.clearValidators();
    // this.LeaveFrom.controls.uploadDocument.setErrors(null);
    // this.LeaveFrom.controls.uploadDocument.updateValueAndValidity();

    // this.LeaveFrom.patchValue({
    //   uploadDocument: this.fileNamesDisplay,
    // });

    $("#cropperModal").modal('hide');

  }
  resetImage() {
    $('#file-upload').val('');
  }

  // FileChange(event: any, type: string) {
  //   const file: File = event.target.files?.[0];
  //   if (!file) return;
  //   this.fileNamesDisplay = file.name;
  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     this.imagePreviews = [e.target.result];
  //   };
  //   reader.readAsDataURL(file);
  //   this.fileList = [];
  //   this.formsData = new FormData();
  //   this.fileList.push({ file, type });
  //   this.formsData.append('files', file);
  //   this.formsData.append('type', type);    
  // }

  selectStartDate(event: any): void {
    const selectedDate = event.target.value;
    this.startDate = selectedDate;

    // if (this.endDate && this.endDate < this.startDate) {
    //   this.endDate = this.startDate;
    // }
  }

  selectEndDate(event: any): void {
    const selectedDate = event.target.value;
    this.endDate = selectedDate;

    // if (this.startDate && this.endDate < this.startDate) {
    //   alert("End date cannot be before start date.");
    //   this.endDate = this.startDate;
    // }

    // if (this.endDate) {
    //   this.getEmployeeLeave();
    // }
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'MM/dd/yyyy')!;
  }

  Onsearchclick() {
    this.getEmployeeLeave();
  }

  clearFilter() {
    this.formattedStartDate = '';
    this.formattedEndDate = '';
    this.startDate = '';
    this.endDate = '';
    this.SelectStartDate = '';
    this.SelectEndDate = '';
    this.leaveList = '';
    (
      document.getElementById('uniqueStartDatePicker') as HTMLInputElement
    ).value = '';
    (document.getElementById('uniqueEndDatePicker') as HTMLInputElement).value =
      '';
    this.getEmployeeLeave();
  }

  applyFilter() {
    const term = this.searchText.trim().toLowerCase();
    this.filteredApplyLeave = this.leaveList.filter(
      (item: any) =>
        item.firstName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term)
    );
    this.ContentP = 1;
  }

  get displayedApplyLeave() {
    return this.searchText?.trim() ? this.filteredApplyLeave : this.leaveList;
  }

  getTOCUserDetailByID(userid: any) {
    this.tocregistrationService.getTOCUserDetailByID(userid, this.daycareCentreId).subscribe(
      (data) => {
        if (data.message === 'ok') {
          this.TOCUserDetail = data.result;
          if (this.TOCUserDetail) {
            const workingDays = this.TOCUserDetail.workingDays
              ?.split(',')
              .map((id: string) => Number(id.trim()));
            // if (workingDays?.includes(this.selectedDayId)) {
            const SD = new Date(this.TOCUserDetail.partTimeStartDate);
            const ED = new Date(this.TOCUserDetail.partTimeEndDate);
            setTimeout(() => {
              this.initializeFlatpickrForTOCTeacher(SD, ED);
            });
          }
        } else {
          this.TOCUserDetail = [];
        }
      },
      (error) => {
        console.error('Error occurred while checking email:', error);
      }
    );
  }

  async getTocSlotbyUserid() {
    this.spinner.show();
    let data = await this.applyService
      .getTocSlotbyUserid(this.teacherID, this.daycareCentreId)
      .toPromise();
    if (data.message == 'OK') {
      setTimeout(() => {
        this.spinner.hide();
      }, 100);
      this.TocSlotList = data.result;
      // this.TocSlotList = this.TocSlotList.filter((x: { acceptedByUser: any; })=> x.acceptedByUser == this.daycareCentreId);
      const filteredWorkingDayIDs = this.TocSlotList.filter(
        (x: { acceptedByUser: any }) => x.acceptedByUser == this.daycareCentreId
      ).map((x: { workingDayID: any }) => x.workingDayID);
      this.teacherWeekDaysIDs = filteredWorkingDayIDs;

    } else {
      this.spinner.hide();
      this.TocSlotList = [];
      this.teacherWeekDaysIDs = [];
    }
  }

  async getEmployeeLeave() {
    try {
      this.skeletonShow = 'Skelton';

      if (this.startDate) {
        this.formattedStartDate = '';
        this.formattedEndDate = '';
      }

      this.SelectStartDate = this.startDate || this.formattedStartDate;
      this.SelectEndDate = this.endDate || this.formattedEndDate;

      const data = await this.applyService
        .getEmployeeLeave(
          this.teacherID,
          this.daycareCentreId,
          this.userRoleId,
          this.SelectStartDate,
          this.SelectEndDate
        )
        .toPromise();

      if (data.message !== 'OK') return;

      this.leaveList =
        this.userRoleId === 4 || this.userRoleId === 8 ? data.result
          : data.result.records;


      for (const leave of this.leaveList) {
        // Process profile photo
        if (this.userRoleId === 3) {
          leave.profileImage = [];

          if (this.isImage(leave?.profilePhoto)) {
            try {
              leave.profileImage.push(
                this.commonService.base64ToBlobUrl(leave.profilePhoto)
              );
            } catch (err) {
              console.error('Error processing profile image:', err);
            }
          }

          for (const l of leave?.leaves || []) {
            l.documentUrl = [];

            if (
              this.isImage(l?.leavesDocument) ||
              this.isPdf(l?.leavesDocument)
            ) {
              try {
                l.documentUrl.push(
                  this.commonService.base64ToBlobUrl(l.leavesDocument)
                );
              } catch (err) {
                console.error('Error processing leave document:', err);
              }
            }
          }
        } else {
          if (
            this.isImage(leave?.leavesDocument) ||
            this.isPdf(leave?.leavesDocument)
          ) {
            try {
              leave.documentUrl = this.commonService.base64ToBlobUrl(
                leave.leavesDocument
              );
            } catch (err) {
              console.error('Error processing leave document:', err);
            }
          }
        }
      }

      if (this.userRoleId === 4 || this.userRoleId === 3) {
        this.initializeFlatpickr2();
      } else if (this.userRoleId === 8) {
        this.initializeFlatpickrForTOCTeacher(new Date(), null);
      }

      this.skeletonShow = '';
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      this.skeletonShow = '';
    }
  }

  // getDisabledDates(): string[] {
  //   const disabledDates: string[] = [];
  //   this.leaveList.forEach((leave: any) => {
  //     const start = new Date(leave.startDate);
  //     const end = new Date(leave.endDate);
  //     for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  //       const clone = new Date(d); // prevent mutation
  //       const formatted = clone.getFullYear() + '-' +
  //         String(clone.getMonth() + 1).padStart(2, '0') + '-' +
  //         String(clone.getDate()).padStart(2, '0'); // format YYYY-MM-DD
  //       disabledDates.push(formatted);
  //     }
  //   });
  //   return [...new Set(disabledDates)];
  // }

  // getNextAvailableDate(disabledDates: string[]): string | null {
  //   const today = new Date();
  //   for (let i = 0; i < 365; i++) {
  //     const checkDate = new Date(today);
  //     checkDate.setDate(today.getDate() + i);
  //     const formatted = checkDate.toISOString().split('T')[0]; // always "YYYY-MM-DD"

  //     if (!disabledDates.includes(formatted)) {
  //       return formatted; // ✅ This is your true minDate
  //     }
  //   }
  //   return null;
  // }

  getDisabledDates(): Date[] {
    const disabledDates: Date[] = [];

    this.leaveList.forEach((leave: any) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        disabledDates.push(new Date(d)); // clone Date
      }
    });
    return disabledDates;
  }

  getNextAvailableDate(disabledDates: Date[]): Date | null {
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);

      const isDisabled = disabledDates.some(
        (disabled) =>
          disabled.getFullYear() === checkDate.getFullYear() &&
          disabled.getMonth() === checkDate.getMonth() &&
          disabled.getDate() === checkDate.getDate()
      );

      if (!isDisabled) {
        return checkDate;
      }
    }
    return null;
  }

  initializeFlatpickr2() {
    const today = new Date();
    const disabledDates = this.getDisabledDates();
    const minAvailableDate: Date | null =
      this.getNextAvailableDate(disabledDates);

    let mindate: Date | undefined;
    if (minAvailableDate) {
      mindate = new Date(minAvailableDate);
    } else {
      // console.warn('No available date found. Skipping date picker init.');
      return;
    }


    // if (this.startDatePickerInstance) this.startDatePickerInstance.destroy();
    // if (this.endDatePickerInstance) this.endDatePickerInstance.destroy();

    this.startDatePickerInstance = flatpickr('#startDatePicker', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      minDate: mindate,
      disable: disabledDates,
      onChange: (selectedDates, dateStr) => {
        this.LeaveFrom.get('startDate')?.setValue(dateStr);
        this.LeaveFrom.get('endDate')?.updateValueAndValidity();

        // const startDate = this.LeaveFrom.value.startDate;
        // const endDate = this.LeaveFrom.value.endDate;
        // if (startDate > endDate && endDate !== '') {
        //   this.LeaveFrom.patchValue({ startDate: null, endDate: null });
        // }
      },
      onDayCreate: (dObj, dStr, fp, dayElem) => {
        const date = dayElem.dateObj;
        const isDisabled = disabledDates.some(
          (disabled) =>
            disabled.getFullYear() === date.getFullYear() &&
            disabled.getMonth() === date.getMonth() &&
            disabled.getDate() === date.getDate()
        );

        if (isDisabled) {
          dayElem.classList.add('flatpickr-disabled-tooltip');
          dayElem.setAttribute('title', 'Leave already applied');
        }
      },
    });

    this.endDatePickerInstance = flatpickr('#endDatePicker', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      minDate: mindate,
      disable: disabledDates,
      onChange: (selectedDates, dateStr) => {
        this.LeaveFrom.get('endDate')?.setValue(dateStr);
        // const startDate = this.LeaveFrom.value.startDate;
        // const endDate = this.LeaveFrom.value.endDate;
        // if (startDate > endDate && startDate !== '') {
        //   this.LeaveFrom.patchValue({ endDate: null, startDate: null });
        // }
      },
      onDayCreate: (dObj, dStr, fp, dayElem) => {
        const date = dayElem.dateObj;
        const isDisabled = disabledDates.some(
          (disabled) =>
            disabled.getFullYear() === date.getFullYear() &&
            disabled.getMonth() === date.getMonth() &&
            disabled.getDate() === date.getDate()
        );

        if (isDisabled) {
          dayElem.classList.add('flatpickr-disabled-tooltip');
          dayElem.setAttribute('title', 'Leave already applied');
        }
      },
    });

    (
      document.getElementById('uniqueStartDatePicker') as HTMLInputElement
    ).value = this.SelectStartDate ? this.formatDate(this.SelectStartDate) : '';

    (document.getElementById('uniqueEndDatePicker') as HTMLInputElement).value =
      this.SelectEndDate ? this.formatDate(this.SelectEndDate) : '';

    this.uniqueStartDateInstance = flatpickr('#uniqueStartDatePicker', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      maxDate: today,
      defaultDate: this.SelectStartDate,
      onChange: (selectedDates: Date[]) => {
        this.uniqueSelectedStartDate = selectedDates[0];

        if (this.uniqueEndDateInstance) {
          this.uniqueEndDateInstance.set(
            'minDate',
            this.uniqueSelectedStartDate
          );
          this.uniqueEndDateInstance.set('maxDate', today);
        }
      },
    });

    this.uniqueEndDateInstance = flatpickr('#uniqueEndDatePicker', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      maxDate: today,
      defaultDate: this.SelectEndDate,
      onChange: (selectedDates: Date[]) => {
        this.uniqueSelectedEndDate = selectedDates[0];
      },
    });
  }

  initializeFlatpickrForTOCTeacher(
    startDate: Date | null,
    endDate: Date | null
  ) {
    const today = new Date();
    const disabledDates = this.getDisabledDates();
    const minAvailableDate: Date | null =
      this.getNextAvailableDate(disabledDates);

    let mindate: Date | undefined;
    if (minAvailableDate) {
      mindate = new Date(minAvailableDate);
    } else {
      // console.warn('No available date found. Skipping date picker init.');
      return;
    }


    if (
      this.startDatePickerInstance &&
      typeof this.startDatePickerInstance.destroy === 'function'
    ) {
      this.startDatePickerInstance.destroy();
    }

    if (
      this.endDatePickerInstance &&
      typeof this.endDatePickerInstance.destroy === 'function'
    ) {
      this.endDatePickerInstance.destroy();
    }

    this.startDatePickerInstance = flatpickr('#startDatePicker', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      // minDate: mindate,
      minDate: startDate || undefined,
      maxDate: endDate || undefined,
      disable: disabledDates,
      onChange: (selectedDates, dateStr) => {
        this.LeaveFrom.get('startDate')?.setValue(dateStr);
        this.LeaveFrom.get('endDate')?.updateValueAndValidity();

        // const startDate = this.LeaveFrom.value.startDate;
        // const endDate = this.LeaveFrom.value.endDate;
        // if (startDate > endDate && endDate !== '') {
        //   this.LeaveFrom.patchValue({ startDate: null, endDate: null });
        // }
      },
      onDayCreate: (dObj, dStr, fp, dayElem) => {
        const date = dayElem.dateObj;
        const isDisabled = disabledDates.some(
          (disabled) =>
            disabled.getFullYear() === date.getFullYear() &&
            disabled.getMonth() === date.getMonth() &&
            disabled.getDate() === date.getDate()
        );

        if (isDisabled) {
          dayElem.classList.add('flatpickr-disabled-tooltip');
          dayElem.setAttribute('title', 'Leave already applied');
        }
      },
    });

    this.endDatePickerInstance = flatpickr('#endDatePicker', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      // minDate: mindate,
      minDate: startDate || undefined,
      maxDate: endDate || undefined,
      disable: disabledDates,
      onChange: (selectedDates, dateStr) => {
        this.LeaveFrom.get('endDate')?.setValue(dateStr);

        // const startDate = this.LeaveFrom.value.startDate;
        // const endDate = this.LeaveFrom.value.endDate;
        // if (startDate > endDate && startDate !== '') {
        //   this.LeaveFrom.patchValue({ endDate: null, startDate: null });
        // }
      },
      onDayCreate: (dObj, dStr, fp, dayElem) => {
        const date = dayElem.dateObj;
        const isDisabled = disabledDates.some(
          (disabled) =>
            disabled.getFullYear() === date.getFullYear() &&
            disabled.getMonth() === date.getMonth() &&
            disabled.getDate() === date.getDate()
        );

        if (isDisabled) {
          dayElem.classList.add('flatpickr-disabled-tooltip');
          dayElem.setAttribute('title', 'Leave already applied');
        }
      },
    });

    (
      document.getElementById('uniqueStartDatePicker') as HTMLInputElement
    ).value = this.SelectStartDate;
    (document.getElementById('uniqueEndDatePicker') as HTMLInputElement).value =
      this.SelectEndDate;

    this.uniqueStartDateInstance = flatpickr('#uniqueStartDatePicker', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      maxDate: today,
      defaultDate: this.SelectStartDate,
      onChange: (selectedDates: Date[]) => {
        this.uniqueSelectedStartDate = selectedDates[0];

        if (this.uniqueEndDateInstance) {
          this.uniqueEndDateInstance.set(
            'minDate',
            this.uniqueSelectedStartDate
          );
          this.uniqueEndDateInstance.set('maxDate', today);
        }
      },
    });

    this.uniqueEndDateInstance = flatpickr('#uniqueEndDatePicker', {
      dateFormat: 'm/d/Y',
      allowInput: true,
      maxDate: today,
      defaultDate: this.SelectEndDate,
      onChange: (selectedDates: Date[]) => {
        this.uniqueSelectedEndDate = selectedDates[0];
      },
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

  // OnEdit(data: any, employeeLeaves: any) {
  //   // this.spinner.show();
  //   this.leaveID = data.id;
  //   this.LeaveFrom.patchValue({
  //     id: employeeLeaves.id,
  //     centreID: this.daycareCentreId,
  //     employeeId: data.id,
  //     startDate: this.datePipe.transform(
  //       employeeLeaves.startDate,
  //       'MM/dd/yyyy'
  //     ),
  //     endDate: this.datePipe.transform(employeeLeaves.endDate, 'MM/dd/yyyy'),
  //     typeOfLeave: employeeLeaves.typeOfLeave,
  //     reason: employeeLeaves.reason,
  //     uploadDocument: employeeLeaves.leavesDocument,
  //   });
  //   // this.spinner.hide();
  // }

  async OnEdit(rowData: any, employeeLeaves: any) {
    this.spinner.show();
    this.selectedTeacherRoleID = rowData.userRoleID;
    if (this.selectedTeacherRoleID == 4) {
      this.classroomDetailsService.getTeacherAvailability(Number(rowData.id), this.daycareCentreId)
        .subscribe((data) => {
          if (data.message === 'Ok') {
            this.teacherAvailabilityDays = data.result;
            $('#openModal').modal('show');
            this.leaveID = employeeLeaves.id;
            this.LeaveFrom.patchValue({
              id: employeeLeaves.id,
              centreID: this.daycareCentreId,
              employeeId: rowData.id,
              startDate: this.datePipe.transform(
                employeeLeaves.startDate,
                'MM/dd/yyyy'
              ),
              endDate: this.datePipe.transform(
                employeeLeaves.endDate,
                'MM/dd/yyyy'
              ),
              typeOfLeave: employeeLeaves.typeOfLeave,
              reason: employeeLeaves.reason,
              uploadDocument: employeeLeaves.leavesDocument,
            });

            const allowedStart = new Date(employeeLeaves.startDate);
            const allowedEnd = new Date(employeeLeaves.endDate);

            const disableOutsideRange = [
              function (date: Date) {
                return !(date >= allowedStart && date <= allowedEnd);
              },
            ];

            // START DATE PICKER
            this.startDatePickerInstance = flatpickr('#startDatePicker', {
              dateFormat: 'm/d/Y',
              allowInput: true,
              minDate: allowedStart,
              maxDate: allowedEnd,
              disable: disableOutsideRange,
              onChange: (selectedDates, dateStr) => {
                this.LeaveFrom.get('startDate')?.setValue(dateStr);
                this.LeaveFrom.get('endDate')?.updateValueAndValidity();
              },
              onDayCreate: (dObj, dStr, fp, dayElem) => {
                const date = dayElem.dateObj;
                if (!(date >= allowedStart && date <= allowedEnd)) {
                  dayElem.classList.add('flatpickr-disabled-tooltip');
                  dayElem.setAttribute(
                    'title',
                    'Date is outside the allowed range'
                  );
                }
              },
            });

            // END DATE PICKER
            this.endDatePickerInstance = flatpickr('#endDatePicker', {
              dateFormat: 'm/d/Y',
              allowInput: true,
              minDate: allowedStart,
              maxDate: allowedEnd,
              disable: disableOutsideRange,
              onChange: (selectedDates, dateStr) => {
                this.LeaveFrom.get('endDate')?.setValue(dateStr);
              },
              onDayCreate: (dObj, dStr, fp, dayElem) => {
                const date = dayElem.dateObj;
                if (!(date >= allowedStart && date <= allowedEnd)) {
                  dayElem.classList.add('flatpickr-disabled-tooltip');
                  dayElem.setAttribute(
                    'title',
                    'Date is outside the allowed range'
                  );
                }
              },
            });
            this.spinner.hide();
          } else {
            this.teacherAvailabilityDays = [];
            this.toastr.warning('No record found');
            this.spinner.hide();
          }
        });
    } else {
      try {
        const data = await this.applyService
          .getTocSlotbyUserid(rowData.id, this.daycareCentreId)
          .toPromise();
        if (data?.message === 'OK' && data.result) {
          this.TocSlotList = data.result;
          $('#openModal').modal('show');
          this.teacherWeekDaysIDs = this.TocSlotList.filter(
            (x: { acceptedByUser: any }) =>
              x.acceptedByUser == this.daycareCentreId
          ).map((x: { workingDayID: any }) => x.workingDayID);
          this.leaveID = employeeLeaves.id;
          this.LeaveFrom.patchValue({
            id: employeeLeaves.id,
            centreID: this.daycareCentreId,
            employeeId: rowData.id,
            startDate: this.datePipe.transform(
              employeeLeaves.startDate,
              'MM/dd/yyyy'
            ),
            endDate: this.datePipe.transform(
              employeeLeaves.endDate,
              'MM/dd/yyyy'
            ),
            typeOfLeave: employeeLeaves.typeOfLeave,
            reason: employeeLeaves.reason,
            uploadDocument: employeeLeaves.leavesDocument,
          });
          // Setup allowed date range
          const allowedStart = new Date(employeeLeaves.startDate);
          const allowedEnd = new Date(employeeLeaves.endDate);

          const disableOutsideRange = [
            (date: Date) => !(date >= allowedStart && date <= allowedEnd),
          ];

          // Initialize START date picker
          this.startDatePickerInstance = flatpickr('#startDatePicker', {
            dateFormat: 'm/d/Y',
            allowInput: true,
            minDate: allowedStart,
            maxDate: allowedEnd,
            disable: disableOutsideRange,
            onChange: (selectedDates, dateStr) => {
              this.LeaveFrom.get('startDate')?.setValue(dateStr);
              this.LeaveFrom.get('endDate')?.updateValueAndValidity();
            },
            onDayCreate: (dObj, dStr, fp, dayElem) => {
              const date = dayElem.dateObj;
              if (!(date >= allowedStart && date <= allowedEnd)) {
                dayElem.classList.add('flatpickr-disabled-tooltip');
                dayElem.setAttribute(
                  'title',
                  'Date is outside the allowed range'
                );
              }
            },
          });

          // Initialize END date picker
          this.endDatePickerInstance = flatpickr('#endDatePicker', {
            dateFormat: 'm/d/Y',
            allowInput: true,
            minDate: allowedStart,
            maxDate: allowedEnd,
            disable: disableOutsideRange,
            onChange: (selectedDates, dateStr) => {
              this.LeaveFrom.get('endDate')?.setValue(dateStr);
            },
            onDayCreate: (dObj, dStr, fp, dayElem) => {
              const date = dayElem.dateObj;
              if (!(date >= allowedStart && date <= allowedEnd)) {
                dayElem.classList.add('flatpickr-disabled-tooltip');
                dayElem.setAttribute(
                  'title',
                  'Date is outside the allowed range'
                );
              }
            },
          });
          this.spinner.hide();
        } else {
          this.toastr.warning('No record found');
          this.TocSlotList = [];
          this.teacherWeekDaysIDs = [];
          this.spinner.hide();
        }
      } catch (error) {
        this.spinner.hide();
        console.error('Error fetching TOC slots:', error);
        this.TocSlotList = [];
        this.teacherWeekDaysIDs = [];
      } finally {
        this.spinner.hide();
      }
    }
  }

  openPreview(url: string, type: 'image' | 'pdf') {
    this.previewUrl = url;
    this.previewType = type;
    this.isClosing = false;
  }

  closePreview() {
    this.isClosing = true;
    setTimeout(() => {
      this.previewUrl = null;
      this.previewType = null;
      this.isClosing = false;
    }, 300); // match animation duration
  }

  isImage(url: string): boolean {
    return !!url && url.startsWith('data:image');
  }

  isPdf(url: string): boolean {
    return !!url && url.startsWith('data:application/pdf');
  }

  // getLeaveTypeList() {
  //   this.spinner.show();
  //   const userRoleId = parseInt(this.cookie.get('UserRoleId'), 10);
  //   const userType = userRoleId === 1 ? 'super-admin' : 'daycare-admin';
  //   this.leaveTypeService
  //     .getLeaveList(this.daycareCentreId, userType)
  //     .pipe(finalize(() => this.spinner.hide()))
  //     .subscribe({
  //       next: (response) => {
  //         this.leaveTypeList = response.result.filter(
  //           (x: { isActive: boolean }) => x.isActive
  //         );
  //       },
  //       error: (err) => {
  //         this.toastr.error(err.message);
  //       },
  //     });
  // }

  getLeaveTypeList() {
    const userRoleId = parseInt(this.cookie.get('UserRoleId'), 10);
    const userType = userRoleId === 1 ? 'super-admin' : 'daycare-admin';

    this.leaveTypeService
      .getLeaveList(this.daycareCentreId, userType)
      .subscribe(
        (response) => {
          this.leaveTypeList = response.result;
        },
        (error) => {
          this.toastr.error(error.message);
        }
      );
  }

  getteacherAvailability() {
    this.classroomDetailsService.getTeacherAvailability(Number(this.teacherID), this.daycareCentreId).subscribe((data) => {
      if ((data.message = 'Ok')) {
        this.teacherAvailabilityDays = data.result;
      } else {
        this.teacherAvailabilityDays = [];
      }
    });
  }

  getDaycareWorkTimingByCentreID() {
    this.classroomDetailsService
      .getCentreWorkingDaysByCentreID(this.daycareCentreId)
      .subscribe((item: any) => {
        if (item.message == 'Success') {
          let keys = Object.keys(item.result);
          keys.forEach((element: any) => {
            this.workTiming[element] = item.result[element];
          });
        }
      });
  }

  onstartDateChange(event: any) {
    const date = new Date(event.target.value);
    const jsDay = date.getDay();
    const dayId = jsDay === 0 ? 7 : jsDay;

    let startDate = this.LeaveFrom.value.startDate;
    let endDate = this.LeaveFrom.value.endDate;

    // if (startDate > endDate && endDate != '') {
    //   this.LeaveFrom.patchValue({
    //     startDate: null,
    //     endDate: null,
    //   });
    // }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start && end && start > end) {
      this.toastr.warning('Start Date cannot be later than End Date.');
      this.LeaveFrom.patchValue({ startDate: null });
      $('.startdateRangePicker').val(null);
      return;
    }

    if (this.userRoleId == 8) {
      if (!this.teacherWeekDaysIDs.includes(dayId)) {
        this.toastr.warning(
          'You are not available for selected Day care centre'
        );
        $('.startdateRangePicker').val(null);
        return;
      }
    }

    if (!this.teacherAvailabilityDays.includes(dayId)) {
      this.toastr.warning('Selected day is not available for the teacher.');
      $('.startdateRangePicker').val(null);
      return;
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
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'mon':
        if (this.workTiming.mon == true) {
          this.currentDayTiming.startTime = this.workTiming.monStartTime;
          this.currentDayTiming.endTime = this.workTiming.monEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'tues':
        if (this.workTiming.tues == true) {
          this.currentDayTiming.startTime = this.workTiming.tuesStartTime;
          this.currentDayTiming.endTime = this.workTiming.tuesEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'wed':
        if (this.workTiming.wed == true) {
          this.currentDayTiming.startTime = this.workTiming.wedStartTime;
          this.currentDayTiming.endTime = this.workTiming.wedEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'thu':
        if (this.workTiming.thu == true) {
          this.currentDayTiming.startTime = this.workTiming.thuStartTime;
          this.currentDayTiming.endTime = this.workTiming.thuEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'fri':
        if (this.workTiming.fri == true) {
          this.currentDayTiming.startTime = this.workTiming.friStartTime;
          this.currentDayTiming.endTime = this.workTiming.friEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'sat':
        if (this.workTiming.sat == true) {
          this.currentDayTiming.startTime = this.workTiming.satStartTime;
          this.currentDayTiming.endTime = this.workTiming.satEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;
    }
  }

  onendDateChange(event: any) {
    const date = new Date(event.target.value);
    const jsDay = date.getDay();
    const dayId = jsDay === 0 ? 7 : jsDay;

    let startDate1 = this.LeaveFrom.value.startDate;
    let endDate1 = this.LeaveFrom.value.endDate;

    // if (startDate1 > endDate1 && startDate1 != '') {
    //   this.LeaveFrom.patchValue({
    //     endDate: null,
    //     startDate: null,
    //   });
    // }

    const start = new Date(startDate1);
    const end = new Date(endDate1);

    if (start && end && start > end) {
      this.toastr.warning('End Date cannot be earlier than Start Date.');
      this.LeaveFrom.patchValue({ endDate: null });
      $('.enddateRangePicker').val(null);
      return;
    }

    if (this.userRoleId == 8) {
      if (!this.teacherWeekDaysIDs.includes(dayId)) {
        this.toastr.warning(
          'You are not available for selected Day care centre'
        );
        $('.enddateRangePicker').val(null);
        return;
      }
    }

    if (!this.teacherAvailabilityDays.includes(dayId)) {
      this.toastr.warning('Selected day is not available for the teacher.');
      $('.enddateRangePicker').val(null);
      return;
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
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'mon':
        if (this.workTiming.mon == true) {
          this.currentDayTiming.startTime = this.workTiming.monStartTime;
          this.currentDayTiming.endTime = this.workTiming.monEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'tues':
        if (this.workTiming.tues == true) {
          this.currentDayTiming.startTime = this.workTiming.tuesStartTime;
          this.currentDayTiming.endTime = this.workTiming.tuesEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'wed':
        if (this.workTiming.wed == true) {
          this.currentDayTiming.startTime = this.workTiming.wedStartTime;
          this.currentDayTiming.endTime = this.workTiming.wedEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'thu':
        if (this.workTiming.thu == true) {
          this.currentDayTiming.startTime = this.workTiming.thuStartTime;
          this.currentDayTiming.endTime = this.workTiming.thuEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'fri':
        if (this.workTiming.fri == true) {
          this.currentDayTiming.startTime = this.workTiming.friStartTime;
          this.currentDayTiming.endTime = this.workTiming.friEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'sat':
        if (this.workTiming.sat == true) {
          this.currentDayTiming.startTime = this.workTiming.satStartTime;
          this.currentDayTiming.endTime = this.workTiming.satEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;
    }
    const startDate = new Date(this.LeaveFrom.value.startDate);
    const endDate = new Date(event.target.value);
    if (startDate && endDate && startDate <= endDate) {
      const availableLeaveDays = this.getAvailableLeaveDays(startDate, endDate);
      this.LeaveFrom.patchValue({ appliedLeaveDays: availableLeaveDays });
    }
  }

  // getAvailableLeaveDays(start: Date, end: Date): number {
  //   let count = 0;
  //   const dayList = this.teacherAvailabilityDays; // e.g. [1,2,3,4,5] for Mon–Fri

  //   const current = new Date(start);
  //   while (current <= end) {
  //     const jsDay = current.getDay();
  //     const dayId = jsDay === 0 ? 7 : jsDay; // Sunday = 7

  //     if (dayList.includes(dayId)) {
  //       count++;
  //     }
  //     current.setDate(current.getDate() + 1);
  //   }
  //   return count;
  // }

  onstartDateChangeUpdate(event: any) {
    const date = new Date(event.target.value);
    const jsDay = date.getDay();
    const dayId = jsDay === 0 ? 7 : jsDay;

    let startDate = this.LeaveFrom.value.startDate;
    let endDate = this.LeaveFrom.value.endDate;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start && end && start > end) {
      this.toastr.warning('Start Date cannot be later than End Date.');
      this.LeaveFrom.patchValue({ startDate: null });
      $('.startdateRangePicker').val(null);
      return;
    }

    if (this.selectedTeacherRoleID == 8) {
      if (!this.teacherWeekDaysIDs.includes(dayId)) {
        this.toastr.warning('Teacher not available for selected Day');
        $('.startdateRangePicker').val(null);
        return;
      }
    }

    if (!this.teacherAvailabilityDays.includes(dayId)) {
      this.toastr.warning('Selected day is not available for the teacher.');
      $('.startdateRangePicker').val(null);
      return;
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
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'mon':
        if (this.workTiming.mon == true) {
          this.currentDayTiming.startTime = this.workTiming.monStartTime;
          this.currentDayTiming.endTime = this.workTiming.monEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'tues':
        if (this.workTiming.tues == true) {
          this.currentDayTiming.startTime = this.workTiming.tuesStartTime;
          this.currentDayTiming.endTime = this.workTiming.tuesEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'wed':
        if (this.workTiming.wed == true) {
          this.currentDayTiming.startTime = this.workTiming.wedStartTime;
          this.currentDayTiming.endTime = this.workTiming.wedEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'thu':
        if (this.workTiming.thu == true) {
          this.currentDayTiming.startTime = this.workTiming.thuStartTime;
          this.currentDayTiming.endTime = this.workTiming.thuEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'fri':
        if (this.workTiming.fri == true) {
          this.currentDayTiming.startTime = this.workTiming.friStartTime;
          this.currentDayTiming.endTime = this.workTiming.friEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'sat':
        if (this.workTiming.sat == true) {
          this.currentDayTiming.startTime = this.workTiming.satStartTime;
          this.currentDayTiming.endTime = this.workTiming.satEndTime;
        } else {
          this.currentDayTiming = {};
          $('.startdateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;
    }
  }

  onendDateChangeUpdate(event: any) {
    const date = new Date(event.target.value);
    const jsDay = date.getDay();
    const dayId = jsDay === 0 ? 7 : jsDay;

    let startDate1 = this.LeaveFrom.value.startDate;
    let endDate1 = this.LeaveFrom.value.endDate;

    const start = new Date(startDate1);
    const end = new Date(endDate1);

    if (start && end && start > end) {
      this.toastr.warning('End Date cannot be earlier than Start Date.');
      this.LeaveFrom.patchValue({ endDate: null });
      $('.enddateRangePicker').val(null);
      return;
    }

    if (this.selectedTeacherRoleID == 8) {
      if (!this.teacherWeekDaysIDs.includes(dayId)) {
        this.toastr.warning('Teacher not available for selected Day');
        $('.enddateRangePicker').val(null);
        return;
      }
    }

    if (!this.teacherAvailabilityDays.includes(dayId)) {
      this.toastr.warning('Selected day is not available for the teacher.');
      $('.enddateRangePicker').val(null);
      return;
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
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'mon':
        if (this.workTiming.mon == true) {
          this.currentDayTiming.startTime = this.workTiming.monStartTime;
          this.currentDayTiming.endTime = this.workTiming.monEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'tues':
        if (this.workTiming.tues == true) {
          this.currentDayTiming.startTime = this.workTiming.tuesStartTime;
          this.currentDayTiming.endTime = this.workTiming.tuesEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'wed':
        if (this.workTiming.wed == true) {
          this.currentDayTiming.startTime = this.workTiming.wedStartTime;
          this.currentDayTiming.endTime = this.workTiming.wedEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'thu':
        if (this.workTiming.thu == true) {
          this.currentDayTiming.startTime = this.workTiming.thuStartTime;
          this.currentDayTiming.endTime = this.workTiming.thuEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'fri':
        if (this.workTiming.fri == true) {
          this.currentDayTiming.startTime = this.workTiming.friStartTime;
          this.currentDayTiming.endTime = this.workTiming.friEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;

      case 'sat':
        if (this.workTiming.sat == true) {
          this.currentDayTiming.startTime = this.workTiming.satStartTime;
          this.currentDayTiming.endTime = this.workTiming.satEndTime;
        } else {
          this.currentDayTiming = {};
          $('.enddateRangePicker').val(null);
          this.toastr.error('The daycare is not operating today');
        }
        break;
    }
    const startDate = new Date(this.LeaveFrom.value.startDate);
    const endDate = new Date(event.target.value);
    if (startDate && endDate && startDate <= endDate) {
      const availableLeaveDays = this.getAvailableLeaveDays(startDate, endDate);
      this.LeaveFrom.patchValue({ appliedLeaveDays: availableLeaveDays });
    }
  }

  getAvailableLeaveDays(start: Date, end: Date): number {
    let count = 0;
    const availableDays = this.teacherAvailabilityDays; // e.g., [1 (Mon), 2 (Tue), ..., 7 (Sun)]
    const disabledDates = this.getDisabledDates(); // e.g., ['2025-06-25', '2025-06-26', ...]
    const current = new Date(start);
    while (current <= end) {
      const jsDay = current.getDay();
      const dayId = jsDay === 0 ? 7 : jsDay; // Adjust Sunday to 7

      const formattedDate = current.toISOString().split('T')[0];
      const disabledDateStrings = disabledDates.map(
        (d) => d.toISOString().split('T')[0]
      );
      if (
        availableDays.includes(dayId) && // ✅ Day is available for teacher
        !disabledDateStrings.includes(formattedDate) // ✅ Not already applied for leave
      ) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
}
