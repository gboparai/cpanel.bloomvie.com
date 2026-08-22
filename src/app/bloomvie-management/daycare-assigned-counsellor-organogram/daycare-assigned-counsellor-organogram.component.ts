import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { AssignUserPermissionService } from '../../settings/Permission/assign-user-permission/assign-user-permission.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment.development';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonService } from '../../common-component/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'app-daycare-assigned-counsellor-organogram',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, NgxPaginationModule, FormsModule, SkeletonLoaderComponent],
  templateUrl: './daycare-assigned-counsellor-organogram.component.html',
  styleUrl: './daycare-assigned-counsellor-organogram.component.css',
})
export class DaycareAssignedCounsellorOrganogramComponent implements OnInit {
  id: any;
  DCCList: any;
  Counsellor: any;
  Dcc: any;
  ContentP: number = 1;
  ContentSize: number = 6;
  UserRoleId: any;
  // skeletonShow: string = 'Skelton';

  skeletonShow: 'Skelton' | 'NoRecord' | '' = 'Skelton';
  isLoading = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private service: AssignUserPermissionService,
    private toastr: ToastrService,
    private router: Router,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private cookie: CookieService
  ) { }

  ngOnInit(): void {


    this.UserRoleId = this.cookie.get('UserRoleId')

    if (this.UserRoleId == 6) {
      const UserID = this.cookie.get('UserId')
      this.id = UserID;
      this.GetCounsellor();
    } else {
      this.activatedRoute.queryParams.subscribe((params) => {
        const encryptedId = params['id'];
        if (encryptedId) {
          // const bytes = CryptoJS.AES.decrypt(encryptedId, environment.secretKey);
          // const decryptedId = bytes.toString(CryptoJS.enc.Utf8);
          const decryptedId = this.commonService.decrypt(encryptedId)
          this.id = decryptedId;
          this.GetCounsellor();
        }
      });
    }



  }
  async GetCounsellor(): Promise<void> {
    try {
      const counsellorId = Number(this.id);
      const response = await this.service.getassignedDcc(counsellorId).toPromise();
      const result = response.result;

      this.Counsellor = result.counsellor;
      this.Dcc = result.dcCs || [];

      // Convert counsellor profile photo
      if (this.Counsellor?.profilePhoto) {
        this.Counsellor.profilePhoto = this.commonService.convertS3File(this.Counsellor.profilePhoto);
      }

      // Convert DCC profile photos
      this.Dcc.forEach((dcc: any) => {
        if (dcc.profilePhoto) {
          dcc.profilePhoto = this.commonService.convertS3File(dcc.profilePhoto);
        }
      });

      // Format counsellor full name
      this.Counsellor.fullName = [
        this.Counsellor.counsellorFirstName,
        this.Counsellor.counsellorMiddleName,
        this.Counsellor.counsellorLastName,
      ].filter(n => n?.trim()).join(' ');

      // 🔹 Set displayedDcc
      // this.displayedDcc = this.Dcc;

      // 🔹 Handle skeleton display
      this.skeletonShow = this.displayedDcc.length === 0 ? 'NoRecord' : '';
      this.skeletonShow = this.Counsellor.length === 0 ? 'NoRecord' : '';

    } catch (err) {
      console.error('Error:', err);
      this.skeletonShow = 'NoRecord';
      this.Dcc = [];
      // this.displayedDcc = [];
    }
  }



  goBack(): void {
    this.router.navigate(['/daycare-assignment-counsellor']);
  }

  onPageChange(page: number): void {
    this.ContentP = page;
  }

  public searchText: string = '';
  filteredDcc: any[] = [];

  applyFilter() {
    const term = this.searchText.trim().toLowerCase();
    this.skeletonShow = this.displayedDcc.length === 0 ? 'NoRecord' : '';
    this.filteredDcc = this.Dcc.filter(
      (item: any) =>
        item.dcCname?.toLowerCase().includes(term) ||
        item.dccEmail?.toLowerCase().includes(term) ||
        item.ownerName?.toLowerCase().includes(term)
    );

    this.ContentP = 1;
  }


  get displayedDcc() {
    return this.searchText?.trim() ? this.filteredDcc : this.Dcc;
  }
}
