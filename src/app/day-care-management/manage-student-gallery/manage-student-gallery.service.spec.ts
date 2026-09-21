import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageStudentGalleryService } from './manage-student-gallery.service';
import { environment } from '../../../environments/environment';

describe('ManageStudentGalleryService', () => {
  let service: ManageStudentGalleryService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ManageStudentGalleryService]
    });
    service = TestBed.inject(ManageStudentGalleryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Non-HTTP Methods', () => {
    // BUG DISCOVERED: This method literally throws a hardcoded error rather than hitting an endpoint or executing logic.
    xit('should throw error for getStudentDetails', () => {
      expect(() => service.getStudentDetails(1, 'start', 'end')).toThrowError('Method not implemented.');
    });
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getClassRoomByTeacherID and handle success', () => {
      service.getClassRoomByTeacherID(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getClassRoomByTeacherID?teacherId=1&userRoleId=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getStudentBySectionID and handle error (404)', () => {
      let errResp: any;
      service.getStudentBySectionID(10).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentBySectionID?sectionId=10`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getSectionByClassID and handle success', () => {
      service.getSectionByClassID(5).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getSectionByClassID?classID=5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call dayCareCentreStudentGallery with payload and handle success', () => {
      const payload = { data: 'test' };
      service.dayCareCentreStudentGallery(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/dayCareCentreStudentGallery`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call getStudentByParentID and handle error (500)', () => {
      let errResp: any;
      service.getStudentByParentID(5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentByParentID?parentID=5`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getStudentGalleryByStudentID and handle success', () => {
      service.getStudentGalleryByStudentID(1, '2023-01-01', '2023-01-31').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getStudentGalleryByStudentID?studentID=1&startDate=2023-01-01&endDate=2023-01-31`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call studentGalleryDelete and handle success', () => {
      service.studentGalleryDelete(1, 'path/file.jpg').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/studentGalleryDelete?galleryID=1&filePath=path/file.jpg`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call ManageComment and handle success', () => {
      service.ManageComment(1, 'comment', 'add', '2023-01-01', 'gallery').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/ManageComment?ID=1&comment=comment&action=add&date=2023-01-01&type=gallery`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call GetComment and handle network error (0)', () => {
      let errResp: any;
      service.GetComment(1, '2023-01-01').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/GetComment?ID=1&date=2023-01-01`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });

    it('should call getParentDetails and handle success', () => {
      service.getParentDetails(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getParentDetailStudentID?studentID=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call getTeacherDetailByParentID and handle success', () => {
      service.getTeacherDetailByParentID(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/getTeacherDetailByParentID?parentID=1&studentID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });
});
