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
      providers: [ForgotPasswordService]
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

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call forgotPassword with correct params and handle success', () => {
      const email = 'test@test.com';
      service.forgotPassword(email).subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/forgotPassword?email=${email}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle forgotPassword error (404)', () => {
      const email = 'unknown@test.com';
      let errResp: any;
      service.forgotPassword(email).subscribe({
        error: err => errResp = err
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/forgotPassword?email=${email}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should handle forgotPassword error (500)', () => {
      const email = 'test@test.com';
      let errResp: any;
      service.forgotPassword(email).subscribe({
        error: err => errResp = err
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/forgotPassword?email=${email}`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });
  });

  describe('State Management', () => {
    it('should set and emit email via breadcrumbSubject', (done) => {
      const testEmail = 'new@test.com';

      service.breadcrumb$.subscribe(val => {
        if (val === testEmail) {
          expect(val).toBe(testEmail);
          done();
        }
      });

      service.setEmail(testEmail);
    });
  });
});
