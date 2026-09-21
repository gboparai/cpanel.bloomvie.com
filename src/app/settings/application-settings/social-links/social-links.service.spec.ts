import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SocialLinksService } from './social-links.service';
import { environment } from '../../../../environments/environment';

describe('SocialLinksService', () => {
  let service: SocialLinksService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SocialLinksService]
    });
    service = TestBed.inject(SocialLinksService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageDaycareSocailLinks with payload and handle success', () => {
      const payload = { url: 'https://fb.com' };
      service.manageDaycareSocailLinks(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageDaycareSocialLinks`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle manageDaycareSocailLinks error (400)', () => {
      const payload = { url: 'invalid' };
      let errResp: any;
      service.manageDaycareSocailLinks(payload).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/manageDaycareSocialLinks`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getSocialMediaLinks with params and handle success', () => {
      service.getSocialMediaLinks(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/socialMediaLinks?dayCareID=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle getSocialMediaLinks error (404)', () => {
      let errResp: any;
      service.getSocialMediaLinks(99).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/socialMediaLinks?dayCareID=99`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call managePayrollFrequency with payload and handle success', () => {
      const payload = { freq: 'weekly' };
      service.managePayrollFrequency(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageDayCareCentrePayrollFrequency`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('should handle managePayrollFrequency network error (0)', () => {
      let errResp: any;
      service.managePayrollFrequency({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/manageDayCareCentrePayrollFrequency`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call getPayrollFrequencyByDaycareID with params and handle success', () => {
      service.getPayrollFrequencyByDaycareID(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getPayrollFrequencyByDaycareID?centreID=10`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });
});
