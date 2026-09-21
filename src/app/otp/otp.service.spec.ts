import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OtpService } from './otp.service';
import { environment } from '../../environments/environment';

describe('OtpService', () => {
  let service: OtpService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OtpService]
    });
    service = TestBed.inject(OtpService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call verifyOTP with correct body payload and handle success', () => {
      const otp = '123456';
      const email = 'test@test.com';
      service.verifyOTP(otp, email).subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/verifyOTP`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ otp, email });
      req.flush({});
    });

    it('should handle verifyOTP error (400)', () => {
      const otp = 'invalid';
      const email = 'test@test.com';
      let errResp: any;
      service.verifyOTP(otp, email).subscribe({
        error: err => errResp = err
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/verifyOTP`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should handle verifyOTP network timeout (0)', () => {
      let errResp: any;
      service.verifyOTP('123456', 'test@test.com').subscribe({
        error: err => errResp = err
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/verifyOTP`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
