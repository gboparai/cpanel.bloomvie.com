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
      providers: [ApplicationsSettingsService],
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

  it('should update breadcrumb observable via setImage', (done: DoneFn) => {
    let emissions: string[] = [];

    service.breadcrumb$.subscribe(val => {
      emissions.push(val);
      if (emissions.length === 2) {
        expect(emissions).toEqual(['', 'General Settings']);
        done();
      }
    });

    service.setImage('General Settings');
  });

  it('should post ManageApplicationSettings', () => {
    const payload = { appName: 'Bloomvie Daycare' };
    service.ManageApplicationSettings(payload).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/manageApplicationSettings`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('should call GetApplicationSetting', () => {
    service.GetApplicationSetting().subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/getApplicationSetting`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ appName: 'Bloomvie' });
  });

  it('should call GetNofications with userID param', () => {
    service.GetNofications(42).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SlotTimeTable/getAllNotification?userID=42`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should post AppintmentIsRead', () => {
    const list = [{ notificationId: 10 }];
    service.AppintmentIsRead(list).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SlotTimeTable/manageNotificationAssignment`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(list);
    req.flush({ success: true });
  });

  it('should post uploadImages with type param', () => {
    const formData = new FormData();
    service.uploadImages(formData, 'profile').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/uploadImages?type=profile`
    );
    expect(req.request.method).toBe('POST');
    req.flush({ url: 'https://example.com/pic.jpg' });
  });

  it('should post UploadBulkActivitesOfStudent', () => {
    const model = { studentActivities: [] };
    service.UploadBulkActivitesOfStudent(model).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/UploadBulkActivitesOfStudent`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(model);
    req.flush({ success: true });
  });
});
