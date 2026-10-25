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
      providers: [SmtpService],
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

  it('should post ManageSMTP', () => {
    const smtpBO = { host: 'smtp.sendgrid.net', port: 587, user: 'bloomvie' };
    service.ManageSMTP(smtpBO).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageSMTPSettings`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(smtpBO);
    req.flush({ success: true });
  });

  it('should get all SMTP settings by centreID', () => {
    service.GetAllSMTPSettings(5).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/getAllSMTPSettings?centreID=5`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get SMTP setting by id', () => {
    service.GetSMTPSettingbyId(10).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/getSMTPsettingsbyId?id=10`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ id: 10, host: 'smtp.mailgun.org' });
  });

  it('should toggle active/inactive SMTP setting by id', () => {
    service.ActiveInactiveSMTPSettingbyId(10).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/activeInactiveSMTPSettingbyId?id=10`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true });
  });
});
