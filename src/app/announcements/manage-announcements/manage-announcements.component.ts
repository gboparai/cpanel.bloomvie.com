import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { AnnouncementService } from '../announcement.service';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { HeaderServiceService } from '../../layout/header/header-service.service';

@Component({
  selector: 'app-manage-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule, NgSelectModule, BreadcrumbComponent],
  templateUrl: './manage-announcements.component.html',
  styleUrls: ['./manage-announcements.component.css']
})
export class ManageAnnouncementsComponent implements OnInit {
  activeTab: 'received' | 'sent' = 'received';
  recipientAnnouncements: any[] = [];
  announcementHistory: any[] = [];
  classroomOptions: { id: number; className: string }[] = [];
  announcementForm!: FormGroup;
  showModal: boolean = false;
  selectedAnnouncement: any = null;
  pReceived: number = 1;
  pSent: number = 1;
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  userId: number = 0;
  userRoleId: number = 0;
  centreId: number = 0;
  studentId: number = 0;
  isTeacher: boolean = false;
  isAdmin: boolean = false;
  isParent: boolean = false;
  canSend: boolean = false;

  constructor(
    private fb: FormBuilder,
    private announcementService: AnnouncementService,
    private cookie: CookieService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private headerService: HeaderServiceService
  ) {
    effect(() => {
      this.headerService.switchProfile();
      if (this.isParent) {
        this.extractUserInfo();
        this.loadRecipientAnnouncements();
      }
    });
  }

  ngOnInit(): void {
    this.extractUserInfo();
    this.activeTab = 'received';
    if (this.canSend) {
      this.initForm();
      this.loadClassDropdown();
      this.loadHistory();
    }
    this.loadRecipientAnnouncements();

    // Check if opened with pre-selected classId query param (e.g. from Quick Announcement)
    this.route.queryParams.subscribe(params => {
      if (this.canSend && params['newAnnouncement'] === 'true') {
        const classId = params['classId'] ? parseInt(params['classId'], 10) : 0;
        this.openNewAnnouncementModal(classId);
      }
    });
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

    if (!this.studentId && this.cookie.check('StudentID')) {
      this.studentId = parseInt(this.cookie.get('StudentID'), 10) || 0;
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

    this.isTeacher = this.userRoleId === 4;
    this.isAdmin = this.userRoleId === 3 || this.userRoleId === 8 || this.userRoleId === 1;
    this.isParent = this.userRoleId === 5;
    this.canSend = this.isTeacher || this.isAdmin;
  }

  fallbackUserInfo(): void {
    this.userId = parseInt(this.cookie.get('UserId'), 10) || 0;
    this.userRoleId = parseInt(this.cookie.get('UserRoleId'), 10) || 0;
    this.centreId = parseInt(this.cookie.get('CentreID'), 10) || 0;
    if (this.cookie.check('StudentID')) {
      this.studentId = parseInt(this.cookie.get('StudentID'), 10) || 0;
    }
  }

  initForm(): void {
    this.announcementForm = this.fb.group({
      classID: [this.isTeacher ? null : 0, Validators.required],
      targetAudience: ['Both', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(250)]],
      message: ['', Validators.required]
    });
  }

  loadClassDropdown(): void {
    if (this.isTeacher) {
      // Teacher: load only assigned classes
      this.announcementService.getClassRoom(this.centreId, this.userId, this.userRoleId).subscribe({
        next: (res: any) => {
          const classes = res?.result || [];
          if (!classes || classes.length === 0) {
            this.announcementService.getClassListByDaycareID(this.centreId, this.userRoleId, this.userId, '').subscribe({
              next: (fallbackRes: any) => {
                this.setTeacherClasses(fallbackRes?.result || []);
              },
              error: () => this.setTeacherClasses([])
            });
          } else {
            this.setTeacherClasses(classes);
          }
        },
        error: () => {
          this.announcementService.getClassListByDaycareID(this.centreId, this.userRoleId, this.userId, '').subscribe({
            next: (fallbackRes: any) => {
              this.setTeacherClasses(fallbackRes?.result || []);
            },
            error: () => this.setTeacherClasses([])
          });
        }
      });
    } else {
      // Daycare Admin: load daycare classes using centreId
      this.announcementService.getDaycareClassListDropdown(this.centreId).subscribe({
        next: (res: any) => {
          const classes = res?.result || [];
          if (!classes || classes.length === 0) {
            this.announcementService.getClassRoom(this.centreId, this.userId, this.userRoleId).subscribe({
              next: (crRes: any) => {
                const crClasses = crRes?.result || [];
                if (!crClasses || crClasses.length === 0) {
                  this.announcementService.getClassListByDaycareID(this.centreId, this.userRoleId, this.userId, '').subscribe({
                    next: (clRes: any) => this.setAdminClasses(clRes?.result || []),
                    error: () => this.setAdminClasses([])
                  });
                } else {
                  this.setAdminClasses(crClasses);
                }
              },
              error: () => this.setAdminClasses([])
            });
          } else {
            this.setAdminClasses(classes);
          }
        },
        error: () => {
          this.announcementService.getClassRoom(this.centreId, this.userId, this.userRoleId).subscribe({
            next: (crRes: any) => this.setAdminClasses(crRes?.result || []),
            error: () => this.setAdminClasses([])
          });
        }
      });
    }
  }

