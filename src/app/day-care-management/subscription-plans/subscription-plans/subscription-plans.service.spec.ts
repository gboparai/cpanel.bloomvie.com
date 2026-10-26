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
      providers: [SubscriptionPlansService],
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

  it('should post plans in manageSubscription', () => {
    const plans = [{ planName: 'Gold Plan', amount: 500 }];
    service.manageSubscription(plans).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/manageSubscriptionPlans`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(plans);
    req.flush({ success: true });
  });

  it('should call activeInActiveSubscriptionPlansByID with id', () => {
    service.activeInActiveSubscriptionPlansByID(14).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/activeInActiveSubscriptionPlansByID?id=14`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true });
  });

  it('should post CheckJobPostFeatureExists with userRoleId param', () => {
    const features = [{ id: 1 }];
    service.CheckJobPostFeatureExists(features, 2).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/CheckJobPostFeatureExists?userRoleId=2`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(features);
    req.flush({ exists: true });
  });

  it('should call PlanAlreadyAssignedOrNot with PlanID param', () => {
    service.PlanAlreadyAssignedOrNot(7).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/PlanAlreadyAssignedOrNot?PlanID=7`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ assigned: false });
  });
});
