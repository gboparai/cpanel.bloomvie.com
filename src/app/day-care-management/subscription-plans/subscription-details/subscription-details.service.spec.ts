import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SubscriptionDetailsService } from './subscription-details.service';
import { environment } from '../../../../environments/environment';

describe('SubscriptionDetailsService', () => {
  let service: SubscriptionDetailsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubscriptionDetailsService]
    });
    service = TestBed.inject(SubscriptionDetailsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getDetails with payload and handle success', () => {
      const payload = { IsActive: true };
      service.getDetails(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/getAllSubscriptionPlans`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle getDetails network error (0)', () => {
      let errResp: any;
      service.getDetails({}).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/getAllSubscriptionPlans`);
      req.error(new ProgressEvent('Network error'));
      expect(errResp.status).toBe(0);
    });

    it('should call activeInActiveSubscriptionPlansByID with param and handle success', () => {
      service.activeInActiveSubscriptionPlansByID(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/activeInActiveSubscriptionPlansByID?Id=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle activeInActiveSubscriptionPlansByID error (404)', () => {
      let errResp: any;
      service.activeInActiveSubscriptionPlansByID(999).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/activeInActiveSubscriptionPlansByID?Id=999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });
  });
});
