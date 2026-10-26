import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SubscriptionFeaturesService } from './subscription-features.service';
import { environment } from '../../../../environments/environment';

describe('SubscriptionFeaturesService', () => {
  let service: SubscriptionFeaturesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubscriptionFeaturesService],
    });
    service = TestBed.inject(SubscriptionFeaturesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post subscriptionFeature', () => {
    const feature = { name: 'Photo Sharing', price: 10 };
    service.subscriptionFeature(feature).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/manageSubscriptionFeatures`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(feature);
    req.flush({ success: true });
  });

  it('should post getFeatures', () => {
    const form = { active: true };
    service.getFeatures(form).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/getAllSubscriptionFeatures`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(form);
    req.flush([]);
  });

  it('should get all units', () => {
    service.getAllUnits().subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/getunitMasters`
    );
    expect(req.request.method).toBe('GET');
    req.flush(['Monthly', 'Yearly']);
  });

  it('should delete feature with id param', () => {
    service.deleteFeature(8).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/deleteFeature?id=8`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('should get subscription plan and features by user ID and type', () => {
    service.GetSubscriptionPlanandFeaturesByUserId(12, 'daycare').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/GetSubscriptionPlanandFeaturesByUserId?UserId=12&type=daycare`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
