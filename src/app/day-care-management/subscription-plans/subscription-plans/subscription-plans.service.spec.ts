import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SubscriptionPlansService } from './subscription-plans.service';
import { environment } from '../../../../environments/environment';

describe('SubscriptionPlansService', () => {
  let service: SubscriptionPlansService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubscriptionPlansService]
    });
    service = TestBed.inject(SubscriptionPlansService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call manageSubscription with body and handle success', () => {
      const payload = [{ plan: 'basic' }];
      service.manageSubscription(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/manageSubscriptionPlans`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should handle manageSubscription error (400)', () => {
      let errResp: any;
      service.manageSubscription([]).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/manageSubscriptionPlans`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call activeInActiveSubscriptionPlansByID with param and handle success', () => {
      service.activeInActiveSubscriptionPlansByID(1).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/activeInActiveSubscriptionPlansByID?id=1`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle activeInActiveSubscriptionPlansByID error (404)', () => {
      let errResp: any;
      service.activeInActiveSubscriptionPlansByID(999).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/activeInActiveSubscriptionPlansByID?id=999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call CheckJobPostFeatureExists with body and params and handle success', () => {
      const features = ['f1'];
      service.CheckJobPostFeatureExists(features, 5).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/CheckJobPostFeatureExists?userRoleId=5`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(features);
      req.flush({});
    });

    it('should call PlanAlreadyAssignedOrNot with params and handle success', () => {
      service.PlanAlreadyAssignedOrNot(10).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/PlanAlreadyAssignedOrNot?PlanID=10`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle PlanAlreadyAssignedOrNot error (500)', () => {
      let errResp: any;
      service.PlanAlreadyAssignedOrNot(10).subscribe({
        error: err => errResp = err
      });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/PlanAlreadyAssignedOrNot?PlanID=10`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });
  });
});
