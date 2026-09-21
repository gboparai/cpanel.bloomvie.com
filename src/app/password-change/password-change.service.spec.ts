import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PasswordChangeService } from './password-change.service';
import { environment } from '../../environments/environment';

describe('PasswordChangeService', () => {
  let service: PasswordChangeService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PasswordChangeService]
    });
    service = TestBed.inject(PasswordChangeService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call ResetPassword with correct data and handle success', () => {
      const mockData = { id: 1, newPassword: 'password123' };
      service.ResetPassword(mockData).subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/resetPassword`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush({});
    });

    it('should handle ResetPassword error (400)', () => {
      const mockData = { id: 1, newPassword: 'password123' };
      let errResp: any;
      service.ResetPassword(mockData).subscribe({
        error: err => errResp = err
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/resetPassword`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call tokenCheck with correct params and handle success', () => {
      const token = 'test-token-123';
      service.tokenCheck(token).subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/tokenMatch?token=${token}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle tokenCheck error (404)', () => {
      const token = 'invalid-token';
      let errResp: any;
      service.tokenCheck(token).subscribe({
        error: err => errResp = err
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/tokenMatch?token=${token}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should handle network timeout on tokenCheck (0)', () => {
      const token = 'test-token';
      let errResp: any;
      service.tokenCheck(token).subscribe({
        error: err => errResp = err
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/tokenMatch?token=${token}`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
