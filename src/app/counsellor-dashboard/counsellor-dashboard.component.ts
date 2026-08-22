import { Component, AfterViewInit, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../common-component/breadcrumb/breadcrumb.component';
import { CounsellorDashboardService } from './counsellor-dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { TimeFormatPipe } from '../bloomvie-management/dc-appointments-list/time-format.pipe';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AssignUserPermissionService } from '../settings/Permission/assign-user-permission/assign-user-permission.service';
import { CommonService } from '../common-component/common.service';

@Component({
  selector: 'app-counsellor-dashboard',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    TimeFormatPipe,
    CommonModule,
    RouterLink,
    RouterOutlet,
    BreadcrumbComponent,
  ],
  templateUrl: './counsellor-dashboard.component.html',
  styleUrls: ['./counsellor-dashboard.component.css'],
})
export class CounsellorDashboardComponent implements OnInit {
  navigateToChatbox() {
    this.router.navigate(['/chatbox']);
  }

  userId: number = 0;
  meetingDetails: any[] = [];
  meetInfo: any;
  handleView: boolean = false;
  pendingActionsCount: number = 0;
  assignedDayCaresCount: number = 0;
  Counsellor: any;
  DayCaresCount = 'count';

  constructor(
    private service: CounsellorDashboardService,
    private cookie: CookieService,
    private router: Router,
    private toastr: ToastrService,
    private route: Router,
    private assignUserPermissionService: AssignUserPermissionService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userId = parseInt(this.cookie.get('UserId'));
    this.getTodaysMeetings();
    this.getDashboardCount();
  }

  // ngAfterViewInit() {
  //   // Use a timeout to delay the DOM manipulation slightly, if needed
  //   setTimeout(() => {
  //     const toggleLink = document.getElementById('toggle-link') as HTMLAnchorElement;
  //     const toggleDiv = document.getElementById('toggle-div') as HTMLDivElement;

  //     if (toggleLink && toggleDiv) {
  //       toggleLink.addEventListener('click', (event: MouseEvent) => {
  //         event.preventDefault();

  //         // Toggle the display property
  //         if (toggleDiv.style.display === 'none' || toggleDiv.style.display === '') {
  //           toggleDiv.style.display = 'block';
  //         } else {
  //           toggleDiv.style.display = 'none';
  //         }
  //       });
  //     }
  //   });
  // }

  getTodaysMeetings() {
    this.service.getTodaysMeetings(this.userId).subscribe((data: any) => {
      if (data.message == 'Success') {
        this.meetingDetails = data.result;
      }
    });
  }

  getAppointmentInfo(meetingInfo: any) {
    this.meetInfo = meetingInfo;
    this.handleView = true;
  }

  getDashboardCount() {

    this.DayCaresCount = 'count';
    this.service
      .getCounsellorDashboardCount(this.userId, '')
      .subscribe((data: any) => {
        if (data.message == 'Success') {
          this.pendingActionsCount = data.result.pendingAppointmentCount;
          this.assignedDayCaresCount = data.result.assignedDaycareCount;
          this.DayCaresCount = '';

        } else {
          // this.toastr.error("Pending Action cannot be fetched now.");
          this.DayCaresCount = '';

        }
      });
  }

  navigateToAppointmentList() {
    this.route.navigate(['/dc-appointments-list']);
  }

  navigateToAssignedDaycares() {
    const encryptedId = this.commonService.encrypt(this.userId.toString());
    this.route.navigate(['/daycare-assigned-counsellor-organogram'], {
      queryParams: { id: encryptedId },
    });
  }
}
