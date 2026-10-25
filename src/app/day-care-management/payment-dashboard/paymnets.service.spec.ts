import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymnetsService } from './paymnets.service';
import { environment } from '../../../environments/environment';

describe('PaymnetsService', () => {
  let service: PaymnetsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymnetsService],
    });
    service = TestBed.inject(PaymnetsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post paginationBo in getAllSubscriptionPlans', () => {
    const paginationBo = { page: 1, pageSize: 10 };
    service.getAllSubscriptionPlans(paginationBo).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/getSubscriptionPlanPayment`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(paginationBo);
    req.flush([]);
  });

  it('should get subscription by ID', () => {
    service.getSubscriptionByID(42 as any).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/getSubscriptionPlanPaymentById?id=42`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ id: 42 });
  });

  it('should get all master status values', () => {
    service.getAllMasterStatus().subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/SubscriptionPlans/getAllMasterStatus`
    );
    expect(req.request.method).toBe('GET');
    req.flush(['Pending', 'Completed', 'Failed']);
  });
});
