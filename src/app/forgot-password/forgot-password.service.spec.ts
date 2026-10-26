import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ForgotPasswordService } from './forgot-password.service';
import { environment } from '../../environments/environment';

describe('ForgotPasswordService', () => {
  let service: ForgotPasswordService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ForgotPasswordService],
    });
    service = TestBed.inject(ForgotPasswordService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit email updates through breadcrumb$', (done: DoneFn) => {
    const testEmail = 'user@bloomvie.com';
    let emissions: string[] = [];

    service.breadcrumb$.subscribe(val => {
      emissions.push(val);
      if (emissions.length === 2) {
        expect(emissions).toEqual(['', testEmail]);
        done();
      }
    });

    service.setEmail(testEmail);
  });

  it('should call forgotPassword endpoint with email param', () => {
    const testEmail = 'user@bloomvie.com';
    service.forgotPassword(testEmail).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Login/forgotPassword?email=user@bloomvie.com`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'OTP sent' });
  });
});
