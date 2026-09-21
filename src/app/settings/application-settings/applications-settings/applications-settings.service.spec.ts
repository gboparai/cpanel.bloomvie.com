import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApplicationsSettingsService } from './applications-settings.service';
import { environment } from '../../../../environments/environment';

describe('ApplicationsSettingsService', () => {
  let service: ApplicationsSettingsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApplicationsSettingsService]
    });
    service = TestBed.inject(ApplicationsSettingsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('State Management', () => {
    it('should emit via breadcrumbSubject on setImage', (done) => {
      service.breadcrumb$.subscribe(val => {
        if (val === 'test-image') {
          expect(val).toBe('test-image');
          done();
        }
      });
      service.setImage('test-image');
    });
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call ManageApplicationSettings with payload and handle success', () => {
      const payload = { settings: true };
      service.ManageApplicationSettings(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageApplicationSettings`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle ManageApplicationSettings error (500)', () => {
      let errResp: any;
      service.ManageApplicationSettings({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageApplicationSettings`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call GetApplicationSetting and handle success', () => {
      service.GetApplicationSetting().subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getApplicationSetting`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle GetApplicationSetting error (404)', () => {
      let errResp: any;
      service.GetApplicationSetting().subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getApplicationSetting`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call GetNofications with params and handle success', () => {
      service.GetNofications(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/getAllNotification?userID=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call AppintmentIsRead with payload and handle success', () => {
      const payload = [{ id: 1 }];
      service.AppintmentIsRead(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/manageNotificationAssignment`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle AppintmentIsRead network error (0)', () => {
      let errResp: any;
      service.AppintmentIsRead([]).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SlotTimeTable/manageNotificationAssignment`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call uploadImages with payload and query param and handle success', () => {
      const formData = new FormData();
      service.uploadImages(formData, 'profile').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/uploadImages?type=profile`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('should call UploadBulkActivitesOfStudent with payload and handle success', () => {
      const payload = { file: 'mock' };
      service.UploadBulkActivitesOfStudent(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/UploadBulkActivitesOfStudent`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });
  });
});
