import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChangeThePasswordService } from './change-the-password.service';
import { environment } from '../../environments/environment';

describe('ChangeThePasswordService', () => {
  let service: ChangeThePasswordService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChangeThePasswordService]
    });
    service = TestBed.inject(ChangeThePasswordService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call managePasswordChange with correct body payload and handle success', () => {
      const mockPayload = { userId: 1, oldPassword: 'old', newPassword: 'new' };
      service.managePasswordChange(mockPayload).subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/managePasswordChange`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPayload);
      req.flush({});
    });

    it('should handle managePasswordChange error (400)', () => {
      const mockPayload = { userId: 1, oldPassword: 'wrong', newPassword: 'new' };
      let errResp: any;
      service.managePasswordChange(mockPayload).subscribe({
        error: err => errResp = err
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/managePasswordChange`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should handle managePasswordChange server error (500)', () => {
      const mockPayload = { userId: 1, oldPassword: 'old', newPassword: 'new' };
      let errResp: any;
      service.managePasswordChange(mockPayload).subscribe({
        error: err => errResp = err
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/managePasswordChange`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });
  });
});
