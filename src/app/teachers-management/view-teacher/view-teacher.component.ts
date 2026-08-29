import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { CookieService } from 'ngx-cookie-service';
import { ViewTeacherService } from './view-teacher.service';
import { Router } from '@angular/router';
import { RouterModule,RouterLink } from '@angular/router';
import { CommonModule, NgFor,NgIf } from '@angular/common';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';



@Component({
  selector: 'app-view-teacher',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    RouterModule,
    RouterLink,
    NgFor,
    NgIf,
    NgxPaginationModule    
  ],
  templateUrl: './view-teacher.component.html',
  styleUrl: './view-teacher.component.css'
})
export class ViewTeacherComponent {
  ContentP: number = 1;
  Contentsize: number = 5;
  readonly URL = environment.apiUrl.slice(0, environment.apiUrl.indexOf('/api'));
  loginUserId: any;
  userRoleId : any;
  teacherDetailslList : any[]=[];
  TeacherList: any;
  studentID: string | undefined;

  constructor(private cookies: CookieService,private viewTeacherService : ViewTeacherService,private router: Router, private spinner: NgxSpinnerService,) {
  }

  ngOnInit():void{
    this.loginUserId = this.cookies.get('UserId');
    this.userRoleId = this.cookies.get('UserRoleId');
    this.studentID = this.cookies.get('StudentID');

    // this.getTeacherDetail(this.loginUserId);

    this.getTeacherDetailByStudentParentId();
   
  }

    getTeacherDetail(UserID :any){
    this.viewTeacherService.getAttendingTeachersInfo(1,2,1).subscribe(data=>{
      if(data.message==="OK"){
        this.teacherDetailslList = data.result;
      }
      else{
        this.teacherDetailslList = [];
      }
    })
  }

  getTeacherDetailByStudentParentId(){
    let parentId = Number(this.loginUserId);
    let studentId = Number(this.studentID);
    this.spinner.show();
    this.viewTeacherService.getTeacherDetailByStudentParentId(parentId,studentId).subscribe(data=>{
      if(data.message == "OK"){
        this.TeacherList = data.result;
        this.spinner.hide();
      }
      else{
        this.TeacherList = [];
        this.spinner.hide();
      }
    })
  }
  onPageChange(page: number): void {
    this.ContentP = page;
  }

}
