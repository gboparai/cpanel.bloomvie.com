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
      providers: [PasswordChangeService],
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

  it('should post data in ResetPassword', () => {
    const payload = { token: 'reset-token-123', newPassword: 'NewPassword!123' };
    service.ResetPassword(payload).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Login/resetPassword`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, message: 'Password updated' });
  });

  it('should call tokenCheck with token param', () => {
    service.tokenCheck('my-token-abc').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Login/tokenMatch?token=my-token-abc`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ valid: true });
  });
});
