import { Component } from '@angular/core';
import { OutletContext, RouterLink, RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { AddBulkActivityService } from '../../day-care-management/add-bulk-activites/add-bulk-activity.service';
import { CookieService } from 'ngx-cookie-service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ManageTeacherService } from '../manage-teacher/manage-teacher.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule, NgFor } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { TimeFormatAmPmPipe, TimeFormatPipe } from '../../bloomvie-management/dc-appointments-list/time-format.pipe';
import { SkeletonLoaderComponent } from "../../common-component/skeleton-loader/skeleton-loader.component";
@Component({
  selector: 'app-my-schedule',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, NgSelectModule, NgxPaginationModule, CommonModule, FormsModule, TimeFormatAmPmPipe, TimeFormatPipe, SkeletonLoaderComponent],
  templateUrl: './my-schedule.component.html',
  styleUrl: './my-schedule.component.css'
})
export class MyScheduleComponent {
  loginUserID: any;
  centreID: any;
  ContentsizeAcceptedList: number = 5;
  ContentAcceptedList: number = 1;
  selectedDaysModel: any[] = [];
  dayCount: any[] = [];
  TeacherSectionRecord: any[] = [];

  daysList = [
    { label: 'Select All' },
    { label: 'Monday' },
    { label: 'Tuesday' },
    { label: 'Wednesday' },
    { label: 'Thursday' },
    { label: 'Friday' },
    { label: 'Saturday' }
  ];

  dayNames: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];
  // dayNames: string[] = [
  //   "",        
  //   'Monday',
  //   'Tuesday',
  //   'Wednesday',
  //   'Thursday',
  //   'Friday',
  //   'Saturday',
  //   'Sunday'
  // ];
  selectedDays: any;
  skeletonShow = "";

  constructor(private addBulkServices: AddBulkActivityService, private service: ManageTeacherService, private cookie: CookieService, private spinner: NgxSpinnerService) {

  }
  ngOnInit(): void {
    this.loginUserID = parseInt(this.cookie.get('UserId'));
    this.centreID = parseInt(this.cookie.get('CentreID'));
  }

  onPageChangeToc(page: number): void {
    this.ContentAcceptedList = page;
  }

  getNumberOfDays(event: any[]) {
    this.TeacherSectionRecord = [];
    const selectAllSelected = event.some((item: any) => item === 'Select All' || item?.label === 'Select All');

    if (selectAllSelected) {
      const alldays = [
   
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

       const allday = [
    { label: 'Monday' },
    { label: 'Tuesday' },
    { label: 'Wednesday' },
    { label: 'Thursday' },
    { label: 'Friday' },
    { label: 'Saturday' }
  ];

      

      // Prevent circular Select All selection
      this.selectedDaysModel = [...alldays];
      this.dayCount = allday;
      this.onSearch();
    } else {
      this.dayCount = event.filter((item: any) => item !== 'Select All');
      this.onSearch();
    
    }
  }

  clearSelectedDays() {
    this.selectedDaysModel = [];
    this.dayCount = [];
    this.TeacherSectionRecord.length = 0;
    this.skeletonShow = "";

  }


  onSearch() {
    this.skeletonShow = 'Skelton';
    const teacherId = this.loginUserID;
    this.TeacherSectionRecord = [];

    const selectedDays = this.dayCount.map((d: any) => d.label).join(',');

if(selectedDays != ""){
 this.service.getPendingStudentAttendance(teacherId, selectedDays).subscribe(
      (data: any) => {
        if (data.message === 'Data fetched successfully.') {
          const result = data.result.classInfo;
          this.TeacherSectionRecord = result;
          this.skeletonShow = "";

        } else {
          this.skeletonShow = "";
          console.warn('API responded but with unexpected message:', data.message);
        }
      },
      (error) => {
        console.error('Error fetching teacher assignments:', error);
        this.skeletonShow = "";
      }
    );
} else{
  this.TeacherSectionRecord = [];
        this.skeletonShow = "";

}
   
 


  }
}
