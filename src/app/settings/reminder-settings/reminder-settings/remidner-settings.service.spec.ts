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
      providers: [RemidnerSettingsService]
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

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call addReminderSettings with body and handle success', () => {
      const payload = { test: 123 };
      service.addReminderSettings(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/addReminderSettings`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle addReminderSettings error (400)', () => {
      let errResp: any;
      service.addReminderSettings({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/addReminderSettings`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getReminderType with params and handle success', () => {
      service.getReminderType(5).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getReminderTypeByUserRoleID?UserRoleID=5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle getReminderType error (404)', () => {
      let errResp: any;
      service.getReminderType(99).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getReminderTypeByUserRoleID?UserRoleID=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call getAllReminderByCenterID with params and handle success', () => {
      service.getAllReminderByCenterID(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllReminderByCenterID?CentreID=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle getAllReminderByCenterID error (500)', () => {
      let errResp: any;
      service.getAllReminderByCenterID(1).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllReminderByCenterID?CentreID=1`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });
  });
});
