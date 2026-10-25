import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnnouncementService } from './announcement.service';
import { environment } from '../../environments/environment';

describe('AnnouncementService', () => {
  let service: AnnouncementService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnnouncementService],
    });
    service = TestBed.inject(AnnouncementService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createAnnouncement', () => {
    it('should post payload to /Announcement/CreateAnnouncement', () => {
      let response: any;
      const payload = { title: 'Emergency Drill', content: 'Scheduled at 2 PM' };
      const mockResult = { success: true };

      service.createAnnouncement(payload).subscribe(res => {
        response = res;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Announcement/CreateAnnouncement`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResult);

      expect(response).toEqual(mockResult);
    });
  });

  describe('getAnnouncementHistory', () => {
    it('should fetch announcement history with userId, userRoleId, and optional centreId', () => {
      let response: any;
      const mockHistory = [{ id: 1, title: 'Summer Camp' }];

      service.getAnnouncementHistory(10, 2, 5).subscribe(res => {
        response = res;
      });

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/Announcement/GetAnnouncementHistory?userId=10&userRoleId=2&centreId=5`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);

      expect(response).toEqual(mockHistory);
    });

    it('should omit centreId param when not provided', () => {
      service.getAnnouncementHistory(10, 2).subscribe();

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/Announcement/GetAnnouncementHistory?userId=10&userRoleId=2`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getRecipientAnnouncements', () => {
    it('should fetch recipient announcements with studentId and centreId', () => {
      let response: any;
      service.getRecipientAnnouncements(10, 3, 44, 2).subscribe(res => {
        response = res;
      });

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/Announcement/GetRecipientAnnouncements?userId=10&userRoleId=3&studentId=44&centreId=2`
      );
      expect(req.request.method).toBe('GET');
      req.flush([{ id: 8 }]);

      expect(response).toEqual([{ id: 8 }]);
    });
  });

  describe('Classroom queries', () => {
    it('should call getDaycareClassListDropdown with default id 0', () => {
      service.getDaycareClassListDropdown().subscribe();

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/Classroom/getDaycareClassListDropdown?id=0`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should call getClassRoom with centreID, teacherID, userRoleID', () => {
      service.getClassRoom(5, 12, 2).subscribe();

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/Classroom/getClassRoom?centreID=5&teacherID=12&userRoleID=2`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ classes: [] });
    });

    it('should call getClassListByDaycareID with search text', () => {
      service.getClassListByDaycareID(5, 2, 10, 'Infant').subscribe();

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/Classroom/getClassListByDaycareID?daycareId=5&userRoleId=2&userId=10&searchText=Infant`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });
});
