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
      providers: [SubscriptionDetailsService],
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

  it('should post getForm in getDetails', () => {
    const form = { IsActive: true, SearchText: 'plan' };
    service.getDetails(form).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/getAllSubscriptionPlans`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(form);
    req.flush([]);
  });

  it('should call activeInActiveSubscriptionPlansByID with Id param', () => {
    service.activeInActiveSubscriptionPlansByID(5).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/activeInActiveSubscriptionPlansByID?Id=5`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true });
  });
});
