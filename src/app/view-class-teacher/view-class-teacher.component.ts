import { Component, EventEmitter, Output } from '@angular/core';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { CookieService } from 'ngx-cookie-service';
import { ManageClassroomService } from '../day-care-management/classroom-management/manage-classroom/manage-classroom.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../common-component/common.service';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SkeletonLoaderComponent } from "../common-component/skeleton-loader/skeleton-loader.component";
import { TooltipComponent } from '../common-component/tooltip/tooltip.component';



@Component({
  selector: 'app-view-class-teacher',
  standalone: true,
  imports: [BreadcrumbComponent,
    ReactiveFormsModule,
    CommonModule, NgxPaginationModule, FormsModule, SkeletonLoaderComponent,TooltipComponent],
  templateUrl: './view-class-teacher.component.html',
  styleUrl: './view-class-teacher.component.css'
})
export class ViewClassTeacherComponent {
  classList: any[]=[];
  centreID: any;
  loginUserID: any;
  sectionlist: any;
  ContentP: number = 1;
  Contentsize: number = 10;
  @Output() dataFromChild = new EventEmitter<any>();
  classSelected: any;
  SectionSelected: any;
  teacherlist: any[] = [];
  selectSection: any;
  UserRoleID: any;
  showBanner = true;
  searchText:string='';
  typingTimeout: any;
skeletonShow = 'Skelton';
skeletonShow2 = 'Skelton2';
hoveredRow:any=null;



  constructor(private cookie: CookieService,
    private classService: ManageClassroomService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private spinner:NgxSpinnerService,
    private toastr:ToastrService) {

  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      let enc_id: any = params.get('enc_id');
      if (enc_id) {
        const decryptedId = this.commonService.decrypt(enc_id);
        this.centreID = decryptedId && !isNaN(Number(decryptedId)) ? parseInt(decryptedId, 10) : 0;
      }
      else if (this.cookie.check('CentreID')) {
        this.centreID = parseInt(this.cookie.get('CentreID'));
      }
      if (this.centreID) {
        if (this.cookie.check('UserId')) {
          this.loginUserID = parseInt(this.cookie.get('UserId'));
          this.UserRoleID = parseInt(this.cookie.get('UserRoleId'))
        }
        this.getAllClasses();
      }
    });
  }
  closeBanner() {
    this.showBanner = false;
  }


  getAllClasses(): void {
        this.skeletonShow = 'Skelton';

    this.classService.getClassListByDaycareID(this.centreID, this.UserRoleID, this.loginUserID,this.searchText).subscribe((response: any) => {
      if (response.message === 'Success') {
        this.classList = response.result;        
        this.skeletonShow = '';
      }else{
        this.classList=[];    
        this.skeletonShow = '';
      };
    },
    );
  }


  onClassNameClick(id: any) {
    this.classSelected = id
    this.getTeacherByClass()
  }



  onEdit(item: any) {    
    this.dataFromChild.emit(item);
  }


  getTeacherByClass() {
    this.skeletonShow2 = 'Skelton2';

    this.classService.getClassTeacher(this.centreID, this.classSelected).subscribe(data => {
      if (data.message == "OK") {
        this.teacherlist = data.result;
    this.skeletonShow2 = '';

      }
    })
  }

  onSearchInput(){
     clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.getAllClasses();
    }, 1500);
  }




}
