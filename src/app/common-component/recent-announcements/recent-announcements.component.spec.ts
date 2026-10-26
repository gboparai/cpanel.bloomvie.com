import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentAnnouncementsComponent } from './recent-announcements.component';
import { AnnouncementService } from '../../announcements/announcement.service';
import { CookieService } from 'ngx-cookie-service';
import { HeaderServiceService } from '../../layout/header/header-service.service';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('RecentAnnouncementsComponent', () => {
  let component: RecentAnnouncementsComponent;
  let fixture: ComponentFixture<RecentAnnouncementsComponent>;

  let mockAnnouncementService: jasmine.SpyObj<AnnouncementService>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockHeaderService: any;

  beforeEach(async () => {
    mockAnnouncementService = jasmine.createSpyObj('AnnouncementService', [
      'getAnnouncementHistory',
      'getRecipientAnnouncements'
    ]);
    mockAnnouncementService.getAnnouncementHistory.and.returnValue(of({
      result: [
        { id: 1, title: 'Sports Day' },
        { id: 2, title: 'Holiday Notice' }
      ]
    }));
    mockAnnouncementService.getRecipientAnnouncements.and.returnValue(of({
      result: [
        { id: 3, title: 'Parent Meeting' }
      ]
    }));

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.check.and.callFake((key: string) => key === 'StudentID' || key === 'UserId');
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '101';
      if (key === 'UserRoleId') return '3';
      if (key === 'CentreID') return '10';
      if (key === 'StudentID') return '1';
      return '';
    });

    mockHeaderService = {
      switchProfile: signal(0)
    };

    await TestBed.configureTestingModule({
      imports: [RecentAnnouncementsComponent],
      providers: [
        { provide: AnnouncementService, useValue: mockAnnouncementService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: HeaderServiceService, useValue: mockHeaderService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(RecentAnnouncementsComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentAnnouncementsComponent);
    component = fixture.componentInstance;
  });

  it('should create the RecentAnnouncementsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and User Info', () => {
    it('should extract user info and load announcements for admin', () => {
      component.ngOnInit();

      expect(component.userId).toBe(101);
      expect(component.userRoleId).toBe(3);
      expect(component.isAdmin).toBeTrue();
      expect(component.canSend).toBeTrue();
      expect(mockAnnouncementService.getAnnouncementHistory).toHaveBeenCalledWith(101, 3, 10);
      expect(component.announcements.length).toBe(2);
      expect(component.isLoading).toBeFalse();
    });

    it('should load recipient announcements for parent role', () => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserId') return '202';
        if (key === 'UserRoleId') return '5';
        if (key === 'CentreID') return '10';
        if (key === 'StudentID') return '7';
        return '';
      });

      component.ngOnInit();

      expect(component.isParent).toBeTrue();
      expect(mockAnnouncementService.getRecipientAnnouncements).toHaveBeenCalledWith(202, 5, 7, 10);
      expect(component.announcements.length).toBe(1);
    });

    it('should fallback user info when cookie JSON is absent or invalid', () => {
      component.fallbackUserInfo();
      expect(component.userId).toBe(101);
      expect(component.centreId).toBe(10);
    });
  });

  describe('Details modal interactions', () => {
    it('should set and clear selectedAnnouncement', () => {
      const item = { id: 1, title: 'Important' };
      component.openDetails(item);
      expect(component.selectedAnnouncement).toBe(item);

      component.closeDetails();
      expect(component.selectedAnnouncement).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle API error gracefully when loading announcements', () => {
      mockAnnouncementService.getAnnouncementHistory.and.returnValue(throwError(() => new Error('Error')));
      component.isAdmin = true;
      component.loadAnnouncements();

      expect(component.isLoading).toBeFalse();
      expect(component.announcements).toEqual([]);
    });
  });
});
