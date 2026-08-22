import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../common-component/breadcrumb/breadcrumb.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ManageClassroomService } from '../manage-classroom/manage-classroom.service';
import { CommonModule } from '@angular/common';
import { EventEmitter, Output } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonService } from '../../../common-component/common.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TimeFormatAmPmPipe } from '../../../bloomvie-management/dc-appointments-list/time-format.pipe';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { SkeletonLoaderComponent } from "../../../common-component/skeleton-loader/skeleton-loader.component";

interface PaginationConfig {
  itemsPerPage: number;
  currentPage: number;
  id: string;
  total: number;
}

@Component({
  selector: 'app-view-classroom',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    TimeFormatAmPmPipe,
    SkeletonLoaderComponent
  ],
  templateUrl: './view-classroom.component.html',
  styleUrl: './view-classroom.component.css',
})
export class ViewClassroomComponent implements OnInit {
  @Output() dataFromChild = new EventEmitter<any>();
  public centreID: number = 0;
  public classList: any[] = [];
  public sectionlist: any[] = [];
  public paginationConfig: PaginationConfig = {
    itemsPerPage: 5,
    currentPage: 1,
    total: 0,
    id: 'class_grid',
  };
  private loginUserID: number = 0;
  UserRoleID: number = 0;
  filteredclassroom: any;
  public searchText: string = '';
  public isLoading: boolean = true;
  skeletonShow = 'Skelton';
  skeletonShow2 = '';


  constructor(
    private cookie: CookieService,
    private classService: ManageClassroomService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }
  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      let enc_id: any = params.get('enc_id');
      if (enc_id) {
        const decryptedId = this.commonService.decrypt(enc_id);
        this.centreID =
          decryptedId && !isNaN(Number(decryptedId))
            ? parseInt(decryptedId, 10)
            : 0;
      } else if (this.cookie.check('CentreID')) {
        this.centreID = parseInt(this.cookie.get('CentreID'));
      }
      if (this.centreID) {
        if (this.cookie.check('UserId')) {
          this.loginUserID = parseInt(this.cookie.get('UserId'));
          if (this.cookie.check('UserRoleId')) {
            this.UserRoleID = parseInt(this.cookie.get('UserRoleId'));
          } else {
            this.UserRoleID = parseInt(this.cookie.get('userRoleID'));
          }
        }
        this.getAllClasses();
      }
    });
  }

  getAllClasses(): void {
    // isha
    // this.spinner.show();
    this.skeletonShow = 'Skelton';

    this.classService
      .getClassListByDaycareID(
        this.centreID,
        this.UserRoleID,
        this.loginUserID,
        ''
      )
      .subscribe((response: any) => {
        if (response.message === 'Success') {
          this.classList = response.result;
          this.skeletonShow = '';

        }
        else {
          this.classList = [];
          this.skeletonShow = '';

        }
      });
  }

  async onClassNameClick(id: any) {
    this.sectionlist = [];

    this.skeletonShow2 = 'Skelton2';

    try {
      const data = await firstValueFrom(
        this.classService.getSectionByClassID(id)
      );
      if (data.message === 'OK') {
        this.sectionlist = data.result;
        this.skeletonShow2 = '';

      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      this.skeletonShow2 = '';

    }
  }

  async onEdit(item: any) {
    await this.onClassNameClick(item.id);
    item.daycareSection = this.sectionlist;

    this.dataFromChild.emit(item);
    if (this.router.url.includes('/onboarding')) {
      this.router.navigate(['/onboarding']);
    } else {
      this.router.navigate(['/manage-classroom']);
    }
  }

  get filteredClssList() {
    return this.classList.filter((x) =>
      x.className
        .toLocaleLowerCase()
        .includes(this.searchText.toLocaleLowerCase())
    );
  }
}
