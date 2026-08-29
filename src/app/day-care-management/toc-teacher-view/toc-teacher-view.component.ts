import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TocTeacherViewService } from './toc-teacher-view.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { TimeFormatPipe } from '../../bloomvie-management/dc-appointments-list/time-format.pipe';
import { TocRegistrationService } from '../../toc-registration/toc-registration.service';
import { environment } from '../../../environments/environment';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-toc-teacher-view',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    NgxPaginationModule,
    CommonModule,
    TimeFormatPipe,
    NgSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './toc-teacher-view.component.html',
  styleUrl: './toc-teacher-view.component.css',
})
export class TocTeacherViewComponent {
  private CentreID: number = 0;
  public tocTeacher: any[] = [];
  public TocDetail: any;
  readonly ImageRootURL = environment.apiUrl.slice(0, -3);
  qualification: any[] = [];
  expertise: any[] = [];
  documentType: any[] = [];
  contentPerPage: number = 5;
  currentPage: number = 1;
  tocClassTeacherAssignmentForm: any;
  masterDays: any[] = [];
  public classList: any[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private tocTeacherViewService: TocTeacherViewService,
    private cookie: CookieService,
    private TocRegistrationService: TocRegistrationService,
    private fb: FormBuilder
  ) {
    this.tocClassTeacherAssignmentForm = this.fb.group({
      classID: [0, [Validators.required]],
      teacherID: [0, [Validators.required]],
      teacherName: [''],
    });
  }

  async ngOnInit() {
    this.CentreID = parseInt(this.cookie.get('CentreID'));
    await this.getAllApprovedTocTeacher();
    await this.getAllQualification();
    await this.getAllAreaOfExpertise();
    await this.getAllDocumentType();
    await this.getAllDays();
  }

  async getAllApprovedTocTeacher() {
    this.spinner.show();
    let data = await this.tocTeacherViewService
      .getALlTocApprovedTeacher(this.CentreID)
      .toPromise();
    if (data.message == 'Success') {
      this.tocTeacher = data.result;
      setTimeout(() => {
        this.spinner.hide();
      }, 100);
    } else {
      this.tocTeacher = [];
      this.spinner.hide();
    }
  }

  getQualificationName(qualification: string) {
    let qualificationArray = qualification.split(',').map((num) => Number(num));
    let qualificationName = '';
    this.qualification.forEach((item: any) => {
      if (
        qualificationArray.includes(item.id) &&
        qualificationArray.length > 1
      ) {
        qualificationName = qualificationName
          ? qualificationName
          : '' + ' ' + item.name;
      } else if (qualificationArray.includes(item.id)) {
        qualificationName = item.name;
      }
    });
    return qualificationName;
  }

  getExpertiseName(xpertise: string) {
    let expertiseArray = xpertise.split(',').map((num) => Number(num));
    let expertiseName = '';
    this.expertise.forEach((item: any) => {
      if (expertiseArray.includes(item.id) && expertiseArray.length > 1) {
        expertiseName = expertiseName ? expertiseName : '' + ' ' + item.name;
      } else if (expertiseArray.includes(item.id)) {
        expertiseName = item.name;
      }
    });
    return expertiseName;
  }

  // viewFile(fileUrl: any) {
  //   const link = document.createElement('a');
  //   link.href = fileUrl;
  //   link.target = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
  //   link.click();
  // }

  downloadFile(fileUrl: string): void {
    const link = document.createElement('a');
    fetch(fileUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;

        link.download = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Download failed:', error);
      });
  }

  async getAllDays() {
    let data = await this.tocTeacherViewService.getAllDays().toPromise();
    if (data.message == 'Success') {
      this.masterDays = data.result;
    }
  }

  async getAllQualification() {
    let data =
      await this.TocRegistrationService.getQualifications().toPromise();
    if (data.message == 'OK') {
      this.qualification = data.result;
    }
  }

  async getAllAreaOfExpertise() {
    let data =
      await this.TocRegistrationService.getAllAreaOfExpertise().toPromise();
    if (data.message == 'Success') {
      this.expertise = data.result;
    }
  }

  async getAllDocumentType() {
    let data =
      await this.TocRegistrationService.getDocumentTypeList().toPromise();
    if (data.message == 'OK') {
      this.documentType = data.result;
    }
  }

  async getTocUserDetailsByID(toc: any) {
    this.spinner.show();
    let data = await this.TocRegistrationService.getTOCUserDetailByID(
      toc.userID,this.CentreID
    ).toPromise();
    if (data.message == 'ok') {
      setTimeout(() => {
        this.spinner.hide();
      }, 100);
      this.TocDetail = data.result;
      this.TocDetail.workingDaysNames = toc.workingDayName;
      this.TocDetail.qualificationName = this.getQualificationName(
        this.TocDetail.qualification
      );
      this.TocDetail.expertiseName = this.getExpertiseName(
        this.TocDetail.expertise
      );
      let documentInfo = this.documentType.find(
        (item: any) => item.id == this.TocDetail.uploadedDocumentType
      );
      this.TocDetail.documentTypeNames = documentInfo.documentType;
      $('#view-del').modal('show');
    } else {
      this.spinner.hide();
    }
  }

  getDayID(DayName: string): number {
    let dayDetails = this.masterDays.find(
      (item: any) => item.day.toLowerCase() == DayName.toLowerCase()
    );

    return dayDetails != undefined ? dayDetails.id : 0;
  }

  async displayClassAssignment(tocTeacherRecord: any) {
    let dayID: number = this.getDayID(tocTeacherRecord.workingDayName);
    if (dayID > 0) {
      const classTimingsBO = {
        centreID: this.CentreID,
        dayID: dayID,
        startTime: tocTeacherRecord.slotStartTime,
        endTime: tocTeacherRecord.slotEndTime,
      };
      this.spinner.show();
      let data = await this.tocTeacherViewService
        .getAllClassesByTimings(classTimingsBO)
        .toPromise();
      if (data.message == 'Success') {
        this.classList = data.result;
        setTimeout(() => {
          this.spinner.hide();
        }, 100);
        this.tocClassTeacherAssignmentForm.patchValue({
          teacherName: tocTeacherRecord.teacherName,
          teacherID: tocTeacherRecord.userID,
        });

        $('#exampleModal2').modal('show');
      } else {
        this.spinner.hide();
        this.toastr.warning(data.message);
      }
    } else {
      this.toastr.warning('day Does not Exists!!');
    }
  }
}