  private setAdminClasses(rawClasses: any[]): void {
    const mapped = (rawClasses || [])
      .map((c: any) => ({
        id: Number(c.id ?? c.ID ?? c.classroomID ?? c.classID),
        className: String(c.className ?? c.ClassName ?? c.classroomName ?? c.Name ?? c.name ?? `Class #${c.id || c.ID}`)
      }))
      .filter((c: any) => c.id > 0);

    this.classroomOptions = [
      { id: 0, className: 'Facility-Wide (All Classrooms)' },
      ...mapped
    ];

    if (this.announcementForm.get('classID')?.value === null || this.announcementForm.get('classID')?.value === undefined) {
      this.announcementForm.patchValue({ classID: 0 });
    }
  }

  private setTeacherClasses(rawClasses: any[]): void {
    const mapped = (rawClasses || [])
      .map((c: any) => ({
        id: Number(c.id ?? c.ID ?? c.classroomID ?? c.classID),
        className: String(c.className ?? c.ClassName ?? c.classroomName ?? c.Name ?? c.name ?? `Class #${c.id || c.ID}`)
      }))
      .filter((c: any) => c.id > 0);

    this.classroomOptions = mapped;

    const currentVal = this.announcementForm.get('classID')?.value;
    if ((!currentVal || currentVal === 0) && this.classroomOptions.length > 0) {
      this.announcementForm.patchValue({ classID: this.classroomOptions[0].id });
    }
  }

  loadHistory(): void {
    this.isLoading = true;
    this.announcementService.getAnnouncementHistory(this.userId, this.userRoleId, this.centreId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.result) {
          this.announcementHistory = res.result;
        } else {
          this.announcementHistory = [];
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.announcementHistory = [];
        this.toastr.error(err?.error?.message || 'Failed to load announcement history.');
      }
    });
  }

  loadRecipientAnnouncements(): void {
    this.isLoading = true;
    const currentStudentId = this.isParent ? (this.studentId || (this.cookie.check('StudentID') ? parseInt(this.cookie.get('StudentID'), 10) : null)) : null;
    this.announcementService.getRecipientAnnouncements(this.userId, this.userRoleId, currentStudentId, this.centreId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.recipientAnnouncements = res?.result || [];
      },
      error: () => {
        this.isLoading = false;
        this.recipientAnnouncements = [];
      }
    });
  }

  setTab(tab: 'received' | 'sent'): void {
    if (!this.canSend && tab === 'sent') {
      return;
    }
    this.activeTab = tab;
  }

  openNewAnnouncementModal(preSelectedClassId: number = 0): void {
    if (!this.canSend) {
      return;
    }
    this.selectedAnnouncement = null;
    let defaultClassId = preSelectedClassId;
    if (this.isTeacher && defaultClassId === 0 && this.classroomOptions.length > 0) {
      defaultClassId = this.classroomOptions[0].id;
    }

    this.announcementForm.reset({
      classID: defaultClassId,
      targetAudience: 'Both',
      title: '',
      message: ''
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAnnouncement = null;
  }

  viewDetails(item: any): void {
    this.selectedAnnouncement = item;
    this.showModal = true;
  }

  submitAnnouncement(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      this.toastr.warning('Please fill in all required fields.');
      return;
    }

    const val = this.announcementForm.value;
    if (this.isTeacher && (!val.classID || val.classID === 0)) {
      this.toastr.warning('Teachers must select an assigned classroom.');
      return;
    }

    const payload = {
      userId: this.userId,
      userRoleId: this.userRoleId,
      centreId: this.centreId,
      classID: val.classID,
      targetAudience: val.targetAudience,
      title: val.title.trim(),
      message: val.message.trim()
    };

    this.isSubmitting = true;
    this.announcementService.createAnnouncement(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res && (res.activity === 'Success' || res.message?.includes('successfully'))) {
          this.toastr.success(res.message || 'Announcement sent successfully!');
          this.closeModal();
          this.loadHistory();
          this.loadRecipientAnnouncements();
        } else {
          this.toastr.error(res?.message || 'Failed to send announcement.');
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toastr.error(err?.error?.message || 'An error occurred while broadcasting announcement.');
      }
    });
  }
}
