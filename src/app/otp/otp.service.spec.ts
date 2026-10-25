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
      providers: [OtpService],
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

  it('should post otp and email in verifyOTP', () => {
    let response: any;
    service.verifyOTP('123456', 'user@bloomvie.com').subscribe(res => (response = res));

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/verifyOTP`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ otp: '123456', email: 'user@bloomvie.com' });
    req.flush({ verified: true, token: 'otp-verified-token' });

    expect(response).toEqual({ verified: true, token: 'otp-verified-token' });
  });
});
