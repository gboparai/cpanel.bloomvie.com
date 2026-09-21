import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageEventService } from './manage-event.service';
import { environment } from '../../../environments/environment';

describe('ManageEventService', () => {
  let service: ManageEventService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ManageEventService]
    });
    service = TestBed.inject(ManageEventService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageMasterEvent with body and handle success', () => {
      const payload = { eventName: 'Test Event' };
      service.manageMasterEvent(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageMasterEvent`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle manageMasterEvent error (400)', () => {
      let errResp: any;
      service.manageMasterEvent({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/manageMasterEvent`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call getMasterEvent with params and handle success', () => {
      service.getMasterEvent(1, 2, 'all').subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getMasterEvent?userID=1&UserRoleID=2&type=all`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle getMasterEvent error (404)', () => {
      let errResp: any;
      service.getMasterEvent(99, 99, 'all').subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/getMasterEvent?userID=99&UserRoleID=99&type=all`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call activeInActiveEventID with params and handle success', () => {
      service.activeInActiveEventID(5).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/activeInActiveEventID?id=5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle activeInActiveEventID network error (0)', () => {
      let errResp: any;
      service.activeInActiveEventID(5).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/activeInActiveEventID?id=5`);
      req.error(new ProgressEvent('Network Timeout'));
      expect(errResp.status).toBe(0);
    });
  });
});
