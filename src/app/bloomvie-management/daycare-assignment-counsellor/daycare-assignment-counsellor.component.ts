import { Component, OnInit } from '@angular/core';
import { AssignUserPermissionService } from '../../settings/Permission/assign-user-permission/assign-user-permission.service';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { CommonService } from '../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TooltipComponent } from '../../common-component/tooltip/tooltip.component';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";
@Component({
  selector: 'app-daycare-assignment-counsellor',
  standalone: true,
  imports: [
    NgxPaginationModule,
    RouterLink,
    RouterOutlet,
    CommonModule,
    TooltipComponent,
    BreadcrumbComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './daycare-assignment-counsellor.component.html',
  styleUrl: './daycare-assignment-counsellor.component.css',
})
export class DaycareAssignmentCounsellorComponent implements OnInit {
  EmployeeRoleList: any;
  currentPage: number = 1; // Current page number
  itemsPerPage: number = 5; // Maximum rows per page
  totalCount: number = 0;
  readonly rootUrl = environment.apiUrl.slice(0, -3);
  showBanner = true;
  hoveredRow: any = null;
  skeletonShow = "Skelton";
  constructor(
    private service: AssignUserPermissionService,
    private toastr: ToastrService,
    private router: Router,
    private commonService: CommonService,
    private spinner: NgxSpinnerService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.GetCounsellor();
  }

  async GetCounsellor(): Promise<void> {


    try {
      this.skeletonShow = 'Skelton';
      const response = await this.service.getEmployeeRole(6, true).toPromise();
      if (response?.result) {
        this.EmployeeRoleList = response.result.map((item: any) => {
          return {
            ...item,
            S3Url: item.s3ImageUrl
              ? this.commonService.convertS3File(item.s3ImageUrl)
              : '',
          };
        });
        this.totalCount = this.EmployeeRoleList.length || 0;
        this.skeletonShow = '';
      }
    } catch (err: any) {
      this.EmployeeRoleList = [];
      this.totalCount = 0;
      this.toastr.error('Failed to fetch employee roles.');
      console.error('Error fetching employee roles:', err);
      this.skeletonShow = '';
    }
  }

  closeBanner() {
    this.showBanner = false;
  }

  DayCareOrganogram(id: any) {
    // const encryptedId = CryptoJS.AES.encrypt(
    //   id.toString(),
    //   environment.secretKey
    // ).toString();
    const encryptedId = this.commonService.encrypt(id.toString());
    this.router.navigate(['/daycare-assigned-counsellor-organogram'], {
      queryParams: { id: encryptedId },
    });
  }
}
