import { Component, effect, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AnnouncementService } from '../../announcements/announcement.service';
import { HeaderServiceService } from '../../layout/header/header-service.service';

@Component({
  selector: 'app-recent-announcements',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './recent-announcements.component.html',
  styleUrls: ['./recent-announcements.component.css']
})
export class RecentAnnouncementsComponent implements OnInit {
  announcements: any[] = [];
  isLoading: boolean = false;
  selectedAnnouncement: any = null;

  userId: number = 0;
  userRoleId: number = 0;
  centreId: number = 0;
  studentId: number = 0;

  isAdmin: boolean = false;
  isTeacher: boolean = false;
  isParent: boolean = false;
  canSend: boolean = false;

  constructor(
    private announcementService: AnnouncementService,
    private cookie: CookieService,
    private headerService: HeaderServiceService
  ) {
    effect(() => {
      this.headerService.switchProfile();
      if (this.isParent) {
        this.extractUserInfo();
        this.loadAnnouncements();
      }
    });
  }

  ngOnInit(): void {
    this.extractUserInfo();
    this.loadAnnouncements();
  }

  extractUserInfo(): void {
    let rawStudentId: any = 0;
    if (this.cookie.check('StudentID')) {
      rawStudentId = parseInt(this.cookie.get('StudentID'), 10) || 0;
    }

    const userInfoCookie = this.cookie.get('UserInfo');
    if (userInfoCookie) {
      try {
        const parsed = JSON.parse(userInfoCookie);
        this.userId = parsed?.result?.id || parsed?.result?.ID || parseInt(this.cookie.get('UserId'), 10) || 0;
        this.userRoleId = parsed?.result?.userRoleID || parsed?.result?.UserRoleID || parseInt(this.cookie.get('UserRoleId'), 10) || 0;
        this.centreId = parsed?.result?.centreID || parsed?.result?.CentreID || parseInt(this.cookie.get('CentreID'), 10) || 0;
        if (!rawStudentId) {
          if (parsed?.result?.studentList?.[0]?.id) {
            rawStudentId = parsed.result.studentList[0].id;
          } else if (parsed?.result?.StudentList?.[0]?.ID) {
            rawStudentId = parsed.result.StudentList[0].ID;
          } else if (parsed?.result?.StudentList?.[0]?.id) {
            rawStudentId = parsed.result.StudentList[0].id;
          } else if (typeof parsed?.result?.studentID === 'number') {
            rawStudentId = parsed.result.studentID;
          } else if (Array.isArray(parsed?.result?.studentID) && parsed.result.studentID.length > 0) {
            rawStudentId = parsed.result.studentID[0]?.id || parsed.result.studentID[0]?.ID || 0;
          }
        }
        this.studentId = Number(rawStudentId) || 0;
      } catch (e) {
        this.fallbackUserInfo();
      }
    } else {
      this.fallbackUserInfo();
    }

    if (!this.centreId) {
      if (this.cookie.check('CentreID')) {
        this.centreId = parseInt(this.cookie.get('CentreID'), 10) || 0;
      } else if (this.cookie.check('centreID')) {
        this.centreId = parseInt(this.cookie.get('centreID'), 10) || 0;
      }
    }
    if (!this.userId && this.cookie.check('UserId')) {
      this.userId = parseInt(this.cookie.get('UserId'), 10) || 0;
    }
    if (!this.userRoleId && this.cookie.check('UserRoleId')) {
      this.userRoleId = parseInt(this.cookie.get('UserRoleId'), 10) || 0;
    }
    if (!this.studentId && this.cookie.check('StudentID')) {
      this.studentId = parseInt(this.cookie.get('StudentID'), 10) || 0;
    }

    this.isAdmin = this.userRoleId === 3 || this.userRoleId === 8 || this.userRoleId === 1;
    this.isTeacher = this.userRoleId === 4;
    this.isParent = this.userRoleId === 5;
    this.canSend = this.isAdmin || this.isTeacher;
  }

  fallbackUserInfo(): void {
    this.userId = parseInt(this.cookie.get('UserId'), 10) || 0;
    this.userRoleId = parseInt(this.cookie.get('UserRoleId'), 10) || 0;
    this.centreId = parseInt(this.cookie.get('CentreID'), 10) || 0;
    this.studentId = parseInt(this.cookie.get('StudentID'), 10) || 0;
  }

  loadAnnouncements(): void {
    this.isLoading = true;

    if (this.isAdmin) {
      // Daycare Admin sees recent broadcast history
      this.announcementService.getAnnouncementHistory(this.userId, this.userRoleId, this.centreId).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          const list = res?.result || [];
          this.announcements = list.slice(0, 3);
        },
        error: () => {
          this.isLoading = false;
          this.announcements = [];
        }
      });
    } else {
      // Teachers and Parents see recent received announcements
      // For Parents, pass the active studentId so announcements match the selected student
      const studentIdToPass = this.isParent ? (this.studentId || (this.cookie.check('StudentID') ? parseInt(this.cookie.get('StudentID'), 10) : null)) : (this.studentId > 0 ? this.studentId : null);
      this.announcementService.getRecipientAnnouncements(this.userId, this.userRoleId, studentIdToPass, this.centreId).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          const list = res?.result || [];
          this.announcements = list.slice(0, 3);
        },
        error: () => {
          this.isLoading = false;
          this.announcements = [];
        }
      });
    }
  }

  openDetails(item: any): void {
    this.selectedAnnouncement = item;
  }

  closeDetails(): void {
    this.selectedAnnouncement = null;
  }
}
