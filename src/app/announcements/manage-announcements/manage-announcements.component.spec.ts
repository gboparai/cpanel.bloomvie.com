import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageAnnouncementsComponent } from './manage-announcements.component';
import { AnnouncementService } from '../announcement.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { HeaderServiceService } from '../../layout/header/header-service.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ManageAnnouncementsComponent', () => {
  let component: ManageAnnouncementsComponent;
  let fixture: ComponentFixture<ManageAnnouncementsComponent>;
  let mockAnnouncementService: jasmine.SpyObj<AnnouncementService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockHeaderService: any;

  beforeEach(async () => {
    mockAnnouncementService = jasmine.createSpyObj('AnnouncementService', [
      'getClassRoom',
      'getClassListByDaycareID',
      'getDaycareClassListDropdown',
      'getAnnouncementHistory',
      'getRecipientAnnouncements',
      'createAnnouncement',
    ]);
    mockCookieService = jasmine.createSpyObj('CookieService', ['check', 'get']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);
    mockHeaderService = {
      switchProfile: signal(0),
    };

    mockCookieService.check.and.returnValue(true);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'UserRoleId') return '3';
      if (key === 'CentreID') return '10';
      if (key === 'StudentID') return '55';
      if (key === 'UserInfo') {
        return JSON.stringify({
          result: { id: 101, userRoleID: 3, centreID: 10 },
        });
      }
      return '';
    });

    mockAnnouncementService.getDaycareClassListDropdown.and.returnValue(
      of({ result: [{ id: 1, className: 'Preschool' }] })
    );
    mockAnnouncementService.getAnnouncementHistory.and.returnValue(of({ result: [] }));
    mockAnnouncementService.getRecipientAnnouncements.and.returnValue(of({ result: [] }));

    await TestBed.configureTestingModule({
      imports: [ManageAnnouncementsComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AnnouncementService, useValue: mockAnnouncementService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: HeaderServiceService, useValue: mockHeaderService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ManageAnnouncementsComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ManageAnnouncementsComponent);
    component = fixture.componentInstance;
  });

  it('should create the ManageAnnouncementsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('User Role Extraction', () => {
    it('should set admin flags for daycare admin (role 3)', () => {
      component.extractUserInfo();
      expect(component.isAdmin).toBeTrue();
      expect(component.canSend).toBeTrue();
      expect(component.isTeacher).toBeFalse();
      expect(component.isParent).toBeFalse();
    });

    it('should set teacher flags for teacher (role 4)', () => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserRoleId') return '4';
        if (key === 'UserId') return '202';
        if (key === 'CentreID') return '10';
        return '';
      });
      mockCookieService.check.and.returnValue(false);

      component.extractUserInfo();
      expect(component.isTeacher).toBeTrue();
      expect(component.canSend).toBeTrue();
      expect(component.isAdmin).toBeFalse();
    });

    it('should set parent flags for parent (role 5)', () => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserRoleId') return '5';
        if (key === 'UserId') return '303';
        if (key === 'StudentID') return '99';
        return '';
      });
      mockCookieService.check.and.callFake((key: string) => key === 'StudentID');

      component.extractUserInfo();
      expect(component.isParent).toBeTrue();
      expect(component.canSend).toBeFalse();
    });
  });

  describe('Dropdown and Form Setup', () => {
    it('should setup classroomOptions with Facility-Wide option for admin', () => {
      component.isAdmin = true;
      component.isTeacher = false;
      component.centreId = 10;
      component.initForm();

      component.loadClassDropdown();

      expect(component.classroomOptions.length).toBe(2);
      expect(component.classroomOptions[0].className).toBe('Facility-Wide (All Classrooms)');
    });

    it('should setup classroomOptions without Facility-Wide for teacher', () => {
      component.isTeacher = true;
      component.isAdmin = false;
      component.centreId = 10;
      component.initForm();
      mockAnnouncementService.getClassRoom.and.returnValue(
        of({ result: [{ id: 5, className: 'Toddler Room' }] })
      );

      component.loadClassDropdown();

      expect(component.classroomOptions.length).toBe(1);
      expect(component.classroomOptions[0].className).toBe('Toddler Room');
    });
  });

  describe('Tab switching', () => {
    it('should allow switching tabs for senders', () => {
      component.canSend = true;
      component.setTab('sent');
      expect(component.activeTab).toBe('sent');
      component.setTab('received');
      expect(component.activeTab).toBe('received');
    });

    it('should disallow switching to sent tab for parents', () => {
      component.canSend = false;
      component.activeTab = 'received';
      component.setTab('sent');
      expect(component.activeTab).toBe('received');
    });
  });

  describe('Modal and Announcement Details', () => {
    it('should open new announcement modal with defaults', () => {
      component.canSend = true;
      component.initForm();
      component.openNewAnnouncementModal(0);

      expect(component.showModal).toBeTrue();
      expect(component.selectedAnnouncement).toBeNull();
    });

    it('should view details of an announcement', () => {
      const item = { id: 1, title: 'Holiday Notice' };
      component.viewDetails(item);

      expect(component.selectedAnnouncement).toBe(item);
      expect(component.showModal).toBeTrue();
    });

    it('should close modal', () => {
      component.showModal = true;
      component.selectedAnnouncement = {};
      component.closeModal();

      expect(component.showModal).toBeFalse();
      expect(component.selectedAnnouncement).toBeNull();
    });
  });

  describe('submitAnnouncement', () => {
    beforeEach(() => {
      component.initForm();
      component.userId = 101;
      component.userRoleId = 3;
      component.centreId = 10;
    });

    it('should show warning if form is invalid', () => {
      component.announcementForm.patchValue({ title: '', message: '' });
      component.submitAnnouncement();
      expect(mockToastr.warning).toHaveBeenCalledWith('Please fill in all required fields.');
    });

    it('should show warning if teacher attempts to broadcast facility-wide', () => {
      component.isTeacher = true;
      component.announcementForm.patchValue({
        classID: 0,
        title: 'Notice',
        message: 'Content',
        targetAudience: 'Both',
      });

      component.submitAnnouncement();

      expect(mockToastr.warning).toHaveBeenCalledWith('Teachers must select an assigned classroom.');
    });

    it('should submit announcement successfully', () => {
      component.isTeacher = false;
      component.announcementForm.patchValue({
        classID: 0,
        title: 'School Closed Tomorrow',
        message: 'Due to severe weather.',
        targetAudience: 'Both',
      });
      mockAnnouncementService.createAnnouncement.and.returnValue(
        of({ activity: 'Success', message: 'Announcement sent successfully!' })
      );
      spyOn(component, 'closeModal');
      spyOn(component, 'loadHistory');

      component.submitAnnouncement();

      expect(mockAnnouncementService.createAnnouncement).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Announcement sent successfully!');
      expect(component.closeModal).toHaveBeenCalled();
      expect(component.loadHistory).toHaveBeenCalled();
    });

    it('should handle announcement creation error', () => {
      component.announcementForm.patchValue({
        classID: 0,
        title: 'Notice',
        message: 'Content',
        targetAudience: 'Both',
      });
      mockAnnouncementService.createAnnouncement.and.returnValue(
        throwError(() => ({ error: { message: 'Server error' } }))
      );

      component.submitAnnouncement();

      expect(mockToastr.error).toHaveBeenCalledWith('Server error');
      expect(component.isSubmitting).toBeFalse();
    });
  });
});
