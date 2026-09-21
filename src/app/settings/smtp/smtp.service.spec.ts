import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SmtpService } from './smtp.service';
import { environment } from '../../../environments/environment';

describe('SmtpService', () => {
  let service: SmtpService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SmtpService]
    });
    service = TestBed.inject(SmtpService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call ManageSMTP with body and handle success', () => {
      const payload = { host: 'smtp.test.com' };
      service.ManageSMTP(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageSMTPSettings`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle ManageSMTP error (400)', () => {
      let errResp: any;
      service.ManageSMTP({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageSMTPSettings`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call GetAllSMTPSettings with params and handle success', () => {
      service.GetAllSMTPSettings(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllSMTPSettings?centreID=10`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle GetAllSMTPSettings error (500)', () => {
      let errResp: any;
      service.GetAllSMTPSettings(10).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getAllSMTPSettings?centreID=10`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call GetSMTPSettingbyId with params and handle success', () => {
      service.GetSMTPSettingbyId(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getSMTPsettingsbyId?id=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle GetSMTPSettingbyId error (404)', () => {
      let errResp: any;
      service.GetSMTPSettingbyId(99).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getSMTPsettingsbyId?id=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call ActiveInactiveSMTPSettingbyId with params and handle success', () => {
      service.ActiveInactiveSMTPSettingbyId(5).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/activeInactiveSMTPSettingbyId?id=5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle ActiveInactiveSMTPSettingbyId network error (0)', () => {
      let errResp: any;
      service.ActiveInactiveSMTPSettingbyId(5).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/activeInactiveSMTPSettingbyId?id=5`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
