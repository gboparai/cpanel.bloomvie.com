import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReminderTypeServiceService } from './reminder-type-service.service';
import { environment } from '../../../environments/environment';

describe('ReminderTypeServiceService', () => {
  let service: ReminderTypeServiceService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReminderTypeServiceService]
    });
    service = TestBed.inject(ReminderTypeServiceService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageReminderTypes with body and handle success', () => {
      const payload = { type: 'Alert' };
      service.manageReminderTypes(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/common/manageReminderTypes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle manageReminderTypes error (400)', () => {
      let errResp: any;
      service.manageReminderTypes({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/common/manageReminderTypes`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getAllReminderType and handle success', () => {
      service.getAllReminderType().subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/common/getAllReminderTypeList`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle getAllReminderType network timeout (0)', () => {
      let errResp: any;
      service.getAllReminderType().subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/common/getAllReminderTypeList`);
      req.error(new ProgressEvent('Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call activeInActiveReminderType with params and handle success', () => {
      service.activeInActiveReminderType(1, true).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/common/activeInActiveReminderType?ID=1&isActive=true`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeNull();
      req.flush({});
    });

    it('should handle activeInActiveReminderType error (500)', () => {
      let errResp: any;
      service.activeInActiveReminderType(2, false).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/common/activeInActiveReminderType?ID=2&isActive=false`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });
  });
});
