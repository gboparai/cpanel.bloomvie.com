import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RemidnerSettingsService } from './remidner-settings.service';
import { environment } from '../../../../environments/environment';

describe('RemidnerSettingsService', () => {
  let service: RemidnerSettingsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RemidnerSettingsService],
    });
    service = TestBed.inject(RemidnerSettingsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post addReminderSettings', () => {
    const reminderObj = { reminderType: 'Fee Payment', daysBefore: 3 };
    service.addReminderSettings(reminderObj).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/addReminderSettings`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(reminderObj);
    req.flush({ success: true });
  });

  it('should get reminder types by UserRoleID', () => {
    service.getReminderType(2).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/getReminderTypeByUserRoleID?UserRoleID=2`
    );
    expect(req.request.method).toBe('GET');
    req.flush(['Daily', 'Weekly']);
  });

  it('should get all reminders by CentreID', () => {
    service.getAllReminderByCenterID(5).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/getAllReminderByCenterID?CentreID=5`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
