import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ProfileService } from '../../common-component/profile/profile.service';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { NgxSpinnerService } from 'ngx-spinner';
import { DayCareDashboardService } from '../../day-care-management/daycare-dashboard/day-care-dashboard.service';
import { DatePipe, CommonModule } from '@angular/common';
import { CommonService } from '../../common-component/common.service';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";
@Component({
  selector: 'app-teachers-journey',

  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  providers: [DatePipe],
  templateUrl: './teachers-journey.component.html',
  styleUrls: ['./teachers-journey.component.css'],
})
export class TeachersJourneyComponent {
  profileData: any;
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  id: any;
  transferRecordList: any;
  skeletonShow = 'Skelton';
  skeltoncardShow = 'Skeltoncard';

  constructor(
    private spinner: NgxSpinnerService,
    private profileService: ProfileService,
    private activatedRoute: ActivatedRoute,
    private DayCareDashBoard: DayCareDashboardService,
    private renderer: Renderer2,
    private el: ElementRef,
    private datePipe: DatePipe,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const encryptedId = params['id'];

      if (encryptedId) {
        const bytes = CryptoJS.AES.decrypt(encryptedId, environment.secretKey);
        const decryptedId = bytes.toString(CryptoJS.enc.Utf8);
        this.id = decryptedId;
        this.getProfileDetails();
      }
    });

    this.getStaffTransferedDetailsByCentreID();
  }

  getStaffTransferedDetailsByCentreID() {
    // this.spinner.show();

    this.DayCareDashBoard.getStaffTransferedDetailsTeacherID(
      parseInt(this.id),
      3
    ).subscribe((item: any) => {
      if (item.message == 'Success') {
        this.transferRecordList = item.result;
      } else if (item.message == 'No record found') {
      }
    });
  }

  getS3FileName(fileName: any) {
    this.commonService.getS3FileByName(fileName).subscribe(
      (blob: Blob) => {
        const imageUrl = URL.createObjectURL(blob);
        return imageUrl;
      },
      (error) => {
        console.error('Failed to fetch S3 image', error);
      }
    );
  }

  getProfileDetails() {
    this.skeletonShow = 'Skelton';
    this.profileService.GetUserById(this.id, 4).subscribe(
      async (response) => {
        if (response.message === 'Success' && response.result) {
          let finalImage = response.result.s3ImageUrl
            ? this.commonService.convertS3File(response.result.s3ImageUrl)
            : '';

          this.profileData = response.result;
          this.profileData['s3Url'] = finalImage;
            this.skeletonShow = '';

       
        } else {
          console.warn('Profile data not found.');
            this.skeletonShow = '';

        }
      },
      (error) => {
        console.error('Error fetching profile details:', error);
            this.skeletonShow = '';

      }
    );
  }
}
